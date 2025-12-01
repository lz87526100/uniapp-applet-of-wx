<template>
  <view class="container">
    <!-- 地图容器 -->
    <view class="map-container">
      <map 
        id="shopMap"
        :key="mapKey"
        :latitude="center.latitude"
        :longitude="center.longitude"
        :markers="markers"
        :scale="scale"
        show-location
        class="map"
        enable-zoom
        enable-scroll
        enable-rotate
        @markertap="onMarkerTap"
        @regionchange="onRegionChange"
      >
      </map>
      
      <!-- 顶部状态栏 -->
      <view class="top-bar">
        <view class="header-content">
          <view class="user-section">
            <view class="user-info" @tap="goToUserCenter">
              <view class="avatar">
                <image 
                  v-if="currentUser?.avatar"
                  class="avatar-img"
                  :src="currentUser.avatar"
                  mode="aspectFill"
                  @error="(e) => handleImageError(e, 'user')"
                />
                <text v-else class="avatar-icon">👤</text>
              </view>
              <view class="user-text">
                <text class="username">{{ currentUser?.nickname || '用户' }}</text>
                <text class="user-desc">发现周边店铺</text>
              </view>
            </view>
            <view class="stats-badge">
              <text class="stats-count">{{ shops.length }}</text>
              <text class="stats-label">店铺</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 地图控制按钮组 -->
      <view class="map-controls">
        <view class="control-group">
          <view class="location-btn" @tap="backToCurrentLocation">
            <view class="btn-icon">📍</view>
          </view>
          <view class="zoom-controls">
            <view class="zoom-btn" @tap="zoomIn">
              <text class="zoom-icon">+</text>
            </view>
            <view class="zoom-btn" @tap="zoomOut">
              <text class="zoom-icon">-</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 店铺列表 -->
    <view class="shop-list-container">
      <!-- 列表头部 -->
      <view class="list-header">
        <view class="header-content">
          <view class="title-section">
            <text class="main-title">周边店铺</text>
            <text class="sub-title">Discover Nearby Shops</text>
          </view>
          <view class="filter-section">
            <view class="filter-tabs">
              <text class="filter-tab" :class="{ active: sortBy === 'default' }" @tap="changeSort('default')">
                <text class="tab-icon">🕒</text>
                <text>距离最近</text>
              </text>
              <text class="filter-tab" :class="{ active: sortBy === 'rating' }" @tap="changeSort('rating')">
                <text class="tab-icon">⭐</text>
                <text>评分最高</text>
              </text>
              <text class="filter-tab" :class="{ active: sortBy === 'sales' }" @tap="changeSort('sales')">
                <text class="tab-icon">🔥</text>
                <text>销量最好</text>
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 列表内容 -->
      <view class="list-content">
        <scroll-view 
          scroll-y 
          class="list-scroll"
          enhanced="true"
          show-scrollbar="false"
        >
          <!-- 空状态 -->
          <view v-if="shops.length === 0 && !loading" class="empty-state">
            <view class="empty-illustration">
              <view class="empty-icon">🏪</view>
              <view class="empty-stars">
                <text class="star">⭐</text>
                <text class="star">⭐</text>
                <text class="star">⭐</text>
              </view>
            </view>
            <text class="empty-title">暂无店铺数据</text>
            <text class="empty-desc">正在努力加载中...</text>
            <button class="empty-btn" @tap="loadShopsData">
              <text class="btn-icon">🔄</text>
              <text class="btn-text">重新加载</text>
            </button>
          </view>

          <!-- 店铺列表 -->
          <view class="shop-cards">
            <view 
              v-for="(shop, index) in sortedShops" 
              :key="shop.id"
              class="shop-card"
              :class="{ active: selectedShopId === shop.id }"
              @tap="onShopItemTap(shop)"
            >
              <!-- 卡片内容 -->
              <view class="card-content">
                <!-- 顶部信息 -->
                <view class="card-header">
                  <view class="shop-meta">
                    <!-- 店铺头像 -->
                    <view class="shop-rank">
                      <image 
                        class="shop-avatar" 
                        :src="getShopImage(shop.shopPic || shop.image)"
                        mode="aspectFill"
                        @error="(e) => handleImageError(e, 'shop')"
                      />
                    </view>
                    <view class="shop-main">
                      <!-- 店铺名称和评分并排显示 -->
                      <view class="title-rating-row">
                        <text class="shop-name">{{ shop.name }}</text>
                        <view class="rating-tag">
                          <text class="rating-icon">⭐</text>
                          <text class="rating-value">{{ getShopRating(shop) }}</text>
                        </view>
                      </view>
                      
                      <!-- 地址信息 -->
                      <view class="info-item">
                        <text class="info-text">{{ shop.address }}</text>
                      </view>
                      
                      <view class="card-footer">
                        <view class="stats-section">
                          <view class="stat">
                            <text class="stat-label">月售</text>
                            <text class="stat-value">{{ safeFormatNumber(shop.monthlySales) }}</text>
                          </view>
                          <view class="stat-divider"></view>
                          <view class="stat">
                            <text class="stat-label">营业</text>
                            <text class="stat-value">{{ shop.businessHours || '09:00-21:00' }}</text>
                          </view>
                        </view>
                        
                        <view class="action-section">
                          <view class="action-buttons">
                            <view class="action-btn detail-btn" @tap.stop="goToShopDetail(shop.id)">
                              <text class="action-icon">🔍</text>
                            </view>
                            <view class="action-btn navigate-btn" @tap.stop="openShopNavigation(shop)">
                              <text class="action-icon">📍</text>
                            </view>
                            <view class="action-btn favorite-btn" @tap.stop="toggleFavorite(shop)">
                              <text class="action-icon">{{ isShopFavorite(shop.id) ? '❤️' : '🤍' }}</text>
                            </view>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 加载状态 -->
          <view v-if="loading" class="loading-state">
            <view class="loading-content">
              <view class="loading-animation">
                <view class="loading-dot dot-1"></view>
                <view class="loading-dot dot-2"></view>
                <view class="loading-dot dot-3"></view>
              </view>
              <text class="loading-text">正在加载店铺数据...</text>
            </view>
          </view>
        </scroll-view>
      </view>
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
          <view class="shop-avatar-large">
            <image 
              class="shop-avatar-img" 
              :src="getShopImage(selectedShop.shopPic || selectedShop.image)"
              mode="aspectFill"
              @error="(e) => handleImageError(e, 'shop')"
            />
          </view>
          <view class="shop-basic">
            <text class="popup-title">{{ selectedShop.name }}</text>
            <view class="rating-section">
              <view class="rating-stars">
                <text v-for="n in 5" :key="n" class="star" 
                      :class="n <= Math.round(parseFloat(getShopRating(selectedShop))) ? 'active' : ''">★</text>
              </view>
              <text class="rating-text">{{ getShopRating(selectedShop) }}</text>
            </view>
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
            <text class="hours-text">{{ selectedShop.businessHours || '09:00-21:00' }}</text>
          </view>

          <!-- 联系电话 -->
          <view class="info-section phone-section" v-if="selectedShop.phone">
            <view class="section-header">
              <text class="section-icon">📞</text>
              <text class="section-title">联系电话</text>
            </view>
            <text class="phone-text">{{ selectedShop.phone }}</text>
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
          <button class="action-btn detail-btn" @tap="goToShopDetail(selectedShop.id)">
            <text class="btn-text">查看详情</text>
          </button>
          <button class="action-btn nav-btn" @tap="openNavigation">
            <text class="btn-text">导航前往</text>
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

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
const sortBy = ref('default')

