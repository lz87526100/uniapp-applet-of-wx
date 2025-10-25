<template>
	<view class="layout">
		<view class="content">
			<textarea class="textarea" placeholder="说点什么吧..." auto-height :maxlength="600" v-model="formData.content"></textarea>
		</view>
		
		<view class="pics">
			<uni-file-picker 
				v-model="formData.pics" 
				fileMediatype="image" 
				mode="grid"				
			/>
		</view>
		
		<view class="btns">
			<button type="primary" plain :disabled="btnDisabled" @click="onSubmit">提交</button>			
		</view>		
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';

// ✅ 正确导入云对象
const articlesCloudObj = uniCloud.importObject("articlesCloudObj");

const formData = ref({
	content: "",
	pics: []
});

const btnDisabled = computed(() => !(formData.value.content.length > 0 || formData.value.pics.length > 0));

const onSubmit = async () => {
	console.log("提交数据", formData.value);
    
    // ✅ 过滤图片数据
    const params = {
        ...formData.value,
        pics: formData.value.pics.map(item => ({
			name: item.name,
			extname: item.extname,
			url: item.url
		})),
		publish_date: Date.now() // 添加发布时间字段，用于排序
    };
	
	try {
		// ✅ 正确调用云对象的 add 方法
		const result = await articlesCloudObj.add(params);
		console.log("返回结果", result);
		
		if (result.errCode === 0) {
			uni.showToast({
				title: "发布成功",
				icon: "none"
			});
			//销毁跳转
            // setTimeout(()=>{
            //     uni.redirectTo({
            //         url:"/pages/blog/list"
            //     })
            // },1000)
            //list页面的事件发送
            setTimeout(()=>{
            uni.$emit("editEvent");
            uni.navigateBack();
            },100)    
            
			// 清空表单
			formData.value.content = "";
			formData.value.pics = [];
		} else {
			uni.showToast({
				title: "发布失败：" + (result.errMsg || result.message || "未知错误"),
				icon: "none",
				duration: 3000
			});
		}
	} catch (error) {
		console.error("调用失败", error);
		uni.showToast({
			title: "网络错误：" + error.message,
			icon: "none"
		});
	}
};

const onUploadSuccess = (e) => {
	console.log("上传成功", e);
};

const onUploadFail = (err) => {
	console.error("上传失败", err);
};

</script>

<style lang="scss" scoped>
.layout{
	.content {
		padding: 30rpx;	
		.textarea {
			font-size: 38rpx;
			width: 100%;
			line-height: 1.7em;
			min-height: 200rpx;
		}
	}
	.pics{
		padding:30rpx;
	}
	.btns{
		padding:30rpx;		
		button{
			width: 100%;
		}
	}
}
</style>