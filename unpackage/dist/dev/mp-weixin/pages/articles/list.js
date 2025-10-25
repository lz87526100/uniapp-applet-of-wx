"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const db = common_vendor.tr.database();
    const listData = common_vendor.ref([]);
    common_vendor.index.__f__("log", "at pages/articles/list.vue:17", common_vendor.tr.getCurrentUserInfo().uid);
    const getData = async () => {
      try {
        let artTemp = db.collection("demo-articles").where("user_id == $cloudEnv_uid ").getTemp();
        let userTemp = db.collection("uni-id-users").field("nickname,_id,username").getTemp();
        let { result: { data } } = await db.collection(artTemp, userTemp).get();
        listData.value = data;
        common_vendor.index.__f__("log", "at pages/articles/list.vue:28", data);
      } catch (err) {
        common_vendor.index.showModal({
          content: "未登录，将跳转至登录页面",
          showCancel: false
        });
      }
    };
    getData();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(listData.value, (item, index, i0) => {
          var _a;
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.content),
            c: common_vendor.t(((_a = item == null ? void 0 : item.user_id[0]) == null ? void 0 : _a.nickname) || "未命名"),
            d: item._id
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f990c86e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/articles/list.js.map
