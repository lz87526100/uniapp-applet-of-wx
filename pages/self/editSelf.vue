<template>
    <view class="edit-self">
        <!-- 顶部导航栏        <view class="navbar">
            <view class="navbar-content" :style="{ height: getNavBarHeight() + 'px' }">
                <view class="navbar-left" @click="handleBack">
                    <uni-icons type="arrowleft" size="24" color="#000"></uni-icons>
                </view>
                <view class="navbar-title">编辑个人信息</view>
                <view class="navbar-right"></view>
            </view>
        </view>-->
 

        <!-- 内容区域 -->
        <view class="content">
            <!-- 加载状态 -->
            <view v-if="state.loading" class="loading">
                <uni-load-more status="loading" content="加载中..."></uni-load-more>
            </view>

            <!-- 内容 -->
            <view v-else>
                <!-- 头像编辑 -->
                <view class="form-item">
                    <view class="label">头像</view>
                    <view class="avatar-section">
                        <view class="avatar-wrapper" @click="changeAvatar">
                            <image :src="state.formData.avatar" mode="aspectFill" class="avatar"></image>
                            <view class="avatar-mask">
                                <uni-icons type="camera" size="24" color="#fff"></uni-icons>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 用户名编辑 -->
                <view class="form-item">
                    <view class="label">用户名</view>
                    <input 
                        v-model="state.formData.nickname" 
                        class="input" 
                        placeholder="请输入用户名"
                        maxlength="20"
                        placeholder-style="color: #ccc"
                        @blur="handleNicknameBlur" />
                </view>

                <!-- 分隔线 -->
                <view class="divider"></view>

                <!-- 只读信息 -->
                <view class="readonly-info">
                    <view class="info-item">
                        <view class="info-label">用户ID</view>
                        <view class="info-value">{{ state.userInfo._id || '--' }}</view>
                    </view>
                    
                    <view class="info-item">
                        <view class="info-label">创建时间</view>
                        <view class="info-value">{{ formatDate(state.userInfo.register_date) }}</view>
                    </view>
                    
                    <view class="info-item">
                        <view class="info-label">最后登录IP</view>
                        <view class="info-value">{{ state.userInfo.last_login_ip || '--' }}</view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { reactive, onUnmounted } from 'vue'
