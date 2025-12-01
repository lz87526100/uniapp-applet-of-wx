<template>
  <view class="favorites-page">
    <!-- 收藏列表 -->
    <view class="favorites-content">
      <!-- 收藏统计 -->
      <!-- <view v-if="favoritesList.length > 0" class="favorites-stats">
        <text class="stats-text">共收藏 {{ favoritesList.length }} 家店铺</text>
      </view> -->

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载收藏...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="favoritesList.length === 0" class="empty-state">
        <view class="empty-illustration">
          <view class="empty-icon">❤️</view>
          <view class="empty-circle"></view>
        </view>
        <text class="empty-title">暂无收藏</text>
        <text class="empty-desc">您还没有收藏任何店铺</text>
        <button class="go-shop-btn" @click="goToShopList">
          <text class="btn-text">去发现店铺</text>
          <text class="btn-icon">→</text>
        </button>
      </view>

      <!-- 收藏列表 -->
      <view v-else class="favorites-list">
        <view 
          class="favorite-item" 
          v-for="(item, index) in favoritesList" 
          :key="item.favoriteId"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="goToShopDetail(item.shopInfo._id)"
        >
          <!-- 店铺图片 -->
          <view class="shop-image-container">
            <image 
              class="shop-image" 
              :src="item.shopInfo.shopPic || '/static/default-shop.jpg'" 
              mode="aspectFill"
              @error="handleImageError"
            />
            <view class="shop-overlay">
              <view class="favorite-tag">
                <text class="favorite-icon">❤</text>
                <text class="favorite-text">已收藏</text>
              </view>
              <view class="business-status-tag" :class="{ open: isShopOpen(item.shopInfo), closed: !isShopOpen(item.shopInfo) }">
                {{ isShopOpen(item.shopInfo) ? '营业中' : '已打烊' }}
              </view>
            </view>
          </view>

          <!-- 店铺信息 -->
          <view class="shop-info">
            <!-- 店铺名称和认证 -->
            <view class="shop-header">
              <view class="shop-name-wrapper">
                <text class="shop-name">{{ item.shopInfo.shopName }}</text>
                <view class="verified-badge" v-if="item.shopInfo.isVerified">
                  <text class="verified-icon">✓</text>
                </view>
              </view>
              <!-- 底部固定区域 -->
              <view class="bottom-fixed-area">
                <!-- 右下角固定区域 -->
                <view class="right-bottom-area">
                  <!-- 评分 -->
                  <view class="rating-wrapper">
                    <view class="rating-stars">
                      <text class="star filled">★</text>
                      <text class="star filled">★</text>
                      <text class="star filled">★</text>
                      <text class="star filled">★</text>
                      <text class="star" :class="{ 'half-filled': (item.shopInfo.rating || 0) % 2 !== 0 }">★</text>
                    </view>
                    <text class="rating-value">{{ ((item.shopInfo.rating || 0) / 10).toFixed(1) }}</text>
                  </view>
                  <!-- 取消收藏按钮 -->
                  <view class="cancel-favorite-btn" @click.stop="cancelFavorite(item)">
                    <text class="cancel-icon">❤️</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more-section">
          <view class="load-more" v-if="hasMore" @click="loadMore">
            <text class="load-more-text">加载更多</text>
            <view class="load-more-spinner" v-if="loading"></view>
          </view>
          <view class="no-more" v-else>
            <view class="no-more-line"></view>
            <text class="no-more-text">已经到底了</text>
            <view class="no-more-line"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 浮动地图按钮 -->
    <view class="floating-map-btn" v-if="favoritesList.length > 0" @click="goToFavoritesMap">
      <view class="floating-btn-content">
        <text class="floating-map-icon">🗺️</text>
        <text class="floating-btn-text">地图查看</text>
      </view>
      <view class="pulse-effect"></view>
    </view>

    <!-- 操作确认弹窗 -->
    <uni-popup ref="confirmPopup" type="dialog">
      <uni-popup-dialog 
        type="warn" 
        title="取消收藏" 
        content="确定要取消收藏该店铺吗？" 
        :before-close="true" 
        @close="handleCancelClose" 
        @confirm="handleCancelConfirm"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

// 响应式数据
const favoritesList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);

// 用户相关
const isLoggedIn = ref(false);
const userId = ref('');
const currentUser = ref(null);

// 弹窗相关
const confirmPopup = ref(null);
const currentCancelItem = ref(null);

// 生命周期
onLoad(() => {
  console.log('🔄 收藏页面加载');
  checkLoginStatus();
});

onShow(() => {
  console.log('🔄 收藏页面显示');
  checkLoginStatus();
});

