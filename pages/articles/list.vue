<template>
    <view class="">
        <view class="item" v-for="(item,index) in listData" :key="item._id">
            <view>标题：{{item.title}}</view>
            <view>内容：{{item.content}}</view>
            <view>发布者：{{item?.user_id[0]?.nickname || "未命名"}}</view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';

const db = uniCloud.database();
const listData = ref([])

console.log(uniCloud.getCurrentUserInfo().uid);


const getData = async()=>{ 
   try{
       //链表查询 jql云端环境 $cloudEnv_uid == uid 为当前用户的uid
       let artTemp = db.collection("demo-articles").where('user_id == $cloudEnv_uid ').getTemp();
       let userTemp = db.collection("uni-id-users").field("nickname,_id,username").getTemp();
       //赋值
       let {result:{data}} = await db.collection(artTemp,userTemp).get();
       listData.value = data; 
       console.log(data);
   }catch(err){
       uni.showModal({
           content:"未登录，将跳转至登录页面",
           showCancel:false
       })
   }
}
getData();

</script>

<style lang="scss" scoped>
.item{
    padding: 30rpx;
   border-bottom: 1px solid #eee; 
}
</style>
