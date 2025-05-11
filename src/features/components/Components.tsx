import { Button, ButtonProps, Layout, Radio } from 'antd'
import { Content } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import Column from 'antd/es/table/Column'
import { ButtonSize } from 'antd/lib/button'
import Table from 'antd/lib/table'
import { TableProps } from 'antd/lib/table/InternalTable'
import React from 'react'

const menu = ['按钮']
type ButtonCellType = { key: string; category: string; button: ButtonProps }
const data: TableProps<ButtonCellType>['dataSource'] = [
  {
    key: 'primary',
    category: 'Primary',
    button: {
      type: 'primary',
    },
  },
  {
    key: 'dangerous',
    category: 'Dangerous Primary',
    button: {
      danger: true,
      type: 'primary',
    },
  },
  {
    key: '4',
    category: 'Primary Ghost',
    button: {
      type: 'primary',
      ghost: true,
    },
  },
  {
    key: '5',
    category: 'Outlined(Default)',
    button: {},
  },
]

export default function Components() {
  const [size, setSize] = React.useState<ButtonSize>('middle')

  return (
    <Layout className={'h-full w-full'}>
      <Sider width={300} className={'overflow-y-scroll'}>
        <ul>
          {menu.map(item => (
            <li key={item} className={'p-4'}>
              <h1 className={'text-xl font-bold text-white'}>{item}</h1>
            </li>
          ))}
        </ul>
      </Sider>
      <Layout>
        <Content className={'flex flex-col gap-2 p-4'}>
          <Radio.Group onChange={e => setSize(e.target.value)} value={size} style={{ marginBottom: 8 }}>
            <Radio.Button value="small">小</Radio.Button>
            <Radio.Button value="middle">中</Radio.Button>
            <Radio.Button value="large">大</Radio.Button>
          </Radio.Group>
          <p>
            图标需要添加 anticon 类，&lt;iconpark-icon <span className="text-[var(--fg-blue-1)]">class=&quot;anticon&quot;</span>{' '}
            name=&quot;Server-Avatar&quot;&gt;&lt;/iconpark-icon&gt;
          </p>
          <Table dataSource={data} pagination={false}>
            <Column title="类别" dataIndex="category" key="category" />
            <Column
              title="常态"
              key="normal"
              render={(_, record: ButtonCellType) => (
                <Button size={size} shape={'round'} {...record.button}>
                  LABEL
                </Button>
              )}
            />
            <Column
              title="仅图标"
              key="only-icon"
              render={(_, record: ButtonCellType) => (
                <Button icon={<iconpark-icon class="anticon" name="Server-Avatar"></iconpark-icon>} shape={'round'} {...record.button}></Button>
              )}
            />
            <Column
              title="图标文字"
              key="icon-text"
              render={(_, record: ButtonCellType) => (
                <Button icon={<iconpark-icon class="anticon" name="Server-Avatar"></iconpark-icon>} shape={'round'} {...record.button}>
                  文本
                </Button>
              )}
            />
            <Column
              title="加载中"
              key="loading"
              render={(_, record: ButtonCellType) => (
                <Button size={size} shape={'round'} loading {...record.button}>
                  LABEL
                </Button>
              )}
            />
            <Column
              title="禁用"
              key="disabled"
              render={(_, record: ButtonCellType) => (
                <Button size={size} shape={'round'} {...record.button} disabled>
                  LABEL
                </Button>
              )}
            />
          </Table>
        </Content>
      </Layout>
    </Layout>
  )
}
