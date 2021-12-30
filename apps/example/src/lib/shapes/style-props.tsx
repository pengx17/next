export interface NuStyleProps {
  stroke: string
  fill: string
  strokeWidth: number
  opacity: number
}

export function withDefaultStyles<P>(props: P & Partial<NuStyleProps>): P & NuStyleProps {
  return Object.assign(
    {
      stroke: '#000000',
      fill: '#ffffff',
      strokeWidth: 2,
      opacity: 1,
    },
    props
  )
}

export function withClampedStyles<P>(props: P & Partial<NuStyleProps>) {
  if (props.strokeWidth !== undefined) props.strokeWidth = Math.max(props.strokeWidth, 1)
  if (props.opacity !== undefined) props.opacity = Math.min(1, Math.max(props.opacity, 0))
  return props
}