// 用户相关
const isLoggedIn = ref(false)
const userId = ref('')
const currentUser = ref(null)
const favoriteShops = ref([])

// 用于强制刷新地图的key
const mapKey = ref(Date.now())

// 安全的数字格式化函数
function safeToFixed(value, digits = 1) {
  if (value === null || value === undefined) return '0.0'
  const num = parseFloat(value)
  if (isNaN(num)) return '0.0'
  return num.toFixed(digits)
}

// 安全的数字格式化
function safeFormatNumber(num) {
  if (num === null || num === undefined) return '0'
  const number = parseInt(num)
  if (isNaN(number)) return '0'
  
  if (number >= 10000) {
    return (number / 10000).toFixed(1) + '万'
  }
  return number.toString()
}

// 获取评分 - 处理各种可能的评分字段
function getShopRating(shop) {
  // 尝试不同的评分字段
  const rating = shop.rating || shop.score || shop.star || 0
  return safeToFixed(rating)
}

// 计算属性：排序后的店铺列表
const sortedShops = computed(() => {
  if (!shops.value.length) return []
  
  const list = [...shops.value]
  
  switch (sortBy.value) {
    case 'rating':
      return list.sort((a, b) => parseFloat(getShopRating(b)) - parseFloat(getShopRating(a)))
    case 'sales':
      return list.sort((a, b) => (parseInt(b.monthlySales) || 0) - (parseInt(a.monthlySales) || 0))
    default:
      // 默认按距离排序（这里简化处理，实际应该计算真实距离）
      return list
  }
})

