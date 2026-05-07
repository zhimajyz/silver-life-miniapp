<template>
	<view class="container">
		<view class="section-title">⭐ 我的收藏</view>
		
		<view v-if="favoriteList.length > 0">
			<view 
				class="card favorite-item" 
				v-for="item in favoriteList" 
				:key="item.id" 
				@click="goDetail(item)"
			>
				<view class="item-left">
					<image v-if="item.cover" class="cover" :src="item.cover" mode="aspectFill"></image>
					<view class="item-info">
						<text class="title">{{ item.title }}</text>
						<text class="type">{{ typeLabel[item.itemType] }}</text>
						<text class="time">{{ formatTime(item.createTime) }}</text>
					</view>
				</view>
				<view class="cancel-btn" @click.stop="cancelFavorite(item)">
					<text>取消</text>
				</view>
			</view>
			<button class="clear-btn" @click="clearAll">清空全部收藏</button>
		</view>
		
		<view class="empty" v-else>
			<text>还没有收藏任何内容，快去发现吧~</text>
		</view>
		
		<FloatingHome />
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';
import FloatingHome from '@/components/FloatingHome.vue';

const favoriteList = ref([]);
const openId = uni.getStorageSync('openId') || 'test_user';

const typeLabel = {
	news: '新闻',
	fraud: '防诈骗',
	video: '视频',
	article: '文章'
};

const fetchFavorites = async () => {
	try {
		uni.showLoading({ title: '加载中...' });
		const res = await request({ url: '/favorite/list', data: { openId, limit: 100 } });
		favoriteList.value = res.data || res || [];
	} catch (e) {
		console.error(e);
		uni.showToast({ title: '加载失败', icon: 'none' });
	} finally {
		uni.hideLoading();
	}
};

onMounted(fetchFavorites);

const goDetail = (item) => {
	const { itemId, itemType } = item;
	const urlMap = {
		news: '/pages/news/detail',
		fraud: '/pages/anti-fraud/detail',
		video: '/pages/entertainment/index',
		article: '/pages/entertainment/index'
	};
	const path = urlMap[itemType];
	if (path) {
		let url = `${path}?id=${itemId}`;
		if (itemType === 'video') url += `&tab=opera`;
		uni.navigateTo({ url });
	}
};

const cancelFavorite = async (item) => {
	const res = await uni.showModal({
		title: '提示',
		content: '确定取消收藏吗？'
	});
	if (!res.confirm) return;
	
	try {
		await request({
			url: '/favorite/remove',
			method: 'POST',
			data: { openId, itemId: item.itemId, itemType: item.itemType }
		});
		uni.showToast({ title: '已取消', icon: 'success' });
		// 从列表中移除
		favoriteList.value = favoriteList.value.filter(f => f.id !== item.id);
	} catch (e) {
		console.error(e);
		uni.showToast({ title: '操作失败', icon: 'none' });
	}
};

const clearAll = () => {
	uni.showModal({
		title: '确认清空',
		content: '确定删除所有收藏吗？此操作不可恢复。',
		success: async (res) => {
			if (!res.confirm) return;
			// 逐个删除或调用批量接口（这里简化为前端清空，实际应调用后端批量删除）
			for (const item of favoriteList.value) {
				try {
					await request({
						url: '/favorite/remove',
						method: 'POST',
						data: { openId, itemId: item.itemId, itemType: item.itemType }
					});
				} catch (e) {}
			}
			favoriteList.value = [];
			uni.showToast({ title: '已清空', icon: 'success' });
		}
	});
};

const formatTime = (ts) => {
	if (!ts) return '';
	const d = new Date(ts);
	return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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
.favorite-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: $spacing-md;
	
	.item-left {
		display: flex;
		flex: 1;
	}
	.cover {
		width: 120rpx;
		height: 120rpx;
		border-radius: 16rpx;
		margin-right: $spacing-md;
		background-color: #eee;
	}
	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		.title {
			font-size: $font-size-base;
			font-weight: 500;
			margin-bottom: 8rpx;
		}
		.type {
			font-size: $font-size-small;
			color: $color-primary;
		}
		.time {
			font-size: $font-size-small;
			color: $color-text-light;
		}
	}
	.cancel-btn {
		padding: 12rpx 24rpx;
		background-color: #f5f5f5;
		border-radius: 32rpx;
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
.empty {
	padding: 120rpx 0;
	text-align: center;
	color: $color-text-light;
	font-size: $font-size-base;
}
</style>