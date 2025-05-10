import { ColorPicker, Divider, Input } from 'antd'
import { Color } from 'antd/es/color-picker'
import ColorUtils from 'fb-components/utils/ColorUtils'
import React, { useEffect } from 'react'

function isValidHexColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6})$/ //|[A-Fa-f0-9]{3}
  return hexColorRegex.test(color)
}

const PRESET_COLOR = [
  '#06A8F4',
  '#1375F2',
  '#6179F2',
  '#5560DD',
  '#00CBCC',
  '#14C79D',
  '#FFD500',
  '#FFA526',
  '#FF8127',
  '#FF4080',
  '#F24965',
  '#FF5000',
  '#98A9FF',
  '#9898FF',
  '#6D7FDA',
  '#9966FF',
  '#7E00FC',
  '#A3A8BF',
]

function ColorWheel({
  presetColor = PRESET_COLOR,
  defaultColor = '#A3A8BF',
  customable = true,
  format = 'hex',
  value = '#000000',
  onChange,
}: {
  value?: string | number
  onChange?: (value: string | number) => void
  format?: 'hex' | 'int'
  presetColor?: string[]
  defaultColor?: string
  customable?: boolean
}) {
  const _value = (typeof value === 'number' ? ColorUtils.convertToCssColor(value, defaultColor) : value).toUpperCase()
  const [innerValue, setInnerValue] = React.useState(_value)
  const [inputValue, setInputValue] = React.useState(_value)

  const handleChange = (color: string) => {
    onChange?.(format === 'int' ? ColorUtils.convertToOverflowedInt(color) : color)
  }
  const handlePickerChange = (color: Color) => {
    const colorStr = color.toHexString().toUpperCase()
    setInputValue(colorStr)
    setInnerValue(colorStr)
    handleChange(colorStr)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value.toUpperCase()
    setInputValue(color)
    if (isValidHexColor(color)) {
      setInnerValue(color)
      handleChange(color)
    }
  }

  const handleColorClick = (color: string) => {
    setInputValue(color)
    setInnerValue(color)
    handleChange(color)
  }

  useEffect(() => {
    const _value = (typeof value === 'number' ? ColorUtils.convertToCssColor(value, defaultColor) : value).toUpperCase()
    if (_value !== innerValue) {
      setInnerValue(_value)
      setInputValue(_value)
    }
  }, [value])

  return (
    <div className="flex">
      <div className="flex w-[312px] flex-wrap gap-[12px]">
        {presetColor.map(color => (
          <div
            key={color}
            className="flex-center h-[24px] w-[24px] cursor-pointer rounded-[6px]"
            onClick={() => handleColorClick(color)}
            style={{ backgroundColor: color }}
          >
            {innerValue === color && <iconpark-icon name="Check" class="text-[var(--fg-white-1)]" size={12}></iconpark-icon>}
          </div>
        ))}
      </div>
      {customable && (
        <>
          <Divider type="vertical" className="mx-[16px] h-[60px]"></Divider>
          <ColorPicker
            disabledAlpha
            placement="bottom"
            arrow={false}
            value={innerValue}
            onChange={handlePickerChange}
            panelRender={(_, extra) => {
              const { Picker } = extra.components
              return (
                <div className="flex flex-col gap-[24px] [&_.ant-color-picker-input-container]:!hidden [&_.ant-color-picker-slider-container]:!mb-0">
                  <div className="flex flex-col gap-[8px]">
                    <span className="font-bold">颜色预览</span>
                    <div>
                      <Input
                        size="large"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="text-center"
                        style={{ color: innerValue }}
                      ></Input>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <span className="font-bold">颜色选择</span>
                    <Picker />
                  </div>
                </div>
              )
            }}
          >
            <div className="flex flex-col items-center">
              <div
                className="flex-center h-[40px] w-[40px] cursor-pointer rounded-[10px] border-[1px] border-[var(--fg-b10)]"
                style={{ backgroundColor: innerValue }}
              >
                <iconpark-icon name="Check" class="text-[var(--fg-white-1)]" size={16}></iconpark-icon>
              </div>
              <span className="mt-[2px] text-[12px] text-[var(--fg-b60)]">自定义</span>
            </div>
          </ColorPicker>
        </>
      )}
    </div>
  )
}

export default ColorWheel
