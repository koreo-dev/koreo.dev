---
id: workflow
title: Workflow
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Workflows are used to implement multi-step processes. This could be something
as simple as automating a deployment or something as complex as automating
entire internal developer platforms, cloud environments, or infrastructure
control planes. Workflows, in combination with [Functions](./overview/glossary.md#function),
provide a means for programming or orchestrating Kubernetes [controllers](https://kubernetes.io/docs/concepts/architecture/controller/).
This could be Kubernetes "built-in" controllers, such as Deployment or Job
controllers, "off-the-shelf" controllers, such as GCP's [Config Connector](https://cloud.google.com/config-connector/docs/overview)
or AWS's [ACK](https://aws-controllers-k8s.github.io/community/docs/community/overview/),
or custom controllers you've built yourself. Workflows enable you to build
automations around these controllers or compose them into cohesive platforms.

Workflows specify which Functions should be run, how their outputs map into
inputs, and manages their execution. In essence, Workflows themselves define a
controller. That is, Workflow is a control-loop-driven workflow orchestrator.
For this reason, we sometimes refer to Koreo as a "meta-controller programming
language" because Workflows and Functions provide controller-based primitives
for managing other controllers.

In general, Workflow definitions are simple. They specify the resource type
that will cause the Workflow to run, i.e. the "trigger", provide configuration
values to the entry point, perform a set of steps, and optionally surface
conditions or state. Think of a Workflow as a specification which is
_instantiated_ with configuration. Once instantiated, an instance of the
Workflow will run according to its configuration. Many instances of a Workflow
may exist and run concurrently. Many Workflows may be defined within one
system, and Workflows themselves may be composed.

A Workflow is responsible for running [Logic](./overview/glossary.md#logic), which is a
[ValueFunction](./value-function.md),
[ResourceFunction](./resource-function.md), or another Workflow. Logic should
be thought of as defining the body of a loop. The Workflow schedules iterations
of that loop and manages the "external" (to that Logic's body) state
interactions.

## Running a Workflow

A Workflow may be _externally_ triggered to run, and have its _configuration_
provided by a resource specified using [`spec.crdRef`](#speccrdref).
This resource serves to provide the Workflow's configuration and the Workflow
instance may optionally report its conditions and state within this resource's
`status` block.

```yaml {7-10}
apiVersion: koreo.realkinetic.com/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  crdRef:
    apiGroup: demo.koreo.realkinetic.com
    version: v1beta1
    kind: TriggerDummy
  # ...
```

We refer to the _instance_ of the `spec.crdRef` resource which _triggers_ a
Workflow as its "parent" or "trigger".

:::warning
Though it is possible, it is not advised to use a resource which is controlled
by another controller. Instead, create your own CRDs. Koreo Developer Tooling
provides a tool to generate a CRD from a Workflow.
:::

Additionally, a Workflow can be triggered by _another_ Workflow as a
sub-Workflow. This is done by specifying a
[`ref`](#specstepsindexref) with `kind: Workflow` on a step in the parent
Workflow.

```yaml {8-14}
apiVersion: koreo.realkinetic.com/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  steps:
    - label: nested_workflow
      ref:
        kind: Workflow
        name: nested-workflow.v1
      inputs:
        string: =steps.config.string
        int: =steps.config.int
  # ...
```

## Defining the Entry Point

The [`spec.configStep`](#specconfigstep) is a special step intended to
define the entry point for a Workflow. `spec.configStep` shares most of the
same options as other [`spec.steps`](#specstepsindex).

```yaml {7-10}
apiVersion: koreo.realkinetic.com/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  configStep:
    ref:
      kind: ValueFunction
      name: simple-example-config.v1
  # ...
```

The most important difference is that the parent will be provided to this step
as `inputs.parent`. This enables validation of configuration and provides the
ability to construct a well-structured, validated configuration that will be
available to other steps. It also helps to prevent accidental tight-coupling of
logic to a specific CRD. In practice, we have found this to result in more
maintainable and reusable Functions.

The second difference is that this step is provided a default label: "config".
That means, unless changed, you may provide its return value as an input to
other steps by setting a key within their `inputs` to `=steps.config`.

Lastly, `spec.configStep` does not support `forEach` or `skipIf`. The remaining
options share the same behavior as `spec.steps` values.

:::note
The `spec.configStep` may run concurrently with other steps that do not depend
on it.
:::

## Defining the Logic

Each step defines some Logic to be called, specifies the inputs the Logic is
to be provided with, specifies an optional status condition, and optionally
specifies any state you wish exposed within the parent resource's
`status.state`.

Each step must specify the Logic to be called using `ref`, which may be a
ValueFunction, ResourceFunction, or Workflow. It also specifies `inputs`
to be provided to the Logic. For Functions, the inputs are directly accessible
within `inputs`. For Workflows, the inputs are exposed under `inputs.parent`.
That enables a Workflow to be directly triggered via a `crdRef` _or_ it may
be directly called as a sub-workflow. That makes reuse and testing of
Workflows easier. Steps can depend on other steps by referencing them as an
input value. This allows you to map outputs from one step into inputs of
another step.

:::tip[Steps may run concurrently]
A step is run once all steps it references have been run. To help make
the sequencing clearer, you are required to list steps after any step(s) they
reference. Note that steps may run concurrently as their dependencies complete,
so you should not depend on the order in which they are listed. The special
[`spec.configStep`](#specconfigstep) entry point can also run concurrently if
other steps do not depend on it.
:::

A step may also specify a `forEach` block, which will cause the Logic to be
executed once per item in the `forEach.itemIn` list. Each item will be provided
within `inputs` with the key name specified in `forEach.inputKey`. This makes
using any Function within a `forEach` viable.

`skipIf` enables the Workflow to dynamically determine which steps to run.
This allows Logic to define a common interface, then for the Workflow to call
the correct Logic. This enables _if_ or _switch_ statement semantics.

A step may expose a Condition on the parent resource using `condition`. The
Condition's type will match `condition.type`, and this should be unique within
your Workflow. Note that uniqueness is intentionally not enforced so that you
may update / change conditions subsequently, but you should be cautious about
reusing the same type since it makes debugging much harder. `condition.name` is
used within the condition message sentence to make human-friendly status
messages. It should be a meaningful name or _short_ descriptive phrase.

:::warning
Be careful not to accidentally step on the `condition.type` value as it makes
debugging much harder and reduces visibility into a Workflow's status.
:::

The Logic's results may be exposed via the `state` key. The Koreo Expressions
within the Workflow step may access the Logic's return value within `value`.
If specified, `state` must be a mapping and it will be _merged_ with other
`step.sate` values. This allows for fine control over what and how state is
exposed.

:::warning
If multiple steps set the same state keys, the return values will be merged.
This can lead to confusing values, so be cautious.
:::

```yaml {12-43}
apiVersion: koreo.realkinetic.com/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  configStep:
    ref:
      kind: ValueFunction
      name: simple-example-config.v1

  steps:
    - label: simple_return_value
      ref:
        kind: ValueFunction
        name: simple-return-value.v1
      inputs:
        string: =steps.config.string
        int: =steps.config.int
      state:
        config:
          nested_string: =value.nested.a_string
          empty_list: =value.empties.emptyList

    - label: resource_reader
      ref:
        kind: ResourceFunction
        name: resource-reader.v1
      inputs:
        name: resource-function-test
        values:
          string: =steps.config.string
          int: =steps.config.int

    - label: resource_factory
      ref:
        kind: ResourceFunction
        name: resource-factory.v1
      forEach:
        itemIn: =["a", "b", "c"]
        inputKey: suffix
      inputs:
        name: resource-function-test
```

## Example

The following Workflow demonstrates some of the capabilities. Refer to the
[Workflow spec](#specification) for the complete set of Workflow
configurations.

```yaml
apiVersion: koreo.realkinetic.com/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:

  # Creation, modification, or deletion of a TriggerDummy will trigger
  # this Workflow to run. That is, this Workflow will act as a controller of
  # this resource type. An instance of this resource type is referred to as the
  # "parent" resource for a Workflow.
  crdRef:
    apiGroup: demo.koreo.realkinetic.com
    version: v1beta1
    kind: TriggerDummy

  # The "parent" resource's metadata and spec will be passed to this
  # ValueFunction as `inputs.parent`, and the return value of this Function
  # will be available to other steps as `steps.config`.
  configStep:
    ref:
      kind: ValueFunction
      name: simple-example-config.v1

  # Steps may be run once all steps they reference have been run. To help make
  # the sequencing clearer, you are required to list steps after any step(s)
  # they reference. Note that steps may run concurrently as their dependencies
  # complete, so you should not depend on the order in which they are listed.
  steps:
    # Each step must have a label, which acts as an identifier. The return
    # value of the Logic is available to be passed into other steps' inputs as
    # `steps.simple_return_value`. If a step does not return successfully, then
    # any step referencing it will automatically be skipped and marked as
    # `depSkip`.
    - label: simple_return_value

      # The Logic to be run.
      ref:
        kind: ValueFunction
        name: simple-return-value.v1

      # The inputs are available within the Logic under `=inputs.`
      # `step.inputs` must be a mapping, but these may be Koreo Expressions,
      # simple values, lists, or objects. Use an expression to pass the return
      # value from another step.
      inputs:
        string: =steps.config.string
        int: =steps.config.int

      # Some or all of the return value may be surfaced into the parent's
      # `status.state`. This is useful to cache values or to surface them to
      # other tools such as a UI or CLI. By default, nothing is surfaced.
      state:
        config:
          nested_string: =value.nested.a_string
          empty_list: =value.empties.emptyList

    - label: resource_reader
      ref:
        kind: ResourceFunction
        name: resource-reader.v1

      # `step.inputs` may be a more complex structure, and Koreo Expressions
      # may be used for specific subkeys or nested within an object or list.
      inputs:
        name: resource-function-test
        validators:
          skip: false
          depSkip: false
          permFail: false
          retry: false
          ok: false
        values:
          string: =steps.config.string
          int: =steps.config.int

    - label: resource_factory
      ref:
        kind: ResourceFunction
        name: resource-factory.v1

      # Steps may be run once per item in an array. Each may be run
      # concurrently, so there is no execution ordering guarantee. The return
      # value of this step is an array of the return values who's order matches
      # source array's order. Each iterated value is provided to the Logic as
      # `=inputs[forEach.inputKey]`. That is, the value of input key is the
      # subkey within inputs.
      forEach:
        itemIn: =["a", "b", "c"]
        inputKey: suffix

      inputs:
        name: resource-function-test
        validators:
          skip: false
          depSkip: false
          permFail: false
```

## Specification

import V1alpha8 from './crds/workflow/_v1beta1.md';

<Tabs groupId="crdVersion">
  <TabItem value="v1beta1" label="v1beta1" default>
    <V1alpha8 />
  </TabItem>
</Tabs>
