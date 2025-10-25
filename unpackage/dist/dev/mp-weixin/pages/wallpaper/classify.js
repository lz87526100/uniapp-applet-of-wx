"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "classify",
  setup(__props) {
    const classname = common_vendor.ref("");
    const classList = common_vendor.ref([]);
    const db = common_vendor.tr.database();
    const getClassify = async () => {
      let res = await db.collection("demo-classify").orderBy("createTime desc").get();
      common_vendor.index.__f__("log", "at pages/wallpaper/classify.vue:37", res);
      classList.value = res.result.data;
    };
    const switchChange = async (e, id) => {
      let res = await db.collection("demo-classify").doc(id).update({
        status: e.detail.value
      });
      common_vendor.index.__f__("log", "at pages/wallpaper/classify.vue:47", res);
      await getClassify();
    };
    const handleRemove = async (id) => {
      common_vendor.index.showLoading({ mask: true });
      let feed = await common_vendor.index.showModal({
        title: "是否删除该数据"
      });
      if (!feed.confirm)
        return common_vendor.index.hideLoading();
      let res = await db.collection("demo-classify").doc(id).remove();
      common_vendor.index.__f__("log", "at pages/wallpaper/classify.vue:62", res);
      common_vendor.index.showToast({
        title: "删除成功",
        icon: "none"
      });
      await getClassify();
    };
    const onConfirm = async () => {
      common_vendor.index.showLoading({});
      await db.collection("demo-classify").add({
        name: classname.value
      });
      common_vendor.index.showToast({
        title: "添加成功",
        icon: "none"
      });
      classname.value = "";
      common_vendor.index.hideKeyboard();
      await getClassify();
    };
    getClassify();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onConfirm),
        b: classname.value,
        c: common_vendor.o(($event) => classname.value = $event.detail.value),
        d: common_vendor.f(classList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.status,
            c: common_vendor.o((e) => switchChange(e, item._id), item._id),
            d: common_vendor.o(($event) => handleRemove(item._id), item._id),
            e: "3a660802-0-" + i0,
            f: item._id
          };
        }),
        e: common_vendor.p({
          type: "trash",
          size: "26"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3a660802"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallpaper/classify.js.map
