---
id: vpc
title: VPC
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This example demonstrates building a VPC with an internet gateway, route table,
and public subnets. This is exposed through an AwsEnvironment abstraction. This
example also shows how consistent metadata labels and AWS tags can be applied
across resources. This uses [ACK](https://aws-controllers-k8s.github.io/community/docs/community/overview/)
for provisioning AWS resources.


## aws-environment Workflow

<Tabs>
  <TabItem value="workflow" label="workflow.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: aws-environment
spec:
  crdRef:
    apiGroup: acme.example.com
    version: v1beta1
    kind: AwsEnvironment
  steps:
    - label: config
      ref:
        name: aws-environment-config
        kind: ValueFunction
      inputs:
        metadata: =parent.metadata

    - label: metadata
      ref:
        name: aws-environment-metadata
        kind: ValueFunction
      inputs:
        config: =steps.config

    - label: resource_tags
      ref:
        name: aws-environment-tags
        kind: ValueFunction
      inputs:
        config: =steps.config

    - label: vpc
      ref:
        name: aws-environment-vpc
        kind: ResourceFunction
      inputs:
        metadata: =steps.metadata
        resource_tags: =steps.resource_tags
      condition:
        type: VPC
        name: Environment VPC

    - label: internet_gateway
      ref:
        name: aws-environment-internet-gateway
        kind: ResourceFunction
      inputs:
        metadata: =steps.metadata
        resource_tags: =steps.resource_tags
        vpc: =steps.vpc
      condition:
        type: InternetGateway
        name: Environment Internet Gateway

    - label: public_route_table
      ref:
        name: aws-environment-public-route-table
        kind: ResourceFunction
      inputs:
        metadata: =steps.metadata
        resource_tags: =steps.resource_tags
        vpc: =steps.vpc
        internet_gateway: =steps.internet_gateway
      condition:
        type: RouteTable
        name: Environment Public Route Table

    - label: public_subnets
      ref:
        name: aws-environment-public-subnet
        kind: ResourceFunction
      forEach:
        itemIn: =parent.spec.vpc.publicSubnets
        inputKey: subnet
      inputs:
        metadata: =steps.metadata
        resource_tags: =steps.resource_tags
        subnet: =parent.spec.vpc.publicSubnets
        public_route_table: =steps.public_route_table
        vpc: =steps.vpc
      condition:
        type: PublicSubnet
        name: Environment Public Subnet
```
  </TabItem>
  <TabItem value="aws-environment-crd" label="aws-environment-crd.yaml">
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: awsenvironments.acme.example.com
spec:
  scope: Namespaced
  group: acme.example.com
  names:
    kind: AwsEnvironment
    plural: awsenvironments
    singular: awsenvironment
  versions:
    - name: v1beta1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          description: ""
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
                vpc:
                  type: object
                  nullable: true
                  properties:
                    publicSubnets:
                      type: array
                      nullable: true
                      default:
                        - cidrBlock: 10.0.128.0/20
                          availabilityZone: us-east-1a
                          name: a
                      items:
                        type: object
                        properties:
                          cidrBlock:
                            type: string
                            nullable: false
                          availabilityZone:
                            type: string
                            nullable: false
                          name:
                            type: string
                            nullable: false
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

## aws-environment-config ValueFunction

<Tabs>
  <TabItem value="config" label="config.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: aws-environment-config
spec:
  return:
    environment: =inputs.metadata.name
    environment_namespace: =inputs.metadata.namespace
    business_unit: |
      =has(inputs.metadata.labels['acme.example.com/business-unit']) ?
        inputs.metadata.labels['acme.example.com/business-unit'] : ""
    product_line: |
      =has(inputs.metadata.labels['acme.example.com/product-line']) ?
        inputs.metadata.labels['acme.example.com/product-line'] : ""
    domain: |
      =has(inputs.metadata.labels['acme.example.com/domain']) ?
        inputs.metadata.labels['acme.example.com/domain'] : ""
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-config-test
spec:
  functionRef:
    name: aws-environment-config
    kind: ValueFunction
  inputs:
    metadata:
      name: test-aws-environment
      namespace: test-namespace
      labels:
        acme.example.com/domain: domain
        acme.example.com/business-unit: acme-bu
        acme.example.com/product-line: acme-widgets

  testCases:
   - expectReturn:
       business_unit: acme-bu
       product_line: acme-widgets
       domain: 'domain'
       environment_namespace: test-namespace
       environment: test-aws-environment
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-config-test-partial
spec:
  functionRef:
    name: aws-environment-config
    kind: ValueFunction
  inputs:
    metadata:
      name: test-aws-environment
      namespace: test-namespace

  testCases:
    - expectReturn:
        business_unit: ''
        product_line: ''
        domain: ''
        environment_namespace: test-namespace
        environment: test-aws-environment
```
  </TabItem>
</Tabs>

## aws-environment-metadata ValueFunction

<Tabs>
  <TabItem value="metadata" label="metadata.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: aws-environment-metadata
spec:
  return:
    name: =inputs.config.environment
    namespace: =inputs.config.environment_namespace
    labels:
      app.kubernetes.io/managed-by: koreo
      acme.example.com/domain: =inputs.config.app_domain_name
      acme.example.com/environment: =inputs.config.environment
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-metadata-test
spec:
  functionRef:
    name: aws-environment-metadata
    kind: ValueFunction
  inputs:
    config:
      environment: acme-test
      environment_namespace: acme-ns
      app_domain_name: test-domain
  testCases:
    - expectReturn:
        labels:
          app.kubernetes.io/managed-by: koreo
          acme.example.com/domain: test-domain
          acme.example.com/environment: acme-test
        name: acme-test
        namespace: acme-ns
```
  </TabItem>
</Tabs>

## aws-environment-tags ValueFunction

<Tabs>
  <TabItem value="tags" label="tags.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: aws-environment-tags
spec:
  return:
    tags:
      - key: business-unit
        value: =inputs.config.business_unit
      - key: product-line
        value: =inputs.config.product_line
      - key: domain
        value: =inputs.config.domain
      - key: environment
        value: =inputs.config.environment
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-tags-test
spec:
  functionRef:
    name: aws-environment-tags
    kind: ValueFunction
  inputs:
    config:
      environment: acme-test
      environment_namespace: acme-ns
      business_unit: acme-bu
      product_line: acme-widgets
      domain: test-domain
  testCases:
    - expectReturn:
        tags:
        - key: business-unit
          value: acme-bu
        - key: product-line
          value: acme-widgets
        - key: domain
          value: test-domain
        - key: environment
          value: acme-test
```
  </TabItem>
</Tabs>

## aws-environment-vpc ResourceFunction

<Tabs>
  <TabItem value="vpc" label="vpc.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: aws-environment-vpc
spec:
  apiConfig:
    apiVersion: ec2.services.k8s.aws/v1alpha1
    kind: VPC
    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  resource:
    metadata: =inputs.metadata
    spec:
      enableDNSHostnames: true
      enableDNSSupport: true
      cidrBlocks:
        - 10.0.0.0/16
      tags: =inputs.resource_tags.tags

  postconditions:
    - assert: =has(resource.status.vpcID)
      retry:
        message: Waiting for vpc to become healthy
        delay: 5

  return:
    name: =inputs.metadata.name
    vpc_id: =resource.status.vpcID
    vpc_account_id: =resource.status.ownerID
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-vpc-test
spec:
  functionRef:
    kind: ResourceFunction
    name: aws-environment-vpc

  inputs:
    metadata:
      name: test
      namespace: test-namespace
    resource_tags:
      tags:
        - key: test
          value: value

  testCases:
    - expectResource:
        apiVersion: ec2.services.k8s.aws/v1alpha1
        kind: VPC
        metadata:
          name: test
          namespace: test-namespace
        spec:
          cidrBlocks:
          - 10.0.0.0/16
          enableDNSHostnames: true
          enableDNSSupport: true
          tags:
          - key: test
            value: value
    - overlayResource:
        status:
          vpcID: 123213323
          ownerID: 213412341
      expectReturn:
          name: test
          vpc_account_id: 213412341
          vpc_id: 123213323
```
  </TabItem>
</Tabs>

## aws-environment-internet-gateway ResourceFunction

<Tabs>
  <TabItem value="internet-gateway" label="internet-gateway.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: aws-environment-internet-gateway
spec:
  apiConfig:
    apiVersion: ec2.services.k8s.aws/v1alpha1
    kind: InternetGateway
    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  create:
    delay: 1

  resource:
    metadata: =inputs.metadata
    spec:
      vpcRef:
        from:
          name: =inputs.vpc.name
      tags: =inputs.resource_tags.tags

  postconditions:
    - assert: =has(resource.status.internetGatewayID)
      retry:
        message: Waiting for internet gateway to become healthy
        delay: 5

  return:
    name: =inputs.metadata.name
    gateway_id: =resource.status.internetGatewayID
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-internet-gateway-test
spec:
  functionRef:
    kind: ResourceFunction
    name: aws-environment-internet-gateway
  inputs:
    vpc:
      name: test-vpc
    metadata:
      name: test
      namespace: test-namespace
    resource_tags:
      tags:
        - key: test
          value: value

  testCases:
   - expectResource:
       apiVersion: ec2.services.k8s.aws/v1alpha1
       kind: InternetGateway
       metadata:
         name: test
         namespace: test-namespace
       spec:
         tags:
         - key: test
           value: value
         vpcRef:
           from:
             name: test-vpc

---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-internet-gateway-test-validation
spec:
  functionRef:
    kind: ResourceFunction
    name: aws-environment-internet-gateway
  inputs:
    vpc:
      name: test-vpc
    metadata:
      name: test
      namespace: test-namespace
    resource_tags:
      tags:
      - key: test
        value: value

  currentResource:
    apiVersion: ec2.services.k8s.aws/v1alpha1
    kind: InternetGateway
    metadata:
      name: test
      namespace: test-namespace
    spec:
      tags:
      - key: test
        value: value
      vpcRef:
        from:
          name: test-vpc
    status:
      internetGatewayID: ig-2453445123

  testCases:
    - expectReturn:
        name: test
        gateway_id: ig-2453445123
```
  </TabItem>
</Tabs>

## aws-environment-public-route-table ResourceFunction

<Tabs>
  <TabItem value="public-route-table" label="public-route-table.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: aws-environment-public-route-table
spec:
  locals:
    metadata: |
      =inputs.metadata.overlay({"name": inputs.metadata.name + "-public"})
  apiConfig:
    apiVersion: ec2.services.k8s.aws/v1alpha1
    kind: RouteTable
    name: =locals.metadata.name
    namespace: =locals.metadata.namespace

  resource:
    metadata: =locals.metadata
    spec:
      vpcRef:
        from:
          name: =inputs.vpc.name
      tags: =inputs.resource_tags.tags
      routes:
        - destinationCIDRBlock: 0.0.0.0/0
          gatewayRef:
            from:
              name: =inputs.internet_gateway.name

  create:
    delay: 1

  postconditions:
    - assert: =has(resource.status.routeTableID)
      retry:
        message: Waiting for route table to become healthy
        delay: 5

  return:
    name: =locals.metadata.name
    route_table_id: =resource.status.routeTableID
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-public-route-table-test
spec:
  functionRef:
    kind: ResourceFunction
    name: aws-environment-public-route-table

  inputs:
    internet_gateway:
      name: internet_gateway
    vpc:
      name: vpc
    metadata:
      name: test
      namespace: test-namespace
    resource_tags:
      tags:
      - key: test
        value: value

  testCases:
    - expectResource:
        apiVersion: ec2.services.k8s.aws/v1alpha1
        kind: RouteTable
        metadata:
          name: test-public
          namespace: test-namespace
        spec:
          routes:
          - destinationCIDRBlock: 0.0.0.0/0
            gatewayRef:
              from:
                name: internet_gateway
          tags:
          - key: test
            value: value
          vpcRef:
            from:
              name: vpc
    - overlayResource:
        status:
          routeTableID: rt-12341234
      expectReturn:
        route_table_id: rt-12341234
        name: test-public
```
  </TabItem>
</Tabs>

## aws-environment-public-subnet ResourceFunction

<Tabs>
  <TabItem value="public-subnet" label="public-subnet.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: aws-environment-public-subnet
spec:
  locals:
    metadata: |
      =inputs.metadata.overlay({"name": inputs.metadata.name + "-" + inputs.subnet.name + "-public"})

  apiConfig:
    apiVersion: ec2.services.k8s.aws/v1alpha1
    kind: Subnet
    name: =locals.metadata.name
    namespace: =locals.metadata.namespace

  resource:
    metadata: =locals.metadata
    spec:
      availabilityZone: =inputs.subnet.availabilityZone
      cidrBlock: =inputs.subnet.cidrBlock
      tags: =inputs.resource_tags.tags
      mapPublicIPOnLaunch: true
      vpcRef:
        from:
          name: =inputs.vpc.name
      routeTableRefs:
        - from:
            name: =inputs.public_route_table.name

  create:
    delay: 1

  postconditions:
    - assert: =has(resource.status.subnetID)
      retry:
        message: Waiting for subnet to become healthy
        delay: 5

  return:
    name: =locals.metadata.name
    subnet_id: =resource.status.subnetID
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: aws-environment-public-subnet-test
spec:
  functionRef:
    kind: ResourceFunction
    name: aws-environment-public-subnet
  inputs:
    metadata:
      name: test
      namespace: test-namespace
    public_route_table:
      name: public_route_table
    resource_tags:
      tags:
      - key: test
        value: value
    subnet:
      availabilityZone: us-west-2a
      cidrBlock: 10.0.0.0/20
      name: a
    vpc:
      name: vpc

  testCases:
    - expectResource:
        apiVersion: ec2.services.k8s.aws/v1alpha1
        kind: Subnet
        metadata:
          name: test-a-public
          namespace: test-namespace
        spec:
          availabilityZone: us-west-2a
          cidrBlock: 10.0.0.0/20
          mapPublicIPOnLaunch: true
          routeTableRefs:
          - from:
              name: public_route_table
          tags:
          - key: test
            value: value
          vpcRef:
            from:
              name: vpc
```
  </TabItem>
</Tabs>

## Example Trigger AwsEnvironment

<Tabs>
  <TabItem value="aws-environment" label="aws-environment.yaml" default>
```yaml
apiVersion: acme.example.com/v1beta1
kind: AwsEnvironment
metadata:
  name: test-aws-environment
  labels:
    acme.example.com/business-unit: acme-bu
    acme.example.com/product-line: acme-widgets
    acme.example.com/domain: acme-domain
spec:
  vpc:
    publicSubnets:
      - cidrBlock: 10.0.128.0/20
        availabilityZone: us-east-1a
        name: a-public
```
  </TabItem>
</Tabs>
