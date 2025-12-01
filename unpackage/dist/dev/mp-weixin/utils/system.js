"use strict";
const common_vendor = require("../common/vendor.js");
const SYSTEM_INFO = common_vendor.index.getSystemInfoSync();
const getStatusBarHeight = () => SYSTEM_INFO.statusBarHeight - 6 || 15;
const getTitleBarHeight = () => {
  if (common_vendor.index.getMenuButtonBoundingClientRect) {
    let { top, height } = common_vendor.index.getMenuButtonBoundingClientRect();
    return height + (top - getStatusBarHeight()) * 1.5;
  } else {
    return 40;
  }
};
const getNavBarHeight = () => getStatusBarHeight() + getTitleBarHeight();
exports.getNavBarHeight = getNavBarHeight;
exports.getStatusBarHeight = getStatusBarHeight;
exports.getTitleBarHeight = getTitleBarHeight;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/system.js.map
