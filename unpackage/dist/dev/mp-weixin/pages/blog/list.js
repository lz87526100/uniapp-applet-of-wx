"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_common = require("../../utils/common.js");
const common_style_favorites = require("../../common/style/favorites.js");
if (!Array) {
  const _easycom_home_head2 = common_vendor.resolveComponent("home-head");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_home_head2 + _easycom_uni_load_more2 + _easycom_uni_icons2)();
}
const _easycom_home_head = () => "../../components/home-head/home-head.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_home_head + _easycom_uni_load_more + _easycom_uni_icons)();
}
const size = 8;
const MAX_CACHE_SIZE = 30;
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
    const articlesList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    let page = 1;
    const userAvatarCache = common_vendor.ref(/* @__PURE__ */ new Map());
    const shopInfoCache = common_vendor.ref(/* @__PURE__ */ new Map());
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:171", "博客列表页面加载");
      setupUserInfoListeners();
      getData(true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:178", "页面触底，触发加载更多");
      loadMore();
    });
    common_vendor.onPullDownRefresh(() => {
      onRefresh();
    });
    const goDetail = (articleId, shopId) => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:189", "跳转到详情页，文章ID:", articleId, "商家ID:", shopId);
      let url = `/pages/blog/detail?id=${articleId}`;
      if (shopId) {
        url += `&shopId=${shopId}`;
      }
      common_vendor.index.navigateTo({
        url
      });
    };
    common_vendor.index.$on("editEvent", () => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:201", "收到编辑事件，刷新数据");
      page = 1;
      finished.value = false;
      getData(true);
    });
    const setupUserInfoListeners = () => {
      common_vendor.index.$on("userInfoUpdated", (data) => {
        common_vendor.index.__f__("log", "at pages/blog/list.vue:210", "博客列表收到用户信息更新:", data);
        updateUserAvatarInList(data);
      });
    };
    const updateUserAvatarInList = (userData) => {
      if (!userData.userId || !userData.avatar)
        return;
      common_vendor.index.__f__("log", "at pages/blog/list.vue:219", "开始更新博客列表中的用户头像，用户ID:", userData.userId);
      updateAvatarCache(userData.userId, userData.avatar);
      articlesList.value.forEach((item, index) => {
        if (item.user_id && item.user_id[0] && item.user_id[0]._id === userData.userId) {
          if (!item.user_id[0].avatar_file) {
            item.user_id[0].avatar_file = {};
          }
          item.user_id[0].avatar_file.url = userData.avatar;
          item.user_id[0].avatar_url = userData.avatar;
          articlesList.value[index] = { ...articlesList.value[index] };
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
    const getUserAvatar = (user) => {
      if (!user || !user._id)
        return "/static/defAvatar.png";
      const userId = user._id;
      if (userAvatarCache.value.has(userId)) {
        return userAvatarCache.value.get(userId);
      }
      let avatarUrl = "/static/defAvatar.png";
      if (user.avatar_url && user.avatar_url.startsWith("http")) {
        avatarUrl = user.avatar_url;
      } else if (user.avatar_file && user.avatar_file.url) {
        const fileUrl = user.avatar_file.url;
        if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        } else if (fileUrl.startsWith("cloud:")) {
          return "/static/defAvatar.png";
        }
      } else if (user.avatar && user.avatar.startsWith("http")) {
        avatarUrl = user.avatar;
      }
      if (avatarUrl !== "/static/defAvatar.png") {
        updateAvatarCache(userId, avatarUrl);
      }
      return avatarUrl;
    };
    const onAvatarLoad = (user) => {
      if (!user || !user._id)
        return;
      const userId = user._id;
      if (userAvatarCache.value.has(userId))
        return;
      if (user.avatar_file && user.avatar_file.url && user.avatar_file.url.startsWith("cloud:")) {
        convertCloudFileUrl(user.avatar_file.url, userId);
      }
    };
    const convertCloudFileUrl = async (fileUrl, userId) => {
      try {
        const result = await common_vendor.tr.getTempFileURL({
          fileList: [fileUrl]
        });
        if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
          const httpUrl = result.fileList[0].tempFileURL;
          updateAvatarCache(userId, httpUrl);
          updateAvatarInList(userId, httpUrl);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/list.vue:311", "转换云存储URL失败:", error);
      }
    };
    const updateAvatarInList = (userId, avatarUrl) => {
      articlesList.value.forEach((item, index) => {
        if (item.user_id && item.user_id[0] && item.user_id[0]._id === userId) {
          if (!item.user_id[0].avatar_file) {
            item.user_id[0].avatar_file = {};
          }
          item.user_id[0].avatar_file.url = avatarUrl;
          item.user_id[0].avatar_url = avatarUrl;
          articlesList.value[index] = { ...articlesList.value[index] };
        }
      });
    };
    const handleAvatarError = (event2) => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:332", "头像加载失败:", event2);
    };
    const isShopReview = (item) => {
      return item.shop_id && item.rating;
    };
    const getShopAvatar = (shopId) => {
      if (!shopId)
        return "/static/default-shop.jpg";
      const shopInfo = shopInfoCache.value.get(shopId);
      if (shopInfo && shopInfo.shopPic) {
        return shopInfo.shopPic;
      }
      return "/static/default-shop.jpg";
    };
    const getShopName = (shopId) => {
      if (!shopId)
        return "未知商家";
      const shopInfo = shopInfoCache.value.get(shopId);
      if (shopInfo && shopInfo.shopName) {
        return shopInfo.shopName;
      }
      return "加载中...";
    };
    const handleShopAvatarError = (event2) => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:366", "商家头像加载失败:", event2);
      event2.target.src = "/static/default-shop.jpg";
    };
    const loadShopInfo = async (shopId) => {
      var _a, _b;
      if (!shopId || shopInfoCache.value.has(shopId))
        return;
      try {
        common_vendor.index.__f__("log", "at pages/blog/list.vue:375", "开始加载商家信息，shopId:", shopId);
        const res = await common_vendor.tr.callFunction({
          name: "getShopDetail",
          data: { shopId }
        });
        if (((_a = res.result) == null ? void 0 : _a.errCode) === 0) {
          common_vendor.index.__f__("log", "at pages/blog/list.vue:382", "商家信息加载成功:", res.result.data);
          shopInfoCache.value.set(shopId, res.result.data);
          articlesList.value = [...articlesList.value];
        } else {
          common_vendor.index.__f__("error", "at pages/blog/list.vue:388", "商家信息加载失败:", (_b = res.result) == null ? void 0 : _b.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/list.vue:391", "加载商家信息异常:", error);
      }
    };
    const batchLoadShopInfo = async () => {
      const shopIds = articlesList.value.filter((item) => item.shop_id && !shopInfoCache.value.has(item.shop_id)).map((item) => item.shop_id);
      if (shopIds.length === 0)
        return;
      common_vendor.index.__f__("log", "at pages/blog/list.vue:403", "批量加载商家信息，数量:", shopIds.length);
      for (const shopId of shopIds) {
        await loadShopInfo(shopId);
      }
    };
    async function getData(reset = true) {
      if (reset) {
        loading.value = true;
        page = 1;
      } else {
        loadingMore.value = true;
      }
      try {
        common_vendor.index.__f__("log", "at pages/blog/list.vue:428", "获取博客列表数据，页码:", page);
        const { errCode, data } = await articlesCloudObj.list({ page, size });
        if (errCode === 0) {
          common_vendor.index.__f__("log", "at pages/blog/list.vue:432", "获取到数据条数:", data ? data.length : 0);
          if (reset) {
            articlesList.value = data || [];
          } else {
            articlesList.value = [...articlesList.value, ...data || []];
          }
          finished.value = !data || data.length < size;
          common_vendor.index.__f__("log", "at pages/blog/list.vue:443", "数据加载完成，列表长度:", articlesList.value.length, "是否完成:", finished.value);
          if (articlesList.value.length > 0) {
            await checkFavoritesStatus();
            await batchLoadShopInfo();
          }
        } else {
          common_vendor.index.__f__("error", "at pages/blog/list.vue:453", "获取数据失败:", errCode);
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/list.vue:460", "获取数据异常:", error);
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
    }
    async function toggleFavorite(articleId, item) {
      try {
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (!userInfo || !userInfo._id) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        common_vendor.index.__f__("log", "at pages/blog/list.vue:485", "切换收藏状态:", { articleId, currentStatus: item.isFavorited });
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
        common_vendor.index.__f__("error", "at pages/blog/list.vue:503", "切换收藏状态失败:", error);
        common_vendor.index.showToast({ title: "操作失败，请重试", icon: "none" });
      }
    }
    async function checkFavoritesStatus() {
      try {
        const articleIds = articlesList.value.map((item) => item._id).filter((id) => id);
        if (articleIds.length === 0) {
          common_vendor.index.__f__("log", "at pages/blog/list.vue:514", "没有文章需要检查收藏状态");
          return;
        }
        common_vendor.index.__f__("log", "at pages/blog/list.vue:518", "🔄 开始检查收藏状态，文章数量:", articleIds.length);
        const favoritesStatus = await common_style_favorites.favoritesManager.batchCheckFavorites(articleIds);
        common_vendor.index.__f__("log", "at pages/blog/list.vue:521", "✅ 收藏状态检查完成:", favoritesStatus);
        articlesList.value.forEach((item) => {
          if (item && item._id) {
            item.isFavorited = favoritesStatus[item._id] || false;
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/list.vue:530", "检查收藏状态失败，设置所有为未收藏:", error);
        articlesList.value.forEach((item) => {
          if (item) {
            item.isFavorited = false;
          }
        });
      }
    }
    function onRefresh() {
      if (refreshing.value)
        return;
      refreshing.value = true;
      common_vendor.index.__f__("log", "at pages/blog/list.vue:545", "下拉刷新");
      getData(true);
    }
    function loadMore() {
      if (loadingMore.value || finished.value || loading.value) {
        common_vendor.index.__f__("log", "at pages/blog/list.vue:553", "跳过加载: loadingMore=", loadingMore.value, "finished=", finished.value, "loading=", loading.value);
        return;
      }
      common_vendor.index.__f__("log", "at pages/blog/list.vue:557", "触底加载更多，页码:", page + 1);
      loadingMore.value = true;
      page++;
      getData(false);
    }
    async function remove(id) {
      const { confirm } = await common_vendor.index.showModal({
        title: "提示",
        content: "确认删除这条随笔？",
        confirmColor: "#FF5B5B"
      });
      if (!confirm)
        return;
      const { errCode } = await articlesCloudObj.remove(id);
      if (errCode === 0) {
        common_vendor.index.showToast({ title: "已删除", icon: "none" });
        page = 1;
        getData(true);
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
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/blog/list.vue:605", "博客列表页面卸载");
      common_vendor.index.$off("userInfoUpdated");
      common_vendor.index.$off("editEvent");
    });
    async function debugLoginStatus() {
      try {
        const articlesCloudObj2 = common_vendor.tr.importObject("articlesCloudObj");
        const result = await articlesCloudObj2.debugLoginStatus();
        common_vendor.index.__f__("log", "at pages/blog/list.vue:626", "🔍 登录状态调试结果:", result);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/list.vue:628", "调试失败:", error);
      }
    }
    common_vendor.onMounted(() => {
      debugLoginStatus();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: refreshing.value
      }, refreshing.value ? {
        b: common_vendor.p({
          status: "loading",
          content: "刷新中..."
        })
      } : {}, {
        c: loading.value && articlesList.value.length === 0
      }, loading.value && articlesList.value.length === 0 ? {
        d: common_vendor.f(8, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : common_vendor.e({
        e: common_vendor.f(articlesList.value, (item, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: (_a = item.pics) == null ? void 0 : _a.length
          }, ((_b = item.pics) == null ? void 0 : _b.length) ? {
            b: item.pics[0].url
          } : {
            c: common_assets._imports_0
          }, {
            d: common_vendor.o(($event) => goDetail(item._id, item.shop_id), item._id),
            e: !isShopReview(item)
          }, !isShopReview(item) ? {
            f: getUserAvatar(item.user_id[0]),
            g: common_vendor.o(handleAvatarError, item._id),
            h: common_vendor.o(($event) => onAvatarLoad(item.user_id[0]), item._id),
            i: common_vendor.t(item.user_id[0].nickname || "匿名用户")
          } : common_vendor.e({
            j: getShopAvatar(item.shop_id),
            k: common_vendor.o(handleShopAvatarError, item._id),
            l: common_vendor.t(getShopName(item.shop_id)),
            m: item.rating
          }, item.rating ? {
            n: common_vendor.t(item.rating)
          } : {}), {
            o: "f909dea6-2-" + i0,
            p: common_vendor.p({
              type: item.isFavorited ? "heart-filled" : "heart",
              color: item.isFavorited ? "#FF5B5B" : "#8B9AB6",
              size: "18"
            }),
            q: common_vendor.o(($event) => toggleFavorite(item._id, item), item._id),
            r: common_vendor.unref(utils_common.isPermission)(item.user_id[0]._id)
          }, common_vendor.unref(utils_common.isPermission)(item.user_id[0]._id) ? {
            s: "f909dea6-3-" + i0,
            t: common_vendor.p({
              type: "trash",
              size: "18",
              color: "#fff"
            }),
            v: common_vendor.o(($event) => remove(item._id), item._id)
          } : {}, {
            w: item._id,
            x: common_vendor.o(touchStart, item._id),
            y: common_vendor.o(($event) => touchEnd(item._id), item._id),
            z: isShopReview(item) ? 1 : ""
          });
        }),
        f: loadingMore.value
      }, loadingMore.value ? {
        g: common_vendor.p({
          status: "loading",
          content: "正在加载..."
        })
      } : finished.value && articlesList.value.length > 0 ? {} : articlesList.value.length === 0 ? {} : {}, {
        h: finished.value && articlesList.value.length > 0,
        i: articlesList.value.length === 0
      }), {
        j: common_vendor.o(loadMore),
        k: refreshing.value,
        l: common_vendor.o(onRefresh),
        m: common_vendor.o(goAdd)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f909dea6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/list.js.map
