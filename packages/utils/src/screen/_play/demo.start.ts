import { ScreenPrinter } from '../ScreenPrinter'

function main() {
  let scr = new ScreenPrinter()
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
