"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "demo1009",
  setup(__props) {
    const startPoint = common_vendor.reactive({
      name: "",
      latitude: 0,
      longitude: 0
    });
    const endPoint = common_vendor.reactive({
      name: "",
      latitude: 0,
      longitude: 0
    });
    const currentLocation = common_vendor.reactive({
      lat: 39.9042,
      // 默认北京坐标
      lng: 116.4074
    });
    const scale = common_vendor.ref(15);
    const markers = common_vendor.ref([]);
    const tipMessage = common_vendor.ref("");
    const tipType = common_vendor.ref("info");
    const showPermissionModal = common_vendor.ref(false);
    const hasLocationPermission = common_vendor.ref(false);
    common_vendor.onLoad(() => {
      checkLocationPermission();
    });
    const checkLocationPermission = () => {
      common_vendor.index.getSetting({
        success: (res) => {
          if (res.authSetting["scope.userLocation"] === true) {
            hasLocationPermission.value = true;
            getCurrentLocation();
          } else if (res.authSetting["scope.userLocation"] === false) {
            hasLocationPermission.value = false;
            showTip("定位权限已被拒绝，请手动授权", "error");
          } else {
            hasLocationPermission.value = false;
          }
        },
        fail: () => {
          hasLocationPermission.value = false;
        }
      });
    };
    const requestLocationPermission = () => {
      if (hasLocationPermission.value) {
        getCurrentLocation();
        return;
      }
      common_vendor.index.authorize({
        scope: "scope.userLocation",
        success: () => {
          hasLocationPermission.value = true;
          getCurrentLocation();
          showTip("定位权限授权成功", "success");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/demo1009/demo1009.vue:147", "授权失败:", err);
          showPermissionModal.value = true;
        }
      });
    };
    const getCurrentLocation = () => {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          currentLocation.lat = res.latitude;
          currentLocation.lng = res.longitude;
          updateMarkers();
          showTip("当前位置获取成功", "success");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/demo1009/demo1009.vue:168", "获取当前位置失败:", err);
          showTip("获取当前位置失败，请检查定位权限或GPS", "error");
        }
      });
    };
    const openSetting = () => {
      common_vendor.index.openSetting({
        success: (res) => {
          if (res.authSetting["scope.userLocation"] === true) {
            hasLocationPermission.value = true;
            getCurrentLocation();
            showTip("定位权限已开启", "success");
          }
          showPermissionModal.value = false;
        },
        fail: () => {
          showPermissionModal.value = false;
          showTip("打开设置失败", "error");
        }
      });
    };
    const closePermissionModal = () => {
      showPermissionModal.value = false;
    };
    const openRoutePlan = () => {
      if (!endPoint.name.trim()) {
        showTip("请输入终点位置", "error");
        return;
      }
      const key = "77NBZ-KM2C7-RY2XI-HOQPY-RJXTT-FKB4V";
      const referer = "demo1009";
      const navigation = 1;
      const endPointData = JSON.stringify({
        name: endPoint.name,
        latitude: endPoint.latitude || currentLocation.lat,
        // 如果没有具体坐标，使用当前位置
        longitude: endPoint.longitude || currentLocation.lng
      });
      let url = `plugin://routePlan/index?key=${key}&referer=${referer}&endPoint=${endPointData}&navigation=${navigation}`;
      if (startPoint.name && startPoint.latitude && startPoint.longitude) {
        const startPointData = JSON.stringify({
          name: startPoint.name,
          latitude: startPoint.latitude,
          longitude: startPoint.longitude
        });
        url += `&startPoint=${startPointData}`;
      }
      common_vendor.index.__f__("log", "at pages/demo1009/demo1009.vue:243", "打开路线规划:", url);
      common_vendor.index.navigateTo({
        url,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/demo1009/demo1009.vue:248", "打开路线规划失败:", err);
          showTip("打开导航失败，请检查插件配置", "error");
        }
      });
    };
    const updateMarkers = () => {
      const newMarkers = [];
      if (startPoint.latitude && startPoint.longitude) {
        newMarkers.push({
          id: 1,
          latitude: startPoint.latitude,
          longitude: startPoint.longitude,
          title: startPoint.name,
          iconPath: "/static/start.png",
          // 起点图标
          width: 25,
          height: 25
        });
      }
      if (endPoint.latitude && endPoint.longitude) {
        newMarkers.push({
          id: 2,
          latitude: endPoint.latitude,
          longitude: endPoint.longitude,
          title: endPoint.name,
          iconPath: "/static/end.png",
          // 终点图标
          width: 25,
          height: 25
        });
      }
      if (newMarkers.length === 0) {
        newMarkers.push({
          id: 0,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          title: "当前位置",
          iconPath: "/static/location.png",
          width: 30,
          height: 30
        });
      }
      markers.value = newMarkers;
    };
    const clearStart = () => {
      startPoint.name = "";
      startPoint.latitude = 0;
      startPoint.longitude = 0;
      updateMarkers();
    };
    const clearEnd = () => {
      endPoint.name = "";
      endPoint.latitude = 0;
      endPoint.longitude = 0;
      updateMarkers();
    };
    const showTip = (message, type = "info") => {
      tipMessage.value = message;
      tipType.value = type;
      setTimeout(() => {
        tipMessage.value = "";
      }, 3e3);
    };
    common_vendor.onUnload(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: startPoint.name,
        b: common_vendor.o(($event) => startPoint.name = $event.detail.value),
        c: startPoint.name
      }, startPoint.name ? {
        d: common_vendor.o(clearStart)
      } : {}, {
        e: common_vendor.o(openRoutePlan),
        f: endPoint.name,
        g: common_vendor.o(($event) => endPoint.name = $event.detail.value),
        h: endPoint.name
      }, endPoint.name ? {
        i: common_vendor.o(clearEnd)
      } : {}, {
        j: common_vendor.o(requestLocationPermission),
        k: common_vendor.o(openRoutePlan),
        l: !endPoint.name,
        m: currentLocation.lat,
        n: currentLocation.lng,
        o: scale.value,
        p: markers.value,
        q: showPermissionModal.value
      }, showPermissionModal.value ? {
        r: common_vendor.o(openSetting),
        s: common_vendor.o(closePermissionModal)
      } : {}, {
        t: tipMessage.value
      }, tipMessage.value ? {
        v: common_vendor.t(tipMessage.value),
        w: common_vendor.n(tipType.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a731a6a2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo1009/demo1009.js.map
