---
id: resource-template
title: ResourceTemplate
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In order to make customizations easier, Koreo provides ResourceTemplate.
ResourceTemplate allows static resources to be defined which
[ResourceFunctions](./resource-function.md) may then _overlay_ with dynamic
values to produce a fully materialized resource. ResourceFunctions can
dynamically compute the ResourceTemplate name, making it easy to support a
range of use cases and configurations for a
[managed resource](./overview/glossary#managed-resource). By allowing the
statically defined resource to be dynamically loaded, it reduces the need to
create complex or verbose functions.

For instance, ResourceTemplates may be provided for different environments,
for specific resource types, or dynamically supplied configuration values.
Templates are also useful for simple static templates to provide common
configuration, such as regions. This allows the ResourceFunction to be
responsible for defining the interface and applying the values, but templates
to supply the bulk of static configuration.

This model makes it easy to turn existing resources into templates, then use a
Function only to apply dynamic values.

## Static Resource Specification

The [`spec.template`](#spec) is a static
[Target Resource Specification](./overview/glossary.md#target-resource-specification).
Both `apiVersion` and `kind` must be provided, but everything else is optional.
This static template will be (optionally) overlaid within the ResourceFunction.
The `metadata.name` and `metadata.namespace` properties are _always_ overlaid
by the ResourceFunction, so you need not specify them.

## Example

The example below demonstrates a ResourceFunction which dynamically loads a
ResourceTemplate based on a provided input along with a corresponding
[FunctionTest](./function-test.md).

<Tabs>
  <TabItem value="template-1" label="ResourceTemplate 1" default>
```yaml
apiVersion: koreo.realkinetic.com/v1beta1
kind: ResourceTemplate
metadata:
  # The template will be looked up by its name.
  name: docs-template-one.v1
  namespace: koreo-demo
spec:
  # Template contains the static resource that will be used as the base.
  # apiVersion and kind are required. The template is the actual body, or some
  # portion thereof, which you'd like to set static values for.
  template:
    apiVersion: koreo.realkinetic.com/v1beta1
    kind: TestDummy
    metadata:
      labels:
        docs.koreo.realkinetic.com/example: template-label
    spec:
      value: one
      nested:
      - 1
      - 2
```
  </TabItem>
  <TabItem value="template-2" label="ResourceTemplate 2">
```yaml
apiVersion: koreo.realkinetic.com/v1beta1
kind: ResourceTemplate
metadata:
  name: docs-template-two.v1
  namespace: koreo-demo
spec:
  template:
    apiVersion: koreo.realkinetic.com/v1beta1
    kind: TestDummy
    metadata:
      labels:
        docs.koreo.realkinetic.com/example: template-label
      annotations:
        docs.koreo.realkinetic.com/example: template-two
    spec:
      value: two
      structure:
      - name: doc
      - name: examples
```
  </TabItem>
  <TabItem value="resource-function" label="ResourceFunction">
```yaml
apiVersion: koreo.realkinetic.com/v1beta1
kind: ResourceFunction
metadata:
  name: docs-template-function.v1
  namespace: koreo-demo
spec:
  locals:
    template_name: ="docs-template-" + inputs.template + ".v1"

  apiConfig:
    apiVersion: koreo.realkinetic.com/v1beta1
    kind: TestDummy
    plural: testdummies

    name: =inputs.metadata.name + "-template-docs"
    namespace: =inputs.metadata.namespace

  resourceTemplateRef:
    name: =locals.template_name

    overlay:
      metadata: =template.metadata.overlay(inputs.metadata)
      spec:
        value: =inputs.value
        addedProperty: =inputs.value * 17
```
  </TabItem>
  <TabItem value="function-test" label="FunctionTest">
```yaml
apiVersion: koreo.realkinetic.com/v1beta1
kind: FunctionTest
metadata:
  name: docs-template-function.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: docs-template-function.v1

  # Template 'one' will be the base case.
  inputs:
    template: one
    value: 42
    metadata:
      name: test-demo
      namespace: tests
      labels:
        docs.koreo.realkinetic.com/from-function: label

  testCases:
  - label: Template One
    expectResource:
      apiVersion: koreo.realkinetic.com/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo-template-docs
        namespace: tests
        labels:
          docs.koreo.realkinetic.com/example: template-label
          docs.koreo.realkinetic.com/from-function: label
      spec:
        value: 42
        addedProperty: 714
        nested:
        - 1
        - 2

  - label: Template Two
    inputOverrides:
      template: two
    expectResource:
      apiVersion: koreo.realkinetic.com/v1beta1
      kind: TestDummy
      metadata:
        name: test-demo-template-docs
        namespace: tests
        labels:
          docs.koreo.realkinetic.com/example: template-label
          docs.koreo.realkinetic.com/from-function: label
        annotations:
          docs.koreo.realkinetic.com/example: template-two
      spec:
        value: 42
        addedProperty: 714
        structure:
        - name: doc
        - name: examples
```
  </TabItem>
</Tabs>

## Specification

import V1alpha8 from './crds/resource-template/_v1beta1.md';

<Tabs groupId="crdVersion">
  <TabItem value="v1beta1" label="v1beta1" default>
    <V1alpha8 />
  </TabItem>
</Tabs>
