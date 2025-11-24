<template>
  <view class="detailLayout">
    <!-- 头部标签 -->
    <view class="soupDetail">
      <!-- <self-tab-group /> -->
      <!-- 文章内容 -->
      <view class="content" v-if="article">
        <!-- 商家评价信息 - 新版设计 -->
        <view v-if="shopInfo" class="shop-review-section">
          <!-- 商家卡片 -->
          <view class="shop-card">
            <!-- 商家头部 -->
            <view class="shop-header">
              <view class="shop-avatar-container">
                <image 
                  class="shop-avatar" 
                  :src="getShopAvatar(shopInfo)"
                  mode="aspectFill"
                  @error="handleShopAvatarError"
                />
                <view class="shop-badge" v-if="shopInfo.isVerified">
                  <text class="badge-icon">✓</text>
                </view>
              </view>
              
              <view class="shop-main-info">
                <view class="shop-title-row">
                  <text class="shop-name">{{ shopInfo.shopName || '未知商家' }}</text>
                  <view class="rating-display" v-if="shopInfo.rating > 0">
                    <text class="rating-star">★</text>
                    <text class="rating-value">{{ (shopInfo.rating / 10).toFixed(1) }}</text>
                  </view>
                </view>
                
                <view class="shop-tags">
                  <view class="status-tag" :class="{ open: isShopOpen }">
                    <text class="status-dot" :class="{ open: isShopOpen }"></text>
                    <text class="status-text">{{ isShopOpen ? '营业中' : '已打烊' }}</text>
                  </view>
                  <text class="category-tag">{{ shopInfo.category || '美食' }}</text>
                </view>
              </view>
            </view>

            <!-- 商家数据 -->
            <view class="shop-stats">
              <view class="stat-item">
                <text class="stat-value">{{ formatNumber(shopInfo.monthlyOrders || 0) }}</text>
                <text class="stat-label">月售</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-value">{{ shopInfo.deliveryTime || '30-40' }}</text>
                <text class="stat-label">分钟</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-value">{{ (shopInfo.deliveryFee || 0) === 0 ? '免费' : `¥${shopInfo.deliveryFee}` }}</text>
                <text class="stat-label">配送</text>
              </view>
            </view>

            <!-- 商家信息 -->
            <view class="shop-details">
              <view class="detail-item" v-if="shopInfo.address">
                <uni-icons type="location-filled" size="16" color="#666" />
                <text class="detail-text">{{ shopInfo.address }}</text>
              </view>
              <view class="detail-item" v-if="shopInfo.businessHours">
                <uni-icons type="time-filled" size="16" color="#666" />
                <text class="detail-text">{{ shopInfo.businessHours }}</text>
              </view>
              <view class="detail-item" v-if="shopInfo.phone">
                <uni-icons type="phone-filled" size="16" color="#666" />
                <text class="detail-text">{{ shopInfo.phone }}</text>
                <text class="contact-btn" @click="handlePhoneCall">拨打</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="shop-actions">
              <view class="action-btn primary" @click="navigateToShop">
                <uni-icons type="shop" size="18" color="#fff" />
                <text class="btn-text">进入店铺</text>
              </view>
              <view class="action-btn secondary" @click="showContact">
                <uni-icons type="chat" size="18" color="#FF6B35" />
                <text class="btn-text">评论</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 用户信息区域 -->
        <view class="userinfo">
          <view class="user-avatar-container">
            <image
              class="avatar"
              :src="getUserAvatar(article.user_id[0])"
              mode="aspectFill"
              @error="handleAvatarError"
            />
          </view>
          <view class="user-info-main">
            <text class="username">{{ article.user_id[0]?.nickname || '匿名' }}</text>
            <text class="time">
              <uni-dateformat
                :date="article.publish_date"
                format="MM-dd hh:mm"
                :threshold="[60000, 3600000*24*30]"
              />
            </text>
          </view>
        </view>

        <!-- 评论内容 -->
        <view class="comment-content">
          <text class="comment-text">{{ article.content }}</text>
        </view>

        <!-- 图片 -->
        <view v-if="article.pics?.length" class="pics">
          <image
            v-for="(pic, idx) in article.pics"
            :key="idx"
            class="pic"
            :src="pic.url"
            mode="aspectFill"
            @click.stop="preview(article.pics, idx)"
          />
        </view>

        <!-- 操作工具栏 -->
        <view class="action-toolbar">
          <view class="toolbar-item" @click="toggleFavorite">
            <view class="icon-wrapper" :class="{ favorited: isFavorited }">
              <uni-icons 
                :type="isFavorited ? 'heart-filled' : 'heart'" 
                :color="isFavorited ? '#fff' : '#8B9AB6'" 
                size="20" 
              />
            </view>
            <text class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
          </view>
          
          <view class="toolbar-item" @click="shareArticle">
            <view class="icon-wrapper">
              <uni-icons type="redo" size="20" color="#8B9AB6" />
            </view>
            <text class="btn-text">分享</text>
          </view>

          <view 
            v-if="isPermission(article.user_id[0]?._id)"
            class="toolbar-item" 
            @click="removeArticle"
          >
            <view class="icon-wrapper delete">
              <uni-icons type="trash" size="20" color="#FF5B5B" />
            </view>
            <text class="btn-text">删除</text>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-else class="loading">
        <uni-load-more status="loading" content="加载中..."></uni-load-more>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isPermission } from '@/utils/common.js'
