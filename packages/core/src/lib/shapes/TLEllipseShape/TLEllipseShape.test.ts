import { createEllipseShapeClass } from './TLEllipseShape'

const EllipseShape = createEllipseShapeClass()

const shape = new EllipseShape({
  id: 'ellipse1',
  type: 'ellipse',
  parentId: 'page',
  point: [0, 0],
  size: [100, 100],
})

describe('Ellipse shape', () => {
  it('Creates a shape', () => {
    expect(shape).toBeDefined()
  })
})
