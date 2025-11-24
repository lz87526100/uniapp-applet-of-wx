<template>
 
  <view class="container">
    <!-- 地图容器 -->
    <view class="map-container">
      <map 
        id="shopMap"
        :latitude="center.latitude"
        :longitude="center.longitude"
        :markers="markers"
        :scale="scale"
        show-location
        class="map"
        enable-scroll="false"
        @markertap="onMarkerTap"
        @regionchange="onRegionChange"
      >
      </map>
      
      <!-- 当前位置按钮 -->
      <view class="location-btn" @tap="backToCurrentLocation">
        <text class="btn-text">📍</text>
      </view>
    </view>
    
    <!-- 店铺列表 -->
    <view class="shop-list">
      <scroll-view 
        scroll-y 
        class="list-scroll"
        enhanced="true"
        show-scrollbar="false"
      >
        <view 
          v-for="shop in shops" 
          :key="shop.id"
          class="shop-item"
          :class="{ active: selectedShopId === shop.id }"
          @tap="onShopItemTap(shop)"
        >
          <view class="shop-header">
            <text class="shop-name">{{ shop.name }}</text>
            <text class="shop-rating">⭐ {{ shop.rating }}</text>
          </view>
          <text class="shop-address">{{ shop.address }}</text>
          <view class="shop-footer">
            <text class="shop-sales">月售 {{ shop.monthlySales }} 单</text>
            <text class="location-tag">📍 查看位置</text>
          </view>
          <view class="shop-hours">
            <text class="hours-text">营业时间: {{ shop.businessHours }}</text>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="shops.length === 0 && !loading" class="empty-state">
          <view class="empty-icon">🏪</view>
          <text class="empty-title">暂无店铺数据</text>
          <text class="empty-desc">正在努力加载中...</text>
          <button class="empty-btn" @tap="loadShopsData">重新加载</button>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <uni-load-more status="loading" content="正在加载..."></uni-load-more>
        </view>
      </scroll-view>
    </view>
    
    <!-- 店铺详情弹窗 -->
    <uni-popup ref="detailPopup" type="center" background-color="transparent">
      <view class="popup-content" v-if="selectedShop">
        <!-- 关闭按钮 -->
        <view class="close-popup-btn" @tap="closePopup">
          <text class="close-icon">×</text>
        </view>
        
        <!-- 店铺头部 -->
        <view class="popup-header">
          <view class="shop-basic">
            <text class="popup-title">{{ selectedShop.name }}</text>
            <view class="rating-section">
              <view class="rating-stars">
                <text v-for="n in 5" :key="n" class="star" 
                      :class="n <= Math.round(selectedShop.rating) ? 'active' : ''">★</text>
              </view>
              <text class="rating-text">{{ selectedShop.rating }}</text>
            </view>
          </view>
          <view class="sales-info">
            <text class="sales-text">月售 {{ selectedShop.monthlySales }} 单</text>
          </view>
        </view>

        <!-- 店铺信息 -->
        <view class="popup-body">
          <!-- 地址信息 -->
          <view class="info-section address-section">
            <view class="section-header">
              <text class="section-icon">📍</text>
              <text class="section-title">店铺地址</text>
            </view>
            <text class="address-text">{{ selectedShop.address }}</text>
          </view>

          <!-- 营业时间 -->
          <view class="info-section hours-section">
            <view class="section-header">
              <text class="section-icon">🕒</text>
              <text class="section-title">营业时间</text>
            </view>
            <text class="hours-text">{{ selectedShop.businessHours }}</text>
          </view>

          <!-- 店铺描述 -->
          <view class="info-section desc-section" v-if="selectedShop.description">
            <view class="section-header">
              <text class="section-icon">📝</text>
              <text class="section-title">店铺介绍</text>
            </view>
            <text class="desc-text">{{ selectedShop.description }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="popup-footer">
          <button class="action-btn detail-btn" @tap="goToShopDetail">
            <text class="btn-icon">🏪</text>
            <text class="btn-text">查看详情</text>
          </button>
          <button class="action-btn nav-btn" @tap="openNavigation">
            <text class="btn-icon">🧭</text>
            <text class="btn-text">导航前往</text>
          </button>
        </view>
      </view>
    </uni-popup>
  </view>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 地图中心点（闽南科技学院大致坐标）
const center = reactive({
  latitude: 25.034161,
  longitude: 118.482187,
})

const scale = ref(15)
const markers = ref([])
const shops = ref([])
const selectedShopId = ref(null)
const selectedShop = ref(null)
const detailPopup = ref(null)
const mapContext = ref(null)
const loading = ref(false)

onLoad(() => {
  loadShopsData()
  mapContext.value = uni.createMapContext('shopMap', this)
})

// 跳转到店铺详情页面
const goToShopDetail = () => {
  if (!selectedShop.value || !selectedShop.value.id) {
    uni.showToast({
      title: '店铺信息不完整',
      icon: 'none'
    })
    return
  }

  // 构建跳转URL
  const url = `/pages/shopList/shopDetail?id=${selectedShop.value.id}`
  
  console.log('🔄 跳转到店铺详情:', {
    shopId: selectedShop.value.id,
    url: url
  })
  
  // 关闭弹窗
  closePopup()
  
  // 跳转到店铺详情页
  uni.navigateTo({
    url: url,
    success: () => {
      console.log('✅ 跳转到店铺详情页成功')
    },
    fail: (err) => {
      console.error('❌ 跳转失败:', err)
      uni.showToast({
        title: '跳转失败，请重试',
        icon: 'none'
      })
    }
  })
}

// 加载店铺数据
const loadShopsData = async () => {
  try {
    loading.value = true
    uni.showLoading({
      title: '加载中...'
    })
    
    const result = await uniCloud.callFunction({
      name: 'getShopList',
      data: {
        keyword: ''  // 空字符串获取所有店铺
      }
    })
    
    if (result.result.errCode === 0) {
      shops.value = result.result.data
      initMapMarkers()
      console.log('✅ 成功加载店铺数据:', shops.value.length)
    } else {
      throw new Error(result.result.errMsg)
    }
  } catch (error) {
    console.error('❌ 加载店铺数据失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    // 降级处理：使用空数组
    shops.value = []
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

const initMapMarkers = () => {
  // 过滤掉没有坐标的店铺
  const validShops = shops.value.filter(shop => shop.latitude && shop.longitude && shop.latitude !== 0 && shop.longitude !== 0)
  
  // 创建小红点标记
  markers.value = validShops.map(shop => ({
    id: shop.id,
    latitude: shop.latitude,
    longitude: shop.longitude,
    title: shop.name,
    iconPath: '/static/logo/local.png', // 小红点图标
    width: 20,
    height: 20,
    callout: {
      content: `${shop.name}\n⭐${shop.rating} | 月售${shop.monthlySales}单`,
      color: '#333',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#fff',
      padding: 8,
      display: 'ALWAYS',
      textAlign: 'center'
    }
  }))
  
  console.log('🗺️ 初始化地图标记:', markers.value.length)
}

const onMarkerTap = (e) => {
  const markerId = e.detail.markerId
  const shop = shops.value.find(s => s.id === markerId)
  if (shop) {
    selectedShopId.value = markerId
    showShopDetail(shop)
  }
}

const onShopItemTap = (shop) => {
  selectedShopId.value = shop.id
  selectedShop.value = shop
  // 移动地图到商家位置
  focusOnShopLocation(shop)
  showShopDetail(shop)
}

const focusOnShopLocation = (shop = null) => {
  const targetShop = shop || selectedShop.value
  if (!targetShop || !targetShop.latitude || !targetShop.longitude) return
  
  // 移动地图视角到选中的店铺
  center.latitude = targetShop.latitude
  center.longitude = targetShop.longitude
  scale.value = 18 // 放大级别
  
  // 高亮显示该商家的标记
  setTimeout(() => {
    if (mapContext.value) {
      const markerIndex = markers.value.findIndex(m => m.id === targetShop.id)
      if (markerIndex !== -1) {
        markers.value[markerIndex].iconPath = '/static/logo/local-active.png' // 高亮图标
        markers.value = [...markers.value] // 触发响应式更新
      }
    }
  }, 300)
}

const showShopDetail = (shop) => {
  selectedShop.value = shop
  detailPopup.value.open()
}

const closePopup = () => {
  detailPopup.value.close()
  // 恢复所有标记为普通状态
  markers.value = markers.value.map(marker => ({
    ...marker,
    iconPath: '/static/logo/local.png'
  }))
}

const backToCurrentLocation = () => {
  // 回到初始中心点
  center.latitude = 25.034161
  center.longitude = 118.482187
  scale.value = 15
  selectedShopId.value = null
  // 恢复所有标记为普通状态
  markers.value = markers.value.map(marker => ({
    ...marker,
    iconPath: '/static/logo/local.png'
  }))
}

const openNavigation = () => {
  if (!selectedShop.value || !selectedShop.value.latitude) {
    uni.showToast({
      title: '无法获取店铺位置',
      icon: 'none'
    })
    return
  }
  
  uni.openLocation({
    latitude: selectedShop.value.latitude,
    longitude: selectedShop.value.longitude,
    name: selectedShop.value.name,
    address: selectedShop.value.address,
    success: () => {
      console.log('打开地图成功')
    },
    fail: (error) => {
      console.error('打开地图失败:', error)
      uni.showToast({
        title: '打开地图失败',
        icon: 'none'
      })
    }
  })
}

const makePhoneCall = () => {
  if (!selectedShop.value || !selectedShop.value.phone) {
    uni.showToast({
      title: '暂无联系电话',
      icon: 'none'
    })
    return
  }
  
  uni.makePhoneCall({
    phoneNumber: selectedShop.value.phone,
    success: () => {
      console.log('拨打电话成功')
    },
    fail: (error) => {
      console.error('拨打电话失败:', error)
      uni.showToast({
        title: '拨打电话失败',
        icon: 'none'
      })
    }
  })
}

const onRegionChange = (e) => {
  console.log('地图区域变化:', e)
}
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

/* 当前位置按钮 */
.location-btn {
  position: absolute;
  bottom: 120rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.2);
  z-index: 1000;
}

.btn-text {
  font-size: 36rpx;
}

.shop-list {
  height: 40vh;
  background: #fff;
  border-top: 1px solid #eee;
  position: relative;
  z-index: 10;
}

.list-scroll {
  height: 100%;
  padding-top: 20rpx;
  -webkit-overflow-scrolling: touch;
}

.shop-item {
  padding: 24rpx;
  border-bottom: 1px solid #f5f5f5;
  background: #fff;
  border-radius: 12rpx;
  margin: 0 24rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  touch-action: pan-y;
}

.shop-item.active {
  background: #f0f7ff;
  border-left: 6rpx solid #007AFF;
  box-shadow: 0 4rpx 16rpx rgba(0,122,255,0.15);
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.shop-rating {
  font-size: 26rpx;
  color: #ff9500;
  font-weight: bold;
}

.shop-address {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.shop-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.shop-sales {
  font-size: 24rpx;
  color: #999;
}

.location-tag {
  font-size: 24rpx;
  color: #007AFF;
  background: #f0f7ff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  border: 1rpx solid #007AFF;
}

.shop-hours {
  margin-top: 8rpx;
}

.hours-text {
  font-size: 24rpx;
  color: #666;
  background: #f8f8f8;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  display: inline-block;
}

/* 弹窗样式 */
.popup-content {
  width: 85vw;
  max-width: 700rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx 32rpx;
  position: relative;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

/* 关闭按钮 */
.close-popup-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-icon {
  font-size: 36rpx;
  color: #666;
  font-weight: 300;
}

/* 弹窗头部 */
.popup-header {
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.shop-basic {
  margin-bottom: 16rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.3;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.rating-stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 24rpx;
  color: #e5e7eb;
}

.star.active {
  color: #ffb800;
}

.rating-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #ffb800;
}

.sales-info {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.sales-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
}

/* 弹窗主体 */
.popup-body {
  max-height: 50vh;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 28rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.section-icon {
  font-size: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

.address-text {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.5;
  display: block;
}

.hours-text {
  font-size: 26rpx;
  color: #059669;
  font-weight: 500;
  display: block;
}

.desc-text {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.6;
  display: block;
}

/* 弹窗底部按钮 */
/* 弹窗底部按钮 */
.popup-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 8rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.detail-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8C42);
  color: white;
}

.nav-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-icon {
  font-size: 28rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #718096;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.empty-btn {
  background: linear-gradient(135deg, #4F8BFF, #6AA6FF);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 18rpx 60rpx;
  font-size: 28rpx;
}

.loading-state {
  padding: 40rpx 0;
  text-align: center;
}

/* 隐藏高德地图slogan */
:deep(.amap-logo) {
  display: none !important;
}

:deep(.amap-copyright) {
  display: none !important;
}
</style>