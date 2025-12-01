<template>
    <view class="choose-edit">
    

        <!-- 内容区域 -->
        <view class="content">
            <!-- 定位信息 -->
            <view class="location-section">
                <view class="location-header">
                    <uni-icons type="location-filled" size="20" color="#4F8BFF"></uni-icons>
                    <text class="location-title">当前定位</text>
                    <view class="location-actions">
                        <text class="location-refresh" @click="getCurrentLocation">
                            {{ locationLoading ? '定位中...' : '刷新定位' }}
                        </text>
                        <text class="location-choose" @click="openCityPicker">
                            选择位置
                        </text>
                    </view>
                </view>
                <view class="location-info">
                    <text class="address">{{ currentAddress || '正在获取位置...' }}</text>
                    <text class="location-type" v-if="locationType">
                        {{ locationType }}
                    </text>
                </view>
            </view>

            <!-- 城市选择器 -->
            <uni-popup ref="cityPopup" type="bottom" background-color="#fff">
                <view class="city-picker">
                    <view class="picker-header">
                        <text class="picker-title">选择位置</text>
                        <view class="picker-close" @click="closeCityPicker">
                            <uni-icons type="close" size="20" color="#999"></uni-icons>
                        </view>
                    </view>
                    <view class="picker-content">
                        <!-- 热门城市 -->
                        <view class="city-section">
                            <view class="section-title">热门城市</view>
                            <view class="city-tags">
                                <text 
                                    v-for="city in hotCities" 
                                    :key="city.code"
                                    class="city-tag"
                                    :class="{ active: selectedCity.code === city.code }"
                                    @click="selectCity(city)"
                                >
                                    {{ city.name }}
                                </text>
                            </view>
                        </view>
                        
                        <!-- 当前定位城市 -->
                        <view class="city-section" v-if="currentAddress && currentAddress.includes('泉州')">
                            <view class="section-title">当前城市</view>
                            <view class="city-tags">
                                <text 
                                    class="city-tag active"
                                    @click="selectCurrentCity"
                                >
                                    泉州市
                                </text>
                                <text 
                                    class="city-tag"
                                    @click="selectCity({ code: '350581', name: '石狮市' })"
                                >
                                    石狮市
                                </text>
                                <text 
                                    class="city-tag"
                                    @click="selectCity({ code: '350582', name: '晋江市' })"
                                >
                                    晋江市
                                </text>
                            </view>
                        </view>
                    </view>
                    <view class="picker-footer">
                        <button class="confirm-btn" @click="confirmCitySelection">
                            确认选择
                        </button>
                    </view>
                </view>
            </uni-popup>

            <!-- 搜索框 -->
            <view class="search-section">
                <view class="search-box" @click="focusSearch">
                    <uni-icons type="search" size="18" color="#999" class="search-icon"></uni-icons>
                    <input 
                        class="search-input" 
                        placeholder="搜索店铺名称..." 
                        v-model="searchKeyword"
                        @input="onSearchInput"
                        :focus="isSearchFocus"
                        @blur="isSearchFocus = false"
                    />
                    <view 
                        v-if="searchKeyword" 
                        class="clear-btn" 
                        @click="clearSearch"
                    >
                        <uni-icons type="clear" size="16" color="#999"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 店铺列表 -->
            <view class="shops-section">
                <view class="section-header">
                    <text class="section-title">
                        {{ isSearching ? '搜索结果' : '推荐店铺' }}
                    </text>
                    <text class="section-desc" v-if="selectedCity.name && !isSearching">
                        • 当前显示 {{ selectedCity.name }} 的店铺
                    </text>
                    <text class="section-desc" v-if="isSearching && shopsList.length > 0">
                        • 找到 {{ shopsList.length }} 个店铺
                    </text>
                </view>
                
                <!-- 加载状态 -->
                <view v-if="shopsLoading" class="loading-shops">
                    <view v-for="i in 3" :key="i" class="shop-skeleton">
                        <view class="skeleton-avatar"></view>
                        <view class="skeleton-info">
                            <view class="skeleton-name"></view>
                            <view class="skeleton-address"></view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-else-if="shopsList.length === 0" class="empty-shops">
                    <view class="empty-icon">🏪</view>
                    <text class="empty-text" v-if="isSearching">
                        没有找到相关店铺
                    </text>
                    <text class="empty-text" v-else>
                        暂无店铺数据
                    </text>
                    <text class="empty-desc">请尝试切换位置或搜索其他店铺</text>
                    <button class="empty-btn" @click="openCityPicker">
                        切换位置
                    </button>
                </view>

                <!-- 店铺列表 -->
                <view v-else class="shops-list">
                    <view
                        v-for="shop in shopsList"
                        :key="shop._id"
                        class="shop-item"
                        @click="selectShop(shop)"
                    >
                        <view class="shop-left">
                            <image 
                                class="shop-avatar" 
                                :src="shop.shopPic || '/static/default-shop.jpg'" 
                                mode="aspectFill"
                                @error="handleShopAvatarError"
                            />
                            <view class="shop-info">
                                <text class="shop-name">{{ shop.shopName }}</text>
                                <text class="shop-address">{{ shop.address || '暂无地址信息' }}</text>
                                <view class="shop-meta">
                                    <text class="shop-rating" v-if="shop.rating > 0">
                                        <text class="rating-star">★</text>
                                        <text class="rating-value">{{ (shop.rating / 10).toFixed(1) }}</text>
                                    </text>
                                    <text class="distance" v-if="shop.distance && !isSearching">
                                        {{ shop.distance }}km
                                    </text>
                                </view>
                            </view>
                        </view>
                        <view class="shop-right">
                            <uni-icons type="right" size="18" color="#ccc"></uni-icons>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部提示 -->
        <view class="footer-tips">
            <text class="tip-text">• 选择您要评价的店铺</text>
            <text class="tip-text">• 点击搜索框可搜索所有店铺</text>
            <text class="tip-text">• 点击"选择位置"可切换城市</text>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 定位相关
