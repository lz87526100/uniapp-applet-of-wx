<template>
  <view class="container">
    <!-- 导航输入区域 -->
    <view class="nav-container">
      <view class="input-group">
        <view class="input-item">
          <text class="label">起点</text>
          <input 
            v-model="startPoint.name" 
            class="input" 
            placeholder="请输入起点位置" 
            placeholder-class="placeholder"
          />
          <button v-if="startPoint.name" @tap="clearStart" class="clear-btn">清除</button>
        </view>
        
        <view class="input-item">
          <text class="label">终点</text>
          <input 
            v-model="endPoint.name" 
            class="input" 
            placeholder="请输入终点位置" 
            placeholder-class="placeholder"
            @confirm="openRoutePlan"
          />
          <button v-if="endPoint.name" @tap="clearEnd" class="clear-btn">清除</button>
        </view>
      </view>
      
      <view class="button-group">
        <button @tap="requestLocationPermission" class="location-btn">
          <text class="btn-text">使用当前位置</text>
        </button>
        
        <button @tap="openRoutePlan" class="nav-btn" :disabled="!endPoint.name">
          <text class="btn-text">开始导航</text>
        </button>
      </view>
    </view>
    
    <!-- 地图容器 -->
    <map 
      class="map" 
      :latitude="currentLocation.lat" 
      :longitude="currentLocation.lng"
      :scale="scale"
      :markers="markers"
      show-location
      show-compass
    ></map>
    
    <!-- 权限请求弹窗 -->
    <view v-if="showPermissionModal" class="modal-mask">
      <view class="modal-content">
        <text class="modal-title">位置权限请求</text>
        <text class="modal-desc">需要获取您的位置信息才能提供导航服务，请在设置中允许位置权限</text>
        <view class="modal-buttons">
          <button @tap="openSetting" class="modal-btn confirm">去设置</button>
          <button @tap="closePermissionModal" class="modal-btn cancel">取消</button>
        </view>
      </view>
    </view>
    
    <!-- 提示信息 -->
    <view v-if="tipMessage" class="tip-message" :class="tipType">
      <text>{{ tipMessage }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'

// 响应式数据
const startPoint = reactive({
  name: '',
  latitude: 0,
  longitude: 0
})

const endPoint = reactive({
  name: '',
  latitude: 0,
  longitude: 0
})

const currentLocation = reactive({
  lat: 39.9042, // 默认北京坐标
  lng: 116.4074
})

const scale = ref(15)
const markers = ref([])
const tipMessage = ref('')
const tipType = ref('info') // info, success, error
const showPermissionModal = ref(false)
const hasLocationPermission = ref(false)

// 页面加载
onLoad(() => {
  // 检查定位权限状态
  checkLocationPermission()
})

// 检查定位权限
const checkLocationPermission = () => {
  uni.getSetting({
    success: (res) => {
      if (res.authSetting['scope.userLocation'] === true) {
        // 已经有定位权限
        hasLocationPermission.value = true
        getCurrentLocation()
      } else if (res.authSetting['scope.userLocation'] === false) {
        // 用户之前拒绝了定位权限
        hasLocationPermission.value = false
        showTip('定位权限已被拒绝，请手动授权', 'error')
      } else {
        // 还未询问过权限
        hasLocationPermission.value = false
      }
    },
    fail: () => {
      hasLocationPermission.value = false
    }
  })
}

// 请求定位权限
const requestLocationPermission = () => {
  if (hasLocationPermission.value) {
    // 已经有权限，直接获取位置
    getCurrentLocation()
    return
  }
  
  // 请求定位权限
  uni.authorize({
    scope: 'scope.userLocation',
    success: () => {
      // 授权成功
      hasLocationPermission.value = true
      getCurrentLocation()
      showTip('定位权限授权成功', 'success')
    },
    fail: (err) => {
      console.error('授权失败:', err)
      // 授权失败，显示权限请求弹窗
      showPermissionModal.value = true
    }
  })
}

// 获取当前位置
const getCurrentLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      currentLocation.lat = res.latitude
      currentLocation.lng = res.longitude
      
      // 更新地图标记
      updateMarkers()
      
      showTip('当前位置获取成功', 'success')
    },
    fail: (err) => {
      console.error('获取当前位置失败:', err)
      showTip('获取当前位置失败，请检查定位权限或GPS', 'error')
    }
  })
}

// 使用当前位置作为起点
const useCurrentLocation = () => {
  if (currentLocation.lat && currentLocation.lng) {
    startPoint.name = '我的位置'
    startPoint.latitude = currentLocation.lat
    startPoint.longitude = currentLocation.lng
    showTip('已设置当前位置为起点', 'success')
  } else {
    showTip('无法获取当前位置，请先授权定位权限', 'error')
  }
}

// 打开系统设置页面
const openSetting = () => {
  uni.openSetting({
    success: (res) => {
      if (res.authSetting['scope.userLocation'] === true) {
        // 用户同意了定位权限
        hasLocationPermission.value = true
        getCurrentLocation()
        showTip('定位权限已开启', 'success')
      }
      showPermissionModal.value = false
    },
    fail: () => {
      showPermissionModal.value = false
      showTip('打开设置失败', 'error')
    }
  })
}

