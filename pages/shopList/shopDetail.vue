<template>
   
  <view class="shop-detail" v-if="shopInfo">
    <!-- 导航栏 - 置顶显示 -->
    <!-- #ifdef MP-WEIXIN -->
     <view class="navBar" :style="{ height: getTitleBarHeight() + 'px' }"></view>
    <!-- #endif -->
    
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="nav-title">{{ shopInfo.shopName }}</view>
      <view class="nav-right">
          <!-- #ifdef H5 -->
        <text class="share-icon" @click="shareShop">分享</text>
        <!-- #endif -->
      </view>
    </view>

    <!-- 头部背景图 - 完整展示 -->
    <view class="header-bg">
      <image class="bg-image" 
        :src="shopInfo.shopPic || '/static/default-shop.jpg'" 
        mode="widthFix"  
        lazy-load
        @error="handleImageError"
      />
      <view class="bg-overlay"></view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 店铺基本信息卡片 - 美化版 -->
      <view class="shop-info-card">
        <!-- 店铺头部信息 - 美化版 -->
        <view class="shop-header">
          <!-- 店铺Logo容器 -->
          <view class="logo-container">
            <image 
              class="shop-logo" 
              :src="shopInfo.shopPic || '/static/default-shop.jpg'"
              mode="aspectFill"
              @error="handleImageError"
            />
          </view>

          <!-- 店铺核心信息 -->
          <view class="shop-core-info">
            <!-- 店铺名称和评分 -->
            <view class="title-section">
              <view class="shop-name-container">
                <text class="shop-name">{{ shopInfo.shopName }}</text>
                <view class="verified-badge" v-if="shopInfo.isVerified">
                  <text class="verified-icon">✓</text>
                  <text class="verified-text">认证</text>
                </view>
              </view>
              
              <view class="rating-display" v-if="shopInfo.rating > 0">
                <view class="rating-stars">
                  <text class="star filled">★</text>
                  <text class="star filled">★</text>
                  <text class="star filled">★</text>
                  <text class="star filled">★</text>
                  <text class="star" :class="{ 'half-filled': shopInfo.rating % 2 !== 0 }">★</text>
                </view>
                <text class="rating-value">{{ (shopInfo.rating / 10).toFixed(1) }}</text>
              </view>
            </view>

            <!-- 店铺标签和状态 -->
            <view class="tags-status-section">
              <view class="tags-container">
                <view class="status-tag" :class="{ open: isOpen, closed: !isOpen }">
                  <text class="status-icon">{{ isOpen ? '🟢' : '🔴' }}</text>
                  <text class="status-text">{{ shopInfo.businessHours || (isOpen ? '营业中' : '已打烊') }}</text>
                </view>
              </view>
              
              <!-- 评论和电话按钮 - 并列显示 -->
              <view class="action-buttons">
                <view class="favorite-btn" @click="toggleFavorite">
                  <view class="favorite-badge">
                    <text class="favorite-icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
                  </view>
                </view>
                <!-- 评论按钮 -->
                <view class="comment-btn" @click="showContact">
                  <text class="btn-icon">💬</text>
                </view>
                <!-- 拨打电话按钮 -->
                <view class="phone-btn" @click="handlePhoneCall" v-if="shopInfo.phone">
                  <text class="btn-icon">📞</text>
                </view>
              </view>
            </view>

            <!-- 核心数据指标 -->
            <view class="metrics-section">
              <view class="metric-item highlight">
                <text class="metric-value">{{ formatNumber(shopInfo.monthlyOrders || 0) }}</text>
                <text class="metric-label">月售</text>
              </view>
              <view class="metric-divider"></view>
              <view class="metric-item">
                <text class="metric-value">{{ shopInfo.deliveryTime || '30-40' }}</text>
                <text class="metric-label">分钟</text>
              </view>
              <view class="metric-divider"></view>
              <view class="metric-item">
                <text class="metric-value">{{ (shopInfo.deliveryFee || 0) === 0 ? '免费' : `¥${shopInfo.deliveryFee}` }}</text>
                <text class="metric-label">配送</text>
              </view>
            </view>
          </view>
        </view>

 <!-- 店铺介绍 -->
 <view class="info-section" v-if="shopInfo.description">
   <view class="section-header">
     <text class="section-icon">📝</text>
     <text class="section-title">店铺介绍</text>
   </view>
   <text class="shop-description">{{ shopInfo.description }}</text>
 </view>

        <!-- 合并的店铺位置和地址信息 -->
        <view class="info-section location-address-section">
          <view class="section-header">
            <text class="section-icon">📍</text>
            <text class="section-title">店铺位置</text>
          </view>
          
          <!-- 地图容器 -->
          <view class="map-container">
            <map 
              id="shopDetailMap"
              :latitude="mapCenter.latitude"
              :longitude="mapCenter.longitude"
              :markers="mapMarkers"
              :scale="mapScale"
              show-location
              class="map"
              enable-zoom
              enable-scroll
              enable-rotate
            >
              <!-- 地图覆盖层，点击提示 -->
              <view class="map-overlay" @click="openMapWithRoute">
                <text class="overlay-text">点击查看导航路线</text>
              </view>
            </map>
            
            <!-- 导航按钮 -->
            <view class="navigation-btn" @click="openMapWithRoute">
              <text class="nav-icon">🚗</text>
              <text class="nav-text">导航</text>
            </view>
          </view>
          
          <!-- 地址信息 -->
          <view class="address-content">
            <view class="address-header">
              <text class="address-icon">🏠</text>
              <text class="address-title">详细地址</text>
            </view>
            <text class="address-text">{{ shopInfo.address }}</text>
          </view>

          <!-- 无位置信息的提示 -->
          <view class="no-location" v-if="!shopInfo.location || !shopInfo.location.coordinates">
            <text class="no-location-icon">🗺️</text>
            <text class="no-location-text">暂无位置信息</text>
          </view>
        </view>

 
      </view>

      <!-- 菜单/商品区域 -->
      <view class="menu-section" v-if="hasMenu">
        <view class="section-title">美食推荐</view>
        <view class="menu-categories">
          <scroll-view scroll-x class="category-scroll">
            <view class="category-list">
              <view 
                class="category-item" 
                v-for="category in menuCategories" 
                :key="category.id"
                :class="{ active: activeCategory === category.id }"
                @click="switchCategory(category.id)"
              >
                <text class="category-name">{{ category.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 商品列表 -->
        <view class="product-list">
          <view class="product-item" v-for="product in currentProducts" :key="product.id">
            <image class="product-image" :src="product.image" mode="aspectFill" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-desc">{{ product.description }}</text>
              <view class="product-bottom">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-sales">月售{{ product.sales }}</text>
              </view>
            </view>
            <view class="view-detail-btn" @click="viewProductDetail(product)">
              <text class="view-text">查看</text>
            </view>
          </view>
        </view>
        
        <view class="empty-menu" v-if="currentProducts.length === 0">
          <text class="empty-text">该分类下暂无美食</text>
        </view>
      </view>

      <!-- 评论区域 -->
      <view class="reviews-section">
        <view class="section-header">
          <text class="section-title">用户评价</text>
            <text class="see-all" @click="goToShopComments" v-if="hasReviews">
              查看全部({{ reviewsTotal }})
            </text>
        </view>
        
        <!-- 评论列表 -->
        <view class="reviews-list" v-if="hasReviews">
          <view 
            class="review-item" 
            v-for="review in displayReviews" 
            :key="review.id"
            @click="goToReviewDetail(review)"
          >
            <!-- 用户信息 -->
            <view class="review-user">
              <image class="user-avatar" :src="review.avatar" mode="aspectFill" 
                @error="handleAvatarError"
                @load="onAvatarLoad(review.userId, review.avatar)" />
              <view class="user-info">
                <text class="user-name">{{ review.userName }}</text>
                <view class="review-meta">
                  <view class="rating-stars small">
                    <text 
                      class="star" 
                      v-for="n in 5" 
                      :key="n"
                      :class="{ filled: n <= review.rating }"
                    >★</text>
                  </view>
                  <text class="review-time">{{ review.time }}</text>
                </view>
              </view>
            </view>
            
            <!-- 评论内容 -->
            <view class="review-content">
              <text class="review-text">{{ review.content }}</text>
            </view>
            
            <!-- 评论图片 -->
            <view class="review-images" v-if="review.images && review.images.length > 0">
              <scroll-view scroll-x class="images-scroll">
                <view class="images-list">
                  <image 
                    class="review-image" 
                    v-for="(img, index) in review.images" 
                    :key="index"
                    :src="getSafeImageUrl(img)" 
                    mode="aspectFill"
                    @click.stop="previewImage(review.images, index)"
                    @error="handleImageError"
                  />
                </view>
              </scroll-view>
            </view>
          </view>
          
          <!-- 加载更多 -->
          <view class="load-more" v-if="displayReviews.length < reviewsTotal" @click="viewAllReviews">
            <text class="load-more-text">查看全部{{ reviewsTotal }}条评价</text>
            <text class="load-more-icon">→</text>
          </view>
        </view>   
        
        <!-- 无评论状态 -->
        <view class="empty-reviews" v-else>
          <text class="empty-icon">💬</text>
          <text class="empty-text">暂无评价</text>
          <text class="empty-desc">成为第一个评论的人吧</text>
        </view>
        
        <!-- 评论加载状态 -->
        <view class="reviews-loading" v-if="reviewsLoading">
          <uni-load-more status="loading" content="加载评价中..." />
        </view>
      </view>
    </view>

    <!-- 底部固定评论框 -->
    <view class="fixed-comment-bar" :class="{ 'with-safe-area': hasSafeArea }">
      <view class="comment-input-wrapper" @click="goToCommentEdit">
        <view class="comment-input-placeholder">
          <text class="placeholder-icon">💬</text>
          <text class="placeholder-text">分享您的用餐体验...</text>
        </view>
        <view class="comment-btn">
          <text class="btn-text">评论</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <uni-load-more status="loading" content="加载中..." />
      </view>
    </view>
  </view>

  <!-- 错误状态 -->
  <view v-else-if="error" class="error-state">
    <view class="error-icon">😔</view>
    <text class="error-title">加载失败</text>
    <text class="error-desc">{{ error }}</text>
    <button class="retry-btn" @click="loadShopDetail(shopId)">重试</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
// #ifdef MP-WEIXIN
import { getStatusBarHeight, getTitleBarHeight } from "@/utils/system.js"
// #endif

// #ifdef H5
// H5平台不需要这些方法
const getTitleBarHeight = () => 0
// #endif

// 响应式数据
const shopInfo = ref(null);
const loading = ref(false);
const error = ref('');
const isFavorite = ref(false);
const hasMenu = ref(true);
const shopId = ref('');
const activeCategory = ref(1);
const hasSafeArea = ref(false);

// 用户相关数据
const currentUser = ref(null);
const userId = ref('');
const isLoggedIn = ref(false);

// 评论相关数据
const reviews = ref([]);
const reviewsLoading = ref(false);
const reviewsPage = ref(1);
const reviewsSize = ref(10);
const reviewsTotal = ref(0);
const hasMoreReviews = ref(true);

// 地图相关数据
const mapCenter = reactive({
  latitude: 25.034161,
  longitude: 118.482187,
});
const mapScale = ref(16);
const mapMarkers = ref([]);
const mapContext = ref(null);

// 用户头像缓存
const userAvatarCache = ref(new Map());
const MAX_CACHE_SIZE = 30;

// 菜单模拟数据
const menuCategories = ref([
  { id: 1, name: '热销推荐' },
  { id: 2, name: '主食' },
  { id: 3, name: '小吃' },
  { id: 4, name: '饮料' },
  { id: 5, name: '套餐' }
]);

const products = ref([
  {
    id: 1,
    categoryId: 1,
    name: '招牌牛肉面',
    description: '精选优质牛肉，汤底鲜美',
    price: 28,
    sales: 156,
    image: '/static/food1.jpg'
  },
  {
    id: 2,
    categoryId: 1,
    name: '特色炸鸡',
    description: '外酥里嫩，香脆可口',
    price: 22,
    sales: 89,
    image: '/static/food2.jpg'
  }
]);

// 跳转到店铺评论页面
function goToShopComments() {
  if (!shopInfo.value) {
    uni.showToast({ title: '店铺信息不存在', icon: 'none' });
    return;
  }
  
  const shopId = shopInfo.value._id;
  const shopName = shopInfo.value.shopName || '';
  
  console.log('🔄 跳转到店铺评论页面:', {
    shopId: shopId,
    shopName: shopName
  });
  
  uni.navigateTo({
    url: `/pages/shopList/shopComments?shopId=${shopId}&shopName=${encodeURIComponent(shopName)}`,
    fail: (err) => {
      console.error('❌ 跳转到评论页面失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
}

// 计算属性
const isOpen = computed(() => {
  if (!shopInfo.value?.businessHours) return true;
  
  const hoursStr = shopInfo.value.businessHours;
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
});

const currentProducts = computed(() => {
  return products.value.filter(product => product.categoryId === activeCategory.value);
});

const displayReviews = computed(() => {
  return reviews.value.slice(0, 3);
});

const hasReviews = computed(() => {
  return reviews.value.length > 0;
});

// 生命周期
onLoad((options) => {
  if (options.id) {
    shopId.value = options.id;
    loadShopDetail(options.id);
  } else {
    error.value = '店铺ID不存在';
  }
  
  // 获取当前用户信息
  getCurrentUser();
  
  // 检测安全区域
  checkSafeArea();
});

onShow(() => {
  if (shopInfo.value?.location?.coordinates) {
    setTimeout(() => {
      initMapMarkers();
    }, 100);
  }
  
  // 页面显示时重新获取用户状态
  getCurrentUser();
});

// 检测安全区域
function checkSafeArea() {
  try {
    const systemInfo = uni.getSystemInfoSync();
    hasSafeArea.value = systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom > 0;
    console.log('📱 安全区域检测:', hasSafeArea.value, systemInfo.safeAreaInsets);
  } catch (error) {
    console.error('检测安全区域失败:', error);
    hasSafeArea.value = false;
  }
}

// 跳转到评论编辑页面
function goToCommentEdit() {
  if (!shopInfo.value) {
    uni.showToast({
      title: '店铺信息不存在',
      icon: 'none'
    });
    return;
  }
  
  // 检查登录状态
  if (!checkLogin()) {
    return;
  }
  
  const shopId = shopInfo.value._id;
  const url = `/pages/blog/edit?shopId=${shopId}`;
  
  console.log('🔄 跳转到评论编辑页面:', url);
  
  uni.navigateTo({
    url: url,
    fail: (err) => {
      console.error('❌ 跳转失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
}

// 获取当前登录用户信息
async function getCurrentUser() {
  try {
    console.log('🔄 开始获取当前用户信息...');
    
    // 方法1: 使用 blogList 页面的存储键名
    const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo');
    const token = uni.getStorageSync('uni_id_token');
    
    console.log('🔍 检查本地存储:', {
      hasToken: !!token,
      hasUserInfo: !!userInfoFromStorage,
      userInfo: userInfoFromStorage
    });
    
    if (token && userInfoFromStorage && userInfoFromStorage._id) {
      currentUser.value = userInfoFromStorage;
      userId.value = userInfoFromStorage._id;
      isLoggedIn.value = true;
      
      console.log('✅ 从本地存储获取用户信息成功:', {
        userId: userId.value,
        userInfo: currentUser.value
      });
      
      return;
    }
    
    // 方法2: 尝试使用旧的存储键名作为备选
    const oldUserInfo = uni.getStorageSync('uni_id_userinfo');
    if (token && oldUserInfo && oldUserInfo._id) {
      currentUser.value = oldUserInfo;
      userId.value = oldUserInfo._id;
      isLoggedIn.value = true;
      
      console.log('✅ 从旧存储键名获取用户信息成功:', {
        userId: userId.value,
        userInfo: currentUser.value
      });
      
      // 同步到新的存储键名
      uni.setStorageSync('uni-id-pages-userInfo', oldUserInfo);
      
      return;
    }
    
    // 如果都没有，标记为未登录
    isLoggedIn.value = false;
    userId.value = '';
    currentUser.value = null;
    console.log('❌ 用户未登录或信息不完整');
    
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    isLoggedIn.value = false;
    userId.value = '';
    currentUser.value = null;
  }
}

// 检查用户登录状态
function checkLogin() {
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再执行此操作',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return false;
  }
  return true;
}

// 核心方法
async function loadShopDetail(id) {
  loading.value = true;
  error.value = '';

  try {
    console.log('🔄 开始加载店铺详情，ID:', id);
    
    const res = await uniCloud.callFunction({
      name: 'getShopDetail',
      data: { shopId: id }
    });

    console.log('📡 店铺详情响应:', res);

    if (res.result?.errCode === 0) {
      shopInfo.value = res.result.data;
      console.log('✅ 店铺信息:', shopInfo.value);
      
      initMapMarkers();
      
      // 异步检查收藏状态
      if (isLoggedIn.value) {
        await checkFavoriteStatus(id);
      } else {
        isFavorite.value = false;
      }
      
      // 加载评论
      console.log('🔄 开始加载评论...');
      await loadShopReviews(true);
    } else {
      error.value = res.result?.errMsg || '加载失败';
      console.error('❌ 店铺详情加载失败:', error.value);
      useTestData(id);
    }
  } catch (e) {
    console.error('❌ 加载店铺详情异常:', e);
    error.value = '网络错误，请重试';
    useTestData(id);
  } finally {
    loading.value = false;
  }
}

// 收藏功能 - 修复登录检查
async function toggleFavorite() {
  if (!shopInfo.value) return;
  
  // 检查登录状态 - 使用更严格的检查
  if (!isLoggedIn.value || !userId.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再执行收藏操作',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }
  
  console.log('🔄 用户收藏操作:', {
    userId: userId.value,
    shopId: shopInfo.value._id,
    currentStatus: isFavorite.value
  });
  
  try {
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    
    // 直接传递用户ID到云函数
    const res = await articlesCo.toggleShopFavorite({
      shopId: shopInfo.value._id,
      userId: userId.value // 明确传递用户ID
    });
    
    console.log('📡 收藏操作响应:', res);
    
    if (res.errCode === 0) {
      isFavorite.value = res.data.isFavorite;
      uni.showToast({ 
        title: res.data.isFavorite ? '收藏成功' : '已取消收藏', 
        icon: 'success' 
      });
    } else if (res.errCode === 1001) {
      // 登录状态失效，重新获取用户信息
      await getCurrentUser();
      uni.showToast({ 
        title: '登录状态已过期，请重新登录', 
        icon: 'none' 
      });
    } else {
      throw new Error(res.errMsg);
    }
    
  } catch (error) {
    console.error('❌ 收藏操作失败:', error);
    uni.showToast({ 
      title: error.message || '操作失败，请重试', 
      icon: 'none' 
    });
  }
}

// 收藏状态检查 - 同样传递用户ID
async function checkFavoriteStatus(id) {
  if (!isLoggedIn.value || !userId.value) {
    isFavorite.value = false;
    return;
  }
  
  try {
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    const res = await articlesCo.getShopFavoriteStatus({
      shopId: id,
      userId: userId.value // 传递用户ID
    });
    
    console.log('🔍 收藏状态查询结果:', res);
    
    if (res.errCode === 0) {
      isFavorite.value = res.data.isFavorite;
    } else {
      console.error('❌ 获取收藏状态失败:', res.errMsg);
      isFavorite.value = false;
    }
    
  } catch (error) {
    console.error('❌ 检查收藏状态异常:', error);
    isFavorite.value = false;
  }
}

// 获取用户收藏的店铺列表
async function getShopFavoritesList() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  
  try {
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    const res = await articlesCo.getShopFavoritesList({
      page: 1,
      size: 20
    });
    
    if (res.errCode === 0) {
      console.log('✅ 收藏店铺列表:', res.data);
      return res.data;
    } else {
      throw new Error(res.errMsg);
    }
  } catch (error) {
    console.error('❌ 获取收藏列表失败:', error);
    uni.showToast({ 
      title: '获取收藏列表失败', 
      icon: 'none' 
    });
    return null;
  }
}


// 评论相关方法
async function loadShopReviews(reset = false) {
  if (!shopInfo.value?._id) return;
  
  if (reset) {
    reviewsPage.value = 1;
    reviews.value = [];
    hasMoreReviews.value = true;
  }
  
  if (!hasMoreReviews.value && !reset) return;
  
  reviewsLoading.value = true;
  
  try {
    console.log('🔄 调用现有文章云对象...');
    
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    
    const res = await articlesCo.list({
      page: reviewsPage.value,
      size: reviewsSize.value
    });
    
    console.log('📡 文章云对象响应:', res);
    
    if (res.errCode === 0) {
      const shopReviews = (res.data || []).filter(item => 
        item.shop_id === shopInfo.value._id
      );
      
      console.log('✅ 过滤后的店铺评论:', shopReviews.length, '条');
      
      const newReviews = [];
      for (let item of shopReviews) {
        const processedReview = await processReviewData(item);
        newReviews.push(processedReview);
      }
      
      console.log('🎯 处理后的评论数据:', newReviews);
      
      if (reset) {
        reviews.value = [...newReviews];
      } else {
        reviews.value = [...reviews.value, ...newReviews];
      }
      
      reviewsTotal.value = newReviews.length;
      hasMoreReviews.value = newReviews.length >= reviewsSize.value;
      reviewsPage.value += 1;
      
    } else {
      throw new Error(res.errMsg || '云对象返回错误');
    }
  } catch (error) {
    console.error('❌ 评论加载失败:', error);
    await loadReviewsDirect();
  } finally {
    reviewsLoading.value = false;
  }
}

// 处理评论数据
async function processReviewData(item) {
  console.log('🔍 处理单条评论数据:', item);
  
  const userInfo = item.user_id && item.user_id[0] ? item.user_id[0] : {};
  const userId = userInfo._id;
  
  let avatarUrl = await getAvatarUrl(userInfo, userId);
  
  let timeStr = '';
  if (item.publish_date) {
    const date = new Date(item.publish_date);
    timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  let imageUrls = [];
  if (item.pics && Array.isArray(item.pics)) {
    imageUrls = item.pics.map(pic => {
      if (pic && typeof pic === 'object' && pic.url) {
        return pic.url;
      } else if (typeof pic === 'string') {
        return pic;
      }
      return null;
    }).filter(url => url !== null);
  }
  
  console.log('🖼️ 处理后的图片URLs:', imageUrls);
  
  return {
    id: item._id,
    userId: userId,
    userName: userInfo.nickname || `用户${userId ? userId.slice(-4) : '0000'}`,
    avatar: avatarUrl,
    rating: item.rating || 5,
    time: timeStr,
    content: item.content || '暂无评论内容',
    images: imageUrls
  };
}

// 获取头像URL
async function getAvatarUrl(userInfo, userId) {
  if (!userInfo || !userId) return '/static/default-avatar.png';
  
  if (userAvatarCache.value.has(userId)) {
    return userAvatarCache.value.get(userId);
  }
  
  let avatarUrl = '/static/default-avatar.png';
  
  if (userInfo.avatar_url && userInfo.avatar_url.startsWith('http')) {
    avatarUrl = userInfo.avatar_url;
  } else if (userInfo.avatar_file && userInfo.avatar_file.url) {
    const fileUrl = userInfo.avatar_file.url;
    if (fileUrl.startsWith('http')) {
      avatarUrl = fileUrl;
    } else if (fileUrl.startsWith('cloud:')) {
      try {
        const result = await uniCloud.getTempFileURL({
          fileList: [fileUrl]
        });
        
        if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
          avatarUrl = result.fileList[0].tempFileURL;
        }
      } catch (error) {
        console.error('转换云存储URL失败:', error);
      }
    }
  } else if (userInfo.avatar && userInfo.avatar.startsWith('http')) {
    avatarUrl = userInfo.avatar;
  }
  
  if (avatarUrl !== '/static/default-avatar.png') {
    updateAvatarCache(userId, avatarUrl);
  }
  
  return avatarUrl;
}

// 更新头像缓存
function updateAvatarCache(userId, avatarUrl) {
  if (userAvatarCache.value.size >= MAX_CACHE_SIZE) {
    const firstKey = userAvatarCache.value.keys().next().value;
    userAvatarCache.value.delete(firstKey);
  }
  userAvatarCache.value.set(userId, avatarUrl);
}

// 头像加载成功处理
function onAvatarLoad(userId, avatarUrl) {
  if (!userId || userAvatarCache.value.has(userId)) return;
  updateAvatarCache(userId, avatarUrl);
}

// 头像加载失败处理
function handleAvatarError(event) {
  console.log('头像加载失败:', event);
  event.target.src = '/static/default-avatar.png';
}

// 图片URL安全检查
function getSafeImageUrl(img) {
  if (typeof img === 'string') {
    return img;
  } else if (img && typeof img === 'object') {
    if (img.url) return img.url;
    if (img.path) return img.path;
    if (img.tempFileURL) return img.tempFileURL;
  }
  return '/static/default-image.png';
}

// 备选方案：直接数据库查询
async function loadReviewsDirect() {
  try {
    const db = uniCloud.database();
    const res = await db.collection('demo-articles')
      .where({ shop_id: shopInfo.value._id })
      .orderBy('publish_date', 'desc')
      .limit(5)
      .get();
    
    console.log('📊 直接查询结果:', res);
    
    if (res.data && res.data.length > 0) {
      const simpleReviews = [];
      for (let item of res.data) {
        const processedReview = await processReviewData(item);
        simpleReviews.push(processedReview);
      }
      
      reviews.value = [...simpleReviews];
      reviewsTotal.value = res.data.length;
      
      uni.showToast({
        title: `加载${simpleReviews.length}条评论`,
        icon: 'success'
      });
    }
  } catch (e) {
    console.error('直接查询失败:', e);
  }
}

// 查看全部评论
function viewAllReviews() {
  if (!shopInfo.value) {
    uni.showToast({ title: '店铺信息不存在', icon: 'none' });
    return;
  }
  
  uni.navigateTo({
    url: `/pages/blog/list?shopId=${shopInfo.value._id}&shopName=${encodeURIComponent(shopInfo.value.shopName || '')}`
  });
}

// 跳转到评论详情页面
function goToReviewDetail(review) {
  if (!review || !review.id) {
    uni.showToast({
      title: '评论信息不完整',
      icon: 'none'
    });
    return;
  }

  const url = `/pages/blog/detail?id=${review.id}&shopId=${shopInfo.value?._id || ''}`;
  
  console.log('🔄 跳转到评论详情:', url);
  
  uni.navigateTo({
    url: url,
    fail: (err) => {
      console.error('❌ 跳转失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
}

// 图片预览
function previewImage(images, currentIndex) {
  if (!images || images.length === 0) return;
  
  const safeImages = images.map(img => getSafeImageUrl(img));
  
  uni.previewImage({
    urls: safeImages,
    current: safeImages[currentIndex] || safeImages[0]
  });
}

// 初始化地图标记
function initMapMarkers() {
  if (!shopInfo.value?.location?.coordinates) return;
  
  const [longitude, latitude] = shopInfo.value.location.coordinates;
  
  mapCenter.latitude = latitude;
  mapCenter.longitude = longitude;
  
  mapMarkers.value = [{
    id: shopInfo.value._id,
    latitude: latitude,
    longitude: longitude,
    title: shopInfo.value.shopName,
    iconPath: '/static/logo/local.png',
    width: 30,
    height: 30,
    callout: {
      content: `${shopInfo.value.shopName}\n⭐${(shopInfo.value.rating / 10).toFixed(1)} | 月售${shopInfo.value.monthlyOrders}单`,
      color: '#333',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#fff',
      padding: 8,
      display: 'ALWAYS',
      textAlign: 'center'
    }
  }];
  
  setTimeout(() => {
    mapContext.value = uni.createMapContext('shopDetailMap', this);
  }, 300);
}

// 测试数据函数
function useTestData(id) {
  shopInfo.value = {
    _id: id,
    shopName: '99自助餐',
    shopPic: '/static/default-shop.jpg',
    category: '自选餐',
    rating: 46,
    monthlyOrders: 1662,
    deliveryTime: '30-40',
    deliveryFee: 3,
    address: '福建省泉州市南安市康美镇康元路8号闽南科技学院第三食堂',
    businessHours: '09:00-21:30',
    description: '新店开业欢迎下单！汤面分装',
    phone: '18197236883',
    location: {
      type: 'Point',
      coordinates: [118.478807, 25.032761]
    },
    isVerified: true
  };
  
  reviews.value = [];
  reviewsTotal.value = 0;
  
  initMapMarkers();
  hasMenu.value = true;
  
  // 异步检查收藏状态
  if (isLoggedIn.value) {
    checkFavoriteStatus(id);
  } else {
    isFavorite.value = false;
  }
  
  setTimeout(() => {
    loadShopReviews(true);
  }, 1000);
}

// 辅助方法
function goBack() {
  uni.navigateBack();
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

// 电话点击事件
function handlePhoneCall() {
  if (!shopInfo.value?.phone) return;
  
  uni.showActionSheet({
    itemList: [`拨打 ${shopInfo.value.phone}`, '取消'],
    success: (res) => {
      if (res.tapIndex === 0) {
        makePhoneCall();
      }
    }
  });
}

function makePhoneCall() {
  if (!shopInfo.value?.phone) return;
  
  uni.makePhoneCall({
    phoneNumber: shopInfo.value.phone,
    fail: () => {
      uni.showToast({
        title: '无法拨打电话',
        icon: 'none'
      });
    }
  });
}

// 导航路线功能
function openMapWithRoute() {
  if (!shopInfo.value?.location?.coordinates) {
    uni.showToast({
      title: '暂无位置信息',
      icon: 'none'
    });
    return;
  }
  
  const [longitude, latitude] = shopInfo.value.location.coordinates;
  
  uni.openLocation({
    latitude: latitude,
    longitude: longitude,
    name: shopInfo.value.shopName,
    address: shopInfo.value.address,
    scale: 18,
    success: () => {
      console.log('打开地图成功');
    },
    fail: () => {
      uni.showToast({
        title: '打开地图失败',
        icon: 'none'
      });
    }
  });
}

function shareShop() {
  if (!shopInfo.value) return;
  
  uni.share({
    provider: 'weixin',
    type: 0,
    title: `推荐店铺：${shopInfo.value.shopName}`,
    summary: shopInfo.value.description || '这家店很不错，推荐给你！',
    href: `/pages/shopList/shopDetail?id=${shopInfo.value._id}`,
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' });
    },
    fail: () => {
      uni.showToast({ title: '分享失败', icon: 'none' });
    }
  });
}

function showContact() {
  if (!shopInfo.value) return;
  
  if (!checkLogin()) {
    return;
  }
  
  uni.navigateTo({
    url: `/pages/blog/edit?shopId=${shopInfo.value._id}`
  });
}

function switchCategory(categoryId) {
  activeCategory.value = categoryId;
}

// 查看商品详情
function viewProductDetail(product) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${product.id}`
  });
}

// 获取当前用户信息的快捷方法
function getCurrentUserId() {
  return userId.value;
}

// 获取当前用户完整信息
function getCurrentUserInfo() {
  return currentUser.value;
}

// 检查是否已登录
function isUserLoggedIn() {
  return isLoggedIn.value;
}

// 调试用户信息
function debugUserInfo() {
  console.log('🔍 用户信息调试:');
  console.log('1. Token:', uni.getStorageSync('uni_id_token'));
  console.log('2. UserInfo:', uni.getStorageSync('uni-id-pages-userInfo'));
  console.log('3. Token过期时间:', uni.getStorageSync('uni_id_token_expired'));
  console.log('4. 当前状态 - isLoggedIn:', isLoggedIn.value);
  console.log('5. 当前状态 - userId:', userId.value);
  console.log('6. 当前状态 - currentUser:', currentUser.value);
  
  uni.showModal({
    title: '用户信息调试',
    content: `登录状态: ${isLoggedIn.value}
用户ID: ${userId.value}
Token: ${uni.getStorageSync('uni_id_token') ? '存在' : '不存在'}
用户信息: ${uni.getStorageSync('uni-id-pages-userInfo') ? '存在' : '不存在'}`,
    showCancel: false
  });
}
</script>

<style lang="scss" scoped>
$primary: #FF6B35;
$secondary: #4A6CF7;
$text: #2d3748;
$light-text: #718096;
$border-radius: 24rpx;
.homeHead {
  /* #ifdef MP-WEIXIN */
  background:
    radial-gradient(50% 300px at left top, #d5f8fc, transparent),
    radial-gradient(50% 200px at right top, #d3cbfc, transparent);
  /* #endif */
  
  /* #ifdef H5 */
  background: linear-gradient(180deg, #CDE5FF 0%, #E9F3FF 100%);
  /* #endif */

  .navBar {
    width: 100%;
    /* #ifdef MP-WEIXIN */
    background: rgba(255, 255, 255, 0.9);
    /* #endif */
  }
}

.shop-detail {
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
  padding-bottom: 120rpx; /* 为底部评论框留出空间 */
}

/* 导航栏 */
.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  padding: 0 30rpx;
  
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20rpx);
  z-index: 1000;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  
  .nav-left, .nav-right {
    width: 80rpx;
    display: flex;
    align-items: center;
  }
  
  .back-icon, .share-icon {
    font-size: 36rpx;
    font-weight: bold;
    color: $text;
  }
  
  .nav-title {
    font-size: 32rpx;
    font-weight: 700;
    color: $text;
    max-width: 400rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
}

/* 头部背景图 */
.header-bg {
  width: 100%;
  height: 280rpx;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 40rpx 40rpx;
  overflow: hidden;
  
  .bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
  }
  
  .bg-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120rpx;
    background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
  }
}

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 2;
  margin-top: -20rpx;
}

/* 店铺信息卡片 - 美化版 */
.shop-info-card {
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.08);
}

/* 店铺头部信息 - 美化版 */
.shop-header {
  display: flex;
  padding: 40rpx 32rpx 32rpx;
  position: relative;
  
  /* Logo容器 */
  .logo-container {
    position: relative;
    margin-right: 24rpx;
    flex-shrink: 0;
    
    .shop-logo {
      margin-top: 10rpx;
      width: 220rpx;
      height: 220rpx;
      border-radius: 24rpx;
      border: 6rpx solid white;
      box-shadow: 
        0 12rpx 32rpx rgba(0, 0, 0, 0.15),
        0 4rpx 16rpx rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      object-fit: cover;
    }
  }
  
  /* 核心信息区域 */
  .shop-core-info {
    flex: 1;
    min-width: 0;
  }
  
  /* 标题区域 */
  .title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin: 14rpx 14rpx 14rpx;
    
    .shop-name-container {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12rpx;
      
      .shop-name {
        font-size: 34rpx;
        font-weight: 800;
        color: #1a202c;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 300rpx;
      }
      
      .verified-badge {
        background: linear-gradient(135deg, #4299e1, #3182ce);
        color: white;
        padding: 6rpx 12rpx;
        border-radius: 12rpx;
        font-size: 20rpx;
        display: flex;
        align-items: center;
        gap: 4rpx;
        flex-shrink: 0;
        
        .verified-icon {
          font-size: 16rpx;
          font-weight: bold;
        }
      }
    }
    
    .rating-display {
      margin-top: 8rpx;
      margin-right: -4rpx;
      display: flex;
      align-items: center;
      gap: 12rpx;
      flex-shrink: 0;
      
      .rating-stars {
        display: flex;
        gap: 2rpx;
        
        .star {
          font-size: 18rpx;
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
        font-size: 22rpx;
        font-weight: 700;
        color: #f6ad55;
      }
    }
  }
  
  /* 标签和状态区域 */
  .tags-status-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .tags-container {
      display: flex;
      gap: 12rpx;
      flex-wrap: wrap;
      margin-left: 12rpx;
      margin-top: 2rpx;
      
      .status-tag {
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        font-size: 14rpx;
        display: flex;
        align-items: center;
        gap: 6rpx;
        flex-shrink: 0;
        
        &.open {
          background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
          color: #22543d;
        }
        
        &.closed {
          background: linear-gradient(135deg, #fed7d7, #feb2b2);
          color: #742a2a;
        }
        
        .status-icon {
          font-size: 10rpx;
        }
        
        .status-text {
          font-size: 20rpx;
          font-weight: 500;
        }
      }
    }
    
    /* 评论和电话按钮容器 */
    .action-buttons {
      display: flex;
      gap: 12rpx;
      
      .comment-btn, .phone-btn, .favorite-btn {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.95);
        }
        
        .btn-icon {
          font-size: 28rpx;
          color: white;
        }
      }
      
      .favorite-btn {
        background: linear-gradient(135deg, #ffaa7f, #ff8935);
      }
      
      .comment-btn {
        background: linear-gradient(135deg, #4A6CF7, #6B8CFF);
      }
      
      .phone-btn {
        background: linear-gradient(135deg, #48bb78, #38a169);
      }
    }
  }
  
  /* 数据指标区域 */
  .metrics-section {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f8fafc, #edf2f7);
    border-radius: 20rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 24rpx;
    margin-left: 12rpx;
    
    .metric-item {
      flex: 1;
      text-align: center;
      
      &.highlight {
        .metric-value {
          color: #e53e3e;
          font-size: 24rpx;
        }
      }
      
      .metric-value {
        display: block;
        font-size: 24rpx;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 4rpx;
      }
      
      .metric-label {
        font-size: 22rpx;
        color: #718096;
      }
    }
    
    .metric-divider {
      width: 1rpx;
      height: 40rpx;
      background: #e2e8f0;
      margin: 0 20rpx;
    }
  }
}



/* 合并的位置和地址样式 */
.location-address-section {
  padding: 0 32rpx 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-icon {
      margin-right: 12rpx;
      font-size: 28rpx;
    }
    
    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: $text;
    }
  }
  
  .map-container {
    height: 400rpx;
    position: relative;
    background: #f8fafc;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    
    .map {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      
      .map-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;
      }
      
      &:active .map-overlay {
        opacity: 1;
      }
      
      .overlay-text {
        color: white;
        font-size: 28rpx;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.7);
        padding: 16rpx 32rpx;
        border-radius: 50rpx;
      }
    }
    
    /* 导航按钮 */
    .navigation-btn {
      position: absolute;
      bottom: 30rpx;
      right: 20rpx;
      background: $primary;
      color: white;
      padding: 16rpx 24rpx;
      border-radius: 50rpx;
      display: flex;
      align-items: center;
      gap: 8rpx;
      box-shadow: 0 2rpx 10rpx rgba(255, 107, 53, 0.3);
      z-index: 1000;
      
      .nav-icon {
        font-size: 24rpx;
      }
      
      .nav-text {
        font-size: 24rpx;
        font-weight: 600;
      }
    }
  }
  
  .address-content {
    padding: 20rpx;
    background: #f8fafc;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .address-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .address-icon {
        margin-right: 12rpx;
        font-size: 24rpx;
      }
      
      .address-title {
        font-size: 26rpx;
        font-weight: 600;
        color: $text;
      }
    }
    
    .address-text {
      font-size: 26rpx;
      color: $light-text;
      line-height: 1.5;
      display: block;
    }
  }
  
  .no-location {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
    background: #f8fafc;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    
    .no-location-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
      opacity: 0.5;
    }
    
    .no-location-text {
      font-size: 28rpx;
      color: $light-text;
    }
  }
}

.info-section {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .section-icon {
      margin-right: 12rpx;
      font-size: 28rpx;
    }
    
    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: $text;
    }
  }
  
  .shop-description {
    font-size: 26rpx;
    color: $light-text;
    line-height: 1.5;
  }
}

/* 菜单区域 */
.menu-section {
  background: white;
  margin: 24rpx 30rpx;
  padding: 30rpx;
  border-radius: $border-radius;
  
  .section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $text;
    margin-bottom: 24rpx;
  }
  
  .menu-categories {
    margin-bottom: 30rpx;
    
    .category-scroll {
      white-space: nowrap;
      
      .category-list {
        display: inline-flex;
        gap: 20rpx;
        
        .category-item {
          padding: 16rpx 32rpx;
          background: #f8fafc;
          border-radius: 50rpx;
          font-size: 26rpx;
          color: $light-text;
          flex-shrink: 0;
          
          &.active {
            background: $primary;
            color: white;
          }
          
          .category-name {
            white-space: nowrap;
          }
        }
      }
    }
  }
  
  .product-list {
    .product-item {
      display: flex;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f1f5f9;
      
      &:last-child {
        border-bottom: none;
      }
      
      .product-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 16rpx;
        object-fit: cover;
        margin-right: 20rpx;
      }
      
      .product-info {
        flex: 1;
        min-width: 0;
        
        .product-name {
          font-size: 28rpx;
          font-weight: 600;
          color: $text;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .product-desc {
          font-size: 24rpx;
          color: $light-text;
          display: block;
          margin-bottom: 16rpx;
          line-height: 1.4;
        }
        
        .product-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .product-price {
            font-size: 28rpx;
            font-weight: 700;
            color: $primary;
          }
          
          .product-sales {
            font-size: 22rpx;
            color: $light-text;
          }
        }
      }
      
      .view-detail-btn {
        width: 80rpx;
        height: 60rpx;
        background: $primary;
        color: white;
        border: none;
        border-radius: 12rpx;
        font-size: 24rpx;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-left: 16rpx;
        align-self: flex-end;
        
        .view-text {
          font-size: 22rpx;
        }
      }
    }
  }
  
  .empty-menu {
    text-align: center;
    padding: 60rpx 0;
    
    .empty-text {
      font-size: 26rpx;
      color: $light-text;
    }
  }
}

/* 评论区域样式 */
.reviews-section {
  background: white;
  margin: 24rpx 30rpx;
  padding: 30rpx;
  border-radius: $border-radius;
  margin-bottom: 120rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: 700;
      color: $text;
    }
    
    .see-all {
      font-size: 26rpx;
      color: $primary;
    }
  }
  
  .reviews-list {
    .review-item {
      padding: 30rpx 0;
      border-bottom: 1rpx solid #f1f5f9;
      
      &:last-child {
        border-bottom: none;
      }
      
      .review-user {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        
        .user-avatar {
          width: 64rpx;
          height: 64rpx;
          border-radius: 50%;
          margin-right: 16rpx;
        }
        
        .user-info {
          flex: 1;
          
          .user-name {
            font-size: 28rpx;
            font-weight: 600;
            color: $text;
            display: block;
            margin-bottom: 8rpx;
          }
          
          .review-meta {
            display: flex;
            align-items: center;
            gap: 16rpx;
            
            .rating-stars.small {
              .star {
                font-size: 20rpx;
                
                &.filled {
                  color: #ffd700;
                }
                
                &:not(.filled) {
                  color: #e2e8f0;
                }
              }
            }
            
            .review-time {
              font-size: 22rpx;
              color: $light-text;
            }
          }
        }
      }
      
      .review-content {
        margin-bottom: 20rpx;
        
        .review-text {
          font-size: 26rpx;
          color: $text;
          line-height: 1.5;
        }
      }
      
      .review-images {
        .images-scroll {
          white-space: nowrap;
          
          .images-list {
            display: inline-flex;
            gap: 16rpx;
            
            .review-image {
              width: 160rpx;
              height: 160rpx;
              border-radius: 12rpx;
              object-fit: cover;
            }
          }
        }
      }
    }
    
    .load-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30rpx 0;
      color: $primary;
      font-size: 26rpx;
      gap: 8rpx;
      
      .load-more-text {
        font-weight: 600;
      }
      
      .load-more-icon {
        font-size: 24rpx;
      }
    }
  }
  
  .empty-reviews {
    text-align: center;
    padding: 60rpx 0;
    
    .empty-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
      display: block;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: $text;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .empty-desc {
      font-size: 24rpx;
      color: $light-text;
      display: block;
    }
  }
  
  .reviews-loading {
    padding: 40rpx 0;
    text-align: center;
  }
}

/* 底部固定评论框 */
.fixed-comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1rpx solid #e2e8f0;
  padding: 20rpx 30rpx;
  z-index: 999;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  
  &.with-safe-area {
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  }
  
  .comment-input-wrapper {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 50rpx;
    padding: 20rpx 24rpx;
    border: 2rpx solid #e2e8f0;
    transition: all 0.3s ease;
    
    &:active {
      background: #edf2f7;
      transform: scale(0.98);
    }
    
    .comment-input-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .placeholder-icon {
        font-size: 28rpx;
        opacity: 0.7;
      }
      
      .placeholder-text {
        font-size: 26rpx;
        color: #718096;
      }
    }
    
    .comment-btn {
      background: $primary;
      color: white;
      padding: 12rpx 24rpx;
      border-radius: 40rpx;
      font-size: 24rpx;
      font-weight: 600;
      transition: all 0.3s ease;
      
      &:active {
        background: darken($primary, 10%);
        transform: scale(0.95);
      }
      
      .btn-text {
        font-size: 24rpx;
      }
    }
  }
}

/* 滚动条隐藏 */
.images-scroll ::-webkit-scrollbar {
  display: none;
}

.category-scroll ::-webkit-scrollbar {
  display: none;
}

.category-scroll {
  -webkit-overflow-scrolling: touch;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 60rpx;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 200rpx 40rpx;
  
  .error-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
  }
  
  .error-title {
    font-size: 34rpx;
    font-weight: 700;
    color: $text;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .error-desc {
    font-size: 26rpx;
    color: $light-text;
    margin-bottom: 40rpx;
    display: block;
    line-height: 1.5;
  }
  
  .retry-btn {
    background: $primary;
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 20rpx 60rpx;
    font-size: 28rpx;
  }
}

/* 响应式调整 */
@media (max-width: 375px) {
  .shop-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .logo-container {
      margin-right: 0;
      margin-bottom: 24rpx;
    }
    
    .title-section {
      flex-direction: column;
      gap: 16rpx;
      
      .shop-name-container {
        justify-content: center;
      }
    }
    
    .tags-status-section {
      flex-direction: column;
      gap: 16rpx;
      
      .tags-container {
        justify-content: center;
      }
      
      .action-buttons {
        justify-content: center;
      }
    }
    
    .metrics-section {
      flex-direction: column;
      gap: 16rpx;
      
      .metric-divider {
        display: none;
      }
    }
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .nav-bar {
    padding-left: max(30rpx, env(safe-area-inset-left));
    padding-right: max(30rpx, env(safe-area-inset-right));
  }
  
  .shop-info-card {
    padding-left: max(24rpx, env(safe-area-inset-left));
    padding-right: max(24rpx, env(safe-area-inset-right));
  }
  
  .menu-section, .reviews-section {
    margin-left: max(30rpx, env(safe-area-inset-left));
    margin-right: max(30rpx, env(safe-area-inset-right));
  }
  
  .fixed-comment-bar {
    padding-left: max(30rpx, env(safe-area-inset-left));
    padding-right: max(30rpx, env(safe-area-inset-right));
  }
}

/* 隐藏高德地图slogan */
:deep(.amap-logo) {
  display: none !important;
}

:deep(.amap-copyright) {
  display: none !important;
}
</style>