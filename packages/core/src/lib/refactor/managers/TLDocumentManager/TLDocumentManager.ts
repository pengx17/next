import type { TLApp, TLShape } from '../..'
import type { TLEventMap } from '../../_types'

export class TLDocumentManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
  }
}
