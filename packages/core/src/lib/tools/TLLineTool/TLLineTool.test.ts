import { TLLineTool } from './TLLineTool'
import { TLApp, TLLineShape } from '~lib'
import { TLTestApp } from '~test/TLTestApp'

export class LineTool extends TLLineTool<TLLineShape, any> {
  static id = 'line'
  static shortcut = ['l']
  Shape = TLLineShape
}

describe('A minimal test', () => {
  it('Creates the tool', () => {
    const app = new TLApp()
    const tool = new LineTool(app, app)
    expect(tool).toBeDefined()
  })
  it('Registers the tool with the app', () => {
    const app = new TLApp()
    app.registerTools([LineTool])
    expect(app.children.get('line')).toBeDefined()
  })
  it('Selects the tool', () => {
    const app = new TLApp().registerTools([LineTool]).selectTool('line')
    expect(app.isIn('line.idle')).toBe(true)
  })
})

describe('When using the tool', () => {
  it('Starts in idle', () => {
    const app = new TLTestApp().selectTool('line')
    expect(app.isIn('line.idle')).toBe(true)
  })
  it('Transitions to pointing on pointerdown', () => {
    const app = new TLTestApp().selectTool('line').pointerDown([100, 100])
    expect(app.isIn('line.pointing')).toBe(true)
  })
  it('Transitions to creating only after leaving the dead zone', () => {
    const app = new TLTestApp().selectTool('line').pointerDown([100, 100]).pointerMove([100, 105])
    expect(app.isIn('line.pointing')).toBe(true)
    app.pointerMove([100, 106])
    expect(app.isIn('line.creating')).toBe(true)
  })
  it('Creates a shape and transitions to select.idle after pointer up', () => {
    const app = new TLTestApp()
    app.deleteShapes(app.shapes)
    expect(app.shapes.length).toBe(0)
    app.selectTool('line').pointerDown([100, 100]).pointerMove([100, 150]).pointerUp()
    expect(app.isIn('select.idle')).toBe(true)
    expect(app.shapes.length).toBe(1)
    app.shapes[0].update({ id: 'test_line' })
    expect(app.shapes[0]).toMatchSnapshot('created line')
  })
  it('Cancels creating a shape when escape is pressed', () => {
    const app = new TLTestApp()
    app.deleteShapes(app.shapes)
    expect(app.shapes.length).toBe(0)
    app
      .selectTool('line')
      .pointerDown([100, 100])
      .pointerMove([100, 150])
      .keyDown('Escape')
      .pointerUp()
    expect(app.isIn('line.idle')).toBe(true)
    expect(app.shapes.length).toBe(0)
  })
  it('Transitions from idle to select.idle on Escape', () => {
    const app = new TLTestApp().selectTool('line')
    expect(app.isIn('line.idle')).toBe(true)
    app.keyDown('Escape')
    expect(app.isIn('select.idle')).toBe(true)
  })
})
