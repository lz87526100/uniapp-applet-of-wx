<template>
  <view class="favorites-page">
    <!-- 头部：复用毛玻璃样式 -->
    <view class="head">
      <uni-nav-bar 
        title="我的收藏" 
        left-icon="back" 
        @clickLeft="goBack"
        background-color="transparent"
        color="#222"
        :status-bar="true"
      />
    </view>

    <!-- 内容区 -->
    <view class="body">
      <scroll-view
        scroll-y
        class="scrollBox"
        enable-back-to-top
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        :show-scrollbar="false"
        enhanced
        :bounces="false"
        @scroll="onScroll"
        :refresher-threshold="45"
        refresher-background="transparent"
      >
        <!-- 下拉刷新 -->
        <view v-if="refreshing" class="refresh-indicator">
          <uni-load-more status="loading" content="刷新中..."></uni-load-more>
        </view>

        <!-- 骨架屏 -->
        <view v-if="loading && favoritesList.length === 0" class="skeleton">
          <view v-for="i in 6" :key="i" class="card skeleton-card" />
        </view>

        <!-- 列表 -->
        <view v-else class="list">
          <view
            v-for="item in visibleItems"
            :key="item._id + '_' + item.article_id"
            class="card"
            @click="goToDetail(item)"
          >
            <!-- 文章内容 -->
            <view class="content">
              <text class="text">{{ getItemContent(item) }}</text>
            </view>

            <!-- 图片区域 -->
            <view v-if="hasPics(item)" class="pics">
              <image
                v-for="(pic, idx) in getDisplayPics(item)"
                :key="pic.id + '_' + idx"
                class="pic"
                :src="pic.url"
                mode="aspectFill"
                lazy-load
                :data-index="idx"
                :data-url="pic.url"
                @click.stop="previewImage(getAllPics(item), idx)"
                @load="onImageLoad"
                @error="onImageError"
                style="width: 100%; height: 200rpx;"
              />
              <!-- 图片数量提示 -->
              <view v-if="getPicCount(item) > 3" class="pic-count">
                <text>+{{ getPicCount(item) - 3 }}</text>
              </view>
            </view>

            <!-- 底部信息 -->
            <view class="footer">
              <view class="time">
                <uni-icons type="calendar" size="14" color="#8B9AB6"></uni-icons>
                <text class="time-text">
                  <uni-dateformat :date="item.create_date" format="MM-dd hh:mm" />
                </text>
              </view>

              <view class="action" @click.stop="removeFavorite(item.article_id)">
                <uni-icons type="trash" size="18" color="#FF5B5B"></uni-icons>
                <text class="action-text">移除</text>
              </view>
            </view>
          </view>

          <!-- 底部状态 -->
          <view class="footer-status">
            <view v-if="loadingMore" class="loading-more">
              <uni-load-more status="loading" content="正在加载..."></uni-load-more>
            </view>
            <view v-else-if="finished && favoritesList.length > 0" class="no-more">
              <text>--- 没有更多了 ---</text>
            </view>
            <view v-else-if="favoritesList.length === 0 && !loading" class="empty">
              <text class="empty-text">暂无收藏内容</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import favoritesManager from '@/common/style/favorites.js';

const favoritesList = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const loadingMore = ref(false);
const finished = ref(false);
const scrollTop = ref(0);
const canRefresh = ref(true); // 新增：控制是否允许刷新

// 跳转到详情页
function goToDetail(item) {
  if (!item || !item.article_id) {
    uni.showToast({ title: '文章信息错误', icon: 'none' });
    return;
  }
  
  // 根据你的实际路由配置调整
  uni.navigateTo({
    url: `/pages/blog/detail?id=${item.article_id}`
  });
}

// 虚拟滚动相关
const itemHeight = 320;
const bufferSize = 5;