import { onLoad, onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { getNavBarHeight } from "@/utils/system.js";

// 使用 reactive 管理状态
const state = reactive({
    loading: false,
    userId: '',
    formData: {
        nickname: '',
        avatar: '/static/logo.png'
    },
    userInfo: {
        _id: '',
        register_date: 0,
        last_login_ip: ''
    },
    // 记录数据是否有更新
    hasUpdates: false,
    updatedData: {
        avatar: '',
        nickname: ''
    },
    originalData: {
        nickname: '',
        avatar: ''
    }
})

// 页面加载
onLoad((options) => {
    console.log('页面加载，参数:', options)
    
    // 直接从存储获取用户信息
    const currentUserInfo = uni.getStorageSync('uni-id-pages-userInfo')
    console.log('存储的用户信息:', currentUserInfo)
    
    if (currentUserInfo && currentUserInfo._id) {
        state.userId = currentUserInfo._id
        console.log('设置用户ID为:', state.userId)
        loadUserInfo()
    } else {
        console.error('未找到用户信息')
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }
})

// 页面显示时也触发一次数据同步
onShow(() => {
    console.log('编辑页面显示，检查数据同步')
    if (state.userId) {
        loadUserInfo() // 重新加载确保数据最新
    }
})

// 页面隐藏时返回数据（在返回时触发）
onHide(() => {
    console.log('页面隐藏，返回数据')
    returnDataToPreviousPage()
})

// 页面卸载时返回数据
onUnload(() => {
    console.log('页面卸载，返回数据')
    returnDataToPreviousPage()
})

// 组件卸载时返回数据
onUnmounted(() => {
    console.log('页面卸载，返回数据')
    returnDataToPreviousPage()
})

// 返回按钮处理
const handleBack = () => {
    console.log('返回按钮点击')
    returnDataToPreviousPage()
    uni.navigateBack()
}

// 返回数据给上一页
const returnDataToPreviousPage = () => {
    if (state.hasUpdates) {
        console.log('有数据更新，发送给上一页')
        
        const updateData = {
            userId: state.userId,
            avatar: state.updatedData.avatar || state.formData.avatar,
            nickname: state.updatedData.nickname || state.formData.nickname
        }
        
        // 方法1：使用全局事件（最可靠的方式）
        uni.$emit('userInfoUpdated', updateData)
        console.log('通过全局事件发送数据:', updateData)
        
        // 方法2：使用页面事件通道
        const eventChannel = this.getOpenerEventChannel()
        if (eventChannel) {
            eventChannel.emit('userInfoUpdated', updateData)
            console.log('通过事件通道发送数据')
        }
        
        // 方法3：存储到全局数据中
        getApp().globalData.lastUserInfoUpdate = updateData
        
        // 方法4：存储到本地存储
        uni.setStorageSync('lastUserInfoUpdate', updateData)
        
        // 重置更新状态
        state.hasUpdates = false
        
        // 显示更新提示
        uni.showToast({
            title: '资料已更新',
            icon: 'success',
            duration: 1500
        })
    }
}

// 加载用户信息
const loadUserInfo = async () => {
    state.loading = true
    try {
        console.log('加载用户信息，用户ID:', state.userId)
        const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
        const result = await articlesCloudObj.getUserInfoById(state.userId)
        
        console.log('用户信息加载结果:', result)
        
        if (result.errCode === 0 && result.data) {
            const userData = result.data
            
            // 设置表单数据
            state.formData.nickname = userData.nickname || ''
            state.formData.avatar = userData.avatar_url || '/static/logo.png'
            
            // 设置只读信息
            state.userInfo._id = userData._id || state.userId
            state.userInfo.register_date = userData.register_date || 0
            state.userInfo.last_login_ip = userData.last_login_ip || '--'
            
            // 初始化原始数据和更新数据
            state.originalData.nickname = state.formData.nickname
            state.originalData.avatar = state.formData.avatar
            state.updatedData.nickname = state.formData.nickname
            state.updatedData.avatar = state.formData.avatar
            
            console.log('用户信息设置完成')
        } else {
            throw new Error(result.errMsg || '获取用户信息失败')
        }
    } catch (error) {
        console.error('加载用户信息失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        state.loading = false
    }
}

// 修改头像
const changeAvatar = async () => {
    console.log('点击修改头像，用户ID:', state.userId)
    
    try {
        // 直接调用 uni.chooseImage
        uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: async (chooseResult) => {
                console.log('选择图片成功:', chooseResult)
                
                if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
                    const tempFilePath = chooseResult.tempFilePaths[0]
                    console.log('选择的图片路径:', tempFilePath)
                    
                    // 显示上传loading
                    uni.showLoading({
                        title: '上传中...',
                        mask: true
                    })
                    
                    try {
                        // 上传到云存储
                        const uploadResult = await uniCloud.uploadFile({
                            filePath: tempFilePath,
                            cloudPath: `user-avatar/${state.userId}/${Date.now()}.jpg`
                        })
                        
                        console.log('上传结果:', uploadResult)
                        
                        if (uploadResult.fileID) {
                            // 获取永久URL
                            let avatarUrl = tempFilePath
                            try {
                                const urlResult = await uniCloud.getTempFileURL({
                                    fileList: [uploadResult.fileID]
                                })
                                if (urlResult.fileList && urlResult.fileList[0] && urlResult.fileList[0].tempFileURL) {
                                    avatarUrl = urlResult.fileList[0].tempFileURL
                                }
                            } catch (urlError) {
                                console.warn('获取永久URL失败，使用临时URL:', urlError)
                            }
                            
                            // 更新数据库
                            const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
                            const updateResult = await articlesCloudObj.updateUserInfo({
                                userId: state.userId,
                                avatarFile: uploadResult.fileID
                            })
                            
                            console.log('数据库更新:', updateResult)
                            
                            if (updateResult.errCode === 0) {
                                // 更新本地数据
                                state.formData.avatar = avatarUrl
                                state.updatedData.avatar = avatarUrl
                                state.hasUpdates = true
                                
                                uni.hideLoading()
                                uni.showToast({
                                    title: '头像更新成功',
                                    icon: 'success'
                                })
                                
                                // 更新本地存储
                                updateLocalUserInfo()
                                
                                console.log('头像更新完成，标记为有更新')
                            } else {
                                throw new Error(updateResult.errMsg)
                            }
                        } else {
                            throw new Error('上传失败')
                        }
                    } catch (uploadError) {
                        uni.hideLoading()
                        console.error('上传失败:', uploadError)
                        uni.showToast({
                            title: '上传失败: ' + uploadError.message,
                            icon: 'none'
                        })
                    }
                }
            },
            fail: (error) => {
                console.log('选择图片取消或失败:', error)
                if (error.errMsg !== 'chooseImage:fail cancel') {
                    uni.showToast({
                        title: '选择图片失败',
                        icon: 'none'
                    })
                }
            }
        })
    } catch (error) {
        console.error('头像上传异常:', error)
    }
}

