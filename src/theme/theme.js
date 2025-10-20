import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1000,  // Custom breakpoint ở 1000px
      xl: 1200,
    },
  },
  palette: {
    primary: {
      main: '#3591C4', // Closest Web Safe - màu chủ đạo
      light: '#5c5c8a',
      dark: '#262647',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3591C4', // Closest Pantone® - màu phụ xanh dương
      light: '#66a8d1',
      dark: '#266a94',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#5002', // Closest RAL [Ultramarine blue] - màu thứ 3
      light: '#7d35',
      dark: '#3501',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Extend theme với tertiary color - màu cam-đỏ đẹp hơn
theme.palette.tertiary = theme.palette.augmentColor({
  color: {
    main: '#ff6b6b', // Coral red - màu cam-đỏ nhẹ nhàng
    light: '#ff9999',
    dark: '#e55555',
  },
  name: 'tertiary',
});

// Extend theme với sidebar colors - quản lý màu sidebar
theme.palette.sidebar = {
  main: '#404080', // Lighter purple-blue cho sidebar top
  dark: '#333366', // Deep purple-blue cho sidebar bottom (giống primary)
  gradient: 'linear-gradient(180deg, #404080 0%, #333366 100%)',
  shadow: 'rgba(64, 64, 128, 0.15)',
};

// Extend theme với form section colors - quản lý màu form sections
theme.palette.formSections = {
  interests: {
    background: 'rgba(53, 145, 196, 0.05)', // Secondary với opacity
    shadow: 'rgba(53, 145, 196, 0.1)',
    shadowHover: 'rgba(53, 145, 196, 0.15)',
  },
  habits: {
    background: 'rgba(51, 51, 102, 0.05)', // Primary với opacity
    shadow: 'rgba(51, 51, 102, 0.1)',
    shadowHover: 'rgba(51, 51, 102, 0.15)',
  },
  dislikes: {
    background: 'rgba(255, 107, 107, 0.05)', // Tertiary với opacity
    shadow: 'rgba(255, 107, 107, 0.1)',
    shadowHover: 'rgba(255, 107, 107, 0.15)',
  },
};

export default theme;