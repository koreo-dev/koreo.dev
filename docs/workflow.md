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
that will cause the Workflow to run, i.e. the "trigger", perform a set of
steps, and optionally surface conditions or state. Think of a Workflow as a
specification which is _instantiated_ with configuration. Once instantiated, an
instance of the Workflow will run according to its configuration. Many
instances of a Workflow may exist and run concurrently. Many Workflows may be
defined within one system, and Workflows themselves may be composed.

A Workflow is responsible for running [Logic](./overview/glossary.md#logic), which is a
[ValueFunction](./value-function.md),
[ResourceFunction](./resource-function.md), or another Workflow. Logic should
be thought of as defining the body of a loop. The Workflow schedules iterations
of that loop and manages the "external" (to that Logic's body) state
interactions.

## Running a Workflow

There are two ways a Workflow is run, either via a triggering resource
(resulting from a CRUD event or reconcile loop) or as a sub-Workflow. We'll
discuss both of these below.

### Workflow Trigger

A Workflow may be _externally_ triggered to run, and have its _configuration_
provided by a resource specified using [`crdRef`](#speccrdref).
This resource serves to provide the Workflow's configuration and the Workflow
instance may optionally report its conditions and state within this resource's
`status` block. The Workflow also [writes information about the resources it manages](#managed-resources)
to an annotation on this resource.

```yaml {7-10}
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  crdRef:
    apiGroup: demo.koreo.dev
    version: v1beta1
    kind: TriggerDummy
  # ...
```

We refer to the _instance_ of the `crdRef` resource which _triggers_ a
Workflow as its "parent" or "trigger".

:::warning[Workflow trigger kinds]
Any resource kind can be used as a Workflow trigger, but take care when using
resources controlled by another controller. Koreo applies updates to the
resource's status and annotations which could result in a dangerous interaction
for resources with specific semantics used by another controller. For this
reason, it's encouraged to create your own CRDs unless you understand what
you are doing. [Koreo Tooling](./getting-started/tooling-installation.md)
provides a tool to generate a CRD from a Workflow.
:::

A Workflow will run repeatedly as part of Kubernetes' reconciliation process.
This is known as a _control loop_. It's important to keep this in mind when
designing Workflows. By default, the reconcile process will run on create,
update, and delete events pertaining to the parent resource as well as every 20
minutes. This interval can be configured on the controller if more frequent or
less frequent reconciles is desired.

:::warning[Multiple Workflows with the same trigger]
A Koreo Controller does not allow multiple Workflows to trigger off the same
`crdRef` resource because this can result in unpredictable behavior that is
difficult to reason about. If you need multiple Workflows to act on a resource,
use sub-Workflows instead.
:::

### Sub-Workflows

Additionally, a Workflow can be triggered by _another_ Workflow as a
sub-Workflow. This is done by specifying a
[`ref`](#specstepsindexref) with `kind: Workflow` on a step in the parent
Workflow.

```yaml {8-14}
apiVersion: koreo.dev/v1beta1
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

## Defining the Logic

Each step defines some Logic to be called, specifies the inputs the Logic is
to be provided with, specifies an optional status condition, and optionally
specifies any state you wish exposed within the parent resource's
`status.state`.

Logic is defined by ValueFunction, ResourceFunction, or using a sub-Workflow to
compose Functions. To _reference_ the Logic, you specify the `kind` and `name`.
Logic may be statically specified using `ref`, which specifies the exact Logic
to run. It may also be _dynamically_ selected from a fixed set of references
using `refSwitch`, which provides the ability to select between multiple Logics
which implement a compatible interface—this is discussed in more detail below.

:::tip[Steps may run concurrently]
A step is run once all steps it references have completed. To help make the
sequencing clearer, you are required to list steps after any step(s) they
reference. Note that steps may run concurrently as their dependencies complete,
so you should not depend on the order in which they are listed.
:::

Steps also specify `inputs` to be provided to the Logic. Within Functions,
the inputs are directly accessible within `inputs`. Within Workflows, the
inputs are exposed under `parent`. This enables a Workflow to be directly
triggered via a `crdRef` _or_ it may be directly called as a sub-Workflow.
That makes reuse and testing of Workflows easier. Steps can depend on other
steps by referencing them as an input value. This allows you to map outputs
from one step into inputs of another step.

<Tabs>
  <TabItem value="ref" label="ref step" default>
```yaml
- label: static_get_value
  ref:
    kind: ValueFunction
    name: get-value.v1
  inputs:
    input: =steps.config.output
```
  </TabItem>
  <TabItem value="refSwitch" label="refSwitch step">
```yaml
- label: dynamic_get_value
  refSwitch:
    switchOn: =inputs.input
    cases:
    - case: "1"
      kind: ValueFunction
      name: get-value-1.v1
    - case: "2"
      kind: ValueFunction
      name: get-value-2.v1
    - case: "3"
      kind: ValueFunction
      name: get-value-3.v1
  inputs:
    input: =steps.config.output
```
  </TabItem>
</Tabs>

:::tip[Avoiding tight coupling]
The parent resource can be passed as an input to steps from a Workflow with
`=parent`. However, rather than passing the entire parent resource to steps,
it's recommended to pass only what is needed from the parent to avoid tightly
coupling Logic to triggering resources. For example, `=parent.metadata` rather
than `=parent` if only the metadata is needed by a Function.
:::

### Control Flow

A step may also specify a `forEach` block, which will cause the Logic to be
executed once per item in the `forEach.itemIn` list. Each item will be provided
within `inputs` with the key name specified in `forEach.inputKey`. This makes
using any Function within a `forEach` viable.

Steps may be conditionally run using `skipIf`. When the `skipIf` evaluates to
true, the step and its dependencies are [Skipped](overview/glossary.md#skip)
without resulting in an error by stopping further evaluation of the step and
its dependencies. `skipIf` enables the Workflow to dynamically determine which
steps to run. This allows Logic to define a common interface, then for the
Workflow to call the correct Logic. This enables _if_ or _switch_ statement
semantics.

Logic may be dynamically selected from a set of choices using `refSwitch`.
`refSwitch` allows Logic to define a common interface, then for the
Workflow to call the appropriate Logic based on input or computed values. The
`switchOn` expression has access to the return values from prior steps within
`steps`. It also has access to the `inputs` that will be provided to the Logic.
Using `inputs` enables `refSwitch` to work with `forEach` and dispatch the
correct Logic for each item.

### State

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

The Logic's results may be exposed via the `state` key. The
[Koreo Expressions](./expressions.md) within the Workflow step may access the
Logic's return value within `value`. If specified, `state` must be a mapping
and it will be _merged_ with other `step.state` values. This allows for fine
control over what and how state is exposed.

:::warning
If multiple steps set the same state keys, the return values will be merged.
This can lead to confusing values, so be cautious.
:::

### Logic Example

```yaml {7-51}
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  steps:
    - label: config
      ref:
        kind: ValueFunction
        name: simple-example-config.v1
      inputs:
        metadata: =parent.metadata

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

    - label: switched_resource_reader
      refSwitch:
        switchOn: =inputs.result
        cases:
        - case: "1"
          kind: ResourceFunction
          name: resource-reader-1.v1
        - case: "2"
          kind: ResourceFunction
          name: resource-reader-2.v1
        - case: "3"
          kind: ResourceFunction
          name: resource-reader-3.v1
      inputs:
        result: =steps.simple_return_value.result

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

## Managed Resources

Workflows write a metadata annotation called `koreo.dev/managed-resources` on
the parent resource which triggered them. This annotation is a recursive JSON
structure which contains two top-level keys: `workflow`, which is the name of
the Workflow that processed the parent, and `resources`, which is a mapping of
Workflow steps to _managed resources_. This resource mapping can be recursive
depending on the structure of the Workflow step. In this context, a "managed
resource" can be one of four things:

**Kubernetes resource**

This is a true [managed resource](./overview/glossary.md#managed-resource),
indicating the step pertains to a ResourceFunction. This is an object
containing several keys pertaining to the Kubernetes resource: `apiVersion`,
`kind`, `name`, `namespace` (optional), `plural` (optional),
`resourceFunction`, and `readonly`. `resourceFunction` is the name of the
ResourceFunction interfacing with the resource. `readonly` indicates if the
ResourceFunction only _reads_ the resource or if it is a _manager_ of the
resource.

**Managed resources object**

This is a recursive object containing the `workflow` and `resources` keys,
indicating the step pertains to a sub-Workflow.

**Array of Kubernetes resources and/or managed resources objects**

This indicates the step pertains to a ResourceFunction or sub-Workflow within a
`forEach`. This array can contain _both_ Kubernetes resources and managed
resources objects because the step may be a `refSwitch` which could result in
both ResourceFunctions _and_ sub-Workflows executing for different iterations
of the loop, depending on which `refSwitch` cases are selected.

**null**

A `null` value indicates the step does not pertain to a resource. Examples
include the step is a ValueFunction, a ResourceFunction with a `skipIf`, or a
`forEach` on an empty list.

An example of a `koreo.dev/managed-resources` annotation value is shown below.
In this example, the `config`, `metadata`, and `resource_tags` steps on
`aws-workload-workflow` are ValueFunctions, which is why they map to `null`
values. `environment_metadata` corresponds to a _read-only_ ResourceFunction.
The `resources` step is a `forEach`, which is why it's an _array_. `runtime` is
a sub-Workflow called `lambda-workflow` with four steps which ultimately
produces three Kubernetes resources. Lastly, the `triggers` step is a `forEach`
whose `itemIn` expression evaluated to an empty list, meaning the sub-Workflow
the step pertains to did not execute.

```json
{
  "workflow": "aws-workload-workflow",
  "resources": {
    "config": null,
    "metadata": null,
    "resource_tags": null,
    "environment_metadata": {
      "apiVersion": "aws.konfigurate.realkinetic.com/v1beta1",
      "kind": "AwsEnvironment",
      "plural": "awsenvironments",
      "name": "dev",
      "readonly": true,
      "namespace": "realkinetic-dev",
      "resourceFunction": "aws-environment"
    },
    "resources": [
      {
        "apiVersion": "s3.services.k8s.aws/v1alpha1",
        "kind": "Bucket",
        "plural": "buckets",
        "name": "test-1312e8",
        "readonly": false,
        "namespace": "realkinetic-dev",
        "resourceFunction": "aws-s3-bucket-factory"
      }
    ],
    "runtime": {
      "workflow": "lambda-workflow",
      "resources": {
        "config": null,
        "lambda_policy": {
          "apiVersion": "iam.services.k8s.aws/v1alpha1",
          "kind": "Policy",
          "plural": "policies",
          "name": "test-lambda",
          "readonly": false,
          "namespace": "realkinetic-dev",
          "resourceFunction": "lambda-policy"
        },
        "lambda_role": {
          "apiVersion": "iam.services.k8s.aws/v1alpha1",
          "kind": "Role",
          "plural": "roles",
          "name": "test-lambda",
          "readonly": false,
          "namespace": "realkinetic-dev",
          "resourceFunction": "lambda-role"
        },
        "lambda_resource": {
          "apiVersion": "lambda.services.k8s.aws/v1alpha1",
          "kind": "Function",
          "plural": "functions",
          "name": "test",
          "readonly": false,
          "namespace": "realkinetic-dev",
          "resourceFunction": "lambda-resource"
        }
      }
    },
    "triggers": null
  }
}
```

This managed resources data is exposed for consumption by tooling as well as to
aid with operations and debugging. For example, this data is leveraged by
[Koreo UI](./koreo-ui.md) in order to render Workflow instance graphs and
surface other information about Workflows.

## Workflow Example

The following Workflow demonstrates some of the capabilities. Refer to the
[Workflow spec](#specification) for the complete set of Workflow
configurations.

```yaml
apiVersion: koreo.dev/v1beta1
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
    apiGroup: demo.koreo.dev
    version: v1beta1
    kind: TriggerDummy

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
    - label: config

      # The logic to be run.
      ref:
        kind: ValueFunction
        name: simple-example-config.v1

      # The inputs are available within the Logic under `=inputs.`
      # `step.inputs` must be a mapping, but these may be Koreo Expressions,
      # simple values, lists, or objects. The parent resource can be accessed
      # with `=parent`.
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace

    - label: simple_return_value
      ref:
        kind: ValueFunction
        name: simple-return-value.v1

      # Use an expression to pass the return value from another step.
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

import V1beta1 from './crds/workflow/_v1beta1.md';

<Tabs groupId="crdVersion">
  <TabItem value="v1beta1" label="v1beta1" default>
    <V1beta1 />
  </TabItem>
</Tabs>
