import { lazy, Suspense } from 'react'
import { createBrowserRouter, createHashRouter } from 'react-router-dom'
import EmptyPage from '../components/EmptyPage'
import Loading from '../components/loading/Loading.tsx'
import WithAuth from '../components/with/WithAuth.tsx'
import WithGlobal from '../components/with/WithGlobal.tsx'
import WithMP from '../components/with/withMP.tsx'
import CircleContainer from '../features/circle/CircleContainer.tsx'
import ApplyList from '../features/contact_list/ApplyList'
import ContactList from '../features/contact_list/ContactList'
import FriendList from '../features/contact_list/FriendList'
import Discovery from '../features/discovery/discovery'
import DmPanel from '../features/dm/DmPanel.tsx'
import ErrorPage from '../features/error_page/ErrorPage'
import NotFoundPage from '../features/error_page/NotFoundPage'
// const NotFoundPage = lazy(() => import('../features/error_page/NotFoundPage'))
import { DmWrapper } from '../features/home/DmWrapper'
import GuildWrapper from '../features/home/GuildWrapper'
import Home from '../features/home/Home'
import Login from '../features/login/Login'
import ModifyInfo from '../features/login/ModifyInfo'
import AnswerDetail from '../features/question/AnswerDetail.tsx'
import { QuestionDetailFromList } from '../features/question/QuestionDetailFromList.tsx'
import browser from '../utils/browser.ts'
import AppRoutes from './AppRoutes'

const MessageCardEditor = lazy(() => import('../features/message_card_editor/MessageCardEditor'))
const Components = lazy(() => import('../features/components/Components'))
const RichEditorPreview = lazy(() => import('../components/rich_text_editor/RichEditorPreview.tsx'))
const MPInner = lazy(() => import('../features/mp-inner/MPInner.tsx'))
const LoginMockThirdParty = lazy(() => import('../features/LoginMockThirdParty.tsx'))

export const routes =
  browser.isMobile() ?
    [
      {
        path: '*',
        lazy: () => import('../features/MobileApp'),
      },
    ]
  : [
      {
        path: AppRoutes.ROOT,
        errorElement: <ErrorPage />,
        element: (
          <WithAuth>
            <WithGlobal>
              <WithMP>
                <Home />
              </WithMP>
            </WithGlobal>
          </WithAuth>
        ),
      },
      {
        path: AppRoutes.LOGIN,
        errorElement: <ErrorPage />,
        element: (
          <WithGlobal>
            <Login />
          </WithGlobal>
        ),
      },
      ...(location.host === 'web.fanbook.cn' ?
        []
      : [
          {
            path: AppRoutes.LOGIN_MOCK_THIRD_PARTY,
            element: (
              <Suspense>
                <WithGlobal>
                  <LoginMockThirdParty />
                </WithGlobal>
              </Suspense>
            ),
          },
        ]),
      {
        path: AppRoutes.MODIFY_INFO,
        errorElement: <ErrorPage />,
        element: (
          <WithAuth>
            <WithGlobal>
              <WithMP>
                <ModifyInfo />
              </WithMP>
            </WithGlobal>
          </WithAuth>
        ),
      },

      {
        path: AppRoutes.DISCOVERY,
        errorElement: <ErrorPage />,
        element: (
          <WithAuth>
            <WithGlobal>
              <WithMP>
                <Home />
              </WithMP>
            </WithGlobal>
          </WithAuth>
        ),
        children: [
          {
            path: '',
            errorElement: <ErrorPage />,
            element: <Discovery />,
          },
        ],
      },
      {
        path: AppRoutes.CHANNELS,
        errorElement: <ErrorPage />,
        element: (
          <WithAuth>
            <WithGlobal>
              <WithMP>
                <Home />
              </WithMP>
            </WithGlobal>
          </WithAuth>
        ),
        children: [
          {
            path: AppRoutes.AT_ME,
            errorElement: <ErrorPage />,
            element: <DmWrapper />,
            children: [
              {
                path: '',
                element: <EmptyPage />,
              },
              {
                path: AppRoutes.CONTACT,
                errorElement: <ErrorPage />,
                element: <ContactList />,
                children: [
                  {
                    path: '',
                    errorElement: <ErrorPage />,
                    element: <FriendList />,
                  },
                  {
                    path: AppRoutes.CONTACT_APPLY,
                    errorElement: <ErrorPage />,
                    element: <ApplyList />,
                  },
                ],
              },
              {
                path: ':dmChannelId',
                errorElement: <ErrorPage />,
                element: <DmPanel />,
              },
            ],
          },
          {
            path: ':guildId',
            errorElement: <ErrorPage />,
            element: <GuildWrapper />,
            children: [
              {
                path: `${AppRoutes.CIRCLE}`,
                errorElement: <ErrorPage />,
                element: <CircleContainer />,
              },
              {
                path: '',
                element: <EmptyPage />,
              },
            ],
          },
          {
            path: ':guildId/:channelId?',
            errorElement: <ErrorPage />,
            element: <GuildWrapper />,
            children: [
              {
                path: ':questionId',
                errorElement: <ErrorPage />,
                element: <QuestionDetailFromList />,
              },
              {
                path: ':questionId/:answerId',
                errorElement: <ErrorPage />,
                element: <AnswerDetail />,
              },
            ],
          },
          {
            path: '',
            element: <EmptyPage className="rounded-tl-[10px] bg-[var(--bg-bg-2)]" />,
          },
          {
            path: '*',
            element: <EmptyPage className="rounded-tl-[10px] bg-[var(--bg-bg-2)]" />,
          },
        ],
      },
      {
        path: 'message-card-editor',
        errorElement: <ErrorPage />,
        element: (
          <Suspense
            fallback={
              <div className={'flex-center h-screen w-screen'}>
                <Loading />
              </div>
            }
          >
            <WithAuth>
              <WithGlobal>
                <MessageCardEditor />
              </WithGlobal>
            </WithAuth>
          </Suspense>
        ),
      },
      // 仅开发环境可用
      ...(import.meta.env.DEV ?
        [
          {
            path: 'components',
            errorElement: <ErrorPage />,
            element: (
              <Suspense
                fallback={
                  <div className={'flex-center h-screen w-screen'}>
                    <Loading />
                  </div>
                }
              >
                <WithGlobal>
                  <Components />
                </WithGlobal>
              </Suspense>
            ),
          },
          {
            path: 'rich-editor',
            errorElement: <ErrorPage />,
            element: (
              <Suspense
                fallback={
                  <div className={'flex-center h-screen w-screen'}>
                    <Loading />
                  </div>
                }
              >
                <WithAuth>
                  <WithGlobal>
                    <RichEditorPreview />
                  </WithGlobal>
                </WithAuth>
              </Suspense>
            ),
          },
        ]
      : []),
      {
        path: `${AppRoutes.MP_INNER}/:hostId?/:uniqueId?`,
        errorElement: <ErrorPage />,
        element: (
          <Suspense
            fallback={
              <div className={'flex-center h-screen w-screen'}>
                <Loading />
              </div>
            }
          >
            <WithAuth>
              <WithGlobal>
                <MPInner />
              </WithGlobal>
            </WithAuth>
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ]

export const router = browser.isDesktop() ? createHashRouter(routes) : createBrowserRouter(routes)
