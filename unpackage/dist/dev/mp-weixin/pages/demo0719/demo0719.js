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
  __name: "demo0719",
  setup(__props) {
    const formData = common_vendor.ref({
      name: "",
      age: "",
      avatar: []
      //存放头像
    });
    const db = common_vendor.tr.database();
    const handleAdd = async () => {
      common_vendor.index.showLoading({
        title: "加载中"
      });
      try {
        let res = await db.collection("demo-user").add(formData.value);
        if (res.result.errCode == 0) {
          common_vendor.index.__f__("log", "at pages/demo0719/demo0719.vue:35", res);
          common_vendor.index.showToast({
            title: "新增成功"
          });
          formData.value = {
            name: "",
            age: "",
            avatar: []
          };
        }
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/demo0719/demo0719.vue:46", err);
        common_vendor.index.showModal({
          title: "添加失败",
          content: err.errMsg,
          showCancel: false
        });
      } finally {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/demo0719/demo0719.vue:54", typeof formData.value.age, formData.value.age);
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => formData.value.avatar = $event),
        b: common_vendor.p({
          mode: "grid",
          fileMediatype: "image",
          limit: "1",
          modelValue: formData.value.avatar
        }),
        c: formData.value.name,
        d: common_vendor.o(($event) => formData.value.name = $event.detail.value),
        e: formData.value.age,
        f: common_vendor.o(common_vendor.m(($event) => formData.value.age = $event.detail.value, {
          number: true
        })),
        g: common_vendor.o(handleAdd)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c762a286"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0719/demo0719.js.map
