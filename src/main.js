import {
	createSSRApp
} from "vue";
import App from "./App.vue";
// 初始化微信云开发
if (wx.cloud) {
    wx.cloud.init({
        // 重点：将你的环境ID粘贴到这里
        env: 'cloud1-d3g0gzsd4af41a6',
        traceUser: true, // 记录用户访问，方便后续获取 OpenID
    });
}
export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
