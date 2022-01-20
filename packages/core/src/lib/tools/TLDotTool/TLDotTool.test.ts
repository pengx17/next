import { TLTestApp } from '~test'

describe('When using the tool', () => {
  it('Starts in idle', () => {
    new TLTestApp().selectTool('dot').expectToBeIn('dot.idle')
  })

  it('Transitions to creating and creates a dot shape on pointer down', () => {
    const app = new TLTestApp()
    app.deleteShapes([...app.document.shapes]).selectTool('dot')
    expect(app.shapes.size).toBe(0)
    app.pointerDown([100, 100])
    expect(app.shapes.size).toBe(1)
    const shape = app.getShapesArray()[0]
    expect({ ...shape.model, id: 'test_dot' }).toMatchSnapshot('created dot')
  })

  it('Cancels creating a shape when escape is pressed', () => {
    const app = new TLTestApp()
    app
      .deleteShapes([...app.document.shapes])
      .expectSelectedIdsToBe([])
      .selectTool('dot')
      .pointerDown([100, 100])
      .pointerMove([100, 150])
      .keyDown('Escape')
      .pointerUp()
    expect(app.isIn('dot.idle')).toBe(true)
    expect(app.shapes.size).toBe(0)
  })

  // it('Transitions from idle to select.idle on Escape', () => {
  //   new TLTestApp()
  //     .selectTool('dot')
  //     .expectToBeIn('dot.idle')
  //     .keyDown('Escape')
  //     .expectToBeIn('select.idle')
  // })
})
