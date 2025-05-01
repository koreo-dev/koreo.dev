---
id: service-account
title: Service Account
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This example shows a Workflow that builds a Kubernetes Service Account, RBAC
Role, and RoleBinding. This Workflow is intended to run as a sub-Workflow but
includes a `crdRef` that allows testing it with a `TriggerDummy` CRD. This
example also demonstrates bundling a complete, self-contained Workflow with its
associated resources in a single .koreo file.

## deployment-service-account.v1 Workflow

<Tabs>
  <TabItem value="k8s-sa" label="k8s-sa.k.yaml" default>
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: koreo-demo
---
apiVersion: koreo.dev/v1beta1
kind: Workflow
metadata:
  name: deployment-service-account.v1
  namespace: koreo-demo
spec:
  # This is used for testing. This workflow is meant to be a sub-workflow.
  crdRef:
    apiGroup: koreo.dev
    version: v1beta1
    kind: TriggerDummy

  steps:
  - label: config
    ref:
      kind: ValueFunction
      name: service-account-config.v1
    inputs:
      metadata: =parent.metadata
      name: =parent.spec.name
      resources: =parent.spec.resources

  - label: service_account
    ref:
      kind: ResourceFunction
      name: deployment-service-account.v1
    inputs:
      metadata: =steps.config.metadata
    state:
      ref: =resource.self_ref()

  - label: role
    ref:
      kind: ResourceFunction
      name: deployment-service-account-role.v1
    inputs:
      metadata: =steps.config.metadata
      resources: =steps.config.resources

  - label: binding
    ref:
      kind: ResourceFunction
      name: deployment-service-account-binding.v1
    inputs:
      metadata: =steps.config.metadata
      service_account: =steps.service_account
      role: =steps.role
---
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: service-account-config.v1
  namespace: koreo-demo
spec:
  locals:
    service_account: =inputs.name + "-workload"

  return:
    metadata:
      name: =locals.service_account
      namespace: =inputs.metadata.namespace
    resources: =inputs.resources
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: service-account-config.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ValueFunction
    name: service-account-config.v1

  inputs:
    metadata:
      namespace: test-namespace
    name: test-account
    resources:
      - kind: secret
        name: test-secret
      - kind: configmap
        name: test-configmap

  testCases:
   - expectReturn:
       metadata:
         name: test-account-workload
         namespace: test-namespace
       resources:
       - kind: secret
         name: test-secret
       - kind: configmap
         name: test-configmap
---
apiVersion: koreo.dev/v1beta1
kind: ResourceTemplate
metadata:
  name: deployment-service-account.v1
  namespace: koreo-demo
spec:
  template:
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      labels:
        workloads.realkinetic.com/auto-sa: "true"
---
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: deployment-service-account.v1
  namespace: koreo-demo
spec:
  apiConfig:
    apiVersion: v1
    kind: ServiceAccount

    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  resourceTemplateRef:
      name: deployment-service-account.v1

  create:
    delay: 10

  update:
    recreate:
      delay: 10

  return:
    ref: =resource.self_ref()
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: deployment-service-account.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: deployment-service-account.v1

  inputs:
    metadata:
      namespace: test-namespace
      name: test-account

  testCases:
  - expectResource:
      apiVersion: v1
      kind: ServiceAccount
      metadata:
        labels:
          workloads.realkinetic.com/auto-sa: 'true'
        name: test-account
        namespace: test-namespace
  - expectReturn:
      ref:
        apiVersion: v1
        kind: ServiceAccount
        name: test-account
        namespace: test-namespace
---
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: deployment-service-account-role.v1
  namespace: koreo-demo
spec:
  apiConfig:
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role

    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  locals:
    rules: |
      =inputs.resources.map(
          resource,
          {'apiGroups': [resource.apiGroup],
           'resources': [resource.kind.lower() + "s"],
           'verbs': ["get"],
           'resourceNames': [resource.name]
          }
      )

  resource:
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    rules: = locals.rules

  return:
    ref: =resource.self_ref()
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: deployment-service-account-role.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: deployment-service-account-role.v1

  inputs:
    metadata:
      name: test-workload
      namespace: test-namespace
    resources:
      - apiGroup: v1
        kind: Secret
        name: contact-list-api-key

  testCases:
  - expectResource:
      apiVersion: rbac.authorization.k8s.io/v1
      kind: Role
      metadata:
        name: test-workload
        namespace: test-namespace
      rules:
      - apiGroups: [v1]
        resourceNames: [contact-list-api-key]
        resources: [secrets]
        verbs: [get]
---
apiVersion: koreo.dev/v1beta1
kind: ResourceFunction
metadata:
  name: deployment-service-account-binding.v1
  namespace: koreo-demo
spec:
  apiConfig:
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding

    name: =inputs.metadata.name
    namespace: =inputs.metadata.namespace

  locals:
    sa_ref:
      kind: ServiceAccount
      name: =inputs.service_account.ref.name
    role_group_ref: =inputs.role.ref.group_ref()

  resource:
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    subjects: [=locals.sa_ref]
    roleRef:
      apiGroup: =locals.role_group_ref.apiGroup
      kind: =locals.role_group_ref.kind
      name: =locals.role_group_ref.name

  return:
    ref: =resource.self_ref()
---
apiVersion: koreo.dev/v1beta1
kind: FunctionTest
metadata:
  name: deployment-service-account-binding.v1
  namespace: koreo-demo
spec:
  functionRef:
    kind: ResourceFunction
    name: deployment-service-account-binding.v1

  inputs:
    metadata:
      name: test-workload
      namespace: test-namespace
    service_account:
      ref:
        apiVersion: v1
        kind: ServiceAccount
        name: contect-list-sa
        namespace: koreo-demo
    role:
      ref:
        apiGroup: rbac.authorization.k8s.io
        kind: Role
        name: secret-contact-list-api-key
        namespace: koreo-demo

  testCases:
  - expectResource:
      apiVersion: rbac.authorization.k8s.io/v1
      kind: RoleBinding
      metadata:
        name: test-workload
        namespace: test-namespace
      roleRef:
        apiGroup: rbac.authorization.k8s.io
        kind: Role
        name: secret-contact-list-api-key
      subjects:
      - kind: ServiceAccount
        name: contect-list-sa
```
  </TabItem>
  <TabItem value="triggerdummy-crd" label="triggerdummy-crd.yaml">
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: triggerdummies.koreo.dev
spec:
  scope: Namespaced
  group: koreo.dev
  names:
    kind: TriggerDummy
    plural: triggerdummies
    singular: triggerdummy
  versions:
    - name: v1beta1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              x-kubernetes-preserve-unknown-fields: true
            status:
              x-kubernetes-preserve-unknown-fields: true
              type: object
```
  </TabItem>
</Tabs>

## Example TriggerDummy

<Tabs>
  <TabItem value="triggerdummy" label="triggerdummy.yaml" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: TriggerDummy
metadata:
  name: test-dummy
  namespace: koreo-demo
spec:
  name: test-dummy
  resources:
    - apiGroup: v1
      kind: Secret
      name: contact-list-api-key
```
  </TabItem>
</Tabs>

