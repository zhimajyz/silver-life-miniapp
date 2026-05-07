<template>
	<view class="container">
		<view class="section-title">📋 我的浏览记录</view>
		
		<view v-if="historyList.length > 0">
			<view 
				class="card history-item" 
				v-for="(item, index) in historyList" 
				:key="item.id || index" 
				@click="goHistoryItem(item)"
			>
				<view class="item-header">
					<text class="history-title">{{ item.title }}</text>
					<text class="item-type">{{ typeLabel[item.itemType] || item.itemType }}</text>
				</view>
				<text class="history-time">{{ formatTime(item.browseTime) }}</text>
			</view>
			<button class="clear-btn" @click="clearHistory">清空全部历史</button>
		</view>
		
		<view class="empty-history" v-else>
			<text>暂无浏览记录，快去阅读文章吧~</text>
		</view>
		
		<FloatingHome />
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';
import FloatingHome from '@/components/FloatingHome.vue';

const historyList = ref([]);
const openId = uni.getStorageSync('openId') || 'test_user';

const typeLabel = {
	news: '新闻',
	fraud: '防诈骗',
	video: '视频',
	article: '文章'
};

const fetchHistory = async () => {
	try {
		uni.showLoading({ title: '加载中...' });
		const response = await request({ 
			url: '/user/history/list', 
			data: { openId, limit: 100 } 
		});
		console.log('历史原始响应:', response);
		
		// 提取数据（兼容多种结构）
		let rawArray = [];
		if (response && response.j && Array.isArray(response.j)) rawArray = response.j;
		else if (response && Array.isArray(response.data)) rawArray = response.data;
		else if (Array.isArray(response)) rawArray = response;
		
		// 映射字段（a=标题, b=时间, c=id, d=类型, e=内容ID）
		const mapped = rawArray.map(item => ({
			id: item.c || item.id,
			title: item.a || item.title,
			browseTime: item.b || item.browseTime,
			itemType: item.d || item.itemType,
			itemId: item.e || item.itemId
		}));
		
		// 按时间倒序排列（最新的在前面）
		mapped.sort((a, b) => new Date(b.browseTime) - new Date(a.browseTime));
		
		historyList.value = mapped;
	} catch (e) {
		console.error('获取历史失败', e);
		uni.showToast({ title: '加载失败', icon: 'none' });
	} finally {
		uni.hideLoading();
	}
};

onMounted(fetchHistory);

const goHistoryItem = (item) => {
	const { itemId, itemType } = item;
	if (!itemId || !itemType) {
		uni.showToast({ title: '记录不完整', icon: 'none' });
		return;
	}
	
	const urlMap = {
		news: '/pages/news/detail',
		fraud: '/pages/anti-fraud/detail',
		video: '/pages/entertainment/index',
		article: '/pages/entertainment/index'
	};
	const path = urlMap[itemType];
	if (path) {
		let url = `${path}?id=${itemId}`;
		if (itemType === 'video') url += `&tab=${item.category || 'opera'}`;
		uni.navigateTo({ url });
	} else {
		uni.showToast({ title: '暂不支持该类型', icon: 'none' });
	}
};

const clearHistory = () => {
	uni.showModal({
		title: '确认清空',
		content: '确定删除所有浏览记录吗？',
		success: (res) => {
			if (res.confirm) {
				// 可选：调用后端清空接口
				historyList.value = [];
				uni.showToast({ title: '已清空', icon: 'success' });
			}
		}
	});
};

const formatTime = (ts) => {
	if (!ts) return '';
	const d = new Date(ts);
	if (isNaN(d.getTime())) return ts;
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${d.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style lang="scss" scoped>
.container {
	padding: $spacing-md;
}

.section-title {
	font-size: $font-size-title;
	font-weight: bold;
	margin-bottom: $spacing-lg;
	color: $color-text;
	border-left: 8rpx solid $color-primary;
	padding-left: $spacing-md;
}

.history-item {
	margin-bottom: $spacing-md;
	
	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $spacing-sm;
	}
	
	.history-title {
		font-size: $font-size-base;
		font-weight: 500;
		flex: 1;
	}
	
	.item-type {
		font-size: $font-size-small;
		color: $color-primary;
		background-color: rgba(44, 95, 45, 0.1);
		padding: 4rpx 16rpx;
		border-radius: 24rpx;
	}
	
	.history-time {
		font-size: $font-size-small;
		color: $color-text-light;
	}
}

.clear-btn {
	margin-top: $spacing-lg;
	background-color: #f5f5f5 !important;
	color: $color-text-light !important;
	font-size: $font-size-base;
}

.empty-history {
	padding: 120rpx 0;
	text-align: center;
	color: $color-text-light;
	font-size: $font-size-base;
}
</style>