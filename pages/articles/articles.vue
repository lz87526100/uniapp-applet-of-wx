<template>
    <view class="">
        
        <button @click="add">新增</button>
    </view>
</template>

<script setup>
const db = uniCloud.database();


const add=()=>{
    db.collection("demo-articles").add({
        title:"demo1023测试",
        content:"demo1023测试内容"
    }).then(res=>{
        console.log(res);
    })
}

</script>

<style lang="scss" scoped>

</style>
