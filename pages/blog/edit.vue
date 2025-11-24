<template>
    <!-- <view class="statusBar" :style="{height:getStatusBarHeight()+'px'}"></view> -->
	<view class="layout">
		<!-- 商家信息头部 -->
		<view class="shop-header" v-if="shopInfo">
			<view class="shop-bg">
				<image class="bg-image" :src="shopInfo.shopPic || '/static/default-shop.jpg'" mode="aspectFill" />
				<view class="bg-overlay"></view>
			</view>
			
			<view class="shop-info">
				<image class="shop-logo" :src="shopInfo.shopPic || '/static/default-shop.jpg'" mode="aspectFill" />
				<view class="shop-details">
					<text class="shop-name">{{ shopInfo.shopName }}</text>
					<view class="shop-meta">
						<text class="shop-rating" v-if="shopInfo.rating > 0">
							<text class="rating-star">★</text>
							<text class="rating-value">{{ (shopInfo.rating / 10).toFixed(1) }}</text>
						</text>
						<text class="shop-address" v-if="shopInfo.address">{{ shopInfo.address }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more status="loading" content="加载商家信息..." />
		</view>

		<!-- 内容区域 -->
		<view class="content-card" v-if="!loading && shopInfo">
			<view class="card-header">
				<text class="card-title">评价商家</text>
				<text class="word-count">{{ formData.content.length }}/600</text>
			</view>
			<textarea 
				class="textarea" 
				:placeholder="`分享你对${shopInfo.shopName}的评价...`" 
				placeholder-class="placeholder"
				auto-height 
				:maxlength="600" 
				v-model="formData.content"
				@input="onContentInput"
			></textarea>
		</view>
		
		<!-- 图片上传区域 -->
		<view class="content-card" v-if="!loading && shopInfo">
			<view class="card-header">
				<text class="card-title">添加图片</text>
				<text class="pic-count">{{ formData.pics.length }}/9</text>
			</view>
			<view class="pics">
				<uni-file-picker 
					v-model="formData.pics" 
					fileMediatype="image" 
					mode="grid"
					limit="9"
					:image-styles="imageStyles"
					@success="onUploadSuccess"
					@fail="onUploadFail"
				/>
			</view>
		</view>

		<!-- 评分区域 -->
		<view class="content-card" v-if="!loading && shopInfo">
			<view class="card-header">
				<text class="card-title">评分</text>
			</view>
			<view class="rating-section">
				<view class="stars">
					<text 
						v-for="n in 5" 
						:key="n" 
						class="star" 
						:class="{ active: formData.rating >= n }"
						@click="setRating(n)"
					>★</text>
				</view>
				<text class="rating-text">{{ ratingText }}</text>
			</view>
		</view>
		
		<!-- 提交按钮 -->
		<view class="footer" v-if="!loading && shopInfo">
			<button 
				class="submit-btn" 
				:class="{ 'submit-btn-disabled': btnDisabled }" 
				:disabled="btnDisabled" 
				@click="onSubmit"
			>
				<text class="btn-text">{{ btnDisabled ? '请填写内容和评分' : '立即发布' }}</text>
				<text class="btn-icon">➜</text>
			</button>
		</view>
		
		<!-- 发布提示 -->
		<view class="tips" v-if="!loading && shopInfo">
			<text class="tip-text">• 请遵守社区规范，文明发言</text>
			<text class="tip-text">• 图片支持 JPG、PNG 格式</text>
			<text class="tip-text">• 评价内容将公开显示</text>
		</view>

		<!-- 错误状态 -->
		<view v-if="error" class="error-state">
			<view class="error-icon">😔</view>
			<text class="error-title">加载失败</text>
			<text class="error-desc">{{ error }}</text>
			<button class="retry-btn" @click="loadShopInfo(shopId)">重试</button>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getStatusBarHeight, getTitleBarHeight } from "@/utils/system.js"

const articlesCloudObj = uniCloud.importObject("articlesCloudObj");

// 商家信息
const shopInfo = ref(null);
const loading = ref(false);
const error = ref('');
const shopId = ref('');

// 表单数据
const formData = ref({
	content: "",
	pics: [],
	rating: 0,
	shopId: ""
});

// 图片样式配置
const imageStyles = {
	width: 220,
	height: 220,
	border: {
		color: "#e5e5e5",
		width: 1,
		style: 'dashed',
		radius: '12rpx'
	}
};

// 计算属性
const btnDisabled = computed(() => {
	return !(formData.value.content.length > 0 && formData.value.rating > 0);
});

