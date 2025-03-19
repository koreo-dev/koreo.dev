---
id: value-function
title: ValueFunction
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ValueFunctions are pure functions which provide a means of validation,
computation, and data reshaping. There are three common use cases for
ValueFunction:

1. Validating data and building "known-good" structures to be provided to other
   functions.
1. Computing data structures, such as metadata, to overlay onto other resources
   in order to standardize them.
1. Validating or reshaping return values into a structure that is more
   convenient to use in other locations within a [Workflow](./workflow.md).

Though ValueFunction is a very simple construct, they are a powerful means of
reshaping or building data structures such as common labels, entire metadata
blocks, or default values for use within other functions or Workflows.

## Performing Validation

It is important to check preconditions in order to determine if it is possible
to evaluate a Function. For instance, it might be important to check that a
number falls within an allowed range or a that a string meets requirements
such as length or only contains allowed characters. [`preconditions`](#specpreconditionsindex)
allows conditions to be _asserted_, and if the assertion fails, then the
Function will return a specified outcome.

```yaml {7-14}
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  preconditions:
  - assert: =inputs.values.int > 0
    permFail:
      message: ="The int input value must be positive, received '" + string(inputs.values.int) + "'"

  - assert: =inputs.enabled
    skip:
      message: User disabled the ValueFunction
```

:::tip
You may leverage a ValueFunction purely to run its `preconditions`. This
can be helpful to cause a Workflow to `Retry` or `PermFail` due to some
condition. Note that in order to block other steps, they should express a
dependency on the ValueFunction via their inputs—otherwise those steps will
run.
:::

## Static and Interim Values

Because [Koreo Expressions](./expressions.md) are often used to extract values
or reshape data structures, they can be rather long. [`locals`](#spec)
provides a means of naming expressions, which can improve readability of the
return value expression.

`locals` is also useful for defining constant values, which may be complex
structures, such as lists or objects, or simple values. Locals are used to help
construct the return value, used within Koreo Expressions, or directly
returned.

```yaml {7-12}
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: simple-example.v1
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


## Returned Value

The primary use cases of ValueFunction is to reshape or compute a return
value expression. The expression in [`return`](#spec) must be an object.
The keys of the object may be constant values, data structures, or Koreo
Expressions which reference inputs (`inputs.`) or locals (`locals`).

```yaml {14-19}
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  locals:
    computedValues:
      halfed: =inputs.values.int / 2
      doubled: =inputs.values.int * 2

    constantList: [NORTH, SOUTH, EAST, WEST]

  return:
    allowedRange:
      lower: =locals.computedValues.halfed
      upper: =locals.computedValues.doubled

    lowerWords: =locals.constantList.map(word, word.lower())
```

## Example

The following ValueFunction demonstrates some of the capabilities. Refer to the
[ValueFunction spec](#specification) for the complete set of ValueFunction
configurations.

```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:

  # Checking input values are within range or ensuring that a config is enabled
  # are common needs. Preconditions support both use cases.
  preconditions:
  - assert: =inputs.values.int > 0
    permFail:
      message: ="The int input value must be positive, received '" + string(inputs.values.int) + "'"

  - assert: =inputs.enabled
    skip:
      message: User disabled the ValueFunction

  # Locals are especially useful for interim expressions to improve
  # readability, make complex expressions more ergonomic to write, or for
  # defining constant values for use within the return expression.
  locals:
    computedValues:
      halfed: =inputs.values.int / 2
      doubled: =inputs.values.int * 2

    constantList: [NORTH, SOUTH, EAST, WEST]

  # The return value of a ValueFunction must be an object. Koreo Expressions
  # have access to the `locals` values.
  return:
    allowedRange:
      lower: =locals.computedValues.halfed
      upper: =locals.computedValues.doubled

    lowerWords: =locals.constantList.map(word, word.lower())
```

## Testing

[FunctionTests](./function-test.md) provide a solution for testing the logic
and error handling in a ValueFunction. These act as unit tests for Functions,
allowing you to validate their behavior in isolation and quickly iterate on
[Logic](./overview/glossary#logic) during development. Refer to the
FunctionTest documentation for information on their capabilities.

Below is an example FunctionTest used to test the ValueFunction shown above.

```yaml
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: simple-example.v1
  namespace: koreo-demo
spec:
  # Specify the Function to test.
  functionRef:
    kind: ValueFunction
    name: simple-example.v1

  # Provide a base set of inputs.
  inputs:
    enabled: true
    values:
      int: 4

  # Define your test cases. Each list item is a test case which acts as an
  # iteration of the control loop.
  testCases:
  # Test the happy-path return.
  - expectReturn:
      allowedRange:
        lower: 2
        upper: 8
      lowerWords: [north, south, east, west]

  # Tweak the input, test again. This input tweak will carry forward.
  - inputOverrides:
      values:
        int: 16
    expectReturn:
      allowedRange:
        lower: 8
        upper: 32
      lowerWords: [north, south, east, west]

  # Tweak the input and test an error case. Due to `variant`, this will not
  # carry forward.
  - variant: true
    inputOverrides:
      values:
        int: 0
    expectOutcome:
      permFail:
        message: must be positive

  # Tweak the input and test another other error case. Due to `variant`, this
  # will not carry forward.
  - variant: true
    inputOverrides:
      enabled: false
    expectOutcome:
      skip:
        message: User disabled
```

## Specification

import V1beta1 from './crds/value-function/_v1beta1.md';

<Tabs groupId="crdVersion">
  <TabItem value="v1beta1" label="v1beta1" default>
    <V1beta1 />
  </TabItem>
</Tabs>
