import TenSizeTag from 'fb-components/components/TenSizeTag.tsx'
import FormSection from '../../../../components/form/FormSection.tsx'
import FormBodyCommon from '../../../../components/form/body/FormBodyCommon.tsx'
import { copyText } from '../../../../utils/clipboard.ts'
import { ChannelSettingsSubPageProps } from '../CircleChannelSettings.tsx'

export default function ChannelInfoSettings({ value: channel }: ChannelSettingsSubPageProps) {
  return (
    <div className={'px-6 py-3'}>
      <FormSection title={'圈子信息'}>
        <FormBodyCommon
          title="圈子 ID"
          bottomBorder
          suffix={
            <div
              className="flex items-center cursor-pointer gap-1"
              onClick={() => {
                copyText(channel.channel_id)
              }}
            >
              <span>{channel.channel_id}</span>
              <TenSizeTag text="复制" color="gray"></TenSizeTag>
            </div>
          }
        ></FormBodyCommon>
      </FormSection>
    </div>
  )
}
