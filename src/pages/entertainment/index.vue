<template>
	<view class="container">
		<view class="tabs">
			<view v-for="tab in tabs" :key="tab.key" class="tab-item"
				:class="{ active: currentTab === tab.key }"
				@click="switchTab(tab.key)">
				{{ tab.name }}
			</view>
		</view>

		<!-- 戏曲长廊 -->
		<view v-show="currentTab === 'opera'" class="tab-content">
			<view class="card video-item" v-for="video in operaList" :key="video.id"
				@click="goVideoDetail(video.id)">
				<image class="video-cover" :src="video.cover || '/static/placeholder.png'" mode="aspectFill"></image>
				<view class="video-info">
					<text class="video-title">{{ video.title }}</text>
					<text class="video-desc">{{ video.description }}</text>
				</view>
			</view>
			<view v-if="operaLoading" class="loading-tip">加载中...</view>
			<view v-if="operaNoMore" class="no-more-tip">没有更多了</view>
		</view>

		<!-- 光影记忆 -->
		<view v-show="currentTab === 'movie'" class="tab-content">
			<view class="card movie-item" v-for="movie in movieList" :key="movie.id"
				@click="goVideoDetail(movie.id)">
				<image class="poster" :src="movie.cover || '/static/placeholder.png'" mode="aspectFill"></image>
				<view class="movie-info">
					<text class="movie-title">{{ movie.title }}</text>
					<text class="movie-year">{{ movie.year }}</text>
					<text class="movie-desc">{{ movie.description }}</text>
				</view>
			</view>
			<view v-if="movieLoading" class="loading-tip">加载中...</view>
			<view v-if="movieNoMore" class="no-more-tip">没有更多了</view>
		</view>

		<!-- 文学解读 -->
		<view v-show="currentTab === 'literature'" class="tab-content">
			<view class="card article-item" v-for="article in literatureList" :key="article.id"
				@click="goArticleDetail(article.id)">
				<text class="article-title">{{ article.title }}</text>
				<text class="article-author">—— {{ article.author }}</text>
				<text class="article-excerpt">{{ article.excerpt }}</text>
			</view>
			<view v-if="litLoading" class="loading-tip">加载中...</view>
			<view v-if="litNoMore" class="no-more-tip">没有更多了</view>
		</view>

		<FloatingHome />
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';               // onMounted 从 vue 导入
import { onShareAppMessage } from '@dcloudio/uni-app';
import { onReachBottom } from '@dcloudio/uni-app';   // 页面专属钩子
import request from '@/utils/request.js';
import FloatingHome from '@/components/FloatingHome.vue'; // 静态导入

const tabs = [
	{ key: 'opera', name: '戏曲长廊' },
	{ key: 'movie', name: '光影记忆' },
	{ key: 'literature', name: '文学解读' }
];
const currentTab = ref('opera');

const operaList = ref([]);
const movieList = ref([]);
const literatureList = ref([]);

const pageSize = 10;
const operaPage = ref(1);
const moviePage = ref(1);
const litPage = ref(1);

const operaLoading = ref(false);
const movieLoading = ref(false);
const litLoading = ref(false);

const operaNoMore = ref(false);
const movieNoMore = ref(false);
const litNoMore = ref(false);

const loadVideos = async (category, page, list, loading, noMore) => {
	if (loading.value || noMore.value) return;
	loading.value = true;
	try {
		const res = await request({
			url: '/entertainment/video/list',
			data: { category, page: page.value, pageSize }
		});
		const newData = res.data || res || [];
		if (page.value === 1) {
			list.value = newData;
		} else {
			list.value.push(...newData);
		}
		noMore.value = newData.length < pageSize;
	} catch (e) {
		console.error('加载视频失败', e);
	} finally {
		loading.value = false;
	}
};

