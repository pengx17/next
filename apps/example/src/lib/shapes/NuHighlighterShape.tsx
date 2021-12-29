// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import { assignOwnProps, SvgPathUtils, TLCustomProps, TLShapeProps } from '@tldraw/core'
// import { SVGContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
// import { TLDrawShapeProps, TLDrawShape } from '@tldraw/draw-shape'
// import { observer } from 'mobx-react-lite'
// import { observable, computed, makeObservable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// export interface NuHighlighterShapeProps extends TLDrawShapeProps, NuStyleProps {}

// export class NuHighlighterShape extends TLDrawShape<NuHighlighterShapeProps> {
//   constructor(props = {} as TLCustomProps<NuHighlighterShapeProps>) {
//     super(props)
//     assignOwnProps(this, props)
//     makeObservable(this)
//   }

//   static id = 'highlighter'

//   @observable stroke = '#e9ff32'
//   @observable fill = '#000000'
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
//         <path
//           d={pointsPath}
//           strokeWidth={strokeWidth * 16}
//           stroke={stroke}
//           fill="none"
//           pointerEvents="all"
//           strokeLinejoin="round"
//           strokeLinecap="round"
//           opacity={0.5}
//         />
//       </SVGContainer>
//     )
//   })

//   ReactIndicator = observer((props: TLIndicatorProps) => {
//     const { pointsPath } = this
//     return <path d={pointsPath} fill="none" />
//   })

//   validateProps = (props: Partial<TLShapeProps & NuHighlighterShapeProps>) => {
//     props = withClampedStyles(props)
//     if (props.strokeWidth !== undefined) props.strokeWidth = Math.max(props.strokeWidth, 1)
//     return props
//   }
// }

export {}