const ratingText = computed(() => {
	const texts = ['请评分', '很差', '一般', '满意', '很好', '完美'];
	return texts[formData.value.rating] || texts[0];
});

// 生命周期
onLoad((options) => {
    console.log('页面参数:', options);
    console.log('接收到的shopId:', options.shopId); // 添加调试
    
    if (options.shopId) {
        shopId.value = options.shopId;
        formData.value.shopId = options.shopId; // 确保这里正确赋值
        console.log('设置后的shopId:', shopId.value); // 调试
        loadShopInfo(options.shopId);
    } else {
        error.value = '商家信息不存在';
        console.error('未接收到shopId参数'); // 添加错误日志
        uni.showToast({
            title: '商家信息不存在',
            icon: 'none'
        });
    }
});

// 方法 - 加载商家信息
async function loadShopInfo(id) {
	console.log('开始加载商家信息，ID:', id);
	loading.value = true;
	error.value = '';

	try {
		// 调用云函数获取商家信息
		const res = await uniCloud.callFunction({
			name: 'getShopDetail',
			data: { shopId: id }
		});

		console.log('商家信息返回:', res);

		if (res.result?.errCode === 0) {
			shopInfo.value = res.result.data;
			
			// 设置页面标题
			uni.setNavigationBarTitle({
				title: `评价${shopInfo.value.shopName}`
			});
		} else {
			error.value = res.result?.errMsg || '加载商家信息失败';
			console.error('加载失败:', error.value);
		}
	} catch (e) {
		console.error('加载商家信息失败:', e);
		error.value = '网络错误，请重试';
	} finally {
		loading.value = false;
	}
}

const setRating = (rating) => {
	formData.value.rating = rating;
};

const onContentInput = () => {
	// 内容输入时的额外处理
};

const onSubmit = async () => {
	console.log("提交数据", formData.value);
    
    const params = {
        content: formData.value.content,
        pics: formData.value.pics.map(item => ({
			name: item.name,
			extname: item.extname,
			url: item.url
		})),
		publish_date: Date.now(),
		shop_id: formData.value.shopId, // 商家ID
		rating: formData.value.rating   // 评分
    };
	
	try {
		uni.showLoading({
			title: '发布中...',
			mask: true
		});
		
		const result = await articlesCloudObj.add(params);
		console.log("返回结果", result);
		
		uni.hideLoading();
		
		if (result.errCode === 0) {
			uni.showToast({
				title: "🎉 评价成功",
				icon: "success",
				duration: 1500
			});
			
			setTimeout(() => {
				// 发送事件通知商家详情页更新评价
				uni.$emit("reviewAdded", {
					shopId: formData.value.shopId,
					rating: formData.value.rating
				});
				uni.navigateBack();
			}, 100);
			
			// 清空表单
			formData.value.content = "";
			formData.value.pics = [];
			formData.value.rating = 0;
		} else {
			uni.showToast({
				title: "发布失败：" + (result.errMsg || result.message || "未知错误"),
				icon: "none",
				duration: 3000
			});
		}
	} catch (error) {
		uni.hideLoading();
		console.error("调用失败", error);
		uni.showToast({
			title: "网络错误：" + error.message,
			icon: "none"
		});
	}
};

const onUploadSuccess = (e) => {
	console.log("上传成功", e);
	uni.showToast({
		title: '图片上传成功',
		icon: 'success',
		duration: 1500
	});
};

const onUploadFail = (err) => {
	console.error("上传失败", err);
	uni.showToast({
		title: '图片上传失败',
		icon: 'error',
		duration: 2000
	});
};
</script>

<style lang="scss" scoped>
.layout {
	min-height: 100vh;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 商家信息头部 */
.shop-header {
	position: relative;
	height: 400rpx;
	margin-bottom: 30rpx;
    overflow: hidden;
	
	.shop-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		
		.bg-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		
		.bg-overlay {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
		}
	}
	
	.shop-info {
		position: absolute;
		bottom: 40rpx;
		left: 30rpx;
		right: 30rpx;
		display: flex;
		align-items: flex-end;
		
		.shop-logo {
			width: 120rpx;
			height: 120rpx;
			border-radius: 20rpx;
			border: 4rpx solid white;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
			margin-right: 24rpx;
			flex-shrink: 0;
		}
		
		.shop-details {
			flex: 1;
			
			.shop-name {
				font-size: 36rpx;
				font-weight: 700;
				color: white;
				display: block;
				margin-bottom: 12rpx;
				text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
			}
			
			.shop-meta {
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				
				.shop-rating {
					background: rgba(255, 255, 255, 0.9);
					padding: 8rpx 16rpx;
					border-radius: 20rpx;
					display: inline-flex;
					align-items: center;
					align-self: flex-start;
					
					.rating-star {
						color: #FFD700;
						font-size: 24rpx;
						margin-right: 4rpx;
					}
					
					.rating-value {
						font-size: 24rpx;
						font-weight: 600;
						color: #333;
					}
				}
				
				.shop-address {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.9);
					background: rgba(255, 255, 255, 0.2);
					padding: 6rpx 16rpx;
					border-radius: 16rpx;
					backdrop-filter: blur(10rpx);
					align-self: flex-start;
				}
			}
		}
	}
}

