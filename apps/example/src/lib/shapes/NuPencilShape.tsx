// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import { assignOwnProps, SvgPathUtils, TLShapeProps } from '@tldraw/core'
// import { SVGContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
// import { TLDrawShapeProps, TLDrawShape } from '@tldraw/draw-shape'
// import { observer } from 'mobx-react-lite'
// import { observable, computed, makeObservable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// export interface NuPencilShapeProps extends TLDrawShapeProps, NuStyleProps {}

// export class NuPencilShape extends TLDrawShape<NuPencilShapeProps> {
//   constructor(props = {} as TLShapeProps & Partial<NuPencilShapeProps>) {
//     super(props)
//     assignOwnProps(this, props)
//     makeObservable(this)
//   }

//   static id = 'pencil'

//   @observable stroke = '#000000'
//   @observable fill = '#ffffff'
//   @observable strokeWidth = 2
//   @observable opacity = 1

//   @computed get pointsPath() {
//     const { points } = this
//     return SvgPathUtils.getCurvedPathForPoints(points)
//   }

//   ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
//     const { pointsPath, stroke, fill, strokeWidth, opacity } = this

//     return (
//       <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
//         <polyline
//           points={pointsPath}
//           stroke={stroke}
//           fill={fill}
//           strokeWidth={strokeWidth}
//           pointerEvents="all"
//         />
//       </SVGContainer>
//     )
//   })

//   ReactIndicator = observer((props: TLIndicatorProps) => {
//     const { pointsPath } = this
//     return <path d={pointsPath} fill="none" />
//   })

//   validateProps = (props: Partial<TLShapeProps & NuPencilShapeProps>) => {
//     return withClampedStyles(props)
//   }
// }

export {}
