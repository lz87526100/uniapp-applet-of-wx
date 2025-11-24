<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

// 响应式数据
const articleList = ref([])
const userArticleList = ref([])
const currentUserId = ref('')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const size = ref(10)

// 处理图片路径的辅助函数
const processImagePaths = (pics) => {
    if (!Array.isArray(pics)) {
        return []
    }
    
    return pics.map(pic => {
        if (!pic) return ''
        
        if (typeof pic === 'object') {
            return pic.url || pic.path || pic.src || ''
        }
        
        if (typeof pic === 'string') {
            return pic
        }
        
        return String(pic)
    }).filter(pic => pic)
}

// 加载数据
const loadData = async (isRefresh = false) => {
    if (loading.value) return
    
    if (isRefresh) {
        page.value = 1
        hasMore.value = true
        articleList.value = []
        userArticleList.value = []
    }
    
    if (!hasMore.value) return
    
    loading.value = true
    
    try {
        const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
        const res = await articlesCloudObj.list({
            page: page.value,
            size: size.value
        })
        
        console.log('加载数据结果:', res)
        
        if (res.errCode === 0) {
            const data = res.data || []
            
            // 调试：显示用户ID和文章user_id的对比
            console.log('=== 用户ID对比调试 ===')
            console.log('当前用户ID:', currentUserId.value)
            
            if (data.length > 0) {
                data.slice(0, 3).forEach((item, index) => {
                    console.log(`文章${index + 1} user_id:`, item.user_id)
                    console.log(`是否匹配:`, item.user_id === currentUserId.value)
                })
            }
            
            // 确保数据结构完整
            const processedData = data.map(item => ({
                _id: item._id || '',
                content: item.content || '暂无内容',
                status: item.status ?? 1,
                pics: processImagePaths(item.pics),
                like_count: item.like_count || 0,
                favorite_count: item.favorite_count || 0,
                comment_count: item.comment_count || 0,
                publish_date: item.publish_date || item.createTime || Date.now(),
                user_id: item.user_id,
                // 直接使用 user_id 作为创建者ID
                creator_id: item.user_id
            }))
            
            if (isRefresh) {
                articleList.value = processedData
            } else {
                articleList.value = [...articleList.value, ...processedData]
            }
            
            // 筛选当前用户的文章
            filterUserArticles()
            
            // 检查是否还有更多数据
            if (data.length < size.value) {
                hasMore.value = false
            } else {
                page.value++
            }
        } else {
            console.error('加载数据失败:', res.errMsg)
            uni.showToast({
                title: '加载失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('加载数据异常:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 筛选当前用户的文章
const filterUserArticles = () => {
    if (!currentUserId.value) {
        console.log('用户ID为空，无法筛选')
        userArticleList.value = []
        return
    }
    
    console.log('=== 开始筛选 ===')
    console.log('当前用户ID:', currentUserId.value)
    console.log('总文章数量:', articleList.value.length)
    
    const userArticles = articleList.value.filter(item => {
        const match = item.creator_id === currentUserId.value
        console.log(`文章 ${item._id} 的user_id: ${item.creator_id}, 是否匹配: ${match}`)
        return match
    })
    
    console.log(`筛选结果: 总文章 ${articleList.value.length} 篇, 用户文章 ${userArticles.length} 篇`)
    console.log('用户文章详情:', userArticles)
    
    userArticleList.value = userArticles
    
    // 如果还是没有用户文章，显示调试信息
    if (userArticles.length === 0 && articleList.value.length > 0) {
        console.log('=== 详细调试信息 ===')
        console.log('可能的原因:')
        console.log('1. 用户ID不匹配')
        console.log('2. 数据中的user_id格式问题')
        console.log('3. 当前用户没有发布过文章')
        
        // 显示所有文章的user_id用于对比
        articleList.value.forEach((item, index) => {
            console.log(`文章${index + 1}: user_id = ${item.creator_id}`)
        })
    }
}

// 获取当前用户信息 - 修复版
const getCurrentUser = async () => {
    try {
        console.log('=== 开始获取用户信息 ===')
        
        // 方法1：从 uni-id-pages 存储获取
        const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
        console.log('uni-id-pages-userInfo:', userInfoFromStorage)
        
        if (userInfoFromStorage && userInfoFromStorage._id) {
            currentUserId.value = userInfoFromStorage._id
            console.log('从uni-id-pages获取用户ID:', currentUserId.value)
            loadData(true)
            return
        }
        
        // 方法2：如果本地存储没有，使用正确的测试用户ID
        console.log('本地存储无用户信息，使用正确的测试用户ID')
        currentUserId.value = '68fa178b2c5de7e572670bad' // 注意这里是 68fa 不是 687a
        console.log('使用测试用户ID:', currentUserId.value)
        loadData(true)
        
    } catch (error) {
        console.error('获取用户信息异常:', error)
        // 异常时使用正确的测试用户ID
        currentUserId.value = '68fa178b2c5de7e572670bad'
        console.log('异常时使用测试用户ID:', currentUserId.value)
        loadData(true)
    }
}

// 处理删除
const handleDelete = (id) => {
    console.log('删除项目:', id)
    articleList.value = articleList.value.filter(item => item._id !== id)
    userArticleList.value = userArticleList.value.filter(item => item._id !== id)
}

// 临时显示所有文章的调试函数
const showAllArticles = () => {
    console.log('=== 显示所有文章用于调试 ===')
    userArticleList.value = [...articleList.value]
    console.log('现在显示所有文章，数量:', userArticleList.value.length)
}

// 初始化
onMounted(() => {
    console.log('页面初始化')
    getCurrentUser()
})

// 页面生命周期 - 下拉刷新
onPullDownRefresh(() => {
    console.log('下拉刷新')
    loadData(true).finally(() => {
        uni.stopPullDownRefresh()
    })
})

// 页面生命周期 - 上拉加载更多
onReachBottom(() => {
    console.log('上拉加载更多')
    loadData()
})
</script>

<template>
    <view class="self-page">
        <!-- 调试按钮 -->
        <view class="debug-bar" @click="showAllArticles" v-if="userArticleList.length === 0 && articleList.length > 0">
            <text>调试：显示所有文章</text>
        </view>
        
        <!-- 遍历当前用户的文章列表 -->
        <view v-for="item in userArticleList" :key="item._id">
            <self-item 
                :item="item" 
                :currentUserId="currentUserId"
                @delete="handleDelete"
                @refresh="loadData"
            ></self-item>
        </view>
        
        <!-- 如果没有用户文章，显示提示 -->
        <view class="no-user-data" v-if="userArticleList.length === 0 && articleList.length > 0">
            <text>您还没有发布过内容</text>
            <text class="tip">点击上方"调试"按钮查看所有文章</text>
            <text class="debug-info">用户ID: {{ currentUserId }}</text>
        </view>
        
        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore && userArticleList.length > 0">
            <text>加载中...</text>
        </view>
        
        <!-- 空状态 -->
        <view class="no-data" v-if="articleList.length === 0 && !loading">
            <text>暂无内容</text>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading" v-if="loading && articleList.length === 0">
            <text>加载中...</text>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.self-page {
    padding: 20rpx;
    background: #f5f5f5;
    min-height: 100vh;
}

.debug-bar {
    background: #ffeb3b;
    padding: 20rpx;
    text-align: center;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    text {
        color: #333;
        font-size: 28rpx;
    }
}

.no-user-data {
    text-align: center;
    padding: 60rpx 30rpx;
    background: white;
    border-radius: 10rpx;
    margin: 20rpx 0;
    
    text {
        display: block;
        color: #999;
        font-size: 32rpx;
        margin-bottom: 10rpx;
    }
    
    .tip {
        font-size: 24rpx;
        color: #ccc;
        margin-bottom: 10rpx;
    }
    
    .debug-info {
        font-size: 20rpx;
        color: #999;
        font-family: monospace;
    }
}

.load-more,
.loading {
    text-align: center;
    padding: 30rpx;
    color: #999;
    font-size: 28rpx;
}

.no-data {
    text-align: center;
    padding: 100rpx 30rpx;
    color: #999;
    font-size: 32rpx;
}
</style>