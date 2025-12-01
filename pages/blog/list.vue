<template>
  <view class="blogList">
    <!-- 1 毛玻璃固定头部 -->
    <view class="head">
      <home-head />
    </view>

    <!-- 2 可滚动内容区 -->
    <view class="body">
      <scroll-view
        scroll-y
        class="scrollBox"
        enable-back-to-top
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <!-- 下拉刷新指示器 -->
        <view v-if="refreshing" class="refresh-indicator">
          <uni-load-more status="loading" content="刷新中..."></uni-load-more>
        </view>

        <!-- 骨架屏：首次加载前展示 -->
        <view v-if="loading && articlesList.length === 0" class="skeleton">
          <view v-for="i in 8" :key="i" class="card skeleton-card" />
        </view>

        <!-- 真正的列表 -->
        <view v-else class="list">
          <view
            class="card"
            v-for="item in articlesList"
            :key="item._id"
            @touchstart="touchStart"
            @touchend="touchEnd(item._id)"
            :class="{ 'shop-review': isShopReview(item) }"
          >
            <!-- 整个卡片内容区域绑定点击事件 -->
            <view class="card-content" @click="goDetail(item._id,item.shop_id)">
              <!-- 图片区域 -->
              <view class="image-area">
                <image
                  v-if="item.pics?.length"
                  class="content-image"
                  :src="item.pics[0].url"
                  mode="aspectFill"
                />
                <image
                  v-else
                  class="content-image"
                  src="/static/default-movie.jpg"
                  mode="aspectFill"
                />
              </view>
            </view>

            <!-- 底部工具栏 - 用户/商家信息和评论 -->
            <view class="toolbar">
              <view class="content-area">
                <!-- 用户/商家信息和评论 -->
                <view class="user-comment-area">
                  <!-- 用户头像和名字 -->
                  <view class="user-info" v-if="!isShopReview(item)">
                    <image
                      class="user-avatar"
                      :src="getUserAvatar(item.user_id[0])"
                      mode="aspectFill"
                      @error="handleAvatarError"
                      @load="onAvatarLoad(item.user_id[0])"
                    />
                    <text class="username">{{ item.user_id[0].nickname || '匿名用户' }}</text>
                  </view>
                  
              <!-- 商家头像和名字 -->
              <view class="shop-info" v-else @click="goShopDetail(item.shop_id)">
                <image
                  class="shop-avatar"
                  :src="getShopAvatar(item.shop_id)"
                  mode="aspectFill"
                  @error="handleShopAvatarError"
                />
                <text class="shop-name">{{ getShopName(item.shop_id) }}</text>
                <!-- 评分显示 -->
                <view class="shop-rating" v-if="item.rating">
                  <text class="rating-star">★</text>
                  <text class="rating-value">{{ item.rating }}</text>
                </view>
              </view>
                  
                  <!-- 评论内容 -->
                  <view class="title-area">
                    <!-- <text class="title">{{ getCommentPreview(item.content) }}</text> -->
                  </view>
                </view>
              </view>
              
              <view class="right-actions">
                <!-- 收藏按钮 -->
                <view class="favorite-btn" @click.stop="toggleFavorite(item._id, item)">
                  <uni-icons 
                    :type="item.isFavorited ? 'heart-filled' : 'heart'" 
                    :color="item.isFavorited ? '#FF5B5B' : '#8B9AB6'" 
                    size="18" 
                  />
                </view>
                
                <!-- 删除按钮 -->
                <view
                  v-if="isPermission(item.user_id[0]._id)"
                  class="delete"
                  @click.stop="remove(item._id)"
                >
                  <uni-icons type="trash" size="18" color="#fff" />
                </view>
              </view>
            </view>
          </view>

          <!-- 底部加载状态 -->
          <view class="footer">
            <view v-if="loadingMore" class="loading-more">
              <uni-load-more status="loading" content="正在加载..."></uni-load-more>
            </view>
            <view v-else-if="finished && articlesList.length > 0" class="no-more">
              <text>--- 我是有底线的 ---</text>
            </view>
            <view v-else-if="articlesList.length === 0" class="empty">
              <text class="empty-text">暂无内容，快去发布第一条吧~</text>
            </view>
            <view v-else class="pull-up">
              <text>释放加载更多</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 3 渐变悬浮发布按钮 -->
    <view class="fab" @click="goAdd">
      <text class="icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onShow, onHide, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { isPermission } from '@/utils/common.js';
import  favoritesManager  from '@/common/style/favorites.js';

