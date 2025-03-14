---
id: quick-start
title: Quick Start
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

There are just three core concepts involved in building automated workflows in
Koreo: [Workflows](../workflow.md), [ValueFunctions](../value-function.md), and
[ResourceFunctions](../resource-function.md). This Quick Start guide will walk
you through building, deploying, and running your first Workflow. As part of
this, we will also see how [FunctionTests](../function-test.md) act as an
integral component for building Functions by providing rapid feedback through
unit testing.

## Hello Koreo

We will build a Workflow that will do a very simple task: "stamp" every
Kubernetes Deployment with a `hello` label whose value will be the Deployment
name. While it's a contrived example, it will demonstrate some of the key
aspects of Koreo.

### Writing a ValueFunction

First, we will write a ValueFunction called `get-labels` that returns the
labels we want to stamp on the Deployment. Specifically, this is just the
`hello` label which we will set to the `name` on the triggering resource's
metadata. We'll also include an accompanying FunctionTest that validates the
expected behavior.

<Tabs>
  <TabItem value="get-labels" label="get-labels.koreo" default>
```yaml
apiVersion: koreo.dev/v1beta1
kind: ValueFunction
metadata:
  name: get-labels
spec:
  return:
    labels:
      hello: =inputs.name
```
  </TabItem>
  <TabItem value="get-labels-test" label="get-labels-test.koreo">
```yaml
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

:::tip
While we have placed the ValueFunction and corresponding FunctionTest in
separate files in the example above, note that a common practice is to place
Functions and FunctionTests in the _same_ file separated by YAML document
separators (`---`).
:::

This ValueFunction will be used as the first step in our Workflow. It uses a
Koreo Expression, `=inputs.name`, to reference the resource name which is
passed in as an input to the Function. Our Function simply returns a `labels`
object with the `hello` label set.

ValueFunctions are _pure_ functions, meaning they are side-effect free. They
provide a way to validate data and build or reshape data structures to be
consumed by other Functions. We will see in a later example how ValueFunctions
can be used to enforce preconditions. While they tend to be simple in nature,
ValueFunctions provide a composable and reusable primitive for common Workflow
tasks that ends up being quite powerful.

The accompanying FunctionTest demonstrates how we can unit test our
ValueFunction. In it, we specify the Function under test, the inputs to it, and
a test case that validates the expected return values. There's not much to this
one because `get-labels` is such a simple Function, but we will look at more
sophisticated FunctionTests later. The Koreo Tooling will run these tests
automatically as you are writing your Koreo components. Try changing `hello` to
a different value in `expectReturn` and see how the test breaks.

Congratulations, you've written your first Koreo ValueFunction and
FunctionTest! Go ahead and apply it to the cluster:

```
kubectl apply -f get-labels.koreo
```

Unfortunately, on its own this Function does nothing, but in a
moment we'll see how it can be used by a Workflow.

### Writing a ResourceFunction

Next, we'll build the Function that will add the `hello` label to a Deployment.
If you recall, ValueFunctions are pure functions, and adding a label to a
Kubernetes resource is very much a side effect. Enter _ResourceFunctions_.
ResourceFunctions provide a way to interact with Kubernetes APIs by interfacing
with resources. In our case, we will be patching existing Deployment resources.

<Tabs>
  <TabItem value="set-deployment-labels" label="set-deployment-labels.koreo" default>
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
```
  </TabItem>
  <TabItem value="set-deployment-labels-test" label="set-deployment-labels-test.koreo">
```yaml
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

The `set-deployment-labels` ResourceFunction updates a Deployment by adding the
passed in labels to the resource's metadata. First, we specify the resource we
want to interface with using `apiConfig`. This configures the resource
`apiVersion`, `kind`, `name`, and `namespace`. Notice that `name` and
`namespace` are set to `=inputs.name` and `=inputs.namespace`, respectively.
These are Koreo Expressions that evaluate to the `name` and `namespace` inputs
passed into the Function. Additionally, we set `owned` to `false`, indicating
that we do not want Koreo to add the parent Deployment to the resource's
`metadata.ownerReferences`. This would be a circular reference since the parent
Deployment is also the resource we are updating.

We specify the update to the resource we want to apply in `resource`.
Specifically, we are setting the labels on the Deployment's metadata.

Lastly, we disable `create`, indicating that we do not want the resource to be
created in the event that it's missing. Instead, we are only interested in
updating existing Deployments.

:::note
By default, the definition provided to `resource` acts as a _patch_, meaning
Kubernetes will merge the values when updating the resource. For instance, if
the Deployment has existing labels, these will be preserved when the `hello`
label is added.
:::

The corresponding FunctionTest shows how we can validate the behavior of
`set-deployment-labels`. As before, we specify our `functionRef` and `inputs`.
What's different this time is we also specify a `currentResource`. This lets us
simulate the current state of the resource in the cluster. We don't need to
include a full Deployment definition but rather just the parts relevant to our
ResourceFunction. Our test case then validates the update to be applied to the
resource with `expectResource`, in particular asserting that the expected
labels are present.

Apply `set-deployment-labels` to the cluster:

```
kubectl apply -f set-deployment-labels.koreo
```

Our ResourceFunction is now ready to be used.

### Writing a Workflow

With our ValueFunction and ResourceFunction in place, we're now ready to put
everything together into a Workflow. Workflows implement multi-step processes
by orchestrating ValueFunctions, ResourceFunctions, and other sub-Workflows.
The Workflow we're building is quite simple: read the metadata from a
Deployment, compute a label to be applied, and update the Deployment with the
new label.

<Tabs>
  <TabItem value="hello-koreo" label="hello-koreo.koreo" default>
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

Let's walk through the different parts. First, we specify the parent resource
with `crdRef`. The parent resource is what acts as a "trigger" for the
Workflow. While it's called `crdRef`, this can in fact be _any_ resource kind.
Though conceptually the parent resource acts as a trigger, in practice a
Workflow will run repeatedly as part of Kubernetes' reconciliation process.
This is known as a _control loop_. By default, the reconcile process will run
on create, update, and delete events pertaining to the parent resource.
ResourceFunctions can [configure the behavior](../resource-function.md#flexible-update-handling)
for these different events.

:::warning
It's important to take care when using resources managed by another controller
because there can be unintended interactions in some situations. As a result,
it's encouraged to create your own CRDs for more advanced use cases.
:::

Next, we specify our Workflow steps. The first step executes our `get-labels`
ValueFunction. We pass in the Deployment name with the Koreo Expression
`=parent.metadata.name` where `=parent` references the Deployment that
triggered our Workflow. The next step then invokes the `set-deployment-labels`
ResourceFunction, taking in the `name` and `namespace` from the parent
resource's metadata and the `labels` from the previous step's output.

That's it. Now we can deploy our Workflow and test it out.

```
kubectl apply -f hello-koreo.koreo
```

In the Koreo UI, this Workflow looks like the following:

<div className="docImage-100">
![hello-koreo Workflow](/img/docs/hello-koreo-workflow.png)
</div>

### Running the Workflow

To run the Workflow, we can apply a new Deployment to the cluster:

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

```
kubectl apply -f deployment.yaml
```

This will trigger our `hello-koreo` Workflow to run, which will apply the
`hello` label to the Deployment.

```
kubectl get deployment nginx-deployment -o yaml
```

We've built a simple Workflow comprised of a ValueFunction and
ResourceFunction. We also saw how we can unit test Functions with FunctionTest.
In the next example, we'll build on this by creating a slightly more
sophisticated Workflow that does something a little more useful. It will
automatically create a Service for a Deployment.

## Hello Service
