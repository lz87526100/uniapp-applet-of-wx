<template>
	<view class="layout">
		<!-- 顶部标题栏 -->
		<!-- <view class="header"> -->
			<!-- <text class="header-title">发布动态</text> -->
			<!-- <text class="header-desc">分享你的精彩瞬间</text> -->
		<!-- </view> -->
		
		<!-- 内容区域 -->
		<view class="content-card">
			<view class="card-header">
				<text class="card-title">此刻想法</text>
				<text class="word-count">{{ formData.content.length }}/600</text>
			</view>
			<textarea 
				class="textarea" 
				placeholder="分享你的想法、经历或感悟..." 
				placeholder-class="placeholder"
				auto-height 
				:maxlength="600" 
				v-model="formData.content"
				@input="onContentInput"
			></textarea>
		</view>
		
		<!-- 图片上传区域 -->
		<view class="content-card">
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
		
		<!-- 提交按钮 -->
		<view class="footer">
			<button 
				class="submit-btn" 
				:class="{ 'submit-btn-disabled': btnDisabled }" 
				:disabled="btnDisabled" 
				@click="onSubmit"
			>
				<text class="btn-text">{{ btnDisabled ? '请填写内容' : '立即发布' }}</text>
				<text class="btn-icon">➜</text>
			</button>
		</view>
		
		<!-- 发布提示 -->
		<view class="tips">
			<text class="tip-text">• 请遵守社区规范，文明发言</text>
			<text class="tip-text">• 图片支持 JPG、PNG 格式</text>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';

const articlesCloudObj = uniCloud.importObject("articlesCloudObj");

const formData = ref({
	content: "",
	pics: []
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

const btnDisabled = computed(() => !(formData.value.content.length > 0 || formData.value.pics.length > 0));

const onContentInput = () => {
	// 内容输入时的额外处理
};

const onSubmit = async () => {
	console.log("提交数据", formData.value);
    
    const params = {
        ...formData.value,
        pics: formData.value.pics.map(item => ({
			name: item.name,
			extname: item.extname,
			url: item.url
		})),
		publish_date: Date.now()
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
				title: "🎉 发布成功",
				icon: "success",
				duration: 1500
			});
			
			setTimeout(() => {
				uni.$emit("editEvent");
				uni.navigateBack();
			}, 100);
			
			// 清空表单
			formData.value.content = "";
			formData.value.pics = [];
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
	padding: 30rpx;
}


.header {
	text-align: center;
	margin-bottom: 20rpx;
	padding: 40rpx 0 20rpx 0;
	
	.header-title {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 12rpx;
	}
	
	.header-desc {
		font-size: 28rpx;
		color: #7f8c8d;
	}
}

.content-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 30rpx;
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

.footer {
	padding: 40rpx 0;
	
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
	margin-top: 20rpx;
	
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
	.layout {
		padding: 20rpx;
	}
	
	.content-card {
		padding: 24rpx;
		border-radius: 20rpx;
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
}
</style>