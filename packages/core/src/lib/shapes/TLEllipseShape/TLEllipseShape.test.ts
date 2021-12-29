import { createEllipseShapeFactory } from './TLEllipseShape'

const shapeFactory = createEllipseShapeFactory()

const shape = shapeFactory({
  id: 'ellipse1',
  type: 'ellipse',
  parentId: 'page',
  point: [0, 0],
  size: [100, 100],
})
