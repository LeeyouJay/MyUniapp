import configdata from './config'
import cache from './cache'

module.exports = {
	config: function(name) {
		var info = null;
		if (name) {
			var name2 = name.split("."); //字符分割
			if (name2.length > 1) {
				info = configdata[name2[0]][name2[1]] || null;
			} else {
				info = configdata[name] || null;
			}
			if (info == null) {
				let web_config = cache.get("web_config");
				if (web_config) {
					if (name2.length > 1) {
						info = web_config[name2[0]][name2[1]] || null;
					} else {
						info = web_config[name] || null;
					}
				}
			}
		}
		return info;
	},
	uploadFile: function(url, data) {
		url = this.config("APIHOST") + url;
		return new Promise((succ, error) => {
			uni.request({
				url: url,
				data: data,
				method: "POST",
				header: {
					'Content-Type': 'multipart/form-data'
				},
				success: function(result) {
					succ.call(self, result.data)
				},
				fail: function(e) {
					uni.showToast({
						title: '请检查网络是否链接',
						icon: 'none'
					})
					error.call(self, e)
				}
			})
		})
	},
	getT: function(url, data, header) {
		header = header || "application/x-www-form-urlencoded";
		url = this.config("APIHOST") + url;
		let token = uni.getStorageSync("token");
		return new Promise((succ, error) => {
			uni.request({
				url: url,
				data: data,
				method: "GET",
				header: {
					"content-type": header,
					"Authorization": token
				},
				success: function(result) {
					if (result.data.status == 403) {
						uni.reLaunch({
							url: '/pages/login/login'
						})
					} else
						succ.call(self, result.data)
				},
				fail: function(e) {
					uni.showToast({
						title: '请检查网络是否链接',
						icon: 'none'
					})
					error.call(self, e)
				}
			})
		})
	},
	post: function(url, data, header) {
		let token = uni.getStorageSync("token");
		header = header || "application/json";
		url = this.config("APIHOST") + url;
		return new Promise((succ, error) => {
			uni.request({
				url: url,
				data: data,
				method: "POST",
				header: {
					"content-type": header,
					"Authorization": token
				},
				success: function(result) {
					console.log(result)
					if (result.data.status == 403) {
						uni.reLaunch({
							url: '/pages/login/login'
						})
					} else
						succ.call(self, result.data)
				},
				fail: function(e) {
					uni.showToast({
						title: '请检查网络是否链接',
						icon: 'none'
					})
					error.call(self, e)
				}
			})
		})
	},
	//登入请求
	postFs: function(url, data, header) {
		header = header || "application/x-www-form-urlencoded";
		url = this.config("APIHOST") + url;
		return new Promise((succ, error) => {
			uni.request({
				url: url,
				data: data,
				method: "POST",
				header: {
					"content-type": header
				},
				success: function(result) {
					succ.call(self, result.data)
				},
				fail: function(e) {
					console.log(e)
					uni.showToast({
						title: '请检查网络是否链接',
						icon: 'none'
					})
					error.call(self, e)
				}
			})
		})
	}
};
