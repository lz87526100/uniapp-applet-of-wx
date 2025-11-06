<template>
	<view class="soupTabGroup">
		<view class="tab xljt" v-if="type===0">
			<view class="icon">
				<image src="/static/images/xin-icon.png" mode="aspectFill"></image>
			</view>
			<view class="text">心灵鸡汤</view>
		</view>
		<view class="tab djt" v-if='type===1'>
			<view class="icon">
				<image src="/static/images/du-icon.png" mode="aspectFill"></image>
			</view>
			<view class="text">毒鸡汤</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	type:{
		type:Number,
		default:0
	}
})
</script>

<style lang="scss" scoped>
	.soupTabGroup {
		.tab {
			height: 56rpx;
			width: fit-content;
			background: #aaa;
			display: flex;
			align-items: center;
			font-size: 26rpx;
			font-weight: 400;
			letter-spacing: normal;
			padding: 0 20rpx;
			border-radius: 56rpx;

			.icon {
				display: flex;
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				image {
					width: 80%;
					height: 80%;
				}
			}

			.text {
				padding-left: 10rpx;
			}
		}

		.tab.xljt {
			background: #FFF3F7;
			.icon {
				background: linear-gradient(to right, #f83162, #ff7795);
			}
		}

		.tab.djt{
			background: #EDFDF0;
			.icon {
				background-image: linear-gradient(to right, #4F9153, #4bbb8b);
			}
		}
	}
</style>