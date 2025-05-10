import { Rule } from 'rc-field-form/lib/interface'
import CommonApi from '../../../CommonApi.ts' // 链接频道检验规则

// 链接频道检验规则

const serverSideUrlValidator: Rule = {
  validator: (_, value) => CommonApi.validateUrl(value).catch(e => Promise.reject(e.desc)),
}

export default [
  {
    required: true,
    message: '请输入URL',
  },
  { type: 'url', message: '请输入有效的URL' },
  serverSideUrlValidator,
] as Rule[]
