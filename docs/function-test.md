---
id: function-test
title: FunctionTest
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Koreo provides FunctionTest to make validating the behavior of [Function](./overview/glossary.md#function)
control loops easier. FunctionTest provides a direct means of simulating
changing inputs and external state between iterations. It includes built-in
contract testing in addition to return value testing. This allows for the
testing of the full lifecycle, including error handling.

Within a FunctionTest, inputs and an initial state may be provided along with
a set of test cases. The test cases are run sequentially so that changing
conditions may be precisely simulated and assertions about the behavior made.
Mutations to the resource or inputs (by the Function or test setup) are
preserved between each test case, allowing for realistic testing without the
need for complex setup. To make testing more robust, `variant` tests do not
preserve mutations across tests. This allows for testing conditions that may
cause errors or easily testing other variant behaviors.

## Defining the Function Under Test

Specify the Function to be tested with [`functionRef`](#specfunctionref).
Functions define a control loop, and hence are executed many times. In order to
make testing easier and less repetitive, the Function will be evaluated once
per test case. Any mutations the Function makes will be carried forward to the
next test case _unless_ `variant` is specified. This allows for testing the
Function in a realistic manner and makes detecting conditions such as
update-loops possible.

```yaml {7-9}
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: function-test-demo.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: function-test-demo.v1
```

## Base Inputs and Overrides

If a Function requires input values, they should be fully specified for the
base case using [`inputs`](#spec). To test bad-input cases, make use of
[`inputOverrides`](#spectestcasesindex) within a test case. This makes testing
both specific variants and the "happy path" case easier and more reliable.

```yaml {11-16}
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: function-test-demo.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: function-test-demo.v1

  inputs:
    metadata:
      name: test-demo
      namespace: tests
    enabled: true
    int: 64
```

## Initial Resource State

The initial resource state can be specified using [`currentResource`](#spec).
This can also be set on individual test cases which will carry forward to subsequent
test cases if `variant` is not enabled. If you would like to test resource creation,
do not specify `currentResource` and instead omit it. Once it has been
created by the first non-variant test case, it will be available to subsequent
test cases.

However, for some tests it is desirable to specify a base resource state, then
mutate it within test cases (using [`overlayResource`](#spectestcasesindex)).
This is especially useful when combined with `variant` so that various
conditions may be tests, such as spec changes or conditions the managed
resource's controller may make or set. It makes it easy to test many variant
cases without a lot of boilerplate.

:::note
`currentResource` and `overlayResource` allow you to simulate _external_ modifications
so that you can test interactions with the other systems. Note that these may not be
specified for ValueFunctions.
:::

## Defining Test Cases

Test cases are defined in [`testCases`](#spec). An optional `label` may be
specified to help you identify or understand the intention of the test case.
The `label` is used within the test report. If omitted the (1-indexed) position
is used.

```yaml {18-44}
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: function-test-demo.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: function-test-demo.v1

  inputs:
    metadata:
      name: test-demo
      namespace: tests
    enabled: true
    int: 64

  testCases:
  - label: Initial Create
    expectResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo
        namespace: tests
      spec:
        value: 64
        doubled: 128
        listed:
        - 65
        - 66

  - label: Retry until ready
    expectOutcome:
      retry:
        delay: 0
        message: not ready

  - label: Test ready state
    overlayResource:
      status:
        ready: true
    expectOutcome:
      ok: {}
```

A test case may be skipped by setting `skip` to `true`. Keep in mind that if
the test case was mutating state, this may break subsequent tests.

Preserving state mutations across tests is not always desirable. In order to
discard any mutations (either test case setup or return values), set `variant`
to `true`. This instructs the test runner to ignore any state mutations outside
the scope of the _variant_ test case.

In order to simulate bad inputs, changing inputs, or different behaviors,
`inputOverrides` may be used to _replace_ input values. This can be useful to
test preconditions, but also for ensuring the return value or resource matches
expectations for various inputs.

In order to test behavior with different current resource states, there are two
options available. To simulate external controller (or user) modifications by
updating specific fields, replacing specific values, or adding status
conditions, `overlayResource` should be used. This is very useful for
simulating interactions with a controller that is reporting back status
information. Alternatively, to _fully replace_ the current resource,
`currentResource` may be used. The resource must be specified in its entirety.

### Resource Mutation Assertion

When resource mutations are expected, [`expectResource`](#spectestcasesindex)
may be used to validate that the resource exactly matches a Target Resource
Specification. The full resource should be provided, and will be compared
exactly. If no resource modifications (create or update) are attempted, an
`expectResource` assertion fails.

:::note
`expectResource` tests a ResourceFunction's _patch_, meaning it only tests the
fields set by the Function. For instance, if there are other fields present on
the resource specified by `currentResource` but not modified by the
ResourceFunction under test, `expectResource` will not assert them. This is
because the ResourceFunction patches the resource and relies on Kubernetes'
merge logic.
:::

For cases where list order should be ignored or treating a list as a map is
required, you may use the compare directives to alter the resource validation.
These are not typically required within tests, but are sometimes helpful.

    - `x-koreo-compare-as-set`
    - `x-koreo-compare-as-map`

The directives behave as describes within the ResourceFunction documentation.
Place them within the `expectResource` body, just as for the Target Resource
Specification.

:::note
`expectResource` may not be specified for ValueFunctions.
:::

### Resource Recreate

When making use of `update.recreate` behavior, the resource will be deleted
if differences are detected. Use [`expectDelete`](#spectestcasesindex) in order
to assert that the difference is detected and the resource deleted. If this is
not a _variant_ test case, the next test case will create the resource.

:::note
`expectDelete` may not be specified for ValueFunctions.
:::

### Return Value Testing

Return values may be tested using [`expectReturn`](#spectestcasesindex). This
is an exact match comparison. If any resource modifications are attempted, an
`expectReturn` assertion fails.

### Return Type Testing

In many cases, it is useful to test the return _type_ of a Function. For
instance, when validating pre- or post-conditions that might return skips or
errors. This is done using [`expectOutcome`](#spectestcasesindex).
Structurally, `expectOutcome` is similar to `preconditions` and
`preconditions`. 

Because `ok` has a dedicated return value test (`expectReturn`), its
`expectOutcome` test is used to assert that the Function succeeded without
testing anything specific about its return value.

For all other outcome tests, a `message` assertion is required. The outcome's
message must _contain_ the asserted value. It is not an equality but a
case-insensitive, contains test. This is to make assertions easier to author
and less fragile, while still enabling you to test for specific outcomes.

The only other unique case is `retry`, which also requires a `delay` assertion.
This is an _exact_ match. If you do not care about the specific `delay` time, 0
will match any value.

## Modeling Reconciliation

Each item in the `testCases` array defines a test case to be run. They are
run sequentially so that you may correctly model the executions of the Function
over time. ValueFunctions are pure—there is no external interaction or state—
so the tests are effectively _unit tests_. ResourceFunctions are far more
complex because they interact with external state in multiple ways. There are
two particularly useful approaches to structuring ResourceFunction test flows,
discussed below.

### Happy Path Foundation

Model the happy-path flow by testing creation and then that the expected return
value is correct. Next, add test cases (using `inputOverrides` or
`overlayResource` to update state) to test update (patch or recreate) cases and
ensure they behave as desired. The resource should always come back to a steady
state; you may use an `expectOutcome` with an `ok: {}` assertion to validate
steady state.

Once the happy-path reconciliation flow is written, tested, and working well,
add in _variant_ tests to ensure that if some condition changes it is handled
as desired. For instance, if the resource enters an error state is it updated
or does the Function correctly return an error condition? Using _variant_
tests, you may safely insert these tests within the happy-path flow.

### Base with Variants

Specify a starting point with good `inputs` values. For creation or
precondition checks, omit specifying `currentResource`. For update or post
condition tests, specify `currentResource`. Generally a good state, in
stable condition is preferable to ensure each test is validating the correct
behavior. One the base state is defined, add test cases (using `inputOverrides`
or `overlayResource`) to simulate various inputs, conditions, errors, or
external resource changes to ensure they are correctly handled. Often it is
useful to make these test cases _variant_, so that errors do not compound or
conflate across test cases.

This approach is particularly helpful for Functions requiring complex error
handling, with lots of pre or post condition checks, or with very involved
return values. It allows for validating lots of cases with minimal boilerplate
required.

## Example

In order to demonstrate FunctionTest, we will test a simple but representative
ResourceFunction.

<Tabs>
  <TabItem value="resource-function" label="ResourceFunction" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: function-test-demo.v1
  namespace: koreo-demo
spec:
  preconditions:
  - assert: =inputs.int > 0
    permFail:
      message: ="`int` must be positive, received '" + string(inputs.int) + "'"

  - assert: =inputs.enabled
    skip:
      message: User disabled the ResourceFunction

  apiConfig:
    apiVersion: koreo.dev/v1beta1
    kind: TestDummy
    plural: testdummies

    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  resource:
    metadata: =inputs.metadata
    spec:
      value: =inputs.int
      doubled: =inputs.int * 2
      listed:
      - =inputs.int + 1
      - =inputs.int + 2

  postconditions:
    # Note, you must explicitly handle cases where the value might not be
    # present.
  - assert: =has(resource.status.ready) && resource.status.ready
    retry:
      message: Not ready yet
      delay: 5

  return:
    ref: =resource.self_ref()
    bigInt: =inputs.int * 100
    ready: '=has(resource.status.ready) ? resource.status.ready : "not ready"'
```
  </TabItem>
  <TabItem value="function-test" label="FunctionTest">
```yaml
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: function-test-demo.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: function-test-demo.v1

  # Provide base, good inputs.
  inputs:
    metadata:
      name: test-demo
      namespace: tests
    enabled: true
    int: 64

  # Each testCase is an iteration of the control loop.
  testCases:
  # The first pass through creates the resource, and we can verify that it
  # matches our expections
  - label: Initial Create
    expectResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo
        namespace: tests
      spec:
        value: 64
        doubled: 128
        listed:
        - 65
        - 66

  # The resource from the first test is now `currentResource`. We can ensure
  # that the function waits until the ready condition is met.
  - label: Retry until ready
    expectOutcome:
      retry:
        # We aren't concerned with the specific delay.
        delay: 0
        # Make sure the message explains the issue.
        message: not ready

  # We can simulate some external update, such as a controller, setting a
  # status value.
  - label: Test ready state
    overlayResource:
      status:
        ready: true
    expectOutcome:
      ok: {}

  # If we do not want to mutate the overall test state, we can test variant
  # cases.
  - variant: true
    label: Un-ready state
    overlayResource:
      status:
        ready: false
    expectOutcome:
      retry:
        delay: 0
        message: ''

  # Because the prior test was a `variant` case, the overall state is still Ok.
  - label: Test ready state
    expectReturn:
      bigInt: 6400
      ready: true
      ref:
        apiVersion: koreo.dev/v1beta1
        kind: TestDummy
        name: test-demo
        namespace: tests

  # In order to test patch updates, re-check the resource.
  - label: Update
    inputOverrides:
      int: 22
    expectResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo
        namespace: tests
      spec:
        value: 22
        doubled: 44
        listed:
        - 23
        - 24
      # We need to check this now, because we added it to the resource state so
      # it will carry forward.
      status:
        ready: true

  # We can simulate a full replacement of the resource and ensure it is patched.
  - label: Resource Replacement
    currentResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo
        namespace: tests
      spec:
        value: 1
        doubled: 2
        listed:
        - 3
        - 4
    expectResource:
      apiVersion: koreo.dev/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo
        namespace: tests
      spec:
        value: 22
        doubled: 44
        listed:
        - 23
        - 24

  # Now the resource should be stable again, if status is ready.
  - label: Test ready state
    overlayResource:
      status:
        ready: true
    expectOutcome:
      ok: {}
```
  </TabItem>
</Tabs>

## Specification

import V1alpha8 from './crds/function-test/_v1beta1.md';

<Tabs groupId="crdVersion">
  <TabItem value="v1beta1" label="v1beta1" default>
    <V1alpha8 />
  </TabItem>
</Tabs>
