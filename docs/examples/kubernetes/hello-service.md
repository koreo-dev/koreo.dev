---
id: hello-service
title: Hello Service
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This is the "Hello Service" example from the [Quick Start guide](../../getting-started/quick-start.md#hello-service).
This example demonstrates a Workflow that watches for Kubernetes Deployments
with a specific `service` label and, if present, creates a corresponding
Service for the Deployment.

## hello-service Workflow

<Tabs>
  <TabItem value="hello-service" label="hello-service.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: hello-service
spec:
  crdRef:
    apiGroup: apps
    version: v1
    kind: Deployment

  steps:
    - label: get_service_config
      skipIf: =!has(parent.metadata.labels)
      ref:
        kind: ValueFunction
        name: get-service-config
      inputs:
        metadata: =parent.metadata
        spec: =parent.spec
        
    - label: create_service
      ref:
        kind: ResourceFunction
        name: service-factory
      inputs:
        name: =steps.get_service_config.name
        namespace: =steps.get_service_config.namespace
        selector: =steps.get_service_config.selector
        targetPort: =steps.get_service_config.targetPort
```
  </TabItem>
</Tabs>

## get-service-config ValueFunction

<Tabs>
  <TabItem value="get-service-config" label="get-service-config.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: get-service-config
spec:
  preconditions:
  - assert: =has(inputs.metadata.labels.service)
    skip:
      message: Deployment does not have service label

  - assert: |
      =has(inputs.spec.selector.matchLabels) &&
        inputs.spec.selector.matchLabels.size() > 0
    skip:
      message: Deployment does not have selector.matchLabels

  - assert: =has(inputs.spec.template.spec.containers[0].ports[0].containerPort)
    skip:
      message: Deployment does not have containerPort

  return:
    name: =inputs.metadata.labels.service
    namespace: =inputs.metadata.namespace
    selector: =inputs.spec.selector.matchLabels
    targetPort: =inputs.spec.template.spec.containers[0].ports[0].containerPort
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: get-service-config-test
spec:
  functionRef:
    kind: ValueFunction
    name: get-service-config

  inputs:
    metadata:
      namespace: default
      labels:
        service: hello-koreo
    spec:
      selector:
        matchLabels:
          app: nginx
      template:
        spec:
          containers:
            - name: nginx
              image: nginx:latest
              ports:
                - containerPort: 80
  
  testCases:
  - label: happy path
    expectReturn:
      name: hello-koreo
      namespace: default
      selector:
        app: nginx
      targetPort: 80

  - label: service label not present
    variant: true
    inputOverrides:
      metadata:
        labels:
    expectOutcome:
      skip:
        message: Deployment does not have service label

  - label: selector matchLabels not present
    variant: true
    inputOverrides:
      spec:
        selector:
    expectOutcome:
      skip:
        message: Deployment does not have selector.matchLabels

  - label: selector matchLabels empty
    variant: true
    inputOverrides:
      spec:
        selector:
          matchLabels:
    expectOutcome:
      skip:
        message: Deployment does not have selector.matchLabels

  - label: containerPort not present
    variant: true
    inputOverrides:
      spec:
        template:
          spec:
            containers:
    expectOutcome:
      skip:
        message: Deployment does not have containerPort
```
  </TabItem>
</Tabs>

## service-factory ResourceFunction

<Tabs>
  <TabItem value="service-factory" label="service-factory.k.yaml" default>
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

## Example Trigger Deployment

<Tabs>
  <TabItem value="deployment" label="deployment.yaml" default>
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    service: nginx-svc
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
