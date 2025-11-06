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
    const imageStyles = {
      width: 220,
      height: 220,
      border: {
        color: "#e5e5e5",
        width: 1,
        style: "dashed",
        radius: "12rpx"
      }
    };
    const btnDisabled = common_vendor.computed(() => !(formData.value.content.length > 0 || formData.value.pics.length > 0));
    const onContentInput = () => {
    };
    const onSubmit = async () => {
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:95", "提交数据", formData.value);
      const params = {
        ...formData.value,
        pics: formData.value.pics.map((item) => ({
          name: item.name,
          extname: item.extname,
          url: item.url
        })),
        publish_date: Date.now()
      };
      try {
        common_vendor.index.showLoading({
          title: "发布中...",
          mask: true
        });
        const result = await articlesCloudObj.add(params);
        common_vendor.index.__f__("log", "at pages/blog/edit.vue:114", "返回结果", result);
        common_vendor.index.hideLoading();
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: "🎉 发布成功",
            icon: "success",
            duration: 1500
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
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/blog/edit.vue:142", "调用失败", error);
        common_vendor.index.showToast({
          title: "网络错误：" + error.message,
          icon: "none"
        });
      }
    };
    const onUploadSuccess = (e) => {
      common_vendor.index.__f__("log", "at pages/blog/edit.vue:151", "上传成功", e);
      common_vendor.index.showToast({
        title: "图片上传成功",
        icon: "success",
        duration: 1500
      });
    };
    const onUploadFail = (err) => {
      common_vendor.index.__f__("error", "at pages/blog/edit.vue:160", "上传失败", err);
      common_vendor.index.showToast({
        title: "图片上传失败",
        icon: "error",
        duration: 2e3
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(formData.value.content.length),
        b: common_vendor.o([($event) => formData.value.content = $event.detail.value, onContentInput]),
        c: formData.value.content,
        d: common_vendor.t(formData.value.pics.length),
        e: common_vendor.o(onUploadSuccess),
        f: common_vendor.o(onUploadFail),
        g: common_vendor.o(($event) => formData.value.pics = $event),
        h: common_vendor.p({
          fileMediatype: "image",
          mode: "grid",
          limit: "9",
          ["image-styles"]: imageStyles,
          modelValue: formData.value.pics
        }),
        i: common_vendor.t(btnDisabled.value ? "请填写内容" : "立即发布"),
        j: btnDisabled.value ? 1 : "",
        k: btnDisabled.value,
        l: common_vendor.o(onSubmit)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-42e95e20"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/edit.js.map
