import { isEmpty, isString, last } from 'lodash-es'
import { Op } from 'quill-delta'
import UploadCos from './upload_cos/UploadCos.ts'
import { CosUploadFileType } from './upload_cos/uploadType.ts'

export default class OpsUtils {
  // 移除冗余字段，这些字段需要在上传之前移除
  static removeRedundantFields(ops: Op[]) {
    ops.forEach(op => {
      // @ts-expect-error ignore
      if (op.insert.type === 'image' || op.insert._type === 'image') {
        // @ts-expect-error ignore
        delete op.insert.localSource
        // @ts-expect-error ignore
        delete op.insert.media
        // @ts-expect-error ignore
        delete op.insert.children
      }
      // @ts-expect-error ignore
      if (op.insert.type === 'video' || op.insert._type === 'video') {
        // @ts-expect-error ignore
        delete op.insert.localSource
        // @ts-expect-error ignore
        delete op.insert.media
        // @ts-expect-error ignore
        delete op.insert.children
        // @ts-expect-error ignore
        delete op.insert.thumbFile
        // @ts-expect-error ignore
        delete op.insert.localThumbUrl
      }
    })
    return ops
  }
  /**
   * 移除 Quill Ops 尾部空行
   * 如果最后一个节点是纯文本，去掉尾部换行符
   * 不去掉带有属性的换行符 比如 { insert: '\n', attributes: { header: 1 } } 这种
   */
  static removeTailBlankLines(ops: Op[] = []): Op[] {
    // 不可原地修改 ops，来源可能是 immutable
    const result = [...ops]
    while (result.length) {
      const lastNode = last(result) as Op
      if (Object.keys(lastNode).length !== 1) break
      if (!isString(lastNode.insert)) break
      if (lastNode.insert.trim().length !== 0) break
      result.pop()
    }

    if (result.length > 0) {
      const last = result[result.length - 1]
      // 如果最后一个节点是纯文本，去掉尾部换行符 即不去掉带有属性的换行符 比如 { insert: '\n', attributes: { header: 1 } } 这种
      if (isString(last.insert) && isEmpty(last.attributes)) {
        result[result.length - 1] = { ...last, insert: last.insert.trimEnd() }
      }
    }
    return result
  }

  /**
   * 上传 ops 里的所有文件
   * todo 上传视频
   * @param ops
   */

  static async uploadFilesInOps(ops: Op[], onUploadEachTime?: () => void): Promise<Op[]> {
    const promises: Promise<unknown>[] = []
    for (const op of ops) {
      // @ts-expect-error ignore
      const { type, localSource, media } = op.insert
      if (type === 'image' && localSource) {
        promises.push(
          UploadCos.getInstance()
            .uploadFile({ type: CosUploadFileType.image, file: media as File })
            // @ts-expect-error ignore
            .then(remoteUrl => (op.insert.source = remoteUrl))
            .then(onUploadEachTime)
        )
      }
      if (type === 'video' && localSource) {
        promises.push(
          UploadCos.getInstance()
            .uploadFile({ type: CosUploadFileType.video, file: media as File })
            // @ts-expect-error ignore
            .then(remoteUrl => (op.insert.source = remoteUrl))
            .then(onUploadEachTime)
        )
        promises.push(
          UploadCos.getInstance()
            // @ts-expect-error ignore
            .uploadFile({ type: CosUploadFileType.image, file: op.insert.thumbFile as File })
            // @ts-expect-error ignore
            .then(remoteUrl => (op.insert.thumbUrl = remoteUrl))
            .then(onUploadEachTime)
        )
      }
    }
    await Promise.all(promises)
    return ops
  }
}
