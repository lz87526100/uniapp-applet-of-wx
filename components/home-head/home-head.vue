<template>
    <view class="homeHead">
        <view class="statusBar" :style="{height:getStatusBarHeight()+'px'}"></view>
        <view class="titleBar" :style="{height:getTitleBarHeight()+'px'}">就这 </view>
        <view class="content">
            <view class="time">
                <view class="left">
                    <uni-dateformat :date="currentDate" format="dd"></uni-dateformat>
                </view>
                <view class="right">
                    <view class="year">
                        <uni-dateformat :date="currentDate" format="yyyy年MM月"></uni-dateformat>
                    </view>
                    <view class="week">
                        {{ weekDay }}
                    </view>
                </view>
            </view>
            <view class="pic">
                <image src="/static/logo/headPic.png" mode="heightFix"></image>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getStatusBarHeight, getTitleBarHeight } from "@/utils/system.js"

const currentDate = ref(new Date())

// 使用计算属性获取星期几
const weekDay = computed(() => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return days[currentDate.value.getDay()]
})
</script>

<style lang="scss">
.homeHead{
    background:
    radial-gradient(50% 300px at left top,#d5f8fc,transparent),
    radial-gradient(50% 200px at right top,#d3cbfc,transparent);
   
   .titleBar {
        display: flex;
        align-items: center;
        padding-left: 50rpx;
    }
    
    .content{
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .time{
            display: flex;
            padding-left: 50rpx;
            align-items: center;
            
            .left{
                font-size: 100rpx;
                font-weight: bolder;
            }
            
            .right{
                padding-left: 15rpx;
                
                .year{
                    font-size: 30rpx;
                }
                
                .week{
                    font-size: 40rpx;
                    font-weight: bolder;
                }
            }
        }
        
        .pic{
            height: 260rpx;
            padding-right: 40rpx;
            
            image{
                width:100%;
                height: 100%;
            }
        }
    }
}
</style>