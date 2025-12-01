"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "choseEdit",
  setup(__props) {
    const currentAddress = common_vendor.ref("");
    const locationLoading = common_vendor.ref(false);
    const locationType = common_vendor.ref("");
    const shopsList = common_vendor.ref([]);
    const shopsLoading = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const isSearching = common_vendor.ref(false);
    const isSearchFocus = common_vendor.ref(false);
    const searchTimer = common_vendor.ref(null);
    const showCityPicker = common_vendor.ref(false);
    const selectedCity = common_vendor.ref({ code: "", name: "" });
    const cityPopup = common_vendor.ref(null);
    const hotCities = common_vendor.ref([
      { code: "110100", name: "北京市" },
      { code: "310100", name: "上海市" },
      { code: "440100", name: "广州市" },
      { code: "440300", name: "深圳市" },
      { code: "350200", name: "厦门市" },
      { code: "350500", name: "泉州市" },
      { code: "330100", name: "杭州市" },
      { code: "320100", name: "南京市" }
    ]);
    common_vendor.onLoad(() => {
      loadRandomShops();
    });
    function openCityPicker() {
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:237", "打开城市选择器");
      if (cityPopup.value) {
        cityPopup.value.open();
      } else {
        showCityPicker.value = true;
      }
    }
    function closeCityPicker() {
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:248", "关闭城市选择器");
      if (cityPopup.value) {
        cityPopup.value.close();
      }
      showCityPicker.value = false;
    }
    function selectCurrentCity() {
      selectedCity.value = { code: "350500", name: "泉州市" };
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:258", "选择当前城市:", selectedCity.value);
    }
    function selectCity(city) {
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:263", "选择城市:", city);
      selectedCity.value = city;
    }
    function confirmCitySelection() {
      if (!selectedCity.value.code) {
        common_vendor.index.showToast({
          title: "请选择一个城市",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:280", "确认选择城市:", selectedCity.value);
      currentAddress.value = selectedCity.value.name;
      locationType.value = "手动选择";
      closeCityPicker();
      loadRandomShops();
      common_vendor.index.showToast({
        title: `已切换到${selectedCity.value.name}`,
        icon: "success",
        duration: 1500
      });
    }
    async function loadRandomShops() {
      var _a;
      shopsLoading.value = true;
      try {
        const result = await common_vendor.tr.callFunction({
          name: "shopCloudObj",
          data: {
            action: "getAllShops",
            data: {
              limit: 3,
              random: true
            }
          }
        });
        common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:314", "随机店铺结果:", result);
        if (result.result && result.result.errCode === 0) {
          const allShops = result.result.data || [];
          shopsList.value = allShops.slice(0, 3);
          common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:319", "获取到随机店铺数量:", shopsList.value.length);
          isSearching.value = false;
        } else {
          common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:322", "获取随机店铺失败:", (_a = result.result) == null ? void 0 : _a.errMsg);
          shopsList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:326", "获取随机店铺异常:", error);
        shopsList.value = [];
      } finally {
        shopsLoading.value = false;
      }
    }
    async function getCurrentLocation() {
      locationLoading.value = true;
      try {
        const locationResult = await common_vendor.index.getLocation({
          type: "gcj02",
          isHighAccuracy: true
        });
        common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:343", "获取到位置:", locationResult);
        const { latitude, longitude } = locationResult;
        currentAddress.value = `泉州市南安市（${latitude.toFixed(4)}, ${longitude.toFixed(4)}）`;
        locationType.value = "自动定位";
        await loadNearbyShops(latitude, longitude);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:353", "获取位置失败:", error);
        handleLocationError(error);
      } finally {
        locationLoading.value = false;
      }
    }
    async function loadNearbyShops(latitude, longitude) {
      var _a;
      shopsLoading.value = true;
      isSearching.value = false;
      try {
        const result = await common_vendor.tr.callFunction({
          name: "shopCloudObj",
          data: {
            action: "getNearbyShops",
            data: {
              latitude,
              longitude,
              keyword: searchKeyword.value,
              maxDistance: 50
            }
          }
        });
        common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:379", "附近店铺结果:", result);
        if (result.result && result.result.errCode === 0) {
          shopsList.value = result.result.data || [];
          common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:383", "获取到附近店铺数量:", shopsList.value.length);
        } else {
          common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:385", "获取附近店铺失败:", (_a = result.result) == null ? void 0 : _a.errMsg);
          shopsList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:389", "获取附近店铺异常:", error);
        shopsList.value = [];
      } finally {
        shopsLoading.value = false;
      }
    }
    async function searchShops() {
      var _a;
      if (!searchKeyword.value.trim()) {
        loadRandomShops();
        return;
      }
      shopsLoading.value = true;
      isSearching.value = true;
      try {
        const result = await common_vendor.tr.callFunction({
          name: "shopCloudObj",
          data: {
            action: "getAllShops",
            data: {
              keyword: searchKeyword.value
            }
          }
        });
        common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:417", "搜索店铺结果:", result);
        if (result.result && result.result.errCode === 0) {
          shopsList.value = result.result.data || [];
          common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:421", "搜索到店铺数量:", shopsList.value.length);
        } else {
          common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:423", "搜索店铺失败:", (_a = result.result) == null ? void 0 : _a.errMsg);
          shopsList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:427", "搜索店铺异常:", error);
        shopsList.value = [];
      } finally {
        shopsLoading.value = false;
      }
    }
    function focusSearch() {
      isSearchFocus.value = true;
      if (!isSearching.value) {
        shopsList.value = [];
      }
    }
    function onSearchInput() {
      if (searchTimer.value) {
        clearTimeout(searchTimer.value);
      }
      searchTimer.value = setTimeout(() => {
        if (searchKeyword.value.trim()) {
          searchShops();
        } else {
          loadRandomShops();
        }
      }, 500);
    }
    function clearSearch() {
      searchKeyword.value = "";
      isSearchFocus.value = false;
      isSearching.value = false;
      if (searchTimer.value) {
        clearTimeout(searchTimer.value);
        searchTimer.value = null;
      }
      loadRandomShops();
    }
    function handleLocationError(error) {
      common_vendor.index.__f__("error", "at pages/blog/choseEdit.vue:473", "定位错误详情:", error);
      if (error.errMsg.includes("auth deny") || error.errMsg.includes("permission")) {
        common_vendor.index.showModal({
          title: "定位权限提示",
          content: "需要获取您的位置信息来推荐附近店铺",
          confirmText: "手动选择",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              openCityPicker();
            } else {
              loadRandomShops();
            }
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "定位失败，显示推荐店铺",
          icon: "none",
          duration: 2e3
        });
        loadRandomShops();
      }
    }
    function selectShop(shop) {
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:501", "选择店铺:", shop);
      common_vendor.index.navigateTo({
        url: `/pages/blog/edit?shopId=${shop._id}&shopName=${encodeURIComponent(shop.shopName)}`,
        success: () => {
          common_vendor.index.$emit("shopSelected", shop);
        }
      });
    }
    function handleShopAvatarError(event) {
      common_vendor.index.__f__("log", "at pages/blog/choseEdit.vue:518", "商家头像加载失败:", event);
      event.target.src = "/static/default-shop.jpg";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "location-filled",
          size: "20",
          color: "#4F8BFF"
        }),
        b: common_vendor.t(locationLoading.value ? "定位中..." : "刷新定位"),
        c: common_vendor.o(getCurrentLocation),
        d: common_vendor.o(openCityPicker),
        e: common_vendor.t(currentAddress.value || "正在获取位置..."),
        f: locationType.value
      }, locationType.value ? {
        g: common_vendor.t(locationType.value)
      } : {}, {
        h: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        i: common_vendor.o(closeCityPicker),
        j: common_vendor.f(hotCities.value, (city, k0, i0) => {
          return {
            a: common_vendor.t(city.name),
            b: city.code,
            c: selectedCity.value.code === city.code ? 1 : "",
            d: common_vendor.o(($event) => selectCity(city), city.code)
          };
        }),
        k: currentAddress.value && currentAddress.value.includes("泉州")
      }, currentAddress.value && currentAddress.value.includes("泉州") ? {
        l: common_vendor.o(selectCurrentCity),
        m: common_vendor.o(($event) => selectCity({
          code: "350581",
          name: "石狮市"
        })),
        n: common_vendor.o(($event) => selectCity({
          code: "350582",
          name: "晋江市"
        }))
      } : {}, {
        o: common_vendor.o(confirmCitySelection),
        p: common_vendor.sr(cityPopup, "c8c4708b-1", {
          "k": "cityPopup"
        }),
        q: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        r: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        s: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, onSearchInput]),
        t: isSearchFocus.value,
        v: common_vendor.o(($event) => isSearchFocus.value = false),
        w: searchKeyword.value,
        x: searchKeyword.value
      }, searchKeyword.value ? {
        y: common_vendor.p({
          type: "clear",
          size: "16",
          color: "#999"
        }),
        z: common_vendor.o(clearSearch)
      } : {}, {
        A: common_vendor.o(focusSearch),
        B: common_vendor.t(isSearching.value ? "搜索结果" : "推荐店铺"),
        C: selectedCity.value.name && !isSearching.value
      }, selectedCity.value.name && !isSearching.value ? {
        D: common_vendor.t(selectedCity.value.name)
      } : {}, {
        E: isSearching.value && shopsList.value.length > 0
      }, isSearching.value && shopsList.value.length > 0 ? {
        F: common_vendor.t(shopsList.value.length)
      } : {}, {
        G: shopsLoading.value
      }, shopsLoading.value ? {
        H: common_vendor.f(3, (i, k0, i0) => {
          return {
            a: i
          };
        })
      } : shopsList.value.length === 0 ? common_vendor.e({
        J: isSearching.value
      }, isSearching.value ? {} : {}, {
        K: common_vendor.o(openCityPicker)
      }) : {
        L: common_vendor.f(shopsList.value, (shop, k0, i0) => {
          return common_vendor.e({
            a: shop.shopPic || "/static/default-shop.jpg",
            b: common_vendor.o(handleShopAvatarError, shop._id),
            c: common_vendor.t(shop.shopName),
            d: common_vendor.t(shop.address || "暂无地址信息"),
            e: shop.rating > 0
          }, shop.rating > 0 ? {
            f: common_vendor.t((shop.rating / 10).toFixed(1))
          } : {}, {
            g: shop.distance && !isSearching.value
          }, shop.distance && !isSearching.value ? {
            h: common_vendor.t(shop.distance)
          } : {}, {
            i: "c8c4708b-5-" + i0,
            j: shop._id,
            k: common_vendor.o(($event) => selectShop(shop), shop._id)
          });
        }),
        M: common_vendor.p({
          type: "right",
          size: "18",
          color: "#ccc"
        })
      }, {
        I: shopsList.value.length === 0
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c8c4708b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/blog/choseEdit.js.map
