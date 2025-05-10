// Ant Design v5.7.0 通过 ConfigProvider 提供主题,此处抽离 theme 主题文件
// 详细文档见: https://ant-design.antgroup.com/docs/react/customize-theme-cn
// 主题编辑器: https://ant.design/theme-editor-cn

import { ThemeConfig } from 'antd'

export default {
  token: {
    colorPrimary: '#198bfe',
    colorText: 'var(--fg-b100)',
    colorBorder: 'var(--fg-b10)',
    colorBgContainerDisabled: 'var(--fg-b5)',
  },
  components: {
    Badge: {
      colorError: 'var(--function-red-1)',
      dotSize: 8,
    },
    Notification: {
      colorSuccess: 'var(--function-green-1)',
      colorError: 'var(--function-red-1)',
    },
    Select: {
      borderRadiusLG: 10,
      borderRadiusSM: 6,
      optionSelectedFontWeight: 400,
      optionSelectedBg: '#198CFE0D',
      optionSelectedColor: 'var(--fg-blue-1)',
      fontSizeLG: 14,
    },
    Input: {
      borderRadius: 8,
      colorError: 'var(--function-red-1)',
      fontSizeLG: 14,
      borderRadiusLG: 10,
      lineHeightLG: 1.428,
    },
    Form: {
      controlHeight: 0,
      marginLG: 0,
      marginSM: 0,
      marginMD: 0,
      itemMarginBottom: 0,
    },
    Dropdown: {
      borderRadiusSM: 8,
      paddingBlock: 9,
    },

    Tabs: {
      margin: 0,
      horizontalItemGutter: 24,
      horizontalItemPadding: '10px 0',
      itemColor: 'var(--fg-b40)',
      itemSelectedColor: 'var(--fg-b100)',
      itemHoverColor: 'var(--fg-b60)',
    },
    Slider: {
      borderRadiusXS: 1,
    },
    Tag: {
      borderRadiusSM: 99,
      lineHeightSM: 20 / 14,
      fontSizeIcon: 14,
      defaultBg: 'var(--fg-b5)',
      defaultColor: 'var(--fg-b60)',
      controlHeight: 32,
      fontSizeSM: 14,
    },
    Radio: {
      radioSize: 15,
    },
    Switch: {
      trackHeight: 20,
      handleSize: 14,
      trackMinWidth: 36,
      trackPadding: 3,
    },
    Button: {
      controlHeight: 32,
      controlHeightSM: 28,
      controlHeightLG: 36,
      contentFontSize: 14,
      contentFontSizeSM: 12,
      contentFontSizeLG: 14,
      colorLink: 'var(--fg-blue-1)',
    },
    Modal: {
      titleFontSize: 18,
    },
    DatePicker: {
      fontSizeLG: 14,
      lineHeightLG: 1.428,
    },
  },
} as ThemeConfig
