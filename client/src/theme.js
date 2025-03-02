import { theme } from 'antd';

// Shared theme configuration for light and dark mode
const createTheme = (isDark = false) => ({
  token: {
    colorPrimary: '#0969da', // GitHub blue
    borderRadius: 6,
    colorSuccess: '#2da44e', // GitHub green
    colorWarning: '#bf8700', // GitHub yellow
    colorError: '#cf222e',   // GitHub red
    colorInfo: '#0969da',    // GitHub blue
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    colorBgContainer: isDark ? '#0d1117' : '#ffffff',
    colorBgElevated: isDark ? '#161b22' : '#ffffff',
    colorText: isDark ? '#c9d1d9' : '#24292f',
    colorTextSecondary: isDark ? '#8b949e' : '#57606a',
    colorBorder: isDark ? '#30363d' : '#d0d7de',
  },
  components: {
    Card: {
      headerBg: 'transparent',
      colorBorderSecondary: isDark ? '#30363d' : '#d0d7de',
    },
    Button: {
      borderRadius: 6,
      controlHeight: 34,
      paddingInline: 12,
    },
    Menu: {
      itemSelectedBg: isDark ? '#21262d' : '#f6f8fa',
      itemSelectedColor: '#0969da',
      itemHoverBg: isDark ? '#21262d' : '#f6f8fa',
    },
    Input: {
      activeBorderColor: '#0969da',
      hoverBorderColor: '#0969da',
    },
    Select: {
      optionSelectedBg: isDark ? '#21262d' : '#f6f8fa',
    }
  },
  algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
});

export default createTheme;