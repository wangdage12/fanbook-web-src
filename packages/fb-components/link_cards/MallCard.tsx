import queryString from 'query-string'
import { CSSProperties, useMemo } from 'react'
import FbAvatar from '../components/FbAvatar'
import { safeJSONParse } from '../utils/safeJSONParse'

export const MALL_LINK_PATTERN = /^https?:\/\/shop.*.fanbook.(mobi|cc|cn)/

export enum GoodCurrencyType {
  RMB,
  POINT,
}

export enum MallInfoType {
  SHOP = '1',
  // GOOD = '2',
}

export interface MallInfo {
  goodsCover: string
  goodsInfoType: MallInfoType
  goodsName?: string
  goodsOriginPrice?: string
  goodsPrice: string
  currencyType?: GoodCurrencyType
  shopName: string
}

interface MallCardProp {
  url: string
  style?: CSSProperties
  onClick?: (url: string) => void
}

export default function MallCard({ url, style, onClick }: MallCardProp) {
  const mallInfo = useMemo(() => {
    try {
      const res = queryString.parseUrl(url)
      const shareParams = res.query['shareParams']
      if (typeof shareParams == 'string' && shareParams) {
        const info = safeJSONParse(decodeURIComponent(atob(shareParams)) as unknown as MallInfo, undefined)
        return info
      }
    } catch (e) {
      return undefined
    }
  }, [url])

  return (
    <div
      className={'w-[360px] cursor-pointer rounded-lg bg-[var(--fg-white-1)] p-2.5'}
      style={style}
      onClick={() => (onClick ? onClick(url) : window.open(url, '_blank'))}
    >
      {mallInfo ?
        <ValidContent mallInfo={mallInfo} />
      : <InvalidContent />}
    </div>
  )
}

function ValidContent({ mallInfo }: { mallInfo: MallInfo }) {
  return mallInfo.goodsInfoType == MallInfoType.SHOP ? <ShopCard mallInfo={mallInfo}></ShopCard> : <GoodCard mallInfo={mallInfo}></GoodCard>
}

function getPriceText(price: string, type?: GoodCurrencyType) {
  return type == GoodCurrencyType.POINT ? `${price} 积分` : `¥ ${price}`
}

function GoodCard({ mallInfo }: { mallInfo: MallInfo }) {
  return (
    <>
      <div className={'flex rounded-[8px] bg-[var(--bg-bg-3)]'}>
        <FbAvatar fbRadius={5} fbSize={72} src={mallInfo.goodsCover} />
        <div className={'ml-[10px] flex flex-1 flex-col justify-center overflow-hidden'}>
          <div className={' flex items-center text-sm  text-[var(--fg-b100)]'}>
            <div className={'line-clamp-2 text-base font-bold text-[var(--fg-b100)]'}>{mallInfo.goodsName ?? '商品'}</div>
          </div>
          <div className={'mt-[6px] flex  items-center'}>
            <span className={'text-base text-[var(--auxiliary-orange)]'}>{getPriceText(mallInfo.goodsPrice, mallInfo.currencyType)}</span>
            {mallInfo.goodsOriginPrice && mallInfo.goodsPrice != mallInfo.goodsOriginPrice && (
              <span className={'ml-[4px] text-sm text-[var(--fg-b30)] line-through'}>
                {getPriceText(mallInfo.goodsOriginPrice, mallInfo.currencyType)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={'mt-[10px] flex items-center text-sm text-[var(--fg-b30)]'}>
        <iconpark-icon name="Store" class={'mr-[4px]'} color={'var(--fg-b40)'}></iconpark-icon>
        <span className={'truncate'}>{mallInfo.shopName ?? 'Fanbook 商城'}</span>
      </div>
    </>
  )
}

function ShopCard({ mallInfo }: { mallInfo: MallInfo }) {
  return (
    <div className={'flex rounded-[8px] bg-[var(--bg-bg-3)]'}>
      <FbAvatar fbRadius={5} fbSize={48} src={mallInfo.goodsCover} />
      <div className={'ml-[10px] flex flex-1 flex-col justify-center overflow-hidden'}>
        <div className={' flex items-center text-sm  text-[var(--fg-b100)]'}>
          <div className={'line-clamp-2 text-base font-bold text-[var(--fg-b100)]'}>{mallInfo.shopName ?? 'Fanbook 商城'}</div>
        </div>
        <div className={'flex items-center'}>
          <span className={'text-base text-[var(--fg-b40)]'}>商家店铺</span>
        </div>
      </div>
    </div>
  )
}

function InvalidContent() {
  return (
    <div className={'flex rounded-[8px] bg-[var(--bg-bg-3)]'}>
      <div className={'truncate text-base font-bold text-[var(--fg-b100)]'}>店铺链接已失效</div>
    </div>
  )
}
