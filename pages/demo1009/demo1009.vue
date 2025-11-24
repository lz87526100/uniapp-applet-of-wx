<template>
  <view class="container">
    <!-- 地图组件 - 使用条件编译 -->
    <!-- #ifdef MP-WEIXIN -->
    <map 
      id="map"
      :latitude="latitude"
      :longitude="longitude"
      :scale="scale"
      :markers="markers"
      :polyline="polyline"
      :show-location="true"
      class="map-container"
    ></map>
    <!-- #endif -->
    
    <!-- #ifdef H5 -->
    <view class="map-container" id="map"></view>
    <!-- #endif -->
    
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">←</view>
      <text class="title">地图导航</text>
    </view>
    
    <!-- 位置输入区域 -->
    <view class="location-info">
      <view class="location-item">
        <view class="location-icon start-icon">A</view>
        <input 
          type="text" 
          class="location-input" 
          v-model="startPoint" 
          placeholder="请输入起点位置"
          @focus="onStartFocus"
        />
        <view class="locate-btn" @click="useCurrentLocation">📍</view>
      </view>
      <view class="location-item">
        <view class="location-icon end-icon">B</view>
        <input 
          type="text" 
          class="location-input" 
          v-model="endPoint" 
          placeholder="请输入终点位置"
          @focus="onEndFocus"
        />
        <view class="clear-btn" @click="clearEndPoint">×</view>
      </view>
    </view>
    
    <!-- 路线类型选择 -->
    <view class="route-type-selector">
      <view 
        class="route-type-btn" 
        :class="{ active: routeType === 'drive' }"
        @click="setRouteType('drive')"
      >
        <text class="btn-icon">🚗</text>
        <text class="btn-text">驾车</text>
      </view>
      <view 
        class="route-type-btn" 
        :class="{ active: routeType === 'bus' }"
        @click="setRouteType('bus')"
      >
        <text class="btn-icon">🚌</text>
        <text class="btn-text">公交</text>
      </view>
      <view 
        class="route-type-btn" 
        :class="{ active: routeType === 'walk' }"
        @click="setRouteType('walk')"
      >
        <text class="btn-icon">🚶</text>
        <text class="btn-text">步行</text>
      </view>
    </view>
    
    <!-- 导航按钮 -->
    <view class="nav-buttons">
      <button class="nav-btn primary-btn" @click="openExternalNavigation" :disabled="!canNavigate">
        <text>打开导航</text>
      </button>
      <button class="nav-btn secondary-btn" @click="planRoute" :disabled="!canNavigate || loading">
        <text>{{ loading ? '规划中...' : '路线规划' }}</text>
      </button>
    </view>
    
    <!-- 路线信息 -->
    <view class="route-info" v-if="currentRoute">
      <view class="route-header">
        <text class="route-title">路线详情</text>
        <text class="route-summary">{{ currentRoute.distance }} · {{ currentRoute.duration }}</text>
      </view>
      <scroll-view class="route-steps" scroll-y>
        <view 
          class="route-step" 
          v-for="(step, index) in currentRoute.steps" 
          :key="index"
        >
          <view class="step-icon">{{ step.icon }}</view>
          <view class="step-content">
            <text class="step-instruction">{{ step.instruction }}</text>
            <text class="step-distance">{{ step.distance }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading-mask" v-if="loading">
      <view class="loading">
        <view class="loading-spinner"></view>
        <text>正在规划路线...</text>
      </view>
    </view>
  </view>
</template>

<script>
// 高德地图Web服务Key
const AMAP_WEB_KEY = 'becc8508eddef29e75d2b60ec9690cdd';

export default {
  name: 'UniversalNavigation',
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
      startPoint: '我的位置',
      endPoint: '',
      routeType: 'drive',
      
      // 路线信息
      currentRoute: null,
      loading: false,
      
      // 当前位置
      currentLocation: null
    }
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
      // #ifdef MP-WEIXIN
      this.getCurrentLocation();
      // #endif
      
      // #ifdef H5
      this.initH5Map();
      // #endif
    },
    
    // H5地图初始化
    initH5Map() {
      // 动态加载高德地图
      if (typeof window !== 'undefined' && !window.AMap) {
        const script = document.createElement('script');
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
        this.map = new AMap.Map('map', {
          zoom: 13,
          center: [116.397428, 39.90923],
          viewMode: '2D'
        });
        
        // 获取当前位置
        this.getCurrentLocation();
      } catch (error) {
        console.error('H5地图初始化失败:', error);
      }
    },
    
    // 获取当前位置 - 多平台兼容
    getCurrentLocation() {
      uni.getLocation({
        type: 'gcj02', // 高德坐标系
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          
          // #ifdef MP-WEIXIN
          this.addWeixinMarker(res.latitude, res.longitude, '我的位置', 0);
          // #endif
          
          // #ifdef H5
          if (this.map) {
            this.map.setCenter([res.longitude, res.latitude]);
            this.map.setZoom(15);
            this.addH5Marker(res.longitude, res.latitude, '我的位置');
          }
          // #endif
          
          // 获取地址名称
          this.getAddressName(res.longitude, res.latitude);
        },
        fail: (err) => {
          console.warn('获取位置失败:', err);
          uni.showToast({
            title: '获取位置失败，请手动输入起点',
            icon: 'none'
          });
        }
      });
    },
    
    // 微信小程序添加标记
    addWeixinMarker(lat, lng, title, id) {
      this.markers.push({
        id: id,
        latitude: lat,
        longitude: lng,
        title: title,
        // iconPath: '/static/location.png' // 需要准备图标
      });
    },
    
    // H5添加标记
    addH5Marker(lng, lat, title) {
      if (!this.map) return;
      
      try {
        const marker = new AMap.Marker({
          position: [lng, lat],
          title: title
        });
        this.map.add(marker);
      } catch (error) {
        console.warn('H5添加标记失败:', error);
      }
    },
    
    // 获取地址名称
    async getAddressName(lng, lat) {
      try {
        const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_WEB_KEY}&location=${lng},${lat}&output=JSON`;
        const response = await uni.request({ url });
        const data = response[1].data;
        
        if (data.status === '1' && data.regeocode) {
          this.startPoint = data.regeocode.formatted_address;
        }
      } catch (error) {
        console.warn('获取地址失败:', error);
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
      this.endPoint = '';
    },
    
    // 设置路线类型
    setRouteType(type) {
      this.routeType = type;
    },
    
    // 输入框焦点事件
    onStartFocus() {
      // 可以在这里实现地址搜索
    },
    
    onEndFocus() {
      // 可以在这里实现地址搜索
    },
    
    // 路线规划 - 多平台通用
    async planRoute() {
      if (!this.canNavigate) {
        uni.showToast({
          title: '请输入起点和终点',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      
      try {
        const routeData = await this.getRouteData();
        
        if (routeData) {
          this.currentRoute = this.formatRouteData(routeData);
          this.drawRoute(routeData);
          uni.showToast({
            title: '路线规划成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '路线规划失败，请检查地址',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('路线规划错误:', error);
        uni.showToast({
          title: '路线规划失败',
          icon: 'none'
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
        const response = await uni.request({ url });
        const data = response[1].data;
        
        if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
          return data.route.paths[0];
        }
        return null;
      } catch (error) {
        console.error('获取路线数据失败:', error);
        return null;
      }
    },
    
    // 获取路线策略
    getRouteStrategy() {
      switch (this.routeType) {
        case 'drive': return '0'; // 最快路线
        case 'bus': return '6';   // 公交策略
        case 'walk': return '2';  // 步行策略
        default: return '0';
      }
    },
    
    // 格式化路线数据
    formatRouteData(route) {
      const steps = (route.steps || []).map(step => ({
        instruction: step.instruction.replace(/<[^>]*>/g, ''),
        distance: (step.distance / 1000).toFixed(1) + '公里',
        icon: this.getStepIcon(step.instruction)
      }));
      
      return {
        distance: (route.distance / 1000).toFixed(1) + '公里',
        duration: this.formatDuration(route.duration),
        steps: steps
      };
    },
    
    // 获取步骤图标
    getStepIcon(instruction) {
      const inst = instruction.toLowerCase();
      if (inst.includes('左转')) return '↰';
      if (inst.includes('右转')) return '↱';
      if (inst.includes('直行')) return '↑';
      if (inst.includes('到达')) return '🏁';
      if (inst.includes('出发')) return '🚩';
      return '•';
    },
    
    // 格式化时长
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    },
    
    // 绘制路线 - 多平台兼容
    drawRoute(route) {
      if (!route.steps) return;
      
      // #ifdef MP-WEIXIN
      this.drawWeixinRoute(route);
      // #endif
      
      // #ifdef H5
      this.drawH5Route(route);
      // #endif
    },
    
    // 微信小程序绘制路线
    drawWeixinRoute(route) {
      // 清除之前的标记和路线
      this.markers = [];
      this.polyline = [];
      
      // 添加起点终点标记
      if (route.steps[0]) {
        const startLoc = route.steps[0].start_location.split(',');
        this.addWeixinMarker(parseFloat(startLoc[1]), parseFloat(startLoc[0]), '起点', 1);
      }
      
      if (route.steps[route.steps.length - 1]) {
        const endLoc = route.steps[route.steps.length - 1].end_location.split(',');
        this.addWeixinMarker(parseFloat(endLoc[1]), parseFloat(endLoc[0]), '终点', 2);
      }
      
      // 绘制路线
      const points = [];
      route.steps.forEach(step => {
        if (step.polyline) {
          const stepPoints = step.polyline.split(';');
          stepPoints.forEach(point => {
            const [lng, lat] = point.split(',');
            points.push({
              latitude: parseFloat(lat),
              longitude: parseFloat(lng)
            });
          });
        }
      });
      
      if (points.length > 0) {
        this.polyline = [{
          points: points,
          color: '#1E90FF',
          width: 6,
          dottedLine: false
        }];
      }
    },
    
    // H5绘制路线
    drawH5Route(route) {
      if (!this.map || !route.steps) return;
      
      try {
        // 清除之前的路线
        this.map.clearMap();
        
        // 添加起点终点标记
        if (route.steps[0]) {
          const startLoc = route.steps[0].start_location.split(',');
          this.addH5Marker(parseFloat(startLoc[0]), parseFloat(startLoc[1]), '起点');
        }
        
        if (route.steps[route.steps.length - 1]) {
          const endLoc = route.steps[route.steps.length - 1].end_location.split(',');
          this.addH5Marker(parseFloat(endLoc[0]), parseFloat(endLoc[1]), '终点');
        }
        
        // 绘制路线
        const path = [];
        route.steps.forEach(step => {
          if (step.polyline) {
            const points = step.polyline.split(';');
            points.forEach(point => {
              const [lng, lat] = point.split(',');
              path.push([parseFloat(lng), parseFloat(lat)]);
            });
          }
        });
        
        if (path.length > 0) {
          const polyline = new AMap.Polyline({
            path: path,
            strokeColor: '#1E90FF',
            strokeWeight: 6,
            strokeOpacity: 0.8
          });
          this.map.add(polyline);
          this.map.setFitView();
        }
      } catch (error) {
        console.warn('H5绘制路线失败:', error);
      }
    },
    
    // 打开外部导航
    openExternalNavigation() {
      if (!this.canNavigate) {
        uni.showToast({
          title: '请输入起点和终点',
          icon: 'none'
        });
        return;
      }
      
      // 使用高德地图URI方案
      const url = `https://uri.amap.com/navigation?from=${encodeURIComponent(this.startPoint)}&to=${encodeURIComponent(this.endPoint)}&mode=car&callnative=1`;
      
      // #ifdef MP-WEIXIN
      // 微信小程序中复制链接到剪贴板
      uni.setClipboardData({
        data: url,
        success: () => {
          uni.showToast({
            title: '导航链接已复制，请粘贴到浏览器打开',
            icon: 'success'
          });
        }
      });
      // #endif
      
      // #ifdef H5
      window.open(url, '_blank');
      // #endif
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.map-container {
  width: 100%;
  height: 400rpx;
  flex-shrink: 0;
}

/* H5地图容器特殊样式 */
/* #ifdef H5 */
.map-container {
  background: #e0e0e0;
}
/* #endif */

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(135deg, #1E90FF, #00BFFF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  /* #ifdef MP-WEIXIN */
  padding-top: env(safe-area-inset-top);
  /* #endif */
}

.back-btn {
  position: absolute;
  left: 30rpx;
  font-size: 36rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
}

.location-info {
  padding: 30rpx;
  background: white;
}

.location-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 1rpx solid #e9ecef;
}

