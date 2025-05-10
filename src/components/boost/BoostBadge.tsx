import { Tooltip } from 'antd'
import BoostBadgeImage from '../../assets/images/boost_badge.svg'

export function BoostBadgeIcon({ size = 12 }: { size?: number }) {
  return <img src={BoostBadgeImage} style={{ height: size, width: size }} />
}

const BoostBadge = ({ level = 1, tooltip = true }: { level?: number; tooltip?: boolean }) => {
  return (
    <Tooltip title={tooltip ? `解锁社区等级 LV.${level} 后可使用` : undefined} placement="top">
      <span className="inline-flex w-fit items-center gap-[4px] rounded-full bg-[var(--function-yellow-3)] px-[6px] text-[12px] font-bold italic">
        <BoostBadgeIcon />
        <span className="text-transparent bg-[linear-gradient(180deg,_#FF8C00_0%,_#FFB726_100%)] bg-clip-text [-webkit-text-fill-color:transparent]">
          LV.{level}
        </span>
      </span>
    </Tooltip>
  )
}

export default BoostBadge
