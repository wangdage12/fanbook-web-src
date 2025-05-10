import clsx from 'clsx'
import FbToast from 'fb-components/base_ui/fb_toast'
import CosImage from 'fb-components/components/image/CosImage.tsx'
import { GuildPostType, GuildPosterStruct } from 'fb-components/struct/GuildStruct.ts'
import { CSSProperties, useState } from 'react'
import Slider, { Settings } from 'react-slick'
import AppRoutes from '../../app/AppRoutes.ts'
import { router } from '../../app/router.tsx'
import { store } from '../../app/store.ts'
import LinkHandlerPresets from '../../services/link_handler/LinkHandlerPresets.ts'
import checkLinkIsLegal from '../../utils/linkAuditChecker.ts'
import GuildUtils from '../guild_list/GuildUtils.tsx'
import { guildListActions } from '../guild_list/guildListSlice.ts'
import { OpenMiniProgramOptions } from '../mp-inner/util.ts'
import './banner-slider.less'

interface BannerSliderProps {
  rootClassName?: string
  images: GuildPosterStruct[]
  imageStyle?: CSSProperties
}

export default function BannerSlider({ rootClassName = '', images, imageStyle }: BannerSliderProps) {
  const [dragging, setDragging] = useState(false)
  const settings: Settings = {
    dots: true,
    infinite: images.length > 1,
    arrows: false,
    beforeChange: () => setDragging(true),
    afterChange: () => setDragging(false),
    autoplay: true,
    autoplaySpeed: 5000,
  }

  async function onBannerTap(info: GuildPosterStruct) {
    if (dragging) return
    // 进入H5
    if (info.type == GuildPostType.Link && info.url != null) {
      const isLegal = await checkLinkIsLegal(info.url)
      if (!isLegal) {
        FbToast.open({ type: 'warning', content: '网页有风险，无法访问' })
        return
      }
      LinkHandlerPresets.instance.common.handleUrl(info.url, { guildId: info.guild_id, isFromDM: false } as OpenMiniProgramOptions)
      return
    }
    const guild = GuildUtils.getGuildById(info.guild_id)
    if (guild == null) return
    const { guild_id, channel_id } = info
    if (!guild_id || !channel_id) return
    // 进入文字频道
    if (info.type == GuildPostType.TextChannel) {
      router.navigate(`${AppRoutes.CHANNELS}/${guild_id}/${channel_id}`).then()
      store.dispatch(guildListActions.updateSelectedChannelId([guild_id, channel_id]))
      return
    }

    // 进入圈子
    if (info.type == GuildPostType.CircleChannel) {
      router.navigate(`${AppRoutes.CHANNELS}/${guild_id}/${AppRoutes.CIRCLE}?topicId=${channel_id}`).then()
    }
  }

  return (
    <Slider className={clsx([rootClassName, 'group'])} {...settings}>
      {images.map((e, i) => (
        <div key={i} className={'!block'}>
          <CosImage src={e.img} style={imageStyle} className={'cursor-pointer'} size={{ width: 240, height: 120 }} onClick={() => onBannerTap(e)} />
        </div>
      ))}
    </Slider>
  )
}
