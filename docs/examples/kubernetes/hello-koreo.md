---
id: hello-koreo
title: Hello Koreo
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This is the "Hello Koreo" example from the [Quick Start guide](../../getting-started/quick-start.md#hello-koreo).
This example demonstrates a simple Workflow that is triggered off of a
Kubernetes Deployment. It sets a `hello` label on the triggering Deployment's
metadata.

## hello-koreo Workflow

<Tabs>
  <TabItem value="hello-koreo" label="hello-koreo.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: hello-koreo
spec:
  crdRef:
    apiGroup: apps
    version: v1
    kind: Deployment
  steps:
    - label: get_labels
      ref:
        kind: ValueFunction
        name: get-labels
      inputs:
        name: =parent.metadata.name
    - label: set_labels
      ref:
        kind: ResourceFunction
        name: set-deployment-labels
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        labels: =steps.get_labels.labels
```
  </TabItem>
</Tabs>

## get-labels ValueFunction

<Tabs>
  <TabItem value="get-labels" label="get-labels.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: get-labels
spec:
  return:
    labels:
      hello: =inputs.name
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: get-labels-test
spec:
  functionRef:
    kind: ValueFunction
    name: get-labels

  inputs:
    name: test

  testCases:
    - expectReturn:
        labels:
          hello: test
```
  </TabItem>
</Tabs>

## set-deployment-labels ResourceFunction

<Tabs>
  <TabItem value="set-deployment-labels" label="set-deployment-labels.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: set-deployment-labels
spec:
  apiConfig:
    apiVersion: apps/v1
    kind: Deployment
    name: =inputs.name
    namespace: =inputs.namespace
    owned: false

  resource:
    metadata:
      labels: =inputs.labels

  create:
    enabled: false
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: set-deployment-labels-test
spec:
  functionRef:
    kind: ResourceFunction
    name: set-deployment-labels

  inputs:
    name: test-deployment
    namespace: default
    labels:
      foo: bar
      baz: qux

  currentResource:
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: test-deployment
      namespace: default

  testCases:
    - label: Sets labels
      expectResource:
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: test-deployment
          namespace: default
          labels:
            foo: bar
            baz: qux
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
