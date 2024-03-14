import * as Path from 'node:path'
import { DiskIndexRepository } from '../disk-index/DiskIndexRepository.js'
import { Logger } from '@taskfolders/utils/logger'

import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'

export interface ScannerEngineResult {
  engine: string
}

export abstract class BaseFileScanner {
  log: Logger
  options: { convert }
  disk: DiskIndexRepository

  constructor(kv: Pick<BaseFileScanner, 'disk' | 'log' | 'options'>) {
    this.disk = kv.disk
    this.log = kv.log
    this.options = kv.options
  }

  abstract execute(kv: {
    file: ActiveFile
  }): Promise<ScannerEngineResult | void>
}
