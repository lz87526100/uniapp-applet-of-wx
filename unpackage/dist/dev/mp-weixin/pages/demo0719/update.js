"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "update",
  setup(__props) {
    let id;
    const db = common_vendor.tr.database();
    const formData = common_vendor.ref({
      name: "",
      age: ""
    });
    common_vendor.onLoad((e) => {
      id = e.id;
      getData();
    });
    const getData = async () => {
      let { result: { data } } = await db.collection("demo-user").doc(id).get({ getOne: true });
      common_vendor.index.__f__("log", "at pages/demo0719/update.vue:33", data);
      formData.value.name = data.name;
      formData.value.age = data.age;
    };
    const handleUpdate = async () => {
      let res = await db.collection("demo-user").doc(id).update(formData.value);
      common_vendor.index.__f__("log", "at pages/demo0719/update.vue:43", res);
    };
    return (_ctx, _cache) => {
      return {
        a: formData.value.name,
        b: common_vendor.o(($event) => formData.value.name = $event.detail.value),
        c: formData.value.age,
        d: common_vendor.o(common_vendor.m(($event) => formData.value.age = $event.detail.value, {
          number: true
        })),
        e: common_vendor.o(handleUpdate)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7e255363"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0719/update.js.map
