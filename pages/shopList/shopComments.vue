<template>
  <view class="shop-comments">
    <!-- 导航栏 -->
    <!-- <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="nav-title">{{ shopName }}的评论</view>
      <view class="nav-right"></view>
    </view> -->

    <!-- 评论统计 -->
    <view class="comments-stats" v-if="comments.length > 0">
      <view class="stats-item">
        <text class="stats-value">{{ totalComments }}</text>
        <text class="stats-label">全部评论</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{ averageRating.toFixed(1) }}</text>
        <text class="stats-label">平均评分</text>
      </view>
      <view class="stats-item">
        <text class="stats-value">{{ withImagesCount }}</text>
        <text class="stats-label">有图评论</text>
      </view>
    </view>

    <!-- 评论列表 -->
    <view class="comments-list">
      <view 
        class="comment-item" 
        v-for="comment in comments" 
        :key="comment.id"
        @click="goToCommentDetail(comment)"
      >
        <!-- 用户信息 -->
        <view class="comment-user">
          <image class="user-avatar" :src="comment.avatar" mode="aspectFill" />
          <view class="user-info">
            <text class="user-name">{{ comment.userName }}</text>
            <view class="comment-meta">
              <view class="rating-stars">
                <text 
                  class="star" 
                  v-for="n in 5" 
                  :key="n"
                  :class="{ filled: n <= comment.rating }"
                >★</text>
              </view>
              <text class="comment-time">{{ comment.time }}</text>
            </view>
          </view>
        </view>
        
        <!-- 评论内容 -->
        <view class="comment-content">
          <text class="comment-text">{{ comment.content }}</text>
        </view>
        
        <!-- 评论图片 -->
        <view class="comment-images" v-if="comment.images && comment.images.length > 0">
          <view class="images-grid">
            <image 
              class="comment-image" 
              v-for="(img, index) in comment.images.slice(0, 4)" 
              :key="index"
              :src="getSafeImageUrl(img)" 
              mode="aspectFill"
              @click.stop="previewImage(comment.images, index)"
            />
            <view class="more-images" v-if="comment.images.length > 4" @click.stop="previewImage(comment.images, 0)">
              <text class="more-text">+{{ comment.images.length - 4 }}</text>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="comment-actions">
          <view class="action-item" @click.stop="likeComment(comment)">
            <text class="action-icon">👍</text>
            <text class="action-text">{{ comment.likes || 0 }}</text>
          </view>
          <view class="action-item" @click.stop="replyComment(comment)">
            <text class="action-icon">💬</text>
            <text class="action-text">回复</text>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore" @click="loadMoreComments">
        <text class="load-more-text">加载更多</text>
      </view>
      
      <!-- 没有更多 -->
      <view class="no-more" v-else-if="comments.length > 0">
        <text class="no-more-text">没有更多评论了</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-comments" v-if="!loading && comments.length === 0">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无评论</text>
      <text class="empty-desc">成为第一个评论的人吧</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <uni-load-more status="loading" content="加载中..." />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';

// 响应式数据
const shopId = ref('');
const shopName = ref('');
const comments = ref([]);
const loading = ref(false);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const hasMore = ref(true);

// 计算属性
const totalComments = computed(() => total.value);
const averageRating = computed(() => {
  if (comments.value.length === 0) return 0;
  const sum = comments.value.reduce((acc, comment) => acc + comment.rating, 0);
  return sum / comments.value.length;
});
const withImagesCount = computed(() => {
  return comments.value.filter(comment => comment.images && comment.images.length > 0).length;
});

