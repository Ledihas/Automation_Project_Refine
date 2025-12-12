import { ConfigProvider, theme } from "antd";
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

// WhatsApp-inspired color palette
const whatsappColors = {
  primary: '#25D366',        // WhatsApp green
  primaryHover: '#128C7E',   // Darker green
  primaryActive: '#075E54',  // Even darker
  secondary: '#34B7F1',      // WhatsApp blue
  success: '#25D366',
  warning: '#FFC107',
  error: '#FF5252',
  bgLight: '#E5DDD5',        // Chat background light
  bgDark: '#0B141A',         // Dark mode background
  siderDark: '#111B21',      // Sider dark
  headerDark: '#1F2C33',     // Header dark
};

// Custom WhatsApp theme for light mode
const whatsappLightTheme = {
  token: {
    colorPrimary: whatsappColors.primary,
    colorSuccess: whatsappColors.success,
    colorWarning: whatsappColors.warning,
    colorError: whatsappColors.error,
    colorInfo: whatsappColors.secondary,
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: whatsappColors.primary,
      colorPrimaryHover: whatsappColors.primaryHover,
      colorPrimaryActive: whatsappColors.primaryActive,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Menu: {
      itemSelectedBg: 'rgba(37, 211, 102, 0.1)',
      itemSelectedColor: whatsappColors.primary,
      itemHoverBg: 'rgba(37, 211, 102, 0.05)',
    },
    Input: {
      borderRadius: 8,
      activeBorderColor: whatsappColors.primary,
      hoverBorderColor: whatsappColors.primaryHover,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Notification: {
      borderRadiusLG: 12,
    },
    Steps: {
      colorPrimary: whatsappColors.primary,
    },
    Switch: {
      colorPrimary: whatsappColors.primary,
    },
    Badge: {
      colorSuccess: whatsappColors.primary,
    },
  },
};

// Custom WhatsApp theme for dark mode
const whatsappDarkTheme = {
  token: {
    colorPrimary: whatsappColors.primary,
    colorSuccess: whatsappColors.success,
    colorWarning: whatsappColors.warning,
    colorError: whatsappColors.error,
    colorInfo: whatsappColors.secondary,
    colorBgContainer: '#1F2C33',
    colorBgElevated: '#233138',
    colorBgLayout: whatsappColors.bgDark,
    colorBgSpotlight: '#2A3942',
    colorBorder: '#2A3942',
    colorBorderSecondary: '#233138',
    colorText: '#E9EDEF',
    colorTextSecondary: '#8696A0',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: whatsappColors.primary,
      colorPrimaryHover: whatsappColors.primaryHover,
      colorPrimaryActive: whatsappColors.primaryActive,
      borderRadius: 8,
    },
    Card: {
      colorBgContainer: '#1F2C33',
      borderRadiusLG: 12,
    },
    Layout: {
      siderBg: whatsappColors.siderDark,
      headerBg: whatsappColors.headerDark,
      bodyBg: whatsappColors.bgDark,
    },
    Menu: {
      darkItemBg: whatsappColors.siderDark,
      darkItemSelectedBg: 'rgba(37, 211, 102, 0.15)',
      darkItemSelectedColor: whatsappColors.primary,
      darkItemHoverBg: 'rgba(37, 211, 102, 0.08)',
    },
    Input: {
      colorBgContainer: '#2A3942',
      borderRadius: 8,
      activeBorderColor: whatsappColors.primary,
      hoverBorderColor: whatsappColors.primaryHover,
    },
    Modal: {
      contentBg: '#1F2C33',
      headerBg: '#1F2C33',
      borderRadiusLG: 16,
    },
    Notification: {
      colorBgElevated: '#233138',
      borderRadiusLG: 12,
    },
    Steps: {
      colorPrimary: whatsappColors.primary,
    },
    Switch: {
      colorPrimary: whatsappColors.primary,
    },
    Badge: {
      colorSuccess: whatsappColors.primary,
    },
    Collapse: {
      colorBgContainer: '#233138',
    },
  },
};

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = localStorage.getItem("colorMode");
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference
  );

  useEffect(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  const currentTheme = mode === "light" ? whatsappLightTheme : whatsappDarkTheme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        theme={{
          ...currentTheme,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
