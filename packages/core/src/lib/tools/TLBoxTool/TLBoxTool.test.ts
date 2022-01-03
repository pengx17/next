import { TLBoxTool } from './TLBoxTool'
import { TLBoxShape } from '~lib/shapes/TLBoxShape'
import { TLApp } from '~lib/TLApp'

export class BoxTool extends TLBoxTool<TLBoxShape, any> {
  static id = 'box'
  static shortcut = ['r']
  Shape = TLBoxShape
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp()
    const shape = new BoxTool(app, app)
    expect(shape).toBeDefined()
  })
})
