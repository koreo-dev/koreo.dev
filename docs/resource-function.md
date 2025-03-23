---
id: resource-function
title: ResourceFunction
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

A ResourceFunction interfaces with one resource in order to _manage_ it or to
_read values_ from it. The default behavior is to manage the resource. A
_manager_ ResourceFunction's task is to ensure the resource's configuration
matches the [Target Resource Specification](./overview/glossary.md#target-resource-specification).
_Read-only_ ResourceFunctions are used to wait for a resource to exist, wait
for it to match some conditions, or to extract values from the resource. The
resource that corresponds to a ResourceFunction is referred to as a ["managed resource"](#managed-resource-configuration).

:::note
The default behavior is to act as a _manager_ of the resource. All of the
_mutation_ parameters (create, update, delete) discussed below only apply to
_manager_ ResourceFunctions.
:::

_Manager_ ResourceFunctions define a
[controller](https://kubernetes.io/docs/concepts/architecture/controller/). If
the resource's configuration does not match expectations, it will take actions
to bring it into alignment with the target specification. There are several
configuration options which allow the developer to control how a
ResourceFunction will manage its resource.

ResourceFunction provides the same capabilities and interface as
[ValueFunction](./value-function.md), meaning
[preconditions](#performing-validation) may be checked and a [return
value](#returned-value) computed.

## Performing Validation

Preconditions are used in order to determine if it is possible to evaluate a
Function or if it should be evaluated. For instance, configuration may allow
some functionality to be enabled or disabled by the user or an input value
might need checked to assert that it is within an allowed range.
[`preconditions`](#specpreconditionsindex) allows conditions to be
_asserted_, and if they are not met, specifies an outcome to be returned.

```yaml {7-17}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: simple-resource-function.v1
  namespace: koreo-demo
spec:
  preconditions:
  - assert: =inputs.values.int > 0
    permFail:
      message: |
        ="The int input value must be positive, received '"
         + string(inputs.values.int)
         + "'"

  - assert: =inputs.enabled
    skip:
      message: User disabled the ResourceFunction
```

## Static and Interim Values

Like ValueFunctions, [`locals`](#spec) is useful for defining constant values
(primitive types, lists, or objects). Locals also allow expressions to be
named, which can improve readability of the return value expression and help
with maintenance of a Function.

```yaml {7-12}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: simple-resource-function.v1
  namespace: koreo-demo
spec:
  locals:
    computedValues:
      halfed: =inputs.values.int / 2
      doubled: =inputs.values.int * 2

    constantList: [NORTH, SOUTH, EAST, WEST]
  # ...
```

:::note
Currently, `locals` may not reference other `locals`.
:::

## Managed Resource Configuration

ResourceFunctions are meant to manage (or, in the case of a read-only Function,
_consume_) an external resource. That resource is defined by
[`apiConfig`](#specapiconfig). In order to prevent dangerous escapes,
`apiVersion` and `kind` are static strings and must always be specified. These
are always overlaid onto the materialized resource view before it is applied to
the cluster.

```yaml {7-14}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: simple-resource-function.v1
  namespace: koreo-demo
spec:
  apiConfig:
    apiVersion: koreo.dev/v1beta1
    kind: TestDummy
    plural: testdummies
    name: =inputs.metadata.name + "-docs"
    namespace: =inputs.metadata.namespace
    owned: true
    readonly: false
```

`name` and `namespace` are also required to be defined, but they may be
[Koreo Expressions](./expressions.md) with access to `inputs` and `locals` at
evaluation time. Similar to `apiVersion` and `kind`, these values are always
overlaid onto the materialized resource view before it is applied to the
cluster. This prevents accidental resource definitions or overlays that might
inadvertently change the desired name/namespace.

`plural` is required only for resources whose plural form is not a simple
pluralization. This is due to a design decision of the Kubernetes API server
which makes using the singular form harder. At some point, a lookup mechanism
will be implemented and this requirement will likely be removed.

`owned` indicates if you would like the parent to be automatically added to the
managed resource's `metadata.ownerReferences` list. The reference will only be
added if the object is namespaced, within the same namespace as the parent, and
readonly is `false`.

`readonly` indicates that the resource is not being managed. This is useful
when a resource needs checked for existence or values extracted from a resource
which is managed by the user or another controller. This is referred to as a
_read-only_ ResourceFunction in contrast to a _manager_ ResourceFunction.

## Inline Target Resource Specification

For cases where only one "static" configuration is desired, an _inline_
[Target Resource Specification](./overview/glossary.md#target-resource-specification)
may be used with [`resource`](#spec). This allows the Function
author to inline Koreo Expressions into the resource body, removing the need
for an additional overlay step. This can make creating a managed resource feel
similar to other templating solutions, but with the benefit that string
manipulation directives are not required to correctly structure the
resource.

```yaml {14-20}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: simple-resource-function.v1
  namespace: koreo-demo
spec:
  locals:
    computedValues:
      halfed: =inputs.values.int / 2
      doubled: =inputs.values.int * 2

    constantList: [NORTH, SOUTH, EAST, WEST]

  resource:
    metadata: =inputs.metadata
    spec:
      directions: =locals.constantList
      range:
          top: =locals.computedValues.doubled
          bottom: =locals.computedValues.halfed
  # ...
```

The Koreo Expressions used within the Target Resource Specification have access
to `inputs` and `locals`.

The `apiVersion`, `kind`, `metadata.name`, and `metadata.namespace` are always
computed and overlaid on top of the Target Resource Specification, so these may
be omitted.

:::note
For existing resources, `resource` effectively builds a _patch_ to be applied.
Alternatively, the resource can be recreated by specifying the
[update behavior](#flexible-update-handling).
:::

## Dynamically Loaded Target Resource Specification

When there are multiple "static" configurations of a resource, but there is a
desire to expose a common interface or configuration options, using _dynamic_
Target Resource Specification with [`resourceTemplateRef`](#specresourcetemplateref)
saves repetition by allowing the static component to be dynamically loaded and
then overlays (which may contain Koreo Expressions) to be applied for further
customization. `resourceTemplateRef` allows statically or, with Koreo
Expressions, dynamically loading a [ResourceTemplate](./resource-template.md).

```yaml {10-18}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: docs-template-function.v1
  namespace: koreo-demo
spec:
  locals:
    template_name: ="docs-template-" + inputs.template + ".v1"

  resourceTemplateRef:
    name: =locals.template_name

  overlays:
  - overlay:
      metadata: =resource.metadata.overlay(inputs.metadata)
      spec:
        value: =inputs.value
        addedProperty: =inputs.value * 17
  # ...
```

The template `name` is a Koreo Expression, with access to `inputs` and `locals`
at evaluation time. This allows templates to be loaded dynamically. Conventions
should be used to make the names clear and consistent. For instance, the
example below indicates that the template is for a Deployment's service
account:

```yaml
name: ="deployment-service-account-" + locals.templateName
```

The `apiVersion`, `kind`, `metadata.name`, and `metadata.namespace` are always
computed and overlaid onto the Target Resource Specification, so these may be
omitted.

## Atomic Overlays to Encapsulate Logic

[`overlays`](#specoverlaysindex) provides a mechanism to apply overlays as
atomic units onto the Target Resource Specification. Each overlay may be either
an inline `overlay` or a dynamic `overlayRef` and may be conditionally skipped
with `skipIf`. This allows full Target Resource Specifications to be gradually
built by composing layers that encapsulate intention and logic into small,
reusable, and testable units.

`overlays` may be used with both inline `resource` definitions or combined with
static ResourceTemplates using `resourceTemplateRef`. When combined with
ResourceTemplate, it creates a very flexible, but simple, mechanism for
swapping out static (and often verbose) base configurations and then
customizing them for a given use case. The ResourceFunction's `preconditions`
and `locals` make it possible to ensure only allowed values are applied via
`overlays`, and only when appropriate.

```yaml {18-39}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: s3-bucket-factory.v1
  namespace: koreo-demo
spec:
  apiConfig:
    apiVersion: s3.services.k8s.aws/v1alpha1
    kind: Bucket
    name: =locals.name
    namespace: =inputs.metadata.namespace
    plural: buckets

  locals:
    capabilities: =inputs.resource.spec.capabilities
    name: =inputs.resource.spec.name

  overlays:
  - overlay:
      metadata:
        annotations: |
          ={
            "demo.koreo.dev/selfLink": "https://us-east-1.console.aws.amazon.com/s3/buckets/" + locals.name + "?region=us-east-1&bucketType=general&tab=objects"
          }
        name: =locals.name
  - overlayRef:
      kind: ValueFunction
      name: s3-delete-after-n-days
    inputs:
      capability: =locals.capabilities["delete-after-n-days"]
    skipIf: =!locals.capabilities["delete-after-n-days"]["enabled"]
  - overlayRef:
      kind: ValueFunction
      name: s3-versioning
    skipIf: =!locals.capabilities["versioning"]["enabled"]
  - overlayRef:
      kind: ValueFunction
      name: s3-encryption
    skipIf: =!locals.capabilities["encryption"]["enabled"]
  # ...
```

Inline overlay Koreo Expressions have access to `inputs`, `locals`, and the
current Target Resource Specification as `resource` so that static values are
available if needed.

Dynamic overlays may be provided using ValueFunctions. This allows for the
use of all ValueFunction capabilities, such as `preconditions` and `locals`.
The `return` value defines the overlays to be applied. Koreo Expressions within
the ValueFunction have access to `inputs` and `locals`.

The `apiVersion`, `kind`, `metadata.name`, and `metadata.namespace` are always
computed and overlaid onto the Target Resource Specification, so these may be
omitted.

## Customizing Creation

Within [`create`](#speccreate), creation may be turned on and off using
`enabled`. If creation is not enabled, and the managed resource does not
exist, then the Function will cause the Workflow to wait for the resource to
exist.

```yaml {7-8}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: s3-bucket-factory.v1
  namespace: koreo-demo
spec:
  create:
    delay: 1
  # ...
```

The `delay` controls how much time the Workflow should wait after creation
for the resource to be ready. For resources that reach ready-state instantly, a
low delay value makes sense. For resources with longer time-to-ready, such as a
database, there is little value in setting this number too low. Instead, set it
close to (ideally slightly over) the typical expected time-to-ready. This will
minimize the number of unneeded calls to the API server.

Lastly, a custom `overlay` may be specified in order to set create-time-only
property values. Though infrequently needed, these are crucial for certain
applications such as interfacing with existing external resources or setting
immutable properties. `create.overlay` behaves similar to the other overlays in
that it is an object which may contain Koreo Expressions. The expressions have
access to `inputs`, `locals`, and `resource` at evaluation time. `resource` is
set to the current Target Resource Specification.

## Flexible Update Handling

When resource differences are detected, there are three options to correct
them via [`update`](#specupdate). There are also [two directives](#compare-directives)
which may be used to alter the difference detection behavior for special cases.

The default behavior is to `patch` the differences in order to align them to
the Target Resource Specification. This is the most common, and simplest,
behavior. The Target Resource Specification is simply re-applied in order to
"correct" it. If there are any _immutable_ properties or properties which
should not be patched or monitored, use `create.overlay` to set those only at
create time. The `delay` specifies how long to wait after patching before
checking the managed resource's ready condition. The guidance for setting this
delay is similar to that for the create delay: set to median time-to-ready +
10% in order to reduce API server load.

```yaml {7-9}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: s3-bucket-factory.v1
  namespace: koreo-demo
spec:
  update:
    patch:
      delay: 30
  # ...
```

For some resources, the best (or only) option is to delete and recreate when
differences are detected. For these, specify `update.recreate`. The resource
will be deleted, then after the specified `delay`, an attempt to create it will
be made. Set `delay` to the time it takes for the deletion and any finalizers
to run.

The final option is to simply ignore any differences, this is done using
`update.never`. In some cases this is the only option, and in others, the
precise resource specification does not matter—only that it exists.

### Compare Directives

Some resource _controllers_ may update properties within the spec. Typically
this is not an issue as the values should match what was provided. For
arrays, however, this can be problematic. If the array is actually a _set_,
then its ordering may change. The same issue arises for mappings that are
flattened into an array with the key contained as a property within the list
objects. To handle these cases, Koreo provides two directives to configure the
difference detection logic for arrays:

- `x-koreo-compare-as-set`
- `x-koreo-compare-as-map`

These are embedded into the Target Resource Specification and will be stripped
prior to sending to the API. `x-koreo-compare-as-set` takes an array of
property names which should be treated as _sets_ rather than ordered arrays; it
may only be used on primitive (boolean, numeric, and string) types.
`x-koreo-compare-as-map` takes a map of "arrays to treat as collections" and an
array of properties to use as the key within each mapping. See the
[example below](#resourcefunction-example) for usage.


## Cleanup Behavior

As a Workflow definition changes, an instance configuration changes, or a
Workflow instance is deleted, managed resources may no longer be created. In
these cases, Koreo needs told how to handle the managed resource. This is done
in [`delete`](#specdelete).

There are currently two options available: `abandon` or `destroy`. For
resources which contain data, `abandon` is recommended for production
environments. In the future, abandoned resources will be labeled to make them
easy to identify. For stateless or fast-to-create resources, `destroy` will
delete the managed resource.

Note that in some cases, these options are in addition to the capabilities of
the underlying managed resource's controller configuration. Be sure to
carefully review the controller's documentation to ensure the desired behavior.

## Performing Post-CRUD Validation

Predicates within [`postconditions`](#specpostconditionsindex) are used to
assert the managed resource is ready and meets some set of conditions. The
_assertion_ is a Koreo Expression which has access to `inputs`, `locals`, and
`resource` at evaluation time. `resource` contains the _actual_ resource
object, allowing for inspection of values within `status`. This is useful for
examining the resource's `status.conditions`, for example, to ensure the
resource is ready before continuing. It is also useful when values need to be
extracted in order to pass them into other Functions, such as with VPCs, where
the subnets may only be known at runtime.

```yaml {7-11}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: s3-bucket-factory.v1
  namespace: koreo-demo
spec:
  postconditions:
  - assert: =has(resource.status.ackResourceMetadata.arn)
    retry:
      delay: 5
      message: Bucket is waiting to become ready
  # ...
```

The behaviors match [`preconditions`](#specpreconditionsindex), with the
addition of the `resource` being available for use within the assertions. The
object returned from the Kubernetes API is contained within `resource`,
allowing for assertions on any values needed.

:::warning
You must ensure that any values used on `resource` are present. Use `has(...)`
in order to assert the presence of a property.
:::

## Returned Value

The return expression in [`return`](#spec) must be an object. It may
use constant values, data structures, or Koreo Expressions which have access to
`inputs`, `locals`, and `resource`. The object returned from the Kubernetes API
is contained within `resource`, allowing for processing of any values needed.

```yaml {7-17}
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: s3-bucket-factory.v1
  namespace: koreo-demo
spec:
  return:
    arn: =resource.status.ackResourceMetadata.arn
    policy_statement:
      Action: |
        =!has(inputs.resource.spec.role) || inputs.resource.spec.role == "writer" ?
          ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"] :
          ["s3:ListBucket", "s3:GetObject"]
      Effect: Allow
      Resource:
      - =resource.status.ackResourceMetadata.arn
      - =resource.status.ackResourceMetadata.arn + "/*"
  # ...
```

:::warning
Like postconditions, you must ensure that any values used on `resource` are
present. Use `has(...)` in order to assert the presence of a property.
:::

## ResourceFunction Example

The following ResourceFunction demonstrates some of the capabilities. Refer to
the [ResourceFunction spec](#specification) for the complete set of
ResourceFunction configurations.

```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: simple-resource-function.v1
  namespace: koreo-demo
spec:

  # Checking input values are within range or ensuring that a config is enabled
  # are common needs. Preconditions support both use cases.
  preconditions:
  - assert: =inputs.values.int > 0
    permFail:
      message: |
        ="The int input value must be positive, received '"
         + string(inputs.values.int)
         + "'"

  - assert: =inputs.enabled
    skip:
      message: User disabled the ResourceFunction

  # Locals are especially useful for interim expressions to improve
  # readability, make complex expressions more ergonomic to write, or for
  # defining constant values for use within the return expression.
  locals:
    computedValues:
      halfed: =inputs.values.int / 2
      doubled: =inputs.values.int * 2

    constantList: [NORTH, SOUTH, EAST, WEST]

  # apiConfig specifies the type of resource this ResourceFunction manages.
  # This could be read-only, in which case the Function can only read
  # configuration from an existing resource.
  apiConfig:
    apiVersion: koreo.dev/v1beta1
    kind: TestDummy
    plural: testdummies

    name: =inputs.metadata.name + "-docs"
    namespace: =inputs.metadata.namespace

  # An inline Target Resource Specification can be quite concise. This shows
  # how you can inherit common metadata to ensure consistent labels, for
  # example. This will also demonstrate the special compare directives (which
  # aren't commonly needed).
  resource:
    metadata: =inputs.metadata
    spec:
      directions: =locals.constantList
      range:
          top: =locals.computedValues.doubled
          bottom: =locals.computedValues.halfed

      # This is not often needed, but it is critical when it is required.
      x-koreo-compare-as-set: [aStaticSet]
      aStaticSet:
      - 1
      - 2
      - 3
    
      # This is not often needed, but it is critical when it is required.
      x-koreo-compare-as-map:
        collectionDemo: [name]
      collectionDemo:
      - name: first
        value: 1
      - name: second
        value: 2
      - name: third
        value: 3

  # The return value of a ResourceFunction must be an object. Koreo Expressions
  # have access to `inputs`, `locals`, and `resource`.
  return:
    ref: =resource.self_ref()
```

## Testing

[FunctionTests](./function-test.md) provide a solution for testing the logic
and error handling in a ResourceFunction and for validating managed resources
are materialized correctly. These act as unit tests for Functions, allowing you
to validate their behavior in isolation and quickly iterate on
[Logic](./overview/glossary#logic) during development. Refer to the
FunctionTest documentation for information on their capabilities.

Below is an example FunctionTest used to test the ResourceFunction shown above.

```yaml
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: simple-resource-function.v1
  namespace: koreo-demo
spec:
  # Specify the Function to test.
  functionRef:
    kind: ResourceFunction
    name: simple-resource-function.v1

  # Provide a base set of inputs.
  inputs:
    metadata:
      name: test-demo
      namespace: tests
    enabled: true
    values:
      int: 64

  # Define your test cases. Each list item is a test case which acts as an
  # iteration of the control loop.
  testCases:
  # The first test creates the resource, and we verify it matches expections.
  - label: Initial Create
    expectResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo-docs
        namespace: tests
      spec:
        directions: [NORTH, SOUTH, EAST, WEST]
        range:
          top: 128
          bottom: 32

        aStaticSet:
        - 1
        - 2
        - 3

        collectionDemo:
        - name: first
          value: 1
        - name: second
          value: 2
        - name: third
          value: 3

  # variant tests do not preserve anything into the next test cycle. They're
  # useful for testing error or variant cases.
  - variant: true
    label: Set reordering is OK
    # This allows us to simulate an external resource mutation, such as a
    # controller or person.
    overlayResource:
      spec:
        aStaticSet:
        - 2
        - 1
        - 3

    # Check a return value, which indicates no changes are made.
    expectReturn:
      ref:
        apiVersion: koreo.dev/v1beta1
        kind: TestDummy
        name: test-demo-docs
        namespace: tests

  - variant: true
    label: Collection reordering is OK
    overlayResource:
      spec:
        collectionDemo:
        - name: third
          value: 3
        - name: second
          value: 2
        - name: first
          value: 1

    # Or just check for an `ok` outcome, which indicates no changes were made.
    expectOutcome:
      ok: {}

  # We can also instruct the test matcher to treat a list as a set or map.
  - variant: true
    label: Test Comparision directives
    inputOverrides:
      values:
        int: 30
    expectResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo-docs
        namespace: tests
      spec:
        directions: [NORTH, SOUTH, EAST, WEST]
        range:
          top: 60
          bottom: 15

        # This instructs the _test_ validator to treat this as a set.
        x-koreo-compare-as-set: [aStaticSet]
        aStaticSet:
        - 3
        - 2
        - 1

        # This instructs the _test_ validator to treat this as a map.
        x-koreo-compare-as-map:
          collectionDemo: [name]
        collectionDemo:
        - name: second
          value: 2
        - name: third
          value: 3
        - name: first
          value: 1
```

## Specification

import V1beta1 from './crds/resource-function/_v1beta1.md';

<Tabs groupId="crdVersion">
  <TabItem value="v1beta1" label="v1beta1" default>
    <V1beta1 />
  </TabItem>
</Tabs>