const currentAddress = ref('');
const locationLoading = ref(false);
const locationType = ref('');

// 店铺列表相关
const shopsList = ref([]);
const shopsLoading = ref(false);
const searchKeyword = ref('');
const isSearching = ref(false);
const isSearchFocus = ref(false);
const searchTimer = ref(null);

// 城市选择相关
const showCityPicker = ref(false);
const selectedCity = ref({ code: '', name: '' });
const cityPopup = ref(null); // 添加城市选择器引用

// 城市数据
const hotCities = ref([
    { code: '110100', name: '北京市' },
    { code: '310100', name: '上海市' },
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' },
    { code: '350200', name: '厦门市' },
    { code: '350500', name: '泉州市' },
    { code: '330100', name: '杭州市' },
    { code: '320100', name: '南京市' }
]);

// 生命周期
onLoad(() => {
    loadRandomShops();
});

// 打开城市选择器
function openCityPicker() {
    console.log('打开城市选择器');
    if (cityPopup.value) {
        cityPopup.value.open();
    } else {
        // 如果ref获取失败，直接显示
        showCityPicker.value = true;
    }
}

// 关闭城市选择器
function closeCityPicker() {
    console.log('关闭城市选择器');
    if (cityPopup.value) {
        cityPopup.value.close();
    }
    showCityPicker.value = false;
}

// 选择当前定位城市
function selectCurrentCity() {
    selectedCity.value = { code: '350500', name: '泉州市' };
    console.log('选择当前城市:', selectedCity.value);
}

// 选择城市
function selectCity(city) {
    console.log('选择城市:', city);
    selectedCity.value = city;
    
    // 自动确认选择（可选）
    // confirmCitySelection();
}

// 确认城市选择
function confirmCitySelection() {
    if (!selectedCity.value.code) {
        uni.showToast({
            title: '请选择一个城市',
            icon: 'none'
        });
        return;
    }
    
    console.log('确认选择城市:', selectedCity.value);
    
    currentAddress.value = selectedCity.value.name;
    locationType.value = '手动选择';
    
    // 关闭选择器
    closeCityPicker();
    
    // 根据选择的城市加载店铺
    loadRandomShops();
    
    uni.showToast({
        title: `已切换到${selectedCity.value.name}`,
        icon: 'success',
        duration: 1500
    });
}

// 加载随机3条店铺
async function loadRandomShops() {
    shopsLoading.value = true;
    
    try {
        const result = await uniCloud.callFunction({
            name: 'shopCloudObj',
            data: {
                action: 'getAllShops',
                data: {
                    limit: 3,
                    random: true
                }
            }
        });
        
        console.log('随机店铺结果:', result);
        
        if (result.result && result.result.errCode === 0) {
            const allShops = result.result.data || [];
            shopsList.value = allShops.slice(0, 3);
            console.log('获取到随机店铺数量:', shopsList.value.length);
            isSearching.value = false;
        } else {
            console.error('获取随机店铺失败:', result.result?.errMsg);
            shopsList.value = [];
        }
    } catch (error) {
        console.error('获取随机店铺异常:', error);
        shopsList.value = [];
    } finally {
        shopsLoading.value = false;
    }
}

