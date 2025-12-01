"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "shopFavorites",
  setup(__props) {
    const favoritesList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const isLoggedIn = common_vendor.ref(false);
    const userId = common_vendor.ref("");
    const currentUser = common_vendor.ref(null);
    const confirmPopup = common_vendor.ref(null);
    const currentCancelItem = common_vendor.ref(null);
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:153", "🔄 收藏页面加载");
      checkLoginStatus();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:158", "🔄 收藏页面显示");
      checkLoginStatus();
    });
    function goToFavoritesMap() {
      if (favoritesList.value.length === 0) {
        common_vendor.index.showToast({
          title: "暂无收藏店铺",
          icon: "none"
        });
        return;
      }
      const shopsData = favoritesList.value.map((item) => ({
        id: item.shopInfo._id,
        name: item.shopInfo.shopName,
        address: item.shopInfo.address,
        latitude: item.shopInfo.latitude || 39.90923,
        // 默认北京坐标
        longitude: item.shopInfo.longitude || 116.397428,
        shopPic: item.shopInfo.shopPic,
        rating: item.shopInfo.rating,
        deliveryFee: item.shopInfo.deliveryFee,
        isVerified: item.shopInfo.isVerified,
        businessHours: item.shopInfo.businessHours
      }));
      common_vendor.index.navigateTo({
        url: `/pages/showMap/showFavoritesMap?shops=${encodeURIComponent(JSON.stringify(shopsData))}`
      });
    }
    async function checkLoginStatus() {
      try {
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:194", "🔍 开始检查登录状态...");
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        const token = common_vendor.index.getStorageSync("uni_id_token");
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:199", "📦 存储检查结果:", {
          hasToken: !!token,
          hasUserInfo: !!userInfoFromStorage,
          userInfo: userInfoFromStorage
        });
        if (token && userInfoFromStorage && userInfoFromStorage._id) {
          isLoggedIn.value = true;
          userId.value = userInfoFromStorage._id;
          currentUser.value = userInfoFromStorage;
          common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:210", "✅ 用户已登录:", {
            userId: userId.value,
            userInfo: currentUser.value
          });
          await loadFavorites(true);
          return;
        }
        const oldUserInfo = common_vendor.index.getStorageSync("uni_id_userinfo");
        if (token && oldUserInfo && oldUserInfo._id) {
          isLoggedIn.value = true;
          userId.value = oldUserInfo._id;
          currentUser.value = oldUserInfo;
          common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:225", "✅ 从旧存储键名获取用户信息成功");
          common_vendor.index.setStorageSync("uni-id-pages-userInfo", oldUserInfo);
          await loadFavorites(true);
          return;
        }
        isLoggedIn.value = false;
        userId.value = "";
        currentUser.value = null;
        favoritesList.value = [];
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:237", "❌ 用户未登录或信息不完整");
        showLoginPrompt();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/shopFavorites.vue:241", "❌ 检查登录状态失败:", error);
        isLoggedIn.value = false;
        userId.value = "";
        currentUser.value = null;
        favoritesList.value = [];
        showLoginPrompt();
      }
    }
    function showLoginPrompt() {
      common_vendor.index.showModal({
        title: "提示",
        content: "请先登录查看收藏",
        confirmText: "去登录",
        cancelText: "返回",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          } else {
            common_vendor.index.navigateBack();
          }
        }
      });
    }
    async function loadFavorites(reset = false) {
      if (loading.value)
        return;
      if (!isLoggedIn.value || !userId.value) {
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:275", "❌ 加载收藏前检查: 用户未登录");
        showLoginPrompt();
        return;
      }
      if (reset) {
        currentPage.value = 1;
        favoritesList.value = [];
        hasMore.value = true;
      }
      if (!hasMore.value && !reset)
        return;
      loading.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:291", "🔄 开始加载收藏列表...", {
          userId: userId.value,
          page: currentPage.value,
          size: pageSize.value
        });
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.getShopFavoritesList({
          page: currentPage.value,
          size: pageSize.value,
          userId: userId.value
        });
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:305", "📋 收藏列表响应:", res);
        if (res.errCode === 0) {
          const newList = res.data.list || [];
          if (reset) {
            favoritesList.value = newList;
          } else {
            favoritesList.value = [...favoritesList.value, ...newList];
          }
          hasMore.value = res.data.hasMore || false;
          currentPage.value += 1;
          common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:319", "✅ 收藏列表加载成功，数量:", favoritesList.value.length);
        } else if (res.errCode === 1001) {
          common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:321", "❌ 云函数返回未登录状态");
          handleNotLogin();
        } else {
          throw new Error(res.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/shopFavorites.vue:327", "❌ 加载收藏列表失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
        if (error.message && error.message.includes("未登录")) {
          handleNotLogin();
        }
      } finally {
        loading.value = false;
      }
    }
    function handleNotLogin() {
      common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:343", "🔄 处理未登录状态");
      isLoggedIn.value = false;
      userId.value = "";
      currentUser.value = null;
      favoritesList.value = [];
      common_vendor.index.removeStorageSync("uni_id_token");
      common_vendor.index.removeStorageSync("uni-id-pages-userInfo");
      common_vendor.index.removeStorageSync("uni_id_token_expired");
      showLoginPrompt();
    }
    function cancelFavorite(item) {
      if (!isLoggedIn.value || !userId.value) {
        showLoginPrompt();
        return;
      }
      currentCancelItem.value = item;
      confirmPopup.value.open();
    }
    async function handleCancelConfirm() {
      if (!currentCancelItem.value)
        return;
      if (!isLoggedIn.value || !userId.value) {
        showLoginPrompt();
        return;
      }
      try {
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.toggleShopFavorite({
          shopId: currentCancelItem.value.shopInfo._id,
          userId: userId.value
        });
        common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:385", "📡 取消收藏响应:", res);
        if (res.errCode === 0) {
          const index = favoritesList.value.findIndex(
            (item) => item.favoriteId === currentCancelItem.value.favoriteId
          );
          if (index !== -1) {
            favoritesList.value.splice(index, 1);
          }
          common_vendor.index.showToast({
            title: "已取消收藏",
            icon: "success"
          });
        } else if (res.errCode === 1001) {
          handleNotLogin();
        } else {
          throw new Error(res.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/self/shopFavorites.vue:406", "❌ 取消收藏失败:", error);
        common_vendor.index.showToast({
          title: "取消收藏失败",
          icon: "none"
        });
      } finally {
        currentCancelItem.value = null;
        confirmPopup.value.close();
      }
    }
    function loadMore() {
      if (!hasMore.value || loading.value)
        return;
      loadFavorites();
    }
    function handleCancelClose() {
      currentCancelItem.value = null;
      confirmPopup.value.close();
    }
    function isShopOpen(shopInfo) {
      if (!(shopInfo == null ? void 0 : shopInfo.businessHours))
        return true;
      const hoursStr = shopInfo.businessHours;
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
    }
    function goToShopDetail(shopId) {
      common_vendor.index.navigateTo({
        url: `/pages/shopList/shopDetail?id=${shopId}`
      });
    }
    function goToShopList() {
      common_vendor.index.switchTab({
        url: "/pages/shopList/shopList"
      });
    }
    function handleImageError(e) {
      common_vendor.index.__f__("log", "at pages/self/shopFavorites.vue:463", "图片加载失败:", e);
      e.target.src = "/static/default-shop.jpg";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : favoritesList.value.length === 0 ? {
        c: common_vendor.o(goToShopList)
      } : common_vendor.e({
        d: common_vendor.f(favoritesList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.shopInfo.shopPic || "/static/default-shop.jpg",
            b: common_vendor.o(handleImageError, item.favoriteId),
            c: common_vendor.t(isShopOpen(item.shopInfo) ? "营业中" : "已打烊"),
            d: isShopOpen(item.shopInfo) ? 1 : "",
            e: !isShopOpen(item.shopInfo) ? 1 : "",
            f: common_vendor.t(item.shopInfo.shopName),
            g: item.shopInfo.isVerified
          }, item.shopInfo.isVerified ? {} : {}, {
            h: (item.shopInfo.rating || 0) % 2 !== 0 ? 1 : "",
            i: common_vendor.t(((item.shopInfo.rating || 0) / 10).toFixed(1)),
            j: common_vendor.o(($event) => cancelFavorite(item), item.favoriteId),
            k: item.favoriteId,
            l: `${index * 0.05}s`,
            m: common_vendor.o(($event) => goToShopDetail(item.shopInfo._id), item.favoriteId)
          });
        }),
        e: hasMore.value
      }, hasMore.value ? common_vendor.e({
        f: loading.value
      }, loading.value ? {} : {}, {
        g: common_vendor.o(loadMore)
      }) : {}), {
        b: favoritesList.value.length === 0,
        h: favoritesList.value.length > 0
      }, favoritesList.value.length > 0 ? {
        i: common_vendor.o(goToFavoritesMap)
      } : {}, {
        j: common_vendor.o(handleCancelClose),
        k: common_vendor.o(handleCancelConfirm),
        l: common_vendor.p({
          type: "warn",
          title: "取消收藏",
          content: "确定要取消收藏该店铺吗？",
          ["before-close"]: true
        }),
        m: common_vendor.sr(confirmPopup, "a306f840-0", {
          "k": "confirmPopup"
        }),
        n: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a306f840"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/self/shopFavorites.js.map
