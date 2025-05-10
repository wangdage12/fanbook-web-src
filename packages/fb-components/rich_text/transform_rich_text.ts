import { BLOCKS } from '@contentful/rich-text-types'
import { TopLevelBlock } from '@contentful/rich-text-types/dist/types/types'
import { isObject, isString } from 'lodash-es'
import { Op } from 'quill-delta'
import { ContentfulQuillDeltaVisitor } from '../rich_text_editor/visitors/ContentfulQuillDeltaVisitor'
import OpsUtils from '../utils/OpsUtils'
import { safeJSONParse } from '../utils/safeJSONParse'
import { EmbeddedAssetType } from './types'

export default function transformRichText(data: string | Op[]): TopLevelBlock[] {
  if (isString(data)) {
    data = safeJSONParse(data, [] as Op[])
  }

  const _data = OpsUtils.removeTailBlankLines(data)

  const visitor = new ContentfulQuillDeltaVisitor(_data)

  const parsed = visitor.result

  if (parsed.length === 0) {
    // 如果解析出来的结果是空的，那么返回一个空的 paragraph, 避免在一些场景出现异常, 比如 QuestionNestedAnswerItem 中在评论的第一条插入回复人员文案, 但是回复人员文本内容为空, 仅发图片,在 parsed[0].content.push() 时 parsed[0] 为 undefined, 导致异常
    return [{ content: [], data: {}, nodeType: BLOCKS.PARAGRAPH }]
  }

  return parsed
}

export interface MediaInsertInfo {
  _type: EmbeddedAssetType
  width: number
  height: number
  source: string
  thumbUrl?: string
}

export function getFirstMediaFromOps(ops: Op[]) {
  return ops.find(op => isObject(op.insert) && (op.insert['_type'] === EmbeddedAssetType.Image || op.insert['_type'] === EmbeddedAssetType.Video))
    ?.insert as MediaInsertInfo | undefined
}