// 获取当前位置
async function getCurrentLocation() {
    locationLoading.value = true;
    
    try {
        const locationResult = await uni.getLocation({
            type: 'gcj02',
            isHighAccuracy: true
        });
        
        console.log('获取到位置:', locationResult);
        
        const { latitude, longitude } = locationResult;
        
        currentAddress.value = `泉州市南安市（${latitude.toFixed(4)}, ${longitude.toFixed(4)}）`;
        locationType.value = '自动定位';
        
        await loadNearbyShops(latitude, longitude);
        
    } catch (error) {
        console.error('获取位置失败:', error);
        handleLocationError(error);
    } finally {
        locationLoading.value = false;
    }
}

// 加载附近店铺
async function loadNearbyShops(latitude, longitude) {
    shopsLoading.value = true;
    isSearching.value = false;
    
    try {
        const result = await uniCloud.callFunction({
            name: 'shopCloudObj',
            data: {
                action: 'getNearbyShops',
                data: {
                    latitude,
                    longitude,
                    keyword: searchKeyword.value,
                    maxDistance: 50
                }
            }
        });
        
        console.log('附近店铺结果:', result);
        
        if (result.result && result.result.errCode === 0) {
            shopsList.value = result.result.data || [];
            console.log('获取到附近店铺数量:', shopsList.value.length);
        } else {
            console.error('获取附近店铺失败:', result.result?.errMsg);
            shopsList.value = [];
        }
    } catch (error) {
        console.error('获取附近店铺异常:', error);
        shopsList.value = [];
    } finally {
        shopsLoading.value = false;
    }
}

// 搜索店铺
async function searchShops() {
    if (!searchKeyword.value.trim()) {
        loadRandomShops();
        return;
    }
    
    shopsLoading.value = true;
    isSearching.value = true;
    
    try {
        const result = await uniCloud.callFunction({
            name: 'shopCloudObj',
            data: {
                action: 'getAllShops',
                data: {
                    keyword: searchKeyword.value
                }
            }
        });
        
        console.log('搜索店铺结果:', result);
        
        if (result.result && result.result.errCode === 0) {
            shopsList.value = result.result.data || [];
            console.log('搜索到店铺数量:', shopsList.value.length);
        } else {
            console.error('搜索店铺失败:', result.result?.errMsg);
            shopsList.value = [];
        }
    } catch (error) {
        console.error('搜索店铺异常:', error);
        shopsList.value = [];
    } finally {
        shopsLoading.value = false;
    }
}

// 点击搜索框
function focusSearch() {
    isSearchFocus.value = true;
    if (!isSearching.value) {
        shopsList.value = [];
    }
}

// 搜索输入处理
function onSearchInput() {
    if (searchTimer.value) {
        clearTimeout(searchTimer.value);
    }
    
    searchTimer.value = setTimeout(() => {
        if (searchKeyword.value.trim()) {
            searchShops();
        } else {
            loadRandomShops();
        }
    }, 500);
}

// 清空搜索
function clearSearch() {
    searchKeyword.value = '';
    isSearchFocus.value = false;
    isSearching.value = false;
    
    if (searchTimer.value) {
        clearTimeout(searchTimer.value);
        searchTimer.value = null;
    }
    
    loadRandomShops();
}

// 处理定位错误
function handleLocationError(error) {
    console.error('定位错误详情:', error);
    
    if (error.errMsg.includes('auth deny') || error.errMsg.includes('permission')) {
        uni.showModal({
            title: '定位权限提示',
            content: '需要获取您的位置信息来推荐附近店铺',
            confirmText: '手动选择',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    openCityPicker();
                } else {
                    loadRandomShops();
                }
            }
        });
    } else {
        uni.showToast({
            title: '定位失败，显示推荐店铺',
            icon: 'none',
            duration: 2000
        });
        loadRandomShops();
    }
}

// 选择店铺
function selectShop(shop) {
    console.log('选择店铺:', shop);
    
    uni.navigateTo({
        url: `/pages/blog/edit?shopId=${shop._id}&shopName=${encodeURIComponent(shop.shopName)}`,
        success: () => {
            uni.$emit('shopSelected', shop);
        }
    });
}

// 返回上一页
function goBack() {
    uni.navigateBack();
}

