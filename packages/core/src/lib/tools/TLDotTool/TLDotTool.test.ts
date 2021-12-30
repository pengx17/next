import { TLDotTool } from './TLDotTool'
import { TLDotShape } from '~lib/shapes/TLDotShape'
import { TLApp } from '~lib/TLApp'

describe('A minimal test', () => {
  it('Creates the shape', () => {
    class DotTool extends TLDotTool<TLDotShape> {
      static id = 'dot'
      static shortcut = ['r']
      Shape = TLDotShape
    }
    const app = new TLApp()
    const shape = new DotTool(app, app)
    expect(shape).toBeDefined()
  })
})