// 计算可见项
const visibleItems = computed(() => {
  if (favoritesList.value.length <= 15) {
    return favoritesList.value;
  }
  
  const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize);
  const endIndex = Math.min(
    favoritesList.value.length,
    startIndex + Math.ceil(800 / itemHeight) + bufferSize * 2
  );
  
  return favoritesList.value.slice(startIndex, endIndex);
});

// 滚动处理
function onScroll(e) {
  scrollTop.value = e.detail.scrollTop;
  
  // 关键修复：只有在顶部时才允许刷新
  canRefresh.value = e.detail.scrollTop <= 10;
}

// 下拉刷新
function onRefresh() {
  // 只有在顶部且未在刷新状态时才允许刷新
  if (!canRefresh.value || refreshing.value) {
    // 立即停止刷新动画
    refreshing.value = false;
    return;
  }
  
  refreshing.value = true;
  loadFavoritesData();
}

// 严格的图片 URL 格式化
function formatPicUrl(pic) {
  if (!pic) return '';
  
  let url = '';
  if (typeof pic === 'string') {
    url = pic;
  } else if (typeof pic.url === 'string') {
    url = pic.url;
  } else if (typeof pic.src === 'string') {
    url = pic.src;
  }
  
  return (url || '').trim();
}

// 深度清理数据
function cleanFavoriteItem(item) {
  if (!item || typeof item !== 'object') {
    return {
      _id: '',
      article_id: '',
      create_date: new Date(),
      article: {
        content: '内容已删除',
        pics: []
      }
    };
  }

  const article = item.article || {};
  
  let content = '内容已删除';
  if (typeof article.content === 'string') {
    content = article.content.trim() || '内容已删除';
  }

  const rawPics = Array.isArray(article.pics) ? article.pics : [];
  const cleanedPics = rawPics
    .map((pic, index) => {
      try {
        const url = formatPicUrl(pic);
        if (!url) return null;

        return {
          url: url,
          id: `pic_${item._id}_${index}_${Date.now()}`,
          width: Number(pic.width) || 200,
          height: Number(pic.height) || 200
        };
      } catch (error) {
        console.warn('清理图片数据失败:', error);
        return null;
      }
    })
    .filter(pic => pic !== null)
    .slice(0, 9);

  return {
    _id: String(item._id || ''),
    article_id: String(item.article_id || ''),
    create_date: item.create_date || new Date(),
    article: {
      content: content,
      pics: cleanedPics
    }
  };
}

onMounted(() => {
  loadFavoritesData();
});

// 辅助方法（模板中使用）
function getItemContent(item) {
  return item.article?.content ? formatContent(item.article.content) : '内容已删除';
}

function hasPics(item) {
  return item.article?.pics?.length > 0;
}

function getDisplayPics(item) {
  return item.article?.pics?.slice(0, 3) || [];
}

function getAllPics(item) {
  return item.article?.pics || [];
}

function getPicCount(item) {
  return item.article?.pics?.length || 0;
}

function formatContent(content) {
  if (!content) return '';
  const trimmed = content.trim();
  return trimmed.length > 80 ? trimmed.substring(0, 80) + '...' : trimmed;
}

// 图片加载处理
function onImageLoad(e) {
  const { url, index } = e.currentTarget.dataset;
  console.log('图片加载成功:', url);
}

function onImageError(e) {
  const { url, index } = e.currentTarget.dataset;
  console.warn('图片加载失败:', url);
}

// 防抖的图片预览
let previewTimer = null;
function previewImage(pics, currentIndex) {
  if (previewTimer) {
    clearTimeout(previewTimer);
  }
  
  previewTimer = setTimeout(() => {
    if (!pics || pics.length === 0) return;

    const urls = pics
      .map(pic => formatPicUrl(pic))
      .filter(url => url && typeof url === 'string');

    if (urls.length === 0) return;

    uni.previewImage({
      urls,
      current: currentIndex
    });
  }, 150);
}

