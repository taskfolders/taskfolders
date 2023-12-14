import { execSync } from 'child_process'

export function isCommandAvailable(command: string) {
  try {
    // Attempt to execute the command with a non-zero timeout
    execSync(`command -v ${command} > /dev/null 2>&1`, { timeout: 1000 })
    return true // If successful, the command is available
  } catch (error) {
    return false // If an error occurs, the command is not available
  }
}
