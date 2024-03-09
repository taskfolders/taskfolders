// import { FolderScript } from '@taskfolders/scripts/FolderScript';
import { ScriptApp } from '@taskfolders/task-runner'
//import { FolderScript } from '../../src'

console.log('Hello from main file')

export default ScriptApp.create({
  data: true,
  async execute() {
    console.log('Hello from running app')
  },
})
