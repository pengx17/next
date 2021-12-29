import { createDotShapeClass } from './TLDotShape'

const DotShape = createDotShapeClass()

const shape = new DotShape({
  id: 'dot1',
  type: 'dot',
  parentId: 'page',
  point: [0, 0],
  radius: 4,
})

describe('DotShape shape', () => {
  it('Creates a shape', () => {
    expect(shape).toBeDefined()
  })
})
