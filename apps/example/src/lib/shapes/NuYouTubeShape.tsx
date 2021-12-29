// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import type { TLCustomProps } from '@tldraw/core'
// import { HTMLContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
// import { TLBoxShape, TLBoxShapeProps } from '@tldraw/box-shape'
// import { observer } from 'mobx-react-lite'
// import { makeObservable, observable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// export interface NuYouTubeShapeProps extends TLBoxShapeProps, NuStyleProps {
//   embedId: string
// }

// export class NuYouTubeShape extends TLBoxShape<NuYouTubeShapeProps> {
//   constructor(props = {} as TLCustomProps<NuYouTubeShapeProps>) {
//     super(props)
//     this.propsKeys.add('embedId')
//     this.init(props)

//     this.isAspectRatioLocked = true
//     this.size = props.size ?? [853, 480]

//     makeObservable(this)
//   }

//   static id = 'youtube'

//   aspectRatio = 480 / 853
//   isEditable = true
//   @observable stroke = '#000000'
//   @observable fill = '#ffffff'
//   @observable strokeWidth = 2
//   @observable borderRadius = 0
//   @observable opacity = 1
//   @observable embedId?: string = ''

//   ReactComponent = observer(({ events, isEditing, isErasing }: TLComponentProps) => {
//     const { opacity, embedId } = this

//     return (
//       <HTMLContainer
//         style={{
//           overflow: 'hidden',
//           pointerEvents: 'all',
//           opacity: isErasing ? 0.2 : opacity,
//         }}
//         {...events}
//       >
//         <div
//           style={{
//             width: '100%',
//             height: '100%',
//             pointerEvents: isEditing ? 'all' : 'none',
//             userSelect: 'none',
//           }}
//         >
//           {embedId ? (
//             <div
//               style={{
//                 overflow: 'hidden',
//                 paddingBottom: '56.25%',
//                 position: 'relative',
//                 height: 0,
//               }}
//             >
//               <iframe
//                 style={{
//                   left: 0,
//                   top: 0,
//                   height: '100%',
//                   width: '100%',
//                   position: 'absolute',
//                 }}
//                 width="853"
//                 height="480"
//                 src={`https://www.youtube.com/embed/${embedId}`}
//                 frameBorder="0"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 title="Embedded youtube"
//               />
//             </div>
//           ) : (
//             <div
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 overflow: 'hidden',
//                 justifyContent: 'center',
//                 backgroundColor: '#FF0000',
//                 border: '1px solid rgb(52, 52, 52)',
//                 padding: 16,
//               }}
//             >
//               <input
//                 type="text"
//                 style={{
//                   padding: '8px 16px',
//                   fontSize: '16px',
//                   maxWidth: '100%',
//                   backgroundColor: 'white',
//                   border: 'none',
//                   borderRadius: 8,
//                   color: 'black',
//                 }}
//                 placeholder="YouTube URL"
//                 value={this.embedId}
//                 onChange={e => {
//                   this.embedId = e.currentTarget.value
//                 }}
//               />
//             </div>
//           )}
//         </div>
//       </HTMLContainer>
//     )
//   })

//   ReactIndicator = observer((props: TLIndicatorProps) => {
//     const {
//       size: [w, h],
//     } = this
//     return <rect width={w} height={h} fill="transparent" />
//   })

//   validateProps = (props: Partial<TLCustomProps<NuYouTubeShapeProps>>) => {
//     if (props.size !== undefined) {
//       props.size[0] = Math.max(props.size[0], 1)
//       props.size[1] = Math.max(props.size[0] * this.aspectRatio, 1)
//     }
//     return withClampedStyles(props)
//   }
// }

export {}
