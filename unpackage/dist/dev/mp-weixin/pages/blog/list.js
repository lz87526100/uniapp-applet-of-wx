"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_common = require("../../utils/common.js");
if (!Array) {
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_fab2 = common_vendor.resolveComponent("uni-fab");
  (_easycom_uni_dateformat2 + _easycom_uni_icons2 + _easycom_uni_fab2)();
}
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_fab = () => "../../uni_modules/uni-fab/components/uni-fab/uni-fab.js";
if (!Math) {
  (_easycom_uni_dateformat + _easycom_uni_icons + _easycom_uni_fab)();
}
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
    const articlesList = common_vendor.ref({});
    const CurrentUserInfo = common_vendor.tr.getCurrentUserInfo();
    common_vendor.index.__f__("log", "at pages/blog/list.vue:50", CurrentUserInfo);
    common_vendor.index.$on("editEvent", (e) => {
      getData();
    });
    const remove = async (id) => {
      try {
        let feedback = await common_vendor.index.showModal({
          title: "提示",
          content: "是否确认删除？"
        });
        if (!feedback.confirm)
          return;
        let { errCode } = await articlesCloudObj.remove(id);
        if (errCode == 0) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "none",
            duration: 4e3,
            // 显式写出
            complete: () => setTimeout(getData, 1e3)
            // 等 toast 消失后再刷新
          });
        }
      } catch (err) {
        common_vendor.index.showToast({
          title: err,
          icon: "none"
        });
      }
    };
    const getData = async () => {
      let { errCode, data } = await articlesCloudObj.list();
      articlesList.value = data;
      common_vendor.index.__f__("log", "at pages/blog/list.vue:86", data);
    };
    const goAdd = () => {
      common_vendor.index.navigateTo({
        url: "/pages/blog/edit"
      });
    };
    getData();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(articlesList.value, (item, index, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: common_vendor.t(item.user_id[0].nickname || "匿名"),
            b: common_vendor.t(item.content),
            c: (_a = item.pics) == null ? void 0 : _a.length
          }, ((_b = item.pics) == null ? void 0 : _b.length) ? {
            d: common_vendor.f(item.pics, (pic, index2, i1) => {
              return {
                a: pic.url,
                b: index2
              };
            })
          } : {}, {
            e: "f909dea6-0-" + i0,
            f: common_vendor.p({
              date: item.publish_date,
              format: "MM月dd hh:mm",
              threshold: [6e4, 36e5 * 24 * 30]
            }),
            g: common_vendor.unref(utils_common.isPermission)(item.user_id[0]._id)
          }, common_vendor.unref(utils_common.isPermission)(item.user_id[0]._id) ? {
            h: "f909dea6-1-" + i0,
            i: common_vendor.p({
              type: "trash-filled",
              size: "16",
              color: "#999"
            }),
            j: common_vendor.o(($event) => remove(item._id), index)
          } : {}, {
            k: index
          });
        }),
        b: common_assets._imports_0,
        c: common_vendor.sr("fab", "f909dea6-2"),
        d: common_vendor.o(goAdd),
        e: common_vendor.p({
          pattern: {
            icon: "compose"
          },
          horizontal: "right",
          vertical: "bottom"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f909dea6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/list.js.map
