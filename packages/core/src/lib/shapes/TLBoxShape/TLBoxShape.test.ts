import { createBoxShapeFactory } from './TLBoxShape'

const shapeFactory = createBoxShapeFactory()

const shape = shapeFactory({
  id: 'box1',
  type: 'box',
  parentId: 'page',
  point: [0, 0],
  size: [100, 100],
})
