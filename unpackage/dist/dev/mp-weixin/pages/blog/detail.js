"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
const common_style_favorites = require("../../common/style/favorites.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_dateformat2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_dateformat + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const article = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const shopInfo = common_vendor.ref(null);
    const shopId = common_vendor.ref("");
    const isFavorited = common_vendor.ref(false);
    const userAvatarCache = common_vendor.ref(/* @__PURE__ */ new Map());
    const isShopOpen = common_vendor.computed(() => {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a.businessHours))
        return true;
      const hoursStr = shopInfo.value.businessHours;
      const [start, end] = hoursStr.split("-");
      if (!start || !end)
        return true;
      const now = /* @__PURE__ */ new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHours * 60 + currentMinutes;
      const [startHours, startMinutes] = start.split(":").map(Number);
      const [endHours, endMinutes] = end.split(":").map(Number);
      const startTime = startHours * 60 + (startMinutes || 0);
      const endTime = endHours * 60 + (endMinutes || 0);
      return currentTime >= startTime && currentTime <= endTime;
    });
    common_vendor.onLoad((options) => {
      if (options.id) {
        if (options.shopId) {
          shopId.value = options.shopId;
          getShopDetail(shopId.value);
        }
        getArticleDetail(options.id);
      } else {
        common_vendor.index.showToast({ title: "缺少文章ID", icon: "none" });
        common_vendor.index.navigateBack();
      }
    });
    const articlesCloudObj = common_vendor.tr.importObject("articlesCloudObj");
    async function getShopDetail(shopId2) {
      var _a;
      if (!shopId2)
        return;
      try {
        const res = await common_vendor.tr.callFunction({
          name: "getShopDetail",
          data: { shopId: shopId2 }
        });
        if (((_a = res.result) == null ? void 0 : _a.errCode) === 0) {
          shopInfo.value = res.result.data;
          if (shopInfo.value.shopPic) {
            await processShopImage(shopInfo.value);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:244", "加载商家信息异常:", error);
      }
    }
    async function processShopImage(shop) {
      var _a;
      if (!shop.shopPic)
        return;
      try {
        if (shop.shopPic.startsWith("cloud:")) {
          const result = await common_vendor.tr.getTempFileURL({
            fileList: [shop.shopPic]
          });
          if (result.fileList && ((_a = result.fileList[0]) == null ? void 0 : _a.tempFileURL)) {
            shop.shopPic = result.fileList[0].tempFileURL;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:260", "转换商家图片URL失败:", error);
      }
    }
    const getShopAvatar = (shop) => {
      return (shop == null ? void 0 : shop.shopPic) || "/static/default-shop.jpg";
    };
    const handleShopAvatarError = (event) => {
      event.target.src = "/static/default-shop.jpg";
    };
    function formatNumber(num) {
      if (num >= 1e4)
        return (num / 1e4).toFixed(1) + "万";
      return num.toString();
    }
    function handlePhoneCall() {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a.phone))
        return;
      common_vendor.index.makePhoneCall({
        phoneNumber: shopInfo.value.phone,
        fail: () => {
          common_vendor.index.showToast({ title: "无法拨打电话", icon: "none" });
        }
      });
    }
    function navigateToShop() {
      var _a;
      if (!((_a = shopInfo.value) == null ? void 0 : _a._id))
        return;
      common_vendor.index.navigateTo({
        url: `/pages/shopList/shopDetail?id=${shopInfo.value._id}`
      });
    }
    function showContact() {
      if (!shopInfo.value)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/blog/edit?shopId=${shopInfo.value._id}`
      });
    }
    const setupUserInfoListeners = () => {
      common_vendor.index.$on("userInfoUpdated", updateUserAvatarInDetail);
    };
    const updateUserAvatarInDetail = (userData) => {
      var _a;
      if (!userData.userId || !userData.avatar || !article.value)
        return;
      userAvatarCache.value.set(userData.userId, userData.avatar);
      if (article.value.user_id && ((_a = article.value.user_id[0]) == null ? void 0 : _a._id) === userData.userId) {
        if (!article.value.user_id[0].avatar_file) {
          article.value.user_id[0].avatar_file = {};
        }
        article.value.user_id[0].avatar_file.url = userData.avatar;
        article.value.user_id[0].avatar_url = userData.avatar;
        article.value = { ...article.value };
      }
    };
    const getUserAvatar = (user) => {
      var _a, _b;
      if (!user || !user._id)
        return "/static/defAvatar.png";
      const userId = user._id;
      if (userAvatarCache.value.has(userId)) {
        return userAvatarCache.value.get(userId);
      }
      let avatarUrl = "/static/defAvatar.png";
      if (user.avatar_url && user.avatar_url.startsWith("http")) {
        avatarUrl = user.avatar_url;
      } else if ((_a = user.avatar_file) == null ? void 0 : _a.url) {
        const fileUrl = user.avatar_file.url;
        if (fileUrl.startsWith("cloud:")) {
          convertCloudFileUrl(fileUrl, userId);
          return "/static/defAvatar.png";
        } else if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        }
      } else if ((_b = user.avatar) == null ? void 0 : _b.startsWith("http")) {
        avatarUrl = user.avatar;
      }
      if (avatarUrl !== "/static/defAvatar.png") {
        userAvatarCache.value.set(userId, avatarUrl);
      }
      return avatarUrl;
    };
    const convertCloudFileUrl = async (fileUrl, userId) => {
      var _a, _b, _c, _d, _e;
      try {
        const result = await common_vendor.tr.getTempFileURL({ fileList: [fileUrl] });
        if ((_b = (_a = result.fileList) == null ? void 0 : _a[0]) == null ? void 0 : _b.tempFileURL) {
          const httpUrl = result.fileList[0].tempFileURL;
          userAvatarCache.value.set(userId, httpUrl);
          if (((_e = (_d = (_c = article.value) == null ? void 0 : _c.user_id) == null ? void 0 : _d[0]) == null ? void 0 : _e._id) === userId) {
            if (!article.value.user_id[0].avatar_file) {
              article.value.user_id[0].avatar_file = {};
            }
            article.value.user_id[0].avatar_file.url = httpUrl;
            article.value.user_id[0].avatar_url = httpUrl;
            article.value = { ...article.value };
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:367", "转换云存储URL失败:", error);
      }
    };
    const handleAvatarError = (event) => {
      event.target.src = "/static/defAvatar.png";
    };
    const initUserAvatarCache = () => {
      var _a, _b, _c, _d, _e;
      if (!((_b = (_a = article.value) == null ? void 0 : _a.user_id) == null ? void 0 : _b[0]))
        return;
      const user = article.value.user_id[0];
      const userId = user._id;
      let avatarUrl = "/static/defAvatar.png";
      if ((_c = user.avatar_url) == null ? void 0 : _c.startsWith("http")) {
        avatarUrl = user.avatar_url;
      } else if ((_d = user.avatar_file) == null ? void 0 : _d.url) {
        const fileUrl = user.avatar_file.url;
        if (fileUrl.startsWith("http")) {
          avatarUrl = fileUrl;
        } else if (fileUrl.startsWith("cloud:")) {
          convertCloudFileUrl(fileUrl, userId);
        }
      } else if ((_e = user.avatar) == null ? void 0 : _e.startsWith("http")) {
        avatarUrl = user.avatar;
      }
      if (avatarUrl !== "/static/defAvatar.png") {
        userAvatarCache.value.set(userId, avatarUrl);
      }
    };
    async function getArticleDetail(id) {
      loading.value = true;
      try {
        const { errCode, data, errMsg } = await articlesCloudObj.getDetail(id);
        if (errCode === 0) {
          article.value = data;
          initUserAvatarCache();
          if (!data.shop_id && shopId.value) {
            await getShopDetail(shopId.value);
          } else if (data.shop_id) {
            await getShopDetail(data.shop_id);
          }
          await checkFavoriteStatus();
        } else {
          common_vendor.index.showToast({ title: errMsg || "获取文章失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:419", "获取文章详情失败:", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    async function checkFavoriteStatus() {
      var _a;
      try {
        if (!((_a = article.value) == null ? void 0 : _a._id))
          return;
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (!(userInfo == null ? void 0 : userInfo._id)) {
          isFavorited.value = false;
          return;
        }
        const status = await common_style_favorites.favoritesManager.checkFavorite(article.value._id);
        isFavorited.value = status;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:437", "检查收藏状态失败:", error);
        isFavorited.value = false;
      }
    }
    async function toggleFavorite() {
      var _a;
      try {
        if (!((_a = article.value) == null ? void 0 : _a._id))
          return;
        const userInfo = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        if (!(userInfo == null ? void 0 : userInfo._id)) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        if (isFavorited.value) {
          const success = await common_style_favorites.favoritesManager.removeFavorite(article.value._id);
          if (success) {
            isFavorited.value = false;
            common_vendor.index.showToast({ title: "取消收藏", icon: "success" });
          }
        } else {
          const success = await common_style_favorites.favoritesManager.addFavorite(article.value._id);
          if (success) {
            isFavorited.value = true;
            common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:465", "切换收藏状态失败:", error);
        common_vendor.index.showToast({ title: "操作失败，请重试", icon: "none" });
      }
    }
    function shareArticle() {
      var _a, _b, _c, _d;
      common_vendor.index.share({
        provider: "weixin",
        type: 0,
        title: ((_b = (_a = article.value) == null ? void 0 : _a.content) == null ? void 0 : _b.substring(0, 20)) + "..." || "分享内容",
        summary: ((_c = article.value) == null ? void 0 : _c.content) || "",
        href: `/pages/blog/detail?id=${(_d = article.value) == null ? void 0 : _d._id}`,
        success: () => {
          common_vendor.index.showToast({ title: "分享成功", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "分享失败", icon: "none" });
        }
      });
    }
    async function removeArticle() {
      var _a;
      if (!((_a = article.value) == null ? void 0 : _a._id))
        return;
      const { confirm } = await common_vendor.index.showModal({
        title: "提示",
        content: "确认删除这条内容？",
        confirmColor: "#FF5B5B"
      });
      if (!confirm)
        return;
      try {
        const { errCode } = await articlesCloudObj.remove(article.value._id);
        if (errCode === 0) {
          common_vendor.index.showToast({ title: "删除成功", icon: "success" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          common_vendor.index.showToast({ title: "删除失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/detail.vue:504", "删除文章失败:", error);
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      }
    }
    function preview(pics, idx) {
      common_vendor.index.previewImage({
        urls: pics.map((p) => p.url),
        current: idx
      });
    }
    common_vendor.onMounted(() => {
      setupUserInfoListeners();
      const pendingUpdate = common_vendor.index.getStorageSync("userInfoPendingUpdate");
      if (pendingUpdate) {
        updateUserAvatarInDetail(pendingUpdate);
        common_vendor.index.removeStorageSync("userInfoPendingUpdate");
      }
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("userInfoUpdated");
    });
    common_vendor.onShow(() => {
      const lastUpdate = common_vendor.index.getStorageSync("lastUserInfoUpdate");
      if (lastUpdate) {
        updateUserAvatarInDetail(lastUpdate);
      }
      if (article.value) {
        checkFavoriteStatus();
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: article.value
      }, article.value ? common_vendor.e({
        b: shopInfo.value
      }, shopInfo.value ? common_vendor.e({
        c: getShopAvatar(shopInfo.value),
        d: common_vendor.o(handleShopAvatarError),
        e: shopInfo.value.isVerified
      }, shopInfo.value.isVerified ? {} : {}, {
        f: common_vendor.t(shopInfo.value.shopName || "未知商家"),
        g: shopInfo.value.rating > 0
      }, shopInfo.value.rating > 0 ? {
        h: common_vendor.t((shopInfo.value.rating / 10).toFixed(1))
      } : {}, {
        i: isShopOpen.value ? 1 : "",
        j: common_vendor.t(isShopOpen.value ? "营业中" : "已打烊"),
        k: isShopOpen.value ? 1 : "",
        l: common_vendor.t(shopInfo.value.category || "美食"),
        m: common_vendor.t(formatNumber(shopInfo.value.monthlyOrders || 0)),
        n: common_vendor.t(shopInfo.value.deliveryTime || "30-40"),
        o: common_vendor.t((shopInfo.value.deliveryFee || 0) === 0 ? "免费" : `¥${shopInfo.value.deliveryFee}`),
        p: shopInfo.value.address
      }, shopInfo.value.address ? {
        q: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#666"
        }),
        r: common_vendor.t(shopInfo.value.address)
      } : {}, {
        s: shopInfo.value.businessHours
      }, shopInfo.value.businessHours ? {
        t: common_vendor.p({
          type: "time-filled",
          size: "16",
          color: "#666"
        }),
        v: common_vendor.t(shopInfo.value.businessHours)
      } : {}, {
        w: shopInfo.value.phone
      }, shopInfo.value.phone ? {
        x: common_vendor.p({
          type: "phone-filled",
          size: "16",
          color: "#666"
        }),
        y: common_vendor.t(shopInfo.value.phone),
        z: common_vendor.o(handlePhoneCall)
      } : {}, {
        A: common_vendor.p({
          type: "shop",
          size: "18",
          color: "#fff"
        }),
        B: common_vendor.o(navigateToShop),
        C: common_vendor.p({
          type: "chat",
          size: "18",
          color: "#FF6B35"
        }),
        D: common_vendor.o(showContact)
      }) : {}, {
        E: getUserAvatar(article.value.user_id[0]),
        F: common_vendor.o(handleAvatarError),
        G: common_vendor.t(((_a = article.value.user_id[0]) == null ? void 0 : _a.nickname) || "匿名"),
        H: common_vendor.p({
          date: article.value.publish_date,
          format: "MM-dd hh:mm",
          threshold: [6e4, 36e5 * 24 * 30]
        }),
        I: common_vendor.t(article.value.content),
        J: (_b = article.value.pics) == null ? void 0 : _b.length
      }, ((_c = article.value.pics) == null ? void 0 : _c.length) ? {
        K: common_vendor.f(article.value.pics, (pic, idx, i0) => {
          return {
            a: idx,
            b: pic.url,
            c: common_vendor.o(($event) => preview(article.value.pics, idx), idx)
          };
        })
      } : {}, {
        L: common_vendor.p({
          type: isFavorited.value ? "heart-filled" : "heart",
          color: isFavorited.value ? "#fff" : "#8B9AB6",
          size: "20"
        }),
        M: isFavorited.value ? 1 : "",
        N: common_vendor.t(isFavorited.value ? "已收藏" : "收藏"),
        O: common_vendor.o(toggleFavorite),
        P: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#8B9AB6"
        }),
        Q: common_vendor.o(shareArticle),
        R: common_vendor.unref(utils_common.isPermission)((_d = article.value.user_id[0]) == null ? void 0 : _d._id)
      }, common_vendor.unref(utils_common.isPermission)((_e = article.value.user_id[0]) == null ? void 0 : _e._id) ? {
        S: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#FF5B5B"
        }),
        T: common_vendor.o(removeArticle)
      } : {}) : {
        U: common_vendor.p({
          status: "loading",
          content: "加载中..."
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f02f3071"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/detail.js.map
