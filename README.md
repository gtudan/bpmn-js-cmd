# BPMN-js-cmd

A command line utility for rendering BPMN-Diagrams.

## Installing

Install with NPM:

```sh 
npm install -g bpmn-js-cmd
```

## Usage

```
Usage: bpmn-js [options] <file>

Positionals:
  file  a BPMN-XML process definition file

Options:
  -t, --type    file type of the new diagram                     [choices: "svg", "png", "jpeg", "pdf"] [default: "svg"]
  -o, --output  output path for the rendered diagram.                                          [default: <input>.<type>]
  -w, --width   width of the diagram (does not apply to svg)                                    [number] [default: 1024]
  -h, --height  height of the diagram (does not apply to svg)                                    [number] [default: 768]
  --version     Show version number                                                                            [boolean]
  --help        Show help                                                                                      [boolean]
```

## Credits

This project uses [BPMN-js](https://bpmn.io/toolkit/bpmn-js/) for rendering. 

If you render the diagram in any other format than SVG you will notice the green BPMN.io logo.
It is inserted by BPMN-js and is not related to BPMN-JS.cli.