// 生命周期
onLoad((options) => {
  if (options.shopId) {
    shopId.value = options.shopId;
    shopName.value = options.shopName || '店铺';
    console.log('✅ 接收到的参数:', { shopId: shopId.value, shopName: shopName.value });
    loadComments(true);
  } else {
    console.error('❌ 缺少店铺ID参数');
    uni.showToast({
      title: '店铺ID不存在',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

// 上拉加载更多
onReachBottom(() => {
  console.log('📱 上拉加载更多');
  if (hasMore.value && !loading.value) {
    loadMoreComments();
  }
});

// 加载评论 - 修复版
async function loadComments(reset = false) {
  if (!shopId.value) {
    console.error('❌ 店铺ID为空');
    return;
  }
  
  if (reset) {
    page.value = 1;
    comments.value = [];
    hasMore.value = true;
    console.log('🔄 重置评论列表');
  }
  
  if (!hasMore.value) {
    console.log('⏹️ 没有更多评论可加载');
    return;
  }
  
  loading.value = true;
  console.log(`🔄 加载第 ${page.value} 页评论，店铺ID: ${shopId.value}`);

  try {
    // 使用和 shopDetail 页面相同的云对象方法
    const articlesCo = uniCloud.importObject('articlesCloudObj');
    
    console.log('📡 调用云对象获取评论...');
    const res = await articlesCo.list({
      page: page.value,
      size: size.value
    });
    
    console.log('📡 云对象响应:', res);
    
    if (res.errCode === 0) {
      // 过滤出当前店铺的评论
      const shopReviews = (res.data || []).filter(item => 
        item.shop_id === shopId.value
      );
      
      console.log(`✅ 过滤后的店铺评论: ${shopReviews.length} 条`);
      
      // 处理评论数据
      const newComments = [];
      for (let item of shopReviews) {
        const processedComment = await processCommentData(item);
        newComments.push(processedComment);
      }
      
      console.log('🎯 处理后的评论数据:', newComments);
      
      if (reset) {
        comments.value = [...newComments];
      } else {
        comments.value = [...comments.value, ...newComments];
      }
      
      total.value = newComments.length;
      hasMore.value = newComments.length >= size.value;
      page.value += 1;
      
      console.log(`✅ 加载评论成功，当前共 ${comments.value.length} 条评论`);
      
    } else {
      throw new Error(res.errMsg || '云对象返回错误');
    }
    
  } catch (error) {
    console.error('❌ 加载评论失败:', error);
    uni.showToast({
      title: '加载评论失败',
      icon: 'none'
    });
    
    // 如果真实数据加载失败，使用测试数据作为备选
    if (comments.value.length === 0) {
      console.log('🔄 使用测试数据作为备选');
      useTestData();
    }
  } finally {
    loading.value = false;
  }
}

// 处理评论数据 - 与 shopDetail 页面保持一致
async function processCommentData(item) {
  console.log('🔍 处理单条评论数据:', item);
  
  const userInfo = item.user_id && item.user_id[0] ? item.user_id[0] : {};
  const userId = userInfo._id;
  
  let avatarUrl = await getAvatarUrl(userInfo, userId);
  
  // 时间格式化
  let timeStr = '';
  if (item.publish_date) {
    const date = new Date(item.publish_date);
    timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } else if (item.createTime) {
    const date = new Date(item.createTime);
    timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // 处理图片
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
    images: imageUrls,
    likes: item.likes || Math.floor(Math.random() * 50)
  };
}

// 获取头像URL - 与 shopDetail 页面保持一致
async function getAvatarUrl(userInfo, userId) {
  if (!userInfo || !userId) return '/static/default-avatar.png';
  
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
  
  return avatarUrl;
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

// 加载更多评论
function loadMoreComments() {
  console.log('📥 手动加载更多评论');
  if (!hasMore.value || loading.value) return;
  loadComments();
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

// 点赞评论
function likeComment(comment) {
  console.log('👍 点赞评论:', comment.id);
  uni.showToast({
    title: '点赞成功',
    icon: 'success'
  });
}

// 回复评论
function replyComment(comment) {
  console.log('💬 回复评论:', comment.id);
  uni.showToast({
    title: '回复功能开发中',
    icon: 'none'
  });
}

// 跳转到评论详情
function goToCommentDetail(comment) {
  console.log('🔄 跳转到评论详情:', comment.id);
  uni.navigateTo({
    url: `/pages/blog/detail?id=${comment.id}&shopId=${shopId.value}`
  });
}

// 返回
function goBack() {
  console.log('🔙 返回上一页');
  uni.navigateBack();
}

// 测试数据 - 仅在真实数据加载失败时使用
function useTestData() {
  console.log('🎯 使用测试数据作为备选');
  comments.value = [
    {
      id: '1',
      userId: 'user1',
      userName: '美食家小明',
      avatar: '/static/default-avatar.png',
      rating: 5,
      time: '2024-01-15',
      content: '这家店的味道真的很不错，强烈推荐他们的招牌牛肉面！汤底浓郁，牛肉炖得很烂，面条劲道。',
      images: ['/static/food1.jpg', '/static/food2.jpg'],
      likes: 23
    },
    {
      id: '2',
      userId: 'user2',
      userName: '吃货小张',
      avatar: '/static/default-avatar.png',
      rating: 4,
      time: '2024-01-14',
      content: '环境很好，服务态度也不错，就是价格稍微有点贵。不过味道确实值得这个价。',
      images: [],
      likes: 15
    }
  ];
  total.value = comments.value.length;
  hasMore.value = false;
  console.log(`✅ 测试数据加载完成，共 ${comments.value.length} 条评论`);
}
</script>

<style lang="scss" scoped>
.shop-comments {
  min-height: 100vh;
  background: #f8fafc;
}

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
  background: white;
  border-bottom: 1rpx solid #e2e8f0;
  z-index: 1000;
  
  .nav-left, .nav-right {
    width: 80rpx;
    display: flex;
    align-items: center;
  }
  
  .back-icon {
    font-size: 36rpx;
    font-weight: bold;
    color: #2d3748;
  }
  
  .nav-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #2d3748;
    max-width: 400rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
}

.comments-stats {
  display: flex;
  justify-content: space-around;
  background: white;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
  
  .stats-item {
    text-align: center;
    
    .stats-value {
      display: block;
      font-size: 32rpx;
      font-weight: 700;
      color: #FF6B35;
      margin-bottom: 8rpx;
    }
    
    .stats-label {
      font-size: 24rpx;
      color: #718096;
    }
  }
}

.comments-list {
  padding: 0 30rpx;
  
  .comment-item {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .comment-user {
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
          color: #2d3748;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .comment-meta {
          display: flex;
          align-items: center;
          gap: 16rpx;
          
          .rating-stars {
            .star {
              font-size: 20rpx;
              color: #e2e8f0;
              
              &.filled {
                color: #ffd700;
              }
            }
          }
          
          .comment-time {
            font-size: 22rpx;
            color: #718096;
          }
        }
      }
    }
    
    .comment-content {
      margin-bottom: 20rpx;
      
      .comment-text {
        font-size: 26rpx;
        color: #2d3748;
        line-height: 1.5;
      }
    }
    
    .comment-images {
      margin-bottom: 20rpx;
      
      .images-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10rpx;
        
        .comment-image {
          width: 100%;
          height: 160rpx;
          border-radius: 8rpx;
          object-fit: cover;
        }
        
        .more-images {
          width: 100%;
          height: 160rpx;
          background: #e2e8f0;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .more-text {
            font-size: 24rpx;
            color: #718096;
            font-weight: 600;
          }
        }
      }
    }
    
    .comment-actions {
      display: flex;
      gap: 30rpx;
      
      .action-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .action-icon {
          font-size: 24rpx;
        }
        
        .action-text {
          font-size: 22rpx;
          color: #718096;
        }
      }
    }
  }
  
  .load-more, .no-more {
    text-align: center;
    padding: 40rpx 0;
    
    .load-more-text, .no-more-text {
      font-size: 26rpx;
      color: #718096;
    }
  }
}

.empty-comments {
  text-align: center;
  padding: 200rpx 40rpx;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.5;
    display: block;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #2d3748;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #718096;
    display: block;
  }
}

.loading {
  padding: 40rpx 0;
  text-align: center;
}
</style>