import './index.less'

import { Layout, Menu, Modal, ModalProps } from 'antd'
import FbModal from 'fb-components/base_ui/fb_modal/index.tsx'
import FbModalLink from 'fb-components/base_ui/fb_modal_link/index'
import HoverBox from 'fb-components/components/HoverBox.tsx'
import React, { useRef } from 'react'
import AppRoutes from '../../app/AppRoutes'
import { router } from '../../app/router'
import { FormModalContext } from '../../components/form/FormModalContext.tsx'
import StateUtils from '../../utils/StateUtils'
import { feedback } from '../../utils/jump.tsx'
import showUnsupportedFeatureToast from '../../utils/showUnsupportedFeatureToast.tsx'
import About from './about'
import Privacy from './privacy'
import Profile from './profile'

const { Content, Sider } = Layout

interface UserCenterProps extends Omit<ModalProps, ''> {
  [x: string]: unknown
}

const UserCenter = ({ onCancel, ...props }: UserCenterProps) => {
  const [selectedKeys, setSelectedKeys] = React.useState(['profile'])
  const [modalLinkOpen, setModalLinkOpen] = React.useState(false)
  const [modalTitle, setModalTitle] = React.useState('')
  const [modalLink, setModalLink] = React.useState('')

  const items = [
    {
      key: 'profile',
      icon: <iconpark-icon name="User" size={17} fill={selectedKeys.includes('profile') ? 'var(--fg-blue-1)' : 'var(--fg-b100)'}></iconpark-icon>,
      label: '个人资料',
      component: <Profile />,
    },
    {
      key: 'privacy',
      icon: (
        <iconpark-icon name="LockShield" size={17} fill={selectedKeys.includes('privacy') ? 'var(--fg-blue-1)' : 'var(--fg-b100)'}></iconpark-icon>
      ),
      label: '隐私设置',
      component: <Privacy />,
    },
    {
      key: 'feedback',
      icon: (
        <iconpark-icon name="Message2" size={17} fill={selectedKeys.includes('feedback') ? 'var(--fg-blue-1)' : 'var(--fg-b100)'}></iconpark-icon>
      ),
      label: '意见反馈',
    },
    {
      key: 'about',
      icon: <iconpark-icon name="DoubleUser" size={17} fill={selectedKeys.includes('about') ? 'var(--fg-blue-1)' : 'var(--fg-b100)'}></iconpark-icon>,
      label: '关于我们',
      component: (
        <About
          onItemClick={(url: string) => {
            window.open(url, '_blank')
          }}
        />
      ),
    },
    {
      key: 'logout',
      icon: <iconpark-icon name="LoginOut" size={17} fill={'var(--function-red-1)'}></iconpark-icon>,
      label: '退出登录',
      danger: true,
    },
  ]

  const beforeClose = useRef<(() => Promise<boolean>) | null>()

  function handleClose(evt: any) {
    if (beforeClose.current) {
      beforeClose.current().then(shouldClose => {
        if (shouldClose) {
          onCancel?.(evt)
        } else {
          FbModal.error({
            title: '退出编辑',
            content: '你做的修改尚未保存，确定退出吗？',
            okText: '退出',
            cancelText: '继续编辑',
            onOk: () => {
              onCancel?.(evt)
            },
          })
        }
      })
    } else {
      onCancel?.(evt)
    }
  }

  function handleSwitchTab(key: string) {
    const item = items.find(item => item.key === key)
    function doSwitch() {
      switch (key) {
        case 'logout':
          FbModal.error({
            title: '退出登录',
            content: '退出登录后,你将无法收到当前账号的通知',
            okText: '退出',
            cancelText: '取消',
            okButtonProps: {
              danger: true,
            },
            onOk: async () => {
              Modal.destroyAll()
              await StateUtils.logout()
              router
                .navigate(AppRoutes.LOGIN, {
                  replace: true,
                  state: { mobile: 'localUser!.encryption_mobile' },
                })
                .then()
            },
          })
          break
        case 'feedback':
          feedback()
          break
        default:
          if (item?.component) {
            setSelectedKeys([item.key])
          } else {
            showUnsupportedFeatureToast()
          }
      }
    }

    if (beforeClose.current && key !== 'logout') {
      beforeClose.current().then(shouldClose => {
        if (shouldClose) {
          doSwitch?.()
        } else {
          FbModal.error({
            title: '切换编辑',
            content: '你做的修改尚未保存，确定切换吗？',
            okText: '切换',
            cancelText: '继续编辑',
            onOk: () => {
              doSwitch?.()
            },
          })
        }
      })
    } else {
      doSwitch?.()
    }
  }

  return (
    <FormModalContext.Provider
      value={{
        setBeforeClose(fn) {
          beforeClose.current = fn
        },
      }}
    >
      <Modal
        {...props}
        keyboard={false}
        width={950}
        className="fb-modal-user-center"
        centered
        footer={false}
        closeIcon={null}
        title={
          <div
            className="flex h-[56px] min-w-[500px]
        items-center justify-between border-0 border-b-[1px]
        border-solid border-b-[var(--fg-b10)] px-6
        text-lg font-bold text-[var(--fg-b100)]
        "
          >
            <span>个人中心</span>
            <HoverBox onClick={handleClose} className="h-8 w-8 !p-1.5">
              <iconpark-icon name="Close" fill="var(--fg-b100)" size={20}></iconpark-icon>
            </HoverBox>
          </div>
        }
      >
        <Layout>
          <Sider theme="light" width={230}>
            <Menu
              theme="light"
              mode="inline"
              className="box-border h-[100%] border-0 border-solid border-[var(--fg-b10)] px-4 py-2"
              selectedKeys={selectedKeys}
              items={items}
              onSelect={({ key }) => {
                handleSwitchTab(key)
              }}
            />
          </Sider>
          <Layout className="min-w-[600px]">
            <Content style={{ margin: '24px 16px 0' }}>{items.find(item => item.key === selectedKeys[0])?.component}</Content>
          </Layout>
        </Layout>
      </Modal>
      <FbModalLink
        src={modalLink}
        fbTitle={modalTitle}
        open={modalLinkOpen}
        width={415}
        footer={null}
        onCancel={() => {
          setModalTitle('')
          setModalLink('')
          setModalLinkOpen(false)
        }}
      ></FbModalLink>
    </FormModalContext.Provider>
  )
}

export default UserCenter
