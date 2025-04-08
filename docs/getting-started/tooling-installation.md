---
id: tooling-installation
title: Tooling Installation
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Koreo Developer Tooling provides a language server and CLI. The language server
is used by IDE integrations to facilitate the development and testing of Koreo
resources. The CLI provides additional functionality for interacting with
Koreo.

## Installing Koreo Developer Tooling

Koreo Developer Tooling can be installed with [pip](https://pypi.org/project/pip/).
This will install both the language server and CLI:

```
pip install koreo
```

This will place `koreo-ls` and `koreo-inspector` executables in your system
path.

:::note
Koreo Developer Tooling requires a minimum of Python 3.13, meaning pip will not
be able to locate the `koreo` package with versions older than this.
:::

## Installing IDE Integrations

To actually use Koreo Developer Tooling's language server, you need an IDE
integration that connects to it. Currently, Koreo provides integrations for VS
Code, IntelliJ IDEA, and Vim/Neovim. See the steps below for installing the
respective integrations.

### VS Code

After you have installed Koreo Developer Tooling, using VS Code is as simple as
installing the [koreo-ls extension](https://marketplace.visualstudio.com/items?itemName=RealKineticLLC.koreo-ls).

You can install the latest-published version of the Koreo Language Server VS
Code extension directly from VS Code. Simply open the extensions panel and
search for “koreo-ls”.

It will assume your language server is at `/usr/local/bin/koreo-ls`. You can
override this by going to `Preferences → Settings → Koreo Language Server` or
setting it in your settings.json file.


### IntelliJ IDEA

Install [LSP4IJ](https://plugins.jetbrains.com/plugin/23257-lsp4ij) as a plugin
into your IDE. 

Download the lsp configuration [here](/downloads/lsp4j-koreo.zip).

From within the LSP4IJ plugin, add a new server: 

`New Language Server -> Template -> Import from custom template... -> Select ~/Downloads/lsp4j-koreo.zip`

Adjust the koreo-ls entrypoint as needed.

### Vim/Neovim

#### CoC

Add the following to your Vim/Neovim configuration:

<Tabs>
  <TabItem value="vimscript" label="Vimscript" default>
```
autocmd BufNewFile,BufRead *.koreo set filetype=koreo
```
  </TabItem>
  <TabItem value="lua" label="Lua">
```lua
vim.api.nvim_create_autocmd({"BufNewFile", "BufRead"}, {
  pattern = "*.koreo",
  command = "set filetype=koreo",
})
```
  </TabItem>
</Tabs>

Next, add the following to your coc-settings.json:

```json
"languageserver": {
  "koreo-ls": {
    "command": "koreo-ls",
    "filetypes": ["koreo"],
    "root_dir": ["*.git"],
    "settings": {
      "semanticTokens.filetypes": ["*"]
    }
  }
}
```

Ensure `command` points to the appropriate `koreo-ls` executable.

#### LSP

Add the following to your Neovim's init.lua:

```lua
vim.filetype.add {
  extension = {
    koreo = 'koreo',
  },
}

vim.api.nvim_create_autocmd('FileType', {
  pattern = 'koreo',
  callback = function()
    vim.opt_local.expandtab = true
    vim.opt_local.shiftwidth = 2
    vim.opt_local.tabstop = 2
    vim.opt_local.softtabstop = 2
    vim.opt_local.autoindent = true
    vim.opt_local.smartindent = true
    vim.lsp.start {
      name = 'koreo_ls',
      cmd = { 'koreo-ls' }, -- Ensure this command is correct and accessible
      root_dir = vim.fn.getcwd(),
    }
  end,
})

vim.api.nvim_create_autocmd('BufEnter', {
  pattern = '*.koreo',
  callback = function()
    local clients = vim.lsp.get_clients { bufnr = vim.api.nvim_get_current_buf() }
    for _, client in ipairs(clients) do
      if client.server_capabilities.inlayHintProvider then
        vim.lsp.inlay_hint.enable(true)
      end
    end
  end,
})
```
