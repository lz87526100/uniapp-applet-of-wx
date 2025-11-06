"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "self-tab-group",
  props: {
    type: {
      type: Number,
      default: 0
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.type === 0
      }, __props.type === 0 ? {
        b: common_assets._imports_0$4
      } : {}, {
        c: __props.type === 1
      }, __props.type === 1 ? {
        d: common_assets._imports_1$1
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ee481071"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/self-tab-group/self-tab-group.js.map
