<template>
    <view class="blogList">
       

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
                <!-- 页面标题 - 保持原有样式 -->
                <view class="page-header">
                    <text class="page-title">我的评论</text>
                    <text class="page-subtitle" v-if="currentUserId">用户ID: {{ currentUserId }}</text>
                </view>

                <!-- 下拉刷新指示器 -->
                <view v-if="refreshing" class="refresh-indicator">
                    <uni-load-more status="loading" content="刷新中..."></uni-load-more>
                </view>

                <!-- 骨架屏：首次加载前展示 -->
                <view v-if="loading && commentList.length === 0" class="skeleton">
                    <view v-for="i in 8" :key="i" class="card skeleton-card" />
                </view>

                <!-- 真正的列表 -->
                <view v-else class="list">
                    <view
                        class="card"
                        v-for="item in commentList"
                        :key="item._id"
                        @touchstart="touchStart"
                        @touchend="touchEnd(item._id)"
                        :class="{ 'shop-review': isShopReview(item) }"
                    >
                        <!-- 整个卡片内容区域绑定点击事件 -->
                        <view class="card-content" @click="goToDetail(item)">
                            <!-- 图片区域 -->
                            <view class="image-area">
                                <image
                                    v-if="item.pics?.length"
                                    class="content-image"
                                    :src="item.pics[0]"
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
                                            :src="getUserAvatar(item)"
                                            mode="aspectFill"
                                        />
                                        <text class="username">{{ getUserName(item) }}</text>
                                    </view>
                                    
                                    <!-- 商家头像和名字 -->
                                    <view class="shop-info" v-else>
                                        <image
                                            class="shop-avatar"
                                            :src="getShopAvatar(item)"
                                            mode="aspectFill"
                                            @error="handleShopAvatarError"
                                        />
                                        <text class="shop-name">{{ getShopName(item) }}</text>
                                        <!-- 评分显示 -->
                                        <view class="shop-rating" v-if="item.rating">
                                            <text class="rating-star">★</text>
                                            <text class="rating-value">{{ item.rating }}</text>
                                        </view>
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
                                    v-if="isPermission(item.userInfo?._id)"
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
                        <view v-else-if="finished && commentList.length > 0" class="no-more">
                            <text>--- 我是有底线的 ---</text>
                        </view>
                        <view v-else-if="commentList.length === 0" class="empty">
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
import { ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onLoad, onUnload } from '@dcloudio/uni-app'
import { isPermission } from '@/utils/common.js'
import favoritesManager from '@/common/style/favorites.js'

// 响应式数据
const commentList = ref([])
const currentUserId = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const finished = ref(false)
let page = 1
const size = 8

// 用户头像缓存
const userAvatarCache = ref(new Map())
const MAX_CACHE_SIZE = 30

// 商家信息缓存
const shopInfoCache = ref(new Map())

// 判断是否是商家评价
const isShopReview = (item) => {
    return item.shop_id && item.rating
}

// 获取用户头像
const getUserAvatar = (item) => {
    if (!item.userInfo) return '/static/defAvatar.png'
    
    const userId = item.userInfo._id
    if (!userId) return '/static/defAvatar.png'
    
    // 1. 优先检查缓存
    if (userAvatarCache.value.has(userId)) {
        return userAvatarCache.value.get(userId)
    }
    
    // 2. 检查用户对象的头像数据
    let avatarUrl = '/static/defAvatar.png'
    
    if (item.userInfo.avatar_url && item.userInfo.avatar_url.startsWith('http')) {
        avatarUrl = item.userInfo.avatar_url
    } else if (item.userInfo.avatar_file && item.userInfo.avatar_file.url) {
        const fileUrl = item.userInfo.avatar_file.url
        if (fileUrl.startsWith('http')) {
            avatarUrl = fileUrl
        } else if (fileUrl.startsWith('cloud:')) {
            return '/static/defAvatar.png'
        }
    } else if (item.userInfo.avatar && item.userInfo.avatar.startsWith('http')) {
        avatarUrl = item.userInfo.avatar
    }
    
    if (avatarUrl !== '/static/defAvatar.png') {
        updateAvatarCache(userId, avatarUrl)
    }
    
    return avatarUrl
}

