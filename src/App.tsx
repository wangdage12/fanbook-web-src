import { legacyLogicalPropertiesTransformer, StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import MediaPreviewer from 'fb-components/components/previewer/MediaPreviewer'
import RichTextContext, { RichTextContextStruct } from 'fb-components/rich_text/RichTextContext'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import './App.css'
import { router } from './app/router'
import { persistor, store } from './app/store'
import themeDefault from './base_ui/themes/theme.default'
import EmptyPage from './components/EmptyPage'
import { RealtimeNickname } from './components/realtime_components/realtime_nickname/RealtimeUserInfo'
import RoleName from './components/realtime_components/RoleName'
import UserCard from './components/user_card'
import './event_tracker/index.ts'
import FBServiceLayer from './FBServiceLayer.tsx'
import CircleArticleTag from './features/circle/tag/CircleArticleTag.tsx'
import ImChannelLink from './features/message_list/components/ImChannelLink'
import { NetWorkStatusWrapper } from './features/network/NetWorkStatusWrapper'
import QuestionApi from './features/question/questionAPI.ts'
import { showQuestionDetailModal } from './features/question/QuestionModal'
import LinkHandlerPresets from './services/link_handler/LinkHandlerPresets.ts'
import { validBrowser } from './utils/browserSupport.ts'

function renderEmpty(/* componentName?: string */) {
  return <EmptyPage />
}

const richTextRenderer: RichTextContextStruct = {
  renderRole: ({ id, marks, guildId }) => {
    const prefix = marks.some(({ type }) => type === 'remove_at_mark') ? '' : '@'
    return <RoleName guildId={guildId} prefix={prefix} roleId={id} className={'message-inline-embed'} />
  },
  renderUser: ({ id, marks, guildId, colorful = true }) => {
    const prefix = marks.some(({ type }) => type === 'remove_at_mark') || !colorful ? '' : '@'
    return (
      <UserCard userId={id} placement="rightBottom" disabled={!colorful}>
        <RealtimeNickname
          prefix={prefix}
          userId={id}
          guildId={guildId}
          className="message-inline-embed cursor-pointer"
          style={{
            // @ts-expect-error type: color 时有 color 属性
            color: marks.find(({ type }) => type === 'color')?.color ?? 'var(--fg-blue-1)',
          }}
        />
      </UserCard>
    )
  },
  renderUserName: ({ id, guildId }) => <RealtimeNickname userId={id} guildId={guildId} className="message-inline-embed" />,
  renderChannel: ({ id }) => <ImChannelLink id={id} />,
  renderTopic: ({ id, text, guildId }) => <CircleArticleTag tag={{ tag_id: id, tag_name: text }} guildId={guildId} />,
  fetchQuestion: id => QuestionApi.questionDetail(id),
  openQuestionLink: (guildId: string, channelId: string, questionId: string, currentOpenedQuestionId) => {
    if (currentOpenedQuestionId === questionId) {
      FbToast.open({ content: '你已在浏览该问题', key: 'question-detail' })
    } else {
      showQuestionDetailModal({ questionId })
    }
  },
  handleUrl(uri: string, extra) {
    LinkHandlerPresets.instance.common.handleUrl(uri, extra)
  },
}

// 是否无需降级 css
// https://caniuse.com/?search=inset
// https://caniuse.com/?search=where
const shouldCssNotDegrade = validBrowser({
  safari: '>=14.1',
  firefox: '>=79',
  chrome: '>=88',
  edge: '>=88',
  chromium: '>=88',
  'QQ Browser': '>=11.9',
})

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <FBServiceLayer>
          <ConfigProvider autoInsertSpaceInButton={false} theme={themeDefault} renderEmpty={renderEmpty} locale={zhCN}>
            <StyleProvider
              hashPriority={shouldCssNotDegrade ? 'low' : 'high'}
              transformers={shouldCssNotDegrade ? undefined : [legacyLogicalPropertiesTransformer]}
            >
              <MediaPreviewer>
                <RichTextContext.Provider value={richTextRenderer}>
                  <NetWorkStatusWrapper>
                    <RouterProvider router={router} />
                  </NetWorkStatusWrapper>
                </RichTextContext.Provider>
              </MediaPreviewer>
            </StyleProvider>
          </ConfigProvider>
        </FBServiceLayer>
      </PersistGate>
    </Provider>
  )
}

export default App
