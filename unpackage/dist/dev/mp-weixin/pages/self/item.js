"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_common = require("../../utils/common.js");
const common_style_favorites = require("../../common/style/favorites.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_load_more2 + _easycom_uni_icons2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons)();
}
const size = 8;
const MAX_CACHE_SIZE = 30;
const _sfc_main = {
  __name: "item",
  setup(__props) {
    const commentList = common_vendor.ref([]);
    const currentUserId = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    let page = 1;
    const userAvatarCache = common_vendor.ref(/* @__PURE__ */ new Map());
    const shopInfoCache = common_vendor.ref(/* @__PURE__ */ new Map());
    const isShopReview = (item) => {
      return item.shop_id && item.rating;
    };
    const getUserAvatar = (item) => {
      if (!item.userInfo)
        return "/static/defAvatar.png";
      const userId = item.userInfo._id;
      if (!userId)
        return "/static/defAvatar.png";
      if (userAvatarCache.value.has(userId)) {
        return userAvatarCache.value.get(userId);
      }
      let avatarUrl = "/static/defAvatar.png";
      if (item.userInfo.avatar_url && item.userInfo.avatar_url.startsWith("http")) {
        avatarUrl = item.userInfo.avatar_url;
      } else if (item.userInfo.avatar_file && item.userInfo.avatar_file.url) {
        const fileUrl = item.userInfo.avatar_file.url;
        if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        } else if (fileUrl.startsWith("cloud:")) {
          return "/static/defAvatar.png";
        }
      } else if (item.userInfo.avatar && item.userInfo.avatar.startsWith("http")) {
        avatarUrl = item.userInfo.avatar;
      }
      if (avatarUrl !== "/static/defAvatar.png") {
        updateAvatarCache(userId, avatarUrl);
      }
      return avatarUrl;
    };
    const getUserName = (item) => {
      var _a;
      return ((_a = item.userInfo) == null ? void 0 : _a.nickname) || "匿名用户";
    };
    const getShopAvatar = (item) => {
      if (!item.shopInfo)
        return "/static/default-shop.jpg";
      return item.shopInfo.shopPic || "/static/default-shop.jpg";
    };
    const getShopName = (item) => {
      if (!item.shopInfo)
        return "加载中...";
      return item.shopInfo.shopName || "未知商家";
    };
    const handleShopAvatarError = (event2) => {
      common_vendor.index.__f__("log", "at pages/self/item.vue:230", "商家头像加载失败:", event2);
      event2.target.src = "/static/default-shop.jpg";
    };
    function goToDetail(item) {
      if (!item || !item._id) {
        common_vendor.index.showToast({ title: "文章信息错误", icon: "none" });
        return;
      }
      let url = `/pages/blog/detail?id=${item._id}`;
      if (item.shop_id) {
        url += `&shopId=${item.shop_id}`;
      }
      common_vendor.index.navigateTo({
        url
      });
    }
    async function toggleFavorite(articleId, item) {
      try {
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (!userInfo || !userInfo._id) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        common_vendor.index.__f__("log", "at pages/self/item.vue:260", "切换收藏状态:", { articleId, currentStatus: item.isFavorited });
        if (item.isFavorited) {
          const success = await common_style_favorites.favoritesManager.removeFavorite(articleId);
          if (success) {
            item.isFavorited = false;
            common_vendor.index.showToast({ title: "取消收藏", icon: "success" });
          }
        } else {
          const success = await common_style_favorites.favoritesManager.addFavorite(articleId);
          if (success) {
            item.isFavorited = true;
            common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/item.vue:276", "切换收藏状态失败:", error);
        common_vendor.index.showToast({ title: "操作失败，请重试", icon: "none" });
      }
    }
    const loadShopInfo = async (shopId) => {
      var _a, _b;
      if (!shopId)
        return null;
      try {
        common_vendor.index.__f__("log", "at pages/self/item.vue:286", "开始加载商家信息，shopId:", shopId);
        const res = await common_vendor.tr.callFunction({
          name: "getShopDetail",
          data: { shopId }
        });
        if (((_a = res.result) == null ? void 0 : _a.errCode) === 0) {
          common_vendor.index.__f__("log", "at pages/self/item.vue:293", "商家信息加载成功:", res.result.data);
          shopInfoCache.value.set(shopId, res.result.data);
          return res.result.data;
        } else {
          common_vendor.index.__f__("error", "at pages/self/item.vue:297", "商家信息加载失败:", (_b = res.result) == null ? void 0 : _b.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/item.vue:300", "加载商家信息异常:", error);
      }
      return null;
    };
    const batchLoadShopInfo = async () => {
      const shopIds = commentList.value.filter((item) => item.shop_id && !shopInfoCache.value.has(item.shop_id)).map((item) => item.shop_id);
      if (shopIds.length === 0)
        return;
      common_vendor.index.__f__("log", "at pages/self/item.vue:313", "批量加载商家信息，数量:", shopIds.length);
      for (const shopId of shopIds) {
        await loadShopInfo(shopId);
      }
      commentList.value.forEach((item, index) => {
        if (item.shop_id && shopInfoCache.value.has(item.shop_id)) {
          item.shopInfo = shopInfoCache.value.get(item.shop_id);
          commentList.value[index] = { ...commentList.value[index] };
        }
      });
    };
    const updateAvatarCache = (userId, avatarUrl) => {
      if (userAvatarCache.value.size >= MAX_CACHE_SIZE) {
        const firstKey = userAvatarCache.value.keys().next().value;
        userAvatarCache.value.delete(firstKey);
      }
      userAvatarCache.value.set(userId, avatarUrl);
    };
    common_vendor.onLoad(async (options) => {
      common_vendor.index.__f__("log", "at pages/self/item.vue:341", "页面参数:", options);
      if (options.userId) {
        currentUserId.value = options.userId;
      } else {
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (userInfoFromStorage && userInfoFromStorage._id) {
          currentUserId.value = userInfoFromStorage._id;
        }
      }
      common_vendor.index.__f__("log", "at pages/self/item.vue:352", "当前用户ID:", currentUserId.value);
      await getData(true);
    });
    const getData = async (reset = true) => {
      if (reset) {
        loading.value = true;
        page = 1;
      } else {
        loadingMore.value = true;
      }
      try {
        const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
        let res;
        try {
          res = await articlesCloudObj.getUserArticles({
            userId: currentUserId.value,
            page,
            size
          });
        } catch (error) {
          common_vendor.index.__f__("log", "at pages/self/item.vue:377", "getUserArticles 方法不存在，使用 list 方法:", error);
          res = await articlesCloudObj.list({ page, size: 100 });
        }
        common_vendor.index.__f__("log", "at pages/self/item.vue:382", "加载数据结果:", res);
        if (res.errCode === 0) {
          let data = res.data || [];
          if (!res.data || Array.isArray(res.data) && res.data.length > 0 && !res.data[0].user_id) {
            data = data.filter((item) => {
              if (Array.isArray(item.user_id)) {
                return item.user_id.some((user) => user._id === currentUserId.value);
              } else {
                return item.user_id === currentUserId.value;
              }
            });
          }
          common_vendor.index.__f__("log", "at pages/self/item.vue:398", `用户文章数量: ${data.length}`);
          const processedData = data.map((item) => ({
            _id: item._id || "",
            content: item.content || "暂无内容",
            pics: processImagePaths(item.pics),
            like_count: item.like_count || 0,
            comment_count: item.comment_count || 0,
            createTime: item.createTime || item.publish_date || Date.now(),
            shop_id: item.shop_id || null,
            rating: item.rating || null,
            userInfo: Array.isArray(item.user_id) ? item.user_id[0] : item.user_id,
            shopInfo: null,
            // 初始化为 null，后面再加载
            isFavorited: false
          }));
          if (reset) {
            commentList.value = processedData;
          } else {
            commentList.value = [...commentList.value, ...processedData];
          }
          finished.value = !data || data.length < size;
          if (commentList.value.length > 0) {
            await checkFavoritesStatus();
            await batchLoadShopInfo();
          }
        } else {
          common_vendor.index.__f__("error", "at pages/self/item.vue:431", "获取数据失败:", res.errCode);
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/item.vue:438", "获取数据异常:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        loading.value = false;
        loadingMore.value = false;
        refreshing.value = false;
        common_vendor.index.stopPullDownRefresh();
      }
    };
    async function checkFavoritesStatus() {
      try {
        const articleIds = commentList.value.map((item) => item._id).filter((id) => id);
        if (articleIds.length === 0) {
          common_vendor.index.__f__("log", "at pages/self/item.vue:457", "没有文章需要检查收藏状态");
          return;
        }
        common_vendor.index.__f__("log", "at pages/self/item.vue:461", "🔄 开始检查收藏状态，文章数量:", articleIds.length);
        const favoritesStatus = await common_style_favorites.favoritesManager.batchCheckFavorites(articleIds);
        common_vendor.index.__f__("log", "at pages/self/item.vue:464", "✅ 收藏状态检查完成:", favoritesStatus);
        commentList.value.forEach((item) => {
          if (item && item._id) {
            item.isFavorited = favoritesStatus[item._id] || false;
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/item.vue:472", "检查收藏状态失败，设置所有为未收藏:", error);
        commentList.value.forEach((item) => {
          if (item) {
            item.isFavorited = false;
          }
        });
      }
    }
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
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/self/item.vue:500", "页面触底，触发加载更多");
      loadMore();
    });
    common_vendor.onPullDownRefresh(() => {
      onRefresh();
    });
    function onRefresh() {
      if (refreshing.value)
        return;
      refreshing.value = true;
      common_vendor.index.__f__("log", "at pages/self/item.vue:514", "下拉刷新");
      getData(true);
    }
    function loadMore() {
      if (loadingMore.value || finished.value || loading.value) {
        common_vendor.index.__f__("log", "at pages/self/item.vue:521", "跳过加载: loadingMore=", loadingMore.value, "finished=", finished.value, "loading=", loading.value);
        return;
      }
      common_vendor.index.__f__("log", "at pages/self/item.vue:525", "触底加载更多，页码:", page + 1);
      loadingMore.value = true;
      page++;
      getData(false);
    }
    async function remove(id) {
      const { confirm } = await common_vendor.index.showModal({
        title: "提示",
        content: "确认删除这条内容？",
        confirmColor: "#FF5B5B"
      });
      if (!confirm)
        return;
      try {
        const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
        const { errCode } = await articlesCloudObj.remove(id);
        if (errCode === 0) {
          common_vendor.index.showToast({ title: "已删除", icon: "none" });
          page = 1;
          getData(true);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/item.vue:549", "删除失败:", error);
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      }
    }
    let startX = 0;
    function touchStart(e) {
      startX = e.touches[0].pageX;
    }
    function touchEnd(id) {
      const moveX = event.changedTouches[0].pageX - startX;
      if (moveX < -80)
        remove(id);
    }
    function goAdd() {
      common_vendor.index.navigateTo({ url: "/pages/blog/edit" });
    }
    common_vendor.index.$on("editEvent", () => {
      common_vendor.index.__f__("log", "at pages/self/item.vue:571", "收到编辑事件，刷新数据");
      page = 1;
      finished.value = false;
      getData(true);
    });
    common_vendor.onUnload(() => {
      common_vendor.index.__f__("log", "at pages/self/item.vue:579", "页面卸载");
      common_vendor.index.$off("editEvent");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentUserId.value
      }, currentUserId.value ? {
        b: common_vendor.t(currentUserId.value)
      } : {}, {
        c: refreshing.value
      }, refreshing.value ? {
        d: common_vendor.p({
          status: "loading",
          content: "刷新中..."
        })
      } : {}, {
        e: loading.value && commentList.value.length === 0
      }, loading.value && commentList.value.length === 0 ? {
        f: common_vendor.f(8, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : common_vendor.e({
        g: common_vendor.f(commentList.value, (item, k0, i0) => {
          var _a, _b, _c, _d;
          return common_vendor.e({
            a: (_a = item.pics) == null ? void 0 : _a.length
          }, ((_b = item.pics) == null ? void 0 : _b.length) ? {
            b: item.pics[0]
          } : {
            c: common_assets._imports_0
          }, {
            d: common_vendor.o(($event) => goToDetail(item), item._id),
            e: !isShopReview(item)
          }, !isShopReview(item) ? {
            f: getUserAvatar(item),
            g: common_vendor.t(getUserName(item))
          } : common_vendor.e({
            h: getShopAvatar(item),
            i: common_vendor.o(handleShopAvatarError, item._id),
            j: common_vendor.t(getShopName(item)),
            k: item.rating
          }, item.rating ? {
            l: common_vendor.t(item.rating)
          } : {}), {
            m: "a3761f6d-1-" + i0,
            n: common_vendor.p({
              type: item.isFavorited ? "heart-filled" : "heart",
              color: item.isFavorited ? "#FF5B5B" : "#8B9AB6",
              size: "18"
            }),
            o: common_vendor.o(($event) => toggleFavorite(item._id, item), item._id),
            p: common_vendor.unref(utils_common.isPermission)((_c = item.userInfo) == null ? void 0 : _c._id)
          }, common_vendor.unref(utils_common.isPermission)((_d = item.userInfo) == null ? void 0 : _d._id) ? {
            q: "a3761f6d-2-" + i0,
            r: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#fff"
            }),
            s: common_vendor.o(($event) => remove(item._id), item._id)
          } : {}, {
            t: item._id,
            v: common_vendor.o(touchStart, item._id),
            w: common_vendor.o(($event) => touchEnd(item._id), item._id),
            x: isShopReview(item) ? 1 : ""
          });
        }),
        h: loadingMore.value
      }, loadingMore.value ? {
        i: common_vendor.p({
          status: "loading",
          content: "正在加载..."
        })
      } : finished.value && commentList.value.length > 0 ? {} : commentList.value.length === 0 ? {} : {}, {
        j: finished.value && commentList.value.length > 0,
        k: commentList.value.length === 0
      }), {
        l: common_vendor.o(loadMore),
        m: refreshing.value,
        n: common_vendor.o(onRefresh),
        o: common_vendor.o(goAdd)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a3761f6d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/item.js.map
