"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "showMap",
  setup(__props) {
    const center = common_vendor.reactive({
      latitude: 25.034161,
      longitude: 118.482187
    });
    const scale = common_vendor.ref(15);
    const markers = common_vendor.ref([]);
    const shops = common_vendor.ref([]);
    const selectedShopId = common_vendor.ref(null);
    const selectedShop = common_vendor.ref(null);
    const detailPopup = common_vendor.ref(null);
    const mapContext = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const sortBy = common_vendor.ref("default");
    const isLoggedIn = common_vendor.ref(false);
    const userId = common_vendor.ref("");
    const currentUser = common_vendor.ref(null);
    const favoriteShops = common_vendor.ref([]);
    const mapKey = common_vendor.ref(Date.now());
    function safeToFixed(value, digits = 1) {
      if (value === null || value === void 0)
        return "0.0";
      const num = parseFloat(value);
      if (isNaN(num))
        return "0.0";
      return num.toFixed(digits);
    }
    function safeFormatNumber(num) {
      if (num === null || num === void 0)
        return "0";
      const number = parseInt(num);
      if (isNaN(number))
        return "0";
      if (number >= 1e4) {
        return (number / 1e4).toFixed(1) + "万";
      }
      return number.toString();
    }
    function getShopRating(shop) {
      const rating = shop.rating || shop.score || shop.star || 0;
      return safeToFixed(rating);
    }
    const sortedShops = common_vendor.computed(() => {
      if (!shops.value.length)
        return [];
      const list = [...shops.value];
      switch (sortBy.value) {
        case "rating":
          return list.sort((a, b) => parseFloat(getShopRating(b)) - parseFloat(getShopRating(a)));
        case "sales":
          return list.sort((a, b) => (parseInt(b.monthlySales) || 0) - (parseInt(a.monthlySales) || 0));
        default:
          return list;
      }
    });
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:366", "🔄 地图页面加载");
      checkLoginStatus();
      loadShopsData();
      mapContext.value = common_vendor.index.createMapContext("shopMap", this);
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:373", "🔄 地图页面显示");
      checkLoginStatus();
    });
    async function checkLoginStatus() {
      try {
        const userInfoFromStorage = common_vendor.index.getStorageSync("uni-id-pages-userInfo");
        const token = common_vendor.index.getStorageSync("uni_id_token");
        if (token && userInfoFromStorage && userInfoFromStorage._id) {
          isLoggedIn.value = true;
          userId.value = userInfoFromStorage._id;
          currentUser.value = userInfoFromStorage;
          await loadFavoriteShops();
        } else {
          isLoggedIn.value = false;
          userId.value = "";
          currentUser.value = null;
          favoriteShops.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:395", "❌ 检查登录状态失败:", error);
        isLoggedIn.value = false;
        userId.value = "";
        currentUser.value = null;
        favoriteShops.value = [];
      }
    }
    async function loadFavoriteShops() {
      if (!isLoggedIn.value)
        return;
      try {
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.getShopFavoritesList({
          page: 1,
          size: 100,
          userId: userId.value
        });
        if (res.errCode === 0) {
          favoriteShops.value = res.data.list || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:419", "❌ 加载收藏店铺失败:", error);
      }
    }
    function isShopFavorite(shopId) {
      return favoriteShops.value.some((item) => item.shopInfo && item.shopInfo._id === shopId);
    }
    async function toggleFavorite(shop) {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录再收藏店铺",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      try {
        const articlesCo = common_vendor.tr.importObject("articlesCloudObj");
        const res = await articlesCo.toggleShopFavorite({
          shopId: shop.id,
          userId: userId.value
        });
        if (res.errCode === 0) {
          await loadFavoriteShops();
          common_vendor.index.showToast({
            title: isShopFavorite(shop.id) ? "已取消收藏" : "收藏成功",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:462", "❌ 切换收藏状态失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    const loadShopsData = async () => {
      try {
        loading.value = true;
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const result = await common_vendor.tr.callFunction({
          name: "getShopList",
          data: {
            keyword: ""
            // 空字符串获取所有店铺
          }
        });
        common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:485", "📊 原始店铺数据:", result.result);
        if (result.result.errCode === 0) {
          shops.value = result.result.data || [];
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:489", "✅ 成功加载店铺数据:", shops.value.length);
          if (shops.value.length > 0) {
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:493", "🔍 第一个店铺的完整数据结构:", JSON.stringify(shops.value[0], null, 2));
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:494", "📝 店铺字段检查:");
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:495", "   - id:", shops.value[0].id);
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:496", "   - name:", shops.value[0].name);
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:497", "   - rating:", shops.value[0].rating, "类型:", typeof shops.value[0].rating);
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:498", "   - monthlySales:", shops.value[0].monthlySales, "类型:", typeof shops.value[0].monthlySales);
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:499", "   - latitude:", shops.value[0].latitude);
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:500", "   - longitude:", shops.value[0].longitude);
            common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:501", "   - address:", shops.value[0].address);
          }
          await initMapMarkers();
        } else {
          throw new Error(result.result.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:509", "❌ 加载店铺数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
        shops.value = [];
      } finally {
        loading.value = false;
        common_vendor.index.hideLoading();
      }
    };
    const initMapMarkers = async () => {
      const validShops = shops.value.filter((shop) => {
        const hasCoords = shop.latitude && shop.longitude && shop.latitude !== 0 && shop.longitude !== 0;
        if (!hasCoords) {
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:528", "❌ 店铺坐标无效:", shop.name, shop.latitude, shop.longitude);
        }
        return hasCoords;
      });
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:533", "🗺️ 有效店铺数量:", validShops.length);
      markers.value = validShops.map((shop) => ({
        id: shop.id,
        latitude: parseFloat(shop.latitude),
        longitude: parseFloat(shop.longitude),
        title: shop.name,
        iconPath: "/static/logo/local.png",
        width: 20,
        height: 20,
        callout: {
          content: `${shop.name}
⭐${getShopRating(shop)} | 月售${safeFormatNumber(shop.monthlySales)}单`,
          color: "#333",
          fontSize: 12,
          borderRadius: 8,
          bgColor: "#fff",
          padding: 8,
          display: "ALWAYS",
          textAlign: "center"
        }
      }));
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:556", "🗺️ 初始化地图标记:", markers.value.length);
      mapKey.value = Date.now();
    };
    const onMarkerTap = (e) => {
      const markerId = e.detail.markerId;
      const shop = shops.value.find((s) => s.id === markerId);
      if (shop) {
        selectedShopId.value = markerId;
        showShopDetail(shop);
      }
    };
    const onShopItemTap = (shop) => {
      selectedShopId.value = shop.id;
      selectedShop.value = shop;
      focusOnShopLocation(shop);
      showShopDetail(shop);
    };
    const focusOnShopLocation = (shop = null) => {
      const targetShop = shop || selectedShop.value;
      if (!targetShop || !targetShop.latitude || !targetShop.longitude)
        return;
      center.latitude = parseFloat(targetShop.latitude);
      center.longitude = parseFloat(targetShop.longitude);
      scale.value = 18;
    };
    const showShopDetail = (shop) => {
      selectedShop.value = shop;
      detailPopup.value.open();
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
      if (!selectedShop.value || !selectedShop.value.latitude) {
        common_vendor.index.showToast({
          title: "无法获取店铺位置",
          icon: "none"
        });
        return;
      }
      common_vendor.index.openLocation({
        latitude: parseFloat(selectedShop.value.latitude),
        longitude: parseFloat(selectedShop.value.longitude),
        name: selectedShop.value.name,
        address: selectedShop.value.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:640", "打开地图成功");
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:643", "打开地图失败:", error);
          common_vendor.index.showToast({
            title: "打开地图失败",
            icon: "none"
          });
        }
      });
    };
    const openShopNavigation = (shop) => {
      if (!shop || !shop.latitude) {
        common_vendor.index.showToast({
          title: "无法获取店铺位置",
          icon: "none"
        });
        return;
      }
      common_vendor.index.openLocation({
        latitude: parseFloat(shop.latitude),
        longitude: parseFloat(shop.longitude),
        name: shop.name,
        address: shop.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:668", "打开地图成功");
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:671", "打开地图失败:", error);
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
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:692", "🔄 跳转到店铺详情:", { shopId, url });
      closePopup();
      common_vendor.index.navigateTo({
        url,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:699", "✅ 跳转到店铺详情页成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:702", "❌ 跳转失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败，请重试",
            icon: "none"
          });
        }
      });
    };
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
    function handleImageError(e, type = "shop") {
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:736", "🖼️ 图片加载失败:", e, "类型:", type);
      const defaultImages = {
        shop: "/static/default-shop.jpg",
        user: "/static/default-avatar.png"
      };
      if (e.target) {
        e.target.src = defaultImages[type] || defaultImages.shop;
        e.target.onerror = null;
      }
    }
    const onRegionChange = (e) => {
      if (e.type === "end") {
        common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:754", "🗺️ 地图区域变化结束，当前标记数量:", markers.value.length);
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
        m: common_vendor.t(shops.value.length),
        n: common_vendor.o(backToCurrentLocation),
        o: common_vendor.o(zoomIn),
        p: common_vendor.o(zoomOut),
        q: sortBy.value === "default" ? 1 : "",
        r: common_vendor.o(($event) => changeSort("default")),
        s: sortBy.value === "rating" ? 1 : "",
        t: common_vendor.o(($event) => changeSort("rating")),
        v: sortBy.value === "sales" ? 1 : "",
        w: common_vendor.o(($event) => changeSort("sales")),
        x: shops.value.length === 0 && !loading.value
      }, shops.value.length === 0 && !loading.value ? {
        y: common_vendor.o(loadShopsData)
      } : {}, {
        z: common_vendor.f(sortedShops.value, (shop, index, i0) => {
          return {
            a: getShopImage(shop.shopPic || shop.image),
            b: common_vendor.o((e) => handleImageError(e, "shop"), shop.id),
            c: common_vendor.t(shop.name),
            d: common_vendor.t(getShopRating(shop)),
            e: common_vendor.t(shop.address),
            f: common_vendor.t(safeFormatNumber(shop.monthlySales)),
            g: common_vendor.t(shop.businessHours || "09:00-21:00"),
            h: common_vendor.o(($event) => goToShopDetail(shop.id), shop.id),
            i: common_vendor.o(($event) => openShopNavigation(shop), shop.id),
            j: common_vendor.t(isShopFavorite(shop.id) ? "❤️" : "🤍"),
            k: common_vendor.o(($event) => toggleFavorite(shop), shop.id),
            l: shop.id,
            m: selectedShopId.value === shop.id ? 1 : "",
            n: common_vendor.o(($event) => onShopItemTap(shop), shop.id)
          };
        }),
        A: loading.value
      }, loading.value ? {} : {}, {
        B: selectedShop.value
      }, selectedShop.value ? common_vendor.e({
        C: common_vendor.o(closePopup),
        D: getShopImage(selectedShop.value.shopPic || selectedShop.value.image),
        E: common_vendor.o((e) => handleImageError(e, "shop")),
        F: common_vendor.t(selectedShop.value.name),
        G: common_vendor.f(5, (n, k0, i0) => {
          return {
            a: n,
            b: common_vendor.n(n <= Math.round(parseFloat(getShopRating(selectedShop.value))) ? "active" : "")
          };
        }),
        H: common_vendor.t(getShopRating(selectedShop.value)),
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
        O: common_vendor.o(($event) => goToShopDetail(selectedShop.value.id)),
        P: common_vendor.o(openNavigation)
      }) : {}, {
        Q: common_vendor.sr(detailPopup, "001d706d-0", {
          "k": "detailPopup"
        }),
        R: common_vendor.p({
          type: "center",
          ["background-color"]: "transparent"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-001d706d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/showMap/showMap.js.map
