<template>
	<text class="soupContent" :style="{'-webkit-line-clamp':maxline}">
别看了\n
数据还没写\n
库还没建\n
人还在晕\n
		
	</text>

	<view class="author">
		<view class="line"></view>
		
		<view class="outer">
			<view class="userinfo">
				<view class="avatar">
					<image src="/static/images/logo.png" mode="aspectFill"></image>
				</view>
				<view class="name">张三</view>
				<view class="from">摘自：红楼梦</view>
			</view>			
			<view class="number" v-if="lookState">共33人看过</view>
		</view>
	</view>
</template>

<script setup>
	defineProps({
		maxline: {
			type: [String, Number],
			default: 'none'
		},
		lookState:{
			type:Boolean,
			default:false
		}
	})
</script>

<style lang="scss" scoped>
	.soupContent {
		font-size: 50rpx;
		font-weight: lighter;
		width: 100%;
		letter-spacing: 0.05em;
		line-height: 1.8em;
		margin-top: 10rpx;
		margin-bottom: 60rpx;
		@include maxline();
	}

	.author {
		.line {
			width: 70rpx;
			height: 5rpx;
			background: #f0f0f0;
			margin-bottom:30rpx;
		}
		.outer{
			display: flex;
			justify-content: space-between;
			align-items: center;
			.number{
				font-size: 26rpx;
				color:#999;
			}
			.userinfo {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				coor: #888;
				.avatar {
					width: 40rpx;
					height: 40rpx;
			
					image {
						width: 100%;
						height: 100%;
					}
				}
			
				.name {
					padding-left: 12rpx;
				}
			
				.from {
					padding-left: 12rpx;
				}
			}
		}

		

	}
</style>