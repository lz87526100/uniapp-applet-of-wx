<template>
    <view class="layout">
        <view class="item" v-for="item in dataList " :key="item._id">
            <view class="left">
                <image :src="item.picurl" mode="widthFix"></image>
            </view>
            <view class="right">
                <view class="desc">{{item.description}}</view>
                <view class="name">{{item.classid[0].name}}</view>
            </view>
        </view>
    </view>
        
</template>

<script setup>
    import {ref} from 'vue';
    const dataList = ref([])
    
    const db = uniCloud.database();
    
    const getData = async ()=>{
        
       // 传统方式 浪费带宽 
       //  let datas = res.result.data;
       //  for(let i=0 ; i < datas.length ; i++){
       //      let classid = datas[i].classid;
       //      let row = await db.collection("demo-classify").where(`_id == "${classid}"`)
       //      .get({getOne:true});
       //      datas[i].newClassname = row.result.data.name
       //  }
       
       //获取demo-wallper中的数据
        let wallTemp = db.collection("demo-wallper").getTemp();
        //获取demo-classify中的数据
        let classTemp = db.collection("demo-classify").getTemp();
        
        let res = await db.collection(wallTemp,classTemp).get(); 
        
        console.log(res);
        dataList.value = res.result.data;
    }
    
    getData();
</script>

<style lang="scss" scoped>
.layout{
    padding: 30rpx;
    .item{
        display: flex;
        .left{
            width: 200rpx;
            image{
                width: 100%;
            }
        }
        .right{
            flex:1 ;
            padding-left:30rpx ;
        }
        .desc{
            font-size: 38rpx;
        }
        .name{
            font-weight: bold;
        }
    }
}
</style>
