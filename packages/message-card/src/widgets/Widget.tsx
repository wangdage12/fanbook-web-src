import React from 'react'
import { WidgetNodeType } from '../factory/WidgetFactory'
import WidgetTreeVisitor from '../visitors/WidgetTreeVisitor'
import { TextStyleData } from './TextWidget'
import WidgetTag from './WidgetTag'

/**
 * Widget 是所有消息卡片组件的基类，其所有子类的构造函数都应该是无参的，这是为了将所有组件反序列化委托给 Visitor
 * 因为 Visitor 的方法需要接受一个组件实例，且反序列化之前无此实例引用，因此为了让 Visitor 能处理组件，反序列化要求能直接 new 一个
 * 组件实例，所以此实例必须是无参的，或者允许不带参数实例化。
 *
 * Why：为什么使用这种方式，而不是直接在 WidgetFactory 中使用 switch-case 来创建组件实例？
 * 如果在 WidgetFactory 中判断所有类型，为了代码清晰，其实相当于把 Visitor 的方法在 WidgetFactory 重写一遍，仅仅是每个 `visit`
 * 方法的参数从 Widget 变成了 WidgetNodeType，那么还不如复用 Visitor 逻辑，它的代价如上所述，要求组件实例必须是无参的。
 * 我认为这一点牺牲可以接受。
 */
export abstract class Widget {
  parent?: Widget

  public width?: number
  public height?: number
  public padding?: string
  public flex?: 'tight' | 'loose'
  public textStyle?: TextStyleData

  protected constructor(public tag: WidgetTag | `${WidgetTag}`) {}

  protected abstract accept(visitor: WidgetTreeVisitor): void

  init(data: object) {
    Object.assign(this, data)
  }

  /**
   * 将组件转换为 React 组件，这个实现也可以放到 Visitor 里面，不过为了直观，还是放到组件自身比较好。
   */
  public abstract toReactComponent(): React.JSX.Element
}

export abstract class SingleChildWidget extends Widget {
  public child?: WidgetNodeType
}

export default abstract class MultiChildrenWidget extends Widget {
  children: WidgetNodeType[] = []
}
