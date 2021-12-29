import { TLApp, TLLineShape, TLPolylineShape } from '~lib'
import { TLLineTool } from './TLLineTool'

describe('A minimal test', () => {
  it('Creates the shape', () => {
    class LineTool extends TLLineTool<TLLineShape> {
      static id = 'line'
      static shortcut = ['l']
      Shape = TLPolylineShape
    }
    const app = new TLApp()
    const shape = new LineTool(app, app)
    expect(shape).toBeDefined()
  })
})
