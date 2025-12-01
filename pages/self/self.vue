<template>
    <view class="self">
        <!-- 顶部占位（适配状态栏） -->
        <view :style="{ height: getNavBarHeight() + 'px' }"></view>

        <!-- 用户信息区 -->
        <view class="userinfo">
            <view class="left">
                <view class="avatar-wrapper">
                    <image :src="userInfo.avatar" mode="aspectFill" class="avatar"></image>
                </view>
                <view class="info">
                    <view class="username">{{ userInfo.nickname }}</view>
                    <view class="text">喝汤的第 333 天</view>
                </view>
            </view>
            <!-- 修复：移除 url 属性，只使用点击事件 -->
            <view class="right" @click="handleEditClick">
                <text class="edit-text">编辑资料</text>
                <uni-icons type="right" size="20" color="#999"></uni-icons>
            </view>
        </view>

        <!-- 功能卡片 -->
        <view class="cardLayout">
            <view class="list">
                <!-- 修改：传递当前用户ID到item页面 -->
                <view class="item" hover-class="item-active" @click="goToMyComments">
                    <view class="left">
                        <view class="icon" style="background-image: linear-gradient(135deg, #6fcf97, #4bc0c8);">
                            <uni-icons custom-prefix="iconfont" type="xxm-highlight-fill" size="18"
                                color="#fff"></uni-icons>
                        </view>
                        <view class="name">我的锐评</view>
                    </view>
                    <view class="right">
                        <text class="count">{{ myCommentsCount }}</text>
                        <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                    </view>
                </view>

           <!--     <navigator url="" hover-class="item-active">
                    <view class="item" hover-class="item-active">
                        <view class="left">
                            <view class="icon" style="background-image: linear-gradient(135deg, #9c4dcc, #b388ff);">
                                <uni-icons custom-prefix="iconfont" type="xxm-edit-fill" size="18" color="#fff"></uni-icons>
                            </view>
                            <view class="name">审核鸡汤</view>
                        </view>
                        <view class="right">
                            <text class="count">33</text>
                            <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                        </view>
                    </view>
                </navigator> -->

                <navigator url="/pages/self/favorites" hover-class="item-active">
                    <view class="item" hover-class="item-active">
                        <view class="left">
                            <view class="icon" style="background-image: linear-gradient(135deg, #ffc857, #ff9a3c);">
                                <uni-icons custom-prefix="iconfont" type="xxm-star-fill" size="18" color="#fff"></uni-icons>
                            </view>
                            <view class="name">评论收藏</view>
                        </view>
                        <view class="right">
                            <!-- 使用 favoritesCount 而不是 count -->
                            <text class="count">{{ favoritesCount }}</text>
                            <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                        </view>
                    </view>
                </navigator>

                <!-- 新增：店铺收藏 -->
                <view class="item" hover-class="item-active" @click="goToShopFavorites">
                    <view class="left">
                        <view class="icon" style="background-image: linear-gradient(135deg, #FF6B35, #FF9F43);">
                            <uni-icons custom-prefix="iconfont" type="xxm-like-fill" size="18" color="#fff"></uni-icons>
                        </view>
                        <view class="name">店铺收藏</view>
                    </view>
                    <view class="right">
                        <text class="count">{{ shopFavoritesCount }}</text>
                        <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                    </view>
                </view>
                
                <navigator url="" hover-class="item-active">
                    <view class="item" hover-class="item-active">
                        <view class="left">
                            <view class="icon" style="background-image: linear-gradient(135deg, #ff7034, #ff4757);">
                                <uni-icons custom-prefix="iconfont" type="xxm-message-fill" size="18"
                                    color="#fff"></uni-icons>
                            </view>
                            <view class="name">联系我们</view>
                        </view>
                        <view class="right">
                            <text class="count">在线客服</text>
                            <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                        </view>
                    </view>
                </navigator>
            </view>
        </view>

        <!-- 设置区 -->
        <view class="cardLayout">
            <view class="list">
                <view class="item" hover-class="item-active">
                    <view class="left">
                        <view class="icon" style="background-image: linear-gradient(135deg, #b5dfe8, #a2d2e2);">
                            <uni-icons custom-prefix="iconfont" type="xxm-pushpin-fill" size="18"
                                color="#fff"></uni-icons>
                        </view>
                        <view class="name">偏好设置</view>
                    </view>
                    <view class="right">
                        <text class="desc">默认</text>
                        <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                    </view>
                </view>

                <view class="item" hover-class="item-active" @tap="handleLogout">
                    <view class="left">
                        <view class="icon" style="background-image: linear-gradient(135deg, #b5dfe8, #a2d2e2);">
                            <uni-icons custom-prefix="iconfont" type="xxm-api-fill" size="18" color="#fff"></uni-icons>
                        </view>
                        <view class="name">退出登录</view>
                    </view>
                    <view class="right">
                        <uni-icons type="right" size="22" color="#ccc"></uni-icons>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onPullDownRefresh, onLoad } from '@dcloudio/uni-app'