// 加载收藏数据
async function loadFavoritesData() {
  try {
    loading.value = true;
    const favorites = await favoritesManager.getFavoritesList(1, 100);

    favoritesList.value = favorites.map(cleanFavoriteItem);
    
    await nextTick();
    
  } catch (error) {
    console.error('加载收藏列表失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

// 加载更多
function loadMore() {
  if (loadingMore.value || finished.value) return;
  loadingMore.value = true;
  setTimeout(() => {
    loadingMore.value = false;
  }, 500);
}

// 移除收藏
async function removeFavorite(articleId) {
  const { confirm } = await uni.showModal({
    title: '取消收藏',
    content: '确定要取消收藏这篇文章吗？',
    confirmColor: '#FF5B5B'
  });

  if (confirm) {
    try {
      const success = await favoritesManager.removeFavorite(articleId);
      if (success) {
        uni.showToast({ title: '取消收藏成功', icon: 'success' });
        loadFavoritesData();
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      uni.showToast({ title: '取消收藏失败', icon: 'none' });
    }
  }
}

// 返回
function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
$primary: #4F8BFF;
$radius: 32rpx;
$shadow: 0 8rpx 32rpx rgba(0, 0, 0, .08);

.favorites-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #CDE5FF 0%, #E9F3FF 100%);
  display: flex;
  flex-direction: column;
}

.head {
  position: sticky;
  top: 0;
  z-index: 9;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  background: rgba(255, 255, 255, .65);
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, .05);
}

.body {
  flex: 1;
  background-color: rgba(255, 255, 255, .65);
  border-radius: $radius $radius 0 0;
  overflow: hidden;
  margin-top: -16rpx;
}

.scrollBox {
  height: 100%;
  padding: 24rpx 5rpx 40rpx;
}

.skeleton {
  .skeleton-card {
    height: 200rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.2s ease infinite;
    margin-bottom: 24rpx;
    border-radius: $radius;
  }
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}

.card {
  background: #fff;
  border-radius: $radius;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: $shadow;
  transition: all 0.2s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;

  &:active {
    transform: scale(0.99) translateZ(0);
  }

  .content {
    margin-bottom: 20rpx;
    
    .text {
      font-size: 34rpx;
      line-height: 1.7;
      color: #222;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }
  }

  .pics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
    margin-bottom: 20rpx;
    position: relative;

    .pic {
      width: 100%;
      height: 200rpx;
      border-radius: 12rpx;
      background-color: #f5f5f5;
      overflow: hidden;
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000;
      -webkit-transform: translateZ(0);
      -webkit-backface-visibility: hidden;
      -webkit-perspective: 1000;
      
      &:last-child:nth-child(3n+1) {
        grid-column: span 3;
        width: 100%;
        height: 300rpx;
      }
      
      &:only-child {
        grid-column: span 3;
        width: 100%;
        height: 300rpx;
      }
    }

    .pic-count {
      position: absolute;
      bottom: 12rpx;
      right: 12rpx;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      z-index: 2;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .time {
      display: flex;
      align-items: center;
      color: #8B9AB6;
      font-size: 24rpx;
      .time-text {
        margin-left: 8rpx;
      }
    }

    .action {
      display: flex;
      align-items: center;
      color: #FF5B5B;
      font-size: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      background: rgba(255, 91, 91, 0.08);
      transition: all 0.2s ease;

      &:active {
        background: rgba(255, 91, 91, 0.2);
        transform: scale(0.95);
      }

      .action-text {
        margin-left: 8rpx;
      }
    }
  }
}

.footer-status {
  text-align: center;
  padding: 40rpx 0 20rpx;

  .empty {
    padding: 100rpx 0;
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .no-more {
    color: #999;
    font-size: 24rpx;
  }
}

.refresh-indicator {
  padding: 20rpx 0;
  text-align: center;
}

.loading-more {
  padding: 20rpx 0;
}
</style>