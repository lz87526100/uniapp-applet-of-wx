<template>
  <view class="layout">
      <view class="head">
          共{{queryParams.total}}条数据，已获取{{userList.length}}条数据
      </view>
      
      <input @confirm="onConfirm" type="text" class="search" v-model="keyword" placeholder="请输入数据"/>
      
      <view class="box" v-for=" item,index in userList " :key="item._id" @click="goDetail(item._id)">
        <view>序列号：{{index+1}}</view>
        <view>ID：{{item._id}}</view>
        <image v-if="item.avatar" :src="item.avatar[0].url" mode="widthFix"></image>
        <view>姓名：{{item.name}}</view>
        <view>年龄：{{item.age}}</view>
        <view>性别：{{item.genger}}</view>
        <view>创建时间：{{item.createTime}}</view>
      </view>
  </view>
</template> 

<script setup>
import { ref } from 'vue';
import { onReachBottom } from "@dcloudio/uni-app"

    
const db = uniCloud.database(); 
const queryParams = ref({
    pageNum:1,
    pageSize:8,
    total:0
})

const noData = ref(false);
const userList = ref([]);


//输入框中的双向绑定
const keyword = ref("");

const onConfirm = ()=>{
    // //正则匹配
    // res = console.log( new RegExp(keyword.value , 'i').test("abcdefg"));
    userList.value = [];
    getData();
}

const getData = async ()=>{
    
    let current = queryParams.value.pageSize * (queryParams.value.pageNum-1)
    let res = await db.collection("demo-user")
    //利用正则表达式实现模糊查询
    .where(`${new RegExp(keyword.value,'i')}.test(name)`)
    // 排序 asc  升序 desc 降序
    .orderBy("createTime desc")
    .skip(current)
    .limit(queryParams.value.pageSize)
    //过滤不需要的内容 节省流量开支
    .field("name,age,createtime,avatar")
    .get({
        getCount:true
    });
    
    //获取完数据关闭loading
    uni.hideLoading();
    
    //没有错误且errCode为0时
    if(res.result.errCode === 0){
        //内容拼接
        userList.value = [...userList.value,...res.result.data] ;
        //将res中的总数count赋值给total
        queryParams.value.total = res.result.count;
        //剩余页数不足时将noData变为true
        if(queryParams.value.pageSize > res.result.data.length) {
            noData.value= true;
        }
    }else{
        uni.showToast({
            title:res.result.errMsg,
            icon:'none' 
        })
    }
    console.log(res);
}

const goDetail = (e)=>{
    console.log(e);
    uni.navigateTo({
        url:"/pages/demo0719/detail?id="+e
    })
}

//触底翻页
onReachBottom(()=>{
    //当noData为真时归零
    if(noData.value) {
        uni.showToast({
            title:'到底了！！',
            icon:'none'
        })
        uni.hideLoading();
    return
    };
    uni.showLoading({
        title:'加载中'
    })
    queryParams.value.pageNum++;
   
    getData();
})

getData(); 

</script>

<style lang="scss" scoped>
.layout{
    .head{
        text-align: center;
        padding: 10rpx 0;
        font-size: 26rpx;
        color: #888;
    }
    .search{
        margin: 30rpx 0;
        border: 1px solid #eee;
        padding: 0 20rpx;
        height: 70rpx;
    }
    // min-height: 100vh; // 关键：确保页面可滚动
    .box{
        padding: 15rpx 30rpx;
        border-bottom: 1px solid #eee;
    }
}
</style>
 