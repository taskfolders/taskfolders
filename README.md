# Taskfolders

This repository is a monorepo containing several open-source projects under the [TaskFolders](https://taskfolders.com) umbrella. Here, you'll find tools and libraries to enhance your development workflow.

## Project Breakdown

### packages/utils

A collection of general-purpose utilities that might come in handy for various development tasks. It's designed with developer convenience in mind, offering functionalities you might miss in standard libraries. 

**Important Note:** Due to its dynamic nature and inclusion of potentially breaking changes, `@taskfolder/utils` prioritizes rapid iteration and experimentation. It is the generic bag of solutions I wish to have when working any project I work.

### packages/sdk

This package provides a more stable and production-ready API for TaskFolders users. It offers a consistent interface for developers seeking reliable tools to integrate or extend tasks related with the project into their projects.

### Other apps

This monorepo also houses individual applications. These applications will remain within this repository until they reach a point where dedicated maintenance and independent release cycles become necessary (e.g., dedicated release page, significant user base). 

## Getting Started

Each individual application within the monorepo might have additional setup instructions. Refer to the application's specific documentation within the app directory for further details.

### Environment variables

These are the environment variables that can impact your project

|Name | Description 
|-----|-----------
|JS_ENGINE | Let apps know which node to use. By default [Bun](https://bun.sh/)
|LOG_LEVEL | Control the verbosity of the logger
| DEBUG   | Code words to debug modules
|TASKFOLDERS_SHELL_LINKS | Enable shell links
TASKFOLDERS_SHELL_LINKS_EDITOR | Select the link protocol to use: vscode, sublime, webstorm, mscode
TASKFOLDERS_LOGGER_DEV | Enable the .dev logs
TASKFOLDERS_LOGGER_LINKS_LEVEL | {TODO}

## Contributing

We welcome contributions to all projects within this monorepo! Please refer to the CONTRIBUTING.md file for guidelines and details on how to submit pull requests.

## Staying Updated

Follow this repository on GitHub to receive notifications for updates and new releases.

We hope you find the TaskFolders monorepo valuable! Feel free to reach out if you have any questions or suggestions.


