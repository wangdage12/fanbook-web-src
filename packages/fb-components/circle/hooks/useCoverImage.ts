import { Size } from 'fb-components/components/type'
import { safeDivision } from 'fb-components/utils/common'

/**
 *
 * 宽高比<1:2.5
 * 图片宽铺满，高度按3:4比例获取最高高度图片从头裁剪
 *
 * 1:2.5<宽高比<3:4
 * 图片宽铺满，高度按3:4比例获取最高高度图片居中裁剪
 *
 * 3:4<宽高比<4:3
 * 图片宽铺满，高度自适应图片正常展示
 *
 * 宽高比>4:3
 * 图片高铺满，宽度按4:3比例获取最高宽度图片居中裁剪
 **/
function useCoverImage(size?: Size) {
  if (!size) return { align: 'center', ratio: 1 }

  const { width, height } = size
  const ratio = safeDivision(width, height)

  if (ratio < 1 / 2.5) {
    return {
      align: 'top',
      ratio: 3 / 4,
    }
  } else if (ratio >= 1 / 2.5 && ratio < 3 / 4) {
    return {
      align: 'center',
      ratio: 3 / 4,
    }
  } else if (ratio >= 3 / 4 && ratio < 4 / 3) {
    return {
      align: 'center',
      ratio,
    }
  } else {
    return {
      align: 'center',
      ratio: 4 / 3,
    }
  }
}

export default useCoverImage
