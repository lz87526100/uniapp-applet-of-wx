<template>
	<view class="soupItem" @click="goEdit">
		<view class="head">
			<view class="left">
				<self-tab-group></self-tab-group>
			</view>
			<view class="right" @click.stop="goDetail">
				<uni-icons type="eye" size="18" color="#999"></uni-icons>
				<text>详情</text>
			</view>
		</view>
		
		<view class="content">
		</view>
		
		<view class="info">
			<view class="left">
				<view class="time">
				</view>
			</view>
			<view class="right">
				<view class="group" >
					<view class="every">
						<uni-icons type="heart" color="#a7a7a7" size="16"></uni-icons>
						<text class="font" ></text>
					</view>
					<view class="every">
						<uni-icons type="star" color="#a7a7a7" size="16"></uni-icons>
						<text class="font"></text>
					</view>
					<view class="every">
						<uni-icons type="chatbubble" color="#a7a7a7" size="16"></uni-icons>
						<text class="font" ></text>
					</view>
				</view>
				
				<view>
				</view>
				
			</view>
		</view>
	</view>
</template>

<script setup>
// import {stateFormat} from "@/utils/common.js"
// import { computed } from "vue";
// const props = defineProps({
// 	item:{
// 		type:Object,
// 		default(){
// 			return {}
// 		}
// 	}
// })

// const useStateFormat =  computed(()=>stateFormat(props.item.status))

const goEdit = ()=>{		
	uni.navigateTo({
		// url:"/pages_self/soup/edit?id="+props.item._id
	})
}
const goDetail = ()=>{
	console.log("跳转详情");
	uni.navigateTo({
		// url:"/pages/detail/detail"
	})
}
</script>

<style lang="scss" scoped>
.soupItem{
	border:1px solid #e4e4e4;
	border-bottom-width: 3px;
	margin-bottom: 40rpx;
	border-radius: 10rpx;
	
	.head{
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding:20rpx;
		.right{
			font-size: 28rpx;
			color:$text-font-color-3;
			display: flex;
			align-items: center;			
			padding:5rpx 10rpx;
			text{
				margin-left:10rpx;
				line-height: 1em;
			}
		}
	}
	.content{
		padding:30rpx 20rpx;
		font-size: 40rpx;
		font-weight: bold;
		line-height: 1.7em;
		text-align: justify;		
	}
	.info{
		background: #f9f9f9;
		padding:20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color:$text-font-color-3;
		.group{
			display: flex;
			align-items: center;
			.every{
				margin-left:20rpx;
				.font{					
					font-size: 26rpx;
				}
			}
		}
	}
}
</style>