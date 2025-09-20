
<template>
    <view class="">
        <!--当 return-type = object 时，组件只能单选，返回为对象；
            当 array（默认）时，组件可多选 -->
        <!-- @progress="onprogress" 为调用监听事件-->
        <uni-file-picker
        ref="file"
        v-model="ImageValue"
        mode="grid"
        limit="6"
        return-type="object" 
        @progress="onProgress" 
        :auto-upload="false"
            />
        <button @click="onSubmit">上传</button> 
    </view> 
</template>

<script setup>
import {ref} from 'vue';
const imageValue = ref([])
const file = ref(null); 

const onProgress = (e) =>{
    console.log(e);
}

const onSubmit = () =>{
    file.value.upload();
}

</script>

<style>

</style>