onLoad(() => {
  console.log('🔄 地图页面加载')
  checkLoginStatus()
  loadShopsData()
  mapContext.value = uni.createMapContext('shopMap', this)
})

onShow(() => {
  console.log('🔄 地图页面显示')
  checkLoginStatus()
})

// 检查登录状态
async function checkLoginStatus() {
  try {
    const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
    const token = uni.getStorageSync('uni_id_token')
    
    if (token && userInfoFromStorage && userInfoFromStorage._id) {
      isLoggedIn.value = true
      userId.value = userInfoFromStorage._id
      currentUser.value = userInfoFromStorage
      await loadFavoriteShops()
    } else {
      isLoggedIn.value = false
      userId.value = ''
      currentUser.value = null
      favoriteShops.value = []
    }
  } catch (error) {
    console.error('❌ 检查登录状态失败:', error)
    isLoggedIn.value = false
    userId.value = ''
    currentUser.value = null
    favoriteShops.value = []
  }
}

// 加载收藏店铺
async function loadFavoriteShops() {
  if (!isLoggedIn.value) return
  
  try {
    const articlesCo = uniCloud.importObject('articlesCloudObj')
    const res = await articlesCo.getShopFavoritesList({
      page: 1,
      size: 100,
      userId: userId.value
    })
    
    if (res.errCode === 0) {
      favoriteShops.value = res.data.list || []
    }
  } catch (error) {
    console.error('❌ 加载收藏店铺失败:', error)
  }
}

// 检查店铺是否收藏
function isShopFavorite(shopId) {
  return favoriteShops.value.some(item => item.shopInfo && item.shopInfo._id === shopId)
}

