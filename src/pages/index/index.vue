<template>
	<view class="container">
		<!-- 欢迎区域 -->
		<view class="welcome card">
			<text class="greeting">👋 欢迎回来</text>
			<text class="sub-text">今天是 {{ currentDate }}</text>
		</view>

		<!-- 功能入口（6个） -->
		<view class="grid-menu">
			<view class="menu-item" @click="navigateTo('/pages/news/news')">
				<view class="icon-wrapper">📰</view>
				<text class="menu-text">时政新闻</text>
			</view>
			<view class="menu-item" @click="navigateTo('/pages/anti-fraud/index')">
				<view class="icon-wrapper">🛡️</view>
				<text class="menu-text">防诈骗</text>
			</view>
			<view class="menu-item" @click="navigateTo('/pages/entertainment/index')">
				<view class="icon-wrapper">🎭</view>
				<text class="menu-text">文学娱乐</text>
			</view>
			<view class="menu-item" @click="navigateTo('/pages/service/index')">
				<view class="icon-wrapper">🔧</view>
				<text class="menu-text">生活服务</text>
			</view>
			<view class="menu-item" @click="navigateTo('/pages/history/history')">
				<view class="icon-wrapper">🕒</view>
				<text class="menu-text">浏览历史</text>
			</view>
			<view class="menu-item" @click="navigateTo('/pages/favorite/favorite')">
				<view class="icon-wrapper">⭐</view>
				<text class="menu-text">我的收藏</text>
			</view>
		</view>

		<!-- 今日推荐 -->
		<view class="section" v-if="recommendList.length > 0">
			<text class="section-title">📌 今日推荐</text>
			<view class="card" v-for="item in recommendList" :key="item.id" @click="goDetail(item)">
				<text class="recommend-title">{{ item.title }}</text>
				<text class="recommend-desc">{{ item.desc }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShareAppMessage } from '@dcloudio/uni-app';
import request from '@/utils/request.js';

const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	weekday: 'long'
}));

const recommendList = ref([]);

// 从新闻和防诈骗中各取2条作为今日推荐
const fetchRecommend = async () => {
	try {
		const [newsRes, fraudRes] = await Promise.all([
			request({ url: '/news/list', data: { page: 1, pageSize: 2 } }),
			request({ url: '/fraud/list', data: { page: 1, pageSize: 2 } })
		]);

		// 兼容两种情况：返回的直接是数组，或者返回 {code:0, data:[]}
		const newsData = Array.isArray(newsRes) ? newsRes : (newsRes.data || []);
		const fraudData = Array.isArray(fraudRes) ? fraudRes : (fraudRes.data || []);

		const items = [];
		newsData.forEach(n => {
			items.push({
				id: n.id,
				type: 'news',
				title: n.title,
				desc: n.source,
				url: `/pages/news/detail?id=${n.id}`
			});
		});
		fraudData.forEach(f => {
			items.push({
				id: f.id,
				type: 'fraud',
				title: f.title,
				desc: f.summary,
				url: `/pages/anti-fraud/detail?id=${f.id}`
			});
		});
		recommendList.value = items.slice(0, 5);
	} catch (e) {
		console.error('获取推荐失败', e);
	}
};

onMounted(() => {
	fetchRecommend();
});

// 分享给朋友
onShareAppMessage(() => {
    return {
        title: '银发智慧生活 - 专为老年人打造的便捷服务平台',
        path: '/pages/index/index',
        imageUrl: '' // 可设置分享图片 URL
    };
});

// 分享到朋友圈（需要基础库 2.11.3+）
// onShareTimeline(() => {
//     return {
//         title: '银发智慧生活 - 专为老年人打造的便捷服务平台',
//         imageUrl: ''
//     };
// });

const navigateTo = (url) => {
	uni.navigateTo({ url });
};

const goDetail = (item) => {
	if (item.url) {
		uni.navigateTo({ url: item.url });
	}
};
</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }

.welcome {
	.greeting {
		font-size: $font-size-title;
		font-weight: bold;
		display: block;
		margin-bottom: $spacing-sm;
	}
	.sub-text {
		font-size: $font-size-base;
		color: $color-text-light;
	}
}

.grid-menu {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: $spacing-lg;
	margin: $spacing-xl 0;
	.menu-item {
		background-color: $color-bg;
		border-radius: 24rpx;
		padding: $spacing-md;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.05);
		.icon-wrapper { font-size: 64rpx; margin-bottom: $spacing-sm; }
		.menu-text { font-size: $font-size-base; font-weight: 500; }
	}
}

.section { margin-top: $spacing-lg; }

.section-title {
	font-size: $font-size-title;
	font-weight: bold;
	margin-bottom: $spacing-md;
	color: $color-text;
	border-left: 8rpx solid $color-primary;
	padding-left: $spacing-md;
}

.recommend-title {
	font-size: $font-size-title;
	font-weight: bold;
	display: block;
	margin-bottom: $spacing-sm;
	color: $color-text;
}

.recommend-desc {
	font-size: $font-size-base;
	color: $color-text-light;
	display: block;
}
</style>