// 商家头像加载失败处理
function handleShopAvatarError(event) {
    console.log('商家头像加载失败:', event);
    event.target.src = '/static/default-shop.jpg';
}
</script>

<style lang="scss" scoped>
.choose-edit {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 头部导航 */
.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-bottom: 1rpx solid #f0f0f0;
    
    .nav-bar {
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30rpx;
        
        .nav-left {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:active {
                opacity: 0.6;
            }
        }
        
        .nav-title {
            font-size: 36rpx;
            font-weight: 600;
            color: #333;
        }
        
        .nav-right {
            width: 60rpx;
        }
    }
}

/* 内容区域 */
.content {
    padding: 30rpx;
}

/* 定位区域 */
.location-section {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
    
    .location-header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        
        .location-title {
            font-size: 32rpx;
            font-weight: 600;
            color: #2c3e50;
            margin-left: 12rpx;
            flex: 1;
        }
        
        .location-actions {
            display: flex;
            gap: 20rpx;
            
            .location-refresh, .location-choose {
                font-size: 26rpx;
                color: #4F8BFF;
                
                &:active {
                    opacity: 0.6;
                }
            }
        }
    }
    
    .location-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .address {
            font-size: 28rpx;
            color: #7f8c8d;
            line-height: 1.5;
        }
        
        .location-type {
            font-size: 24rpx;
            color: #95a5a6;
            background: #f8f9fa;
            padding: 6rpx 12rpx;
            border-radius: 12rpx;
        }
    }
}

/* 搜索区域 */
.search-section {
    margin-bottom: 30rpx;
    
    .search-box {
        position: relative;
        background: #ffffff;
        border-radius: 50rpx;
        padding: 20rpx 30rpx;
        display: flex;
        align-items: center;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
        
        .search-icon {
            margin-right: 16rpx;
            flex-shrink: 0;
        }
        
        .search-input {
            flex: 1;
            font-size: 28rpx;
            color: #333;
            
            &::placeholder {
                color: #999;
            }
        }
        
        .clear-btn {
            width: 40rpx;
            height: 40rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f5f5f5;
            
            &:active {
                background: #e0e0e0;
            }
        }
    }
}

/* 店铺区域 */
.shops-section {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;
        
        .section-title {
            font-size: 32rpx;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .section-desc {
            font-size: 24rpx;
            color: #7f8c8d;
        }
    }
}

/* 加载骨架屏 */
.loading-shops {
    .shop-skeleton {
        display: flex;
        align-items: center;
        padding: 30rpx;
        background: #ffffff;
        border-radius: 20rpx;
        margin-bottom: 20rpx;
        
        .skeleton-avatar {
            width: 120rpx;
            height: 120rpx;
            border-radius: 16rpx;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.2s ease infinite;
            margin-right: 24rpx;
        }
        
        .skeleton-info {
            flex: 1;
            
            .skeleton-name {
                height: 32rpx;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.2s ease infinite;
                border-radius: 8rpx;
                margin-bottom: 16rpx;
                width: 60%;
            }
            
            .skeleton-address {
                height: 24rpx;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.2s ease infinite;
                border-radius: 6rpx;
                width: 80%;
            }
        }
    }
}

/* 空状态 */
.empty-shops {
    text-align: center;
    padding: 100rpx 40rpx;
    background: #ffffff;
    border-radius: 24rpx;
    
    .empty-icon {
        font-size: 120rpx;
        margin-bottom: 30rpx;
        opacity: 0.6;
    }
    
    .empty-text {
        font-size: 32rpx;
        font-weight: 600;
        color: #2c3e50;
        display: block;
        margin-bottom: 16rpx;
    }
    
    .empty-desc {
        font-size: 26rpx;
        color: #7f8c8d;
        display: block;
        line-height: 1.5;
    }
    
    .empty-btn {
        background: #4F8BFF;
        color: white;
        border: none;
        border-radius: 50rpx;
        padding: 20rpx 40rpx;
        font-size: 28rpx;
        margin-top: 30rpx;
        
        &:active {
            background: #3a7cff;
        }
    }
}

