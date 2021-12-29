// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react'
// import { TLCustomProps, TLBoxShape, TLBoxShapeProps } from '@tldraw/core'
// import { HTMLContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
// import { observer } from 'mobx-react-lite'
// import { makeObservable, observable } from 'mobx'
// import { NuStyleProps, withClampedStyles } from './NuStyleProps'

// export interface NuCodeSandboxShapeProps extends TLBoxShapeProps, NuStyleProps {
//   embed: string
// }

// export class NuCodeSandboxShape extends TLBoxShape<NuCodeSandboxShapeProps> {
//   constructor(props = {} as TLCustomProps<NuCodeSandboxShapeProps>) {
//     super(props)
//     props.size = props.size ?? [600, 320]
//     this.init(props)
//     this.propsKeys.add('embedId')
//     makeObservable(this)
//   }

//   static id = 'code'

//   isEditable = true

//   @observable stroke = '#000000'
//   @observable fill = '#ffffff'
//   @observable strokeWidth = 2
//   @observable borderRadius = 0
//   @observable opacity = 1
//   @observable embedId?: string = ''

//   ReactComponent = observer(({ events, isSelected, isEditing, isErasing }: TLComponentProps) => {
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
//             <iframe
//               src={`https://codesandbox.io/embed/${embedId}?fontsize=14&hidenavigation=1&theme=dark`}
//               style={{ width: '100%', height: '100%', overflow: 'hidden' }}
//               title={'CodeSandbox'}
//               allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
//               sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
//             />
//           ) : (
//             <div
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 overflow: 'hidden',
//                 justifyContent: 'center',
//                 backgroundColor: 'rgb(21, 21, 21)',
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
//                   backgroundColor: 'transparent',
//                   border: '1px solid rgb(52, 52, 52)',
//                   color: 'white',
//                 }}
//                 placeholder="CodeSandbox URL"
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

//   validateProps = (props: Partial<TLCustomProps<NuCodeSandboxShapeProps>>) => {
//     if (props.size !== undefined) {
//       props.size[0] = Math.max(props.size[0], 1)
//       props.size[1] = Math.max(props.size[1], 1)
//     }
//     return withClampedStyles(props)
//   }
// }

export {}
