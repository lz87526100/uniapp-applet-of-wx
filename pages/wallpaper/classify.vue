<template>
	<view class="layout">		
		<view class="add">
			<input class="ipt" type="text" v-model="classname" placeholder="请输入分类名称" @confirm="onConfirm">			
		</view>
		<view class="list">
			<view class="item" v-for="item in classList" :key="item._id">		
				<view class="name" >{{item.name}}</view>
				<view class="status">
					<switch :checked="item.status" style="transform:scale(0.6)" 
                    @change="(e)=>switchChange(e,item._id)"/>
                    <!-- 为了获取switchChange中的数据使用e， item._id输出id -->
				</view>
				<view class="remove">
					<uni-icons type="trash" size="26" @click="handleRemove(item._id)"></uni-icons>
				</view>
			</view> 
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
//保存输入分类名称
const classname = ref("");
//分类名称
const classList = ref([]);
const db = uniCloud.database();


const getClassify = async()=>{
    //获取demo-classify里面的数据
    let res = await db.collection("demo-classify")
    .orderBy("createTime desc")
    .get();
    
    console.log(res);
    classList.value = res.result.data;
}


// 数据显示开关
const switchChange = async(e,id)=>{
    let res = await db.collection("demo-classify").doc(id).update({
        status:e.detail.value
    })
    console.log(res);
    await  getClassify();
}

//删除功能
const handleRemove = async(id)=>{
    uni.showLoading({mask:true});
    
    let feed = await uni.showModal({
        title:"是否删除该数据"
    })
    if(!feed.confirm) return uni.hideLoading();
    
    // let res = await db.collection("demo-classify").where(`_id == "${id}"`).remove();
    let res = await db.collection("demo-classify").doc(id).remove();
    console.log(res);
    uni.showToast({
        title: '删除成功',
        icon:"none"
    });
    await getClassify();
    
}

//回车确认事件
const onConfirm = async()=>{
    uni.showLoading({});
    let res = await db.collection("demo-classify").add({
        name:classname.value
    })
    uni.showToast({
        title:"添加成功",
        icon:"none"
    })
    
    classname.value = '';                         // 清空输入框
    uni.hideKeyboard();                           // 收起键盘
    await getClassify();                          // 立即重新拉数据 → 页面自动刷新
  
}

getClassify();

</script>

<style lang="scss" scoped>
.layout{
	padding:30rpx;
	.add{
		margin-bottom: 30rpx;
		display: flex;
		gap:20rpx;
		.ipt{
			width: 100%;
			border:1px solid #eee;
			height: 70rpx;
			padding:0 20rpx;
			box-sizing: border-box;
		}		
	}
	.item{
		display: flex;
		padding:10rpx 0;
		align-items: center;
		justify-content: space-between;
		.name{
			color:#007AFF;
			flex:1;
		}
		.status{
			width: 100rpx;			
		}
		.remove{
			width:100rpx;
			display: flex;
			justify-content: flex-end;
		}
	}
}
</style>
