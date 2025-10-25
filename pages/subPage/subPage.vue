<template>
  <view class="layout">
    <!-- 新闻标题 & 正文 -->
<!--    <view class="news-panel">
      <input class="news-title" v-model="form.name"  placeholder="请输入新闻标题（最多 50 字）" maxlength="50" />
      <textarea class="news-content" v-model="form.description" placeholder="请输入新闻正文（最多 2000 字）" maxlength="2000" />
    </view> -->
    
    <uni-forms ref="formRef" :modelValue="form" :rules="rules">
          <!-- 新闻标题 & 正文 -->
          <view class="news-panel">
            <uni-forms-item name="name">
              <input class="news-title" v-model="form.name" placeholder="请输入新闻标题（最多 50 字）" maxlength="50" />
            </uni-forms-item>
            <uni-forms-item name="description">
              <textarea class="news-content" v-model="form.description" placeholder="请输入新闻正文（最多 2000 字）" maxlength="2000" />
            </uni-forms-item>
            </view>
            </uni-forms>
            
    <!-- 照片提交卡片 -->
    <view class="pic-card">
      <!-- 空态：大卡片 + 图标 + 文字 -->
      <view v-if="pictures.length == 0" class="pic-empty" @click="selectPic">
        <text class="pic-empty__txt">点击添加图片</text>
      </view>

      <!-- 图片列表 -->
      <view v-for="(item,index) in pictures" :key="index" class="pic-item">
        <image class="pic-item__img" :src="item.temp" mode="aspectFill" />
        <!-- 上传中遮罩 -->
        <view v-if="item.status == 1" class="pic-item__mask">
          <text class="pic-item__progress">{{item.progress}}%</text>
        </view>
        <!-- 关闭按钮 -->
        <text class="pic-item__close" @click="hanldClose">x</text>
      </view>
    </view>

    <!-- 上传按钮 -->
    <button @click="onSubmit">上传</button>
  </view>
</template>

<script setup>
import {ref} from 'vue';
import dayjs from 'dayjs';

//获取组件
const formRef=ref(null);

//表单数据
const form = ref({
    classname:'',
    description:'',
    picurl:''
})

//检验规则
const rules = {
  classname: { rules: [{ required: true, errorMessage: '请输入标题' }] },
  description: { rules: [{ required: true, errorMessage: '请输入正文' }] },
}



//通过pictures中各数据的值来判断状态
// {temp:"",fileID:"",url:"",status:2,progress:0  }
// status 0 为显示 + ， 1 为添加进程遮蔽   2 为去掉遮蔽显示图片
const pictures = ref([]);

// 关闭 云对象 importObject 交互提示
const uploadFileObj = uniCloud.importObject("uploadFileObj",{
    customUI:true
});

//照片选择功能模块
const  selectPic = async()=>{
    // 控制图片可选中数量
   let file = await uni.chooseImage({
        count:1
    })
    //保存 图片的本地文件路径列表 地址
    pictures.value = file.tempFilePaths.map(item=>({temp:item,status:0,progress:0}));

}

//确认上传
const onSubmit = async()=>{
    
    await formRef.value.validate();
    
    uni.showLoading({mask:true})
    try{
        await uniCloud.database().collection('demo-wallper').add(form.value)
        uni.showToast({
            title:'发布成功',
            icon:'none'
        })
        setTimeout(()=>uni.navigateBack(),500)
    }catch(e){
        uni.showModal({
            content:e.message || '提交失败',
            showCancel:false
        })
    }finally{
        uni.hideLoading()
    }
    
    
    
    

    // console.log(pictures.value[0].temp);
    // 云端路径防重
    let filename = dayjs().format("YYYYMMDD")+"/"+Date.now()+".jpg";
    
    //更改照片遮盖层加载进度
    pictures.value[0].status = 1;
    
    // cloud文件上传
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

    
    //对临时地址进行替换
    const cloudToHttps = (str) =>{
        return str.replace("cloud://","https://")
        .replace(str.split("/")[2],str.split("/")[2]+".normal.cloudstatic.cn");
    }
    
    //清空删除
    const hanldClose =()=>{
        uploadFileObj.remove([pictures.value[0].fileID]).then(res=>{
            console.log(res);
        })
        pictures.value = [];
    }

</script>

<style lang="scss" scoped>
/* -------- 新闻提交区（新增） -------- */
.news-panel{
  margin: 30rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.05);
  .news-title{
    width: 93%;
    height: 80rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
  }
  .news-content{
    width: 93%;
    height: 300rpx;
    padding: 20rpx;
    font-size: 28rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 8rpx;
    margin-bottom: 30rpx;
  }
}

/* -------- 全新照片卡片（原 .picGroup 已删除） -------- */
.pic-card{
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding: 30rpx;
  background: #f5f7fa;
  border-radius: 24rpx;
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,.05);
}

/* 空态 */
.pic-empty{
  width: 100%;
  height: 280rpx;
  border: 2rpx dashed #c8c9cc;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: all .3s;
  &:active{
    transform: scale(.98);
    opacity: .8;
  }
  &__icon{
    font-family: "iconfont";
    font-size: 64rpx;
    margin-bottom: 12rpx;
  }
  &__txt{
    font-size: 28rpx;
  }
}

/* 图片项 */
.pic-item{
  position: relative;
  width: calc((100% - 48rpx) / 3);
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,.15);
  &__img{
    width: 100%;
    height: 100%;
    display: block;
  }
  &__mask{
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,.55);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 32rpx;
  }
  &__close{
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: rgba(0,0,0,.5);
    color: #fff;
    font-family: "iconfont";
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .2s;
    &:active{
      transform: scale(1.15);
    }
  }
}

/* -------- 上传按钮 -------- */
button{
  margin: 30rpx;
  width: calc(100% - 60rpx);
  height: 88rpx;
  background: #2979ff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 8rpx;
}

/* =====================================
   补充：pic-item 子元素缺失样式
===================================== */

.pic-item {
  position: relative;
  width: calc((100% - 48rpx) / 3);
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

  &_img {
    width: 100%;
    height: 100%;
    display: block;
  }

  &_mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 32rpx;
  }

  &_progress {
    color: #fff;
    font-size: 32rpx;
  }

  &_close {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;

    &:active {
      transform: scale(1.15);
    }
  }
}
</style>