// 跳转到收藏店铺地图页面
function goToFavoritesMap() {
  if (favoritesList.value.length === 0) {
    uni.showToast({
      title: '暂无收藏店铺',
      icon: 'none'
    });
    return;
  }

  // 传递收藏店铺数据到地图页面
  const shopsData = favoritesList.value.map(item => ({
    id: item.shopInfo._id,
    name: item.shopInfo.shopName,
    address: item.shopInfo.address,
    latitude: item.shopInfo.latitude || 39.90923, // 默认北京坐标
    longitude: item.shopInfo.longitude || 116.397428,
    shopPic: item.shopInfo.shopPic,
    rating: item.shopInfo.rating,
    deliveryFee: item.shopInfo.deliveryFee,
    isVerified: item.shopInfo.isVerified,
    businessHours: item.shopInfo.businessHours
  }));

  uni.navigateTo({
    url: `/pages/showMap/showFavoritesMap?shops=${encodeURIComponent(JSON.stringify(shopsData))}`
  });
}

// 检查登录状态
async function checkLoginStatus() {
  try {
    console.log('🔍 开始检查登录状态...');
    
    const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo');
    const token = uni.getStorageSync('uni_id_token');
    
    console.log('📦 存储检查结果:', {
      hasToken: !!token,
      hasUserInfo: !!userInfoFromStorage,
      userInfo: userInfoFromStorage
    });
    
    if (token && userInfoFromStorage && userInfoFromStorage._id) {
      isLoggedIn.value = true;
      userId.value = userInfoFromStorage._id;
      currentUser.value = userInfoFromStorage;
      
      console.log('✅ 用户已登录:', {
        userId: userId.value,
        userInfo: currentUser.value
      });
      
      await loadFavorites(true);
      return;
    }
    
    const oldUserInfo = uni.getStorageSync('uni_id_userinfo');
    if (token && oldUserInfo && oldUserInfo._id) {
      isLoggedIn.value = true;
      userId.value = oldUserInfo._id;
      currentUser.value = oldUserInfo;
      
      console.log('✅ 从旧存储键名获取用户信息成功');
      
      uni.setStorageSync('uni-id-pages-userInfo', oldUserInfo);
      await loadFavorites(true);
      return;
    }
    
    isLoggedIn.value = false;
    userId.value = '';
    currentUser.value = null;
    favoritesList.value = [];
    
    console.log('❌ 用户未登录或信息不完整');
    showLoginPrompt();
    
  } catch (error) {
    console.error('❌ 检查登录状态失败:', error);
    isLoggedIn.value = false;
    userId.value = '';
    currentUser.value = null;
    favoritesList.value = [];
    
    showLoginPrompt();
  }
}

// 显示登录提示
function showLoginPrompt() {
  uni.showModal({
    title: '提示',
    content: '请先登录查看收藏',
    confirmText: '去登录',
    cancelText: '返回',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      } else {
        uni.navigateBack();
      }
    }
  });
}