import { getNavBarHeight } from "@/utils/system.js";
import favoritesManager from '@/common/style/favorites.js'; // 导入收藏管理器

// 用户信息
const userInfo = ref({
    _id: '', // 添加 _id 字段
    nickname: '咸虾米',
    avatar: '/static/logo.png'
})

// 我的评论数量
const myCommentsCount = ref(0)

// 收藏数量
const favoritesCount = ref(0)

// 店铺收藏数量
const shopFavoritesCount = ref(0)

// 跳转到我的评论页面
const goToMyComments = () => {
    if (!userInfo.value._id) {
        console.log('用户ID为空，无法跳转')
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        return
    }
    
    console.log('跳转到我的评论页面，用户ID:', userInfo.value._id)
    
    uni.navigateTo({
        url: `/pages/self/item?userId=${userInfo.value._id}`,
        success: () => {
            console.log('跳转到我的评论页面成功')
        },
        fail: (error) => {
            console.error('跳转失败:', error)
            uni.showToast({
                title: '跳转失败',
                icon: 'none'
            })
        }
    })
}

// 跳转到店铺收藏页面
const goToShopFavorites = () => {
    if (!userInfo.value._id) {
        console.log('用户ID为空，无法跳转')
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        return
    }
    
    console.log('跳转到店铺收藏页面，用户ID:', userInfo.value._id)
    
    uni.navigateTo({
        url: '/pages/self/shopFavorites',
        success: () => {
            console.log('跳转到店铺收藏页面成功')
        },
        fail: (error) => {
            console.error('跳转失败:', error)
            uni.showToast({
                title: '跳转失败',
                icon: 'none'
            })
        }
    })
}

// 获取我的评论数量（用户文章数）
const getMyCommentsCount = async () => {
  try {
    if (!userInfo.value._id) {
      console.log('用户ID为空，无法获取评论数量')
      myCommentsCount.value = 0
      return
    }
    
    console.log('开始获取我的评论数量，用户ID:', userInfo.value._id)
    
    // 使用专门的方法获取用户文章数量
    const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
    const res = await articlesCloudObj.getUserArticlesCount({
      userId: userInfo.value._id
    })
    
    if (res.errCode === 0) {
      myCommentsCount.value = res.data || 0
      console.log('我的评论数量:', myCommentsCount.value)
    } else {
      console.error('获取评论数量失败:', res.errMsg)
      myCommentsCount.value = 0
    }
  } catch (error) {
    console.error('获取评论数量失败:', error)
    myCommentsCount.value = 0
  }
}

// 监听编辑页面返回的数据
const setupEventListeners = () => {
    // 监听全局事件（editSelf页面通过uni.$emit发送）
    uni.$on('userInfoUpdated', (data) => {
        console.log('通过全局事件接收到用户信息更新:', data)
        updateUserInfo(data)
    })
}

