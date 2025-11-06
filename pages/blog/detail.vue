<template>
  <view class="detailLayout">
    <!-- 头部标签 -->
    <view class="soupDetail">
      <self-tab-group />
      <!-- 文章内容 -->
      <view class="content" v-if="article">
        <view class="userinfo">
          <image
            class="avatar"
            :src="getUserAvatar(article.user_id[0])"
            mode="aspectFill"
            @error="handleAvatarError"
          />
          <text class="username">{{ article.user_id[0]?.nickname || '匿名' }}</text>
          <text class="time">
            <uni-dateformat
              :date="article.publish_date"
              format="MM-dd hh:mm"
              :threshold="[60000, 3600000*24*30]"
            />
          </text>
        </view>

        <text class="text">{{ article.content }}</text>

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
      </view>
      
      <!-- 加载状态 -->
      <view v-else class="loading">加载中...</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

/* ---------- 数据 ---------- */
const article = ref(null)
const loading = ref(false)

// 用户头像缓存
const userAvatarCache = ref(new Map())

/* ---------- 生命周期 ---------- */
onLoad((options) => {
  if (options.id) {
    getArticleDetail(options.id)
  } else {
    uni.showToast({ title: '缺少文章ID', icon: 'none' })
    uni.navigateBack()
  }
})

/* ---------- 云对象 ---------- */
const articlesCloudObj = uniCloud.importObject('articlesCloudObj')

/* ---------- 监听用户信息更新 ---------- */
const setupUserInfoListeners = () => {
  uni.$on('userInfoUpdated', (data) => {
    console.log('详情页面收到用户信息更新:', data)
    updateUserAvatarInDetail(data)
  })
}

// 更新详情页面的用户头像
const updateUserAvatarInDetail = (userData) => {
  if (!userData.userId || !userData.avatar || !article.value) return
  
  console.log('开始更新详情页面用户头像，用户ID:', userData.userId)
  
  // 更新缓存
  userAvatarCache.value.set(userData.userId, userData.avatar)
  
  // 检查当前文章的用户是否匹配
  if (article.value.user_id && 
      article.value.user_id[0] && 
      article.value.user_id[0]._id === userData.userId) {
    
    console.log('更新详情页面头像')
    
    // 更新头像数据
    if (!article.value.user_id[0].avatar_file) {
      article.value.user_id[0].avatar_file = {}
    }
    article.value.user_id[0].avatar_file.url = userData.avatar
    article.value.user_id[0].avatar_url = userData.avatar
    
    // 强制触发视图更新
    article.value = { ...article.value }
  }
}

// 获取用户头像（处理云存储URL）
const getUserAvatar = (user) => {
  if (!user || !user._id) return '/static/defAvatar.png'
  
  const userId = user._id
  
  // 1. 优先检查缓存
  if (userAvatarCache.value.has(userId)) {
    return userAvatarCache.value.get(userId)
  }
  
  // 2. 检查用户对象的头像数据
  let avatarUrl = '/static/defAvatar.png'
  
  // 先检查直接的头像URL（已经转换过的）
  if (user.avatar_url && user.avatar_url.startsWith('http')) {
    avatarUrl = user.avatar_url
  }
  // 检查云存储的头像文件（需要转换）
  else if (user.avatar_file && user.avatar_file.url) {
    const fileUrl = user.avatar_file.url
    
    // 如果是云存储URL，需要异步转换，这里先返回默认头像，转换后更新
    if (fileUrl.startsWith('cloud:')) {
      // 异步转换URL
      convertCloudFileUrl(fileUrl, userId)
      return '/static/defAvatar.png'
    }
    // 如果是HTTP URL，直接使用
    else if (fileUrl.startsWith('http')) {
      avatarUrl = fileUrl
    }
  }
  // 检查旧的avatar字段（兼容性）
  else if (user.avatar && user.avatar.startsWith('http')) {
    avatarUrl = user.avatar
  }
  
  // 缓存结果
  if (avatarUrl !== '/static/defAvatar.png') {
    userAvatarCache.value.set(userId, avatarUrl)
  }
  
  return avatarUrl
}

