import queryString from 'query-string'
import FbImage from './image/FbImage.tsx'

export default function LinkCard({ url, onClick }: { url: string; onClick?: () => void }) {
  const backupIcon = (
    <span className="w-[48px] h-[48px] flex items-center justify-center bg-[var(--fg-b5)] rounded-lg flex-shrink-0">
      <iconpark-icon name="Link-Normal" size={24} class="text-[var(--fg-b40)] "></iconpark-icon>
    </span>
  )
  return (
    <section
      className={`flex items-center bg-[var(--fg-b5)] w-fit rounded-lg p-2.5 gap-2.5 min-w-[360px] max-w-[480px] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <FbImage width={48} height={48} src={queryString.parseUrl(url).url + '/favicon.ico'} placeholder={backupIcon} fallback={backupIcon} />
      <span className="truncate">{url}</span>
    </section>
  )
}
