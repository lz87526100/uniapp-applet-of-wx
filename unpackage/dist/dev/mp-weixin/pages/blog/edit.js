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
  __name: "edit",
  setup(__props) {
    const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
    const formData = common_vendor.ref({
      content: "",
      pics: []
    });
    const btnDisabled = common_vendor.computed(() => !(formData.value.content.length > 0 || formData.value.pics.length > 0));
    const onSubmit = async () => {
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:35", "提交数据", formData.value);
      const params = {
        ...formData.value,
        pics: formData.value.pics.map((item) => ({
          name: item.name,
          extname: item.extname,
          url: item.url
        })),
        publish_date: Date.now()
        // 添加发布时间字段，用于排序
      };
      try {
        const result = await articlesCloudObj.add(params);
        common_vendor.index.__f__("log", "at pages/blog/edit.vue:51", "返回结果", result);
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.$emit("editEvent");
            common_vendor.index.navigateBack();
          }, 100);
          formData.value.content = "";
          formData.value.pics = [];
        } else {
          common_vendor.index.showToast({
            title: "发布失败：" + (result.errMsg || result.message || "未知错误"),
            icon: "none",
            duration: 3e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/edit.vue:81", "调用失败", error);
        common_vendor.index.showToast({
          title: "网络错误：" + error.message,
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: formData.value.content,
        b: common_vendor.o(($event) => formData.value.content = $event.detail.value),
        c: common_vendor.o(($event) => formData.value.pics = $event),
        d: common_vendor.p({
          fileMediatype: "image",
          mode: "grid",
          modelValue: formData.value.pics
        }),
        e: btnDisabled.value,
        f: common_vendor.o(onSubmit)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-42e95e20"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/edit.js.map
