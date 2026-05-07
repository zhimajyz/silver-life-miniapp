<template>
	<view class="container">
		<view class="card" v-if="detail.id">
			<text class="title">{{ detail.title }}</text>
			<text class="publish-time">{{ formatTime(detail.publishTime) }}</text>

			<!-- 语音播报区域（独立一行） -->
			<view class="voice-section">
				<button class="voice-btn" @click="togglePlay">
					{{ isPlaying ? '⏸️ 暂停' : isPaused ? '▶️ 继续' : '🔊 语音播报' }}
				</button>
				<view class="speed-control">
					<text>语速：</text>
					<text :class="{ 慢速 }" @click="setSpeed(0.9)">慢</text>
					<text :class="{ 中速 }" @click="setSpeed(1.0)">中</text>
					<text :class="{ 快速 }" @click="setSpeed(1.2)">快</text>
				</view>
			</view>

			<!-- 收藏和分享并排 -->
			<view class="action-row">
				<button class="action-btn favorite-btn" @click="toggleFavorite" :class="{ favorited: isFavorited }">
					{{ isFavorited ? '⭐ 已收藏' : '☆ 收藏' }}
				</button>
				<button class="action-btn share-btn" open-type="share">
					📤 分享
				</button>
			</view>

			<view class="content" v-html="detail.content"></view>

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
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import FloatingHome from '@/components/FloatingHome.vue';

const detail = ref({});
const prevId = ref(null);
const nextId = ref(null);
const isPlaying = ref(false);
const isPaused = ref(false);
const speed = ref(1);
const isFavorited = ref(false);
const audioContext = ref(null);
const openId = uni.getStorageSync('openId') || 'test_user';
const BASE_URL = 'http://localhost:8080/api';

onLoad(async (options) => {
	const id = options.id;
	try {
		const data = await request({ url: `/fraud/detail/${id}` });
		detail.value = data;

		await request({
			url: '/user/history/add',
			method: 'POST',
			data: { openId, itemId: id, itemType: 'fraud', title: data.title }
		});

		const checkRes = await request({
			url: '/favorite/check',
			data: { openId, itemId: id, itemType: 'fraud' }
		});
		isFavorited.value = checkRes.data || false;

		await fetchPrevNext(Number(id));
	} catch (e) {
		console.error(e);
	}
});

onUnload(() => {
	stopVoice();
});

const stopVoice = () => {
	if (audioContext.value) {
		audioContext.value.stop();
		audioContext.value.destroy();
		audioContext.value = null;
	}
	isPlaying.value = false;
	isPaused.value = false;
};

const fetchPrevNext = async (currentId) => {
	try {
		const res = await request({ url: '/fraud/list', data: { page: 1, pageSize: 100 } });
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
		stopVoice();
		uni.redirectTo({ url: `/pages/anti-fraud/detail?id=${prevId.value}` });
	}
};

const goNext = () => {
	if (nextId.value) {
		stopVoice();
		uni.redirectTo({ url: `/pages/anti-fraud/detail?id=${nextId.value}` });
	}
};

const formatTime = (ts) => ts ? new Date(ts).toLocaleDateString('zh-CN') : '';

const toggleFavorite = async () => {
	const itemId = detail.value.id;
	const itemType = 'fraud';
	const title = detail.value.title;
	const cover = detail.value.coverImage || '';

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

const togglePlay = async () => {
	if (isPlaying.value) {
		audioContext.value?.pause();
		isPlaying.value = false;
		isPaused.value = true;
		return;
	}

	if (isPaused.value) {
		audioContext.value?.play();
		isPlaying.value = true;
		isPaused.value = false;
		return;
	}

	try {
		isPlaying.value = true;
		isPaused.value = false;
		uni.showLoading({ title: '正在生成语音...' });

		const plainText = detail.value.content.replace(/<[^>]+>/g, '');
		const res = await uni.request({
			url: BASE_URL + '/voice/synthesize',
			method: 'POST',
			data: { text: plainText },
			responseType: 'arraybuffer',
		});

		uni.hideLoading();

		if (res.statusCode !== 200) throw new Error('语音生成失败');

		if (audioContext.value) audioContext.value.destroy();
		const audio = uni.createInnerAudioContext();
		audioContext.value = audio;
		audio.playbackRate = speed.value;

		const fs = uni.getFileSystemManager();
		const filePath = `${wx.env.USER_DATA_PATH}/tts_fraud_${Date.now()}.mp3`;
		fs.writeFile({
			filePath,
			data: res.data,
			success: () => {
				audio.src = filePath;
				audio.play();
			},
			fail: (err) => {
				console.error('写入文件失败', err);
				uni.showToast({ title: '音频处理失败', icon: 'none' });
				isPlaying.value = false;
			}
		});

		audio.onEnded(() => {
			isPlaying.value = false;
			isPaused.value = false;
		});
		audio.onError((err) => {
			console.error('播放失败', err);
			uni.showToast({ title: '播放失败', icon: 'none' });
			isPlaying.value = false;
			isPaused.value = false;
		});
	} catch (e) {
		uni.hideLoading();
		console.error('语音播报异常', e);
		uni.showToast({ title: '语音服务异常', icon: 'none' });
		isPlaying.value = false;
		isPaused.value = false;
	}
};

const setSpeed = (val) => {
	speed.value = val;
	if (audioContext.value) audioContext.value.playbackRate = val;
	uni.showToast({ title: `语速已设为${val}x`, icon: 'none' });
};

onShareAppMessage(() => ({
	title: detail.value.title || '银发智慧生活 - 防诈骗科普',
	path: `/pages/anti-fraud/detail?id=${detail.value.id}`,
	imageUrl: ''
}));
</script>

<style lang="scss" scoped>
.container {
	padding: $spacing-md;
}

.title {
	font-size: 52rpx;
	font-weight: bold;
	display: block;
	margin-bottom: $spacing-sm;
	line-height: 1.4;
}

.publish-time {
	font-size: $font-size-small;
	color: $color-text-light;
	display: block;
	margin-bottom: $spacing-lg;
	padding-bottom: $spacing-md;
	border-bottom: 2rpx solid #eee;
}

/* 语音播报区域 */
.voice-section {
	background-color: #f8faf8;
	border-radius: 20rpx;
	padding: $spacing-md;
	margin-bottom: $spacing-lg;
}

.voice-btn {
	width: 100%;
	font-size: $font-size-button;
	min-height: $button-height;
	border-radius: $button-border-radius;
	background-color: $color-primary !important;
	color: white !important;
	margin-bottom: $spacing-sm;
}

.speed-control {
	display: flex;
	justify-content: center;
	gap: $spacing-lg;
	font-size: $font-size-base;
	color: $color-text;
}

.speed-control .active {
	color: $color-primary;
	font-weight: bold;
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
}

.favorite-btn.favorited {
	background-color: #fff3e0 !important;
	color: #f5a623 !important;
}

.share-btn {
	background-color: #e3f2fd !important;
	color: #1976d2 !important;
}

/* 正文内容 */
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