// 加载收藏列表
async function loadFavorites(reset = false) {
  if (loading.value) return;
  
  if (!isLoggedIn.value || !userId.value) {
    console.log('❌ 加载收藏前检查: 用户未登录');
    showLoginPrompt();
    return;
  }
  
  if (reset) {
    currentPage.value = 1;
    favoritesList.value = [];
    hasMore.value = true;
  }
  
  if (!hasMore.value && !reset) return;
  
  loading.value = true;
  
  try {
    console.log('🔄 开始加载收藏列表...', {
      userId: userId.value,
      page: currentPage.value,
      size: pageSize.value
    });
    
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    
    const res = await articlesCo.getShopFavoritesList({
      page: currentPage.value,
      size: pageSize.value,
      userId: userId.value
    });
    
    console.log('📋 收藏列表响应:', res);
    
    if (res.errCode === 0) {
      const newList = res.data.list || [];
      
      if (reset) {
        favoritesList.value = newList;
      } else {
        favoritesList.value = [...favoritesList.value, ...newList];
      }
      
      hasMore.value = res.data.hasMore || false;
      currentPage.value += 1;
      
      console.log('✅ 收藏列表加载成功，数量:', favoritesList.value.length);
    } else if (res.errCode === 1001) {
      console.log('❌ 云函数返回未登录状态');
      handleNotLogin();
    } else {
      throw new Error(res.errMsg);
    }
  } catch (error) {
    console.error('❌ 加载收藏列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
    
    if (error.message && error.message.includes('未登录')) {
      handleNotLogin();
    }
  } finally {
    loading.value = false;
  }
}

// 处理未登录状态
function handleNotLogin() {
  console.log('🔄 处理未登录状态');
  
  isLoggedIn.value = false;
  userId.value = '';
  currentUser.value = null;
  favoritesList.value = [];
  
  uni.removeStorageSync('uni_id_token');
  uni.removeStorageSync('uni-id-pages-userInfo');
  uni.removeStorageSync('uni_id_token_expired');
  
  showLoginPrompt();
}

// 取消收藏
function cancelFavorite(item) {
  if (!isLoggedIn.value || !userId.value) {
    showLoginPrompt();
    return;
  }
  
  currentCancelItem.value = item;
  confirmPopup.value.open();
}

// 处理取消收藏确认
async function handleCancelConfirm() {
  if (!currentCancelItem.value) return;
  
  if (!isLoggedIn.value || !userId.value) {
    showLoginPrompt();
    return;
  }
  
  try {
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    
    const res = await articlesCo.toggleShopFavorite({
      shopId: currentCancelItem.value.shopInfo._id,
      userId: userId.value
    });
    
    console.log('📡 取消收藏响应:', res);
    
    if (res.errCode === 0) {
      const index = favoritesList.value.findIndex(
        item => item.favoriteId === currentCancelItem.value.favoriteId
      );
      
      if (index !== -1) {
        favoritesList.value.splice(index, 1);
      }
      
      uni.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else if (res.errCode === 1001) {
      handleNotLogin();
    } else {
      throw new Error(res.errMsg);
    }
  } catch (error) {
    console.error('❌ 取消收藏失败:', error);
    uni.showToast({
      title: '取消收藏失败',
      icon: 'none'
    });
  } finally {
    currentCancelItem.value = null;
    confirmPopup.value.close();
  }
}

// 其他方法
function loadMore() {
  if (!hasMore.value || loading.value) return;
  loadFavorites();
}

function handleCancelClose() {
  currentCancelItem.value = null;
  confirmPopup.value.close();
}

function isShopOpen(shopInfo) {
  if (!shopInfo?.businessHours) return true;
  
  const hoursStr = shopInfo.businessHours;
  const [start, end] = hoursStr.split('-');
  
  if (!start || !end) return true;
  
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHours * 60 + currentMinutes;
  
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  
  const startTime = startHours * 60 + (startMinutes || 0);
  const endTime = endHours * 60 + (endMinutes || 0);
  
  return currentTime >= startTime && currentTime <= endTime;
}

function goToShopDetail(shopId) {
  uni.navigateTo({
    url: `/pages/shopList/shopDetail?id=${shopId}`
  });
}

function goToShopList() {
  uni.switchTab({
    url: '/pages/shopList/shopList'
  });
}

function handleImageError(e) {
  console.log('图片加载失败:', e);
  e.target.src = '/static/default-shop.jpg';
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$secondary: #4A6CF7;
$accent: #FF9F43;
$text: #2d3748;
$light-text: #718096;
$border-color: #e2e8f0;
$bg-color: #f8fafc;
$card-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);

.favorites-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
}

/* 主要内容 */
.favorites-content {
  padding: 30rpx;
}

/* 收藏统计 */
.favorites-stats {
  margin-bottom: 30rpx;
  padding: 20rpx 0;
  
  .stats-text {
    font-size: 26rpx;
    color: $light-text;
    font-weight: 500;
  }
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #e2e8f0;
    border-top: 4rpx solid $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 24rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: $light-text;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 160rpx 40rpx;
  
  .empty-illustration {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    margin: 0 auto 40rpx;
    
    .empty-icon {
      font-size: 100rpx;
      position: relative;
      z-index: 2;
      animation: float 3s ease-in-out infinite;
    }
    
    .empty-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 160rpx;
      height: 160rpx;
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 159, 67, 0.1) 100%);
      border-radius: 50%;
      z-index: 1;
    }
  }
  
  .empty-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $text;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: $light-text;
    margin-bottom: 60rpx;
    display: block;
  }
  
  .go-shop-btn {
    background: linear-gradient(135deg, $primary 0%, $accent 100%);
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 24rpx 60rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.3);
    }
    
    .btn-text {
      font-weight: 600;
    }
    
    .btn-icon {
      font-size: 24rpx;
      transition: transform 0.3s ease;
    }
    
    &:active .btn-icon {
      transform: translateX(4rpx);
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* 收藏列表 */
.favorites-list {
  .favorite-item {
    background: white;
    border-radius: 24rpx;
    margin-bottom: 30rpx;
    box-shadow: $card-shadow;
    overflow: hidden;
    animation: slideUp 0.5s ease both;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
    }
    
    /* 店铺图片容器 */
    .shop-image-container {
      position: relative;
      height: 320rpx;
      
      .shop-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .shop-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24rpx;
        
        .favorite-tag {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20rpx;
          padding: 8rpx 16rpx;
          display: flex;
          align-items: center;
          gap: 6rpx;
          backdrop-filter: blur(10rpx);
          
          .favorite-icon {
            font-size: 20rpx;
            color: $primary;
          }
          
          .favorite-text {
            font-size: 22rpx;
            color: $text;
            font-weight: 600;
          }
        }
        
        .business-status-tag {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20rpx;
          padding: 8rpx 16rpx;
          font-size: 22rpx;
          font-weight: 600;
          backdrop-filter: blur(10rpx);
          
          &.open {
            color: #059669;
          }
          
          &.closed {
            color: #dc2626;
          }
        }
      }
    }
    
    /* 店铺信息 */
    .shop-info {
      padding: 24rpx;
      
      .shop-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        
        .shop-name-wrapper {
          display: flex;
          align-items: center;
          gap: 12rpx;
          flex: 1;
          
          .shop-name {
            padding-top: 8rpx;
            font-size: 38rpx;
            font-weight: 700;
            color: $text;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .verified-badge {
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: white;
            width: 36rpx;
            height: 36rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            .verified-icon {
              font-size: 20rpx;
              font-weight: bold;
            }
          }
        }
      }
      
      /* 底部固定区域 */
      .bottom-fixed-area {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16rpx;
        
        .address-container {
          flex: 1;
          min-width: 0;
          
          .address-text {
            font-size: 24rpx;
            color: $light-text;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }
        }
        
        /* 右下角固定区域 */
        .right-bottom-area {
          display: flex;
          align-items: center;
          gap: 16rpx;
          flex-shrink: 0;
          
          /* 评分 */
          .rating-wrapper {
            display: flex;
            align-items: center;
            gap: 8rpx;
            
            .rating-stars {
              display: flex;
              gap: 2rpx;
              
              .star {
                font-size: 20rpx;
                color: #e2e8f0;
                
                &.filled {
                  color: #ffd700;
                }
                
                &.half-filled {
                  background: linear-gradient(90deg, #ffd700 50%, #e2e8f0 50%);
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                }
              }
            }
            
            .rating-value {
              font-size: 20rpx;
              font-weight: 600;
              color: #f6ad55;
            }
          }
          
          /* 取消收藏按钮 */
          .cancel-favorite-btn {
            background: #f8fafc;
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
            
            &:active {
              background: #e2e8f0;
              transform: scale(0.9);
            }
            
            .cancel-icon {
              font-size: 22rpx;
            }
          }
        }
      }
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 加载更多 */
  .load-more-section {
    padding: 40rpx 0;
    
    .load-more {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16rpx;
      padding: 24rpx;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      
      &:active {
        background: #f8fafc;
      }
      
      .load-more-text {
        font-size: 28rpx;
        color: $primary;
        font-weight: 600;
      }
      
      .load-more-spinner {
        width: 32rpx;
        height: 32rpx;
        border: 2rpx solid #e2e8f0;
        border-top: 2rpx solid $primary;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
    
    .no-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24rpx;
      
      .no-more-line {
        flex: 1;
        height: 1rpx;
        background: linear-gradient(90deg, transparent 0%, $border-color 50%, transparent 100%);
      }
      
      .no-more-text {
        font-size: 26rpx;
        color: $light-text;
        flex-shrink: 0;
      }
    }
  }
}

/* 浮动地图按钮 */
.floating-map-btn {
  position: fixed;
  right: 30rpx;
  bottom: 60rpx;
  z-index: 100;

  .floating-btn-content {
    position: relative;
    z-index: 2;
    background: linear-gradient(135deg, #FF6B35, #FF8E53);
    border-radius: 50rpx;
    padding: 20rpx 32rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.4);
    transition: all 0.3s ease;
    

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.6);
    }
    
    .floating-map-icon {
      font-size: 36rpx;
    }
    
    .floating-btn-text {
      font-size: 26rpx;
      font-weight: 600;
      color: white;
    }

  }

  .pulse-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #FF6B35, #FF8E53);
    border-radius: 50rpx;
    animation: pulse 2s infinite;
    z-index: 1;
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.8;
    }
    70% {
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }
}

/* 响应式调整 */
@media (max-width: 375px) {
  .favorites-content {
    padding: 20rpx;
  }
  
  .favorite-item {
    .shop-info {
      padding: 24rpx;
    }
    
    .bottom-fixed-area {
      .right-bottom-area {
        gap: 12rpx;
        
        .rating-wrapper {
          gap: 6rpx;
          
          .rating-stars {
            .star {
              font-size: 18rpx;
            }
          }
          
          .rating-value {
            font-size: 18rpx;
          }
        }
        
        .cancel-favorite-btn {
          width: 44rpx;
          height: 44rpx;
          
          .cancel-icon {
            font-size: 20rpx;
          }
        }
      }
    }
  }

  .floating-map-btn {
    right: 20rpx;
    bottom: 100rpx;
    

    .floating-btn-content {
      padding: 16rpx 24rpx;
      
      .floating-map-icon {
        font-size: 32rpx;
      }
      
      .floating-btn-text {
        font-size: 24rpx;
      }
    }

  }
}
</style>