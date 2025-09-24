<template>
    <view class="layout">
        <view class="picGroup"> 
        <!-- pictures.length==0时显示 +  -->
        <view class="box add" @click="selectPic" v-if="pictures.length==0">+</view>
        <view class="box" v-for="item,index  in pictures">
            <!-- :src 动态获取 -->
            <image :src="item.temp" mode="aspectFill">{{item.data}}</image>
            <view class="close" @click="hanldClose">x</view>
            <view class="mask" v-if="item.status == 1">{{item.progress}}%</view>
        </view>
        </view>
    </view>
</template>


<script setup>
import {ref} from 'vue';
import dayjs from 'dayjs';

const uploadFileObj = uniCloud.importObject("uploadFileObj",{
    // 取消交互提示
    customUI:true
});

const pictures = ref([]);
// {temp:"",fileID:"",url:"",status:2,progress:0  }
// status 0 为显示 + ， 1 为添加进程遮蔽   2 为去掉遮蔽显示图片

const  selectPic = async()=>{
   let file = await uni.chooseImage({
        count:1
    })
    pictures.value = file.tempFilePaths.map(item=>({temp:item,status:0,progress:0}));
    // 地址
    // console.log(pictures.value[0].temp);
    let filename = dayjs().format("YYYYMMDD")+"/"+Date.now()+".jpg";
    
    //更改照片遮盖层加载进度
    pictures.value[0].status = 1;
    
    let cloud = await uniCloud.uploadFile({
        filePath:pictures.value[0].temp,
         cloudPath:filename,
         //返回当前进度和总大小
         onUploadProgress:event=>{
             // console.log(event);
             pictures.value[0].progress = Math.round(
             (event.loaded * 100) / event.total
             ); 
         }
    })
    //重置状态 显示图片
    pictures.value[0].status = 2;
    console.log(cloud.fileID);
 
    let path =  cloudToHttps(cloud.fileID);
    
    pictures.value[0].fileID = cloud.fileID;
    pictures.value[0].url = path;
    
    console.log(pictures.value);
}
    //清空删除
    const hanldClose =()=>{
        uploadFileObj.remove([pictures.value[0].fileID]).then(res=>{
            console.log(res);
        })
        pictures.value = [];
    }

    //对临时地址进行替换
    const cloudToHttps = (str) =>{
        return str.replace("cloud://","https://")
        .replace(str.split("/")[2],str.split("/")[2]+".normal.cloudstatic.cn");
    }

</script>

<style lang="scss" scoped>
.layout{
    padding:30rpx;
    .picGroup{
        // grid布局
        display: grid;
        grid-template-columns:repeat(3,1fr);
        //网格间隙
        gap:20rpx;
         .box{
            width: 100%;
            //自定义比例
            aspect-ratio: 1 / 1;
            position: relative;
            image{
                width: 100%;
                height: 100%;
                display: block;
            }
            .close{
                position: absolute;
                top: 10rpx;
                right: 10rpx;
                width: 60rpx;
                height: 60rpx;
                background: rgba(0,0,0,0.6);
                color: #fff;
                border:1px solid #fff;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .mask{
                position: absolute;
                top:0;
                left:0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        .add{
            background: #eee;
            font-size: 90rpx;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
