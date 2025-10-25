"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const db = common_vendor.tr.database();
    const getData = async () => {
      let res = await db.collection("uni-id-users").field("nickname,_id").get();
      common_vendor.index.__f__("log", "at pages/articles/list.vue:10", res);
    };
    getData();
    return (_ctx, _cache) => {
      return {};
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/articles/list.js.map