// 获取用户名
const getUserName = (item) => {
    return item.userInfo?.nickname || '匿名用户'
}

// 获取商家头像
const getShopAvatar = (item) => {
    if (!item.shopInfo) return '/static/default-shop.jpg'
    return item.shopInfo.shopPic || '/static/default-shop.jpg'
}

// 获取商家名称
const getShopName = (item) => {
    if (!item.shopInfo) return '加载中...'
    return item.shopInfo.shopName || '未知商家'
}

// 获取评论预览文本
const getCommentPreview = (content) => {
    if (!content) return '暂无评论'
    return content.length > 30 ? content.substring(0, 30) + '...' : content
}

// 商家头像加载失败处理
const handleShopAvatarError = (event) => {
    console.log('商家头像加载失败:', event)
    event.target.src = '/static/default-shop.jpg'
}

// 跳转到详情页
function goToDetail(item) {
    if (!item || !item._id) {
        uni.showToast({ title: '文章信息错误', icon: 'none' })
        return
    }
    
    let url = `/pages/blog/detail?id=${item._id}`
    if (item.shop_id) {
        url += `&shopId=${item.shop_id}`
    }
    
    uni.navigateTo({
        url: url
    })
}

// 切换收藏状态
async function toggleFavorite(articleId, item) {
    try {
        const userInfo = uni.getStorageSync('uni-id-pages-userInfo')
        if (!userInfo || !userInfo._id) {
            uni.showToast({ title: '请先登录', icon: 'none' })
            return
        }
        
        console.log('切换收藏状态:', { articleId, currentStatus: item.isFavorited })
        
        if (item.isFavorited) {
            const success = await favoritesManager.removeFavorite(articleId)
            if (success) {
                item.isFavorited = false
                uni.showToast({ title: '取消收藏', icon: 'success' })
            }
        } else {
            const success = await favoritesManager.addFavorite(articleId)
            if (success) {
                item.isFavorited = true
                uni.showToast({ title: '收藏成功', icon: 'success' })
            }
        }
    } catch (error) {
        console.error('切换收藏状态失败:', error)
        uni.showToast({ title: '操作失败，请重试', icon: 'none' })
    }
}

// 加载商家信息
const loadShopInfo = async (shopId) => {
    if (!shopId) return null
    
    try {
        console.log('开始加载商家信息，shopId:', shopId)
        const res = await uniCloud.callFunction({
            name: 'getShopDetail',
            data: { shopId }
        })

        if (res.result?.errCode === 0) {
            console.log('商家信息加载成功:', res.result.data)
            shopInfoCache.value.set(shopId, res.result.data)
            return res.result.data
        } else {
            console.error('商家信息加载失败:', res.result?.errMsg)
        }
    } catch (error) {
        console.error('加载商家信息异常:', error)
    }
    return null
}

// 批量加载商家信息
const batchLoadShopInfo = async () => {
    const shopIds = commentList.value
        .filter(item => item.shop_id && !shopInfoCache.value.has(item.shop_id))
        .map(item => item.shop_id)
    
    if (shopIds.length === 0) return
    
    console.log('批量加载商家信息，数量:', shopIds.length)
    
    // 逐个加载商家信息
    for (const shopId of shopIds) {
        await loadShopInfo(shopId)
    }
    
    // 更新列表中的商家信息
    commentList.value.forEach((item, index) => {
        if (item.shop_id && shopInfoCache.value.has(item.shop_id)) {
            item.shopInfo = shopInfoCache.value.get(item.shop_id)
            // 强制触发视图更新
            commentList.value[index] = { ...commentList.value[index] }
        }
    })
}

