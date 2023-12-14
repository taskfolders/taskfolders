export interface PackageJsonType {
  name: string
  version: string
  keywords: string[]
  private?: boolean
  type?: 'module'
  workspaces?: string[]
  engines?: {
    node?
  }
  scripts?: Record<string, string>
}
