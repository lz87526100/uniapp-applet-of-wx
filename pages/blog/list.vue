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
          >
            <view @click="goDetail(item._id)">
              <!-- 用户信息 -->
              <view class="userinfo">
                <image
                  class="avatar"
                  :src="getUserAvatar(item.user_id[0])"
                  mode="aspectFill"
                  @error="handleAvatarError"
                  @load="onAvatarLoad(item.user_id[0])"
                />
                <text class="username">{{ item.user_id[0].nickname || '匿名' }}</text>
                <text class="time">
                  <uni-dateformat
                    :date="item.publish_date"
                    format="MM-dd hh:mm"
                    :threshold="[60000,3600000*24*30]"
                  />
                </text>
              </view>
              <!-- 正文 -->
              <view class="content">
                <text class="text">{{ item.content }}</text>
              </view>
            </view>
            <!-- 图片 -->
            <view v-if="item.pics?.length" class="pics">
              <image
                v-for="(pic, idx) in item.pics"
                :key="idx"
                class="pic"
                :src="pic.url"
                mode="aspectFill"
                @click.stop="preview(item.pics, idx)"
              />
            </view>

            <!-- 底部工具栏 -->
            <view class="toolbar">
              <view class="left">
                <text class="read">{{ item.view_count || 0 }} 浏览</text>
              </view>
              <view class="right">
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

/* 首次拉取 */
onMounted(() => {
  console.log('博客列表页面加载');
  setupUserInfoListeners();
  getData(true);
});

/* 页面触底事件 - 核心修改 */
onReachBottom(() => {
  console.log('页面触底，触发加载更多');
  loadMore();
});

/* 下拉刷新 */
onPullDownRefresh(() => {
  onRefresh();
});

const goDetail = (e) => {
  uni.navigateTo({
    url: '/pages/blog/detail?id=' + e
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

/* 触底加载更多 - 核心修改 */
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
  uni.navigateTo({ url: '/pages/blog/edit' });
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
  border-radius: $radius;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: $shadow;
  transition: $transition;
  &:active { transform: scale(.98); }

  .userinfo {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    .avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .1);
      margin-right: 16rpx;
    }
    .username {
      font-size: 30rpx;
      font-weight: 600;
      color: $primary;
    }
    .time {
      margin-left: auto;
      font-size: 24rpx;
      color: #8B9AB6;
    }
  }

  .content {
    .text {
      font-size: 34rpx;
      line-height: 1.8em;
      color: #222;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12rpx;
      margin-top: 20rpx;
    }
  }
  .pic {
    width: 38%;
    height: 38%;
    border-radius: 12rpx;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24rpx;
    
    .left {
      .read {
        font-size: 24rpx;
        color: #8B9AB6;
      }
    }
    
    .right {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .favorite-btn {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        background: #f5f5f5;
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
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF5B5B 0%, #FF8A8A 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(255, 91, 91, 0.35);
        transition: $transition;
        &:active { transform: scale(.9); }
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