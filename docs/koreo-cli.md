---
id: koreo-cli
title: Koreo CLI
sidebar_position: 8
---

Koreo CLI provides commands for facilitating Koreo development. Currenty, this
contains a small set of commands, but more functionality will be introduced in
the CLI in the near future.

## Installing

Koreo CLI is installed as part of the
[Koreo Developer Tooling](./getting-started/tooling-installation.md#installing-koreo-developer-tooling),
which also includes the language server for IDE integration. This can be
installed with [pip](https://pypi.org/project/pip/):

```
pip install koreo
```

This will place `koreo-ls` and `koreo` executables in your system path. You can
verify this by running `koreo -h`.

:::note
Koreo Developer Tooling requires a minimum of Python 3.13, meaning pip will not
be able to locate the `koreo` package with versions older than this.
:::

## Uninstalling

Uninstall Koreo CLI and language server with:

```
pip uninstall koreo
```

## Commands

Below are the available commands in the Koreo CLI. For additional information,
run `koreo -h` or `koreo <command> -h`.

### koreo apply

`koreo apply` applies .koreo files in a specified directory as YAML to the
Kubernetes cluster via kubectl. 

```
koreo apply .
```

If any of the files have already been previously applied, this will
only apply updated files unless the `--force` flag is provided. Otherwise it
will apply everything in the specified directory.

```
koreo apply --force .
```

The `--namespace` flag will apply the Koreo resources to the specified
namespace, overriding any namespace in the .koreo.

```
koreo apply --namespace my-namespace .
```

### koreo prune

`koreo prune` cleans up unused / unreferenced ValueFunctions and 
ResourceFunctions. Providing the `--dry-run` or `-d` flag, the command will 
list which resources it would delete. The `--namespace`
or `-n` flag specifies the namespace to prune, otherwise all namespaces will 
be pruned.

### koreo inspect

_coming soon_
