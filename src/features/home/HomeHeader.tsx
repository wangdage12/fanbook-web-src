import BetaImg from '../../assets/images/beta.svg'
import LogoText from '../../assets/images/logo-text.svg'
import browser from '../../utils/browser'

export default function HomeHeader() {
  let className = 'flex h-[32px] min-w-[200px] flex-shrink-0 items-center gap-[8px] px-[14px]'
  if (browser.isDesktop()) {
    className += ' justify-center'
  }
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div className={className} style={browser.isDesktop() ? ({ WebkitAppRegion: 'drag' } as any) : {}}>
      <a href={'https://fanbook.idreamsky.com/'} className={'inline-block'} target={'_blank'} rel="noreferrer">
        <img className={'h-[14px] w-[65px]'} src={LogoText} alt={''} draggable={false} />
      </a>
      <div className={'h-[12px] w-[28px] rounded-[3px] '}>
        <img className={'h-[14px] w-[65px]'} src={BetaImg} alt={''} draggable={false} />
      </div>
    </div>
  )
}
