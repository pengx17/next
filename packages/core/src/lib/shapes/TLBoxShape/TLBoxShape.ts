import { createShapeFactory, TLShape, TLShapeOptions, TLShapeProps } from '~lib'

export interface TLBoxShapeProps extends TLShapeProps {
  type: 'box'
  size: number[]
}

export type TLBoxShape<
  P extends TLBoxShapeProps = TLBoxShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = TLShape<P, C>

export type TLBoxShapeFactory<
  P extends TLBoxShapeProps = TLBoxShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = (props: P) => TLBoxShape<P, C>

export function createBoxShapeFactory<
  P extends TLBoxShapeProps = TLBoxShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
>(options = {} as TLShapeOptions<P, C> & ThisType<TLShape<P, C>>): TLBoxShapeFactory<P, C> {
  return createShapeFactory(options)
}
