import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { Container } from '~components'
import type { TLReactShape } from '~lib'
import { useShapeEvents } from '~hooks/useShapeEvents'

interface ShapeProps {
  shape: TLReactShape
  zIndex: number
  isHovered?: boolean
  isSelected?: boolean
  isBinding?: boolean
  isErasing?: boolean
  isEditing?: boolean
  meta: any
}

export const Shape = observer(function Shape({
  shape,
  zIndex,
  isHovered = false,
  isSelected = false,
  isBinding = false,
  isErasing = false,
  isEditing = false,
  meta,
}: ShapeProps) {
  const {
    bounds,
    props: { rotation },
    ReactComponent,
  } = shape

  const events = useShapeEvents(shape)

  return (
    <Container bounds={bounds} rotation={rotation} zIndex={zIndex}>
      <ReactComponent
        meta={meta}
        isEditing={isEditing}
        isBinding={isBinding}
        isHovered={isHovered}
        isSelected={isSelected}
        isErasing={isErasing}
        events={events}
      />
    </Container>
  )
})
