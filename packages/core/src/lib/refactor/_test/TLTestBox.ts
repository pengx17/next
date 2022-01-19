import { TLShape } from '~lib/refactor'

export class TLTestBox extends TLShape {
  static id = 'box'
  getBounds = () => {
    const [x, y] = this.model.point
    return {
      minX: x,
      minY: y,
      maxX: x + 100,
      maxY: y + 100,
      width: 100,
      height: 100,
    }
  }
}
