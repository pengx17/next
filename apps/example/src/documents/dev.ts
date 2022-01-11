import type { TLDocumentModel } from '@tldraw/core'
import type { Shape } from '~lib'

const documentModel: TLDocumentModel<Shape, any> = {
  currentPageId: 'page1',
  selectedIds: [],
  pages: [
    {
      name: 'Page',
      id: 'page1',
      shapes: [
        {
          id: 'text1',
          type: 'text',
          parentId: 'page1',
          text: 'Hello World',
          point: [100, 100],
        },
      ],
      bindings: [],
    },
  ],
  assets: [],
}

export default documentModel
