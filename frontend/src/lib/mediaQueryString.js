/* eslint-disable max-len */
export const iphonePortraitMediaQuery = {
  /* iphone 3 */
  iphone3:
    "only screen and (orientation: portrait) and (min-device-width: 320px) and (max-device-height: 480px) and (-webkit-device-pixel-ratio: 1)",
  /* iphone 4 */
  iphone4:
    "only screen and (orientation: portrait) and (min-device-width: 320px) and (max-device-width: 480px) and (-webkit-device-pixel-ratio: 2)",
  /* iphone 5, 5S, 5C, 5SE */
  iphone5:
    "only screen and (orientation: portrait) and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-device-pixel-ratio: 2)",
  /* iphone 6, 6s, 7, 8 */
  iphone6:
    "only screen and (orientation: portrait) and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-device-pixel-ratio: 2)",
  /* iphone 6+, 6s+, 7+, 8+ */
  iphone6p:
    "only screen and (orientation: portrait) and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-device-pixel-ratio: 3)",
  /* iphone X , XS, 11 Pro */
  iphoneX:
    "only screen and (orientation: portrait) and (min-device-width: 375px) and (max-device-width: 812px) and (-webkit-device-pixel-ratio: 3)",
  /* iphone XR, 11 */
  iphoneXR:
    "only screen and (orientation: portrait) and (min-device-width : 414px) and (max-device-width : 896px) and (-webkit-device-pixel-ratio : 2)",
  /* iphone XS Max, 11 Pro Max */
  iphoneXSMax:
    "only screen and (orientation: portrait) and (min-device-width : 414px) and (max-device-width : 896px) and (-webkit-device-pixel-ratio : 3)",
};

export const isMacBookRetina =
  "(min-width: 1680px) and (-webkit-min-device-pixel-ratio: 2), (min-width: 1680px) and (min-resolution: 192dpi)";
export const anyIphonePortraitMediaQuery = Object.keys(iphonePortraitMediaQuery).reduce(
  (accu, curr) => `${accu}, ${iphonePortraitMediaQuery[curr]}`,
  iphonePortraitMediaQuery[Object.keys(iphonePortraitMediaQuery)[0]],
);
