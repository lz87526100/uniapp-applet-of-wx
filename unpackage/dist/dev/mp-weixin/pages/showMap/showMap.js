"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_load_more2 + _easycom_uni_popup2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_popup)();
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
    common_vendor.onLoad(() => {
      loadShopsData();
      mapContext.value = common_vendor.index.createMapContext("shopMap", this);
    });
    const goToShopDetail = () => {
      if (!selectedShop.value || !selectedShop.value.id) {
        common_vendor.index.showToast({
          title: "店铺信息不完整",
          icon: "none"
        });
        return;
      }
      const url = `/pages/shopList/shopDetail?id=${selectedShop.value.id}`;
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:179", "🔄 跳转到店铺详情:", {
        shopId: selectedShop.value.id,
        url
      });
      closePopup();
      common_vendor.index.navigateTo({
        url,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:191", "✅ 跳转到店铺详情页成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:194", "❌ 跳转失败:", err);
          common_vendor.index.showToast({
            title: "跳转失败，请重试",
            icon: "none"
          });
        }
      });
    };
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
        if (result.result.errCode === 0) {
          shops.value = result.result.data;
          initMapMarkers();
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:221", "✅ 成功加载店铺数据:", shops.value.length);
        } else {
          throw new Error(result.result.errMsg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:226", "❌ 加载店铺数据失败:", error);
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
    const initMapMarkers = () => {
      const validShops = shops.value.filter((shop) => shop.latitude && shop.longitude && shop.latitude !== 0 && shop.longitude !== 0);
      markers.value = validShops.map((shop) => ({
        id: shop.id,
        latitude: shop.latitude,
        longitude: shop.longitude,
        title: shop.name,
        iconPath: "/static/logo/local.png",
        // 小红点图标
        width: 20,
        height: 20,
        callout: {
          content: `${shop.name}
⭐${shop.rating} | 月售${shop.monthlySales}单`,
          color: "#333",
          fontSize: 12,
          borderRadius: 8,
          bgColor: "#fff",
          padding: 8,
          display: "ALWAYS",
          textAlign: "center"
        }
      }));
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:264", "🗺️ 初始化地图标记:", markers.value.length);
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
      center.latitude = targetShop.latitude;
      center.longitude = targetShop.longitude;
      scale.value = 18;
      setTimeout(() => {
        if (mapContext.value) {
          const markerIndex = markers.value.findIndex((m) => m.id === targetShop.id);
          if (markerIndex !== -1) {
            markers.value[markerIndex].iconPath = "/static/logo/local-active.png";
            markers.value = [...markers.value];
          }
        }
      }, 300);
    };
    const showShopDetail = (shop) => {
      selectedShop.value = shop;
      detailPopup.value.open();
    };
    const closePopup = () => {
      detailPopup.value.close();
      markers.value = markers.value.map((marker) => ({
        ...marker,
        iconPath: "/static/logo/local.png"
      }));
    };
    const backToCurrentLocation = () => {
      center.latitude = 25.034161;
      center.longitude = 118.482187;
      scale.value = 15;
      selectedShopId.value = null;
      markers.value = markers.value.map((marker) => ({
        ...marker,
        iconPath: "/static/logo/local.png"
      }));
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
        latitude: selectedShop.value.latitude,
        longitude: selectedShop.value.longitude,
        name: selectedShop.value.name,
        address: selectedShop.value.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:347", "打开地图成功");
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/showMap/showMap.vue:350", "打开地图失败:", error);
          common_vendor.index.showToast({
            title: "打开地图失败",
            icon: "none"
          });
        }
      });
    };
    const onRegionChange = (e) => {
      common_vendor.index.__f__("log", "at pages/showMap/showMap.vue:384", "地图区域变化:", e);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: center.latitude,
        b: center.longitude,
        c: markers.value,
        d: scale.value,
        e: common_vendor.o(onMarkerTap),
        f: common_vendor.o(onRegionChange),
        g: common_vendor.o(backToCurrentLocation),
        h: common_vendor.f(shops.value, (shop, k0, i0) => {
          return {
            a: common_vendor.t(shop.name),
            b: common_vendor.t(shop.rating),
            c: common_vendor.t(shop.address),
            d: common_vendor.t(shop.monthlySales),
            e: common_vendor.t(shop.businessHours),
            f: shop.id,
            g: selectedShopId.value === shop.id ? 1 : "",
            h: common_vendor.o(($event) => onShopItemTap(shop), shop.id)
          };
        }),
        i: shops.value.length === 0 && !loading.value
      }, shops.value.length === 0 && !loading.value ? {
        j: common_vendor.o(loadShopsData)
      } : {}, {
        k: loading.value
      }, loading.value ? {
        l: common_vendor.p({
          status: "loading",
          content: "正在加载..."
        })
      } : {}, {
        m: selectedShop.value
      }, selectedShop.value ? common_vendor.e({
        n: common_vendor.o(closePopup),
        o: common_vendor.t(selectedShop.value.name),
        p: common_vendor.f(5, (n, k0, i0) => {
          return {
            a: n,
            b: common_vendor.n(n <= Math.round(selectedShop.value.rating) ? "active" : "")
          };
        }),
        q: common_vendor.t(selectedShop.value.rating),
        r: common_vendor.t(selectedShop.value.monthlySales),
        s: common_vendor.t(selectedShop.value.address),
        t: common_vendor.t(selectedShop.value.businessHours),
        v: selectedShop.value.description
      }, selectedShop.value.description ? {
        w: common_vendor.t(selectedShop.value.description)
      } : {}, {
        x: common_vendor.o(goToShopDetail),
        y: common_vendor.o(openNavigation)
      }) : {}, {
        z: common_vendor.sr(detailPopup, "001d706d-1", {
          "k": "detailPopup"
        }),
        A: common_vendor.p({
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
