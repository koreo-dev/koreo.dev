---
id: deploying
title: Deploying
sidebar_position: 2
---
### Helm Install

```shell
$ helm repo add koreo https://koreo.dev/helm
$ helm repo update
$ helm install koreo-controller koreo/koreo --set=crds.install=<true,false>
```
