import { BoxShape } from '~lib/_TLApp/_shapes/TLBoxShape/TLBoxShape.test'

export class TLTestEditableBox extends BoxShape {
  static id = 'editable-box'
  canEdit = true
}
