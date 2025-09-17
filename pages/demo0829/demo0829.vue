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
       
       //获取demo-wallper中的数据 进行临时表查询
        let wallTemp = db.collection("demo-wallper")
        // .where(` classid ==  "68b056dad35e526534a0beaa" `)
        //条件过滤
        .where({_id: "68b2df1f8c093f5f3379581e"})
        //限制传出内容
        .field("_id,description,classid,picurl")
        .orderBy("_id desc").limit(3)
        //获取临时表 不进行网络查询
        .getTemp();
        
        //获取demo-classify中的数据
        let classTemp = db.collection("demo-classify").field("_id,name").getTemp();
        
        //主表在前 副表在后 进行 联表 网络查询 
        let res = await db.collection(wallTemp,classTemp)
        .field("_id,description, picurl,classid")
        .get(); 
        
        console.log(res)
        // 拷贝res中的data
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
