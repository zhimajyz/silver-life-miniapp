<template>
	<view class="container">
		<view class="section-title">📰 时政新闻</view>

		<!-- 搜索栏 -->
		<view class="search-box">
			<input class="search-input" v-model="keyword" placeholder="搜索新闻标题" />
			<button class="search-btn" @click="doSearch">搜索</button>
		</view>

		<!-- 分类标签 -->
		<scroll-view scroll-x class="category-scroll" show-scrollbar="false">
			<view class="category-list">
				<view
					v-for="cat in categories"
					:key="cat.key"
					class="category-tag"
					:class="{ active: currentCategory === cat.key }"
					@click="switchCategory(cat.key)"
				>
					{{ cat.name }}
				</view>
			</view>
		</scroll-view>

		<!-- 新闻列表 -->
		<view v-if="newsList.length > 0">
			<view
				v-for="item in newsList"
				:key="item.id"
				class="card news-item"
				@click="goDetail(item.id)"
			>
				<text class="news-title">{{ item.title }}</text>
				<view class="news-meta">
					<text class="source">{{ item.source }}</text>
					<text class="time">{{ formatTime(item.publishTime) }}</text>
				</view>
			</view>
		</view>
		<view v-if="loading" class="loading-tip">加载中...</view>
		<view v-if="!loading && newsList.length === 0" class="empty-tip">暂无新闻</view>

		<!-- 分页导航 -->
		<view v-if="totalPage > 1" class="pagination">
			<button class="page-btn" :disabled="page === 1" @click="goPage(1)">首页</button>
			<button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)">‹</button>
			<button
				v-for="p in displayedPages"
				:key="p"
				class="page-btn"
				:class="{ active: p === page }"
				@click="goPage(p)"
			>
				{{ p }}
			</button>
			<button class="page-btn" :disabled="page === totalPage" @click="goPage(page + 1)">›</button>
			<button class="page-btn" :disabled="page === totalPage" @click="goPage(totalPage)">末页</button>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const BASE_URL = 'http://8.134.179.188:8080/api';

const categories = [
	{ key: '', name: '全部' },
	{ key: '养老', name: '养老' },
	{ key: '医疗', name: '医疗' },
	{ key: '政策', name: '政策' },
	{ key: '其他', name: '其他' }
];

const currentCategory = ref('');
const keyword = ref('');
const newsList = ref([]);
const page = ref(1);
const pageSize = 5;
const totalCount = ref(0);
const loading = ref(false);

// 总页数
const totalPage = computed(() => Math.ceil(totalCount.value / pageSize));

// 显示的页码数组（最多显示5个页码，避免过多）
const displayedPages = computed(() => {
	const total = totalPage.value;
	const current = page.value;
	if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
	if (current <= 3) return [1, 2, 3, 4, 5];
	if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
	return [current - 2, current - 1, current, current + 1, current + 2];
});

// 请求新闻列表（全量刷新当前页）
const fetchNews = async () => {
	if (loading.value) return;
	loading.value = true;

	const params = {
		page: page.value,
		pageSize: pageSize
	};
	if (currentCategory.value && currentCategory.value.trim() !== '') {
		params.category = currentCategory.value.trim();
	}
	if (keyword.value && keyword.value.trim() !== '') {
		params.keyword = keyword.value.trim();
	}

	try {
		const res = await uni.request({
			url: `${BASE_URL}/news/list`,
			data: params
		});

		if (res.statusCode === 200) {
			const json = res.data;
			newsList.value = json.data || [];
			totalCount.value = json.total || 0;
		} else {
			uni.showToast({ title: '服务器异常', icon: 'none' });
		}
	} catch (e) {
		console.error(e);
		uni.showToast({ title: '网络错误', icon: 'none' });
	} finally {
		loading.value = false;
	}
};

// 跳转到指定页
const goPage = (p) => {
	if (p < 1 || p > totalPage.value || p === page.value) return;
	page.value = p;
	fetchNews();
};

// 搜索
const doSearch = () => {
	page.value = 1;
	fetchNews();
};

// 切换分类
const switchCategory = (cat) => {
	currentCategory.value = cat;
	page.value = 1;
	fetchNews();
};

// 首次加载
onMounted(() => {
	fetchNews();
});

const formatTime = (ts) => {
	if (!ts) return '';
	const d = new Date(ts);
	return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const goDetail = (id) => {
	uni.navigateTo({ url: `/pages/news/detail?id=${id}` });
};
</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }
.section-title {
	font-size: $font-size-title;
	font-weight: bold;
	margin-bottom: $spacing-md;
	color: $color-text;
	border-left: 8rpx solid $color-primary;
	padding-left: $spacing-md;
}
.search-box {
	display: flex; margin-bottom: $spacing-lg; gap: $spacing-sm;
	.search-input {
		flex: 1; border: 2rpx solid #ccc; border-radius: 16rpx; padding: 12rpx 20rpx; font-size: $font-size-base;
	}
	.search-btn {
		font-size: $font-size-base; background-color: $color-primary; color: white; border-radius: 16rpx; padding: 12rpx 24rpx;
	}
}
.category-scroll { margin-bottom: $spacing-lg; }
.category-list { display: flex; gap: $spacing-sm; }
.category-tag {
	padding: 8rpx 24rpx; border-radius: 32rpx; font-size: $font-size-base; background-color: #f0f0f0; color: $color-text-light;
	&.active { background-color: $color-primary; color: white; }
}
.news-item {
	margin-bottom: $spacing-md;
	.news-title { font-size: $font-size-title; font-weight: bold; display: block; margin-bottom: $spacing-md; line-height: 1.4; }
	.news-meta { display: flex; justify-content: space-between; font-size: $font-size-small; color: $color-text-light; }
}
.loading-tip, .empty-tip {
	text-align: center; padding: $spacing-md; font-size: $font-size-small; color: $color-text-light;
}

/* 分页导航 */
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	margin-top: $spacing-lg;
	gap: 10rpx;
}
.page-btn {
	font-size: $font-size-base;
	min-width: 80rpx;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 10rpx;
	background-color: #f5f5f5;
	color: #333;
	border-radius: 16rpx;
	border: none;
	text-align: center;
}
.page-btn.active {
	background-color: $color-primary;
	color: white;
	font-weight: bold;
}
.page-btn[disabled] {
	opacity: 0.4;
}
</style>