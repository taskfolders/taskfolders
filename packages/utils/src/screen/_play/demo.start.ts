import { MemoryScreenPrinter } from '../MemoryScreenPrinter.js'

function main() {
  let scr = new MemoryScreenPrinter()
  scr //
    .log('one')
    .indent()
    .log('two')
    .indent()
    .log('three')
    .log('back')
  scr.log().log('again')
  return scr.text()
}

main()
