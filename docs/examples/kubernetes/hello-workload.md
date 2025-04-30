---
id: hello-workload
title: Hello Workload
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This is the "Hello Workload" example from the [Quick Start guide](../../getting-started/quick-start.md#hello-workload).
This example demonstrates building a simple workload abstraction that
encapsulates a Kubernetes Deployment and Service which is exposed through a
Workload CRD.

## hello-workload Workflow

<Tabs>
  <TabItem value="hello-workload" label="hello-workload.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: hello-workload
spec:
  crdRef:
    apiGroup: example.koreo.dev
    version: v1
    kind: Workload

  steps:
    - label: create_deployment
      ref:
        kind: ResourceFunction
        name: deployment-factory
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        env: =parent.spec.environment
        image: =parent.spec.container.image
        port: =parent.spec.container.port
      condition:
        type: Deployment
        name: Workload Deployment
        
    - label: create_service
      ref:
        kind: ResourceFunction
        name: service-factory.v2
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        env: =parent.spec.environment
        targetPort: =parent.spec.container.port
      condition:
        type: Service
        name: Workload Service
      state:
        service:
          clusterIP: =value.clusterIP
```
  </TabItem>
  <TabItem value="workload-crd" label="workload-crd.yaml">
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: workloads.example.koreo.dev
spec:
  group: example.koreo.dev
  names:
    kind: Workload
    listKind: WorkloadList
    plural: workloads
    singular: workload
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                container:
                  type: object
                  properties:
                    image:
                      type: string
                    port:
                      type: integer
                  required: ["image", "port"]
                environment:
                  type: string
                  enum: ["dev", "staging", "prod"]
              required: ["container", "environment"]
            status:
              x-kubernetes-preserve-unknown-fields: true
              type: object
```
  </TabItem>
</Tabs>

## deployment-factory ResourceFunction

<Tabs>
  <TabItem value="deployment-factory" label="deployment-factory.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: deployment-factory
spec:
  preconditions:
  - assert: |
      =inputs.name.matches("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")
    skip:
      message: "Invalid deployment name"

  - assert: |
      =inputs.env == "dev" || inputs.env == "staging" || inputs.env == "prod"
    permFail:
      message: "Invalid environment"

  apiConfig:
    apiVersion: apps/v1
    kind: Deployment
    name: =inputs.name + "-deployment"
    namespace: =inputs.namespace

  resourceTemplateRef:
    name: deployment-template

  overlays:
  - overlay:
      metadata:
        labels:
          env: =inputs.env
          workload: =inputs.name
      spec:
        selector:
          matchLabels:
            app: =inputs.name
        template:
          metadata:
            labels:
              app: =inputs.name
          spec:
            containers:
              - name: =inputs.name
                image: =inputs.image
                ports:
                  - containerPort: =inputs.port
  - overlayRef:
      kind: ValueFunction
      name: get-deployment-config
    inputs:
      env: =inputs.env
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: deployment-factory-test
spec:
  functionRef:
    kind: ResourceFunction
    name: deployment-factory

  inputs:
    name: test
    namespace: default
    image: test-api:latest
    port: 3000
    env: dev

  testCases:
  - label: happy path (dev)
    expectResource:
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: test-deployment
        namespace: default
        labels:
          env: dev
          workload: test
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: test
        template:
          metadata:
            labels:
              app: test
          spec:
            containers:
              - name: test
                image: test-api:latest
                ports:
                  - containerPort: 3000

  - label: happy path (prod)
    variant: true
    inputOverrides:
      env: prod
    expectResource:
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: test-deployment
        namespace: default
        labels:
          env: prod
          workload: test
      spec:
        replicas: 3
        selector:
          matchLabels:
            app: test
        template:
          metadata:
            labels:
              app: test
          spec:
            containers:
              - name: test
                image: test-api:latest
                ports:
                  - containerPort: 3000

  - label: empty deployment name
    variant: true
    inputOverrides:
      name: ""
    expectOutcome:
      skip:
        message: "Invalid deployment name"

  - label: invalid deployment name
    variant: true
    inputOverrides:
      name: "-invalid-name"
    expectOutcome:
      skip:
        message: "Invalid deployment name"

  - label: invalid environment
    variant: true
    inputOverrides:
      env: preprod
    expectOutcome:
      permFail:
        message: "Invalid environment"
```
  </TabItem>
</Tabs>

## deployment-template ResourceTemplate

<Tabs>
  <TabItem value="deployment-template" label="deployment-template.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceTemplate
metadata:
  name: deployment-template
spec:
  template:
    apiVersion: apps/v1
    kind: Deployment
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: nginx
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
            - name: nginx
              image: nginx:latest
              ports:
                - containerPort: 80
```
  </TabItem>
</Tabs>

## get-deployment-config ValueFunction

<Tabs>
  <TabItem value="get-deployment-config" label="get-deployment-config.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: get-deployment-config
spec:
  locals:
    replicas: |
      =inputs.env == "prod" ? 3 : 1
  return:
    spec:
      replicas: =locals.replicas
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: get-deployment-config-test
spec:
  functionRef:
    kind: ValueFunction
    name: get-deployment-config

  inputs:
    env: dev

  testCases:
  - label: dev environment
    expectReturn:
      spec:
        replicas: 1

  - label: prod environment
    inputOverrides:
      env: prod
    expectReturn:
      spec:
        replicas: 3
```
  </TabItem>
</Tabs>

## service-factory.v2 ResourceFunction

<Tabs>
  <TabItem value="service-factory-v2" label="service-factory-v2.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: service-factory
spec:
  preconditions:
  - assert: |
      =inputs.name.matches("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")
    skip:
      message: "Invalid service name"

  - assert: =inputs.selector.size() > 0
    skip:
      message: "No selector"

  locals:
    ports:
      - protocol: TCP
        port: 80
        targetPort: =inputs.targetPort

  apiConfig:
    apiVersion: v1
    kind: Service
    name: =inputs.name
    namespace: =inputs.namespace

  resource:
    spec:
      selector: =inputs.selector
      ports: =locals.ports
      type: ClusterIP
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: service-factory-test
spec:
  functionRef:
    kind: ResourceFunction
    name: service-factory

  inputs:
    name: hello-koreo
    namespace: default
    selector:
      app: nginx
    targetPort: 80

  testCases:
  - label: happy path
    expectResource:
      apiVersion: v1
      kind: Service
      metadata:
        name: hello-koreo
        namespace: default
      spec:
        selector:
          app: nginx
        ports:
          - protocol: TCP
            port: 80
            targetPort: 80
        type: ClusterIP

  - label: empty service name
    variant: true
    inputOverrides:
      name: ""
    expectOutcome:
      skip:
        message: "Invalid service name"

  - label: invalid service name
    variant: true
    inputOverrides:
      name: "-invalid-name"
    expectOutcome:
      skip:
        message: "Invalid service name"

  - label: no selector
    variant: true
    inputOverrides:
      selector:
    expectOutcome:
      skip:
        message: "No selector"
```
  </TabItem>
</Tabs>

## service-template ResourceTemplate

<Tabs>
  <TabItem value="service-template" label="service-template.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceTemplate
metadata:
  name: service-template
spec:
  template:
    apiVersion: v1
    kind: Service
    spec:
      selector:
        app: nginx
      ports:
        - protocol: TCP
          port: 80
          targetPort: 80
      type: ClusterIP
```
  </TabItem>
</Tabs>

## Example Trigger Workload

<Tabs>
  <TabItem value="workload" label="workload.yaml" default>
```yaml
apiVersion: example.koreo.dev/v1
kind: Workload
metadata:
  name: my-app
spec:
  container:
    image: nginx:latest
    port: 80
  environment: prod
```
  </TabItem>
</Tabs>

