import { WidgetNodeType } from 'message-card/src/factory/WidgetFactory.ts'
import { ImageRepeat } from 'message-card/src/widgets/ImageWidget.tsx'
import { TextOverflow } from 'message-card/src/widgets/TextWidget.tsx'
import WidgetTag from 'message-card/src/widgets/WidgetTag.ts'

const USER_ID = import.meta.env.MODE === 'production' || import.meta.env.MODE === 'prerelease' ? '135398110955307008' : '433605573192192000'
const CHANNEL_ID = '441583905779224576'

const moonImage = 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/bb560e1ccff39cd414f018785aeb5391.jpg'
const examples: Array<{ category: string; examples: Array<{ title: string; scale?: number; data: WidgetNodeType }> }> = [
  {
    category: '完整示例',
    examples: [
      {
        title: '《光与夜之恋》角色卡片',
        data: {
          tag: 'stack',
          textStyle: {
            fontSize: 14,
            color: '#616161',
          },
          children: [
            {
              height: 625,
              src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3QvZ3llX3QucG5n',
              tag: 'image',
              width: 385,
            },
            {
              tag: 'positioned',
              top: 15,
              left: 20,
              child: {
                tag: 'userName',
                id: USER_ID,
                style: {
                  fontSize: 17,
                  color: '#198bfe',
                },
              },
            },
            {
              tag: 'positioned',
              top: 40,
              left: 20,
              child: {
                tag: WidgetTag.Text,
                padding: '0,18,0,12',
                style: {
                  fontSize: 17,
                  color: '#977f64',
                  fontWeight: 'medium',
                },
                data: '烈焰情歌',
              },
            },
            {
              tag: 'positioned',
              top: 135,
              left: 100,
              child: {
                tag: 'row',
                children: [
                  {
                    tag: WidgetTag.Container,
                    padding: '0,0,0,5',
                    width: 90,
                    child: {
                      tag: 'column',
                      crossAxisAlignment: 'start',
                      children: [
                        {
                          tag: 'row',
                          padding: '0,0,0,2',
                          crossAxisAlignment: 'center',
                          children: [
                            {
                              height: 20,
                              padding: '0,0,2,0',
                              src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3Qv5peg55WPLnBuZz8y',
                              tag: 'image',
                            },
                            {
                              tag: WidgetTag.Text,
                              data: '无畏',
                            },
                          ],
                        },
                        {
                          height: 22,
                          width: 60,
                          padding: '0,7,0,0',
                          src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3Qvc3Rhci/lha3mmJ8ucG5n',
                          tag: 'image',
                        },
                        {
                          tag: WidgetTag.Text,
                          padding: '0,10,0,0',
                          data: '80级',
                        },
                        {
                          tag: 'row',
                          padding: '0,10,0,0',
                          crossAxisAlignment: 'center',
                          children: [
                            {
                              height: 18,
                              padding: '0,0,2,0',
                              src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvZ3llL3NraWxsL+eDgeWFieeliOaEvy5wbmc=',
                              tag: 'image',
                            },
                            {
                              tag: WidgetTag.Text,
                              data: '烁光祈愿',
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              tag: 'positioned',
              right: 30,
              top: 45,
              child: {
                height: 200,
                padding: '50,10,0,0',
                src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvMjAyMjExLzIwMjIxMTI0LzYtMjIxMTI0MTUzMDQwWDAucG5n',
                tag: 'image',
                radius: 10,
              },
            },
            {
              tag: 'positioned',
              top: 278,
              left: 175,
              child: {
                tag: 'row',
                crossAxisAlignment: 'center',
                textStyle: {
                  fontSize: 14,
                  color: '#a18d77',
                  fontWeight: 'medium',
                },
                children: [
                  {
                    height: 20,
                    src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvMjAyMjExLzIwMjIxMTAzLzYtMjIxMTAzMTUwUzA0MTYucG5n',
                    tag: 'image',
                  },
                  {
                    tag: WidgetTag.Text,
                    padding: '2,0,10,0',
                    data: '*16',
                  },
                  {
                    height: 20,
                    src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvMjAyMjExLzIwMjIxMTAzLzYtMjIxMTAzMTUwMjFINjQucG5n',
                    tag: 'image',
                  },
                  {
                    tag: WidgetTag.Text,
                    padding: '2,0,10,0',
                    data: '*16',
                  },
                  {
                    height: 20,
                    src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvMjAyMjExLzIwMjIxMTAyLzMtMjIxMTAyMUlTMEQ5LnBuZw==',
                    tag: 'image',
                  },
                  {
                    tag: WidgetTag.Text,
                    data: '*18',
                  },
                ],
              },
            },
            {
              tag: 'positioned',
              top: 345,
              left: 35,
              child: {
                tag: 'row',
                textStyle: {
                  fontSize: 15,
                },
                children: [
                  {
                    tag: 'column',
                    width: 180,
                    children: [
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        padding: '0,5,0,2',
                        children: [
                          {
                            height: 21,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3Qv5peg55WPLnBuZw==',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '5,0,5,0',
                            data: '无畏',
                          },
                          {
                            tag: WidgetTag.Text,
                            style: {
                              fontSize: 8,
                            },
                            data: '/主属性',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '25,0,0,0',
                            style: {
                              fontWeight: 'medium',
                            },
                            data: '724',
                          },
                        ],
                      },
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        padding: '0,2,0,0',
                        children: [
                          {
                            height: 21,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3Qv5b+r5LmQLnBuZw==',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '5,0,5,0',
                            data: '快乐',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '60,0,0,0',
                            style: {
                              fontWeight: 'medium',
                            },
                            data: '12',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    tag: 'column',
                    children: [
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        padding: '0,5,0,2',
                        children: [
                          {
                            height: 21,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3Qv5L+h5Lu7LnBuZw==',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '5,0,5,0',
                            data: '信任',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '50,0,0,0',
                            style: {
                              fontWeight: 'medium',
                            },
                            data: '435',
                          },
                        ],
                      },
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        padding: '0,2,0,0',
                        children: [
                          {
                            height: 21,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9ib3Qv5LiT5rOoLnBuZw==',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '5,0,5,0',
                            data: '专注',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '60,0,0,0',
                            style: {
                              fontWeight: 'medium',
                            },
                            data: '36',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            {
              tag: 'positioned',
              top: 463,
              left: 30,
              child: {
                tag: WidgetTag.Text,
                data: '限时收信 · 异邦骄阳下',
              },
            },
            {
              tag: 'positioned',
              top: 520,
              left: 40,
              child: {
                tag: 'row',
                textStyle: {
                  fontWeight: 'medium',
                },
                children: [
                  {
                    width: 165,
                    tag: 'column',
                    children: [
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        children: [
                          {
                            height: 20,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvZ3llL3JlbGF0ZS/nuqbkvJoucG5n',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '7,0,0,0',
                            data: '约会 · 烈焰情歌',
                          },
                        ],
                      },
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        padding: '0,7,0,0',
                        children: [
                          {
                            height: 20,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvZ3llL3JlbGF0ZS/nn63kv6EucG5n',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '7,0,0,0',
                            data: '短信 · 危险栈道',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    tag: 'column',
                    crossAxisAlignment: 'start',
                    children: [
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        children: [
                          {
                            height: 20,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvZ3llL3JlbGF0ZS/nn63kv6EucG5n',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '7,0,0,0',
                            data: '短信 · 停电救急',
                          },
                        ],
                      },
                      {
                        tag: 'row',
                        crossAxisAlignment: 'center',
                        padding: '0,7,0,0',
                        children: [
                          {
                            height: 20,
                            src: '1::00::0::aHR0cHM6Ly9mYW5ib29rLXlvdXRhbmctMTI1MTAwMTA2MC5maWxlLm15cWNsb3VkLmNvbS9jbXMvZ3llL3JlbGF0ZS/mnIvlj4vlnIgucG5n',
                            tag: 'image',
                          },
                          {
                            tag: WidgetTag.Text,
                            padding: '7,0,0,0',
                            data: '朋友圈 · 早会困意',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            {
              tag: WidgetTag.Positioned,
              bottom: 10,
              child: {
                tag: WidgetTag.Button,
                category: 'outlined',
                size: 'medium',
                label: '查看详情',
                href: 'test',
              },
            },
          ],
        },
      },
      {
        title: '通知卡片',
        data: {
          tag: 'column',
          crossAxisAlignment: 'stretch',
          children: [
            {
              tag: 'container',
              padding: '12,8,12,8',
              backgroundColor: 'e5f1ff',
              child: {
                tag: 'text',
                data: '邀请助力抽皮肤，热门皮肤二选一',
                style: {
                  color: '#198CFE',
                  fontSize: 16,
                  fontWeight: 'medium',
                },
              },
            },
            {
              tag: 'container',
              padding: '8',
              child: {
                tag: 'image',
                src: '1::00::0::aHR0cHM6Ly9tcy1mYi1jZHAtc3RvcmUuZ3hwYW4uY24vNjAwMDI3LzIwMjMxMTEwMTU1ODM2Njk5L18xNjk5NjAzMTE2NTA1LmpwZz9pbWFnZU1vZ3IyJTJGdGh1bWJuYWlsJTJGJTIxMTI4MHg2NDByPQ==',
                radius: 5,
              },
            },
            {
              tag: 'container',
              padding: '12',
              child: {
                tag: 'markdown',
                textAlign: 'left',
                style: {
                  fontSize: 15,
                  color: '#1F2329',
                },
                data: '你还在为没有皮肤而烦恼？地铁大院服务器特别策划一次邀请助力抽皮肤活动，只要邀请3人就有机会获得【战神楼恒】或【超级杰克】之一',
              },
            },
            {
              tag: 'container',
              'padding': '12,0,12,12',
              child: {
                tag: 'button',
                category: 'outlined',
                width: 400,
                href: 'https://activity.fanbook.cn/564318017618833408',
                widthUnlimited: true,
                label: '点我参与活动',
              },
            },
          ],
        },
      },
      {
        title: '《地铁跑酷》对战结果',
        data: {
          width: 283,
          tag: 'column',
          crossAxisAlignment: 'stretch',
          textStyle: {
            fontSize: 12,
            color: '1a2033',
          },
          children: [
            {
              tag: WidgetTag.Container,
              padding: '10,12,10,10',
              gradient: {
                colors: ['26FE6119', '00FE6119'],
                begin: '0.5,0',
                end: '0.5,1',
              },
              child: {
                tag: 'column',
                crossAxisAlignment: 'start',
                children: [
                  {
                    tag: 'image',
                    height: 24,
                    src: '1::00::0::aHR0cHM6Ly9mYi1jZG4uZmFuYm9vay5tb2JpL2ZhbmJvb2svYXBwL2ZpbGVzL2NoYXRyb29tL2ltYWdlLzkyMTdmNDVmNTVlMjAzNmZiZDU1NzM2M2Q4OGI1ZGQ3LnBuZw==',
                  },
                  {
                    tag: WidgetTag.Text,
                    data: '房间号 97908969',
                    padding: '0,8,0,0',
                    style: {
                      fontSize: 13,
                      color: '767985',
                    },
                  },
                ],
              },
            },
            {
              tag: WidgetTag.Text,
              data: '恭喜你，获得第一名！',
              padding: '10,0',
              style: {
                fontSize: 13,
                color: '767985',
              },
            },
            {
              padding: '10,8,10,4',
              tag: 'userName',
              id: USER_ID,
              style: {
                fontSize: 13,
                color: '198CFE',
                fontWeight: 'medium',
              },
            },
            {
              tag: 'row',
              padding: '0,20,0,0',
              children: [
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  margin: '0,0,23,0',
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '名次',
                  },
                },
                {
                  tag: WidgetTag.Text,
                  padding: '32,0,0,0',
                  data: '用户',
                  flex: 'tight',
                },
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '时间',
                  },
                },
              ],
            },
            {
              tag: 'row',
              height: 35,
              children: [
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  margin: '0,0,23,0',
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '1',
                  },
                },
                {
                  tag: 'row',
                  flex: 'tight',
                  children: [
                    {
                      tag: 'userAvatar',
                      id: USER_ID,
                      size: 24,
                    },
                    {
                      flex: 'tight',
                      padding: '8,0,0,0',
                      tag: 'userName',
                      id: USER_ID,
                    },
                  ],
                },
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '2.22',
                  },
                },
              ],
            },
            {
              tag: 'row',
              height: 35,
              children: [
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  margin: '0,0,23,0',
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '2',
                  },
                },
                {
                  tag: 'row',
                  flex: 'tight',
                  children: [
                    {
                      tag: 'userAvatar',
                      id: USER_ID,
                      size: 24,
                    },
                    {
                      flex: 'tight',
                      padding: '8,0,0,0',
                      tag: 'userName',
                      id: USER_ID,
                    },
                  ],
                },
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '2.23',
                  },
                },
              ],
            },
            {
              tag: 'row',
              height: 35,
              children: [
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  margin: '0,0,23,0',
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '3',
                  },
                },
                {
                  tag: 'row',
                  flex: 'tight',
                  children: [
                    {
                      tag: 'userAvatar',
                      id: USER_ID,
                      size: 24,
                    },
                    {
                      flex: 'tight',
                      padding: '8,0,0,0',
                      tag: 'userName',
                      id: USER_ID,
                    },
                  ],
                },
                {
                  tag: WidgetTag.Container,
                  width: 54,
                  child: {
                    tag: WidgetTag.Text,
                    textAlign: 'center',
                    data: '2.24',
                  },
                },
              ],
            },
            {
              tag: 'row',
              padding: '10,12',
              children: [
                {
                  flex: 'tight',
                  tag: WidgetTag.Button,
                  category: 'outlined',
                  href: 'href',
                  label: '查看榜单',
                  size: 'medium',
                  widthUnlimited: true,
                  color: 'FF7D66',
                },
                {
                  flex: 'tight',
                  padding: '10,0,0,0',
                  tag: WidgetTag.Button,
                  href: 'href',
                  label: '我要参加',
                  size: 'medium',
                  widthUnlimited: true,
                  color: 'FF7D66',
                },
              ],
            },
          ],
        },
      },
      {
        title: '组队',
        data: {
          'tag': 'container',
          'width': 259,
          'height': 272,
          'padding': '12,12,12,12',
          'child': {
            'tag': 'column',
            'crossAxisAlignment': 'start',
            'children': [
              {
                'tag': 'text',
                'data': '五子棋',
                'style': {
                  'color': '198CFE',
                  'fontSize': 16,
                  'fontWeight': 'medium',
                },
              },
              {
                'tag': 'row',
                'padding': '0,10,0,0',
                'children': [
                  {
                    'tag': 'container',
                    'height': 26,
                    'flex': 'tight',
                    'child': {
                      'tag': 'stack',
                      'children': [
                        {
                          'tag': 'positioned',
                          'left': 20,
                          'width': 26,
                          'height': 26,
                          'child': {
                            'tag': 'container',
                            'backgroundColor': 'ffffff',
                            'border': {
                              'radius': 14,
                              'width': 2,
                              'color': 'ffffff',
                            },
                            'child': {
                              'tag': 'userAvatar',
                              'id': '433605573192192000',
                              'size': 24,
                            },
                          },
                        },
                        {
                          'tag': 'positioned',
                          'left': 0,
                          'width': 26,
                          'height': 26,
                          'child': {
                            'tag': 'container',
                            'backgroundColor': 'ffffff',
                            'border': {
                              'radius': 14,
                              'width': 2,
                              'color': 'ffffff',
                            },
                            'child': {
                              'tag': 'userAvatar',
                              'id': '433605573192192000',
                              'size': 24,
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    'tag': 'text',
                    'data': '组队中',
                    'style': {
                      'color': '198CFE',
                      'fontSize': 14,
                      'fontWeight': 'normal',
                    },
                  },
                ],
              },
              {
                'tag': 'container',
                'margin': '0,10,0,0',
                'child': {
                  'tag': 'stack',
                  'children': [
                    {
                      'tag': 'image',
                      'src':
                        '1::00::0::aHR0cHM6Ly9mYi1jZG4uZmFuYm9vay5tb2JpL2ZhbmJvb2svYXBwL2ZpbGVzL2NoYXRyb29tL2ltYWdlLzliMDUxZjhiZDZlMmViOTQ1N2VkMzk5ZDgyZmM2YWZlLnBuZw==',
                      'width': 235,
                      'height': 132,
                    },
                    {
                      'tag': 'positioned',
                      'child': {
                        'tag': 'container',
                        'height': 50,
                        'gradient': {
                          'colors': ['00000000', 'aa000000'],
                          'begin': '0.5,0',
                          'end': '0.5,1',
                          'stops': [0, 1],
                        },
                      },
                      'bottom': 0,
                      'left': 0,
                      'right': 0,
                    },
                    {
                      'tag': 'positioned',
                      'child': {
                        'tag': 'text',
                        'data': '房间号: 344172',
                        'style': {
                          'color': 'ffffff',
                          'fontSize': 14,
                        },
                      },
                      'bottom': 7,
                      'left': 8,
                    },
                  ],
                },
              },
              {
                'tag': 'container',
                'margin': '0,12,0,0',
                'width': 235,
                'height': 36,
                'child': {
                  'tag': 'row',
                  'children': [
                    {
                      'tag': 'button',
                      'href': 'href',
                      'widthUnlimited': true,
                      'label': '立即加入',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    category: '文本',
    examples: [
      {
        title: '普通文本',
        data: {
          tag: WidgetTag.Text,
          data: 'Git工作流是关于如何使用一致的、高效的方式完成工作的诀窍或是建议。Git工作流鼓励用户一致且有效地利用Git。Git在用户管理变更方面提供了很多的灵活性。因此对于如何与Git交互，并没有一个标准流程。',
          width: 200,
          overflow: TextOverflow.ellipsis,
          maxLines: 3,
        },
      },
    ],
  },
  {
    category: '图片',
    examples: [
      {
        title: '普通图片',
        scale: 1.3,
        data: {
          tag: WidgetTag.Image,
          height: 100,
          radius: 20,
          src: '1::00::0::' + encodeURIComponent(btoa(moonImage)),
        },
      },
      {
        title: '平铺',
        scale: 0.4,
        data: {
          tag: WidgetTag.Image,
          alignment: '1,1',
          src: '1::00::0::' + encodeURIComponent(btoa(moonImage)),
          width: 400,
          height: 400,
          repeat: ImageRepeat.repeat,
        },
      },
    ],
  },
  {
    category: '按钮',
    examples: [
      {
        title: '类别',
        data: {
          padding: '10',
          tag: WidgetTag.Wrap,
          spacing: 10,
          children: [
            {
              tag: WidgetTag.Button,
              category: 'filled',
              label: 'filled',
              href: 'nothing',
            },
            {
              tag: WidgetTag.Button,
              category: 'outlined',
              label: 'outlined',
              href: 'nothing',
            },
            {
              tag: WidgetTag.Button,
              category: 'outlined',
              style: 'secondary',
              label: 'outlined',
              href: 'nothing',
            },
            {
              tag: WidgetTag.Button,
              category: 'text',
              label: 'text',
              href: 'nothing',
            },
          ],
        },
      },
      {
        title: '样式',
        data: {
          padding: '10',
          tag: WidgetTag.Wrap,
          spacing: 10,
          children: [
            {
              tag: WidgetTag.Button,
              style: 'dangerous',
              label: 'filled',
              href: 'nothing',
            },
          ],
        },
      },

      {
        title: '其他设置',
        data: {
          tag: WidgetTag.Container,
          width: 200,
          padding: '8',
          child: {
            tag: WidgetTag.Button,
            borderRadius: 50,
            widthUnlimited: true,
            color: '#f3731e',
            label: '打开 Fanbook 官网',
            href: 'https://fanbook.cn',
          },
        },
      },
      {
        title: '复制按钮',
        data: {
          tag: WidgetTag.Button,
          href: 'hello world',
          type: 'copy',
          child: {
            tag: WidgetTag.Text,
            data: 'copy',
          },
        },
      },
    ],
  },
  {
    category: '数据组件',
    examples: [
      {
        title: '用户名',
        data: {
          tag: WidgetTag.Username,
          id: USER_ID,
          style: {
            color: '245bdb',
            fontSize: 20,
            fontWeight: 'medium',
          },
        },
      },
      {
        title: '用户头像',
        data: {
          tag: WidgetTag.UserAvatar,
          id: USER_ID,
          size: 100,
        },
      },
      {
        title: '频道名',
        data: {
          tag: WidgetTag.ChannelName,
          id: CHANNEL_ID,
          style: {
            color: '245bdb',
            fontSize: 20,
            fontWeight: 'medium',
          },
        },
      },
    ],
  },
  {
    category: 'Markdown',
    examples: [
      {
        title: 'Markdown',
        data: {
          padding: '10',
          tag: WidgetTag.Markdown,
          data: `
-  无序列表项
1. 有序列表项

超链接打开 [fanbook](https://fanbook.mobi)
自动解析链接字面量 https://fanbook.mobi

---

# h1 Heading
## h2 Heading
### h3 Heading

---

**粗体** *斜体* ~~删除线~~
[Smile] [微笑]
@用户\${@!${USER_ID}} @角色 \${@&438532984887316480} 频道链接 \${#${CHANNEL_ID}}

> 大家好！我是引用块。

\`\`\`javascript
function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet('John');
\`\`\``,
          style: {
            fontSize: 14,
          },
        },
      },
    ],
  },
  {
    category: '分割线',
    examples: [
      {
        title: '分割线',
        data: {
          tag: WidgetTag.Column,
          width: 200,
          height: 150,
          children: [
            {
              tag: WidgetTag.Text,
              data: '默认分隔线',
            },
            {
              tag: WidgetTag.Divider,
            },
            {
              tag: WidgetTag.Text,
              data: '横向分隔线',
            },
            {
              tag: WidgetTag.Divider,
              thickness: 2.0,
              color: '2196f3',
            },
            {
              tag: WidgetTag.Text,
              data: '纵向分隔线',
            },
            {
              tag: WidgetTag.Container,
              child: {
                tag: WidgetTag.Divider,
                thickness: 2.0,
                vertical: true,
                color: '2196f3',
              },
              height: 100.0,
            },
          ],
        },
      },
    ],
  },
  {
    category: '容器组件',
    examples: [
      {
        title: '容器',
        data: {
          tag: WidgetTag.Container,
          margin: '8',
          padding: '8',
          child: {
            tag: WidgetTag.Container,
            padding: '8',
            child: {
              tag: WidgetTag.Text,
              data: 'text',
            },
            border: {
              radius: 5,
            },
            alignment: '0',
            backgroundColor: '198bfe',
          },
          width: 100,
          height: 100,
          border: {
            color: 'f44336',
            width: 2,
            radius: 5,
          },
          gradient: {
            colors: ['000000', 'FFFFFF'],
          },
        },
      },
      {
        title: '宽高比',
        data: {
          tag: WidgetTag.Container,
          child: {
            tag: WidgetTag.AspectRatio,
            ratio: 1,
            child: {
              tag: WidgetTag.Container,
              backgroundColor: '2196f3',
            },
          },
          width: 100,
          height: 300,
          border: {
            color: 'f44336',
          },
          alignment: '0',
        },
      },
      {
        title: '绝对布局',
        data: {
          tag: WidgetTag.Stack,
          children: [
            {
              tag: WidgetTag.Container,
              width: 200,
              height: 170,
              backgroundColor: '607d8b',
            },
            {
              tag: WidgetTag.Positioned,
              child: {
                tag: WidgetTag.Text,
                data: '左上',
              },
              top: 0,
              left: 0,
            },
            {
              tag: WidgetTag.Positioned,
              child: {
                tag: WidgetTag.Text,
                data: '左下',
              },
              bottom: 0,
              left: 0,
            },
            {
              tag: WidgetTag.Positioned,
              child: {
                tag: WidgetTag.Text,
                data: '右上',
              },
              top: 0,
              right: 1,
            },
            {
              tag: WidgetTag.Positioned,
              child: {
                tag: WidgetTag.Text,
                data: '右下',
              },
              right: 1,
              bottom: 1,
            },
          ],
        },
      },
      {
        title: 'Flex 布局',
        data: {
          width: 200,
          tag: 'column',
          children: [
            {
              tag: 'row',
              children: [
                {
                  tag: WidgetTag.Container,
                  padding: '8',
                  flex: 'tight',
                  height: 50,
                  backgroundColor: 'dddddd',
                },
                {
                  tag: WidgetTag.Container,
                  padding: '8',
                  width: 50,
                  height: 50,
                  backgroundColor: '333333',
                },
              ],
            },
            {
              tag: 'row',
              children: [
                {
                  tag: WidgetTag.Text,
                  data: 'Item 1',
                },
                {
                  tag: WidgetTag.Text,
                  data: 'Item 2',
                },
                {
                  tag: WidgetTag.Text,
                  data: 'Item 3',
                },
                {
                  tag: WidgetTag.Text,
                  data: 'Item 4',
                },
              ],
              mainAxisAlignment: 'spaceBetween',
            },
          ],
        },
      },
      {
        title: 'Wrap 布局',
        data: {
          width: 200,
          height: 150,
          tag: WidgetTag.Container,
          child: {
            tag: WidgetTag.Container,
            backgroundColor: '2196f3',
            child: {
              tag: 'wrap',
              children: [
                {
                  tag: WidgetTag.Text,
                  data: '1',
                },
                {
                  tag: WidgetTag.Text,
                  data: '2',
                },
                {
                  tag: WidgetTag.Text,
                  data: '3',
                },
                {
                  tag: WidgetTag.Text,
                  data: '4',
                },
                {
                  tag: WidgetTag.Text,
                  data: '5',
                },
                {
                  tag: WidgetTag.Text,
                  data: '6',
                },
                {
                  tag: WidgetTag.Text,
                  data: '7',
                },
                {
                  tag: WidgetTag.Text,
                  data: '8',
                },
                {
                  tag: WidgetTag.Text,
                  data: '9',
                },
              ],
              textStyle: {
                color: '000000',
                fontSize: 20,
              },
              spacing: 50,
              runSpacing: 10,
              runAlignment: 'center',
            },
          },
        },
      },
    ],
  },
]

export default examples
