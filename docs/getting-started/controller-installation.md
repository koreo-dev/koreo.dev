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
```

### Uninstalling

```shell
helm uninstall koreo-controller
```