// 用户名输入框失去焦点时自动保存
const handleNicknameBlur = async () => {
    if (!state.formData.nickname || !state.formData.nickname.trim()) {
        uni.showToast({
            title: '用户名不能为空',
            icon: 'none'
        })
        // 恢复原来的昵称
        state.formData.nickname = state.originalData.nickname
        return
    }
    
    const trimmedNickname = state.formData.nickname.trim()
    
    // 如果昵称没有变化，不进行保存
    if (trimmedNickname === state.originalData.nickname) {
        return
    }
    
    state.loading = true
    try {
        console.log('自动保存用户名:', {
            userId: state.userId,
            nickname: trimmedNickname
        })
        
        const articlesCloudObj = uniCloud.importObject('articlesCloudObj')
        const updateResult = await articlesCloudObj.updateUserInfo({
            userId: state.userId,
            nickname: trimmedNickname
        })
        
        console.log('保存结果:', updateResult)
        
        if (updateResult.errCode === 0) {
            // 更新本地数据
            state.updatedData.nickname = trimmedNickname
            state.originalData.nickname = trimmedNickname
            state.hasUpdates = true
            
            uni.showToast({
                title: '用户名更新成功',
                icon: 'success'
            })
            
            // 更新本地存储
            updateLocalUserInfo()
            
            console.log('用户名更新完成，标记为有更新')
        } else {
            throw new Error(updateResult.errMsg || '保存失败')
        }
        
    } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
            title: '保存失败: ' + error.message,
            icon: 'none'
        })
        // 恢复原来的昵称
        state.formData.nickname = state.originalData.nickname
    } finally {
        state.loading = false
    }
}

// 更新本地存储
const updateLocalUserInfo = () => {
    try {
        const userInfoFromStorage = uni.getStorageSync('uni-id-pages-userInfo')
        if (userInfoFromStorage) {
            userInfoFromStorage.nickname = state.formData.nickname.trim()
            if (state.updatedData.avatar) {
                userInfoFromStorage.avatar = state.updatedData.avatar
            }
            uni.setStorageSync('uni-id-pages-userInfo', userInfoFromStorage)
            console.log('本地存储更新成功')
        }
    } catch (error) {
        console.error('更新本地存储失败:', error)
    }
}

// 格式化日期
const formatDate = (timestamp) => {
    if (!timestamp) return '--'
    try {
        const date = new Date(parseInt(timestamp))
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } catch (e) {
        return '--'
    }
}
</script>

<style lang="scss" scoped>
.edit-self {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.navbar {
    background: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    
    .navbar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30rpx;
        
        .navbar-left {
            flex: 1;
            display: flex;
            align-items: center;
            
            &:active {
                opacity: 0.7;
            }
        }
        
        .navbar-title {
            flex: 2;
            text-align: center;
            font-size: 36rpx;
            font-weight: 600;
            color: #333;
        }
        
        .navbar-right {
            flex: 1;
        }
    }
}

.content {
    padding: 30rpx;
}

.loading {
    padding: 100rpx 0;
    text-align: center;
}

/* 表单项目 */
.form-item {
    background: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .label {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        flex-shrink: 0;
        width: 200rpx;
    }
    
    .avatar-section {
        .avatar-wrapper {
            position: relative;
            width: 120rpx;
            height: 120rpx;
            border-radius: 50%;
            overflow: visible;
            border: 4rpx solid #f0f0f0;
            
            /* 确保可点击 */
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            
            .avatar {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
            
            .avatar-mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                border-radius: 50%;
            }
            
            /* 点击反馈 */
            &:active .avatar-mask {
                opacity: 1;
            }
        }
    }
}

.input {
    flex: 1;
    text-align: right;
    font-size: 32rpx;
    color: #333;
    padding: 20rpx;
    background: transparent;
    border: none;
    outline: none;
    
    &::placeholder {
        color: #ccc;
    }
}

.divider {
    height: 20rpx;
    background: transparent;
}

.readonly-info {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    
    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #f0f0f0;
        
        &:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-size: 30rpx;
            color: #666;
            flex-shrink: 0;
            width: 200rpx;
        }
        
        .info-value {
            font-size: 28rpx;
            color: #999;
            text-align: right;
            flex: 1;
            margin-left: 20rpx;
            word-break: break-all;
        }
    }
}
</style>