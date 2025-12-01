<!-- store-head.vue -->
<template>
  <view class="homeHead">
    <!-- 状态栏占位 -->
    <!-- <view class="statusBar" :style="{ height: getStatusBarHeight() + 'px' }"></view> -->
    <!-- 标题栏（原 navBar 区域）-->
    
    <!-- #ifdef MP-WEIXIN -->
   <view class="navBar" :style="{ height: getTitleBarHeight() + 'px' }"></view>
  <!-- #endif -->
    <!-- 新增：商家标题区域（替代原来的 .header） -->
    <view class="shop-header">
      <view class="title-wrapper">
        <view class="title-icon">✨</view>
        <text class="title">精选商家</text>
        <view class="divider"></view>
        <view class="subtitle">发现高分好店 · 每日更新</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { getStatusBarHeight, getTitleBarHeight } from "@/utils/system.js"
</script>

<style lang="scss" scoped>
.homeHead {
  // 背景色保持不变
  background:
    radial-gradient(50% 300px at left top, #d5f8fc, transparent),
    radial-gradient(50% 200px at right top, #d3cbfc, transparent);

  .statusBar,
  .navBar {
    width: 100%;
  }

  

  .shop-header {
    padding: 40rpx 60rpx 40rpx  ; // 微调，使总高≈260rpx
    text-align: center;
    position: relative;

    .title-wrapper {
      display: inline-block;
      padding: 0 20rpx;
      position: relative;
      z-index: 2;
    }

    .title-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
      vertical-align: middle;
      animation: float 3s ease-in-out infinite;
    }

    .title {
      font-size: 48rpx;
      font-weight: 800;
      background: linear-gradient(90deg, #FF6B35, #4A6CF7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 2rpx;
      vertical-align: middle;
      animation: titleGlow 2s ease-in-out infinite alternate;
    }

    .divider {
      height: 4rpx;
      width: 80rpx;
      background: linear-gradient(to right, transparent, rgba(255, 107, 53, 0.6), transparent);
      margin: 20rpx auto;
      border-radius: 2rpx;
    }

    .subtitle {
      font-size: 26rpx;
      color: #718096;
      margin-top: 12rpx;
      opacity: 0.9;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes titleGlow {
  from { text-shadow: 0 0 10rpx rgba(255, 107, 53, 0.3); }
  to { text-shadow: 0 0 20rpx rgba(74, 108, 247, 0.5), 0 0 30rpx rgba(255, 107, 53, 0.4); }
}
</style>