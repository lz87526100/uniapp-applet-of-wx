<template>
    <view class="">		
    
    <button @click="handleAddUser">新增用户</button>
    
    <view class="item" v-for="item in dataList" :key="item._id">
        <view>{{item.name}}</view>
        <view>{{item._id}}</view >
        <view>{{item.age}}</view >
        <view>{{item.ip}}</view >
        <view>{{item.createTime}}</view >
        <view>-------------</view>
    </view>
</view>
</template>

<script setup>
import {ref} from 'vue';
    
const demoObj = uniCloud.importObject("demoObj0920");
const dataList = ref([]);


const getData = async()=>{
    let {data} = await demoObj.getUser(50);
    dataList.value = data;
    console.log(res);
}

const handleAddUser = async ()=>{
    let res = await  demoObj.addUser({name:"张三",age:21,gender:1});
    
    console.log(res);
    getData();
}

getData();
</script>

<style lang="scss" scoped>

</style>
