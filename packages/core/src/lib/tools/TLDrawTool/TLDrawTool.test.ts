import { TLApp, TLDrawShape } from '~lib'
import { TLDrawTool } from './TLDrawTool'

describe('A minimal test', () => {
  it('Creates the shape', () => {
    class DrawTool extends TLDrawTool<TLDrawShape> {
      static id = 'draw'
      static shortcut = ['d']
      Shape = TLDrawShape
    }
    const app = new TLApp()
    const shape = new DrawTool(app, app)
    expect(shape).toBeDefined()
  })
})
