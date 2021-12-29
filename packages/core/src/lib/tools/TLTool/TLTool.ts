export interface TLToolProps {}

export interface TLToolFlags {}

export interface TLToolMethods {}

export interface TLToolOptions extends Partial<TLToolFlags>, TLToolMethods {}

export interface TLTool extends Partial<TLToolFlags>, Required<TLToolMethods> {}

export type TLToolFactory = (() => TLTool) & { id: string }

export function createTool(options = {} as TLToolOptions): TLToolFactory {
  function factory(): TLTool {
    return {}
    //
  }

  factory.id = 'tool'

  return factory
}
