<template>
  <view class="shop-list" :aria-label="'精选商家列表'">
    
    <view class="head">
      <store-head></store-head>
    </view>

    <!-- 内容区 -->
    <view class="body">
      <scroll-view
        scroll-y 
        class="content" 
        @scrolltolower="loadMore"
        enable-back-to-top
      >
        <!-- 骨架屏 -->
        <view v-if="loading && shopsList.length === 0" class="skeleton">
          <view v-for="i in 5" :key="i" class="skeleton-item">
            <view class="skeleton-img"></view>
            <view class="skeleton-body">
              <view class="skeleton-line w-70"></view>
              <view class="skeleton-line w-90 mt-8"></view>
              <view class="skeleton-line w-60 mt-8"></view>
            </view>
          </view>
        </view>

        <!-- 店铺列表 -->
        <view v-else class="shop-list-content">
          <view 
            class="shop-card" 
            v-for="shop in shopsList" 
            :key="shop._id"
            @click="goShopDetail(shop._id)"
            :aria-label="`进入 ${shop.shopName} 店铺详情`"
          >
            <image 
              class="shop-img fade-in" 
              :src="shop.shopPic || '/static/default-shop.jpg'" 
              mode="widthFix"
              lazy-load
              @error="handleImageError"
            />
            <view class="shop-overlay"></view>
            <view class="shop-content">
              <view class="shop-top">
                <text class="shop-name">{{ shop.shopName }}</text>
                <view class="rating-badge" v-if="shop.rating > 0">
                  <text class="star-icon">★</text>
                  <text class="rating-text">{{ (shop.rating / 10).toFixed(1) }}</text>
                </view>
              </view>
              <view class="shop-meta">
                <view class="meta-item address">
                  <text class="text">{{ shop.address }}</text>
                  <view class="meta-row">
                    <view class="meta-tag sales" v-if="shop.monthlyOrders !== undefined">
                      月售 {{ shop.monthlyOrders }} 单
                    </view>
                    <view class="meta-tag time" v-if="shop.deliveryTime">
                      ⏱️ {{ shop.deliveryTime }}分钟
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="shopsList.length === 0 && !loading" class="empty-state">
            <view class="empty-icon">🏪</view>
            <text class="empty-title">没有找到店铺</text>
            <text class="empty-desc">
              {{ searchKeyword ? `未找到"${searchKeyword}"相关店铺` : '暂无推荐商家' }}
            </text>
            <button class="empty-btn" @click="loadShops(1)">刷新重试</button>
          </view>

          <!-- 加载更多 -->
          <view v-if="shopsList.length > 0" class="load-more">
            <uni-load-more 
              :status="loadingMore ? 'loading' : (hasMore ? 'more' : 'noMore')"
              iconType="auto"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 修复：地图悬浮按钮 -->
    <view class="fab-map" @click="goToMap">
      <view class="map-icon">📍</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const shopsList = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const searchKeyword = ref('');
const hasMore = ref(true);
const currentPage = ref(1);

onMounted(() => {
  loadShops(1);
});

// 跳转到地图页面
function goToMap() {
  console.log('跳转到地图页面');
  uni.navigateTo({
    url: '/pages/showMap/showMap'
  });
}

