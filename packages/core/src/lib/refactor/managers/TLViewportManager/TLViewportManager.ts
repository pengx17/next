import { Vec } from '@tldraw/vec'
import type { TLBounds, TLEventMap } from '../../types'
import { FIT_TO_SCREEN_PADDING } from '~constants'
import type { TLApp, TLShape } from '../..'

export class TLViewportManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  readonly minZoom = 0.1
  readonly maxZoom = 8
  readonly zooms = [0.1, 0.25, 0.5, 1, 2, 4, 8]

  updateBounds = (bounds: TLBounds): this => {
    this.app.updateUserState({ bounds })
    return this
  }

  panCamera = (delta: number[]): this => {
    const { camera } = this.app.userState
    this.app.updateUserState({ camera: Vec.sub(camera, Vec.div(delta, camera[2])) })
    return this
  }

  pinchCamera(point: number[], delta: number[], zoom: number) {
    const {
      userState: { camera },
    } = this.app
    const nextPoint = Vec.sub(camera, Vec.div(delta, camera[2]))
    const p0 = Vec.sub(Vec.div(point, camera[2]), nextPoint)
    const p1 = Vec.sub(Vec.div(point, zoom), nextPoint)
    this.app.updateUserState({
      camera: Vec.toFixed(Vec.add(nextPoint, Vec.sub(p1, p0))).concat(zoom),
    })
  }

  update = (camera: number[]): this => {
    this.app.updateUserState({ camera })
    return this
  }

  getPagePoint = (point: number[]): number[] => {
    const {
      userState: { camera, bounds },
    } = this.app
    return Vec.sub(Vec.div(Vec.sub(point, [bounds.minX, bounds.minY]), camera[2]), camera)
  }

  getScreenPoint = (point: number[]): number[] => {
    const {
      userState: { camera },
    } = this.app
    return Vec.mul(Vec.add(point, camera), camera[2])
  }

  zoomIn = (): this => {
    const {
      zooms,
      app: {
        userState: { camera, bounds },
      },
    } = this
    let zoom: number | undefined
    for (let i = 1; i < zooms.length; i++) {
      const z1 = zooms[i - 1]
      const z2 = zooms[i]
      if (z2 - camera[2] <= (z2 - z1) / 2) continue
      zoom = z2
      break
    }
    if (zoom === undefined) zoom = zooms[zooms.length - 1]
    const center = [bounds.width / 2, bounds.height / 2]
    const p0 = Vec.sub(Vec.div(center, camera[2]), center)
    const p1 = Vec.sub(Vec.div(center, zoom), center)
    return this.update(Vec.toFixed(Vec.add(camera, Vec.sub(p1, p0))).concat(zoom))
  }

  zoomOut = (): this => {
    const {
      zooms,
      app: {
        userState: { camera, bounds },
      },
    } = this
    let zoom: number | undefined
    for (let i = zooms.length - 1; i > 0; i--) {
      const z1 = zooms[i - 1]
      const z2 = zooms[i]
      if (z2 - camera[2] >= (z2 - z1) / 2) continue
      zoom = z1
      break
    }
    if (zoom === undefined) zoom = zooms[0]
    const center = [bounds.width / 2, bounds.height / 2]
    const p0 = Vec.sub(Vec.div(center, camera[2]), center)
    const p1 = Vec.sub(Vec.div(center, zoom), center)
    return this.update(Vec.toFixed(Vec.add(camera, Vec.sub(p1, p0))).concat(zoom))
  }

  resetZoom = (): this => {
    const {
      userState: { bounds, camera },
    } = this.app
    const center = [bounds.width / 2, bounds.height / 2]
    const p0 = Vec.sub(Vec.div(center, camera[2]), camera)
    const p1 = Vec.sub(Vec.div(center, 1), camera)
    return this.update(Vec.toFixed(Vec.add(camera, Vec.sub(p1, p0))).concat(1))
  }

  zoomToBounds = ({ width, height, minX, minY }: TLBounds): this => {
    const {
      userState: { bounds, camera },
    } = this.app
    let zoom = Math.min(
      (bounds.width - FIT_TO_SCREEN_PADDING) / width,
      (bounds.height - FIT_TO_SCREEN_PADDING) / height
    )
    zoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, camera[2] === zoom || camera[2] < 1 ? Math.min(1, zoom) : zoom)
    )
    const delta = [
      (bounds.width - width * zoom) / 2 / zoom,
      (bounds.height - height * zoom) / 2 / zoom,
    ]
    return this.update(Vec.add([-minX, -minY], delta).concat(zoom))
  }
}
