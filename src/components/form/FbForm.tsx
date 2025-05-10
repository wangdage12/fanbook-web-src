import { Button, Divider, Form, FormInstance, FormProps } from 'antd'
import { useForm } from 'antd/es/form/Form'
import clsx from 'clsx'
import FbToast from 'fb-components/base_ui/fb_toast/index'
import CircularLoading from 'fb-components/components/CircularLoading.tsx'
import { isEqual, isFunction } from 'lodash-es'
import React, { ReactElement, Ref, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import NoNetImage from '../../assets/images/no-net.svg'
import EmptyPage from '../EmptyPage.tsx'
import { FormModalContext } from './FormModalContext.tsx' // 表单类型

// 表单类型
export enum FormType {
  // 创建
  Create,
  // 编辑
  Edit,
}

export interface FbFormProps<T> extends Omit<FormProps, 'children'> {
  initialValue: T | (() => Promise<T> | T)
  children: (form: FormInstance<T>) => React.ReactNode
  submit: (fieldsValue: T, oldValue: T) => Promise<void | T>
}

export interface FbFormRef<T> {
  form: FormInstance<T>
  reinitialize: (initial?: T) => Promise<{ next: T | undefined; prev: T }>
  isChanged: () => boolean
}

/**
 * Fanbook 表单业务通用组件，特性列表：
 * 1. 表单提交
 * 2. 重置表单
 * 3. 表单项验证，验证不通过时点击保存按钮会自动跳转到第一个错误的表单项
 * 4. 支持异步数据的加载状态
 * 5. 保存后，把表单的初始值更新为当前值，使得表单变为未修改状态
 * 验证不通过时点击保存按钮会自动跳转到第一个错误的表单项。
 *
 * @param children      业务 UI，是一个回调函数，参数是 form 实例
 * @param initialValue  表单的初始值，可以是一个对象，也可以是一个返回 Promise 的函数，如果是异步数据，可以传入一个返回 Promise 的函数，组件会自动处理异步数据的加载状态
 * @param submit        表单提交时的回调函数，参数是表单的值
 * @param props         antd Form 组件的属性
 */
function FbInnerForm<T extends object>({ children, initialValue: _init, submit, className, ...props }: FbFormProps<T>, ref: Ref<FbFormRef<T>>) {
  const [form] = useForm<T>()
  const formModalContext = React.useContext(FormModalContext)
  const [initialValue, setInitialValue] = useState<T | Promise<T>>(() => {
    if (isFunction(_init)) {
      return _init()
    } else {
      return _init
    }
  })

  useEffect(() => {
    formModalContext?.setBeforeClose(async () => isEqual(form.getFieldsValue(), initialValue))
    return () => {
      formModalContext?.setBeforeClose(null)
    }
  }, [initialValue, form])

  useImperativeHandle(
    ref,
    () => ({
      form: form,
      reinitialize: async (initial?: T) => {
        let _initialValue: T | undefined
        if (isFunction(_init)) {
          _initialValue = await _init()
        } else {
          _initialValue = initial
        }
        setInitialValue(initialValue => _initialValue ?? initialValue)
        return { next: _initialValue, prev: initialValue as T }
      },

      isChanged: () => !isEqual(form.getFieldsValue(), initialValue),
    }),
    [form, initialValue]
  )

  const values = Form.useWatch([], form)
  const [changed, setChanged] = useState(false)
  useEffect(() => {
    if (!values || !initialValue || initialValue instanceof Promise) {
      setChanged(false)
    } else {
      const equal = isEqual(values, initialValue)
      setChanged(!equal)
    }
  }, [values])

  const [loading, setLoading] = useState(initialValue instanceof Promise)
  const [error, setError] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  function fetchData() {
    setError(false)
    if (initialValue instanceof Promise) {
      setLoading(true)
      initialValue
        .then(setInitialValue)
        .catch(() => setError(true))
        .finally(() => {
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={'flex-center h-full'}>
        <CircularLoading size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyPage
        image={NoNetImage}
        message={'网络质量不佳，请稍后重试'}
        buttonLabel={'重新加载'}
        buttonClass={'btn-primary'}
        buttonOnClick={fetchData}
      />
    )
  }

  return (
    <Form<T>
      scrollToFirstError
      className={clsx(['flex h-full flex-col', className])}
      form={form}
      initialValues={initialValue}
      {...props}
      onFinish={values => {
        submit(values, initialValue as T)
          .then(_values => {
            FbToast.open({
              type: 'success',
              content: '保存成功',
            })
            // 保存成功后，把表单的初始值更新为当前值，使得表单变为未修改状态
            setInitialValue(_values ?? values)
            form.setFieldsValue(_values ?? values)
            setChanged(false)
          })
          .finally(() => {
            setSubmitting(false)
          })
      }}
      onFinishFailed={e => {
        console.info('onFinishFailed', e)
        setSubmitting(false)
      }}
    >
      <div className={'flex-1 overflow-auto'}>{children(form)}</div>
      <Divider className={'m-0 w-full'} />
      <div className="gap flex flex-row justify-end gap-[16px] px-6 py-[18px]">
        <Button className={'btn-middle'} htmlType={'reset'} disabled={!changed}>
          重置
        </Button>
        <Button
          className={'btn-middle'}
          type={'primary'}
          shape={'round'}
          htmlType={'submit'}
          disabled={!changed}
          loading={submitting}
          onClick={() => {
            setSubmitting(true)
          }}
        >
          保存
        </Button>
      </div>
    </Form>
  )
}

const FbForm = forwardRef(FbInnerForm) as <T>(props: FbFormProps<T> & { ref?: Ref<FbFormRef<T>> }) => ReactElement
export default FbForm
