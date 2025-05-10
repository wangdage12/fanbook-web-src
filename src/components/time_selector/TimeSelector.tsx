import { Button, Input, Popover } from 'antd'
import { isNil } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DurationUtils from '../../utils/DurationUtils'

const DEFAULT_RANGE = 2591940 // 29天23小时59分钟

export interface TimeSelectorProps {
  className?: string
  disabled?: boolean
  placeholder?: string
  /** 时间选择范围, 单位秒 默认  2591940 -> 29天23小时59分钟 */
  range?: number
  value?: number
  onChange?: (milliseconds: number) => void
}

function TimeSelector({ className, value, onChange, placeholder = '请选择时间', disabled, range = DEFAULT_RANGE }: TimeSelectorProps) {
  const [innerValue, setInnerValue] = useState<undefined | number>(value)
  const [open, setOpen] = useState(false)
  const [pickDay, setPickDay] = useState(0)
  const [pickHour, setPickHour] = useState(0)
  const [pickMinute, setPickMinute] = useState(1)
  const { dayArr, hourArr, minutesArr } = useMemo(() => {
    const { days, hours, minutes } = DurationUtils.calculateTime(range)
    const dayArr = days > 0 ? Array.from({ length: days + 1 }, (_, index) => index) : []
    const hourArr = days > 0 || hours > 0 ? Array.from({ length: (days > 0 ? 23 : hours) + 1 }, (_, index) => index) : []
    const minutesArr =
      days > 0 || hours > 0 || minutes > 0 ? Array.from({ length: (days > 0 || hours > 0 ? 59 : minutes) + 1 }, (_, index) => index) : []
    return { dayArr, hourArr, minutesArr }
  }, [range])

  const handleDayClick = useCallback((day: number) => {
    setPickDay(day)
  }, [])
  const handleHourClick = useCallback((hour: number) => {
    setPickHour(hour)
  }, [])
  const handleMinuteClick = useCallback((minute: number) => {
    setPickMinute(minute)
  }, [])
  const handleClick = () => {
    const _value = Math.max(DurationUtils.calculateSeconds({ days: pickDay, hours: pickHour, minutes: pickMinute }), 60)
    setInnerValue(_value)
    if (_value === 60) {
      setPickMinute(1)
    }
    setOpen(false)
    onChange?.(_value)
  }

  useEffect(() => {
    setInnerValue(!isNil(value) ? Math.max(value, 60) : value)
    if (!isNil(value)) {
      const { days, hours, minutes } = DurationUtils.calculateTime(Math.max(value, 60))
      setPickDay(days)
      setPickHour(hours)
      setPickMinute(minutes)
    }
  }, [value])

  useEffect(() => {
    if (!isNil(innerValue)) {
      const { days, hours, minutes } = DurationUtils.calculateTime(Math.max(innerValue, 60))
      setPickDay(days)
      setPickHour(hours)
      setPickMinute(minutes)
    }
  }, [innerValue])

  return (
    <Popover
      placement="bottomLeft"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      content={
        <div className="flex h-[240px] flex-col">
          <div className="flex h-[calc(100%-32px)] gap-[4px] text-center">
            {dayArr.length > 0 && (
              <ul className="h-full cursor-pointer overflow-auto border-r pr-[4px]">
                {dayArr.map(item => (
                  <li
                    key={item}
                    className={`rounded-[4px] hover:bg-[var(--fg-b10)] ${item === pickDay ? 'bg-[var(--fg-b10)]' : ''}`}
                    onClick={() => {
                      handleDayClick(item)
                    }}
                  >
                    {item}天
                  </li>
                ))}
              </ul>
            )}
            {hourArr.length > 0 && (
              <ul className="h-full cursor-pointer overflow-auto border-r pr-[4px]">
                {hourArr.map(item => (
                  <li
                    key={item}
                    className={`rounded-[4px] hover:bg-[var(--fg-b10)] ${item === pickHour ? 'bg-[var(--fg-b10)]' : ''}`}
                    onClick={() => {
                      handleHourClick(item)
                    }}
                  >
                    {item}小时
                  </li>
                ))}
              </ul>
            )}
            {minutesArr.length > 0 && (
              <ul className="h-full cursor-pointer overflow-auto">
                {minutesArr.map(item => (
                  <li
                    key={item}
                    className={`rounded-[4px] hover:bg-[var(--fg-b10)] ${item === pickMinute ? 'bg-[var(--fg-b10)]' : ''}`}
                    onClick={() => {
                      handleMinuteClick(item)
                    }}
                  >
                    {item}分钟
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-[8px] flex justify-end">
            <Button type="primary" shape={'round'} className={'!h-6'} onClick={handleClick} size="small">
              确定
            </Button>
          </div>
        </div>
      }
      arrow={false}
    >
      <Input
        className={`h-[32px] w-full ${className}`}
        disabled={disabled}
        placeholder={placeholder}
        readOnly
        value={!isNil(innerValue) ? DurationUtils.formatSeconds(innerValue) : ''}
        suffix={<iconpark-icon size={16} class={disabled ? 'text-[var(--fg-b30)]' : 'text-[var(--fg-b60)]'} name="ClockCircle"></iconpark-icon>}
      ></Input>
    </Popover>
  )
}

export default TimeSelector
