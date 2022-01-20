import { reaction } from 'mobx'
import type { TLApp, TLShape } from '~lib'
import type { TLEventMap } from '~types'

export class TLSelectionManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  state: 'stopped' | 'running' = 'stopped'

  disposables: (() => void)[] = []

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  // Consider adding reactions to document.shapes changes, to remove
  // missing shapes from erasingIds or selectedIds, etc. We want to
  // provide only one "source of truth" for which shapes exist in the
  // document.

  getSelectedIds = (): string[] => {
    const { selectedShapes } = this.app
    return Array.from(selectedShapes.values()).map(shape => shape.id)
  }

  start = () => {
    this.state = 'running'
    this.disposables.push(
      reaction(this.getSelectedIds, result => (this.app.document.selectedIds = result), {
        fireImmediately: true,
      })
    )
  }

  stop = () => {
    this.disposables.forEach(disposable => disposable())
    this.disposables = []
    this.state = 'stopped'
  }
}
