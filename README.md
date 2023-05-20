# CSS Editor

This plugin allows you to edit CSS files in Obsidian. You can create and edit CSS files in your vault as well as in your `.obsidian/snippets/` directory. Works on desktop and mobile!

![](media/create-snippet.gif)

## Installation

You can manually install this using the [BRAT](https://github.com/TfTHacker/obsidian42-brat) Obsidian plugin. Generic installation instructions are available on that plugin's documentation.

## Commands

### Edit CSS Snippet

Opens a suggestion modal to select a CSS snippet in your `.obsidian/snippets/` directory. Upon selection, show editor to edit that CSS file.

### Create CSS Snippet

Opens a prompt to create a CSS snippet in your `.obsidian/snippets/` directory. Upon creation, show editor to edit that CSS file.

---

## Contributing

### Running tests

Tests are run within Obsidian, they cannot be run in a CLI. Running `npm run test` will output a plugin that has one command to run the tests. You can then run that command in Obsidian and the tests results will be output to the console in Obsidian.
