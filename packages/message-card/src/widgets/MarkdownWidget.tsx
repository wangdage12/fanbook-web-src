import { TopLevelBlock } from '@contentful/rich-text-types'
import { mdToRichText } from 'fb-components/rich_text/converter/mdToRichText'
import RichTextRenderer from 'fb-components/rich_text/RichTextRenderer'
import React, { CSSProperties, useEffect, useState } from 'react'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { parseCommonCssProperties } from './helpers'
import { TextStyleData } from './TextWidget'
import { Widget } from './Widget'
import WidgetTag from './WidgetTag'

export default class MarkdownWidget extends Widget {
  public data!: string
  public style?: TextStyleData
  constructor() {
    super(WidgetTag.Markdown)
  }

  protected accept(visitor: WidgetTreeVisitor): void {
    visitor.visitMarkdown(this)
  }

  toReactComponent(): React.JSX.Element {
    return <_MarkdownWidget data={this.data} style={parseCommonCssProperties(this)} />
  }
}

function _MarkdownWidget({ data, style }: { data: string; style: CSSProperties }) {
  const [parsed, setParsed] = useState<TopLevelBlock[] | undefined>(undefined)

  useEffect(() => {
    setParsed(mdToRichText(data).content)
  }, [])

  if (!parsed) return
  return (
    <div className={'message-rich-text'} style={style}>
      <RichTextRenderer data={parsed} />
    </div>
  )
}
