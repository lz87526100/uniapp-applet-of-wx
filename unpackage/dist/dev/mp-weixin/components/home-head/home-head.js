"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_system = require("../../utils/system.js");
if (!Array) {
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  _easycom_uni_dateformat2();
}
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
if (!Math) {
  _easycom_uni_dateformat();
}
const _sfc_main = {
  __name: "home-head",
  setup(__props) {
    const currentDate = common_vendor.ref(/* @__PURE__ */ new Date());
    const weekDay = common_vendor.computed(() => {
      const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      return days[currentDate.value.getDay()];
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(utils_system.getStatusBarHeight)() + "px",
        b: common_vendor.unref(utils_system.getTitleBarHeight)() + "px",
        c: common_vendor.p({
          date: currentDate.value,
          format: "dd"
        }),
        d: common_vendor.p({
          date: currentDate.value,
          format: "yyyy年MM月"
        }),
        e: common_vendor.t(weekDay.value),
        f: common_assets._imports_0$2
      };
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/home-head/home-head.js.map
