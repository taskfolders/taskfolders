import './register.start.js'

import { Logger } from '../Logger.js'

global.$log = new Logger()
global.$dev = global.$log.dev.bind(global.$log)