import favoritesManager from '@/common/style/favorites.js'

/* ---------- 数据 ---------- */
const article = ref(null)
const loading = ref(false)
const shopInfo = ref(null)
const shopId = ref('')
const isFavorited = ref(false)
const userAvatarCache = ref(new Map())

// 计算店铺是否营业
const isShopOpen = computed(() => {
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

/* ---------- 生命周期 ---------- */
onLoad((options) => {
  if (options.id) {
    if (options.shopId) {
      shopId.value = options.shopId
      getShopDetail(shopId.value)
    }
    getArticleDetail(options.id)
  } else {
    uni.showToast({ title: '缺少文章ID', icon: 'none' })
    uni.navigateBack()
  }
})

/* ---------- 云对象 ---------- */
const articlesCloudObj = uniCloud.importObject('articlesCloudObj')

/* ---------- 商家相关函数 ---------- */
async function getShopDetail(shopId) {
  if (!shopId) return
  
  try {
    const res = await uniCloud.callFunction({
      name: 'getShopDetail',
      data: { shopId }
    })

    if (res.result?.errCode === 0) {
      shopInfo.value = res.result.data
      if (shopInfo.value.shopPic) {
        await processShopImage(shopInfo.value)
      }
    }
  } catch (error) {
    console.error('加载商家信息异常:', error)
  }
}

async function processShopImage(shop) {
  if (!shop.shopPic) return
  try {
    if (shop.shopPic.startsWith('cloud:')) {
      const result = await uniCloud.getTempFileURL({
        fileList: [shop.shopPic]
      })
      if (result.fileList && result.fileList[0]?.tempFileURL) {
        shop.shopPic = result.fileList[0].tempFileURL
      }
    }
  } catch (error) {
    console.error('转换商家图片URL失败:', error)
  }
}

const getShopAvatar = (shop) => {
  return shop?.shopPic || '/static/default-shop.jpg'
}

const handleShopAvatarError = (event) => {
  event.target.src = '/static/default-shop.jpg'
}

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

function handlePhoneCall() {
  if (!shopInfo.value?.phone) return
  uni.makePhoneCall({
    phoneNumber: shopInfo.value.phone,
    fail: () => {
      uni.showToast({ title: '无法拨打电话', icon: 'none' })
    }
  })
}

function navigateToShop() {
  if (!shopInfo.value?._id) return
  uni.navigateTo({
    url: `/pages/shopList/shopDetail?id=${shopInfo.value._id}`
  })
}

function showContact() {
  if (!shopInfo.value) return
  uni.navigateTo({
    url: `/pages/blog/edit?shopId=${shopInfo.value._id}`
  })
}

/* ---------- 用户头像相关函数 ---------- */
const setupUserInfoListeners = () => {
  uni.$on('userInfoUpdated', updateUserAvatarInDetail)
}

const updateUserAvatarInDetail = (userData) => {
  if (!userData.userId || !userData.avatar || !article.value) return
  userAvatarCache.value.set(userData.userId, userData.avatar)
  
  if (article.value.user_id && article.value.user_id[0]?._id === userData.userId) {
    if (!article.value.user_id[0].avatar_file) {
      article.value.user_id[0].avatar_file = {}
    }
    article.value.user_id[0].avatar_file.url = userData.avatar
    article.value.user_id[0].avatar_url = userData.avatar
    article.value = { ...article.value }
  }
}

const getUserAvatar = (user) => {
  if (!user || !user._id) return '/static/defAvatar.png'
  const userId = user._id
  
  if (userAvatarCache.value.has(userId)) {
    return userAvatarCache.value.get(userId)
  }
  
  let avatarUrl = '/static/defAvatar.png'
  if (user.avatar_url && user.avatar_url.startsWith('http')) {
    avatarUrl = user.avatar_url
  } else if (user.avatar_file?.url) {
    const fileUrl = user.avatar_file.url
    if (fileUrl.startsWith('cloud:')) {
      convertCloudFileUrl(fileUrl, userId)
      return '/static/defAvatar.png'
    } else if (fileUrl.startsWith('http')) {
      avatarUrl = fileUrl
    }
  } else if (user.avatar?.startsWith('http')) {
    avatarUrl = user.avatar
  }
  
  if (avatarUrl !== '/static/defAvatar.png') {
    userAvatarCache.value.set(userId, avatarUrl)
  }
  
  return avatarUrl
}

const convertCloudFileUrl = async (fileUrl, userId) => {
  try {
    const result = await uniCloud.getTempFileURL({ fileList: [fileUrl] })
    if (result.fileList?.[0]?.tempFileURL) {
      const httpUrl = result.fileList[0].tempFileURL
      userAvatarCache.value.set(userId, httpUrl)
      
      if (article.value?.user_id?.[0]?._id === userId) {
        if (!article.value.user_id[0].avatar_file) {
          article.value.user_id[0].avatar_file = {}
        }
        article.value.user_id[0].avatar_file.url = httpUrl
        article.value.user_id[0].avatar_url = httpUrl
        article.value = { ...article.value }
      }
    }
  } catch (error) {
    console.error('转换云存储URL失败:', error)
  }
}

const handleAvatarError = (event) => {
  event.target.src = '/static/defAvatar.png'
}

const initUserAvatarCache = () => {
  if (!article.value?.user_id?.[0]) return
  const user = article.value.user_id[0]
  const userId = user._id
  
  let avatarUrl = '/static/defAvatar.png'
  if (user.avatar_url?.startsWith('http')) {
    avatarUrl = user.avatar_url
  } else if (user.avatar_file?.url) {
    const fileUrl = user.avatar_file.url
    if (fileUrl.startsWith('http')) {
      avatarUrl = fileUrl
    } else if (fileUrl.startsWith('cloud:')) {
      convertCloudFileUrl(fileUrl, userId)
    }
  } else if (user.avatar?.startsWith('http')) {
    avatarUrl = user.avatar
  }
  
  if (avatarUrl !== '/static/defAvatar.png') {
    userAvatarCache.value.set(userId, avatarUrl)
  }
}

/* ---------- 文章操作功能 ---------- */
async function getArticleDetail(id) {
  loading.value = true
  try {
    const { errCode, data, errMsg } = await articlesCloudObj.getDetail(id)
    if (errCode === 0) {
      article.value = data
      initUserAvatarCache()
      
      if (!data.shop_id && shopId.value) {
        await getShopDetail(shopId.value)
      } else if (data.shop_id) {
        await getShopDetail(data.shop_id)
      }
      
      await checkFavoriteStatus()
    } else {
      uni.showToast({ title: errMsg || '获取文章失败', icon: 'none' })
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    uni.showToast({ title: '网络错误', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function checkFavoriteStatus() {
  try {
    if (!article.value?._id) return
    const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
    if (!userInfo?._id) {
      isFavorited.value = false
      return
    }
    const status = await favoritesManager.checkFavorite(article.value._id)
    isFavorited.value = status
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isFavorited.value = false
  }
}

async function toggleFavorite() {
  try {
    if (!article.value?._id) return
    const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
    if (!userInfo?._id) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    if (isFavorited.value) {
      const success = await favoritesManager.removeFavorite(article.value._id)
      if (success) {
        isFavorited.value = false
        uni.showToast({ title: '取消收藏', icon: 'success' })
      }
    } else {
      const success = await favoritesManager.addFavorite(article.value._id)
      if (success) {
        isFavorited.value = true
        uni.showToast({ title: '收藏成功', icon: 'success' })
      }
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

function shareArticle() {
  uni.share({
    provider: "weixin",
    type: 0,
    title: article.value?.content?.substring(0, 20) + '...' || '分享内容',
    summary: article.value?.content || '',
    href: `/pages/blog/detail?id=${article.value?._id}`,
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '分享失败', icon: 'none' })
    }
  })
}

async function removeArticle() {
  if (!article.value?._id) return
  const { confirm } = await uni.showModal({
    title: '提示',
    content: '确认删除这条内容？',
    confirmColor: '#FF5B5B'
  })
  if (!confirm) return
  
  try {
    const { errCode } = await articlesCloudObj.remove(article.value._id)
    if (errCode === 0) {
      uni.showToast({ title: '删除成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({ title: '删除失败', icon: 'none' })
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

function preview(pics, idx) {
  uni.previewImage({
    urls: pics.map(p => p.url),
    current: idx
  })
}

/* ---------- 页面生命周期 ---------- */
onMounted(() => {
  setupUserInfoListeners()
  const pendingUpdate = uni.getStorageSync('userInfoPendingUpdate')
  if (pendingUpdate) {
    updateUserAvatarInDetail(pendingUpdate)
    uni.removeStorageSync('userInfoPendingUpdate')
  }
})

onUnmounted(() => {
  uni.$off('userInfoUpdated')
})

onShow(() => {
  const lastUpdate = uni.getStorageSync('lastUserInfoUpdate')
  if (lastUpdate) {
    updateUserAvatarInDetail(lastUpdate)
  }
  if (article.value) {
    checkFavoriteStatus()
  }
})
</script>

<style lang="scss" scoped>
.detailLayout {
  min-height: 100vh;
  background: #f8f9fa;
}

.soupDetail {
  padding: 0;
}

.content {
  background: #fff;
  min-height: 100vh;
  
  /* 商家评价区域 - 新版设计 */
  .shop-review-section {
    padding: 24rpx;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    
    .shop-card {
      background: #ffffff;
      border-radius: 24rpx;
      padding: 32rpx;
      box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
      border: 1rpx solid #f1f5f9;
      
      /* 商家头部 */
      .shop-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 24rpx;
        
        .shop-avatar-container {
          position: relative;
          margin-right: 20rpx;
          flex-shrink: 0;
          
          .shop-avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 20rpx;
            border: 3rpx solid #ffffff;
            box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
            background: #f8fafc;
          }
          
          .shop-badge {
            position: absolute;
            bottom: -4rpx;
            right: -4rpx;
            width: 32rpx;
            height: 32rpx;
            background: linear-gradient(135deg, #4299e1, #3182ce);
            border-radius: 50%;
            border: 2rpx solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .badge-icon {
              color: #ffffff;
              font-size: 18rpx;
              font-weight: bold;
            }
          }
        }
        
        .shop-main-info {
          flex: 1;
          min-width: 0;
          
          .shop-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12rpx;
            
            .shop-name {
              font-size: 32rpx;
              font-weight: 700;
              color: #1a202c;
              line-height: 1.2;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 400rpx;
            }
            
            .rating-display {
              display: flex;
              align-items: center;
              background: linear-gradient(135deg, #FFF8E1, #FFECB3);
              padding: 6rpx 12rpx;
              border-radius: 16rpx;
              border: 1rpx solid #FFD54F;
              
              .rating-star {
                color: #FFD700;
                font-size: 24rpx;
                margin-right: 4rpx;
              }
              
              .rating-value {
                font-size: 26rpx;
                color: #FF6B35;
                font-weight: 700;
              }
            }
          }
          
          .shop-tags {
            display: flex;
            align-items: center;
            gap: 12rpx;
            flex-wrap: wrap;
            
            .status-tag {
              display: flex;
              align-items: center;
              padding: 6rpx 12rpx;
              border-radius: 16rpx;
              font-size: 22rpx;
              
              &.open {
                background: #f0fff4;
                color: #22543d;
              }
              
              &:not(.open) {
                background: #fed7d7;
                color: #742a2a;
              }
              
              .status-dot {
                width: 12rpx;
                height: 12rpx;
                border-radius: 50%;
                margin-right: 6rpx;
                
                &.open {
                  background: #48bb78;
                }
                
                &:not(.open) {
                  background: #e53e3e;
                }
              }
              
              .status-text {
                font-size: 22rpx;
                font-weight: 500;
              }
            }
            
            .category-tag {
              background: #ebf8ff;
              color: #2b6cb0;
              padding: 6rpx 12rpx;
              border-radius: 16rpx;
              font-size: 22rpx;
            }
          }
        }
      }
      
      /* 商家数据 */
      .shop-stats {
        display: flex;
        align-items: center;
        background: #f8fafc;
        border-radius: 16rpx;
        padding: 20rpx;
        margin-bottom: 20rpx;
        
        .stat-item {
          flex: 1;
          text-align: center;
          
          .stat-value {
            display: block;
            font-size: 28rpx;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 4rpx;
          }
          
          .stat-label {
            font-size: 22rpx;
            color: #718096;
          }
        }
        
        .stat-divider {
          width: 1rpx;
          height: 32rpx;
          background: #e2e8f0;
        }
      }
      
      /* 商家详情 */
      .shop-details {
        margin-bottom: 24rpx;
        
        .detail-item {
          display: flex;
          align-items: center;
          padding: 12rpx 0;
          border-bottom: 1rpx solid #f7fafc;
          
          &:last-child {
            border-bottom: none;
          }
          
          .detail-text {
            flex: 1;
            font-size: 26rpx;
            color: #4a5568;
            margin-left: 12rpx;
          }
          
          .contact-btn {
            background: #48bb78;
            color: white;
            padding: 8rpx 16rpx;
            border-radius: 12rpx;
            font-size: 22rpx;
            font-weight: 500;
          }
        }
      }
      
      /* 操作按钮 */
      .shop-actions {
        display: flex;
        gap: 16rpx;
        
        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20rpx;
          border-radius: 16rpx;
          font-weight: 600;
          font-size: 26rpx;
          
          &.primary {
            background: linear-gradient(135deg, #FF6B35, #FF8E53);
            color: white;
          }
          
          &.secondary {
            background: #ffffff;
            color: #FF6B35;
            border: 1rpx solid #FF6B35;
          }
          
          .btn-text {
            margin-left: 8rpx;
          }
        }
      }
    }
  }

  /* 用户信息区域 */
  .userinfo {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .user-avatar-container {
      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        border: 2rpx solid #f0f0f0;
      }
    }

    .user-info-main {
      flex: 1;
      
      .username {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .time {
        font-size: 24rpx;
        color: #8b9ab6;
      }
    }
  }

  /* 评论内容样式 */
  .comment-content {
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .comment-text {
      font-size: 36rpx;
      line-height: 1.8em;
      color: #333;
      word-break: break-word;
    }
  }

  /* 图片区域 */
  .pics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .pic {
      width: 100%;
      height: 100%;
      aspect-ratio: 1;
      border-radius: 16rpx;
      background-color: #f5f5f5;
    }
  }

  /* 操作工具栏 */
  .action-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 30rpx;
    
    .toolbar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .icon-wrapper {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        transition: all 0.3s ease;
        
        &.favorited {
          background: #FF5B5B;
        }
        
        &.delete {
          background: #ffeaea;
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
      
      .btn-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .shop-card {
    padding: 24rpx !important;
  }
  
  .shop-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .shop-avatar-container {
      margin-right: 0 !important;
      margin-bottom: 16rpx;
    }
    
    .shop-title-row {
      flex-direction: column;
      gap: 12rpx;
    }
  }
  
  .shop-actions {
    flex-direction: column;
  }
}
</style>