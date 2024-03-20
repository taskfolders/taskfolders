---
type: readme
---

TaskFolders main cli. Index, lint and query folders with markdown and source code. Full documentation available online under the [scanning workflow](https://www.taskfolders.com/docs/workflows/scanning/) and the [getting started]() guide.

## Installation

```sh
npm install -g @taskfolders/tfc
```

## Usage

Clone the [tutorial](https://github.com/taskfolders/tutorial) for some sample files to work with.

```sh
cd tutorial
tfc scan
```

You can convert the untyped frontmatter of all markdown files found.

```sh
tfc scan --convert
```

For more information about the syntax of the official frontmatter visit the [type page](https://www.taskfolders.com/docs/types/markdown/)