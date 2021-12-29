// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import { TLShapeProps, assignOwnProps, TLCustomProps } from '@tldraw/core'
// import { SVGContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
// import { TLPolylineShape, TLPolylineShapeProps } from '@tldraw/polyline-shape'
// import { observer } from 'mobx-react-lite'
// import { makeObservable, observable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// interface NuPolylineShapeProps extends NuStyleProps, TLPolylineShapeProps {}

// export class NuPolylineShape extends TLPolylineShape<NuPolylineShapeProps> {
//   constructor(props = {} as TLCustomProps<NuPolylineShapeProps>) {
//     super(props)
//     assignOwnProps(this, props)
//     makeObservable(this)
//   }

//   @observable stroke = '#000000'
//   @observable fill = '#ffffff'
//   @observable strokeWidth = 2
//   @observable opacity = 1

//   hideSelection = true

//   static id = 'polyline'

//   ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
//     const { points, stroke, strokeWidth, opacity } = this

//     const path = points.join()

//     return (
//       <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
//         <g>
//           <polyline className={'tl-hitarea-stroke'} points={path} />
//           <polyline
//             points={path}
//             stroke={stroke}
//             fill={'none'}
//             strokeWidth={strokeWidth}
//             strokeLinejoin="round"
//           />
//         </g>
//       </SVGContainer>
//     )
//   })

//   ReactIndicator = observer((props: TLIndicatorProps) => {
//     const { points } = this

//     const path = points.join()
//     return <polyline points={path} />
//   })

//   validateProps = (props: Partial<NuPolylineShapeProps & TLShapeProps>) => {
//     return withClampedStyles(props)
//   }
// }

export {}