// 关闭权限请求弹窗
const closePermissionModal = () => {
  showPermissionModal.value = false
}

// 打开路线规划插件
const openRoutePlan = () => {
  if (!endPoint.name.trim()) {
    showTip('请输入终点位置', 'error')
    return
  }
  
  // 使用在腾讯位置服务申请的key
  const key = '77NBZ-KM2C7-RY2XI-HOQPY-RJXTT-FKB4V';
  // 调用插件的app的名称
  const referer = 'demo1009';
  // 是否开启导航功能
  const navigation = 1;
  
  // 终点
  const endPointData = JSON.stringify({
    name: endPoint.name,
    latitude: endPoint.latitude || currentLocation.lat, // 如果没有具体坐标，使用当前位置
    longitude: endPoint.longitude || currentLocation.lng,
  });
  
  let url = `plugin://routePlan/index?key=${key}&referer=${referer}&endPoint=${endPointData}&navigation=${navigation}`;
  
  // 如果有起点，也传入起点
  if (startPoint.name && startPoint.latitude && startPoint.longitude) {
    const startPointData = JSON.stringify({
      name: startPoint.name,
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
    });
    url += `&startPoint=${startPointData}`;
  }
  
  console.log('打开路线规划:', url);
  
  uni.navigateTo({
    url: url,
    fail: (err) => {
      console.error('打开路线规划失败:', err)
      showTip('打开导航失败，请检查插件配置', 'error')
    }
  });
}

// 更新地图标记
const updateMarkers = () => {
  const newMarkers = []
  
  // 添加起点标记
  if (startPoint.latitude && startPoint.longitude) {
    newMarkers.push({
      id: 1,
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      title: startPoint.name,
      iconPath: '/static/start.png', // 起点图标
      width: 25,
      height: 25
    })
  }
  
  // 添加终点标记
  if (endPoint.latitude && endPoint.longitude) {
    newMarkers.push({
      id: 2,
      latitude: endPoint.latitude,
      longitude: endPoint.longitude,
      title: endPoint.name,
      iconPath: '/static/end.png', // 终点图标
      width: 25,
      height: 25
    })
  }
  
  // 如果没有起点和终点，添加当前位置标记
  if (newMarkers.length === 0) {
    newMarkers.push({
      id: 0,
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      title: '当前位置',
      iconPath: '/static/location.png',
      width: 30,
      height: 30
    })
  }
  
  markers.value = newMarkers
}

// 清除起点
const clearStart = () => {
  startPoint.name = ''
  startPoint.latitude = 0
  startPoint.longitude = 0
  updateMarkers()
}

// 清除终点
const clearEnd = () => {
  endPoint.name = ''
  endPoint.latitude = 0
  endPoint.longitude = 0
  updateMarkers()
}

// 显示提示信息
const showTip = (message, type = 'info') => {
  tipMessage.value = message
  tipType.value = type
  
  // 3秒后自动隐藏
  setTimeout(() => {
    tipMessage.value = ''
  }, 3000)
}

// 页面卸载
onUnload(() => {
  // 清理工作
})
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100vh;
  width: 100vw;
}

.nav-container {
  position: absolute;
  top: 40rpx;
  left: 40rpx;
  right: 40rpx;
  z-index: 10;
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 30rpx;
}

.input-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  position: relative;
}

.label {
  width: 80rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.input {
  flex: 1;
  height: 70rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  margin: 0 20rpx;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.clear-btn {
  background-color: transparent;
  color: #999;
  border: none;
  padding: 10rpx;
  font-size: 24rpx;
  width: auto;
  line-height: 1;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.location-btn, .nav-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 10rpx;
  font-size: 30rpx;
}

.location-btn {
  background-color: #f0f0f0;
  color: #333;
  margin-right: 20rpx;
}

.nav-btn {
  background-color: #007AFF;
  color: white;
}

.nav-btn:disabled {
  background-color: #cccccc;
  color: #666666;
}

.btn-text {
  line-height: 80rpx;
}

.map {
  height: 100%;
  width: 100%;
}

/* 权限请求弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  width: 600rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.modal-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 10rpx;
  font-size: 30rpx;
  margin: 0 10rpx;
}

.modal-btn.confirm {
  background-color: #007AFF;
  color: white;
}

.modal-btn.cancel {
  background-color: #f0f0f0;
  color: #333;
}

.tip-message {
  position: absolute;
  top: 300rpx;
  left: 50rpx;
  right: 50rpx;
  padding: 20rpx 30rpx;
  border-radius: 10rpx;
  text-align: center;
  z-index: 10;
  font-size: 28rpx;
}

.tip-message.info {
  background-color: rgba(0, 122, 255, 0.9);
  color: white;
}

.tip-message.success {
  background-color: rgba(52, 199, 89, 0.9);
  color: white;
}

.tip-message.error {
  background-color: rgba(255, 59, 48, 0.9);
  color: white;
}
</style>