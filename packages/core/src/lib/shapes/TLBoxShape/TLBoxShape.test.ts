import { createBoxShapeClass } from './TLBoxShape'

const BoxShape = createBoxShapeClass()

const shape = new BoxShape({
  id: 'box1',
  type: 'box',
  parentId: 'page',
  point: [0, 0],
  size: [100, 100],
})

describe('Box shape', () => {
  it('Creates a shape', () => {
    expect(shape).toBeDefined()
  })
})
