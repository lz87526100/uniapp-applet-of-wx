<!-- App.vue -->
<script>
	export default {
		onLaunch() {
			console.log('App Launch')
		},
		onShow() {
			console.log('App Show')
		},
		onHide() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
// ✅ 正确方式：直接在这里设置 page 背景色
page {
  // background-color: pink;
}

//无法实现
// ✅ 继续导入你的 base-style.scss（用于 class 等样式）
@import "./common/style/base-style.scss";
@import "@/static/font/iconfont.css";
</style>