const loadArticles = async (page, list, loading, noMore) => {
	if (loading.value || noMore.value) return;
	loading.value = true;
	try {
		const res = await request({
			url: '/entertainment/article/list',
			data: { page: page.value, pageSize }
		});
		const newData = res.data || res || [];
		if (page.value === 1) {
			list.value = newData;
		} else {
			list.value.push(...newData);
		}
		noMore.value = newData.length < pageSize;
	} catch (e) {
		console.error('加载文章失败', e);
	} finally {
		loading.value = false;
	}
};

const switchTab = (key) => {
	currentTab.value = key;
	if (key === 'opera' && operaList.value.length === 0) {
		operaPage.value = 1;
		operaNoMore.value = false;
		loadVideos('opera', operaPage, operaList, operaLoading, operaNoMore);
	} else if (key === 'movie' && movieList.value.length === 0) {
		moviePage.value = 1;
		movieNoMore.value = false;
		loadVideos('movie', moviePage, movieList, movieLoading, movieNoMore);
	} else if (key === 'literature' && literatureList.value.length === 0) {
		litPage.value = 1;
		litNoMore.value = false;
		loadArticles(litPage, literatureList, litLoading, litNoMore);
	}
};

onReachBottom(() => {
	if (currentTab.value === 'opera') {
		operaPage.value++;
		loadVideos('opera', operaPage, operaList, operaLoading, operaNoMore);
	} else if (currentTab.value === 'movie') {
		moviePage.value++;
		loadVideos('movie', moviePage, movieList, movieLoading, movieNoMore);
	} else if (currentTab.value === 'literature') {
		litPage.value++;
		loadArticles(litPage, literatureList, litLoading, litNoMore);
	}
});

onMounted(() => {
	loadVideos('opera', operaPage, operaList, operaLoading, operaNoMore);
	loadVideos('movie', moviePage, movieList, movieLoading, movieNoMore);
});

const goVideoDetail = (id) => {
	uni.navigateTo({ url: `/pages/entertainment/video-player?id=${id}` });
};

const goArticleDetail = (id) => {
	uni.navigateTo({ url: `/pages/entertainment/article-detail?id=${id}` });
};

// 分享文学娱乐页面
onShareAppMessage(() => {
    const tabNames = { opera: '戏曲长廊', movie: '光影记忆', literature: '文学解读' };
    const currentTabName = tabNames[currentTab.value] || '文学娱乐';
    return {
        title: `银发智慧生活 - ${currentTabName}`,
        path: `/pages/entertainment/index?tab=${currentTab.value}`,
        imageUrl: ''
    };
});

</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }
.tabs {
	display: flex; background-color: $color-bg; border-radius: 16rpx; margin-bottom: $spacing-lg;
	.tab-item {
		flex: 1; text-align: center; padding: $spacing-md 0; font-size: $font-size-title;
		border-bottom: 4rpx solid transparent;
		&.active { color: $color-primary; border-bottom-color: $color-primary; font-weight: bold; }
	}
}

.video-item, .movie-item {
	display: flex; margin-bottom: $spacing-md;
	.video-cover, .poster { width: 200rpx; height: 140rpx; border-radius: 12rpx; margin-right: $spacing-md; background-color: #eee; }
	.video-info, .movie-info { flex: 1; }
	.video-title, .movie-title { font-size: $font-size-title; font-weight: bold; display: block; margin-bottom: $spacing-sm; }
	.video-desc, .movie-desc {
		font-size: $font-size-base; color: $color-text-light;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		word-break: break-all;
	}
	.movie-year { font-size: $font-size-small; color: $color-text-light; display: block; margin-bottom: $spacing-sm; }
	.movie-item .movie-info .movie-desc { margin-top: $spacing-sm; }
}

.article-item {
	margin-bottom: $spacing-md;
	.article-title { font-size: $font-size-title; font-weight: bold; display: block; margin-bottom: $spacing-sm; }
	.article-author { font-size: $font-size-small; color: $color-text-light; display: block; margin-bottom: $spacing-sm; }
	.article-excerpt {
		font-size: $font-size-base; color: $color-text-light;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		word-break: break-all;
	}
}

.loading-tip, .no-more-tip {
	text-align: center; padding: $spacing-md; font-size: $font-size-small; color: $color-text-light;
}
</style>