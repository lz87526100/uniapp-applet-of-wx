"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "demo0920",
  setup(__props) {
    const demoObj = common_vendor.tr.importObject("demoObj0920");
    const dataList = common_vendor.ref([]);
    const getData = async () => {
      let { data } = await demoObj.getUser(50);
      dataList.value = data;
      common_vendor.index.__f__("log", "at pages/demo0920/demo0920.vue:27", res);
    };
    const handleAddUser = async () => {
      let res2 = await demoObj.addUser({ name: "张三", age: 21, gender: 1 });
      common_vendor.index.__f__("log", "at pages/demo0920/demo0920.vue:33", res2);
      getData();
    };
    getData();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleAddUser),
        b: common_vendor.f(dataList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: common_vendor.t(item._id),
            c: common_vendor.t(item.age),
            d: common_vendor.t(item.ip),
            e: common_vendor.t(item.createTime),
            f: item._id
          };
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0920/demo0920.js.map
