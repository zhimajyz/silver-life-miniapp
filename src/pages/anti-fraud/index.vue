<template>
	<view class="container">
		<view class="section-title">🛡️ 防诈骗科普</view>
		
		<!-- 轮播图（展示前3条） -->
		<swiper v-if="banners.length > 0" class="swiper" indicator-dots autoplay circular>
			<swiper-item v-for="item in banners" :key="item.id">
				<view class="swiper-item" @click="goDetail(item.id)">
					<text class="banner-text">{{ item.title }}</text>
				</view>
			</swiper-item>
		</swiper>
		
		<!-- 科普文章列表 -->
		<view class="card article-item" v-for="item in articles" :key="item.id" @click="goDetail(item.id)">
			<view class="article-content">
				<text class="article-title">{{ item.title }}</text>
				<text class="article-summary">{{ item.summary }}</text>
			</view>
			<image v-if="item.coverImage" class="cover" :src="item.coverImage" mode="aspectFill"></image>
		</view>
		
		<view v-if="loading" class="loading-tip">加载中...</view>
		<view v-if="noMore" class="no-more-tip">没有更多了</view>
		
		<FloatingHome />
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onReachBottom } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import FloatingHome from '@/components/FloatingHome.vue';

const articles = ref([]);
const banners = ref([]);
const page = ref(1);
const pageSize = 10;
const loading = ref(false);
const noMore = ref(false);

const fetchArticles = async (isLoadMore = false) => {
	if (!isLoadMore) {
		page.value = 1;
		noMore.value = false;
	}
	if (loading.value || noMore.value) return;
	loading.value = true;
	try {
		const res = await request({
			url: '/fraud/list',
			data: { page: page.value, pageSize }
		});
		const list = res.data || res || [];
		if (isLoadMore) {
			articles.value.push(...list);
		} else {
			articles.value = list;
			// 取前3条作为轮播图
			banners.value = list.slice(0, 3);
		}
		noMore.value = list.length < pageSize;
	} catch (e) {
		console.error('获取防诈骗数据失败', e);
	} finally {
		loading.value = false;
	}
};

// 触底加载更多
onReachBottom(() => {
	if (!noMore.value) {
		page.value++;
		fetchArticles(true);
	}
});

// 首次加载
onMounted(() => {
	fetchArticles();
});

const goDetail = (id) => {
	uni.navigateTo({ url: `/pages/anti-fraud/detail?id=${id}` });
};
</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }
.swiper {
	height: 200rpx; margin-bottom: $spacing-lg;
	.swiper-item {
		background-color: $color-primary; height: 100%; display: flex; align-items: center; justify-content: center;
		border-radius: 16rpx; padding: 0 $spacing-lg;
		.banner-text { font-size: $font-size-title; color: white; font-weight: bold; }
	}
}
.article-item {
	display: flex; align-items: center; margin-bottom: $spacing-md;
	.article-content {
		flex: 1; margin-right: $spacing-md;
		.article-title { font-size: $font-size-title; font-weight: bold; display: block; margin-bottom: $spacing-sm; }
		.article-summary {
			font-size: $font-size-base; color: $color-text-light;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			word-break: break-all;
		}
	}
	.cover { width: 160rpx; height: 120rpx; border-radius: 12rpx; background-color: #eee; }
}
.loading-tip, .no-more-tip {
	text-align: center; padding: $spacing-md; font-size: $font-size-small; color: $color-text-light;
}
</style>