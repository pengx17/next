// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import type { TLCustomProps, TLDotShape, TLDotShapeProps } from '@tldraw/core'
// import { SVGContainer, TLComponentProps } from '@tldraw/react'
// import { observer } from 'mobx-react-lite'
// import { makeObservable, observable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// export interface NuDotShapeProps extends TLDotShapeProps, NuStyleProps {}

// export class NuDotShape extends TLDotShape<NuDotShapeProps> {
//   constructor(props = {} as TLCustomProps<NuDotShapeProps>) {
//     super(props)
//     this.init(props)
//     makeObservable(this)
//   }

//   static id = 'dot'

//   @observable stroke = '#000000'
//   @observable fill = '#000000'
//   @observable strokeWidth = 2
//   @observable opacity = 1

//   ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
//     const { radius, stroke, fill, strokeWidth, opacity } = this

//     return (
//       <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
//         <circle
//           className={isSelected ? 'tl-hitarea-fill' : 'tl-hitarea-stroke'}
//           cx={radius}
//           cy={radius}
//           r={radius}
//         />
//         <circle
//           cx={radius}
//           cy={radius}
//           r={radius}
//           stroke={stroke}
//           fill={fill}
//           strokeWidth={strokeWidth}
//           pointerEvents="all"
//         />
//       </SVGContainer>
//     )
//   })

//   validateProps = (props: Partial<TLCustomProps<NuDotShapeProps>>) => {
//     if (props.radius !== undefined) props.radius = Math.max(props.radius, 1)
//     return withClampedStyles(props)
//   }
// }

export {}