// 头像缓存管理
const updateAvatarCache = (userId, avatarUrl) => {
    if (userAvatarCache.value.size >= MAX_CACHE_SIZE) {
        const firstKey = userAvatarCache.value.keys().next().value
        userAvatarCache.value.delete(firstKey)
    }
    userAvatarCache.value.set(userId, avatarUrl)
}

// 接收页面参数
onLoad(async (options) => {
    console.log('页面参数:', options)
    
    if (options.userId) {
        currentUserId.value = options.userId
    } else {
        const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
        if (userInfoFromStorage && userInfoFromStorage._id) {
            currentUserId.value = userInfoFromStorage._id
        }
    }
    
    console.log('当前用户ID:', currentUserId.value)
    await getData(true)
})

// 加载数据
const getData = async (reset = true) => {
    if (reset) {
        loading.value = true
        page = 1
    } else {
        loadingMore.value = true
    }
    
    try {
        const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
        let res
        
        // 尝试使用 getUserArticles 方法
        try {
            res = await articlesCloudObj.getUserArticles({
                userId: currentUserId.value,
                page: page,
                size: size
            })
        } catch (error) {
            console.log('getUserArticles 方法不存在，使用 list 方法:', error)
            // 降级方案：使用 list 方法然后筛选
            res = await articlesCloudObj.list({ page: page, size: 100 })
        }
        
        console.log('加载数据结果:', res)
        
        if (res.errCode === 0) {
            let data = res.data || []
            
            // 如果是使用 list 方法，需要筛选用户文章
            if (!res.data || (Array.isArray(res.data) && res.data.length > 0 && !res.data[0].user_id)) {
                data = data.filter(item => {
                    if (Array.isArray(item.user_id)) {
                        return item.user_id.some(user => user._id === currentUserId.value)
                    } else {
                        return item.user_id === currentUserId.value
                    }
                })
            }
            
            console.log(`用户文章数量: ${data.length}`)
            
            // 处理数据
            const processedData = data.map(item => ({
                _id: item._id || '',
                content: item.content || '暂无内容',
                pics: processImagePaths(item.pics),
                like_count: item.like_count || 0,
                comment_count: item.comment_count || 0,
                createTime: item.createTime || item.publish_date || Date.now(),
                shop_id: item.shop_id || null,
                rating: item.rating || null,
                userInfo: Array.isArray(item.user_id) ? item.user_id[0] : item.user_id,
                shopInfo: null, // 初始化为 null，后面再加载
                isFavorited: false
            }))
            
            if (reset) {
                commentList.value = processedData
            } else {
                commentList.value = [...commentList.value, ...processedData]
            }
            
            // 判断是否加载完成
            finished.value = !data || data.length < size
            
            // 数据加载完成后检查收藏状态和商家信息
            if (commentList.value.length > 0) {
                await checkFavoritesStatus()
                await batchLoadShopInfo()
            }
            
        } else {
            console.error('获取数据失败:', res.errCode)
            uni.showToast({
                title: '加载失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('获取数据异常:', error)
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    } finally {
        loading.value = false
        loadingMore.value = false
        refreshing.value = false
        uni.stopPullDownRefresh()
    }
}

// 批量检查收藏状态
async function checkFavoritesStatus() {
    try {
        const articleIds = commentList.value.map(item => item._id).filter(id => id)
        
        if (articleIds.length === 0) {
            console.log('没有文章需要检查收藏状态')
            return
        }
        
        console.log('🔄 开始检查收藏状态，文章数量:', articleIds.length)
        
        const favoritesStatus = await favoritesManager.batchCheckFavorites(articleIds)
        console.log('✅ 收藏状态检查完成:', favoritesStatus)
        
        commentList.value.forEach(item => {
            if (item && item._id) {
                item.isFavorited = favoritesStatus[item._id] || false
            }
        })
    } catch (error) {
        console.error('检查收藏状态失败，设置所有为未收藏:', error)
        commentList.value.forEach(item => {
            if (item) {
                item.isFavorited = false
            }
        })
    }
}

// 处理图片路径
const processImagePaths = (pics) => {
    if (!Array.isArray(pics)) {
        return []
    }
    
    return pics.map(pic => {
        if (!pic) return ''
        if (typeof pic === 'object') {
            return pic.url || pic.path || pic.src || ''
        }
        return String(pic)
    }).filter(pic => pic)
}

/* ========== 页面事件处理 ========== */

/* 页面触底事件 */
onReachBottom(() => {
    console.log('页面触底，触发加载更多')
    loadMore()
})

/* 下拉刷新 */
onPullDownRefresh(() => {
    onRefresh()
})

/* 下拉刷新 */
function onRefresh() {
    if (refreshing.value) return
    
    refreshing.value = true
    console.log('下拉刷新')
    getData(true)
}

/* 触底加载更多 */
function loadMore() {
    if (loadingMore.value || finished.value || loading.value) {
        console.log('跳过加载: loadingMore=', loadingMore.value, 'finished=', finished.value, 'loading=', loading.value)
        return
    }
    
    console.log('触底加载更多，页码:', page + 1)
    loadingMore.value = true
    page++
    getData(false)
}

/* 删除 */
async function remove(id) {
    const { confirm } = await uni.showModal({
        title: '提示',
        content: '确认删除这条内容？',
        confirmColor: '#FF5B5B'
    })
    if (!confirm) return
    
    try {
        const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
        const { errCode } = await articlesCloudObj.remove(id)
        if (errCode === 0) {
            uni.showToast({ title: '已删除', icon: 'none' })
            page = 1
            getData(true)
        }
    } catch (error) {
        console.error('删除失败:', error)
        uni.showToast({ title: '删除失败', icon: 'none' })
    }
}

/* 滑动删除 - 简单实现 */
let startX = 0
function touchStart(e) {
    startX = e.touches[0].pageX
}
function touchEnd(id) {
    const moveX = event.changedTouches[0].pageX - startX
    if (moveX < -80) remove(id)
}

/* 发布 */
function goAdd() {
    uni.navigateTo({ url: '/pages/blog/edit' })
}

// 监听编辑页刷新
uni.$on('editEvent', () => {
    console.log('收到编辑事件，刷新数据')
    page = 1
    finished.value = false
    getData(true)
})

// 页面卸载时移除监听
onUnload(() => {
    console.log('页面卸载')
    uni.$off('editEvent')
})
</script>

<style lang="scss" scoped>
/* 样式与博客列表页面完全一致 */
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

/* 页面标题 - 保持原有样式 */
.page-header {
    padding: 30rpx;
    background: white;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    text-align: center;
    
    .page-title {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
    }
    
    .page-subtitle {
        display: block;
        font-size: 24rpx;
        color: #999;
    }
}

/* 刷新指示器 */
.refresh-indicator {
    padding: 20rpx 0;
    text-align: center;
}

/* -------------------- 骨架屏 -------------------- */
.skeleton {
    .skeleton-card {
        height: 280rpx;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.2s ease infinite;
        margin-bottom: 24rpx;
        border-radius: 24rpx;
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

    /* 底部工具栏 - 用户/商家信息和评论 */
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
                    
                    .shop-avatar {
                        width: 48rpx;
                        height: 48rpx;
                        border-radius: 12rpx; /* 商家头像用圆角矩形 */
                        border: 2rpx solid #f0f0f0;
                    }
                    
                    .shop-name {
                        font-size: 24rpx;
                        color: #FF6B35; /* 商家名称用特殊颜色 */
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

.empty {
    text-align: center;
    padding: 100rpx 0;
    
    .empty-text {
        font-size: 28rpx;
        color: #999;
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