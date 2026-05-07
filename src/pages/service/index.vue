<template>
	<view class="container">
		<view class="grid-menu">
			<view class="menu-item" @click="openService('hospital')">
				<view class="icon">🏥</view>
				<text class="name">就医预约</text>
			</view>
			<view class="menu-item" @click="openService('payment')">
				<view class="icon">💡</view>
				<text class="name">生活缴费</text>
			</view>
			<view class="menu-item" @click="openService('bus')">
				<view class="icon">🚌</view>
				<text class="name">公交查询</text>
			</view>
			<view class="menu-item" @click="openService('weather')">
				<view class="icon">☀️</view>
				<text class="name">天气预报</text>
			</view>
		</view>
		
		<view class="section">
			<text class="section-title">常用工具</text>
			<view class="card tool-item" @click="openService('calculator')">
				<text class="tool-name">计算器</text>
				<text class="arrow">›</text>
			</view>
			<view class="card tool-item" @click="openService('magnifier')">
				<text class="tool-name">放大镜</text>
				<text class="arrow">›</text>
			</view>
		</view>
		
		<FloatingHome />
	</view>
</template>

<script setup>
import FloatingHome from '@/components/FloatingHome.vue';

const openService = (type) => {
	switch (type) {
		case 'calculator':
			uni.navigateTo({ url: '/pages/calculator/calculator' });
			break;
		case 'magnifier':
			uni.navigateTo({ url: '/pages/magnifier/magnifier' });
			break;
		default:
			uni.showToast({ title: '外部服务对接中', icon: 'none' });
	}
};
</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }
.grid-menu {
	display: grid; grid-template-columns: repeat(3, 1fr); gap: $spacing-lg; margin-bottom: $spacing-xl;
	.menu-item {
		background-color: $color-bg; border-radius: 24rpx; padding: $spacing-md;
		display: flex; flex-direction: column; align-items: center; box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.05);
		.icon { font-size: 64rpx; margin-bottom: $spacing-sm; }
		.name { font-size: $font-size-base; }
	}
}
.tool-item {
	display: flex; justify-content: space-between; align-items: center;
	.tool-name { font-size: $font-size-title; }
	.arrow { font-size: 64rpx; color: $color-text-light; }
}
</style>