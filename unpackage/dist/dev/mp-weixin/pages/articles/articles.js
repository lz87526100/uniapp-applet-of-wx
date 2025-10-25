"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "articles",
  setup(__props) {
    const db = common_vendor.tr.database();
    const add = () => {
      db.collection("demo-articles").add({
        title: "jiuzhe ",
        content: "jiuzheba "
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/articles/articles.vue:16", res);
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(add)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/articles/articles.js.map
