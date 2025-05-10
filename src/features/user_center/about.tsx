import { Card, Divider, ModalProps } from 'antd'

interface AboutProps extends Omit<ModalProps, ''> {
  [x: string]: unknown

  onItemClick?: (url: string, name: string) => void
}

const About = ({ ...props }: AboutProps) => {
  props.width = props.width || 800

  return (
    <Card className="h-[100%] overflow-hidden rounded-lg" styles={{ body: { height: 'calc(100% - 56px)' } }}>
      <div className="cursor-pointer">
        <div
          className="flex justify-between text-sm"
          onClick={() => props.onItemClick && props.onItemClick(`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/terms/terms.html`, '用户协议')}
        >
          用户协议
          <iconpark-icon name="Right" fill={'darkgray'}></iconpark-icon>
        </div>
      </div>
      <Divider className="my-[20px]" />
      <div className="cursor-pointer">
        <div
          className="flex justify-between text-sm text-[var(--fg-b100)]"
          onClick={() => props.onItemClick && props.onItemClick(`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/privacy/privacy.html`, '隐私保护')}
        >
          隐私保护
          <iconpark-icon name="Right" fill={'darkgray'}></iconpark-icon>
        </div>
      </div>
      <Divider className="my-[20px]" />
      <div className="cursor-pointer">
        <div
          className="flex justify-between text-sm"
          onClick={() => props.onItemClick && props.onItemClick(`${import.meta.env.FANBOOK_PROTOCOL_PREFIX}/convention/convention.html`, '社区公约')}
        >
          社区公约
          <iconpark-icon name="Right" fill={'darkgray'}></iconpark-icon>
        </div>
      </div>
      <Divider className="my-[20px]" />
    </Card>
  )
}

export default About
