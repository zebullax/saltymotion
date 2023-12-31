/*
MUI V5 removed the hidden component, this is a copy pasta of hidden from v4
*/

/* eslint-disable react/prop-types,require-jsdoc */
import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function getThemeProps(params) {
  const { theme, name, props } = params;

  if (!theme || !theme.components || !theme.components[name] || !theme.components[name].defaultProps) {
    return props;
  }

  const output = { ...props };

  const { defaultProps } = theme.components[name];
  let propName;

  for (propName in defaultProps) {
    if (output[propName] === undefined) {
      output[propName] = defaultProps[propName];
    }
  }
  return output;
}

const breakpointKeys = ["xs", "sm", "md", "lg", "xl"];

const isWidthUp = (breakpoint, width, inclusive = true) => {
  if (inclusive) {
    return breakpointKeys.indexOf(breakpoint) <= breakpointKeys.indexOf(width);
  }
  return breakpointKeys.indexOf(breakpoint) < breakpointKeys.indexOf(width);
};

const isWidthDown = (breakpoint, width, inclusive = true) => {
  if (inclusive) {
    return breakpointKeys.indexOf(width) <= breakpointKeys.indexOf(breakpoint);
  }
  return breakpointKeys.indexOf(width) < breakpointKeys.indexOf(breakpoint);
};

const useEnhancedEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const withWidth =
  (options = {}) =>
  (Component) => {
    const { withTheme: withThemeOption = false, noSSR = false, initialWidth: initialWidthOption } = options;

    // eslint-disable-next-line require-jsdoc
    function WithWidth(props) {
      const contextTheme = useTheme();
      const theme = props.theme || contextTheme;
      const { initialWidth, width, ...other } = getThemeProps({
        theme,
        name: "MuiWithWidth",
        props: { ...props },
      });

      const [mountedState, setMountedState] = React.useState(false);
      useEnhancedEffect(() => {
        setMountedState(true);
      }, []);

      const keys = theme.breakpoints.keys.slice().reverse();
      const widthComputed = keys.reduce((output, key) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const matches = useMediaQuery(theme.breakpoints.up(key));
        return !output && matches ? key : output;
      }, null);

      const more = {
        width: width || (mountedState || noSSR ? widthComputed : undefined) || initialWidth || initialWidthOption,
        ...(withThemeOption ? { theme } : {}),
        ...other,
      };

      if (more.width === undefined) {
        return null;
      }

      return <Component {...more} />;
    }
    return WithWidth;
  };

function HiddenJs(props) {
  const { children, only, width } = props;
  const theme = useTheme();

  let visible = true;

  // `only` check is faster to get out sooner if used.
  if (only) {
    if (Array.isArray(only)) {
      for (let i = 0; i < only.length; i += 1) {
        const breakpoint = only[i];
        if (width === breakpoint) {
          visible = false;
          break;
        }
      }
    } else if (only && width === only) {
      visible = false;
    }
  }

  // Allow `only` to be combined with other props. If already hidden, no need to check others.
  if (visible) {
    // determine visibility based on the smallest size up
    for (let i = 0; i < theme.breakpoints.keys.length; i += 1) {
      const breakpoint = theme.breakpoints.keys[i];
      const breakpointUp = props[`${breakpoint}Up`];
      const breakpointDown = props[`${breakpoint}Down`];
      if ((breakpointUp && isWidthUp(breakpoint, width)) || (breakpointDown && isWidthDown(breakpoint, width))) {
        visible = false;
        break;
      }
    }
  }

  if (!visible) {
    return null;
  }

  return children;
}

HiddenJs.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  implementation: PropTypes.oneOf(["js", "css"]),
  initialWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  lgDown: PropTypes.bool,
  lgUp: PropTypes.bool,
  mdDown: PropTypes.bool,
  mdUp: PropTypes.bool,
  only: PropTypes.oneOfType([
    PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
    PropTypes.arrayOf(PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"])),
  ]),
  smDown: PropTypes.bool,
  smUp: PropTypes.bool,
  width: PropTypes.string.isRequired,
  xlDown: PropTypes.bool,
  xlUp: PropTypes.bool,
  xsDown: PropTypes.bool,
  xsUp: PropTypes.bool,
};

const WithWidthHidden = withWidth()(HiddenJs);

/**
 * Render Hidden component
 * @deprecated
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function Hidden(props) {
  const {
    lgDown = false,
    lgUp = false,
    mdDown = false,
    mdUp = false,
    smDown = false,
    smUp = false,
    xlDown = false,
    xlUp = false,
    xsDown = false,
    xsUp = false,
    ...other
  } = props;
  return (
    <WithWidthHidden
      lgDown={lgDown}
      lgUp={lgUp}
      mdDown={mdDown}
      mdUp={mdUp}
      smDown={smDown}
      smUp={smUp}
      xlDown={xlDown}
      xlUp={xlUp}
      xsDown={xsDown}
      xsUp={xsUp}
      {...other}
    />
  );
}

Hidden.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  implementation: PropTypes.oneOf(["js", "css"]),
  initialWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  lgDown: PropTypes.bool,
  lgUp: PropTypes.bool,
  mdDown: PropTypes.bool,
  mdUp: PropTypes.bool,
  only: PropTypes.oneOfType([
    PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
    PropTypes.arrayOf(PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"])),
  ]),
  smDown: PropTypes.bool,
  smUp: PropTypes.bool,
  xlDown: PropTypes.bool,
  xlUp: PropTypes.bool,
  xsDown: PropTypes.bool,
  xsUp: PropTypes.bool,
};