// 更新用户信息的方法
const updateUserInfo = (data) => {
    console.log('开始更新用户信息:', data)
    
    // 检查用户ID是否匹配
    if (data.userId === userInfo.value._id) {
        // 更新头像
        if (data.avatar && data.avatar !== userInfo.value.avatar) {
            userInfo.value.avatar = data.avatar
            console.log('头像已更新:', data.avatar)
        }
        // 更新昵称
        if (data.nickname && data.nickname !== userInfo.value.nickname) {
            userInfo.value.nickname = data.nickname
            console.log('昵称已更新:', data.nickname)
        }
        
        // 同时更新本地存储
        const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
        if (userInfoFromStorage) {
            if (data.nickname) {
                userInfoFromStorage.nickname = data.nickname
            }
            if (data.avatar) {
                userInfoFromStorage.avatar = data.avatar
            }
            uni.setStorageSync('uni-id-pages-userInfo', userInfoFromStorage)
            console.log('本地存储已更新')
        }
        
        // 存储到临时位置，防止事件丢失（小程序特别需要）
        uni.setStorageSync('userInfoPendingUpdate', data)
        
        // 显示更新成功的提示
        uni.showToast({
            title: '资料已更新',
            icon: 'success',
            duration: 1500
        })
    } else {
        console.log('用户ID不匹配，不更新数据')
    }
}

// 组件销毁时移除事件监听
onUnmounted(() => {
    uni.$off('userInfoUpdated')
})

// 获取收藏数量
async function getFavoritesCount() {
    try {
        console.log('开始获取收藏数量...')
        const favorites = await favoritesManager.getFavoritesList(1, 100); // 获取更多来计数
        favoritesCount.value = favorites.length;
        console.log('收藏数量:', favoritesCount.value);
    } catch (error) {
        console.error('获取收藏数量失败:', error);
        favoritesCount.value = 0;
    }
}

// 获取店铺收藏数量
async function getShopFavoritesCount() {
    try {
        console.log('开始获取店铺收藏数量...')
        const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
        if (!userInfoFromStorage || !userInfoFromStorage._id) {
            shopFavoritesCount.value = 0
            return
        }

        const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
        const res = await articlesCloudObj.getShopFavoritesList({
            userId: userInfoFromStorage._id,
            page: 1,
            size: 100
        })

        if (res.errCode === 0) {
            shopFavoritesCount.value = res.data.list?.length || 0
            console.log('店铺收藏数量:', shopFavoritesCount.value)
        } else {
            console.error('获取店铺收藏数量失败:', res.errMsg)
            shopFavoritesCount.value = 0
        }
    } catch (error) {
        console.error('获取店铺收藏数量异常:', error)
        shopFavoritesCount.value = 0
    }
}

// 编辑资料点击处理
const handleEditClick = () => {
    // 从本地存储获取当前用户ID
    const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo');
    console.log('本地存储的用户信息:', userInfoFromStorage);
    
    if (userInfoFromStorage && userInfoFromStorage._id) {
        console.log('编辑用户:', userInfoFromStorage._id);
        uni.navigateTo({
            url: `/pages/self/editSelf?id=${userInfoFromStorage._id}`,
            events: {
                // 监听编辑页面发送的事件
                userInfoUpdated: (data) => {
                    console.log('通过事件通道接收到用户信息更新:', data)
                    updateUserInfo(data)
                }
            },
            success: (res) => {
                // 可以通过事件通道向编辑页面发送数据
                res.eventChannel.emit('acceptUserInfo', { 
                    userInfo: userInfo.value 
                })
            }
        });
    } else {
        console.error('未找到用户信息，本地存储内容:', uni.getStorageInfoSync());
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        });
    }
}

