"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  (_easycom_uni_popup2 + _easycom_uni_popup_dialog2)();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
if (!Math) {
  (_easycom_uni_popup + _easycom_uni_popup_dialog)();
}
const _sfc_main = {
  __name: "showFavoritesMap",
  setup(__props) {
    const center = common_vendor.reactive({
      latitude: 25.034161,
      longitude: 118.482187
    });
    const scale = common_vendor.ref(15);
    const markers = common_vendor.ref([]);
    const favoritesList = common_vendor.ref([]);
    const selectedShopId = common_vendor.ref(null);
    const selectedShop = common_vendor.ref(null);
    const detailPopup = common_vendor.ref(null);
    const confirmPopup = common_vendor.ref(null);
    const mapContext = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const sortBy = common_vendor.ref("default");
    const isLoggedIn = common_vendor.ref(false);
    const userId = common_vendor.ref("");
    const currentUser = common_vendor.ref(null);
    const currentCancelItem = common_vendor.ref(null);
    const mapKey = common_vendor.ref(Date.now());
    const sortedFavorites = common_vendor.computed(() => {
      if (!favoritesList.value.length)
        return [];
      const list = [...favoritesList.value];
      switch (sortBy.value) {
        case "rating":
          return list.sort((a, b) => b.shopInfo.rating - a.shopInfo.rating);
        case "sales":
          return list.sort((a, b) => (b.shopInfo.monthlyOrders || 0) - (a.shopInfo.monthlyOrders || 0));
        default:
          return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    });
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:355", "🔄 收藏地图页面加载");
      checkLoginStatus();
      mapContext.value = common_vendor.index.createMapContext("favoritesMap", this);
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:361", "🔄 收藏地图页面显示");
      checkLoginStatus();
    });
    async function checkLoginStatus() {
      try {
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:368", "🔍 开始检查登录状态...");
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        const token = common_vendor.index.getStorageSync("uni_id_token");
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:373", "📦 存储检查结果:", {
          hasToken: !!token,
          hasUserInfo: !!userInfoFromStorage,
          userInfo: userInfoFromStorage
        });
        if (token && userInfoFromStorage && userInfoFromStorage._id) {
          isLoggedIn.value = true;
          userId.value = userInfoFromStorage._id;
          currentUser.value = userInfoFromStorage;
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:384", "✅ 用户已登录:", { userId: userId.value });
          await loadFavoritesData();
          return;
        }
        isLoggedIn.value = false;
        userId.value = "";
        currentUser.value = null;
        favoritesList.value = [];
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:394", "❌ 用户未登录或信息不完整");
        showLoginPrompt();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:398", "❌ 检查登录状态失败:", error);
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
        content: "请先登录查看收藏店铺",
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
    const loadFavoritesData = async () => {
      try {
        loading.value = true;
        common_vendor.index.showLoading({ title: "加载中..." });
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.getShopFavoritesList({
          page: 1,
          size: 50,
          userId: userId.value
        });
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:440", "📋 收藏列表响应:", res);
        if (res.errCode === 0) {
          favoritesList.value = res.data.list || [];
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:444", "✅ 成功加载收藏店铺:", favoritesList.value.length);
          await initMapMarkers();
        } else if (res.errCode === 1001) {
          handleNotLogin();
        } else {
          throw new Error(res.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:452", "❌ 加载收藏店铺失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
        common_vendor.index.hideLoading();
      }
    };
    const initMapMarkers = async () => {
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:465", "🗺️ 开始初始化地图标记，收藏店铺数量:", favoritesList.value.length);
      await common_vendor.nextTick$1();
      await recreateMapMarkers();
      if (favoritesList.value.length > 0 && markers.value.length > 0) {
        center.latitude = markers.value[0].latitude;
        center.longitude = markers.value[0].longitude;
        scale.value = 16;
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:478", "🎯 地图中心点移动到:", center);
      }
    };
    async function recreateMapMarkers() {
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:484", "🔄 重新创建地图标记");
      markers.value = [];
      await common_vendor.nextTick$1();
      if (favoritesList.value.length > 0) {
        const newMarkers = favoritesList.value.filter((item) => {
          const shop = item.shopInfo;
          if (!shop.location || !shop.location.coordinates) {
            common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:498", "❌ 店铺缺少坐标信息:", shop.shopName);
            return false;
          }
          const coordinates = shop.location.coordinates;
          if (!coordinates[0] || !coordinates[1] || coordinates[0] === 0 || coordinates[1] === 0) {
            common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:503", "❌ 店铺坐标无效:", shop.shopName, coordinates);
            return false;
          }
          return true;
        }).map((item) => {
          const shop = item.shopInfo;
          const coordinates = shop.location.coordinates;
          return {
            id: shop._id,
            latitude: coordinates[1],
            longitude: coordinates[0],
            title: shop.shopName,
            iconPath: "/static/logo/local.png",
            width: 20,
            height: 20,
            callout: {
              content: `${shop.shopName}
⭐${(shop.rating / 10).toFixed(1)} | 月售${formatNumber(shop.monthlyOrders || 0)}单`,
              color: "#333",
              fontSize: 12,
              borderRadius: 8,
              bgColor: "#fff",
              padding: 8,
              display: "ALWAYS",
              textAlign: "center"
            }
          };
        });
        markers.value = newMarkers;
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:535", "✅ 重新创建标记完成，数量:", markers.value.length);
      } else {
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:537", "📭 没有收藏店铺，标记已清空");
      }
      await forceRefreshMap();
    }
    async function forceRefreshMap() {
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:546", "🔄 强制刷新地图");
      try {
        mapKey.value = Date.now();
        await common_vendor.nextTick$1();
        if (mapContext.value) {
          setTimeout(() => {
            mapContext.value.moveToLocation({
              latitude: center.latitude,
              longitude: center.longitude,
              success: () => {
                common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:562", "✅ 地图刷新成功");
              },
              fail: (err) => {
                common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:565", "⚠️ 地图刷新失败:", err);
              }
            });
          }, 100);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:571", "❌ 强制刷新地图失败:", error);
      }
    }
    const onMarkerTap = (e) => {
      const markerId = e.detail.markerId;
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:578", "📍 地图标记点击:", markerId);
      const item = favoritesList.value.find((item2) => item2.shopInfo._id === markerId);
      if (item) {
        selectedShopId.value = markerId;
        showShopDetail(item.shopInfo);
        focusOnShopLocation(item.shopInfo);
      }
    };
    const onShopItemTap = (item) => {
      selectedShopId.value = item.shopInfo._id;
      selectedShop.value = item.shopInfo;
      focusOnShopLocation(item.shopInfo);
      showShopDetail(item.shopInfo);
    };
    const focusOnShopLocation = (shop) => {
      if (!shop || !shop.location || !shop.location.coordinates) {
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:599", "❌ 无法聚焦到店铺位置: 坐标信息缺失");
        return;
      }
      const coordinates = shop.location.coordinates;
      center.latitude = coordinates[1];
      center.longitude = coordinates[0];
      scale.value = 18;
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:608", "🎯 地图聚焦到店铺:", shop.shopName, coordinates);
    };
    const showShopDetail = (shop) => {
      selectedShop.value = shop;
      detailPopup.value.open();
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:615", "📱 显示店铺详情:", shop.shopName);
    };
    const closePopup = () => {
      detailPopup.value.close();
    };
    const backToCurrentLocation = () => {
      center.latitude = 25.034161;
      center.longitude = 118.482187;
      scale.value = 15;
      selectedShopId.value = null;
    };
    const zoomIn = () => {
      if (scale.value < 20) {
        scale.value += 1;
      }
    };
    const zoomOut = () => {
      if (scale.value > 3) {
        scale.value -= 1;
      }
    };
    const changeSort = (type) => {
      sortBy.value = type;
    };
    const openNavigation = () => {
      if (!selectedShop.value || !selectedShop.value.location || !selectedShop.value.location.coordinates) {
        common_vendor.index.showToast({
          title: "无法获取店铺位置",
          icon: "none"
        });
        return;
      }
      const coordinates = selectedShop.value.location.coordinates;
      common_vendor.index.openLocation({
        latitude: coordinates[1],
        longitude: coordinates[0],
        name: selectedShop.value.shopName,
        address: selectedShop.value.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:666", "打开地图成功");
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:669", "打开地图失败:", error);
          common_vendor.index.showToast({
            title: "打开地图失败",
            icon: "none"
          });
        }
      });
    };
    const openShopNavigation = (shop) => {
      if (!shop || !shop.location || !shop.location.coordinates) {
        common_vendor.index.showToast({
          title: "无法获取店铺位置",
          icon: "none"
        });
        return;
      }
      const coordinates = shop.location.coordinates;
      common_vendor.index.openLocation({
        latitude: coordinates[1],
        longitude: coordinates[0],
        name: shop.shopName,
        address: shop.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:695", "打开地图成功");
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:698", "打开地图失败:", error);
          common_vendor.index.showToast({
            title: "打开地图失败",
            icon: "none"
          });
        }
      });
    };
    const goToShopDetail = (shopId) => {
      if (!shopId) {
        common_vendor.index.showToast({
          title: "店铺信息不完整",
          icon: "none"
        });
        return;
      }
      const url = `/pages/shopList/shopDetail?id=${shopId}`;
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:719", "🔄 跳转到店铺详情:", { shopId, url });
      closePopup();
      common_vendor.index.navigateTo({
        url,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:726", "✅ 跳转到店铺详情页成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:729", "❌ 跳转失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败，请重试",
            icon: "none"
          });
        }
      });
    };
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
      try {
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.toggleShopFavorite({
          shopId: currentCancelItem.value.shopInfo._id,
          userId: userId.value
        });
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:761", "📡 取消收藏响应:", res);
        if (res.errCode === 0) {
          const removedShopId = currentCancelItem.value.shopInfo._id;
          const removedShopName = currentCancelItem.value.shopInfo.shopName;
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:768", "🗑️ 开始移除店铺:", removedShopName, removedShopId);
          favoritesList.value = favoritesList.value.filter(
            (item) => item.favoriteId !== currentCancelItem.value.favoriteId
          );
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:775", "✅ 从收藏列表中移除成功，剩余:", favoritesList.value.length);
          await recreateMapMarkers();
          if (selectedShopId.value === removedShopId) {
            selectedShopId.value = null;
            selectedShop.value = null;
            closePopup();
            common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:785", "✅ 重置选中状态");
          }
          common_vendor.index.showToast({
            title: "已取消收藏",
            icon: "success",
            duration: 1500
          });
          common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:795", "📊 更新后收藏数量:", favoritesList.value.length);
        } else if (res.errCode === 1001) {
          handleNotLogin();
        } else {
          throw new Error(res.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showFavoritesMap.vue:803", "❌ 取消收藏失败:", error);
        common_vendor.index.showToast({
          title: "取消收藏失败",
          icon: "none"
        });
      } finally {
        currentCancelItem.value = null;
        confirmPopup.value.close();
      }
    }
    function handleCancelClose() {
      currentCancelItem.value = null;
      confirmPopup.value.close();
    }
    function handleNotLogin() {
      isLoggedIn.value = false;
      userId.value = "";
      currentUser.value = null;
      favoritesList.value = [];
      markers.value = [];
      showLoginPrompt();
    }
    function goToShopList() {
      common_vendor.index.switchTab({
        url: "/pages/shopList/shopList"
      });
    }
    function goToUserCenter() {
      common_vendor.index.navigateTo({
        url: "/pages/user/user"
      });
    }
    function getShopImage(shopPic) {
      if (!shopPic) {
        return "/static/default-shop.jpg";
      }
      if (shopPic.startsWith("http")) {
        return shopPic;
      } else if (shopPic.startsWith("/")) {
        return `https://your-domain.com${shopPic}`;
      } else {
        return `/static/shop-images/${shopPic}`;
      }
    }
    function formatNumber(num) {
      if (num >= 1e4) {
        return (num / 1e4).toFixed(1) + "万";
      }
      return num.toString();
    }
    function handleImageError(e, type = "shop") {
      common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:870", "🖼️ 图片加载失败:", e, "类型:", type);
      const defaultImages = {
        shop: "/static/default-shop.jpg",
        user: "/static/default-avatar.png"
      };
      e.target.src = defaultImages[type] || defaultImages.shop;
      e.target.onerror = null;
    }
    const onRegionChange = (e) => {
      if (e.type === "end") {
        common_vendor.index.__f__("log", "at pages/showMap/showFavoritesMap.vue:887", "🗺️ 地图区域变化结束，当前标记数量:", markers.value.length);
      }
    };
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: mapKey.value,
        b: center.latitude,
        c: center.longitude,
        d: markers.value,
        e: scale.value,
        f: common_vendor.o(onMarkerTap),
        g: common_vendor.o(onRegionChange),
        h: (_a = currentUser.value) == null ? void 0 : _a.avatar
      }, ((_b = currentUser.value) == null ? void 0 : _b.avatar) ? {
        i: currentUser.value.avatar,
        j: common_vendor.o((e) => handleImageError(e, "user"))
      } : {}, {
        k: common_vendor.t(((_c = currentUser.value) == null ? void 0 : _c.nickname) || "用户"),
        l: common_vendor.o(goToUserCenter),
        m: common_vendor.t(favoritesList.value.length),
        n: common_vendor.o(backToCurrentLocation),
        o: common_vendor.o(zoomIn),
        p: common_vendor.o(zoomOut),
        q: sortBy.value === "default" ? 1 : "",
        r: common_vendor.o(($event) => changeSort("default")),
        s: sortBy.value === "rating" ? 1 : "",
        t: common_vendor.o(($event) => changeSort("rating")),
        v: sortBy.value === "sales" ? 1 : "",
        w: common_vendor.o(($event) => changeSort("sales")),
        x: favoritesList.value.length === 0 && !loading.value
      }, favoritesList.value.length === 0 && !loading.value ? {
        y: common_vendor.o(goToShopList)
      } : {}, {
        z: common_vendor.f(sortedFavorites.value, (item, index, i0) => {
          return {
            a: getShopImage(item.shopInfo.shopPic),
            b: common_vendor.o((e) => handleImageError(e, "shop"), item.favoriteId),
            c: common_vendor.t(item.shopInfo.shopName),
            d: common_vendor.t((item.shopInfo.rating / 10).toFixed(1)),
            e: common_vendor.t(formatNumber(item.shopInfo.monthlyOrders || 0)),
            f: common_vendor.t(item.shopInfo.businessHours || "09:00-21:00"),
            g: common_vendor.o(($event) => goToShopDetail(item.shopInfo._id), item.favoriteId),
            h: common_vendor.o(($event) => openShopNavigation(item.shopInfo), item.favoriteId),
            i: common_vendor.o(($event) => cancelFavorite(item), item.favoriteId),
            j: common_vendor.t(item.shopInfo.address),
            k: item.favoriteId,
            l: selectedShopId.value === item.shopInfo._id ? 1 : "",
            m: common_vendor.o(($event) => onShopItemTap(item), item.favoriteId)
          };
        }),
        A: loading.value
      }, loading.value ? {} : {}, {
        B: selectedShop.value
      }, selectedShop.value ? common_vendor.e({
        C: common_vendor.o(closePopup),
        D: getShopImage(selectedShop.value.shopPic),
        E: common_vendor.o((e) => handleImageError(e, "shop")),
        F: common_vendor.t(selectedShop.value.shopName),
        G: common_vendor.f(5, (n, k0, i0) => {
          return {
            a: n,
            b: common_vendor.n(n <= Math.round(selectedShop.value.rating / 2) ? "active" : "")
          };
        }),
        H: common_vendor.t((selectedShop.value.rating / 10).toFixed(1)),
        I: common_vendor.t(selectedShop.value.address),
        J: common_vendor.t(selectedShop.value.businessHours || "09:00-21:00"),
        K: selectedShop.value.phone
      }, selectedShop.value.phone ? {
        L: common_vendor.t(selectedShop.value.phone)
      } : {}, {
        M: selectedShop.value.description
      }, selectedShop.value.description ? {
        N: common_vendor.t(selectedShop.value.description)
      } : {}, {
        O: common_vendor.o(($event) => goToShopDetail(selectedShop.value._id)),
        P: common_vendor.o(openNavigation)
      }) : {}, {
        Q: common_vendor.sr(detailPopup, "a236b636-0", {
          "k": "detailPopup"
        }),
        R: common_vendor.p({
          type: "center",
          ["background-color"]: "transparent"
        }),
        S: common_vendor.o(handleCancelClose),
        T: common_vendor.o(handleCancelConfirm),
        U: common_vendor.p({
          type: "warn",
          title: "取消收藏",
          content: "确定要取消收藏该店铺吗？",
          ["before-close"]: true
        }),
        V: common_vendor.sr(confirmPopup, "a236b636-1", {
          "k": "confirmPopup"
        }),
        W: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a236b636"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/showMap/showFavoritesMap.js.map
