<template>
	<view class="floating-home" @click="goHome" v-if="showButton">
		<text class="icon">🏠</text>
		<text class="text">首页</text>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const pages = getCurrentPages()
const currentRoute = pages[pages.length - 1]?.route
const showButton = computed(() => currentRoute !== 'pages/index/index')

const goHome = () => {
	uni.switchTab({
		url: '/pages/index/index'
	})
}
</script>

<style lang="scss" scoped>
.floating-home {
	position: fixed;
	right: 30rpx;
	bottom: 150rpx;
	width: 120rpx;
	height: 120rpx;
	background-color: $color-primary;
	border-radius: 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
	z-index: 999;
	
	.icon {
		font-size: 48rpx;
		color: white;
		margin-bottom: 4rpx;
	}
	
	.text {
		font-size: 28rpx;
		color: white;
	}
}
</style>