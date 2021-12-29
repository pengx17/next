import { TLApp } from '~lib'
import { TLEraseTool } from './TLEraseTool'

describe('A minimal test', () => {
  it('Creates the shape', () => {
    class EraseTool extends TLEraseTool {
      static id = 'erase'
      static shortcut = ['e']
    }
    const app = new TLApp()
    const shape = new EraseTool(app, app)
    expect(shape).toBeDefined()
  })
})
