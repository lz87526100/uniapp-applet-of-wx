<template>
	<view class="layout">
		<view class="list">
			<view class="item" v-for="(item,index) in articlesList" :key="index">					
				<view class="userinfo">
					<view class="avatar"><image class="pic" src="../../static/defAvatar.png" mode="aspectFill"></image></view>
					<view class="username">{{item.user_id[0].nickname || "匿名"}}</view>
				</view>
				<view class="body">			
					<view class="text">
						<view class="font">{{item.content}}</view>
					</view>
					<view class="piclist" v-if="item.pics.length">
						<view class="pic" v-for="(pic,index) in item.pics" :key="index">
							<image :src="pic.url" mode="aspectFill"></image>
						</view>					
					</view>
				</view>
				
				
				<view class="info">
					<view class="left">				
						<uni-dateformat :date="item.publish_date" format="MM月dd hh:mm" :threshold="[60000,3600000*24*30]"></uni-dateformat>
					</view>
					<view class="right">				
						<view class="remove" v-if="isPermission(item.user_id[0]._id)" @click="remove(item._id)">
							<uni-icons type="trash-filled" size="16" color="#999"></uni-icons>删除	
						</view>
					</view>
				</view>							
							
			</view>
		</view>
				
		
		<uni-fab ref="fab" :pattern="{icon:'compose'}" horizontal="right" vertical="bottom" @fabClick="goAdd"/>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import {isPermission} from "../../utils/common.js"

const articlesCloudObj = uniCloud.importObject("articlesCloudObj")
const articlesList = ref({});

const CurrentUserInfo = uniCloud.getCurrentUserInfo();

console.log(CurrentUserInfo);

//edit页面的事件接收
uni.$on("editEvent",(e)=>{
    getData();
    })

const remove = async(id)=>{
 try{
     let feedback = await uni.showModal({
         title:"提示",
         content:"是否确认删除？"
     })
     if(!feedback.confirm)return;
     let {errCode} = await articlesCloudObj.remove(id);
     if (errCode ==0){
         uni.showToast({
             title:"删除成功",
             icon:"none",
            duration: 4000,          // 显式写出
            complete: () => setTimeout(getData, 1000) // 等 toast 消失后再刷新
         })
     }
 }catch(err){
     uni.showToast({
         title:err,
          icon:"none"
     })
 }
}

const getData= async()=>{
    //解构
 
    let {errCode,data} = await articlesCloudObj.list();
    articlesList.value = data;
    console.log(data);

}

const goAdd = ()=>{
	uni.navigateTo({
		url:"/pages/blog/edit"
	})
}

getData();

</script>

<style lang="scss" scoped>
.layout{
	.list{
		.item{
			padding:40rpx 30rpx;
			border-bottom:10px solid #f4f4f4;
			.userinfo{
				display: flex;
				align-items: center;
				border-bottom:1px solid #f4f4f4;
				padding-bottom:30rpx;
				.avatar{
					width: 50rpx;
					height: 50rpx;
					border-radius: 50%;
					overflow: hidden;
					margin-right: 10rpx;					
					.pic{
						width: 100%;
						height: 100%;
					}
				}
				.username{
					font-size: 28rpx;
					color:#333;
				}
			}
			.body{
				padding:15rpx 0 30rpx;		
				.text{			
					padding-bottom:10rpx;
					font-size: 40rpx;
					text-align: justify;
					color:#111;
					line-height: 1.7em;
					.font{
						text-overflow: -o-ellipsis-lastline;
						overflow: hidden;				
						text-overflow: ellipsis;		
						display: -webkit-box;			
						-webkit-line-clamp: 2;			
						line-clamp: 2;					
						-webkit-box-orient: vertical;
						width: 100%;				
						word-break:break-all; 
					}
				}
				.piclist{
					display: grid;
					grid-template-columns: repeat(3,1fr);
					gap: 15rpx;
					padding-top:20rpx;
					.pic{				
						overflow: hidden;
						border-radius: 10rpx;
						aspect-ratio: 1 / 1;
						border-radius: 10rpx;
						image{
							width: 100%;
							height: 100%;
						}
					}
					
				}
			}
			
			
			.info{
				display: flex;
				align-items: center;
				justify-content:space-between;
				font-size: 28rpx;	
				color:#999;		
				.right{
					display: flex;
					align-items: center;
					.ipname{
						margin-right: 20rpx;
					}
				}
			}	
		}
	}
}
</style>
