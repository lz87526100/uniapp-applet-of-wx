"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_self_tab_group2 = common_vendor.resolveComponent("self-tab-group");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_self_tab_group2 + _easycom_uni_icons2)();
}
const _easycom_self_tab_group = () => "../self-tab-group/self-tab-group.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_self_tab_group + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "self-item",
  setup(__props) {
    const goEdit = () => {
      common_vendor.index.navigateTo({
        // url:"/pages_self/soup/edit?id="+props.item._id
      });
    };
    const goDetail = () => {
      common_vendor.index.__f__("log", "at components/self-item/self-item.vue:65", "跳转详情");
      common_vendor.index.navigateTo({
        // url:"/pages/detail/detail"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "eye",
          size: "18",
          color: "#999"
        }),
        b: common_vendor.o(goDetail),
        c: common_vendor.p({
          type: "heart",
          color: "#a7a7a7",
          size: "16"
        }),
        d: common_vendor.p({
          type: "star",
          color: "#a7a7a7",
          size: "16"
        }),
        e: common_vendor.p({
          type: "chatbubble",
          color: "#a7a7a7",
          size: "16"
        }),
        f: common_vendor.o(goEdit)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-878a4e0b"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/self-item/self-item.js.map
