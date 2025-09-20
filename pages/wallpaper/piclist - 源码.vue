<template>
	<view class="layout">
		<view class="add" @click="handleAdd">
			<button size="mini" type="primary">添加</button>
		</view>
		<view class="list">
			<!-- <view class="item" v-for="item in 5"> -->
                <view class="item" v-for="item in listData" :key="item._id">
				<view class="left">
					
                    <!-- :src 为动态绑定  -->
                    <image :src="item.url" mode="aspectFill" @click="preview(item.url)"></image>
				</view>
				<view class="right">
					<view class="desc">{{item.description}}</view>
                    <!-- 导入dayjs输出时间 -->
					<view class="classname">
                    <text>
                           {{item.classname[0]}} 
                    </text>
                    <text>
                        {{dayjs(item.createTime).format("MM-DD HH:mm")}}
                    </text>
                    </view>
				</view>
			</view>
		</view>
	</view>
	
		
	<!-- 点击弹窗 -->
	<uni-popup ref="popup" border-radius="10px 10px 0 0" :is-mask-click="false">
		<view class="popupOut">	
            <!-- v-model指向formData.picurl -->
             <uni-file-picker
             v-model="formData.picurl"
             return-type="object"></uni-file-picker>
			<textarea placeholder="请输入壁纸描述" v-model="formData.description"></textarea>	
                    <!-- uni-data-select为官方组件，下拉数据库中的选项 -->
                    <uni-data-select
                    collection="demo-classify"
                    field="name as text,_id as value"
                    where="status == true"
                    orderby="_id desc"
                    v-model="formData.classid"
                    :clear="true">
                    </uni-data-select>
                    {{formData}}
                 
			<view class="group">
				<button type="primary" size="mini" @click="onSubmit" :disabled="disabled">提交</button>
				<button type="default" size="mini" @click="onCancel">取消</button>
			</view>	
		</view>
	</uni-popup>
</template>

<script setup>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
const db = uniCloud.database();
const listData = ref([]);
const popup = ref(null);
const formData = ref({
	description:"",
	picurl:{},
    classid:"",
})
const disabled = computed(()=>{
    // Object.keys用于获取对象键名（key），返回一个字符串数组，可用来判断是否存在数据
    if(formData.value.description && formData.value.classid &&
    Object.keys(formData.value.picurl).length>0){
        return false
    }else{
        return true
    }
})

const getData = async()=>{
    //主表
    let wallTemp = db.collection("demo-wallper")
    //过滤输出内容 减少带宽  as提前重命名 
    .field("_id,description,classid,classname,createTime,picurl.url as url")
    .orderBy("createTime desc")
    .getTemp();
    // let {result:{data,errCode}} = await db.collection("demo-wallper")
    
    // 副表
    let classTemp = db.collection("demo-classify").field("_id,name").getTemp();
    
    //联表 
    // let res = await db.collection(wallTemp,classTemp)
    //解构 res
    let {result:{errCode,data}} = await db.collection(wallTemp,classTemp)
    .field("description,url,classid.name as classname,createTime")
    .get();
    
    // console.log(data);
    // 判断errCode是否正确获取
    if(errCode == 0){
        listData.value = data
    }
}

const preview = (url) =>{
    uni.previewImage({
        urls:[url]
    })
}

const handleAdd = ()=>{
	popup.value.open();
}

const onSubmit = async()=>{	
    uni.showLoading();
    let res = await db.collection("demo-wallper").add(formData.value);
    uni.showToast({
        title:"添加成功",
        icon:'none'
    })
    init();
    getData();
    onCancel();
    console.log(res);
}

const onCancel = ()=>{
	popup.value.close();
}

const init = ()=>{
	formData.value = {
		description:"",
		picurl:{},
		classid:"",
	}
}


getData();

</script>

<style lang="scss" scoped>
.layout{
	padding:30rpx;
	.add{
		margin-bottom:30rpx;
	}
	.list{
		.item{
			padding:15rpx 0;
			border-top:1px solid #eee;
			display: flex;
			.left{
				width: 200rpx;
				height: 200rpx;
				image{
					width: 100%;
					height: 100%;
					border-radius: 8rpx;
				}
			}
			.right{
				flex:1;
				padding-left:30rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				.desc{
					font-size: 30rpx;
					line-height: 1.6em;
				}
				.classname{
					font-size: 28rpx;
					color:#999;
					padding-top:20rpx;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    }
			}
		}
		.item:last-child{
			border-bottom:1px solid #eee;
		}
	}
}
.popupOut{
	width: 660rpx;
	background: #fff;
	border-radius: 10rpx;
	min-height: 400rpx;
	padding:30rpx;
	box-sizing: border-box;
	textarea{
		border:1px solid #efefef;
		padding:10rpx;
		width: 100%;
		height: 150rpx;
		box-sizing: border-box;
		margin:30rpx 0;
	}
	.group{
		padding-top:60rpx;
		padding-bottom:30rpx;
		gap:30rpx;
		display: flex;
		button{
			width: 100%;
		}
	}
}
</style>