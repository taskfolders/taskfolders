export class ShowFolderStatusHandler {
  constructor(public params: { cwd: string }) {}

  async execute() {
    // TODO inbox count
    // TODO logs
    // TODO timestasmp
    console.log(`Showing status `)
  }
}
