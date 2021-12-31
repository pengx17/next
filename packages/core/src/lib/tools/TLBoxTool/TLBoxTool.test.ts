import { TLBoxTool } from './TLBoxTool'
import { TLBoxShape } from '~lib/shapes/TLBoxShape'
import { TLApp } from '~lib/TLApp'

describe('A minimal test', () => {
  it('Creates the shape', () => {
    class BoxTool extends TLBoxTool<TLBoxShape> {
      static id = 'box'
      static shortcut = ['r']
      Shape = TLBoxShape
    }
    const app = new TLApp()
    const shape = new BoxTool(app, app)
    expect(shape).toBeDefined()
  })
})
