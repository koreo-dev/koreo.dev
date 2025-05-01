---
id: vpc
title: VPC
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This example demonstrates building a VPC with a subnet and firewall that is
exposed through a GcpEnvironment abstraction. This uses [Config Connector](https://cloud.google.com/config-connector/docs/overview)
for provisioning GCP resources.


## gcp-environment Workflow

<Tabs>
  <TabItem value="workflow" label="workflow.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: gcp-environment
spec:
  crdRef:
    apiGroup: acme.example.com
    kind: GcpEnvironment
    version: v1beta1

  steps:
    - label: config
      ref:
        kind: ValueFunction
        name: gcp-environment-config
      inputs:
        parent: =parent
      state:
        projectId: =value.projectId

    - label: network
      ref:
        kind: ResourceFunction
        name: gcp-environment-network
      inputs:
        metadata: =steps.config
      state:
        networkName: =value.name

    - label: subnet
      ref:
        kind: ResourceFunction
        name: gcp-environment-subnet
      inputs:
        metadata: =steps.config
        networkName: =steps.network.name
        range: 10.10.0.0/16
      state:
        subnetName: =value.name

    - label: firewall
      ref:
        kind: ResourceFunction
        name: gcp-environment-firewall
      inputs:
        metadata: =steps.config
        networkName: =steps.network.name
        subnet: =steps.subnet
```
  </TabItem>
  <TabItem value="gcp-environment-crd" label="gcp-environment-crd.yaml">
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: gcpenvironments.acme.example.com
spec:
  scope: Namespaced
  group: acme.example.com
  names:
    kind: GcpEnvironment
    plural: gcpenvironments
    singular: gcpenvironment
  versions:
    - name: v1beta1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            apiVersion:
              description: "APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources"
              type: string
            kind:
              description: "Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds"
              type: string
            metadata:
              type: object
            spec:
              type: object
              properties:
                description:
                  description: The description of the environment
                  nullable: true
                  type: string
                projectId:
                  description: The gcp project id
                  type: string
            status:
              x-kubernetes-preserve-unknown-fields: true
              properties:
                conditions:
                  description:
                    Conditions represent the latest available observation
                    of the resource's current state.
                  items:
                    properties:
                      lastTransitionTime:
                        description:
                          Last time the condition transitioned from one status
                          to another.
                        type: string
                      message:
                        description:
                          Human-readable message indicating details about
                          last transition.
                        type: string
                      reason:
                        description:
                          Unique, one-word, CamelCase reason for the condition's
                          last transition.
                        type: string
                      status:
                        description:
                          Status is the status of the condition. Can be True,
                          False, Unknown.
                        type: string
                      type:
                        description: Type is the type of the condition.
                        type: string
                    type: object
                  type: array
              type: object
          required:
            - spec
```
  </TabItem>
</Tabs>

## gcp-environment-config ValueFunction

<Tabs>
  <TabItem value="config" label="config.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: gcp-environment-config
spec:
  return:
    environmentNamespace: =inputs.parent.metadata.namespace
    environmentResourceName: =inputs.parent.metadata.name
    projectId: =inputs.parent.spec.projectId
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: gcp-environment-config-test
spec:
  functionRef:
    kind: ValueFunction
    name: gcp-environment-config

  inputs:
    parent:
      apiVersion: acme.example.com/v1beta1
      kind: GcpEnvironment
      metadata:
        name: test-gcp-environment
        namespace: test-namespace
      spec:
        projectId: test-project

  testCases:
  - expectReturn:
      environmentNamespace: test-namespace
      environmentResourceName: test-gcp-environment
      projectId: test-project
```
  </TabItem>
</Tabs>

## gcp-environment-network ResourceFunction

<Tabs>
  <TabItem value="network" label="network.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: gcp-environment-network
spec:
  apiConfig:
    apiVersion: compute.cnrm.cloud.google.com/v1beta1
    kind: ComputeNetwork
    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  resource:
    spec:
      autoCreateSubnetworks: false
      enableUlaInternalIpv6: false
      routingMode: REGIONAL

  postconditions:
    - assert: =resource.config_connect_ready()
      retry:
        delay: 10
        message: Waiting for compute network to be created

  return:
    name: =inputs.metadata.name
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: gcp-environment-network-test
spec:
  functionRef:
    kind: ResourceFunction
    name: gcp-environment-network

  inputs:
    metadata:
      name: test-network
      namespace: test-namespace

  testCases:
  - expectResource:
      apiVersion: compute.cnrm.cloud.google.com/v1beta1
      kind: ComputeNetwork
      metadata:
        name: test-network
        namespace: test-namespace
      spec:
        autoCreateSubnetworks: false
        enableUlaInternalIpv6: false
        routingMode: REGIONAL
```
  </TabItem>
</Tabs>

## gcp-environment-subnet ResourceFunction

<Tabs>
  <TabItem value="subnet" label="subnet.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: gcp-environment-subnet
spec:
  apiConfig:
    apiVersion: compute.cnrm.cloud.google.com/v1beta1
    kind: ComputeSubnetwork
    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  resource:
    spec:
      ipCidrRange: =inputs.range
      networkRef:
        name: =inputs.networkName
      region: us-central1

  postconditions:
    - assert: =resource.config_connect_ready()
      retry:
        delay: 10
        message: Waiting for subnetwork to be created

  return:
    name: =inputs.metadata.name
    range: =inputs.range
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: gcp-environment-subnet-test
spec:
  functionRef:
    kind: ResourceFunction
    name: gcp-environment-subnet

  inputs:
    metadata:
      name: test-network
      namespace: test-namespace
    networkName: test-network-name
    range: 10.0.0.0/16

  testCases:
  - expectResource:
      apiVersion: compute.cnrm.cloud.google.com/v1beta1
      kind: ComputeSubnetwork
      metadata:
        name: test-network
        namespace: test-namespace
      spec:
        ipCidrRange: 10.0.0.0/16
        networkRef:
          name: test-network-name
        region: us-central1
```
  </TabItem>
</Tabs>

## gcp-environment-firewall ResourceFunction

<Tabs>
  <TabItem value="firewall" label="firewall.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: gcp-environment-firewall
spec:
  apiConfig:
    apiVersion: compute.cnrm.cloud.google.com/v1beta1
    kind: ComputeFirewall
    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  resource:
    spec:
      allow:
        - ports:
            - 0-65535
          protocol: tcp
        - ports:
            - 0-65535
          protocol: udp
        - protocol: icmp
      direction: INGRESS
      networkRef:
        name: =inputs.networkName
      sourceRanges:
        - =inputs.subnet.range

  postconditions:
    - assert: =resource.config_connect_ready()
      retry:
        delay: 10
        message: Waiting for firewall to be created

  return:
    name: =inputs.metadata.name
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: gcp-environment-firewall-test
spec:
  functionRef:
    kind: ResourceFunction
    name: gcp-environment-firewall

  inputs:
    metadata:
      name: test-network
      namespace: test-namespace
    networkName: test-network-name
    subnet:
      name: subnet1
      range: 10.0.0.0/20

  testCases:
  - expectResource:
      apiVersion: compute.cnrm.cloud.google.com/v1beta1
      kind: ComputeFirewall
      metadata:
        name: test-network
        namespace: test-namespace
      spec:
        allow:
        - ports:
          - 0-65535
          protocol: tcp
        - ports:
          - 0-65535
          protocol: udp
        - protocol: icmp
        direction: INGRESS
        networkRef:
          name: test-network-name
        sourceRanges:
        - 10.0.0.0/20
```
  </TabItem>
</Tabs>

## Example Trigger GcpEnvironment

<Tabs>
  <TabItem value="gcp-environment" label="gcp-environment.yaml" default>
```yaml
apiVersion: acme.example.com/v1beta1
kind: GcpEnvironment
metadata:
  name: test-gcp-environment
spec:
  description: A test GCP environment
  projectId: test-project
```
  </TabItem>
</Tabs>
