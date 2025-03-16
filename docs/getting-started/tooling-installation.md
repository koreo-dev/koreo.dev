---
id: tooling-installation
title: Tooling Installation
sidebar_position: 2
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

```
autocmd BufNewFile,BufRead *.koreo set filetype=koreo
```

Add this following to your coc-settings.

``` json
"koreo-ls": {
  "command": "koreo-ls",
  "filetypes": ["koreo"],
  "root_dir": ["*.git"],
  "settings": {
    "semanticTokens.filetypes": ["*"]
  }
}
```

### LSP Config

Add the following to your init.lua. 

``` lua
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
