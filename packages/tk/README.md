[![GitHub Actions](https://github.com/taskfolders/taskfolders/actions/workflows/task-runner--build.yml/badge.svg)](https://github.com/taskfolders/taskfolders/actions/workflows/task-runner--build.yml)

Run development scripts scattered across multiple locations in your project. 

As your project grows it is more likely that you will have to introduce new [locations for your scripts](https://www.taskfolders.com/blog/from-scripting-hell-to-developer-heaven/). This is where **tk`` helps finding them in:

- ./bin/* 
- ./tasks/{name}/* 
- package.json from npm 
- index.md from TaskFolders 
- Past the current package (in monorepos) 

Even as a replacement of `npm run` it will help you to:

- Accept partial name matches
- Interactive task selection
- Combine tasks from all project files
- Shell renaming conventions



## Quick start

Install the package:

``` 
npm install -g @taskfolders/tk
``` 

Now just type `tk` whenever you have a `package.json` file.

For a list of all features visit the [documentation page](https://www.taskfolders.com/docs/workflows/scripts/).