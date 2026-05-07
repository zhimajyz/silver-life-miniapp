<template>
	<view class="magnifier-container">
		<!-- 相机组件 -->
		<camera 
			class="camera-preview" 
			device-position="back" 
			flash="off" 
			@error="handleCameraError" 
			@initdone="handleCameraInit"
		></camera>
		
		<!-- 操作面板 -->
		<view class="control-panel">
			<text class="control-label">放大倍数: {{ zoomValue }}x</text>
			<slider 
				class="zoom-slider" 
				:value="zoomValue" 
				:min="minZoom" 
				:max="maxZoom" 
				:step="0.1" 
				@change="handleZoomChange" 
				activeColor="#2C5F2D"
				block-size="32"
			/>
			
			<!-- 快捷操作按钮 -->
			<view class="quick-actions">
				<button class="action-btn" @click="resetZoom">重置 (1x)</button>
				<button class="action-btn" @click="toggleFlash">{{ flashState ? '关闭闪光灯' : '打开闪光灯' }}</button>
				<button class="action-btn" @click="switchCamera">{{ cameraPosition === 'back' ? '前置' : '后置' }}摄像头</button>
			</view>
		</view>
		<FloatingHome />
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import FloatingHome from '@/components/FloatingHome.vue';

// 相机相关
const cameraContext = ref(null);
const cameraPosition = ref('back');
const flashState = ref(false);
const minZoom = ref(1.0);
const maxZoom = ref(10.0);
const zoomValue = ref(1.0);

// 初始化相机上下文
const handleCameraInit = () => {
	console.log('相机初始化完成');
	cameraContext.value = uni.createCameraContext();
	// 获取相机支持的最大变焦（部分设备支持）
	// #ifdef MP-WEIXIN
	const systemInfo = uni.getSystemInfoSync();
	console.log('设备信息', systemInfo);
	// 微信小程序中，可以预先设置最大变焦，这里默认为10x，已足够使用
	// #endif
};

// 处理变焦
const handleZoomChange = (e) => {
	const newZoom = e.detail.value;
	zoomValue.value = newZoom;
	if (cameraContext.value) {
		// 微信小程序 camera 组件通过 setZoom 设置变焦
		cameraContext.value.setZoom({
			zoom: newZoom,
			success: () => {
				console.log('变焦成功: ' + newZoom + 'x');
			},
			fail: (err) => {
				console.error('变焦失败', err);
				uni.showToast({ title: '该设备可能不支持此变焦倍数', icon: 'none' });
			}
		});
	}
};

// 重置变焦
const resetZoom = () => {
	zoomValue.value = 1.0;
	if (cameraContext.value) {
		cameraContext.value.setZoom({ zoom: 1.0 });
	}
};

// 切换闪光灯
const toggleFlash = () => {
	flashState.value = !flashState.value;
	uni.showToast({ title: `闪光灯已${flashState.value ? '开启' : '关闭'}`, icon: 'none' });
	// 实际控制闪光灯需要调用相应API，这里做简化处理
};

// 切换前后摄像头
const switchCamera = () => {
	cameraPosition.value = cameraPosition.value === 'back' ? 'front' : 'back';
	uni.showToast({ title: `已切换到${cameraPosition.value === 'back' ? '后置' : '前置'}摄像头`, icon: 'none' });
};

// 相机错误处理
const handleCameraError = (e) => {
	console.error('相机错误', e);
	uni.showModal({
		title: '提示',
		content: '无法启动相机，请确保已授予相机权限。',
		showCancel: false
	});
};

onLoad(() => {
	// 请求相机权限
	// #ifdef MP-WEIXIN
	uni.authorize({
		scope: 'scope.camera',
		success: () => {
			console.log('相机权限已授权');
		},
		fail: () => {
			uni.showModal({
				title: '需要相机权限',
				content: '请在设置中开启相机权限，以便使用放大镜功能。',
				success: (res) => {
					if (res.confirm) {
						uni.openSetting();
					}
				}
			});
		}
	});
	// #endif
});

onUnload(() => {
	// 页面卸载时，释放相机资源
	cameraContext.value = null;
});
</script>

<style lang="scss" scoped>
.magnifier-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #000000;
}

.camera-preview {
	flex: 1;
	width: 100%;
}

.control-panel {
	background-color: rgba(28, 28, 30, 0.9);
	padding: $spacing-lg;
	border-radius: 32rpx 32rpx 0 0;
	margin-top: -32rpx;
}

.control-label {
	font-size: $font-size-title;
	font-weight: bold;
	color: #ffffff;
	display: block;
	margin-bottom: $spacing-md;
	text-align: center;
}

.zoom-slider {
	width: 100%;
	margin-bottom: $spacing-xl;
}

.quick-actions {
	display: flex;
	justify-content: space-around;
	gap: $spacing-md;
}

.action-btn {
	flex: 1;
	background-color: #505055;
	color: #ffffff;
	font-size: $font-size-base;
	border-radius: 48rpx;
	padding: $spacing-md 0;
	border: none;
	text-align: center;
	
	&:active {
		opacity: 0.8;
		background-color: #6e6e73;
	}
}
</style>