/* 加载状态 */
.loading-state {
	padding: 100rpx 0;
	text-align: center;
}

/* 错误状态 */
.error-state {
	text-align: center;
	padding: 200rpx 40rpx;
	
	.error-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}
	
	.error-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 16rpx;
		display: block;
	}
	
	.error-desc {
		font-size: 26rpx;
		color: #7f8c8d;
		margin-bottom: 40rpx;
		display: block;
		line-height: 1.5;
	}
	
	.retry-btn {
		background: #667eea;
		color: white;
		border: none;
		border-radius: 50rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
	}
}

.content-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin: 0 30rpx 30rpx 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f1f2f6;
		
		.card-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #2c3e50;
		}
		
		.word-count, .pic-count {
			font-size: 26rpx;
			color: #95a5a6;
		}
	}
}

.textarea {
	font-size: 34rpx;
	width: 92%;
	line-height: 1.8em;
	min-height: 240rpx;
	color: #2c3e50;
	background: #fafbfc;
	border-radius: 16rpx;
	padding: 24rpx;
	border: 1rpx solid #e1e8ed;
	transition: all 0.3s ease;
	
	&:focus {
		border-color: #3498db;
		background: #ffffff;
		box-shadow: 0 0 0 2rpx rgba(52, 152, 219, 0.1);
	}
}

.placeholder {
	color: #bdc3c7;
	font-size: 32rpx;
}

.pics {
	padding: 0;
}

/* 评分区域 */
.rating-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 0;
	
	.stars {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
		
		.star {
			font-size: 60rpx;
			color: #e0e0e0;
			cursor: pointer;
			transition: all 0.2s ease;
			
			&.active {
				color: #FFD700;
				transform: scale(1.1);
			}
			
			&:hover {
				transform: scale(1.2);
			}
		}
	}
	
	.rating-text {
		font-size: 28rpx;
		color: #7f8c8d;
		font-weight: 500;
	}
}

.footer {
	padding: 40rpx 30rpx;
	
	.submit-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 34rpx;
		font-weight: 600;
		box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.4);
		transition: all 0.3s ease;
		
		.btn-text {
			margin-right: 12rpx;
		}
		
		.btn-icon {
			font-size: 28rpx;
			transition: transform 0.3s ease;
		}
		
		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
			
			.btn-icon {
				transform: translateX(4rpx);
			}
		}
	}
	
	.submit-btn-disabled {
		background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
		box-shadow: none;
		color: #ecf0f1;
		
		&:active {
			transform: none;
			box-shadow: none;
		}
	}
}

.tips {
	background: rgba(255, 255, 255, 0.7);
	border-radius: 16rpx;
	padding: 24rpx 32rpx;
	margin: 0 30rpx 40rpx 30rpx;
	
	.tip-text {
		display: block;
		font-size: 24rpx;
		color: #7f8c8d;
		line-height: 1.6em;
		margin-bottom: 8rpx;
	}
}

/* 响应式设计 */
@media (max-width: 750rpx) {
	.shop-header {
		height: 260rpx;
		
		.shop-info {
			left: 20rpx;
			right: 20rpx;
			
			.shop-logo {
				width: 100rpx;
				height: 100rpx;
			}
			
			.shop-name {
				font-size: 32rpx;
			}
		}
	}
	
	.content-card {
		padding: 24rpx;
		border-radius: 20rpx;
		margin: 0 20rpx 20rpx 20rpx;
	}
	
	.textarea {
		font-size: 32rpx;
		min-height: 200rpx;
	}
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
	.layout {
		background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
	}
	
	.content-card {
		background: #2c3e50;
		
		.card-title {
			color: #ecf0f1;
		}
	}
	
	.textarea {
		background: #34495e;
		color: #ecf0f1;
		border-color: #4a6572;
		
		&:focus {
			border-color: #3498db;
		}
	}
	
	.placeholder {
		color: #95a5a6;
	}
	
	.tips {
		background: rgba(44, 62, 80, 0.7);
	}
}
</style>