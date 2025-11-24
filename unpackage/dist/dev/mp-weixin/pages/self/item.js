"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "item",
  setup(__props) {
    const commentList = common_vendor.ref([]);
    const currentUserId = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    function goToDetail(item) {
      if (!item || !item._id) {
        common_vendor.index.showToast({ title: "文章信息错误", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/blog/detail?id=${item._id}`
      });
    }
    let previewTimer = null;
    function previewImage(pics, currentIndex) {
      if (previewTimer) {
        clearTimeout(previewTimer);
      }
      previewTimer = setTimeout(() => {
        if (!pics || pics.length === 0)
          return;
        const urls = pics.map((pic) => {
          if (typeof pic === "string") {
            return pic.trim();
          }
          return "";
        }).filter((url) => url && typeof url === "string");
        if (urls.length === 0)
          return;
        common_vendor.index.previewImage({
          urls,
          current: currentIndex
        });
      }, 150);
    }
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/self/item.vue:112", "页面参数:", options);
      if (options.userId) {
        currentUserId.value = options.userId;
      } else {
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (userInfoFromStorage && userInfoFromStorage._id) {
          currentUserId.value = userInfoFromStorage._id;
        }
      }
      common_vendor.index.__f__("log", "at pages/self/item.vue:123", "当前用户ID:", currentUserId.value);
      loadData();
    });
    const loadData = async () => {
      if (loading.value)
        return;
      loading.value = true;
      try {
        const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCloudObj.list({
          page: 1,
          size: 50
        });
        common_vendor.index.__f__("log", "at pages/self/item.vue:140", "加载数据结果:", res);
        if (res.errCode === 0) {
          const data = res.data || [];
          const userArticles = data.filter((item) => {
            if (Array.isArray(item.user_id)) {
              return item.user_id.some((user) => user._id === currentUserId.value);
            } else {
              return item.user_id === currentUserId.value;
            }
          });
          common_vendor.index.__f__("log", "at pages/self/item.vue:155", `总文章数: ${data.length}, 用户文章数: ${userArticles.length}`);
          common_vendor.index.__f__("log", "at pages/self/item.vue:156", "用户文章:", userArticles);
          commentList.value = userArticles.map((item) => ({
            _id: item._id || "",
            content: item.content || "暂无内容",
            pics: processImagePaths(item.pics),
            like_count: item.like_count || 0,
            comment_count: item.comment_count || 0,
            createTime: item.createTime || item.publish_date || Date.now()
          }));
        } else {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/item.vue:175", "加载数据异常:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const processImagePaths = (pics) => {
      if (!Array.isArray(pics)) {
        return [];
      }
      return pics.map((pic) => {
        if (!pic)
          return "";
        if (typeof pic === "object") {
          return pic.url || pic.path || pic.src || "";
        }
        return String(pic);
      }).filter((pic) => pic);
    };
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };
    common_vendor.onPullDownRefresh(() => {
      loadData().finally(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentUserId.value
      }, currentUserId.value ? {
        b: common_vendor.t(currentUserId.value)
      } : {}, {
        c: common_vendor.f(commentList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.content),
            b: item.pics && item.pics.length > 0
          }, item.pics && item.pics.length > 0 ? {
            c: common_vendor.f(item.pics, (pic, index, i1) => {
              return {
                a: index,
                b: pic,
                c: common_vendor.o(($event) => previewImage(item.pics, index), index)
              };
            })
          } : {}, {
            d: common_vendor.t(formatTime(item.createTime)),
            e: common_vendor.t(item.like_count || 0),
            f: common_vendor.t(item.comment_count || 0),
            g: item._id,
            h: common_vendor.o(($event) => goToDetail(item), item._id)
          });
        }),
        d: commentList.value.length === 0 && !loading.value
      }, commentList.value.length === 0 && !loading.value ? {} : {}, {
        e: loading.value
      }, loading.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a3761f6d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/item.js.map