// 直接从本地存储获取用户信息，增加云函数强制同步
async function getUserInfo() {
    try {
        console.log('开始获取用户信息...')
        
        // 方法1：从 uni-id-pages 的存储中获取用户信息
        const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
        console.log('uni-id-pages 存储的用户信息:', userInfoFromStorage)
        
        if (userInfoFromStorage && userInfoFromStorage._id) {
            // 强制从云函数获取最新数据（小程序环境特别需要）
            try {
                const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
                const cloudResult = await articlesCloudObj.getUserInfoById(userInfoFromStorage._id)
                
                if (cloudResult.errCode === 0 && cloudResult.data) {
                    console.log('云函数返回的用户信息:', cloudResult.data)
                    const cloudUserData = cloudResult.data
                    
                    let avatarUrl = '/static/logo.png'
                    if (cloudUserData.avatar_url) {
                        avatarUrl = cloudUserData.avatar_url
                    } else if (cloudUserData.avatar_file && cloudUserData.avatar_file.url) {
                        try {
                            const result = await uniCloud.getTempFileURL({
                                fileList: [cloudUserData.avatar_file.url]
                            })
                            if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
                                avatarUrl = result.fileList[0].tempFileURL
                            }
                        } catch (urlError) {
                            console.error('URL转换失败:', urlError)
                        }
                    }
                    
                    // 使用云函数返回的数据
                    userInfo.value = {
                        _id: cloudUserData._id || userInfoFromStorage._id,
                        nickname: cloudUserData.nickname || userInfoFromStorage.nickname || '咸虾米',
                        avatar: avatarUrl
                    }
                    
                    // 更新本地存储
                    const updatedStorage = {
                        ...userInfoFromStorage,
                        nickname: cloudUserData.nickname || userInfoFromStorage.nickname,
                        avatar: avatarUrl
                    }
                    uni.setStorageSync('uni-id-pages-userInfo', updatedStorage)
                    
                    console.log('从云函数同步用户信息成功:', userInfo.value)
                    
                    // 获取评论数量
                    getMyCommentsCount()
                    return
                }
            } catch (cloudError) {
                console.warn('云函数获取失败，使用本地缓存:', cloudError)
                // 云函数失败时使用本地存储
            }
            
            // 云函数失败时的回退方案
            const userData = userInfoFromStorage
            let avatarUrl = '/static/logo.png'
            
            if (userData.avatar && userData.avatar !== '/static/logo.png') {
                avatarUrl = userData.avatar
            } else if (userData.avatar_file && userData.avatar_file.url) {
                try {
                    const result = await uniCloud.getTempFileURL({
                        fileList: [userData.avatar_file.url]
                    })
                    if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
                        avatarUrl = result.fileList[0].tempFileURL
                    }
                } catch (urlError) {
                    console.error('URL转换失败:', urlError)
                }
            }
            
            userInfo.value = {
                _id: userData._id || '',
                nickname: userData.nickname || '咸虾米',
                avatar: avatarUrl
            }
            console.log('从本地存储获取用户信息成功:', userInfo.value)
            
            // 获取评论数量
            getMyCommentsCount()
            return
        }
        
        // 方法2：如果本地存储没有，尝试从数据库查询
        console.log('本地存储无用户信息，尝试数据库查询...')
        const db = uniCloud.database()
        const usersRes = await db.collection('uni-id-users')
            .field('_id,nickname,avatar_file') // 添加 _id 字段
            .limit(10)
            .get()
        
        console.log('数据库查询结果:', usersRes)
        
        if (usersRes.data && usersRes.data.length > 0) {
            // 使用第一个用户（开发环境）
            const userData = usersRes.data[0]
            let avatarUrl = '/static/logo.png'
            
            if (userData.avatar_file && userData.avatar_file.url) {
                try {
                    const result = await uniCloud.getTempFileURL({
                        fileList: [userData.avatar_file.url]
                    })
                    if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
                        avatarUrl = result.fileList[0].tempFileURL
                    }
                } catch (urlError) {
                    console.error('URL转换失败:', urlError)
                }
            }
            
            userInfo.value = {
                _id: userData._id || '', // 获取用户ID
                nickname: userData.nickname || '咸虾米',
                avatar: avatarUrl
            }
            console.log('从数据库获取用户信息成功:', userInfo.value)
            
            // 获取评论数量
            getMyCommentsCount()
        } else {
            // 保持默认值
            userInfo.value = {
                _id: '',
                nickname: '咸虾米',
                avatar: '/static/logo.png'
            }
            console.log('使用默认用户信息')
        }
        
    } catch (error) {
        console.error('获取用户信息失败:', error)
        // 出错时使用默认值
        userInfo.value = {
            _id: '',
            nickname: '咸虾米',
            avatar: '/static/logo.png'
        }
    }
    
    // 停止下拉刷新
    uni.stopPullDownRefresh()
}

// 手动刷新用户信息
const refreshUserInfo = () => {
    uni.showLoading({
        title: '刷新中...'
    })
    getUserInfo().finally(() => {
        uni.hideLoading()
        uni.showToast({
            title: '刷新成功',
            icon: 'success'
        })
    })
}

