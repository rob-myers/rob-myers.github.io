## Improve Monaco JSX Syntax Highlighting

Basically:
- use a worker which parses JSX then applies decorations to each node i.e. use a css class derived from the name of the node.
- the examples seem to be what we're looking for i.e. better colours for JSX component tags and their attribute names

> https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf

> https://github.com/cancerberoSgx/jsx-alone/blob/master/jsx-explorer/HOWTO_JSX_MONACO.md


## Can `react-refresh` run in the browser?

## Salvage bash implementation

- can keep `xterm` + tty
- vastly simplified language:
  - simple commands without redirects
  - simple parameter expansion
  - pipes, &&, ||
- flat filesystem with regular inodes only:
  - binary (e.g. image)
  - script (i.e. javascript function)
  - text (i.e. string)
- designed to be fast

But why do we need it?
