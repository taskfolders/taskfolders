import { $log } from '@taskfolders/utils/logger'
import { ScriptApp } from '@taskfolders/tk'

export default ScriptApp.create(() => {
  $log.info('hello world')
  throw Error('boom')
})
