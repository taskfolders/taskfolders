import * as Path from 'node:path'
import { DiskIndexRepository } from '../disk-index/DiskIndexRepository.js'
import { Logger } from '@taskfolders/utils/logger'

import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { WorkspaceRepo } from '../../../_draft/WorkspaceRepo.js'

export interface ScannerEngineResult {
  engine: string
}

export abstract class BaseFileScanner {
  log: Logger
  options: { convert }
  disk: DiskIndexRepository
  workspace: WorkspaceRepo
  abstract code: string

  constructor(
    kv: Pick<BaseFileScanner, 'disk' | 'log' | 'options'> & { workspace },
  ) {
    this.disk = kv.disk
    this.log = kv.log
    this.options = kv.options
    this.workspace = kv.workspace
  }

  abstract execute(kv: {
    file: ActiveFile
  }): Promise<ScannerEngineResult | void>
}
