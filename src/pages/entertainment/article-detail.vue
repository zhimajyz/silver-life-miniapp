<template>
	<view class="container">
		<view class="card" v-if="article.id">
			<text class="title">{{ article.title }}</text>
			<text class="author">—— {{ article.author }}</text>

			<!-- 收藏和分享并排 -->
			<view class="action-row">
				<button class="action-btn favorite-btn" @click="toggleFavorite" :class="{ favorited: isFavorited }">
					{{ isFavorited ? '⭐ 已收藏' : '☆ 收藏' }}
				</button>
				<button class="action-btn share-btn" open-type="share">
					📤 分享
				</button>
			</view>

			<view class="content" v-html="article.content"></view>

			<!-- 上下篇翻页 -->
			<view class="page-nav">
				<button class="nav-btn" @click="goPrev" :disabled="!prevId">⬅️ 上一篇</button>
				<button class="nav-btn" @click="goNext" :disabled="!nextId">下一篇 ➡️</button>
			</view>
		</view>
		<FloatingHome />
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import FloatingHome from '@/components/FloatingHome.vue';

const article = ref({});
const prevId = ref(null);
const nextId = ref(null);
const isFavorited = ref(false);
const openId = uni.getStorageSync('openId') || 'test_user';

onLoad(async (options) => {
	const id = options.id;
	try {
		const res = await request({ url: `/entertainment/article/detail/${id}` });
		article.value = res.data || res;

		// 保存浏览历史
		await request({
			url: '/user/history/add',
			method: 'POST',
			data: { openId, itemId: id, itemType: 'article', title: article.value.title }
		});

		// 检查是否已收藏
		const checkRes = await request({
			url: '/favorite/check',
			data: { openId, itemId: id, itemType: 'article' }
		});
		isFavorited.value = checkRes.data || false;

		// 获取上下篇
		await fetchPrevNext(Number(id));
	} catch (e) {
		console.error('获取文章失败', e);
		uni.showToast({ title: '文章加载失败', icon: 'none' });
	}
});

const fetchPrevNext = async (currentId) => {
	try {
		const res = await request({ url: '/entertainment/article/list' });
		const list = res.data || res || [];
		const currentIndex = list.findIndex(item => item.id === currentId);
		if (currentIndex > 0) prevId.value = list[currentIndex - 1].id;
		if (currentIndex < list.length - 1 && currentIndex !== -1) nextId.value = list[currentIndex + 1].id;
	} catch (e) {
		console.error('获取上下篇失败', e);
	}
};

const goPrev = () => {
	if (prevId.value) {
		uni.redirectTo({ url: `/pages/entertainment/article-detail?id=${prevId.value}` });
	}
};

const goNext = () => {
	if (nextId.value) {
		uni.redirectTo({ url: `/pages/entertainment/article-detail?id=${nextId.value}` });
	}
};

const toggleFavorite = async () => {
	const itemId = article.value.id;
	const itemType = 'article';
	const title = article.value.title;

	if (isFavorited.value) {
		await request({ url: '/favorite/remove', method: 'POST', data: { openId, itemId, itemType } });
		isFavorited.value = false;
		uni.showToast({ title: '已取消收藏', icon: 'none' });
	} else {
		await request({ url: '/favorite/add', method: 'POST', data: { openId, itemId, itemType, title } });
		isFavorited.value = true;
		uni.showToast({ title: '收藏成功', icon: 'success' });
	}
};

onShareAppMessage(() => ({
	title: article.value.title || '银发智慧生活 - 文学解读',
	path: `/pages/entertainment/article-detail?id=${article.value.id}`,
	imageUrl: ''
}));
</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }
.title {
	font-size: 52rpx;
	font-weight: bold;
	display: block;
	margin-bottom: $spacing-sm;
}
.author {
	font-size: $font-size-base;
	color: $color-text-light;
	display: block;
	margin-bottom: $spacing-lg;
	padding-bottom: $spacing-md;
	border-bottom: 2rpx solid #eee;
}

/* 收藏和分享并排 */
.action-row {
	display: flex;
	gap: $spacing-md;
	margin-bottom: $spacing-lg;
}
.action-btn {
	flex: 1;
	font-size: $font-size-base;
	min-height: $button-height;
	border-radius: $button-border-radius;
}
.favorite-btn {
	background-color: #f5f5f5 !important;
	color: $color-text !important;
	&.favorited {
		background-color: #fff3e0 !important;
		color: #f5a623 !important;
	}
}
.share-btn {
	background-color: #e3f2fd !important;
	color: #1976d2 !important;
}

/* 正文 */
.content {
	font-size: $font-size-base;
	line-height: 1.8;
	margin-bottom: $spacing-lg;
}

/* 上下篇 */
.page-nav {
	display: flex;
	justify-content: space-between;
	gap: $spacing-md;
	margin-top: $spacing-xl;
}
.nav-btn {
	flex: 1;
	font-size: $font-size-base;
	min-height: $button-height;
	border-radius: $button-border-radius;
	background-color: #f5f5f5 !important;
	color: $color-text !important;
}
.nav-btn[disabled] {
	opacity: 0.4;
}
</style>