.location-item:last-child {
  margin-bottom: 0;
}

.location-icon {
  width: 56rpx;
  height: 56rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 24rpx;
  font-weight: bold;
}

.start-icon {
  background: #1E90FF;
  color: white;
}

.end-icon {
  background: #FF4500;
  color: white;
}

.location-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 32rpx;
  outline: none;
}

.locate-btn, .clear-btn {
  font-size: 36rpx;
  padding: 8rpx;
  margin-left: 16rpx;
  opacity: 0.7;
}

.route-type-selector {
  display: flex;
  padding: 0 30rpx;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.route-type-btn {
  flex: 1;
  padding: 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 16rpx;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.route-type-btn.active {
  background: #1E90FF;
  color: white;
  border-color: #1E90FF;
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 24rpx;
}

.nav-buttons {
  display: flex;
  padding: 0 30rpx 30rpx;
  gap: 20rpx;
}

.nav-btn {
  flex: 1;
  padding: 28rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.nav-btn[disabled] {
  background: #ccc !important;
  color: #666 !important;
}

.primary-btn {
  background: #1E90FF;
  color: white;
}

.secondary-btn {
  background: #f8f9fa;
  color: #333;
  border: 1rpx solid #dee2e6;
}

.route-info {
  flex: 1;
  margin: 20rpx;
  background: white;
  border-radius: 16rpx;
  border: 1rpx solid #e9ecef;
  overflow: hidden;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e9ecef;
}

.route-title {
  font-size: 32rpx;
  font-weight: 600;
}

.route-summary {
  color: #1E90FF;
  font-weight: 600;
  font-size: 28rpx;
}

.route-steps {
  height: 400rpx;
}

.route-step {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f8f9fa;
}

.route-step:last-child {
  border-bottom: none;
}

.step-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.step-content {
  flex: 1;
}

.step-instruction {
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
  font-size: 28rpx;
}

.step-distance {
  font-size: 24rpx;
  color: #666;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading {
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #1E90FF;
  border-top: 4rpx solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>