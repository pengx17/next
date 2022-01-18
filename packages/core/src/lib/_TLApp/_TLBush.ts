import RBush from 'rbush'
import type { TLShape } from './_shapes/TLShape'

export class TLBush<S extends TLShape = TLShape> extends RBush<S> {
  toBBox = (shape: S) => shape.rotatedBounds
}
