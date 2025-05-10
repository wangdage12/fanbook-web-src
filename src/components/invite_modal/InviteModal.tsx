import { Button, Dropdown, Form, Input, MenuProps } from 'antd'
import showFbModal, { ShowFbModalProps } from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbSelect from 'fb-components/base_ui/fb_select/index'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import React, { useEffect, useState } from 'react'
import InviteApi, { InviteCodeRequestArgs, InviteLinkInfo } from '../../features/invite/invite_api'
import { InviteUtils } from '../../features/invite/utils.tsx'
import { FbHttpResponse } from '../../types'
import { copyText } from '../../utils/clipboard'
import EmptyData from '../EmptyData'
import FormSection from '../form/FormSection.tsx'
import RealtimeChannelName from '../realtime_components/RealtimeChannel'

interface InviteModal {
  guildId: string
  channelId?: string
  onOpen?: () => void
  onClose?: () => void
}

enum InviteCodeStatus {
  Loading,
  NoPermission,
  Idle,
  Error,
}

export function InviteModal({ onClose, onOpen, guildId, channelId }: InviteModal) {
  const [status, setStatus] = useState(InviteCodeStatus.Loading)
  const [inviteCode, setInviteCode] = useState<InviteLinkInfo>()
  const [linkType, setLinkType] = useState<'exclusive' | 'normal'>()
  useEffect(() => {
    fetch().then()
  }, [])

  useEffect(() => {
    if (!linkType) {
      setLinkType(hasExclusive() ? 'exclusive' : 'normal')
    }
  }, [inviteCode])

  async function fetch() {
    async function handleResult(data: FbHttpResponse<InviteLinkInfo>) {
      if (data.code == 1000 && data.data.url) {
        setInviteCode(data.data)
        setStatus(InviteCodeStatus.Idle)
      } else if (data.code == 1012) {
        setStatus(InviteCodeStatus.NoPermission)
      } else if (Object.keys(data.data).length == 0) {
        const args: InviteCodeRequestArgs = {
          channel_id: channelId,
          guild_id: guildId,
          // user_id: StateUtils.localUser?.user_id,
          v: Date.now(),
          type: 1,
          time: '-1',
          number: '-1',
        }
        const { data } = await InviteApi.getInviteCode(args)
        handleResult(data)
      } else {
        setStatus(InviteCodeStatus.Error)
      }
    }

    setStatus(InviteCodeStatus.Loading)
    const args: InviteCodeRequestArgs = {
      channel_id: channelId,
      guild_id: guildId,
      // user_id: StateUtils.localUser?.user_id,
      v: Date.now(),
      type: 2,
    }
    const { data } = await InviteApi.getInviteCode(args)
    await handleResult(data)
  }

  const items: MenuProps['items'] = [
    {
      key: 'normal',
      label: <div onClick={() => setLinkType('normal')}>普通邀请码</div>,
    },
    {
      key: 'exclusive',
      label: <div onClick={() => setLinkType('exclusive')}>专属邀请码</div>,
    },
  ]

  const hasExclusive = () => inviteCode?.customize && inviteCode.customize.url && inviteCode.customize.status == 1

  const displayUrl = linkType === 'exclusive' ? inviteCode?.customize?.url : inviteCode?.url

  const prefixSelector =
    !hasExclusive() ? null : (
      <Form.Item name="prefix" noStyle>
        <Dropdown menu={{ items }} placement="bottom" trigger={['click']} align={{ offset: [-10, 10] }}>
          <div className={'inline-flex cursor-pointer items-center text-[14px] text-[var(--fg-b100)]'}>
            {(
              items.find(item => {
                return item?.key == linkType
              }) as unknown as {
                label: React.ReactElement
              }
            )?.label ?? ''}
            <iconpark-icon name="TriangleDown" class={'ml-[2px]'} size={17}></iconpark-icon>
            <div className={'mr-[8px] h-[18px] w-[12px] border-r-[0.5px] border-r-[var(--fg-b20)]'}></div>
          </div>
        </Dropdown>
      </Form.Item>
    )

  const getExpireText = () => {
    let value = ''
    let isExpire
    const minuteLeft = inviteCode?.expire
    const timesLeft = inviteCode?.number_less
    if (linkType === 'exclusive') {
      isExpire = false
      value += '永久有效，无限次数。'
    } else {
      isExpire = inviteCode?.expire == '0' || inviteCode?.number_less == '0'
      if (minuteLeft == '0') {
        value = '分享链接已失效，请重新设置。'
      } else if (timesLeft == '0') {
        value = '链接分享次数已超过限制，请重新设置。'
      } else {
        if (minuteLeft == '-1') {
          value += '永久有效，'
        } else {
          value += `有效期还剩${InviteUtils.formatSecond(parseInt(minuteLeft ?? '0'))}，`
        }
        if (timesLeft == '-1') {
          value += '无限次数。'
        } else {
          value += `使用次数还剩${timesLeft}次。`
        }
      }
    }

    return <span style={{ color: isExpire ? 'var(--function-red-1)' : '' }}>{value}</span>
  }

  const onEdit = () => {
    onClose?.()
    const { destroy: close, update } = showFbModal({
      title: '编辑邀请链接',
      onCancel: () => {
        onOpen?.()
      },
      okButtonProps: {
        form: 'edit-invite-link-form',
        htmlType: 'submit',
        onClick: undefined,
      },
      showCancelButton: false,
      content: (
        <InviteSettingForm
          guildId={guildId}
          channelId={channelId}
          initialData={inviteCode}
          updateOkProps={props => update({ okButtonProps: props })}
          onClose={data => {
            close()
            onOpen?.()
            if (data) setInviteCode(data)
          }}
        />
      ),
    })
  }

  return (
    <>
      <div className="h-[120px]">
        {(() => {
          switch (status) {
            case InviteCodeStatus.Loading:
              return (
                <div className={'flex h-full w-full items-center justify-center '}>
                  <CircularLoading size={24}></CircularLoading>
                </div>
              )
            case InviteCodeStatus.Error:
              return <EmptyData></EmptyData>
            case InviteCodeStatus.NoPermission:
              return <EmptyData message={'无权限'}></EmptyData>
            case InviteCodeStatus.Idle:
              return (
                <Form>
                  <div className="mt-[10px] text-sm text-[var(--fg-b100)]">分享此链接,朋友点击即可加入</div>
                  <div className="mt-[10px] flex h-[40px]">
                    <Input prefix={prefixSelector} value={displayUrl} readOnly className={'h-full'} />
                    <Button
                      type="primary"
                      className="ml-2 h-full w-[96px]"
                      onClick={async () => {
                        displayUrl && copyText(displayUrl, '复制成功，分享给好友吧~')
                      }}
                    >
                      复制
                    </Button>
                  </div>
                  <div className="text my-[10px] text-sm text-[var(--fg-b60)]">
                    {getExpireText()}
                    {linkType === 'normal' && <a onClick={onEdit}>编辑邀请链接</a>}
                  </div>
                </Form>
              )
            default:
              return null
          }
        })()}
      </div>
    </>
  )
}

