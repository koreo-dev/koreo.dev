---
id: installing
title: Installing
sidebar_position: 1
---
### Language Server

```
pip install -g koreo
```

### VS Code Extension

After you have installed Core and the Language Server, using VS Code is as simple as installing the plugin.

You can install the latest-published version of the Koreo Language Server VS Code extension directly from VS Code. Simply open the extensions panel and search for “koreo-ls”.

It will assume your language server is at `/usr/local/bin/koreo-ls`, if you want to override it at `Preferences → Settings → Koreo Language Server` or setting it in your settings.json file.


### Intellij

Install [LSP4J](https://plugins.jetbrains.com/plugin/23257-lsp4ij) as a plugin into your IDE. 

Download the lsp configuration [here](/downloads/lsp4j-koreo.zip).

From within the LSP4J plugin, add a new server. 

`New Language Server -> Template -> Import from custom template... -> Select ~/Downloads/lsp4j-koreo.zip`.

Adjust the koreo-ls entrypoint as needed.

### CoC

...

### LSP Config

...
