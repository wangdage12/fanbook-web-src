import { Block, BLOCKS, Document, Hyperlink, Inline, INLINES, Node, Text, TopLevelBlock } from '@contentful/rich-text-types'
import { flatten } from 'lodash-es'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkEmoji from './remark-plugins/remarkEmoji'
import remarkMention from './remark-plugins/remarkMention'

export interface MarkdownNode extends MarkdownTree {
  depth: string
  type: string
  ordered: boolean
  value: string
}

export interface MarkdownTree {
  children: MarkdownNode[]
}

export interface MarkdownLinkNode extends MarkdownNode {
  url: string
}

const markdownNodeTypes = new Map<string, string>([
  ['paragraph', BLOCKS.PARAGRAPH],
  ['heading', 'heading'],
  ['text', 'text'],
  ['emphasis', 'text'],
  ['strong', 'text'],
  ['delete', 'text'],
  ['break', 'text'],
  ['inlineCode', 'text'],
  ['link', INLINES.HYPERLINK],
  ['thematicBreak', BLOCKS.HR],
  ['blockquote', BLOCKS.QUOTE],
  ['list', 'list'],
  ['listItem', BLOCKS.LIST_ITEM],
  ['table', BLOCKS.TABLE],
  ['tableRow', BLOCKS.TABLE_ROW],
  ['tableCell', BLOCKS.TABLE_CELL],
  ['code', BLOCKS.EMBEDDED_ENTRY],
  [INLINES.ENTRY_HYPERLINK, INLINES.ENTRY_HYPERLINK],
])

const nodeTypeFor = (node: MarkdownNode) => {
  const nodeType = markdownNodeTypes.get(node.type)

  switch (nodeType) {
    case 'heading':
      return `${nodeType}-${node.depth}`
    case 'list':
      return `${node.ordered ? 'ordered' : 'unordered'}-list`
    default:
      return nodeType
  }
}

const markTypes = new Map([
  ['emphasis', 'italic'],
  ['strong', 'bold'],
  ['inlineCode', 'code'],
  ['delete', 'strike'],
])
const markTypeFor = (node: MarkdownNode) => {
  return markTypes.get(node.type)
}

const isLink = (node: MarkdownNode): node is MarkdownLinkNode => {
  return node.type === 'link'
}

const nodeContainerTypes = new Map([
  [BLOCKS.HEADING_1, 'block'],
  [BLOCKS.HEADING_2, 'block'],
  [BLOCKS.HEADING_3, 'block'],
  [BLOCKS.HEADING_4, 'block'],
  [BLOCKS.HEADING_5, 'block'],
  [BLOCKS.HEADING_6, 'block'],
  [BLOCKS.LIST_ITEM, 'block'],
  [BLOCKS.UL_LIST, 'block'],
  [BLOCKS.OL_LIST, 'block'],
  [BLOCKS.QUOTE, 'block'],
  [BLOCKS.HR, 'block'],
  [BLOCKS.PARAGRAPH, 'block'],
  [BLOCKS.TABLE, 'block'],
  [BLOCKS.TABLE_CELL, 'block'],
  [BLOCKS.TABLE_HEADER_CELL, 'block'],
  [BLOCKS.TABLE_ROW, 'block'],
  [BLOCKS.EMBEDDED_ENTRY, 'block'],
  [INLINES.HYPERLINK, 'inline'],

  ['text', 'text'],
  ['delete', 'text'],
  ['emphasis', 'text'],
  ['strong', 'text'],
  ['inlineCode', 'text'],
])

const isBlock = (nodeType: string) => {
  return nodeContainerTypes.get(nodeType) === 'block'
}

const isText = (nodeType: string) => {
  return nodeContainerTypes.get(nodeType) === 'text'
}

const isInline = (nodeType: string) => {
  return nodeContainerTypes.get(nodeType) === 'inline'
}
const buildHyperlink = (node: MarkdownLinkNode, appliedMarksTypes: string[]): Hyperlink[] => {
  const content = mdToRichTextNodes(node.children, appliedMarksTypes) as Text[]

  const hyperlink: Hyperlink = {
    nodeType: INLINES.HYPERLINK,
    data: { uri: node.url },
    content,
  }

  return [hyperlink]
}

function buildCodeBlock(node: MarkdownNode): Block[] {
  return [
    {
      nodeType: BLOCKS.EMBEDDED_ENTRY,
      content: node.value.split('\n').map(
        line =>
          ({
            nodeType: 'text',
            value: line,
            marks: [{ type: 'code' }],
          }) as Text
      ),
      data: { type: 'code' },
    },
  ]
}

