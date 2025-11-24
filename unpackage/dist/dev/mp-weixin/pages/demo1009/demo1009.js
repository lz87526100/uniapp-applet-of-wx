"use strict";
const common_vendor = require("../../common/vendor.js");
const AMAP_WEB_KEY = "becc8508eddef29e75d2b60ec9690cdd";
const _sfc_main = {
  name: "UniversalNavigation",
  data() {
    return {
      // 地图相关 - 微信小程序使用
      latitude: 39.90923,
      longitude: 116.397428,
      scale: 13,
      markers: [],
      polyline: [],
      // H5地图实例
      map: null,
      // 位置信息
      startPoint: "我的位置",
      endPoint: "",
      routeType: "drive",
      // 路线信息
      currentRoute: null,
      loading: false,
      // 当前位置
      currentLocation: null
    };
  },
  computed: {
    canNavigate() {
      return this.startPoint && this.endPoint;
    }
  },
  onLoad() {
    this.initMap();
  },
  methods: {
    // 初始化地图 - 多平台兼容
    initMap() {
      this.getCurrentLocation();
    },
    // H5地图初始化
    initH5Map() {
      if (typeof window !== "undefined" && !window.AMap) {
        const script = document.createElement("script");
        script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${AMAP_WEB_KEY}`;
        script.onload = () => {
          setTimeout(() => {
            this.createH5Map();
          }, 500);
        };
        document.head.appendChild(script);
      } else {
        this.createH5Map();
      }
    },
    // 创建H5地图
    createH5Map() {
      try {
        this.map = new AMap.Map("map", {
          zoom: 13,
          center: [116.397428, 39.90923],
          viewMode: "2D"
        });
        this.getCurrentLocation();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demo1009/demo1009.vue:202", "H5地图初始化失败:", error);
      }
    },
    // 获取当前位置 - 多平台兼容
    getCurrentLocation() {
      common_vendor.index.getLocation({
        type: "gcj02",
        // 高德坐标系
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          this.addWeixinMarker(res.latitude, res.longitude, "我的位置", 0);
          this.getAddressName(res.longitude, res.latitude);
        },
        fail: (err) => {
          common_vendor.index.__f__("warn", "at pages/demo1009/demo1009.vue:234", "获取位置失败:", err);
          common_vendor.index.showToast({
            title: "获取位置失败，请手动输入起点",
            icon: "none"
          });
        }
      });
    },
    // 微信小程序添加标记
    addWeixinMarker(lat, lng, title, id) {
      this.markers.push({
        id,
        latitude: lat,
        longitude: lng,
        title
        // iconPath: '/static/location.png' // 需要准备图标
      });
    },
    // H5添加标记
    addH5Marker(lng, lat, title) {
      if (!this.map)
        return;
      try {
        const marker = new AMap.Marker({
          position: [lng, lat],
          title
        });
        this.map.add(marker);
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/demo1009/demo1009.vue:265", "H5添加标记失败:", error);
      }
    },
    // 获取地址名称
    async getAddressName(lng, lat) {
      try {
        const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_WEB_KEY}&location=${lng},${lat}&output=JSON`;
        const response = await common_vendor.index.request({ url });
        const data = response[1].data;
        if (data.status === "1" && data.regeocode) {
          this.startPoint = data.regeocode.formatted_address;
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/demo1009/demo1009.vue:280", "获取地址失败:", error);
      }
    },
    // 使用当前位置
    useCurrentLocation() {
      if (this.currentLocation) {
        this.getAddressName(this.currentLocation.longitude, this.currentLocation.latitude);
      }
    },
    // 清除终点
    clearEndPoint() {
      this.endPoint = "";
    },
    // 设置路线类型
    setRouteType(type) {
      this.routeType = type;
    },
    // 输入框焦点事件
    onStartFocus() {
    },
    onEndFocus() {
    },
    // 路线规划 - 多平台通用
    async planRoute() {
      if (!this.canNavigate) {
        common_vendor.index.showToast({
          title: "请输入起点和终点",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const routeData = await this.getRouteData();
        if (routeData) {
          this.currentRoute = this.formatRouteData(routeData);
          this.drawRoute(routeData);
          common_vendor.index.showToast({
            title: "路线规划成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: "路线规划失败，请检查地址",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demo1009/demo1009.vue:339", "路线规划错误:", error);
        common_vendor.index.showToast({
          title: "路线规划失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 获取路线数据
    async getRouteData() {
      const strategy = this.getRouteStrategy();
      const url = `https://restapi.amap.com/v3/direction/driving?key=${AMAP_WEB_KEY}&origin=${encodeURIComponent(this.startPoint)}&destination=${encodeURIComponent(this.endPoint)}&strategy=${strategy}&output=JSON`;
      try {
        const response = await common_vendor.index.request({ url });
        const data = response[1].data;
        if (data.status === "1" && data.route && data.route.paths && data.route.paths.length > 0) {
          return data.route.paths[0];
        }
        return null;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demo1009/demo1009.vue:363", "获取路线数据失败:", error);
        return null;
      }
    },
    // 获取路线策略
    getRouteStrategy() {
      switch (this.routeType) {
        case "drive":
          return "0";
        case "bus":
          return "6";
        case "walk":
          return "2";
        default:
          return "0";
      }
    },
    // 格式化路线数据
    formatRouteData(route) {
      const steps = (route.steps || []).map((step) => ({
        instruction: step.instruction.replace(/<[^>]*>/g, ""),
        distance: (step.distance / 1e3).toFixed(1) + "公里",
        icon: this.getStepIcon(step.instruction)
      }));
      return {
        distance: (route.distance / 1e3).toFixed(1) + "公里",
        duration: this.formatDuration(route.duration),
        steps
      };
    },
    // 获取步骤图标
    getStepIcon(instruction) {
      const inst = instruction.toLowerCase();
      if (inst.includes("左转"))
        return "↰";
      if (inst.includes("右转"))
        return "↱";
      if (inst.includes("直行"))
        return "↑";
      if (inst.includes("到达"))
        return "🏁";
      if (inst.includes("出发"))
        return "🚩";
      return "•";
    },
    // 格式化时长
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    },
    // 绘制路线 - 多平台兼容
    drawRoute(route) {
      if (!route.steps)
        return;
      this.drawWeixinRoute(route);
    },
    // 微信小程序绘制路线
    drawWeixinRoute(route) {
      this.markers = [];
      this.polyline = [];
      if (route.steps[0]) {
        const startLoc = route.steps[0].start_location.split(",");
        this.addWeixinMarker(parseFloat(startLoc[1]), parseFloat(startLoc[0]), "起点", 1);
      }
      if (route.steps[route.steps.length - 1]) {
        const endLoc = route.steps[route.steps.length - 1].end_location.split(",");
        this.addWeixinMarker(parseFloat(endLoc[1]), parseFloat(endLoc[0]), "终点", 2);
      }
      const points = [];
      route.steps.forEach((step) => {
        if (step.polyline) {
          const stepPoints = step.polyline.split(";");
          stepPoints.forEach((point) => {
            const [lng, lat] = point.split(",");
            points.push({
              latitude: parseFloat(lat),
              longitude: parseFloat(lng)
            });
          });
        }
      });
      if (points.length > 0) {
        this.polyline = [{
          points,
          color: "#1E90FF",
          width: 6,
          dottedLine: false
        }];
      }
    },
    // H5绘制路线
    drawH5Route(route) {
      if (!this.map || !route.steps)
        return;
      try {
        this.map.clearMap();
        if (route.steps[0]) {
          const startLoc = route.steps[0].start_location.split(",");
          this.addH5Marker(parseFloat(startLoc[0]), parseFloat(startLoc[1]), "起点");
        }
        if (route.steps[route.steps.length - 1]) {
          const endLoc = route.steps[route.steps.length - 1].end_location.split(",");
          this.addH5Marker(parseFloat(endLoc[0]), parseFloat(endLoc[1]), "终点");
        }
        const path = [];
        route.steps.forEach((step) => {
          if (step.polyline) {
            const points = step.polyline.split(";");
            points.forEach((point) => {
              const [lng, lat] = point.split(",");
              path.push([parseFloat(lng), parseFloat(lat)]);
            });
          }
        });
        if (path.length > 0) {
          const polyline = new AMap.Polyline({
            path,
            strokeColor: "#1E90FF",
            strokeWeight: 6,
            strokeOpacity: 0.8
          });
          this.map.add(polyline);
          this.map.setFitView();
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/demo1009/demo1009.vue:513", "H5绘制路线失败:", error);
      }
    },
    // 打开外部导航
    openExternalNavigation() {
      if (!this.canNavigate) {
        common_vendor.index.showToast({
          title: "请输入起点和终点",
          icon: "none"
        });
        return;
      }
      const url = `https://uri.amap.com/navigation?from=${encodeURIComponent(this.startPoint)}&to=${encodeURIComponent(this.endPoint)}&mode=car&callnative=1`;
      common_vendor.index.setClipboardData({
        data: url,
        success: () => {
          common_vendor.index.showToast({
            title: "导航链接已复制，请粘贴到浏览器打开",
            icon: "success"
          });
        }
      });
    },
    // 返回
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.latitude,
    b: $data.longitude,
    c: $data.scale,
    d: $data.markers,
    e: $data.polyline,
    f: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    g: common_vendor.o((...args) => $options.onStartFocus && $options.onStartFocus(...args)),
    h: $data.startPoint,
    i: common_vendor.o(($event) => $data.startPoint = $event.detail.value),
    j: common_vendor.o((...args) => $options.useCurrentLocation && $options.useCurrentLocation(...args)),
    k: common_vendor.o((...args) => $options.onEndFocus && $options.onEndFocus(...args)),
    l: $data.endPoint,
    m: common_vendor.o(($event) => $data.endPoint = $event.detail.value),
    n: common_vendor.o((...args) => $options.clearEndPoint && $options.clearEndPoint(...args)),
    o: $data.routeType === "drive" ? 1 : "",
    p: common_vendor.o(($event) => $options.setRouteType("drive")),
    q: $data.routeType === "bus" ? 1 : "",
    r: common_vendor.o(($event) => $options.setRouteType("bus")),
    s: $data.routeType === "walk" ? 1 : "",
    t: common_vendor.o(($event) => $options.setRouteType("walk")),
    v: common_vendor.o((...args) => $options.openExternalNavigation && $options.openExternalNavigation(...args)),
    w: !$options.canNavigate,
    x: common_vendor.t($data.loading ? "规划中..." : "路线规划"),
    y: common_vendor.o((...args) => $options.planRoute && $options.planRoute(...args)),
    z: !$options.canNavigate || $data.loading,
    A: $data.currentRoute
  }, $data.currentRoute ? {
    B: common_vendor.t($data.currentRoute.distance),
    C: common_vendor.t($data.currentRoute.duration),
    D: common_vendor.f($data.currentRoute.steps, (step, index, i0) => {
      return {
        a: common_vendor.t(step.icon),
        b: common_vendor.t(step.instruction),
        c: common_vendor.t(step.distance),
        d: index
      };
    })
  } : {}, {
    E: $data.loading
  }, $data.loading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a731a6a2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demo1009/demo1009.js.map
