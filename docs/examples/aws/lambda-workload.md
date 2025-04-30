---
id: lambda-workload
title: Lambda Workload
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In this example, we will create a Workflow that provisions four key AWS
resources in sequence. First, we define a simple KRM object to create an S3
bucket. Next, we generate a policy that grants read and write access to that
specific bucket. Third, we create a Lambda execution role that can assume this
policy. Finally, we attach the role to a Lambda function, which writes event
payloads as JSON files to the bucket. It uses [ACK](https://aws-controllers-k8s.github.io/community/docs/community/overview/)
for provisioning AWS resources. See the [examples repository](https://github.com/koreo-dev/examples/tree/main/aws/lambda-workload)
in GitHub for complete instructions for running this example.

## hello-lambda-workload Workflow

<Tabs>
  <TabItem value="hello-workload" label="hello-workload.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: hello-lambda-workload
  namespace: koreo-examples
spec:
  crdRef:
    apiGroup: example.koreo.dev
    version: v1
    kind: LambdaWorkload

  steps:
    - label: calculateBucketName
      ref:
        kind: ValueFunction
        name: calculate-bucket-name
      inputs:
        uid: =parent.metadata.uid
        bucketName: =parent.spec.bucketName
        generateSuffix: =parent.spec.generateBucketSuffix
        maybeBucketName: |
          =has(parent.status.state.bucket.bucketName) ? parent.status.state.bucket.bucketName : ""
      state:
        bucketName: =value.name
      
    - label: bucket
      ref:
        kind: ResourceFunction
        name: bucket-factory
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        bucketName: =steps.calculateBucketName.name
      condition:
        type: Bucket 
        name: Workload Bucket

    - label: bucketPolicy
      ref:
        kind: ResourceFunction
        name: bucket-policy
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        role: =parent.spec.role
        bucketArn: =steps.bucket.arn
      condition:
        type: Policy
        name: Workload Bucket Policy
  
    - label: lambdaRole
      ref:
        kind: ResourceFunction
        name: lambda-role
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        policyName: =steps.bucketPolicy.name
      condition:
        type: Role 
        name: Workload Lambda Execution Role 
        
    - label: lambda
      ref:
        kind: ResourceFunction
        name: lambda
      inputs:
        name: =parent.metadata.name
        namespace: =parent.metadata.namespace
        image: =parent.spec.image
        roleArn: =steps.lambdaRole.arn
        accountId: =steps.lambdaRole.accountId
        bucketName: =steps.calculateBucketName.name
      condition:
        type: Lambda
        name: Workload Lambda
```
  </TabItem>
  <TabItem value="lambda-workload-crd" label="lambda-workload-crd.yaml">
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: lambdaworkloads.example.koreo.dev
spec:
  group: example.koreo.dev
  names:
    kind: LambdaWorkload
    listKind: LambdaWorkloadList
    plural: lambdaworkloads
    singular: lambdaworkload
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
                image:
                  type: string
                bucketName:
                  type: string
                role:
                  type: string
                  default: writer
                  enum:
                    - reader
                    - writer
                generateBucketSuffix:
                  type: boolean
                  default: true
              required: ["image", "bucketName"]
            status:
              x-kubernetes-preserve-unknown-fields: true
              type: object
```
  </TabItem>
</Tabs>

## calculate-bucket-name ValueFunction

<Tabs>
  <TabItem value="calculate-bucket-name" label="calculate-bucket-name.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: calculate-bucket-name
  namespace: koreo-examples
spec:
  locals:
    name: |
      =inputs.generateSuffix ? (inputs.bucketName + "-" + inputs.uid.split_last("-")) : inputs.bucketName
    
  return:
    name: |
      =has(inputs.maybeBucketName) && inputs.maybeBucketName != "" ? inputs.maybeBucketName : locals.name
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: calculate-bucket-name-test
  namespace: koreo-examples
spec:
  functionRef:
    kind: ValueFunction
    name: calculate-bucket-name

  inputs:
    uid: "a57c1354-9346-42c6-a924-ba307e086138"
    maybeBucketName: ""
    generateSuffix: true
    bucketName: "non-unique-name"

  testCases:
  - label: generate-suffix
    expectReturn:
      name: "non-unique-name-ba307e086138"

  - label: no-suffix
    inputOverrides:
      generateSuffix: false
    expectReturn:
      name: "non-unique-name"

  - label: use-maybe-name
    inputOverrides:
      maybeBucketName: "already-generated-name"
    expectReturn:
      name: "already-generated-name"
```
  </TabItem>
</Tabs>

## bucket-factory ResourceFunction

<Tabs>
  <TabItem value="bucket-factory" label="bucket-factory.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: bucket-factory
  namespace: koreo-examples
spec:
  preconditions:
  - assert: |
      =inputs.name.matches("^(?!.*\.\.)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$")
    skip:
      message: "Invalid bucket name"

  apiConfig:
    apiVersion: s3.services.k8s.aws/v1alpha1
    kind: Bucket
    name: =inputs.name + "-bucket"
    namespace: =inputs.namespace

  resource:
    spec:
      name: =inputs.bucketName

  postconditions:
    - assert: =has(resource.status.ackResourceMetadata.arn)
      retry:
        message: Bucket is waiting to become ready
        delay: 5
  
  return:
    arn: =resource.status.ackResourceMetadata.arn
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: bucket-factory-test
  namespace: koreo-examples
spec:
  functionRef:
    kind: ResourceFunction
    name: bucket-factory

  inputs:
    name: test
    bucketName: test-bucket-asdfasdf
    namespace: default

  testCases:
  - label: ok
    expectResource:
      apiVersion: s3.services.k8s.aws/v1alpha1
      kind: Bucket
      metadata:
        name: test-bucket
        namespace: default
      spec:
        name: test-bucket-asdfasdf

  - label: ok-return
    overlayResource:
      status:
        ackResourceMetadata:
          arn: arn:aws:ecs:us-east-1:1234567890:bucket
    expectReturn:
      arn: arn:aws:ecs:us-east-1:1234567890:bucket
```
  </TabItem>
</Tabs>

## bucket-policy ResourceFunction

<Tabs>
  <TabItem value="bucket-policy" label="bucket-policy.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: bucket-policy
  namespace: koreo-examples
spec: 
  locals:
    policy_statement:
      - Effect: Allow
        Resource: "*"
        Action:
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
      - Effect: "Allow"
        Resource:
        - =inputs.bucketArn
        - =inputs.bucketArn + "/*"
        Action: |
          =!has(inputs.role) || inputs.role == "writer" ?
            ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"] :
            ["s3:ListBucket", "s3:GetObject"]

  apiConfig:
    apiVersion: iam.services.k8s.aws/v1alpha1
    kind: Policy
    plural: policies
    name: =inputs.name
    namespace: =inputs.namespace

  resource:
    spec:
      name: =inputs.name
      policyDocument: |
        =to_json({"Version":"2012-10-17", "Statement": locals.policy_statement})
      x-koreo-compare-last-applied: [policyDocument]

  postconditions:
    - assert: =has(resource.status.policyID)
      retry:
        message: Waiting for Policy ID
        delay: 15

  return:
    name: =inputs.name
    policyId: =resource.status.policyID
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: bucket-policy-test
spec:
  functionRef:
    kind: ResourceFunction
    name: bucket-policy

  inputs:
    bucketArn: arn:aws:s3:us-east-1:1234567890:bucket/my-bucket
    namespace: test-namespace
    name: test-policy
    role: writer

  testCases:
    - label: writer
      expectResource:
        apiVersion: iam.services.k8s.aws/v1alpha1
        kind: Policy
        metadata:
          name: test-policy
          namespace: test-namespace
        spec:
          name: test-policy
          policyDocument: '{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Resource": "*", "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]}, {"Effect": "Allow", "Resource": ["arn:aws:s3:us-east-1:1234567890:bucket/my-bucket", "arn:aws:s3:us-east-1:1234567890:bucket/my-bucket/*"], "Action": ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"]}]}'
    - label: reader
      variant: true
      inputOverrides:
        role: reader
      expectResource:
        apiVersion: iam.services.k8s.aws/v1alpha1
        kind: Policy
        metadata:
          name: test-policy
          namespace: test-namespace
        spec:
          name: test-policy
          policyDocument: '{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Resource": "*", "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]}, {"Effect": "Allow", "Resource": ["arn:aws:s3:us-east-1:1234567890:bucket/my-bucket", "arn:aws:s3:us-east-1:1234567890:bucket/my-bucket/*"], "Action": ["s3:ListBucket", "s3:GetObject"]}]}'
    - label: ok-return
      inputOverrides:
        name: test-policy
      overlayResource:
        status:
          policyID: test-policy-id
      expectReturn:
        policyId: test-policy-id
        name: test-policy
```
  </TabItem>
</Tabs>

## lambda-role ResourceFunction

<Tabs>
  <TabItem value="lambda-role" label="lambda-role.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: lambda-role
  namespace: koreo-examples
spec:
  apiConfig:
    apiVersion: iam.services.k8s.aws/v1alpha1
    kind: Role
    name: =inputs.name
    namespace: =inputs.namespace

  resource:
    spec:
      policyRefs:
        - from:
            name: =inputs.policyName
      name: =inputs.name
      assumeRolePolicyDocument: |
        =to_json({
          "Version":"2012-10-17",
          "Statement": [{
            "Effect":"Allow",
            "Principal": {
              "Service": [
                "lambda.amazonaws.com"
              ]
            },
            "Action": ["sts:AssumeRole"]
          }]
        })

  postconditions:
    - assert: =has(resource.status.ackResourceMetadata.arn)
      retry:
        message: Waiting for lambda role to become healthy
        delay: 5

  return:
    name: =inputs.name
    arn: =resource.status.ackResourceMetadata.arn
    accountId: =string(resource.status.ackResourceMetadata.ownerAccountID)
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: lambda-role-test
spec:
  functionRef:
    kind: ResourceFunction
    name: lambda-role
  inputs:
    name: test-role
    namespace: test-namespace
    policyName: test-policy

  testCases:
    - label: ok
      expectResource:
        apiVersion: iam.services.k8s.aws/v1alpha1
        kind: Role
        metadata:
          name: test-role
          namespace: test-namespace
        spec:
          assumeRolePolicyDocument: '{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": {"Service": ["lambda.amazonaws.com"]}, "Action": ["sts:AssumeRole"]}]}'
          name: test-role
          policyRefs:
          - from:
              name: test-policy
    - label: ok-return
      overlayResource:
        status:
          ackResourceMetadata:
            arn: this-is-an-arn
            ownerAccountID: "23412341234"
      expectReturn:
        arn: this-is-an-arn
        name: test-role
        accountId: "23412341234"
```
  </TabItem>
</Tabs>

## lambda ResourceFunction

<Tabs>
  <TabItem value="lambda" label="lambda.k.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: lambda
  namespace: koreo-examples
spec:
  apiConfig:
    apiVersion: lambda.services.k8s.aws/v1alpha1
    kind: Function
    name: =inputs.name
    namespace: =inputs.namespace

  resource:
    spec:
      name: =inputs.name
      packageType: Image
      role: =inputs.roleArn
      environment:
        variables:
          BUCKET_NAME: =inputs.bucketName
      code:
        imageURI: =inputs.accountId + ".dkr.ecr.us-east-1.amazonaws.com/" + inputs.image

  postconditions:
    - assert: =has(resource.status.ackResourceMetadata.arn)
      retry:
        message: Waiting for Lambda to be created
        delay: 5

  return:
    arn: =resource.status.ackResourceMetadata.arn
    name: =inputs.name
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: lambda-test
spec:
  functionRef:
    kind: ResourceFunction
    name: lambda
  inputs:
    accountId: '789078907890798'
    bucketName: bucket-name
    image: my-lambda-function:latest
    name: test-name
    namespace: test-namespace
    roleArn: test-role-arn

  testCases:
    - label: ok
      expectResource:
        apiVersion: lambda.services.k8s.aws/v1alpha1
        kind: Function
        metadata:
          name: test-name
          namespace: test-namespace
        spec:
          name: test-name
          packageType: Image
          role: test-role-arn
          environment:
            variables:
              BUCKET_NAME: bucket-name
          code:
            imageURI: 789078907890798.dkr.ecr.us-east-1.amazonaws.com/my-lambda-function:latest
    - label: ok-return
      overlayResource:
        status:
          ackResourceMetadata:
            arn: this-is-an-arn
      expectReturn:
        arn: this-is-an-arn
        name: test-name
```
  </TabItem>
</Tabs>

## Example Trigger Workload

<Tabs>
  <TabItem value="hello-lambda-workload" label="hello-lambda-workload.yaml" default>
```yaml
apiVersion: example.koreo.dev/v1
kind: LambdaWorkload
metadata:
  name: hello-lambda-workload
  namespace: koreo-examples
spec:
  image: my-lambda-image:0.0.2
  role: writer
  bucketName: my-unique-bucket-name
  generateBucketSuffix: true
```
  </TabItem>
</Tabs>
