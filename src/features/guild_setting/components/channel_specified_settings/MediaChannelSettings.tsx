import { Form, InputNumber, Select, SelectProps, Slider } from 'antd'
import { useMemo } from 'react'
import BoostBadge from '../../../../components/boost/BoostBadge.tsx'
import FormSection from '../../../../components/form/FormSection.tsx'
import Benefit from '../../../guild_level/Benefit.ts'
import { GuildLevelHelper, VerificationStatus } from '../../../guild_level/guild-level-slice.ts'
import GuildUtils from '../../../guild_list/GuildUtils.tsx'

export default function MediaChannelSettings() {
  const guildId = GuildUtils.getCurrentGuildId() as string
  const level = GuildLevelHelper.getLevel(guildId)
  const options: SelectProps['options'] = useMemo(() => {
    const labels = ['流畅-16kbps', '正常-32kbps', '较好-64kbps', '高质量-128kbps']
    return Benefit.mediaQualities.map((e, i) => ({
      value: e.value,
      label: labels[i],
      disabled: level < e.requiredLevel,
    }))
  }, [level])
  const maxMembers = useMemo(() => {
    if (VerificationStatus.officialVerified(guildId)) return 500
    return Benefit.getMediaMaxMembers(level)?.value ?? 0
  }, [level])

  const MIN = 1
  return (
    <>
      <FormSection title={'声音质量'}>
        <Form.Item name={'quality'}>
          <Select
            size={'large'}
            className={'!w-[320px]'}
            options={options}
            suffixIcon={<iconpark-icon color={'var(--fg-b40)'} size={16} name="Down" />}
            optionRender={({ label }, { index }) => (
              <QualityOptionRenderer label={label as string} index={index} disabled={options[index].disabled} />
            )}
          />
        </Form.Item>
      </FormSection>
      <FormSection
        title={'用户限制'}
        tailSlot={
          <div className={'flex items-center'}>
            <Form.Item name={'user_limit'}>
              <InputNumber min={MIN} max={maxMembers} className={'mr-1 w-16 text-xs'} size={'small'} />
            </Form.Item>
            <div className={'text-xs text-[var(--fg-b60)]'}>用户</div>
          </div>
        }
      >
        <div className={'flex flex-col'}>
          <div className={'mt-2 flex justify-between text-xs text-[var(--fg-b40)]'}>
            <p>{MIN}</p>
            <p>{maxMembers}</p>
          </div>
          <Form.Item name={'user_limit'} help={'限制可进入频道的用户上限数，拥有管理权限的用户不参与统计。'}>
            <Slider
              min={MIN}
              max={maxMembers}
              tooltip={{
                formatter: value => `${value}用户`,
              }}
            />
          </Form.Item>
        </div>
      </FormSection>
    </>
  )
}

function QualityOptionRenderer({ label, index, disabled }: { label: string; index: number; disabled?: boolean }) {
  return (
    <div className={'flex justify-between'}>
      {label}
      {disabled && <BoostBadge level={Benefit.mediaQualities[index].requiredLevel} />}
    </div>
  )
}
