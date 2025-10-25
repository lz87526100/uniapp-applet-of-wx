<template>
    <view class="layout">
        <uni-file-picker
        v-model="formData.avatar"
        mode="grid"
        fileMediatype="image"
        limit="1"
        ></uni-file-picker>
        <input v-model="formData.name" placeholder="请输入姓名"/>
        <input v-model.number="formData.age" type="number" placeholder="请输入年龄"/>
        <button @click="handleAdd">新增</button>
    </view>
</template>

<script setup>
    import { ref } from 'vue';
    
    const formData = ref({
        name:"",
        age:"",
        avatar:[]//存放头像
    })
    
    
    const db = uniCloud.database();
    
    const handleAdd = async () =>{
        uni.showLoading({
            title:'加载中'
        })
  
  try{
      let res = await db.collection("demo-user").add(formData.value)
       if(res.result.errCode == 0){
           console.log(res);
           uni.showToast({
               title:'新增成功'
           })
           formData.value={
              name:"",
              age:"",
              avatar:[] 
           }
       }
  }catch(err){
    console.log(err);
      uni.showModal({
          title:'添加失败',
          content:err.errMsg,
          showCancel:false
      })
  }finally{
      uni.hideLoading();
      console.log(typeof formData.value.age, formData.value.age);
  }
    }
</script>

<style lang="scss" scoped>
.layout{
    padding: 30rpx;
    input{
        border: 1px solid #eee;
        margin-bottom: 30rpx;
        height: 50rpx;
        margin-top: 30rpx;
    };
}

</style>
