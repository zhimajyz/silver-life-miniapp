// utils/request.js
const BASE_URL = 'http://8.134.179.188:8080/api'; // 后端接口基础地址

const request = (options) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                'Content-Type': 'application/json',
                // 可在此处统一携带 token 或 openId
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    const result = res.data;
                    if (result.code === 0) {
                        resolve(result.data || result);
                    } else {
                        uni.showToast({ title: result.msg || '请求失败', icon: 'none' });
                        reject(result);
                    }
                } else {
                    uni.showToast({ title: '服务器异常', icon: 'none' });
                    reject(res);
                }
            },
            fail: (err) => {
                uni.showToast({ title: '网络错误', icon: 'none' });
                reject(err);
            }
        });
    });
};

export default request;