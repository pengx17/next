import { BoxShape } from '~lib/refactor/_shapes/TLBoxShape/TLBoxShape.test'

export class TLTestEditableBox extends BoxShape {
  static type = 'editable-box'

  canEdit = true
}