// 异步转换云存储URL
const convertCloudFileUrl = async (fileUrl, userId) => {
  try {
    console.log('开始转换云存储URL:', fileUrl)
    const result = await uniCloud.getTempFileURL({
      fileList: [fileUrl]
    })
    
    if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
      const httpUrl = result.fileList[0].tempFileURL
      console.log('云存储URL转换成功:', httpUrl)
      
      // 更新缓存
      userAvatarCache.value.set(userId, httpUrl)
      
      // 更新详情页面的头像
      if (article.value && 
          article.value.user_id && 
          article.value.user_id[0] && 
          article.value.user_id[0]._id === userId) {
        
        if (!article.value.user_id[0].avatar_file) {
          article.value.user_id[0].avatar_file = {}
        }
        article.value.user_id[0].avatar_file.url = httpUrl
        article.value.user_id[0].avatar_url = httpUrl
        
        // 强制更新视图
        article.value = { ...article.value }
      }
    }
  } catch (error) {
    console.error('转换云存储URL失败:', error)
  }
}

// 头像加载失败处理
const handleAvatarError = (event) => {
  console.log('头像加载失败:', event)
  // 可以在这里设置默认头像
}

// 初始化用户头像缓存
const initUserAvatarCache = () => {
  if (!article.value || !article.value.user_id || !article.value.user_id[0]) return
  
  const user = article.value.user_id[0]
  const userId = user._id
  
  let avatarUrl = '/static/defAvatar.png'
  
  // 按优先级检查头像来源
  if (user.avatar_url && user.avatar_url.startsWith('http')) {
    avatarUrl = user.avatar_url
  } else if (user.avatar_file && user.avatar_file.url) {
    const fileUrl = user.avatar_file.url
    if (fileUrl.startsWith('http')) {
      avatarUrl = fileUrl
    } else if (fileUrl.startsWith('cloud:')) {
      // 异步转换云存储URL
      convertCloudFileUrl(fileUrl, userId)
    }
  } else if (user.avatar && user.avatar.startsWith('http')) {
    avatarUrl = user.avatar
  }
  
  if (avatarUrl !== '/static/defAvatar.png') {
    userAvatarCache.value.set(userId, avatarUrl)
    console.log(`缓存用户 ${userId} 头像:`, avatarUrl)
  }
}

async function getArticleDetail(id) {
  loading.value = true
  try {
    const { errCode, data, errMsg } = await articlesCloudObj.getDetail(id)
    if (errCode === 0) {
      article.value = data
      
      // 初始化头像缓存
      initUserAvatarCache()
      
      // 调试：显示用户信息
      if (data.user_id && data.user_id[0]) {
        const user = data.user_id[0]
        console.log('详情页面用户信息:', {
          id: user._id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          avatar_file: user.avatar_file,
          avatar: user.avatar
        })
      }
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

/* ---------- 事件 ---------- */
function preview(pics, idx) {
  uni.previewImage({
    urls: pics.map(p => p.url),
    current: idx
  })
}

// 页面加载时设置监听
onMounted(() => {
  console.log('详情页面加载')
  setupUserInfoListeners()
  
  // 检查是否有待更新的用户信息
  const pendingUpdate = uni.getStorageSync('userInfoPendingUpdate')
  if (pendingUpdate) {
    console.log('详情页面发现待更新的用户信息:', pendingUpdate)
    updateUserAvatarInDetail(pendingUpdate)
    uni.removeStorageSync('userInfoPendingUpdate')
  }
})

// 页面卸载时移除监听
onUnmounted(() => {
  console.log('详情页面卸载')
  uni.$off('userInfoUpdated')
})

// 页面显示时重新检查更新
onShow(() => {
  console.log('详情页面显示')
  // 检查是否有新的用户信息更新
  const lastUpdate = uni.getStorageSync('lastUserInfoUpdate')
  if (lastUpdate) {
    console.log('详情页面显示时检查到用户信息更新:', lastUpdate)
    updateUserAvatarInDetail(lastUpdate)
  }
})
</script>

<style lang="scss" scoped>
.detailLayout {
  min-height: 100vh;
  background: #fff;
}

.soupDetail {
  padding: 50rpx 30rpx;
  border-bottom: 12rpx solid #f7f7f7;
}

.content {
  margin-top: 30rpx;

  .userinfo {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;

    .avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      margin-right: 16rpx;
    }

    .username {
      font-size: 30rpx;
      font-weight: 600;
      color: #4f8bff;
    }

    .time {
      margin-left: auto;
      font-size: 24rpx;
      color: #8b9ab6;
    }
  }

  .text {
    font-size: 34rpx;
    line-height: 1.8em;
    color: #222;
  }

  .pics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
    margin-top: 20rpx;

    .pic {
      width: 100%;
      height:100%;
      aspect-ratio: 1;
      border-radius: 12rpx;
    }
  }
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #999;
}
</style>