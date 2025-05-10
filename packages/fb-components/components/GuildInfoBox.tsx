import { GuildInfoStruct } from '../struct/type'
import CosImageUtils from '../utils/CosImageUtils'
import FbImage from './image/FbImage'

const GuildInfoBox = ({ data, onClick }: { data: GuildInfoStruct; onClick?: () => void }) => {
  const { icon, name } = data
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-row items-center rounded-[10px] border-[0.5px] border-[var(--fg-b20)] px-[12px] py-[8px]"
    >
      <div className="flex flex-1 items-center truncate">
        <FbImage src={icon && CosImageUtils.thumbnailMin(icon, 24)} width={24} height={24} className={'rounded-[4px]'}></FbImage>
        <div className="ml-1.5 w-3/4 truncate text-[12px] text-[var(--fg-b100)]">来自 {name}</div>
      </div>
      <iconpark-icon name="Right" color={'var(--fg-b20)'}></iconpark-icon>
    </div>
  )
}

export default GuildInfoBox
