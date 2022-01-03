import { TLDotTool } from './TLDotTool'
import { TLDotShape } from '~lib/shapes/TLDotShape'
import { TLApp } from '~lib/TLApp'
import { TLTestApp } from '~test/TLTestApp'

export class DotTool extends TLDotTool<TLDotShape, any> {
  static id = 'dot'
  static shortcut = ['d']
  Shape = TLDotShape
}

describe('A minimal test', () => {
  it('Creates the tool', () => {
    const app = new TLApp()
    const tool = new DotTool(app, app)
    expect(tool).toBeDefined()
  })
  it('Registers the tool with the app', () => {
    const app = new TLApp()
    app.registerTools([DotTool])
    expect(app.children.get('dot')).toBeDefined()
  })
  it('Selects the tool', () => {
    const app = new TLApp().registerTools([DotTool]).selectTool('dot')
    expect(app.isIn('dot.idle')).toBe(true)
  })
})

describe('When using the tool', () => {
  it('Starts in idle', () => {
    const app = new TLTestApp().selectTool('dot')
    expect(app.isIn('dot.idle')).toBe(true)
  })
  it('Transitions to creating and creates a dot shape on pointer down', () => {
    const app = new TLTestApp()
    app.deleteShapes(app.shapes).selectTool('dot')
    expect(app.shapes.length).toBe(0)
    app.pointerDown([100, 100])
    expect(app.shapes.length).toBe(1)
    app.shapes[0].update({ id: 'test_dot' })
    expect(app.shapes[0]).toMatchSnapshot('created dot')
  })
  it('Cancels creating a shape when escape is pressed', () => {
    const app = new TLTestApp()
    app.deleteShapes(app.shapes)
    expect(app.shapes.length).toBe(0)
    app
      .selectTool('dot')
      .pointerDown([100, 100])
      .pointerMove([100, 150])
      .keyDown('Escape')
      .pointerUp()
    expect(app.isIn('dot.idle')).toBe(true)
    expect(app.shapes.length).toBe(0)
  })
  it('Transitions from idle to select.idle on Escape', () => {
    const app = new TLTestApp().selectTool('dot')
    expect(app.isIn('dot.idle')).toBe(true)
    app.keyDown('Escape')
    expect(app.isIn('select.idle')).toBe(true)
  })
})
