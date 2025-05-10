import { Form, FormInstance, Radio } from 'antd'
import { MediaModerationMode } from 'fb-components/struct/ChannelStruct.ts'
import { useEffect } from 'react'
import FormSection from '../../../../components/form/FormSection.tsx'

/**
 * 音视频房间的控场模式设置
 * @constructor
 */
export default function MediaModerationModeSettings({ form }: { form?: FormInstance }) {
  const voiceControl = Form.useWatch('voice_control', form)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    form!.setFieldValue('public', voiceControl !== MediaModerationMode.Moderator)
  }, [voiceControl])

  return (
    <div className={'flex-1'}>
      <FormSection title={'控场模式'} formStyle={'border'}>
        <Form.Item name={'voice_control'}>
          <Radio.Group className={'vertical-radio-group vertical-radio-group-multiline'}>
            <Radio value={MediaModerationMode.Free}>
              <div>自由模式</div>
              <div className={'subtitle'}>自由发言模式下，仅频道主、高级管理员和频道管理员可以控场。</div>
            </Radio>
            <Radio value={MediaModerationMode.Moderator}>
              <div>指定主持人</div>
              <div className={'subtitle'}>选择指定成员赋予当前频道的控场权限。</div>
            </Radio>
            <Radio value={MediaModerationMode.TemporaryModerator}>
              <div>临时主持人</div>
              <div className={'subtitle'}>当前频道的第一位成员将获得控场权限，退出后权限将顺延至下一位成员。</div>
            </Radio>
          </Radio.Group>
        </Form.Item>
        {/* 用来表单验证，无 UI */}
        <Form.Item name={'public'} noStyle />
      </FormSection>
    </div>
  )
}
