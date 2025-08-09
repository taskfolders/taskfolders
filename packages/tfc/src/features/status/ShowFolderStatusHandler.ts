export class ShowFolderStatusHandler {
  constructor(public params: { cwd: string }) {}

  async execute() {
    console.log(`Showing status `)
  }
}
