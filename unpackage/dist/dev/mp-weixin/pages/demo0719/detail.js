"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const db = common_vendor.tr.database();
    let id;
    const detail = common_vendor.ref();
    common_vendor.onLoad((e) => {
      id = e.id;
      getDetail();
    });
    const getDetail = async () => {
      let res = await db.collection("demo-user").doc(id).get({ getOne: true });
      common_vendor.index.__f__("log", "at pages/demo0719/detail.vue:46", res.result.data);
      detail.value = res.result.data;
    };
    const handleRemove = () => {
      common_vendor.index.showModal({
        title: "是否删除改数据",
        success: async (res) => {
          if (res.confirm) {
            await db.collection("demo-user").doc(id).remove();
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "none"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          }
        }
      });
    };
    const goUpdate = (e) => {
      common_vendor.index.__f__("log", "at pages/demo0719/detail.vue:69", e);
      common_vendor.index.navigateTo({
        url: "/pages/demo0719/update?id=" + e
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: detail.value
      }, detail.value ? common_vendor.e({
        b: detail.value.avatar
      }, detail.value.avatar ? {
        c: detail.value.avatar[0].url
      } : {}, {
        d: common_vendor.t(detail.value.name),
        e: common_vendor.t(detail.value.age),
        f: common_vendor.t(detail.value.ip),
        g: common_vendor.t(common_vendor.unref(common_vendor.dayjs)(detail.value.createTime).format("YYYY-MM-DD HH:mm:ss")),
        h: common_vendor.o(($event) => goUpdate(detail.value._id)),
        i: common_vendor.o(handleRemove)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-eacdda8e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0719/detail.js.map
