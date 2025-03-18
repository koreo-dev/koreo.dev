---
id: controller-installation
title: Controller Installation
sidebar_position: 1
---

We recommend using [Helm](https://helm.sh/) to manage the installation of the
Koreo controller.

## Helm

### Installing

```shell
helm repo add koreo https://koreo.dev/helm
helm repo update
helm install koreo-controller koreo/koreo --set=crds.install=<true,false>

# By default the user interface is installed and exposed with a service, you can connect to it using the following
kubectl port-forward svc/koreo-controller-ui 8080:8080
```

### Uninstalling

```shell
helm uninstall koreo-controller
```
