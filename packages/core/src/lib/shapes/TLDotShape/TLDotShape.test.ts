import { createDotShapeFactory } from './TLDotShape'

const shapeFactory = createDotShapeFactory()

const shape = shapeFactory({
  id: 'dot1',
  type: 'dot',
  parentId: 'page',
  point: [0, 0],
  radius: 4,
})
