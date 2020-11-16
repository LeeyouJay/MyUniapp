<template>
	<view class="u-wrap" style="margin: 40rpx;">
		<view style="margin-bottom: 20rpx;">
			<u-image mode="aspectFit" width="100%" height="500rpx" :src="avatar" :border-radius="20"></u-image>
		</view>
		<u-divider>品种信息</u-divider>
		<view class="item" style="margin-top: 20rpx;">
			<view class="label">品种名称：</view>
			<view class="context">{{product.pdName}}</view>
		</view>
		<view class="item">
			<view class="label">生育期(天)：</view>
			<view class="context">{{product.periodMin}}-{{product.periodMax}}</view>
		</view>
		<view class="item">
			<view class="label">株高(cm)：</view>
			<view class="context">{{product.height}}</view>
		</view>
		<view class="item">
			<view class="label">亩产量(公斤)：</view>
			<view class="context">{{product.yield}}</view>
		</view>

		<u-divider>性状特征</u-divider>
		<view class="content">
			<u-parse :html="contents" :tag-style="style" :show-with-animation="true" ></u-parse>
		</view>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				productId:'',
				ip: this.$Request.config("APIHOST"),
				product: {},
				contents: '',
				avatar: '',
				style: {
					p: 'font-size:32rpx',
					img: 'width: 100%'
				}
			}
		},
		onLoad(option) {
			that = this;
			var id = option.id;
			that.productId = id;
			that.findById(id);
		},
		onShareAppMessage() {
			return {
				title: that.product.pdName,
				path: 'pages/my/productInfo?id='+that.productId
			}
		},
		methods: {
			findById(id) {
				this.$Request.getT('/findById?id=' + id).then(res => {
					if (res.status == 200) {
						that.product = res.data
						that.contents = that.product.characters;
						that.avatar = that.ip + res.data.img;
					} else
						this.$queue.showToast(res.msg);
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.u-wrap {
		height: calc(100vh);
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
		//display: flex;
		flex-direction: column;
	}

	.content {
		margin: 50rpx 0rpx;
		color: $u-content-color;
		font-size: 32rpx;
		line-height: 1.8;
	}

	.item {
		clear: both;
		margin-bottom: 20rpx;
	}

	.label {
		height: 40rpx;
		width: 185rpx;
		font-weight: 400;
		float: left;
		display: block;
		text-align: left;
	}

	.context {
		float: left;
	}
</style>
