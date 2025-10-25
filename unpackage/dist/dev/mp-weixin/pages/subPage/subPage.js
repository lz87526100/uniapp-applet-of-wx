"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_forms_item2 + _easycom_uni_forms2)();
}
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_forms_item + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "subPage",
  setup(__props) {
    const formRef = common_vendor.ref(null);
    const form = common_vendor.ref({
      classname: "",
      description: "",
      picurl: ""
    });
    const rules = {
      classname: { rules: [{ required: true, errorMessage: "请输入标题" }] },
      description: { rules: [{ required: true, errorMessage: "请输入正文" }] }
    };
    const pictures = common_vendor.ref([]);
    const uploadFileObj = common_vendor.tr.importObject("uploadFileObj", {
      customUI: true
    });
    const selectPic = async () => {
      let file = await common_vendor.index.chooseImage({
        count: 1
      });
      pictures.value = file.tempFilePaths.map((item) => ({ temp: item, status: 0, progress: 0 }));
    };
    const onSubmit = async () => {
      await formRef.value.validate();
      common_vendor.index.showLoading({ mask: true });
      try {
        await common_vendor.tr.database().collection("demo-wallper").add(form.value);
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "none"
        });
        setTimeout(() => common_vendor.index.navigateBack(), 500);
      } catch (e) {
        common_vendor.index.showModal({
          content: e.message || "提交失败",
          showCancel: false
        });
      } finally {
        common_vendor.index.hideLoading();
      }
      let filename = common_vendor.dayjs().format("YYYYMMDD") + "/" + Date.now() + ".jpg";
      pictures.value[0].status = 1;
      let cloud = await common_vendor.tr.uploadFile({
        filePath: pictures.value[0].temp,
        cloudPath: filename,
        //返回当前进度和总大小
        onUploadProgress: (event) => {
          pictures.value[0].progress = Math.round(
            event.loaded * 100 / event.total
          );
        }
      });
      pictures.value[0].status = 2;
      common_vendor.index.__f__("log", "at pages/subPage/subPage.vue:136", cloud.fileID);
      let path = cloudToHttps(cloud.fileID);
      pictures.value[0].fileID = cloud.fileID;
      pictures.value[0].url = path;
      common_vendor.index.__f__("log", "at pages/subPage/subPage.vue:143", pictures.value);
    };
    const cloudToHttps = (str) => {
      return str.replace("cloud://", "https://").replace(str.split("/")[2], str.split("/")[2] + ".normal.cloudstatic.cn");
    };
    const hanldClose = () => {
      uploadFileObj.remove([pictures.value[0].fileID]).then((res) => {
        common_vendor.index.__f__("log", "at pages/subPage/subPage.vue:156", res);
      });
      pictures.value = [];
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.value.name,
        b: common_vendor.o(($event) => form.value.name = $event.detail.value),
        c: common_vendor.p({
          name: "name"
        }),
        d: form.value.description,
        e: common_vendor.o(($event) => form.value.description = $event.detail.value),
        f: common_vendor.p({
          name: "description"
        }),
        g: common_vendor.sr(formRef, "1a3fdbaf-0", {
          "k": "formRef"
        }),
        h: common_vendor.p({
          modelValue: form.value,
          rules
        }),
        i: pictures.value.length == 0
      }, pictures.value.length == 0 ? {
        j: common_vendor.o(selectPic)
      } : {}, {
        k: common_vendor.f(pictures.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.temp,
            b: item.status == 1
          }, item.status == 1 ? {
            c: common_vendor.t(item.progress)
          } : {}, {
            d: common_vendor.o(hanldClose, index),
            e: index
          });
        }),
        l: common_vendor.o(onSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1a3fdbaf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/subPage/subPage.js.map
