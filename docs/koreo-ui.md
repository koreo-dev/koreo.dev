---
id: koreo-ui
title: Koreo UI
sidebar_position: 8
---

[Koreo UI](https://github.com/koreo-dev/koreo-ui) is a lightweight, read-only
application that provides a visual representation of your Koreo
[Workflows](./workflow.md) and other resources. This can be useful for
visualizing complex Workflows in order to understand interactions as well as
visualizing specific Workflow _instances_ and their respective managed
resources. It also provides a way to view [ResourceTemplates](./resource-template.md).

## Installing

The recommended way to install Koreo UI is with the Koreo Helm chart. By
default, Koreo UI is enabled as part of the Koreo controller installation.
Refer to the [Controller Installation](./getting-started/controller-installation.md#helm)
documentation for steps to install.

By default, Koreo UI is installed and exposed with a Service. You can connect
to it using the following:

```
kubectl port-forward svc/koreo-controller-ui 8080:8080
```

## Viewing Workflows

The home page of Koreo UI displays a list of Workflows by namespace. This list
can be filtered by Name, Parent API Group, Parent Kind, Parent Version, Steps,
and Instances.

<div className="docImage-100">
![Koreo UI Workflows](/img/docs/koreo-ui/koreo-ui-workflows.png)
</div>

"Parent" in this case refers to the Kubernetes Resource Model (KRM) that
triggers the Workflow. `n/a` indicates the Workflow does not have a parent
specified, meaning it is used as a sub-Workflow instead.

"Steps" refers to the number of steps the Workflow contains.

"Instances" refers to the number of instances of the Workflow, i.e. the number
of parent resources which exist that trigger the Workflow.

Workflows with instances can be expanded by clicking on them in the list. This
will display a nested table containing information about each instance, such as
the parent resource's status, when it was created, the resource generation, the
number of resources it manages, and the YAML definition for the instance.

### Viewing a Workflow Graph

Clicking into a Workflow will show a visual graph representation of it. This
shows the dependencies between steps in the Workflow. Toggling the "Expanded"
checkbox will expand aggregate nodes like Sub-Workflows and RefSwitches which
are comprised of multiple nested nodes.

<div className="docImage-100">
![Koreo UI Workflow Example](/img/docs/koreo-ui/koreo-ui-workflow-example.png)
</div>

A specific _instance_ of a Workflow can be viewed by selecting the instance
from the dropdown. The instance graph will include nodes for managed resources,
shown in purple, with dashed edges connecting back to the Workflow steps that
manage them. Resources that are only _read_ are shown with a white background
and purple border.

<div className="docImage-100">
![Koreo UI Workflow Instance Example](/img/docs/koreo-ui/koreo-ui-workflow-instance-example.png)
</div>

## Viewing ResourceTemplates

The Resource Templates page shows a list of ResourceTemplates by namespace.
This list can be filtered by Name, API Version, and Kind.

API Version and Kind refer to the KRM for which the ResourceTemplate
corresponds to.

<div className="docImage-100">
![Koreo UI ResourceTemplates](/img/docs/koreo-ui/koreo-ui-resource-templates.png)
</div>

Clicking into a ResourceTemplate will show the metadata for it as well as the
[`template`](./resource-template.md#spec) YAML definition.

<div className="docImage-100">
![Koreo UI ResourceTemplate Example](/img/docs/koreo-ui/koreo-ui-resource-template-example.png)
</div>
