import AspectRatioWidget from '../widgets/AspectRatioWidget'
import ButtonWidget from '../widgets/ButtonWidget'
import ChannelNameWidget from '../widgets/ChannelNameWidget'
import ContainerWidget from '../widgets/ContainerWidget'
import DividerWidget from '../widgets/DividerWidget'
import ImageWidget from '../widgets/ImageWidget'
import KeySetWidget from '../widgets/KeySetWidget'
import AbsoluteLayoutWidget, { PositionedWidget } from '../widgets/layouts/AbsoluteLayoutWidget'
import FlexLayoutWidget from '../widgets/layouts/FlexLayoutWidget'
import WrapLayoutWidget from '../widgets/layouts/WrapLayoutWidget'
import MarkdownWidget from '../widgets/MarkdownWidget'
import TextWidget from '../widgets/TextWidget'
import UserAvatarWidget from '../widgets/UserAvatarWidget'
import UsernameWidget from '../widgets/UsernameWidget'
import MultiChildrenWidget, { SingleChildWidget, Widget } from '../widgets/Widget'
import WidgetTag from '../widgets/WidgetTag'

export type WidgetNodeType =
  | Partial<TextWidget>
  | Partial<ImageWidget>
  | Partial<UsernameWidget>
  | Partial<UserAvatarWidget>
  | Partial<ChannelNameWidget>
  | Partial<MarkdownWidget>
  | Partial<ContainerWidget>
  | Partial<AspectRatioWidget>
  | Partial<AbsoluteLayoutWidget>
  | Partial<PositionedWidget>
  | Partial<FlexLayoutWidget>
  | Partial<WrapLayoutWidget>
  | Partial<DividerWidget>
  | Partial<ButtonWidget>
  | Partial<KeySetWidget>

export default class WidgetFactory {
  static fromJson(data: WidgetNodeType): Widget {
    const widget = (() => {
      switch (data.tag as WidgetTag) {
        case WidgetTag.Text:
          return new TextWidget()
        case WidgetTag.Image:
          return new ImageWidget()
        case WidgetTag.Username:
          return new UsernameWidget()
        case WidgetTag.UserAvatar:
          return new UserAvatarWidget()
        case WidgetTag.ChannelName:
          return new ChannelNameWidget()
        case WidgetTag.Container:
          return new ContainerWidget()
        case WidgetTag.Button:
          return new ButtonWidget()
        case WidgetTag.Markdown:
          return new MarkdownWidget()
        case WidgetTag.AspectRatio:
          return new AspectRatioWidget()
        case WidgetTag.Divider:
          return new DividerWidget()
        case WidgetTag.Stack:
          return new AbsoluteLayoutWidget()
        case WidgetTag.Positioned:
          return new PositionedWidget()
        case WidgetTag.Row:
        case WidgetTag.Column:
          return new FlexLayoutWidget(data.tag as WidgetTag)
        case WidgetTag.Wrap:
          return new WrapLayoutWidget()
        case WidgetTag.KeySet:
          return new KeySetWidget()
      }
    })()
    if (!widget) {
      console.warn('Unknown widget tag: ' + data.tag)
      return new ContainerWidget()
    }

    widget.init(data)

    if ((data as SingleChildWidget).child) {
      const child = WidgetFactory.fromJson((data as SingleChildWidget).child!)
      child.parent = widget
      // eslint-disable-next-line no-extra-semi,@typescript-eslint/no-non-null-assertion
      ;(widget as SingleChildWidget).child = child
    } else if ((data as MultiChildrenWidget).children) {
      // eslint-disable-next-line no-extra-semi,@typescript-eslint/no-non-null-assertion
      ;(widget as MultiChildrenWidget).children = (data as MultiChildrenWidget).children.map(e => {
        const child = WidgetFactory.fromJson(e)
        child.parent = widget
        return child
      })
    }

    return widget
  }
}
