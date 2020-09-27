<template>
	<view class="container">
		<view class="top-container">
			<image class="bg-img" src="/static/mine_bg_3x.png"></image>
			<view class="user-wrapper">
				<u-avatar src="/static/gitHub-mark.png" mode="square" :size="160"></u-avatar>
			</view>
		</view>
	
		<view class="middle-container">
			<view class="middle-item" hover-class="opcity" :hover-stay-time="150" @click="setting()">
				<view style="margin-left: 65rpx;">
					<u-icon name="setting-fill" :size="70"></u-icon>
				</view>
				<text class="middle-tag">连接打印</text>
			</view>
			<view class="middle-item" hover-class="opcity" :hover-stay-time="150" @click="logout()">
				<view style="margin-left: 65rpx;">
					<u-icon name="level" :size="70"></u-icon>
				</view>
				<text class="middle-tag">退出登入</text>
			</view>
		</view>
	
		<view class="bottom-container">
			<view class="ul-item">
				<view data-index="0" class="item" hover-class="opcity" :hover-stay-time="150" @click="toAdd()">
					<u-icon name="order" :size="70" color="#2b85e4"></u-icon>
					<text class="item-name">添加品种</text>
				</view>
				<view data-index="1" class="item" hover-class="opcity" :hover-stay-time="150" @click="manage()">
					<u-icon name="checkmark" :size="70" color="#2b85e4"></u-icon>
					<text class="item-name">显示管理</text>
				</view>
			</view>
			<view class="ul-item">
				<view data-index="0" class="item" hover-class="opcity" :hover-stay-time="150"  @click="toShow()">
					<u-icon name="rmb" :size="70" color="#2b85e4"></u-icon>
					<text class="item-name">今日收益:</text>
					<u-count-to :start-val="0" :end-val="earnings" :decimals="2" :font-size="35" :duration="1200"></u-count-to>
				</view>
				<!-- <view data-index="0" class="item" hover-class="opcity" :hover-stay-time="150"  @click="toShare()">
					<u-icon name="rmb" :size="70" color="#2b85e4"></u-icon>
					<text class="item-name">临时</text>
				</view> -->
			</view>
		</view>
		
		<!-- 弹出层 -->
		<u-popup v-model="show" mode="bottom" height="60%">
			<view style="margin: 30rpx 30rpx;">
				<u-table>
					<u-tr>
						<u-th>品种</u-th>
						<u-th>数量</u-th>
						<u-th>小计</u-th>
					</u-tr>
					<u-tr v-for="(product,index) in totalGoods" :key="index">
						<u-td>{{product.pdName}}</u-td>
						<u-td>{{product.value}}</u-td>
						<u-td>{{product.subtotal}}</u-td>
					</u-tr>
				</u-table>
			</view>
		</u-popup>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				earnings:0,
				totalGoods:[],
				show:false
			}
		},
		onShow(){
			this.getEarning();
			this.getstatistics()
		},
		onLoad() {
			that = this;
		},
		onShareAppMessage() {
			return {
				title:'发票打印测试版',
				path:'pages/login/login'
			}
		},
		methods: {
			toShare(){
				uni.navigateTo({
					url:'./toShare'
				})
			},
			setting(){
				uni.navigateTo({
					url: './bleConnect'
				})
			},
			toShow() {
				this.show = true;
			},
			toAdd(){
				uni.navigateTo({
					url:'./addProduct'
				})
			},
			manage(){
				uni.navigateTo({
					url:'./switchList'
				})
			},
			logout() {
				let that = this
				uni.showModal({
					title: '提示',
					content: '确定退出登录？',
					success: function(res) {
						if (res.confirm) {
							// 注销账户，清空Token
							uni.removeStorageSync('token');
							uni.removeStorageSync('Bluetooth');
							uni.reLaunch({
								url: '/pages/login/login'
							})
						} else if (res.cancel) {
							
						}
					}
				});
			},
			getEarning(){
				this.$Request.getT('/getEarnings').then(res=>{
					if (res.status == 200) {
						that.earnings = res.data;
					}
				})
			},
			getstatistics(){
				this.$Request.getT('/statistics').then(res=>{
					if (res.status == 200) {
						that.totalGoods = res.data;
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
.container {
		position: relative;
		padding-bottom: 100rpx;
	}

	.top-container {
		height: 440rpx;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.bg-img {
		position: absolute;
		width: 100%;
		height: 440rpx;
	}

	.logout {
		width: 110rpx;
		height: 36rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 42rpx 0 24rpx 32rpx;
		position: relative;
		z-index: 2;
	}

	.logout-img {
		width: 36rpx;
		height: 36rpx;
		margin-right: 11rpx;
	}

	.logout-txt {
		font-size: 28rpx;
		color: #fefefe;
		line-height: 28rpx;
	}

	.user-wrapper {
		margin-top: 40px;
		display: flex;
		justify-content: center;
		position: relative;
		z-index: 2;
	}

	.user {
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		z-index: 2;
	}

	.avatar-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		align-self: center;
	}

	.user-info {
		display: flex;
		flex-direction: row;
		margin-top: 30rpx;
		align-items: center;
	}

	.user-info-mobile {
		margin-top: 30rpx;
		position: relative;
		font-size: 28rpx;
		color: #fefefe;
		line-height: 28rpx;
		align-self: center;
		padding: 0 50rpx;
	}

	.edit-img {
		position: absolute;
		width: 42rpx;
		height: 42rpx;
		right: 0;
		bottom: -4rpx;
	}

	.edit-img>image {
		width: 42rpx;
		height: 42rpx;
		padding-left: 25rpx;
	}

	.middle-container {
		height: 138rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		border-radius: 10rpx;
		background-color: #ffffff;
		margin: -30rpx 40rpx ;
		box-shadow: 0 15rpx 10rpx -15rpx #efefef;
		position: relative;
		z-index: 2;
	}

	.middle-item {
		width: 50%;
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.ticket-img {
		width: 80rpx;
		height: 80rpx;
		margin-left: 65rpx;
	}

	.middle-tag {
		font-size: 28rpx;
		color: #333333;
		line-height: 28rpx;
		font-weight: bold;
		padding-left: 22rpx;
	}

	.car-img {
		width: 80rpx;
		height: 80rpx;
		margin-left: 97rpx;
	}

	.bottom-container {
		//height: 334rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 90rpx 120rpx;
		margin: 0 30rpx;
		background-color: #ffffff;
		border-radius: 10rpx;
		box-sizing: border-box;
		box-shadow: 0 0 10rpx #efefef;
	}

	.ul-item {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}

	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.item-img {
		width: 64rpx;
		height: 64rpx;
	}

	.item-name {
		padding-top: 13rpx;
		font-size: 26rpx;
		color: #666666;
		min-width: 80rpx;
		text-align: center;
	}

	.btn-feedback {
		background: transparent !important;
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0;
		top: 0;
		border: 0;
	}

	.btn-feedback::after {
		border: 0;
	}
</style>