const articlesCloudObj = uniCloud.importObject('articlesCloudObj');

const articlesList = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const refreshing = ref(false);
const finished = ref(false);
let page = 1;
const size = 8; // 每次加载8条数据

// 用户头像缓存
const userAvatarCache = ref(new Map());
const MAX_CACHE_SIZE = 30;

// 商家信息缓存
const shopInfoCache = ref(new Map());

/* 首次拉取 */
onMounted(() => {
  console.log('博客列表页面加载');
  setupUserInfoListeners();
  getData(true);
});

/* 页面触底事件 */
onReachBottom(() => {
  console.log('页面触底，触发加载更多');
  loadMore();
});

/* 下拉刷新 */
onPullDownRefresh(() => {
  onRefresh();
});

// 跳转到店铺详情页
const goShopDetail = (shopId) => {
  if (!shopId) {
    uni.showToast({
      title: '店铺信息不存在',
      icon: 'none'
    });
    return;
  }
  
  console.log('跳转到店铺详情页，店铺ID:', shopId);
  uni.navigateTo({
    url: `/pages/shopList/shopDetail?id=${shopId}`
  });
};

// 修改 goDetail 函数
const goDetail = (articleId, shopId) => {
  console.log('跳转到详情页，文章ID:', articleId, '商家ID:', shopId);
  let url = `/pages/blog/detail?id=${articleId}`;
  if (shopId) {
    url += `&shopId=${shopId}`;
  }
  uni.navigateTo({
    url: url
  });
};

/* 监听编辑页刷新 */
uni.$on('editEvent', () => {
  console.log('收到编辑事件，刷新数据');
  page = 1;
  finished.value = false;
  getData(true);
});

/* 监听用户信息更新 */
const setupUserInfoListeners = () => {
  uni.$on('userInfoUpdated', (data) => {
    console.log('博客列表收到用户信息更新:', data);
    updateUserAvatarInList(data);
  });
};

// 更新列表中的用户头像
const updateUserAvatarInList = (userData) => {
  if (!userData.userId || !userData.avatar) return;
  
  console.log('开始更新博客列表中的用户头像，用户ID:', userData.userId);
  
  // 更新缓存
  updateAvatarCache(userData.userId, userData.avatar);
  
  // 更新列表中的头像
  articlesList.value.forEach((item, index) => {
    if (item.user_id && item.user_id[0] && item.user_id[0]._id === userData.userId) {
      if (!item.user_id[0].avatar_file) {
        item.user_id[0].avatar_file = {};
      }
      item.user_id[0].avatar_file.url = userData.avatar;
      item.user_id[0].avatar_url = userData.avatar;
      
      // 强制触发视图更新
      articlesList.value[index] = { ...articlesList.value[index] };
    }
  });
};

// 控制缓存大小
const updateAvatarCache = (userId, avatarUrl) => {
  if (userAvatarCache.value.size >= MAX_CACHE_SIZE) {
    const firstKey = userAvatarCache.value.keys().next().value;
    userAvatarCache.value.delete(firstKey);
  }
  userAvatarCache.value.set(userId, avatarUrl);
};

// 获取用户头像
const getUserAvatar = (user) => {
  if (!user || !user._id) return '/static/defAvatar.png';
  
  const userId = user._id;
  
  // 1. 优先检查缓存
  if (userAvatarCache.value.has(userId)) {
    return userAvatarCache.value.get(userId);
  }
  
  // 2. 检查用户对象的头像数据
  let avatarUrl = '/static/defAvatar.png';
  
  if (user.avatar_url && user.avatar_url.startsWith('http')) {
    avatarUrl = user.avatar_url;
  } else if (user.avatar_file && user.avatar_file.url) {
    const fileUrl = user.avatar_file.url;
    if (fileUrl.startsWith('http')) {
      avatarUrl = fileUrl;
    } else if (fileUrl.startsWith('cloud:')) {
      return '/static/defAvatar.png';
    }
  } else if (user.avatar && user.avatar.startsWith('http')) {
    avatarUrl = user.avatar;
  }
  
  if (avatarUrl !== '/static/defAvatar.png') {
    updateAvatarCache(userId, avatarUrl);
  }
  
  return avatarUrl;
};

// 头像加载成功时处理云存储URL
const onAvatarLoad = (user) => {
  if (!user || !user._id) return;
  
  const userId = user._id;
  if (userAvatarCache.value.has(userId)) return;
  
  if (user.avatar_file && user.avatar_file.url && user.avatar_file.url.startsWith('cloud:')) {
    convertCloudFileUrl(user.avatar_file.url, userId);
  }
};