// 退出登录逻辑
const handleLogout = () => {
    uni.showModal({
        title: '确认退出',
        content: '是否退出当前账号？',
        success: function(res) {
            if (res.confirm) {
                // 清除所有用户相关存储
                uni.removeStorageSync('uni_id_token')
                uni.removeStorageSync('uni_id_token_expired')
                uni.removeStorageSync('uni-id-pages-userInfo')
                uni.removeStorageSync('uni_id_userinfo')
                uni.removeStorageSync('userInfoPendingUpdate')
                uni.reLaunch({
                    url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
                });
            }
        }
    });
};

// 页面加载时获取用户信息
onMounted(() => {
    getUserInfo()
})

// 页面显示时重新获取用户信息
onShow(() => {
    console.log('页面显示，重新获取用户信息')
    
    // 方法1：直接调用云函数同步
    getUserInfo()
    
    // 方法2：检查是否有待更新的数据（小程序特别需要）
    const pendingUpdate = uni.getStorageSync('userInfoPendingUpdate')
    if (pendingUpdate) {
        console.log('发现待更新的用户信息:', pendingUpdate)
        updateUserInfo(pendingUpdate)
        uni.removeStorageSync('userInfoPendingUpdate')
    }
    
    // 重新设置事件监听
    setupEventListeners()
    
    // 添加收藏数量获取
    getFavoritesCount()
    getShopFavoritesCount()
})

// 下拉刷新
onPullDownRefresh(() => {
    console.log('下拉刷新，重新获取用户信息')
    getUserInfo()
})
</script>

<style lang="scss" scoped>
    $self-padding: 30rpx;
    $card-radius: 20rpx;
    $shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);

    .self {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        min-height: 100vh;
        padding-bottom: 30rpx;

        // 用户信息区
        .userinfo {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 50rpx $self-padding;
            border-bottom: 1px solid #f0f0f0;

            .left {
                display: flex;
                align-items: center;
                padding-left: 10rpx;

                .avatar-wrapper {
                    position: relative;
                    width: 120rpx;
                    height: 120rpx;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 8rpx 20rpx rgba(111, 207, 151, 0.3);
                    border: 4rpx solid #fff;
                    transition: transform 0.3s ease;

                    &:active {
                        transform: scale(0.95);
                    }

                    .avatar {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .info {
                    margin-left: 24rpx;

                    .username {
                        font-size: 40rpx;
                        font-weight: 700;
                        color: #111;
                        letter-spacing: -0.5px;
                    }

                    .text {
                        font-size: 28rpx;
                        color: #666;
                        margin-top: 8rpx;
                    }
                }
            }

            .right {
                display: flex;
                align-items: center;
                font-size: 28rpx;
                color: #007aff;
                font-weight: 500;
                padding: 10rpx 20rpx;
                border-radius: 20rpx;
                transition: background-color 0.3s ease;

                &:active {
                    background-color: rgba(0, 122, 255, 0.1);
                }

                .edit-text {
                    margin-right: 12rpx;
                }
            }
        }

        // 卡片样式
        .cardLayout {
            width: 690rpx;
            margin: $self-padding auto;
            border-radius: $card-radius;
            overflow: hidden;

            .list {
                background: #fff;
                border-radius: $card-radius;
                box-shadow: $shadow;
                overflow: hidden;

                .item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 34rpx 30rpx;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background-color 0.2s ease;

                    &:last-child {
                        border-bottom: none;
                    }

                    .left {
                        display: flex;
                        align-items: center;

                        .icon {
                            width: 50rpx;
                            height: 50rpx;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background-size: 200% 200%;
                            animation: gradientShift 3s ease infinite;
                        }

                        .name {
                            font-size: 30rpx;
                            color: #333;
                            margin-left: 20rpx;
                            font-weight: 500;
                        }
                    }

                    .right {
                        display: flex;
                        align-items: center;
                        color: #999;

                        .count,
                        .desc {
                            font-size: 26rpx;
                            margin-right: 10rpx;
                        }
                    }
                }

                // 点击反馈
                .item-active {
                    background-color: #f5f5f5;
                }
            }
        }
    }

    // 渐变动画（可选）
    @keyframes gradientShift {
        0% {
            background-position: 0% 50%;
        }

        50% {
            background-position: 100% 50%;
        }

        100% {
            background-position: 0% 50%;
        }
    }
</style>