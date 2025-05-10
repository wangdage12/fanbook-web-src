import { Inline, INLINES } from '@contentful/rich-text-types'
import { findAndReplace, Replace } from 'mdast-util-find-and-replace'

type Root = import('mdast').Root

export default function remarkEmoji() {
  const replacer: Replace = (value: string) => {
    const name = value.slice(1, -1)

    return {
      nodeType: INLINES.EMBEDDED_ENTRY,
      content: [],
      data: { name },
    } as Inline as never
  }

  function transformer(tree: Root) {
    findAndReplace(tree, [[/\[.*?]/g, replacer]])
  }

  return transformer
}
