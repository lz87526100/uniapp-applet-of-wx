<template>
    <!--v-if当有数据是才会显示内容 -->
    <view class="detail" v-if="detail">
        <view class="content">
            <!-- <image v-if="item.avatar" :src="item.avatar[0].url" mode="widthFix"></image> -->
        <view>头像：<image v-if="detail.avatar" :src="detail.avatar[0].url" ></image></view>    
        <view>姓名：<text class="big">{{detail.name}}</text></view>
        <view>年龄：<text class="big">{{detail.age}}</text></view>
        <!-- <view>性别：<text class="big">{{detail.genger}}</text></view> -->
        <view>IP：<text class="big">{{detail.ip}}</text></view>
        <view>创建时间：<text class="big">{{dayjs(detail.createTime).format("YYYY-MM-DD HH:mm:ss")}}</text></view>        
    </view>
    
    <view class="group" >
        <button type="primary" @click="goUpdate(detail._id)">修改</button>
        <button type="warn" @click="handleRemove">删除</button>
    </view>
    
    </view>
</template>

<script setup>
 //数据加载
  import {onLoad} from "@dcloudio/uni-app"
  import { ref } from "vue";
  //导入时间戳
  import dayjs from "dayjs";
  const db = uniCloud.database();  
  let id;
  const detail = ref();
  
  
  
  onLoad((e)=>{
    // console.log(e);
    id = e.id;
    getDetail();
  })
  
  const getDetail = async ()=>{
      let res = await db.collection("demo-user")
      // .where(`_id == "${id}"`)==doc(id)
      .doc(id)
      .get({getOne:true});
      console.log(res.result.data);
      detail.value = res.result.data;
  }
  
  const handleRemove =  ()=>{
      uni.showModal({
          title:"是否删除改数据",
          success: async res=>{
              if(res.confirm){
                let res = await db.collection("demo-user")
                .doc(id)
                .remove();  
                uni.showToast({
                    title:"删除成功",
                    icon:"none"
                })
                setTimeout(()=>{uni.navigateBack()},1500)
              }
          }
      })
  }
  
  const goUpdate = (e)=>{
      console.log(e);
      uni.navigateTo({
          url:"/pages/demo0719/update?id="+e
      })
  }
  
</script>

<style lang="scss" scoped>
.detail{
    padding: 30rpx;
    .content{
         font-size: 30rpx;
         .big{
             font-size: 32rpx;
             font-weight: bolder;
         }
    }
}
.group{
    margin-top: 30rpx;
    display: flex;//放在一行
    gap:30rpx;//间距
    button{
        width: 100%;
    }
}
</style>
