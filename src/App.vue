<script>
export default {
	onLaunch() {
        // 检查是否已有 openId，没有则登录
        const openId = uni.getStorageSync('openId');
        if (!openId) {
            uni.login({
                provider: 'weixin',
                success: async (res) => {
                    if (res.code) {
                        try {
                            const result = await uni.request({
                                url: 'http://localhost:8080/api/user/login',
                                method: 'POST',
                                data: { code: res.code }
                            });
                            if (result.data.code === 0) {
                                uni.setStorageSync('openId', result.data.data);
                                console.log('登录成功，openId:', result.data.data);
                            } else {
                                console.error('登录失败:', result.data.msg);
                            }
                        } catch (e) {
                            console.error('请求后端登录接口失败', e);
                        }
                    }
                },
                fail: (err) => {
                    console.error('wx.login失败', err);
                }
            });
        }
    },
	onShow: function() {
		console.log('小程序显示')
	},
	onHide: function() {
		console.log('小程序隐藏')
	},
	methods: {
		addHistory(item) {
			let history = uni.getStorageSync('browseHistory') || []
			history.unshift({
				id: item.id || Date.now(),
				title: item.title,
				url: item.url,
				type: item.type,
				time: new Date().toLocaleString()
			})
			// 去重、限制数量
			history = history.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 50)
			uni.setStorageSync('browseHistory', history)
		}
	}
}
</script>

<style lang="scss">
/* 全局适老化样式 */
page {
	background-color: $color-bg-light;
	font-size: $font-size-base;
	color: $color-text;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	line-height: 1.5;
}

/* 所有按钮统一适老化样式 */
button {
	font-size: $font-size-button !important;
	min-height: $button-height !important;
	border-radius: $button-border-radius !important;
	background-color: $color-primary !important;
	color: white !important;
	padding: 0 $spacing-lg !important;
	
	&::after {
		border: none;
	}
	
	&[size="mini"] {
		font-size: $font-size-small !important;
		min-height: 72rpx !important;
	}
}

/* 链接样式 */
.link {
	color: $color-secondary;
	text-decoration: underline;
}

/* 卡片容器 */
.card {
	background-color: $color-bg;
	border-radius: 24rpx;
	padding: $spacing-md;
	margin-bottom: $spacing-md;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 标题样式 */
.section-title {
	font-size: $font-size-title;
	font-weight: bold;
	margin-bottom: $spacing-md;
	color: $color-text;
	border-left: 8rpx solid $color-primary;
	padding-left: $spacing-md;
}
</style>