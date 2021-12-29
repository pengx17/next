// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import { TLShapeProps, assignOwnProps, TLCustomProps, TLHandle } from '@tldraw/core'
// import { SVGContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
// import { TLLineShape, TLLineShapeProps } from '@tldraw/line-shape'
// import { observer } from 'mobx-react-lite'
// import { makeObservable, observable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// interface NuLineShapeProps extends NuStyleProps, TLLineShapeProps {
//   handles: TLHandle[]
// }

// export class NuLineShape extends TLLineShape<NuLineShapeProps> {
//   constructor(props = {} as TLCustomProps<NuLineShapeProps>) {
//     super(props)
//     assignOwnProps(this, props)
//     makeObservable(this)
//   }

//   @observable stroke = '#000000'
//   @observable fill = '#ffffff'
//   @observable strokeWidth = 2
//   @observable opacity = 1

//   hideSelection = true

//   static id = 'line'

//   ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
//     const { points, stroke, fill, strokeWidth, opacity } = this

//     const path = points.join()

//     return (
//       <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
//         <g>
//           <polygon className={isSelected ? 'tl-hitarea-fill' : 'tl-hitarea-stroke'} points={path} />
//           <polygon
//             points={path}
//             stroke={stroke}
//             fill={fill}
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
//     return <polygon points={path} />
//   })

//   validateProps = (props: Partial<NuLineShapeProps & TLShapeProps>) => {
//     return withClampedStyles(props)
//   }
// }

export {}
