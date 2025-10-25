"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "demo0829",
  setup(__props) {
    const dataList = common_vendor.ref([]);
    const db = common_vendor.tr.database();
    const getData = async () => {
      let wallTemp = db.collection("demo-wallper").where({ _id: "68b2df1f8c093f5f3379581e" }).field("_id,description,classid,picurl").orderBy("_id desc").limit(3).getTemp();
      let classTemp = db.collection("demo-classify").field("_id,name").getTemp();
      let res = await db.collection(wallTemp, classTemp).field("_id,description, picurl,classid").get();
      common_vendor.index.__f__("log", "at pages/demo0829/demo0829.vue:52", res);
      dataList.value = res.result.data;
    };
    getData();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(dataList.value, (item, k0, i0) => {
          return {
            a: item.picurl,
            b: common_vendor.t(item.description),
            c: common_vendor.t(item.classid[0].name),
            d: item._id
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bc3a23bb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0829/demo0829.js.map
