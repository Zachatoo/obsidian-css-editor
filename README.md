![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22css-editor%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
[![Test](https://github.com/Zachatoo/obsidian-css-editor/actions/workflows/test.yaml/badge.svg)](https://github.com/Zachatoo/obsidian-css-editor/actions/workflows/test.yaml)

# CSS Editor

This plugin allows you to edit CSS files in the `.obsidian/snippets/` directory.

## Features

- Create, edit, rename, and delete CSS snippets
- Syntax highlighting and code completion
- Works on desktop and mobile
- Basic VIM support

## Installation

Recommended to install from the Obsidian community store.

You can manually install this using the [BRAT](https://github.com/TfTHacker/obsidian42-brat) Obsidian plugin. Generic installation instructions are available on that plugin's documentation.

## Commands

### Create CSS snippet

Opens a prompt to create a CSS snippet in your `.obsidian/snippets/` directory. Upon creation, show editor to edit that CSS file.

### Open quick switcher

Opens a suggestion modal to create, edit, or delete a CSS snippet. Has similar functionality to the core quick switcher where holding down a secondary key will modify the action that will take place.

- Press <kbd>Enter</kbd> to open the selected CSS snippet, or if no suggestions are available, create a new CSS snippet.
- Press <kbd>⌘</kbd><kbd>Enter</kbd> to open the selected CSS snippet in a new tab.
- Press <kbd>Shift</kbd><kbd>Enter</kbd> to create a new CSS snippet.
- Press <kbd>Tab</kbd> to toggle the enable/disable state of the selected CSS snippet.
- Press <kbd>⌘</kbd><kbd>Delete</kbd> to delete the selected CSS snippet.

### Delete CSS snippet

Deletes the currently active CSS snippet file. Only available when viewing a CSS snippet file.

### Toggle the enabled/disabled state of CSS snippet

If the currently active CSS snippet file is enabled then disable it, and vice versa. Only available when viewing a CSS snippet file. Note that you can also toggle this state directly from the quick switcher using the <kbd>Tab</kbd> key.

---

## Contributing

### Releasing

Releasing a new version involves the following steps:

1. Update `minAppVersion` in `manifest.json` if applicable.
1. Run `npm version patch`, `npm version minor`, or `npm version major`.
    - This command will bump the version in the `manifest.json`, `package.json`, and `package-lock.json` files, add a new entry in `versions.json`, and create a git tag.
1. Push the changes and tag. This will trigger a GitHub action to create the release.

### Running tests

Tests are run using [wdio-obsidian-service](https://jesse-r-s-hines.github.io/wdio-obsidian-service/index.html). Tests are run automatically during PR checks and before releasing. You can also run tests manually with `npm test`.
