<template>
	<view>
		<!-- 主体表单 -->
		<view class="main1">
			<view class="title_des">请登入</view>
			<view class="item">
				<u-icon name="github-circle-fill" :size="50" color="#2b85e4"></u-icon>
				<input v-model="username" class="main-input" placeholder="请输入账号" />
			</view>
			<view style="margin-top: 8px"></view>
			<view class="item">
				<u-icon name="lock" :size="50" color="#2b85e4"></u-icon>
				<input v-model="password" class="main-input" type="password" placeholder="请输入密码" />
			</view>
			<view class="item" style="margin-top: 20upx;">
				<u-checkbox v-model="remember" shape="circle" @change="checkbox">记住密码</u-checkbox>
			</view>
		</view>
		
		<view class="btn_login" >
			<u-button :ripple="true" type="primary" @click="startLogin">登录</u-button>
		</view>
		
	</view>
</template>

<script>
	var that;
	import {CryptoJS} from '../../components/sha256.js'
	export default {
		data() {
			return {
				remember:true,
				username: '', //用户
				password: '', //密码
				isRotate: false 
			};
		},
		mounted() {
			that = this;
		},
		onLoad() {
			this.username = uni.getStorageSync("username");
			this.password = uni.getStorageSync("password");
		},
		onShareAppMessage() {
			return {
				title:'发票打印测试版',
				path:'pages/login/login'
			}
		},
		destroyed() {
			uni.hideKeyboard();
		},
		methods: {
			checkbox(e){
				console.log(this.remember)
			},
			startLogin() {
				if (this.username.length == 0) {
					this.$queue.showToast('请输入账号');
					return;
				}
				if (this.password.length < 1) {
					this.$queue.showToast('请输入密码');
					return;
				}
				this.toLogin();
			},
			toLogin() {
				var p = CryptoJS.SHA256(this.password).toString();
				this.$queue.showLoading('登录中...');
				this.$Request
					.postFs('/login', {
						username: this.username,
						password: p
					})
					.then(res => {
						if (res.status == 200) {
							this.$queue.setData('token', res.data);
							this.$queue.showToast(res.msg);
							if(this.remember){
								uni.setStorageSync('username', this.username);
								uni.setStorageSync('password', this.password);
							}else{
								uni.removeStorageSync('username');
								uni.removeStorageSync('password');
							}
							
							uni.switchTab({
								url: '/pages/my/index',
							})
						} else {
							this.$queue.showToast(res.msg);
						}
					})
					.catch(res => {
						uni.hideLoading();
					});
			}
		}
	};
</script>

<style>
	 .main1 {
	 	display: flex;
	 	flex-direction: column;
	 	padding-top: 200upx;
	 	padding-left: 70upx;
	 	padding-right: 70upx;
	 }
	.type {
		display: flex;
		margin-left: 16px;
		border-bottom: 1px solid #eeeeee;
		width: 100%;
	}

	.title_des {
		font-weight: bold;
		color: #0055b8;
		font-size: 22px;
		margin-bottom: 32px;
	}

	.login_icon_wx {
		color: #999999;
		border: none;
	}

	.weixinLogin {
		color: #999999;
		text-align: center;
		font-size: 12px;
		margin-top: 60px;
		left: auto;
		right: auto;
	}

	.footer_des {
		color: #666666;
		text-align: center;
		font-size: 14px;
		margin-top: 40px;
	}

	.getCode {
		font-size: 14px;
		margin-left: 40px;
		color: #0055b8;
	}

	.item {
		line-height: 40px;
		display: flex;
	}

	.login_image {
		margin-top: 8px;
		width: 25px;
		height: 25px;
	}

	.main-input {
		font-size: 14px;
		margin-left: 16px;
		border-bottom: 1px solid #eeeeee;
		height: 40px;
		line-height: 40px;
	}

	.main-input-code {
		width: 70%;
		font-size: 14px;
		height: 40px;
		line-height: 40px;
	}

	.btn_login {
		color: #ffffff;
		font-size: 16px;
		width: 260px;
		height: 40px;
		background: #0055b8;
		border-radius: 8px;
		line-height: 40px;
		text-align: center;
		margin-left: auto;
		margin-right: auto;
		margin-top: 45px;
	}

	.main-input {
		flex: 1;
		text-align: left;
		font-size: 28 upx;
		padding-right: 10 upx;
		margin-left: 20 upx;
	}
</style>
