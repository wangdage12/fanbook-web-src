import Editor from '@monaco-editor/react'
import { useDebounceFn } from 'ahooks'
import { Button, Layout, Spin, theme } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { Content, Header } from 'antd/es/layout/layout'
import dayjs from 'dayjs'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import { MessageStruct, MessageType } from 'fb-components/components/messages/types.ts'
import WidgetFactory, { WidgetNodeType } from 'message-card/src/factory/WidgetFactory.ts'
import { editor } from 'monaco-editor'
import { useCallback, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { generateDMChannel } from '../dm/utils.ts'
import LocalUserInfo from '../local_user/LocalUserInfo.ts'
import MessageService from '../message_list/MessageService.ts'
import MessageCardMessage, { MessageCardMessageContentStruct } from '../message_list/items/MessageCardMessage.tsx'
import examples from './examples.ts'

export default function MessageCardEditor() {
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const [message, setMessage] = useState<MessageStruct<MessageCardMessageContentStruct>>(encapsulateMessage(examples[0].examples[0].data))
  const updateView = useDebounceFn(
    (value: string | undefined) => {
      recoverErrorRef.current?.call(null)
      recoverErrorRef.current = undefined

      try {
        const data = JSON.parse(value || '')
        setMessage(encapsulateMessage(data))
      } catch (e) {
        FbToast.open({
          type: 'error',
          key: 'message_card_editor_error',
          content: (e as object).toString(),
        })
      }
    },
    {
      wait: 500,
    }
  )
  const recoverErrorRef = useRef<() => void | undefined>()

  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const sendToMySelf = useCallback(async () => {
    if (!editorRef.current) return

    try {
      WidgetFactory.fromJson(JSON.parse(editorRef.current.getValue()))
    } catch (e) {
      FbToast.open({ content: '消息卡片格式错误，请修改后重试', type: 'error' })
      return
    }

    const dmChannel = await generateDMChannel({ recipientId: LocalUserInfo.userId })
    if (!dmChannel) {
      FbToast.open({ content: '发送失败', type: 'error' })
      return
    }

    MessageService.instance
      .sendMessage(
        dmChannel.channel_id,
        {
          type: MessageType.MessageCard,
          data: JSON.stringify(JSON.parse(editorRef.current?.getValue())),
        },
        { channelType: dmChannel.type }
      )
      .then(() => {
        FbToast.open({ content: '发送成功', type: 'success' })
      })
      .catch(() => {
        FbToast.open({ content: '发送失败，可能是因为数据太大，请简化你的卡片', type: 'error' })
      })
  }, [])

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor
  }

  return (
    <Layout className={'h-full w-full'}>
      <Sider width={300} className={'overflow-y-scroll'}>
        <ul>
          {examples.map(example => (
            <li key={example.category} className={'p-4'}>
              <h1 className={'text-xl font-bold text-white'}>{example.category}</h1>
              <div className={'mt-2 rounded-lg bg-white/20'}>
                {example.examples.map((item, i) => (
                  <a
                    key={i}
                    className={'block cursor-pointer px-3 py-1.5 text-lg font-medium text-white'}
                    onClick={() => {
                      editorRef.current?.setValue(JSON.stringify(item.data, null, 4))
                    }}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Sider>
      <Layout>
        <Header className={'flex items-center justify-end !px-2'} style={{ padding: 0, background: colorBgContainer }}>
          <Button type={'primary'} ghost size={'middle'} onClick={sendToMySelf}>
            发送给自己
          </Button>
        </Header>
        <Content className={'flex flex-row'}>
          <div className={'flex flex-1 items-center justify-center overflow-hidden'}>
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => {
                recoverErrorRef.current = resetErrorBoundary
                return <div className={'p-4 text-red-500'}>{error.toString()}</div>
              }}
            >
              <MessageCardMessage key={message.message_id} message={message} />
            </ErrorBoundary>
          </div>
          <div className={'flex-1 flex-shrink-0'}>
            <Editor
              loading={<Spin />}
              onMount={handleEditorDidMount}
              defaultLanguage="json"
              theme="vs-dark"
              defaultValue={JSON.stringify(message.content.data, null, 4)}
              onChange={updateView.run}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

function encapsulateMessage(json: WidgetNodeType): MessageStruct<MessageCardMessageContentStruct> {
  return {
    reactions: [],
    time: dayjs(),
    user_id: '',
    channel_id: '',
    message_id: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    content: {
      type: MessageType.MessageCard,
      notification: '来自消息卡片编辑器的测试卡片',
      data: json,
    },
  }
}
