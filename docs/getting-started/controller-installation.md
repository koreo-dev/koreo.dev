---
id: controller-installation
title: Controller Installation
sidebar_position: 1
---

We recommend using [Helm](https://helm.sh/) to manage the installation of the
Koreo Controller.

## Helm

### Installing

```shell
helm repo add koreo https://koreo.dev/helm
helm repo update
helm install koreo-controller koreo/koreo --set=crds.install=<true,false>
```
By default, the user interface is installed and exposed with a service. You can
connect to it using the following:

```shell
kubectl port-forward svc/koreo-controller-ui 8080:8080
```

:::info[Role-Based Access Control]
The Helm chart provides Roles with default required permissions for both Koreo
[Controller](https://github.com/koreo-dev/koreo-helm/blob/main/charts/koreo/templates/controller-role.yaml)
and [UI](https://github.com/koreo-dev/koreo-helm/blob/main/charts/koreo/templates/ui-role.yaml). 
However, additional permissions need to be provided to allow these to access
other resources in the cluster. These can be configured with `controller.rbac`
and `ui.rbac` in the values.yaml.
:::

### Uninstalling

```shell
helm uninstall koreo-controller
```