const buildGenericBlockOrInline = (node: MarkdownNode, appliedMarksTypes: string[]): Array<Block | Inline> => {
  const nodeType = nodeTypeFor(node)
  const content = mdToRichTextNodes(node.children, appliedMarksTypes)

  return [
    {
      nodeType: nodeType,
      content,
      data: {},
    } as Block | Inline,
  ]
}

// const buildTableCell = async (node: MarkdownNode, appliedMarksTypes: string[]): Promise<Array<Block>> => {
//   const nodeChildren = await mdToRichTextNodes(node.children, appliedMarksTypes)
//
//   const content = nodeChildren.map(contentNode => ({
//     nodeType: BLOCKS.PARAGRAPH,
//     data: {},
//     content: [contentNode],
//   }))
//
//   // A table cell can't be empty
//   if (content.length === 0) {
//     content.push({
//       nodeType: BLOCKS.PARAGRAPH,
//       data: {},
//       content: [
//         {
//           nodeType: 'text',
//           data: {},
//           marks: [],
//           value: '',
//         } as Text,
//       ],
//     })
//   }
//
//   /**
//    * We should only support texts inside table cells.
//    * Some markdowns might contain html inside tables such as <ul>, <blockquote>, etc
//    * but they are pretty much filtered out by markdownNodeTypes and nodeContainerTypes variables.
//    * so we ended up receiving only `text` nodes.
//    * We can't have table cells with text nodes directly, we must wrap text nodes inside paragraphs.
//    */
//   return [
//     {
//       nodeType: BLOCKS.TABLE_CELL,
//       content,
//       data: {},
//     } as Block,
//   ]
// }

const buildText = (node: MarkdownNode, appliedMarksTypes: string[]): Array<Inline | Text> => {
  const nodeType = nodeTypeFor(node)
  const markType = markTypeFor(node)
  const marks = [...appliedMarksTypes]
  if (markType) {
    marks.push(markType)
  }

  if (node.type === 'break') {
    return [
      {
        nodeType: 'text',
        value: '\n',
        marks: [],
        data: {},
      } as Text,
    ]
  }
  if (node.type !== 'text' && node.children) {
    return mdToRichTextNodes(node.children, marks) as Array<Inline | Text>
  }
  if (node.value) {
    return [
      {
        nodeType: nodeType,
        value: node.value,
        marks: marks.map(type => ({ type })),
        data: {},
      } as Text,
    ]
  }

  throw new Error('Unexpected node')
}

function mdToRichTextNode(node: MarkdownNode, appliedMarksTypes: string[] = []): Node[] | undefined {
  const nodeType = nodeTypeFor(node)
  if (!nodeType) {
    return undefined
  }

  if (isLink(node)) {
    return buildHyperlink(node, appliedMarksTypes)
  }

  // if (isTableCell(nodeType)) {
  //   return await buildTableCell(node, fallback, appliedMarksTypes)
  // }
  if (node.type === 'code') {
    return buildCodeBlock(node)
  }

  if (isBlock(nodeType) || isInline(nodeType)) {
    return buildGenericBlockOrInline(node, appliedMarksTypes)
  }

  if (isText(nodeType)) {
    return buildText(node, appliedMarksTypes)
  }
}

function mdToRichTextNodes(nodes: MarkdownNode[], appliedMarksTypes: string[] = []): Node[] {
  if (!nodes) {
    return []
  }
  const rtNodes = nodes.map(node => mdToRichTextNode(node, appliedMarksTypes) ?? ([node] as never as Node[]))

  return flatten(rtNodes).filter(Boolean)
}

const astToRichTextDocument = (tree: MarkdownTree): Document => {
  const content = mdToRichTextNodes(tree.children)
  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: content as TopLevelBlock[],
  }
}

// Inline markdown images come in as nested within a MarkdownNode paragraph
// so we must hoist them out before transforming to rich text.
function prepareMdAST(ast: MarkdownTree): MarkdownNode {
  function prepareASTNodeChildren(node: MarkdownNode): MarkdownNode {
    if (!node.children) {
      return node
    }

    const children = node.children.map(n => prepareASTNodeChildren(n))

    return { ...node, children }
  }

  return prepareASTNodeChildren({
    depth: '0',
    type: 'root',
    value: '',
    ordered: true,
    children: ast.children,
  })
}

export function mdToRichText(md: string): Document {
  const processor = remark().use(remarkGfm).use(remarkMention).use(remarkEmoji)
  const tree = processor.parse(md)
  const changedTree = processor.runSync(tree)
  const ast = prepareMdAST(changedTree as never)

  return astToRichTextDocument(ast)
}