// 切换收藏状态
async function toggleFavorite(shop) {
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录再收藏店铺',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  
  try {
    const articlesCo = uniCloud.importObject('articlesCloudObj')
    const res = await articlesCo.toggleShopFavorite({
      shopId: shop.id,
      userId: userId.value
    })
    
    if (res.errCode === 0) {
      await loadFavoriteShops()
      uni.showToast({
        title: isShopFavorite(shop.id) ? '已取消收藏' : '收藏成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('❌ 切换收藏状态失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
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
    
    console.log('📊 原始店铺数据:', result.result)
    
    if (result.result.errCode === 0) {
      shops.value = result.result.data || []
      console.log('✅ 成功加载店铺数据:', shops.value.length)
      
      // 详细检查数据结构
      if (shops.value.length > 0) {
        console.log('🔍 第一个店铺的完整数据结构:', JSON.stringify(shops.value[0], null, 2))
        console.log('📝 店铺字段检查:')
        console.log('   - id:', shops.value[0].id)
        console.log('   - name:', shops.value[0].name)
        console.log('   - rating:', shops.value[0].rating, '类型:', typeof shops.value[0].rating)
        console.log('   - monthlySales:', shops.value[0].monthlySales, '类型:', typeof shops.value[0].monthlySales)
        console.log('   - latitude:', shops.value[0].latitude)
        console.log('   - longitude:', shops.value[0].longitude)
        console.log('   - address:', shops.value[0].address)
      }
      
      await initMapMarkers()
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

// 初始化地图标记
const initMapMarkers = async () => {
  // 过滤掉没有坐标的店铺
  const validShops = shops.value.filter(shop => {
    const hasCoords = shop.latitude && shop.longitude && shop.latitude !== 0 && shop.longitude !== 0
    if (!hasCoords) {
      console.log('❌ 店铺坐标无效:', shop.name, shop.latitude, shop.longitude)
    }
    return hasCoords
  })
  
  console.log('🗺️ 有效店铺数量:', validShops.length)
  
  // 创建标记 - 使用安全的格式化函数
  markers.value = validShops.map(shop => ({
    id: shop.id,
    latitude: parseFloat(shop.latitude),
    longitude: parseFloat(shop.longitude),
    title: shop.name,
    iconPath: '/static/logo/local.png',
    width: 20,
    height: 20,
    callout: {
      content: `${shop.name}\n⭐${getShopRating(shop)} | 月售${safeFormatNumber(shop.monthlySales)}单`,
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
  
  // 强制刷新地图
  mapKey.value = Date.now()
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
  center.latitude = parseFloat(targetShop.latitude)
  center.longitude = parseFloat(targetShop.longitude)
  scale.value = 18 // 放大级别
}

const showShopDetail = (shop) => {
  selectedShop.value = shop
  detailPopup.value.open()
}

const closePopup = () => {
  detailPopup.value.close()
}

const backToCurrentLocation = () => {
  // 回到初始中心点
  center.latitude = 25.034161
  center.longitude = 118.482187
  scale.value = 15
  selectedShopId.value = null
}

// 地图缩放控制
const zoomIn = () => {
  if (scale.value < 20) {
    scale.value += 1
  }
}

const zoomOut = () => {
  if (scale.value > 3) {
    scale.value -= 1
  }
}

// 排序控制
const changeSort = (type) => {
  sortBy.value = type
}

// 打开导航
const openNavigation = () => {
  if (!selectedShop.value || !selectedShop.value.latitude) {
    uni.showToast({
      title: '无法获取店铺位置',
      icon: 'none'
    })
    return
  }
  
  uni.openLocation({
    latitude: parseFloat(selectedShop.value.latitude),
    longitude: parseFloat(selectedShop.value.longitude),
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

// 单独打开店铺导航
const openShopNavigation = (shop) => {
  if (!shop || !shop.latitude) {
    uni.showToast({
      title: '无法获取店铺位置',
      icon: 'none'
    })
    return
  }
  
  uni.openLocation({
    latitude: parseFloat(shop.latitude),
    longitude: parseFloat(shop.longitude),
    name: shop.name,
    address: shop.address,
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

// 跳转到店铺详情页面
const goToShopDetail = (shopId) => {
  if (!shopId) {
    uni.showToast({
      title: '店铺信息不完整',
      icon: 'none'
    })
    return
  }

  const url = `/pages/shopList/shopDetail?id=${shopId}`
  
  console.log('🔄 跳转到店铺详情:', { shopId, url })
  
  closePopup()
  
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

// 跳转到用户中心
function goToUserCenter() {
  uni.navigateTo({
    url: '/pages/user/user'
  })
}

// 获取店铺图片URL
function getShopImage(shopPic) {
  if (!shopPic) {
    return '/static/default-shop.jpg'
  }
  
  // 处理图片URL，确保是完整的URL
  if (shopPic.startsWith('http')) {
    return shopPic
  } else if (shopPic.startsWith('/')) {
    return `https://your-domain.com${shopPic}`
  } else {
    return `/static/shop-images/${shopPic}`
  }
}

// 图片加载错误处理
function handleImageError(e, type = 'shop') {
  console.log('🖼️ 图片加载失败:', e, '类型:', type)
  
  const defaultImages = {
    shop: '/static/default-shop.jpg',
    user: '/static/default-avatar.png'
  }
  
  // 设置默认图片
  if (e.target) {
    e.target.src = defaultImages[type] || defaultImages.shop
    // 如果默认图片也加载失败，使用emoji替代
    e.target.onerror = null // 防止循环错误
  }
}

const onRegionChange = (e) => {
  // 可以在这里添加一些调试信息
  if (e.type === 'end') {
    console.log('🗺️ 地图区域变化结束，当前标记数量:', markers.value.length)
  }
}
</script>

<style scoped>
/* 整体布局 */
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* 顶部状态栏 */
.top-bar {
  position: absolute;
  top:10rpx;
  left: 10rpx;
  right: 10rpx;
  padding: var(--status-bar-height) 0 0;
  background: transparent;
  z-index: 1000;
}

.header-content {
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 0 0 30rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.user-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 36rpx;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 32rpx;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4rpx;
}

.user-desc {
  font-size: 24rpx;
  color: #718096;
}

.stats-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.3);
}

.stats-count {
  font-size: 28rpx;
  font-weight: 700;
  color: white;
}

.stats-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4rpx;
}

/* 地图控制按钮组 */
.map-controls {
  position: absolute;
  bottom: 90rpx;
  right: 30rpx;
  z-index: 1000;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.location-btn {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
}

.zoom-controls {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 25rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
}

.zoom-btn {
  width: 100rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.zoom-btn:first-child {
  border-bottom: 1rpx solid #f1f5f9;
}

.zoom-icon {
  font-size: 32rpx;
  font-weight: 600;
  color: #4a5568;
}

/* 店铺列表容器 */
.shop-list-container {
  height: 42vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 40rpx 40rpx 0 0;
  position: relative;
  z-index: 10;
  margin-top: -30rpx;
  box-shadow: 0 -20rpx 50rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 列表头部 */
.list-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 40rpx 30rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.header-content {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.title-section {
  margin-bottom: 30rpx;
}

.main-title {
  font-size: 42rpx;
  font-weight: 800;
  color: #1a202c;
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8rpx;
}

.sub-title {
  font-size: 26rpx;
  color: #a0aec0;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.filter-section {
  margin-top: 20rpx;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 25rpx;
  padding: 8rpx;
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
}

.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #718096;
  transition: all 0.3s ease;
  background: transparent;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 22rpx;
}

/* 列表内容 */
.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-scroll {
  height: 100%;
  flex: 1;
}

/* 店铺卡片网格 */
.shop-cards {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.shop-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 28rpx;
  padding: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.shop-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.shop-card.active {
  transform: translateY(-8rpx) scale(1.02);
  box-shadow: 0 20rpx 50rpx rgba(102, 126, 234, 0.25);
}

.shop-card.active::before {
  opacity: 1;
}

.shop-card:active {
  transform: scale(0.98);
}

/* 卡片内容 */
.card-content {
  padding: 40rpx 35rpx 35rpx;
  position: relative;
  z-index: 2;
}

/* 卡片头部 */
.card-header {
  margin-bottom: 20rpx;
}

.shop-meta {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

/* 店铺头像样式 */
.shop-rank {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  border: 4rpx solid white;
}

.shop-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-main {
  flex: 1;
  min-width: 0;
}

/* 标题和评分并排显示 */
.title-rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.shop-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
  min-width: 0;
}

.rating-tag {
  background: linear-gradient(135deg, #fffaf0 0%, #fed7aa 100%);
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  border: 1rpx solid #fed7aa;
  box-shadow: 0 4rpx 12rpx rgba(254, 215, 170, 0.3);
  flex-shrink: 0;
}

.rating-icon {
  font-size: 18rpx;
}

.rating-value {
  font-size: 18rpx;
  color: #d69e2e;
  font-weight: 600;
}

/* 地址信息样式调整 */
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 12rpx 0;
}

.info-icon {
  font-size: 24rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.info-text {
  font-size: 24rpx;
  color: #718096;
  line-height: 1.4;
  flex: 1;
}

/* 卡片底部调整 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-value {
  font-size: 18rpx;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  font-size: 20rpx;
  color: #a0aec0;
}

.stat-divider {
  width: 2rpx;
  height: 30rpx;
  background: #e2e8f0;
}

.action-section {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12rpx;
}

/* 操作按钮图标样式 */
.action-btn {
  width: 50rpx;
  height: 50rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: none;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn:active::before {
  opacity: 1;
}

.action-btn:active {
  transform: scale(0.92);
}

/* 修复按钮背景色 */
.detail-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.navigate-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%) !important;
}

.favorite-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.action-icon {
  font-size: 24rpx;
  color: white;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-illustration {
  position: relative;
  margin-bottom: 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.8;
}

.empty-stars {
  display: flex;
  gap: 16rpx;
  justify-content: center;
}

.star {
  font-size: 24rpx;
  opacity: 0.6;
  animation: twinkle 2s infinite;
}

.star:nth-child(2) {
  animation-delay: 0.5s;
}

.star:nth-child(3) {
  animation-delay: 1s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.empty-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #718096;
  margin-bottom: 50rpx;
  line-height: 1.5;
  text-align: center;
  max-width: 400rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 60rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 0 auto;
  box-shadow: 0 12rpx 30rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.empty-btn:active {
  transform: scale(0.95);
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
}

/* 加载状态 */
.loading-state {
  padding: 100rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}

.loading-animation {
  display: flex;
  gap: 12rpx;
}

.loading-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dot.dot-1 { animation-delay: -0.32s; }
.loading-dot.dot-2 { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 26rpx;
  color: #718096;
  font-weight: 500;
}

/* 弹窗样式 */
.popup-content {
  width: 85vw;
  max-width: 700rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 28rpx;
  padding: 40rpx 32rpx 32rpx;
  position: relative;
  box-shadow: 0 25rpx 70rpx rgba(0, 0, 0, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  z-index: 9999;
}

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
  transition: all 0.3s ease;
}

.close-popup-btn:active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.9);
}

.close-icon {
  font-size: 36rpx;
  color: #666;
  font-weight: 300;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

/* 弹窗中的店铺头像 */
.shop-avatar-large {
  width: 140rpx;
  height: 140rpx;
  border-radius: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.2);
  border: 6rpx solid white;
}

.shop-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-basic {
  flex: 1;
  min-width: 0;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.popup-body {
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 20rpx;
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

.phone-text {
  font-size: 26rpx;
  color: #3b82f6;
  font-weight: 500;
  display: block;
}

.desc-text {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.6;
  display: block;
}

/* 弹窗底部按钮样式修复 */
.popup-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.popup-footer .action-btn {
  height: 88rpx;
  font-size: 28rpx;
  font-weight: 600;
  flex: 1;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

/* 弹窗按钮背景色 */
.popup-footer .detail-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8C42) !important;
}

.popup-footer .nav-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
}

.popup-footer .btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
}

/* 确保按钮文本颜色 */
.btn-text {
  color: white !important;
  font-size: 28rpx;
  font-weight: 600;
}

/* 隐藏高德地图slogan */
:deep(.amap-logo) {
  display: none !important;
}

:deep(.amap-copyright) {
  display: none !important;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .shop-list-container {
    height: 50vh;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 25rpx;
    align-items: stretch;
  }
  
  .stats-section {
    justify-content: space-around;
  }
  
  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
  }
  
  .filter-tab {
    flex: none;
    width: calc(50% - 8rpx);
  }
  
  .action-btn {
    width: 70rpx;
    height: 70rpx;
  }
  
  .action-icon {
    font-size: 28rpx;
  }
  
  .shop-rank {
    width: 100rpx;
    height: 100rpx;
  }
  
  .title-rating-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }
  
  .rating-tag {
    align-self: flex-start;
  }
}

/* 性能优化 */
@media (prefers-reduced-motion: reduce) {
  .decoration-shape {
    animation: none !important;
  }
}
</style>