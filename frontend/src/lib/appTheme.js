// MUI
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

/**
 * Create the website theme
 * @param {boolean} isDark
 * @return {Theme}
 */
export function makeSaltyTheme(isDark) {
  // Basic theming , color and breakpoints
  let theme = createTheme({
    // MuiV5 introduced breaking changes to breakpoint values... we ll keep those ones for now
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    palette: {
      mode: isDark ? "dark" : "light",
    },
  });

  // Components override
  theme = createTheme(theme, {
    components: {
      MuiTextField: {
        defaultProps: {
          variant: "filled",
        },
      },
      MuiUseMediaQuery: {
        defaultProps: {
          noSsr: true,
        },
      },
      MuiLink: {
        defaultProps: {
          underline: "none",
        },
      },
      MuiFilledInput: {
        defaultProps: {
          disableUnderline: true,
        },
        styleOverrides: {
          // input: {
          //   paddingTop: '4px',
          //   paddingBottom: '4px',
          // },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            paddingTop: "2px",
            paddingBottom: "2px",
          },
          input: {
            paddingTop: "2px",
            paddingBottom: "2px",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "contained",
        },
      },
    },
  });
  return responsiveFontSizes(theme);
}

export const APPLICATION_BAR_HEIGHT = 64;