/* 店铺列表 */
.shops-list {
    .shop-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30rpx;
        background: #ffffff;
        border-radius: 20rpx;
        margin-bottom: 20rpx;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        
        &:active {
            transform: scale(0.98);
            background: #f8f9fa;
        }
        
        .shop-left {
            display: flex;
            align-items: center;
            flex: 1;
            
            .shop-avatar {
                width: 120rpx;
                height: 120rpx;
                border-radius: 16rpx;
                margin-right: 24rpx;
                border: 2rpx solid #f0f0f0;
            }
            
            .shop-info {
                flex: 1;
                
                .shop-name {
                    font-size: 32rpx;
                    font-weight: 600;
                    color: #2c3e50;
                    display: block;
                    margin-bottom: 12rpx;
                    line-height: 1.3;
                }
                
                .shop-address {
                    font-size: 26rpx;
                    color: #7f8c8d;
                    display: block;
                    margin-bottom: 12rpx;
                    line-height: 1.4;
                }
                
                .shop-meta {
                    display: flex;
                    align-items: center;
                    gap: 20rpx;
                    
                    .shop-rating {
                        background: #FFF8E1;
                        padding: 6rpx 12rpx;
                        border-radius: 12rpx;
                        display: inline-flex;
                        align-items: center;
                        
                        .rating-star {
                            color: #FFD700;
                            font-size: 22rpx;
                            margin-right: 4rpx;
                        }
                        
                        .rating-value {
                            font-size: 22rpx;
                            color: #FF6B35;
                            font-weight: 600;
                        }
                    }
                    
                    .distance {
                        font-size: 24rpx;
                        color: #95a5a6;
                        background: #f8f9fa;
                        padding: 6rpx 12rpx;
                        border-radius: 12rpx;
                    }
                }
            }
        }
        
        .shop-right {
            margin-left: 20rpx;
        }
    }
}

/* 城市选择器 */
.city-picker {
    height: 70vh;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    flex-direction: column;
    
    .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32rpx;
        border-bottom: 1rpx solid #f0f0f0;
        
        .picker-title {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
        }
        
        .picker-close {
            width: 48rpx;
            height: 48rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f5f5f5;
            
            &:active {
                background: #e0e0e0;
            }
        }
    }
    
    .picker-content {
        flex: 1;
        padding: 0 32rpx;
        overflow-y: auto;
    }
    
    .city-section {
        margin-bottom: 32rpx;
        
        .section-title {
            font-size: 28rpx;
            font-weight: 600;
            color: #333;
            margin-bottom: 20rpx;
            display: block;
        }
    }
    
    .city-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        
        .city-tag {
            padding: 16rpx 24rpx;
            background: #f8f9fa;
            border-radius: 12rpx;
            font-size: 26rpx;
            color: #333;
            transition: all 0.3s ease;
            
            &.active {
                background: #4F8BFF;
                color: white;
            }
            
            &:active {
                transform: scale(0.95);
                opacity: 0.8;
            }
        }
    }
    
    .picker-footer {
        padding: 32rpx;
        border-top: 1rpx solid #f0f0f0;
        
        .confirm-btn {
            background: #4F8BFF;
            color: white;
            border: none;
            border-radius: 50rpx;
            height: 80rpx;
            font-size: 30rpx;
            font-weight: 600;
            width: 100%;
            
            &:active {
                background: #3a7cff;
            }
        }
    }
}

/* 底部提示 */
.footer-tips {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 16rpx;
    padding: 24rpx 32rpx;
    margin: 30rpx;
    
    .tip-text {
        display: block;
        font-size: 24rpx;
        color: #7f8c8d;
        line-height: 1.6em;
        margin-bottom: 8rpx;
    }
}

/* 动画 */
@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
    .content {
        padding: 20rpx;
    }
    
    .location-section,
    .shop-item {
        padding: 24rpx;
        border-radius: 16rpx;
    }
    
    .shop-avatar {
        width: 100rpx !important;
        height: 100rpx !important;
    }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
    .choose-edit {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }
    
    .header {
        background: rgba(44, 62, 80, 0.95);
        border-bottom-color: #4a6572;
        
        .nav-title {
            color: #ecf0f1;
        }
    }
    
    .location-section,
    .search-box,
    .shop-item,
    .empty-shops {
        background: #2c3e50;
    }
    
    .section-title,
    .location-title,
    .shop-name {
        color: #ecf0f1 !important;
    }
    
    .address,
    .shop-address,
    .empty-desc {
        color: #bdc3c7 !important;
    }
    
    .footer-tips {
        background: rgba(44, 62, 80, 0.7);
    }
    
    .city-picker {
        background: #2c3e50;
        
        .picker-title {
            color: #ecf0f1;
        }
        
        .city-tag {
            background: #34495e;
            color: #ecf0f1;
            
            &.active {
                background: #4F8BFF;
            }
        }
    }
}
</style>