interface InviteSettingModalArgs {
  guildId: string
  channelId?: string
  initialData?: InviteLinkInfo
  onClose?: (data?: InviteLinkInfo) => void
}

function InviteSettingForm({ onClose, guildId, channelId, initialData, updateOkProps }: InviteSettingModalArgs & ShowFbModalProps) {
  const [form] = Form.useForm()
  const setLoading = (loading: boolean) => {
    updateOkProps?.({ loading })
  }
  const onFinish = async (values: InviteLinkInfo) => {
    const args: InviteCodeRequestArgs = {
      type: 1,
      guild_id: guildId,
      channel_id: channelId,
      v: Date.now(),
      ...values,
    }
    setLoading(true)
    try {
      const { data } = await InviteApi.getInviteCode(args)
      if (data.code == 1000 && data.data.url) onClose?.(data.data)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Form id="edit-invite-link-form" layout="vertical" initialValues={initialData} form={form} onFinish={onFinish} onFinishFailed={() => {}}>
      <FormSection title={'有效期'}>
        <Form.Item name={'time'}>
          <FbSelect
            size={'middle'}
            options={[
              { label: '永久', value: '-1' },
              { label: '30天', value: `${30 * 24 * 3600}` },
              { label: '15天', value: `${15 * 24 * 3600}` },
              { label: '7天', value: `${7 * 24 * 3600}` },
              { label: '1天', value: `${24 * 3600}` },
              { label: '12小时', value: `${12 * 3600}` },
              { label: '6小时', value: `${6 * 3600}` },
              { label: '1小时', value: '3600' },
              { label: '30分钟', value: `${0.5 * 3600}` },
            ]}
          ></FbSelect>
        </Form.Item>
      </FormSection>
      <FormSection title={'使用次数'}>
        <Form.Item name={'number'}>
          <FbSelect
            options={[
              { label: '无限', value: '-1' },
              { label: '1', value: '1' },
              { label: '5', value: '5' },
              { label: '10', value: '10' },
              { label: '25', value: '25' },
              { label: '50', value: '50' },
              { label: '100', value: '100' },
              { label: '500', value: '500' },
              { label: '1000', value: '1000' },
            ]}
          ></FbSelect>
        </Form.Item>
      </FormSection>
      <FormSection title={'设置备注'}>
        <Form.Item name="remark">
          <Input placeholder="请输入备注名" maxLength={12} showCount />
        </Form.Item>
      </FormSection>
    </Form>
  )
}

export function showInviteModal(guildId: string, channelId?: string) {
  const { destroy: close } = showFbModal({
    width: 540,
    title: (
      <span>
        邀请好友加入{' '}
        {channelId ?
          <RealtimeChannelName prefixChannelIcon guildId={guildId} channelId={channelId} />
        : ''}
      </span>
    ),
    showOkButton: false,
    showCancelButton: false,
    onCancel: () => {
      close()
    },
    content: <InviteModal guildId={guildId} channelId={channelId}></InviteModal>,
  })
}
