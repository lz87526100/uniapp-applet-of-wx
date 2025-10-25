<template>
    <view class="layout">
        <input v-model="formData.name" placeholder="请输入姓名"/>
        <input v-model.number="formData.age" type="number" placeholder="请输入年龄"/>
        <button @click="handleUpdate">修改</button>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
let id;
const db = uniCloud.database();

const formData = ref({
    name:"",
    age:""
})


//获取id
onLoad((e)=>{
    id=e.id;
    getData();
})

const getData = async ()=>{
    //{result}为深度结构
    let {result:{data}} = await db.collection("demo-user")
    .doc(id)
    //回复一条
    .get({getOne:true})
    console.log(data);
    //将获取到的data值赋值给formData实现原数据内容显示
    formData.value.name  = data.name;
    formData.value.age  = data.age; 
}

const handleUpdate = async()=>{
   let res = await db.collection("demo-user")
   .doc(id)
   .update(formData.value)
   console.log(res);
}

</script>

<style lang="scss" scoped>
.layout{
    padding: 30rpx;
    input{
        border: 1px solid #eee;
        margin-bottom: 30rpx;
        height: 50rpx;
    };
}
</style>
