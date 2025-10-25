"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const db = common_vendor.tr.database();
    const queryParams = common_vendor.ref({
      pageNum: 1,
      pageSize: 8,
      total: 0
    });
    const noData = common_vendor.ref(false);
    const userList = common_vendor.ref([]);
    const keyword = common_vendor.ref("");
    const onConfirm = () => {
      userList.value = [];
      getData();
    };
    const getData = async () => {
      let current = queryParams.value.pageSize * (queryParams.value.pageNum - 1);
      let res = await db.collection("demo-user").where(`${new RegExp(keyword.value, "i")}.test(name)`).orderBy("createTime desc").skip(current).limit(queryParams.value.pageSize).field("name,age,createtime,avatar").get({
        getCount: true
      });
      common_vendor.index.hideLoading();
      if (res.result.errCode === 0) {
        userList.value = [...userList.value, ...res.result.data];
        queryParams.value.total = res.result.count;
        if (queryParams.value.pageSize > res.result.data.length) {
          noData.value = true;
        }
      } else {
        common_vendor.index.showToast({
          title: res.result.errMsg,
          icon: "none"
        });
      }
      common_vendor.index.__f__("log", "at pages/demo0719/list.vue:82", res);
    };
    const goDetail = (e) => {
      common_vendor.index.__f__("log", "at pages/demo0719/list.vue:86", e);
      common_vendor.index.navigateTo({
        url: "/pages/demo0719/detail?id=" + e
      });
    };
    common_vendor.onReachBottom(() => {
      if (noData.value) {
        common_vendor.index.showToast({
          title: "到底了！！",
          icon: "none"
        });
        common_vendor.index.hideLoading();
        return;
      }
      common_vendor.index.showLoading({
        title: "加载中"
      });
      queryParams.value.pageNum++;
      getData();
    });
    getData();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(queryParams.value.total),
        b: common_vendor.t(userList.value.length),
        c: common_vendor.o(onConfirm),
        d: keyword.value,
        e: common_vendor.o(($event) => keyword.value = $event.detail.value),
        f: common_vendor.f(userList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: common_vendor.t(item._id),
            c: item.avatar
          }, item.avatar ? {
            d: item.avatar[0].url
          } : {}, {
            e: common_vendor.t(item.name),
            f: common_vendor.t(item.age),
            g: common_vendor.t(item.genger),
            h: common_vendor.t(item.createTime),
            i: item._id,
            j: common_vendor.o(($event) => goDetail(item._id), item._id)
          });
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6b3e1aab"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo0719/list.js.map