// 异步转换云存储URL
const convertCloudFileUrl = async (fileUrl, userId) => {
  try {
    const result = await uniCloud.getTempFileURL({
      fileList: [fileUrl]
    });
    
    if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
      const httpUrl = result.fileList[0].tempFileURL;
      
      // 更新缓存
      updateAvatarCache(userId, httpUrl);
      
      // 更新列表中的头像
      updateAvatarInList(userId, httpUrl);
    }
  } catch (error) {
    console.error('转换云存储URL失败:', error);
  }
};

// 更新列表中的头像URL
const updateAvatarInList = (userId, avatarUrl) => {
  articlesList.value.forEach((item, index) => {
    if (item.user_id && item.user_id[0] && item.user_id[0]._id === userId) {
      if (!item.user_id[0].avatar_file) {
        item.user_id[0].avatar_file = {};
      }
      item.user_id[0].avatar_file.url = avatarUrl;
      item.user_id[0].avatar_url = avatarUrl;
      
      articlesList.value[index] = { ...articlesList.value[index] };
    }
  });
};

// 头像加载失败处理
const handleAvatarError = (event) => {
  console.log('头像加载失败:', event);
};

// 判断是否是商家评价
const isShopReview = (item) => {
  return item.shop_id && item.rating;
};

// 获取商家头像
const getShopAvatar = (shopId) => {
  if (!shopId) return '/static/default-shop.jpg';
  
  const shopInfo = shopInfoCache.value.get(shopId);
  if (shopInfo && shopInfo.shopPic) {
    return shopInfo.shopPic;
  }
  
  return '/static/default-shop.jpg';
};

// 获取商家名称
const getShopName = (shopId) => {
  if (!shopId) return '未知商家';
  
  const shopInfo = shopInfoCache.value.get(shopId);
  if (shopInfo && shopInfo.shopName) {
    return shopInfo.shopName;
  }
  
  return '加载中...';
};

// 商家头像加载失败处理
const handleShopAvatarError = (event) => {
  console.log('商家头像加载失败:', event);
  event.target.src = '/static/default-shop.jpg';
};

// 加载商家信息
const loadShopInfo = async (shopId) => {
  if (!shopId || shopInfoCache.value.has(shopId)) return;
  
  try {
    console.log('开始加载商家信息，shopId:', shopId);
    const res = await uniCloud.callFunction({
      name: 'getShopDetail',
      data: { shopId }
    });

    if (res.result?.errCode === 0) {
      console.log('商家信息加载成功:', res.result.data);
      shopInfoCache.value.set(shopId, res.result.data);
      
      // 强制更新视图
      articlesList.value = [...articlesList.value];
    } else {
      console.error('商家信息加载失败:', res.result?.errMsg);
    }
  } catch (error) {
    console.error('加载商家信息异常:', error);
  }
};

// 批量加载商家信息
const batchLoadShopInfo = async () => {
  const shopIds = articlesList.value
    .filter(item => item.shop_id && !shopInfoCache.value.has(item.shop_id))
    .map(item => item.shop_id);
  
  if (shopIds.length === 0) return;
  
  console.log('批量加载商家信息，数量:', shopIds.length);
  
  // 逐个加载商家信息
  for (const shopId of shopIds) {
    await loadShopInfo(shopId);
  }
};

// 获取评论预览文本
const getCommentPreview = (content) => {
  if (!content) return '暂无评论';
  // 限制评论显示长度
  return content.length > 30 ? content.substring(0, 30) + '...' : content;
};

