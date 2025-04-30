---
id: tooling-installation
title: Tooling Installation
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Koreo Developer Tooling provides a language server and [CLI](../koreo-cli.md).
The language server is used by IDE integrations to facilitate the development
and testing of Koreo resources. The CLI provides additional functionality for
interacting with Koreo.

## Installing Koreo Developer Tooling

Koreo Developer Tooling can be installed with [pip](https://pypi.org/project/pip/).
This will install both the language server and CLI:

```
pip install koreo
```

This will place `koreo-ls` and `koreo` executables in your system path. You can
verify this by running `koreo -h`. Refer to the [CLI documentation](../koreo-cli.md)
for more information on using Koreo CLI.

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

It will assume the `koreo-ls` language server executable is in your system path. You can
override this by going to `Preferences → Settings → Koreo Language Server` or
setting it in your settings.json file.


### IntelliJ IDEA

Install [LSP4IJ](https://plugins.jetbrains.com/plugin/23257-lsp4ij) as a plugin
into your IDE. 

Download the lsp configuration [here](/downloads/lsp4j-koreo.zip).

From within the LSP4IJ plugin, add a new server: 

`New Language Server -> Template -> Import from custom template... -> Select ~/Downloads/lsp4j-koreo.zip`

Adjust the koreo-ls entrypoint as needed.

### NeoVim Lua LSPConfig via LazyDev

Add the following to your Neovim's plugins dir e.g. ~/.config/nvim/lua/plugins/koreo-ls.lua
and add `require 'plugins.koreo-ls'` to your init.lua file.

```lua
return {
  "neovim/nvim-lspconfig",
  event = { "BufReadPre", "BufNewFile" },
  config = function()
    local lspconfig = require("lspconfig")
    local configs = require("lspconfig.configs")

    -- Associate file extensions with the koreo filetype
    vim.filetype.add({
      extension = {
        k = "koreo",
        koreo = "koreo",
        ["k.yaml"] = "koreo",
        ["k.yml"] = "koreo",
      },
    })

    vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
      pattern = { "*.k", "*.koreo", "*.k.yaml", "*.k.yml" },
      callback = function()
        vim.bo.filetype = "koreo"
      end,
    })

    -- Define the koreo_ls language server if not already defined
    if not configs.koreo_ls then
      configs.koreo_ls = {
        default_config = {
          cmd = { "koreo-ls" }, -- ensure it's in your PATH
          filetypes = { "koreo" },
          root_dir = lspconfig.util.root_pattern(".git"),
        },
      }
    end

    lspconfig.koreo_ls.setup({})
  end,
}
```

### NeoVim LSPConfig via VimScript

``` vim
" Ensure filetype is detected for .k, .koreo, .k.yaml, .k.yml
augroup koreo_filetype
  autocmd!
  autocmd BufRead,BufNewFile *.k,*.koreo,*.k.yaml,*.k.yml set filetype=koreo
augroup END

" Use Lua to define the koreo_ls language server in lspconfig
lua << EOF
  local lspconfig = require("lspconfig")
  local configs = require("lspconfig.configs")

  if not configs.koreo_ls then
    configs.koreo_ls = {
      default_config = {
        cmd = { "koreo-ls" },
        filetypes = { "koreo" },
        root_dir = lspconfig.util.root_pattern(".git"),
      },
    }
  end

  lspconfig.koreo_ls.setup({})
EOF
```
