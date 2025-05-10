import { Button, Radio, RadioChangeEvent, Space } from 'antd'
import showFbModal from 'fb-components/base_ui/fb_modal/use_fb_modal'
import FbSelect from 'fb-components/base_ui/fb_select'
import { useState } from 'react'

export interface CircleRecommendSettingProps {
  recommendedDay?: number
  onChange?: (day: number) => void
}

const daysArray = Array.from({ length: 30 }, (_, i) => ({ value: i + 1, label: `${i + 1} 天` }))

function CircleRecommendSetting({ onChange }: CircleRecommendSettingProps) {
  const [recommendDay, setRecommendDay] = useState<number>(0)
  const [isCustom, setIsCustom] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useState<number>(1)

  const handleDayChange = ({ target }: RadioChangeEvent) => {
    const { value } = target
    if (value === 'custom') {
      if (!isCustom) {
        setIsCustom(true)
        setRecommendDay(selectedDay)
      }
      return
    }
    setIsCustom(false)
    setRecommendDay(Number(value))
  }

  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="text-fgB60">设置后，动态可在圈子中获得更靠前的排序</div>
      <div className="my-4">
        <Radio.Group onChange={handleDayChange}>
          <Space direction="vertical">
            <Radio className="w-full" value={1}>
              1 天
            </Radio>
            <Radio className="w-full" value={3}>
              3 天
            </Radio>
            <Radio className="w-full" value={7}>
              7 天
            </Radio>
            <Radio className="w-full" value={15}>
              15 天
            </Radio>
            <Radio className="w-full" value="custom">
              <div className="flex items-center gap-2">
                <span>自定义时间</span>
                <FbSelect
                  className="w-40"
                  disabled={!isCustom}
                  options={daysArray}
                  value={selectedDay}
                  onClick={e => {
                    if (isCustom) {
                      e.stopPropagation()
                      e.preventDefault()
                    }
                  }}
                  onChange={value => {
                    setRecommendDay(value)
                    setSelectedDay(value)
                  }}
                ></FbSelect>
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </div>
      <Button
        type="primary"
        className="w-[200px]"
        disabled={recommendDay === 0}
        onClick={() => {
          onChange?.(recommendDay)
        }}
      >
        优先推荐
      </Button>
    </div>
  )
}

export function showCircleRecommendSettingModal() {
  return new Promise<number>((resolve, reject) => {
    const { destroy: onClose } = showFbModal({
      title: '设置优先推荐时间',
      content: (
        <CircleRecommendSetting
          onChange={day => {
            resolve(day)
            onClose()
          }}
        ></CircleRecommendSetting>
      ),
      onCancel: () => {
        reject('取消设置优先推荐时间')
        onClose()
      },
      footer: null,
    })
  })
}

export default CircleRecommendSetting
