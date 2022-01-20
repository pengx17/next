import {
  TLBoxShape,
  TLDotShape,
  TLDrawShape,
  TLEllipseShape,
  TLLineShape,
  TLPolygonShape,
  TLPolylineShape,
  TLStarShape,
  TLBoxShapeModel,
  TLDotShapeModel,
  TLDrawShapeModel,
  TLEllipseShapeModel,
  TLLineShapeModel,
  TLPolygonShapeModel,
  TLPolylineShapeModel,
  TLStarShapeModel,
} from '@tldraw/core'

import type { TLComponentProps, TLIndicatorProps } from './TLReactShape'

export abstract class TLReactBoxShape<P extends TLBoxShapeModel, M = any> extends TLBoxShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactDotShape<P extends TLDotShapeModel, M = any> extends TLDotShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactDrawShape<P extends TLDrawShapeModel, M = any> extends TLDrawShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactEllipseShape<
  P extends TLEllipseShapeModel,
  M = any
> extends TLEllipseShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactLineShape<P extends TLLineShapeModel, M = any> extends TLLineShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactPolygonShape<
  P extends TLPolygonShapeModel,
  M = any
> extends TLPolygonShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactPolylineShape<
  P extends TLPolylineShapeModel,
  M = any
> extends TLPolylineShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

export abstract class TLReactStarShape<P extends TLStarShapeModel, M = any> extends TLStarShape<P> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}