// 获取数据
async function getData(reset = true) {
  if (reset) {
    loading.value = true;
    page = 1;
  } else {
    loadingMore.value = true;
  }
  
  try {
    console.log('获取博客列表数据，页码:', page);
    const { errCode, data } = await articlesCloudObj.list({ page, size });
    
    if (errCode === 0) {
      console.log('获取到数据条数:', data ? data.length : 0);
      
      if (reset) {
        articlesList.value = data || [];
      } else {
        articlesList.value = [...articlesList.value, ...(data || [])];
      }
      
      // 判断是否加载完成
      finished.value = !data || data.length < size;
      
      console.log('数据加载完成，列表长度:', articlesList.value.length, '是否完成:', finished.value);
      
      // 数据加载完成后检查收藏状态
      if (articlesList.value.length > 0) {
        await checkFavoritesStatus();
        // 新增：加载商家信息
        await batchLoadShopInfo();
      }
      
    } else {
      console.error('获取数据失败:', errCode);
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取数据异常:', error);
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    loadingMore.value = false;
    refreshing.value = false;
    uni.stopPullDownRefresh();
  }
}

/* ========== 收藏相关功能 ========== */

// 切换收藏状态 - 增强错误处理
async function toggleFavorite(articleId, item) {
  try {
    // 检查用户登录状态
    const userInfo = uni.getStorageSync('uni-id-pages-userInfo');
    if (!userInfo || !userInfo._id) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    
    console.log('切换收藏状态:', { articleId, currentStatus: item.isFavorited });
    
    if (item.isFavorited) {
      // 取消收藏
      const success = await favoritesManager.removeFavorite(articleId);
      if (success) {
        item.isFavorited = false;
        uni.showToast({ title: '取消收藏', icon: 'success' });
      }
    } else {
      // 添加收藏
      const success = await favoritesManager.addFavorite(articleId);
      if (success) {
        item.isFavorited = true;
        uni.showToast({ title: '收藏成功', icon: 'success' });
      }
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error);
    uni.showToast({ title: '操作失败，请重试', icon: 'none' });
  }
}

// 批量检查收藏状态 
async function checkFavoritesStatus() {
    try {
        const articleIds = articlesList.value.map(item => item._id).filter(id => id);
        
        if (articleIds.length === 0) {
            console.log('没有文章需要检查收藏状态');
            return;
        }
        
        console.log('🔄 开始检查收藏状态，文章数量:', articleIds.length);
        
        const favoritesStatus = await favoritesManager.batchCheckFavorites(articleIds);
        console.log('✅ 收藏状态检查完成:', favoritesStatus);
        
        // 安全地更新列表项的收藏状态
        articlesList.value.forEach(item => {
            if (item && item._id) {
                item.isFavorited = favoritesStatus[item._id] || false;
            }
        });
    } catch (error) {
        console.error('检查收藏状态失败，设置所有为未收藏:', error);
        // 出错时设置所有文章为未收藏状态
        articlesList.value.forEach(item => {
            if (item) {
                item.isFavorited = false;
            }
        });
    }
}

/* 下拉刷新 */
function onRefresh() {
  if (refreshing.value) return;
  
  refreshing.value = true;
  console.log('下拉刷新');
  getData(true);
}

/* 触底加载更多 */
function loadMore() {
  // 防止重复加载
  if (loadingMore.value || finished.value || loading.value) {
    console.log('跳过加载: loadingMore=', loadingMore.value, 'finished=', finished.value, 'loading=', loading.value);
    return;
  }
  
  console.log('触底加载更多，页码:', page + 1);
  loadingMore.value = true;
  page++;
  getData(false);
}

/* 删除 */
async function remove(id) {
  const { confirm } = await uni.showModal({
    title: '提示',
    content: '确认删除这条随笔？',
    confirmColor: '#FF5B5B'
  });
  if (!confirm) return;
  
  const { errCode } = await articlesCloudObj.remove(id);
  if (errCode === 0) {
    uni.showToast({ title: '已删除', icon: 'none' });
    page = 1;
    getData(true);
  }
}

/* 图片预览 */
function preview(pics, idx) {
  uni.previewImage({
    urls: pics.map(p => p.url),
    current: idx
  });
}

/* 滑动删除 - 简单实现 */
let startX = 0;
function touchStart(e) {
  startX = e.touches[0].pageX;
}
function touchEnd(id) {
  const moveX = event.changedTouches[0].pageX - startX;
  if (moveX < -80) remove(id);
}

/* 发布 */
function goAdd() {
  uni.navigateTo({ url: '/pages/blog/choseEdit' });
}

// 页面卸载时移除监听
onUnmounted(() => {
  console.log('博客列表页面卸载');
  uni.$off('userInfoUpdated');
  uni.$off('editEvent');
});

// 强制刷新 token
async function refreshToken() {
  try {
    const uniIdCo = uniCloud.importObject('uni-id-co');
    const result = await uniIdCo.refreshToken();
    console.log('刷新token结果:', result);
  } catch (error) {
    console.error('刷新token失败:', error);
  }
};

// 在 list 页面中添加调试方法
async function debugLoginStatus() {
    try {
        const articlesCloudObj = uniCloud.importObject('articlesCloudObj');
        const result = await articlesCloudObj.debugLoginStatus();
        console.log('🔍 登录状态调试结果:', result);
    } catch (error) {
        console.error('调试失败:', error);
    }
}

// 在 onShow 或 mounted 中调用
onMounted(() => {
    debugLoginStatus();
});
</script>

<style lang="scss" scoped>
/* 样式保持不变，添加刷新指示器样式 */
.refresh-indicator {
  padding: 20rpx 0;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

/* 其他样式保持不变 */
/* -------------------- 变量区 -------------------- */
$primary: #4F8BFF;
$radius: 32rpx;
$shadow: 0 8rpx 32rpx rgba(0, 0, 0, .08);
$transition: all .3s cubic-bezier(.4, 0, .2, 1);

/* -------------------- 主结构 -------------------- */
.blogList {
  min-height: 100vh;
  background: linear-gradient(180deg, #CDE5FF 0%, #E9F3FF 100%);
  display: flex;
  flex-direction: column;
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

.scrollBox {
  height: 100%;
  padding: 24rpx 0rpx 40rpx;
}

/* -------------------- 骨架屏 -------------------- */
.skeleton {
  .skeleton-card {
    height: 280rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.2s ease infinite;
    margin-bottom: 24rpx;
  }
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}

/* -------------------- 卡片 -------------------- */
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 0;
  margin: 0 24rpx 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, .08);
  transition: all .3s cubic-bezier(.4, 0, .2, 1);
  overflow: hidden;
  
  &:active { 
    transform: scale(.98); 
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .12);
  }

  /* 商家评价卡片特殊样式 */
  &.shop-review {
    // border-left: 6rpx solid #FF6B35;
  }

  /* 卡片内容区域 - 可点击 */
  .card-content {
    /* 图片区域 */
    .image-area {
      .content-image {
        width: 100%;
        height: 400rpx;
        background-color: #f5f5f5;
      }
    }

    /* 标题区域 */
    .title-area {
      padding: 20rpx 24rpx 16rpx;
      
      .title {
        font-size: 32rpx;
        font-weight: 700;
        color: #222;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  /* 底部工具栏 - 用户名和评论 */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx 24rpx;
    background: #fff;
    border-top: 1rpx solid #f0f0f0;
    
    .content-area {
      flex: 1;
      
      /* 用户信息和评论区域 */
      .user-comment-area {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12rpx;
          min-width: 120rpx;
          
          .user-avatar {
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            border: 2rpx solid #f0f0f0;
          }
          
          .username {
            font-size: 24rpx;
            color: #666;
            font-weight: 500;
            white-space: nowrap;
          }
        }
        
        /* 商家信息样式 */
.shop-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 120rpx;
  padding: 8rpx 12rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
  
  &:active {
    background-color: rgba(255, 107, 53, 0.1);
    transform: scale(0.98);
  }
  
  .shop-avatar {
    width: 48rpx;
    height: 48rpx;
    border-radius: 12rpx;
    border: 2rpx solid #f0f0f0;
  }
  
  .shop-name {
    font-size: 24rpx;
    color: #FF6B35;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .shop-rating {
    display: flex;
    align-items: center;
    background: #FFF8E1;
    padding: 4rpx 8rpx;
    border-radius: 8rpx;
    margin-left: 8rpx;
    
    .rating-star {
      color: #FFD700;
      font-size: 20rpx;
      margin-right: 2rpx;
    }
    
    .rating-value {
      font-size: 20rpx;
      color: #FF6B35;
      font-weight: 600;
    }
  }
}
 
        .comment-content {
          flex: 1;
          
          .comment-text {
            font-size: 26rpx;
            color: #333;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
    
    .right-actions {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-left: 16rpx;
      
      .favorite-btn {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: #f8f8f8;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.9);
          background: #e0e0e0;
        }
      }
      
      .delete {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF5B5B 0%, #FF8A8A 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &:active { 
          transform: scale(.9); 
        }
      }
    }
  }
}

.footer {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: #8B9AB6;
  
  .loading-more,
  .no-more,
  .pull-up {
    padding: 20rpx 0;
  }
  
  .no-more {
    color: #999;
  }
  
  .pull-up {
    color: #4F8BFF;
  }
}

/* -------------------- 悬浮发布按钮 -------------------- */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6AA6FF 0%, $primary 100%);
  box-shadow: 0 8rpx 32rpx rgba($primary, .45);
  display: grid;
  place-items: center;
  animation: fadeIn .6s ease both;
  transition: $transition;
  &:active { transform: scale(.9); }
  .icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(40rpx) scale(.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>