async function loadShops(page = 1) {
  if (loading.value || loadingMore.value) return;

  if (page === 1) {
    loading.value = true;
    shopsList.value = [];
    hasMore.value = true;
    currentPage.value = 1;
  } else {
    loadingMore.value = true;
  }

  try {
    const res = await uniCloud.callFunction({
      name: 'getShopList',
      data: {
        keyword: searchKeyword.value,
        page: page,
        pageSize: 10
      }
    });

    if (res.result?.errCode === 0) {
      const newData = res.result.data || [];
      
      // 转换数据结构，适配前端显示
      const formattedData = newData.map(shop => ({
        _id: shop.id,  // 使用转换后的id
        shopName: shop.name,
        shopPic: shop.shopPic,
        address: shop.address,
        rating: parseFloat(shop.rating) * 10, // 转回整数格式
        monthlyOrders: shop.monthlySales, // 使用转换后的字段
        businessHours: shop.businessHours,
        description: shop.description,
        phone: shop.phone
      }));
      
      if (page === 1) {
        shopsList.value = formattedData;
      } else {
        shopsList.value.push(...formattedData);
      }

      hasMore.value = newData.length === 10;
      currentPage.value = page;
    } else {
      uni.showToast({ title: res.result?.errMsg || '加载失败', icon: 'none' });
    }
  } catch (e) {
    console.error('加载店铺失败:', e);
    uni.showToast({ title: '网络错误', icon: 'none' });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function loadMore() {
  if (hasMore.value && !loadingMore.value) {
    loadShops(currentPage.value + 1);
  }
}

function clearSearch() {
  searchKeyword.value = '';
  loadShops(1);
}

function handleImageError(e) {
  e.target.src = '/static/default-shop.jpg';
}

function goShopDetail(id) {
  if (!id) return;
  uni.navigateTo({ 
    url: `/pages/shopList/shopDetail?id=${encodeURIComponent(id)}` 
  });
}
</script>

<style lang="scss" scoped>
/* -------------------- 变量区 -------------------- */
$primary: #4F8BFF;
$secondary: #4A6CF7;
$text: #2d3748;
$light-text: #718096;
$radius: 32rpx;
$shadow: 0 8rpx 32rpx rgba(0, 0, 0, .08);
$transition: all .3s cubic-bezier(.4, 0, .2, 1);

/* -------------------- 主结构 -------------------- */
.shop-list {
  min-height: 100vh;
  background: linear-gradient(180deg, #CDE5FF 0%, #E9F3FF 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 头部：毛玻璃 */
.head {
  position: sticky;
  top: 0;
  z-index: 9;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  background: rgba(255, 255, 255, .65);
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, .05);
}

/* 内容区 */
.body {
  flex: 1;
  background-color: rgba(255, 255, 255, .65);
  border-radius: $radius $radius 0 0;
  overflow: hidden;
  margin-top: -16rpx;
}

.content {
  height: 100%;
  background: transparent;
  padding: 24rpx 0rpx 40rpx;
}

/* -------------------- 修复：地图悬浮按钮样式 -------------------- */
.fab-map {
  position: fixed;
  right: 50rpx;
  bottom: 140rpx;
  z-index: 999;
  width: 105rpx;
  height: 105rpx;
  background: linear-gradient(135deg, #4F8BFF 0%, #6AA6FF 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 32rpx rgba(79, 139, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease both;
  
  &:active {
    transform: scale(0.9);
    box-shadow: 0 4rpx 16rpx rgba(79, 139, 255, 0.6);
  }
  
  .map-icon {
    font-size: 32rpx;
    color: white;
    font-weight: 300;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* -------------------- 骨架屏 -------------------- */
.skeleton {
  .skeleton-item {
    background: white;
    border-radius: 24rpx;
    margin: 0 24rpx 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
    
    .skeleton-img {
      width: 100%;
      height: 300rpx;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: wave 1.8s infinite;
    }
    
    .skeleton-body {
      padding: 28rpx;
    }
    
    .skeleton-line {
      height: 26rpx;
      border-radius: 12rpx;
      background: linear-gradient(90deg, #f5f5f5 25%, #eaeaea 50%, #f5f5f5 75%);
      background-size: 200% 100%;
      animation: wave 1.8s infinite;
    }
    
    .w-70 { width: 70%; }
    .w-90 { width: 90%; }
    .w-60 { width: 60%; }
    .mt-8 { margin-top: 8rpx; }
  }
}

@keyframes wave {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* -------------------- 店铺卡片 -------------------- */
.shop-list-content {
  padding: 0 24rpx;
}

.shop-card {
  position: relative;
  background: white;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, .08);
  transition: all .3s cubic-bezier(.4, 0, .2, 1);
  
  &:active {
    transform: scale(.98);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .12);
  }

  .shop-img {
    width: 100%;
    height: auto;
    max-height: 400rpx;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.4s ease;
    
    &.fade-in {
      opacity: 1;
    }
  }

  .shop-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 160rpx;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
    z-index: 1;
  }

  .shop-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 28rpx;
    color: white;
    z-index: 2;
    pointer-events: none;

    .shop-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16rpx;

      .shop-name {
        font-size: 32rpx;
        font-weight: 700;
        max-width: 70%;
        line-height: 1.3;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      }

      .rating-badge {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8rpx);
        padding: 6rpx 14rpx;
        border-radius: 20rpx;
        font-weight: bold;
        font-size: 24rpx;
        
        .star-icon {
          font-size: 20rpx;
          margin-right: 4rpx;
        }
      }
    }

    .shop-meta {
      .address {
        display: flex;
        align-items: flex-start;
        font-size: 24rpx;
        opacity: 0.9;
        
        .text {
          flex: 1;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .meta-row {
        display: flex;
        gap: 16rpx;
        flex-wrap: wrap;
      }

      .meta-tag {
        font-size: 20rpx;
        background: rgba(255, 255, 255, 0.15);
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        backdrop-filter: blur(4rpx);
        white-space: nowrap;
        
        &.sales { color: #FFD700; }
        &.time { color: #4ade80; }
      }
    }
  }
}

/* -------------------- 空状态 -------------------- */
.empty-state {
  text-align: center;
  padding: 140rpx 40rpx 100rpx;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 34rpx;
    font-weight: 700;
    color: $text;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: $light-text;
    margin-bottom: 40rpx;
    line-height: 1.5;
  }
  
  .empty-btn {
    background: linear-gradient(135deg, $primary, #6AA6FF);
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 18rpx 60rpx;
    font-size: 28rpx;
    box-shadow: 0 8rpx 20rpx rgba($primary, 0.4);
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.96);
    }
  }
}

/* -------------------- 加载更多 -------------------- */
.load-more {
  padding: 40rpx 0;
  text-align: center;
  
  ::v-deep .uni-load-more__text {
    font-size: 26rpx;
    color: #8B9AB6;
  }
}

/* -------------------- 动画效果 -------------------- */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes titleGlow {
  from { text-shadow: 0 0 10rpx rgba($primary, 0.3); }
  to { text-shadow: 0 0 20rpx rgba($secondary, 0.5), 0 0 30rpx rgba($primary, 0.4); }
}

/* -------------------- 搜索框 -------------------- */
.search-box {
  padding: 0 30rpx 40rpx;
  
  ::v-deep .uni-searchbar {
    height: 88rpx;
    
    .uni-searchbar__input-box {
      background: white !important;
      border-radius: 50rpx !important;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
      padding: 0 36rpx !important;
      
      input {
        font-size: 28rpx;
        color: $text;
      }
    }
  }
}
</style>