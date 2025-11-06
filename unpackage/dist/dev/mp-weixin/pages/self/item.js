"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {};
if (!Array) {
  const _easycom_self_item2 = common_vendor.resolveComponent("self-item");
  _easycom_self_item2();
}
const _easycom_self_item = () => "../../components/self-item/self-item.js";
if (!Math) {
  _easycom_self_item();
}
function _sfc_render(_ctx, _cache) {
  return {
    a: common_vendor.f(5, (item, k0, i0) => {
      return {
        a: "39352237-0-" + i0,
        b: item
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/item.js.map
