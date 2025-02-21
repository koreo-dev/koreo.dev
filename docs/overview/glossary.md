---
id: glossary
title: Glossary
sidebar_position: 3
---

This glossary defines key terms used in Koreo grouped by related concept.

## Workflows & Functions

### Function
Refers to a [ValueFunction](#valuefunction) or [ResourceFunction](#resourcefunction).

### ValueFunction
A pure Function which may be used to perform validations, compute values, or
restructure data. Learn more about ValueFunctions [here](../value-function.md).

### ResourceFunction
A Function which manages or reads values from a [Managed
Resource](#managed-resource). These Functions are an interface to external
state, which they may set and load. When managing a resource, they define a
[control loop](#control-loop).

### Workflow
Defines a collection of [Steps](#step) to be run and manages their execution.
Learn more about Workflows [here](../workflow.md).

### Step  
A [Workflow](#workflow) step specifies [Logic](#logic) to be run, how inputs
from other steps will map into the Logic's inputs, if a [Condition](#condition)
should be reported, and if any [state](#state) should be extracted and returned
(either to a calling Workflow or parent resource).

### Logic
Refers to a [Function](#function) or [Workflow](#workflow). Most often the
term is used to refer to the [Function](#function) or [Workflow](#workflow)
to be run as a [Workflow](#workflow) [step](#step).

### Koreo Expression
A simple expression language that is modeled after
[CEL](https://github.com/google/cel-spec/blob/master/doc/langdef.md), provides
capabilities needed for basic logic, arithmetic, string manipulation, and data
reshaping used in [Workflows](#workflow) and [Functions](#function).

### ResourceTemplate
Provides a simple means of specifying static values as a base [Target Resource
Specification](#target-resource-specification). A ResourceTemplate may be
dynamically loaded by a [ResourceFunction](#resourcefunction), allowing for
configuration based template selection. The static values may be overlaid with
values provided to (or computed by) a [ResourceFunction](#resourcefunction).

### Outcome  
Refers to the return type of a [Function](#function) or [Workflow](#workflow).
Outcome types are:
- [`Ok`](#ok): Successful evaluation.
- [`Skip`](#skip): Skipped without evaluation.
- [`DepSkip`](#depskip): Dependency not ready.
- [`Retry`](#retry): Reattempt after delay.
- [`PermFail`](#permfail): Permanent failure requiring intervention.

### Ok
An [Outcome](#outcome) that indicates a successful evaluation. A return value
may be present, if expected.

### Skip  
An [Outcome](#outcome) that indicates the [Logic](#logic) was skipped without
an attempt to evaluate due to an input or other condition.

### DepSkip  
An [Outcome](#outcome) that indicates a dependency is not yet ready. It means
the [Logic](#logic) was skipped without an attempt to evaluate.

### Retry  
An [Outcome](#outcome) that indicates the [Logic](#logic) should be retried
after a specified delay. Typically this indicates an active waiting status that
is expected to self-resolve over time.

### PermFail  
An [Outcome](#outcome) that indicates a permanent failure condition that will
require intervention in order to resolve.

### State
Some or all of a [Logic's](#logic) return value which will be set on the
[parent resource's](#parent-resource) `status.state` property.

## Kubernetes Concepts

### Condition  
A convention used in Kubernetes resources to communicate status information.
Koreo may optionally set Conditions on a [parent resource](#parent-resource)
based on the [Outcome](#outcome) from a [step](#step).

### Managed Resource  
A Kubernetes resource that a [ResourceFunction](#resourcefunction) is managing
to ensures its specification matches a
[Target Resource Specification](#target-resource-specification) or reads values
from (for `readonly` functions).

### Target Resource Specification
The specification that a resource is expected to match after all [Koreo
Expressions](#koreo-expression) have been evaluated and all overlays applied.
The is the fully materialized resource view that will be applied to the
cluster.

### Parent Resource  
A Kubernetes resource which is used to trigger [Workflow](#workflow)
[reconciliations](#reconcile) and provide configuration to the
[Workflow](#workflow) instance.

### Reconcile  
To run a [control loop](#control-loop) in order to ensure the
[Conditions](#condition) and observed state match the desired state. If they do
not match, the differences will be _reconciled_ to bring them into alignment.

### Control Loop  
A control loop observes [Conditions](#condition) and state. If the observed
Conditions or state do not meet the target state, then the control loop will
attempt to bring them into alignment with the target state by making
adjustments.

## Testing & Validation

### Contract Testing  
Used to ensure that correctly structured API calls are made based on a set of
inputs.

### FunctionTest  
Koreo's built in [control-loop](#control-loop)-friendly testing framework.
Allows for unit-testing style validation in addition to [contract
testing](#contract-testing).

### Function Under Test
Refers to a [ValueFunction](#valuefunction) or
[ResourceFunction](#resourcefunction) that is being tested by a
[FunctionTest](#functiontest).
