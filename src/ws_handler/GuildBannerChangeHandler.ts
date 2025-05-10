import { store } from '../app/store'
import { fetchBannerSlideData } from '../features/banner_slide/bannerSlideSlice.ts'

export function handleGuildBannerChange({ data }: { data: { guild_id: string } }) {
  const { guild_id } = data
  store.dispatch(fetchBannerSlideData(guild_id))
}
