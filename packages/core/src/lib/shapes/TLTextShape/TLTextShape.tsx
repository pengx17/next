import { makeObservable } from 'mobx'
import { TLBoxShape, TLBoxShapeProps } from '../TLBoxShape'

export interface TLTextShapeProps extends TLBoxShapeProps {
  text: string
  autosize: boolean
}

export class TLTextShape<P extends TLTextShapeProps = TLTextShapeProps, M = any> extends TLBoxShape<
  P,
  M
> {
  constructor(props = {} as Partial<P>) {
    super(props)
    makeObservable(this)
  }

  isEditable = true

  static id = 'text'

  static defaultProps: TLTextShapeProps = {
    id: 'text',
    type: 'text',
    parentId: 'page',
    autosize: true,
    point: [0, 0],
    size: [16, 32],
    text: '',
  }
}
