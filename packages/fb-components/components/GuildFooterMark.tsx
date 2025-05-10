import { GuildInfoStruct } from '../struct/type'
import CosImageUtils from '../utils/CosImageUtils'
import FbImage from './image/FbImage'

const GuildFooterMark = ({ data }: { data: GuildInfoStruct }) => {
  const { icon, name } = data
  return (
    <>
      <div className="clear-both mx-0 my-[8px] flex w-full min-w-full border-b-[1px] border-[var(--fg-b5)]"></div>
      <div className={'mb-[0px] flex flex-row items-center'}>
        <FbImage src={icon && CosImageUtils.thumbnailMin(icon, 16)} width={16} height={16} className={'rounded-[4px]'}></FbImage>
        <span className={'truncate ml-[6px] flex-1 text-xs text-[var(--fg-b60)]'}>{name}</span>
      </div>
    </>
  )
}

export default GuildFooterMark
