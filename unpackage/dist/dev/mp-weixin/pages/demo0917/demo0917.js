"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  _easycom_uni_file_picker2();
}
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  _easycom_uni_file_picker();
}
const _sfc_main = {
  __name: "demo0917",
  setup(__props) {
    common_vendor.ref([]);
    const file = common_vendor.ref(null);
    const onProgress = (e) => {
      common_vendor.index.__f__("log", "at pages/demo0917/demo0917.vue:26", e);
    };
    const onSubmit = () => {
      file.value.upload();
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.sr(file, "78ab93a0-0", {
          "k": "file"
        }),
        b: common_vendor.o(onProgress),
        c: common_vendor.o(($event) => _ctx.ImageValue = $event),
        d: common_vendor.p({
          mode: "grid",
          limit: "6",
          ["return-type"]: "object",
          ["auto-upload"]: false,
          modelValue: _ctx.ImageValue
        }),
        e: common_vendor.o(onSubmit)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0917/demo0917.js.map
