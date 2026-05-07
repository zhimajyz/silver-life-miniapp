<template>
	<view class="container">
		<view class="card" v-if="video.id">
			<text class="title">{{ video.title }}</text>
			<text class="desc">{{ video.description }}</text>

			<!-- 收藏和分享并排 -->
			<view class="action-row">
				<button class="action-btn favorite-btn" @click="toggleFavorite" :class="{ favorited: isFavorited }">
					{{ isFavorited ? '⭐ 已收藏' : '☆ 收藏' }}
				</button>
				<button class="action-btn share-btn" open-type="share">
					📤 分享
				</button>
			</view>

			<video
				v-if="video.videoUrl"
				:src="video.videoUrl"
				controls
				autoplay
				class="video-player"
				style="width:100%; height:400rpx;"
				@error="handleVideoError"
			></video>
			<view v-else class="placeholder-video">
				<text>暂无视频资源</text>
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

const video = ref({});
const isFavorited = ref(false);
const openId = uni.getStorageSync('openId') || 'test_user';

onLoad(async (options) => {
	const id = options.id;
	try {
		const res = await request({ url: `/entertainment/video/detail/${id}` });
		video.value = res.data || res;

		// 保存浏览历史
		await request({
			url: '/user/history/add',
			method: 'POST',
			data: { openId, itemId: id, itemType: 'video', title: video.value.title }
		});

		// 检查是否已收藏
		const checkRes = await request({
			url: '/favorite/check',
			data: { openId, itemId: id, itemType: 'video' }
		});
		isFavorited.value = checkRes.data || false;
	} catch (e) {
		console.error('获取视频失败', e);
		uni.showToast({ title: '视频加载失败', icon: 'none' });
	}
});

const toggleFavorite = async () => {
	const itemId = video.value.id;
	const itemType = 'video';
	const title = video.value.title;
	const cover = video.value.cover || '';

	if (isFavorited.value) {
		await request({ url: '/favorite/remove', method: 'POST', data: { openId, itemId, itemType } });
		isFavorited.value = false;
		uni.showToast({ title: '已取消收藏', icon: 'none' });
	} else {
		await request({ url: '/favorite/add', method: 'POST', data: { openId, itemId, itemType, title, cover } });
		isFavorited.value = true;
		uni.showToast({ title: '收藏成功', icon: 'success' });
	}
};

const handleVideoError = (e) => {
	console.error('视频播放错误', e);
	uni.showToast({ title: '视频播放失败', icon: 'none' });
};

onShareAppMessage(() => ({
	title: video.value.title || '银发智慧生活 - 精彩视频',
	path: `/pages/entertainment/video-player?id=${video.value.id}`,
	imageUrl: video.value.cover || ''
}));
</script>

<style lang="scss" scoped>
.container { padding: $spacing-md; }
.title {
	font-size: 52rpx;
	font-weight: bold;
	margin-bottom: $spacing-md;
}
.desc {
	font-size: $font-size-base;
	color: $color-text-light;
	margin-bottom: $spacing-lg;
	display: block;
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

.placeholder-video {
	height: 400rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f0f0f0;
	border-radius: 16rpx;
	font-size: $font-size-base;
	color: $color-text-light;
}
</style>