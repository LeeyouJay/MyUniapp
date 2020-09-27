<template>
	<view class="wrap">
		<u-waterfall v-model="goods" ref="uWaterfall">
			<template v-slot:left="{leftList}">
				<view class="demo-warter" v-for="(item, index) in leftList" :key="index">
					<!-- 警告：微信小程序不支持嵌入lazyload组件，请自行如下使用image标签 -->
					<!-- #ifndef MP-WEIXIN -->
					<u-lazy-load threshold="-450" border-radius="10" :image="item.img" :index="index"></u-lazy-load>
					<!-- #endif -->
					<!-- #ifdef MP-WEIXIN -->
					<view class="demo-img-wrap" @click="productInfo(item.id)">
						<image class="demo-image" :src="item.img" mode="widthFix"></image>
					</view>
					<!-- #endif -->
					<view class="demo-title">
						{{item.pdName}}
					</view>
					<view class="demo-tag">
						<view class="demo-tag-text">
							{{item.type}}
						</view>
					</view>
					<view class="demo-price">
						￥{{item.price}}
					</view>
				</view>
			</template>
			<template v-slot:right="{rightList}">
				<view class="demo-warter" v-for="(item, index) in rightList" :key="index">
					<!-- #ifndef MP-WEIXIN -->
					<u-lazy-load threshold="-450" border-radius="10" :image="item.img" :index="index"></u-lazy-load>
					<!-- #endif -->
					<!-- #ifdef MP-WEIXIN -->
					<view class="demo-img-wrap" @click="productInfo(item.id)">
						<image class="demo-image" :src="item.img" mode="widthFix"></image>
					</view>
					<!-- #endif -->
					<view class="demo-title">
						{{item.pdName}}
					</view>
					<view class="demo-tag">
						<view class="demo-tag-text">
							{{item.type}}
						</view>
					</view>
					<view class="demo-price">
						￥{{item.price}}
					</view>
				</view>
			</template>
		</u-waterfall>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				ip: this.$Request.config("APIHOST"),
				goods: []
			}
		},
		onLoad() {
			that = this;
			this.getList();
		},
		methods: {
			getList() {
				this.$Request.getT('/getEveryProducts').then(res => {
					if (res.status == 200) {
						var goods = res.data;
						for (var i = 0; i < goods.length; i++) {
							var product = goods[i]
							product.hide = false
							product.img = that.ip + product.img;
						}
						that.goods = goods;
						console.log(that.goods)
					} else {
						this.$queue.showToast(res.msg);
					}
				})
			},
			productInfo(id) {
				uni.navigateTo({
					url: './productInfo?id=' + id
				})
			},
		}
	}
</script>

<style>
	/* page不能写带scope的style标签中，否则无效 */
	page {
		background-color: rgb(240, 240, 240);
	}
</style>

<style lang="scss" scoped>
	.demo-warter {
		border-radius: 8px;
		margin: 5px;
		background-color: #ffffff;
		padding: 8px;
		position: relative;
	}

	.u-close {
		position: absolute;
		top: 32rpx;
		right: 32rpx;
	}

	.demo-image {
		width: 100%;
		border-radius: 4px;
	}

	.demo-title {
		font-size: 30rpx;
		margin-top: 5px;
		color: $u-main-color;
	}

	.demo-tag {
		display: flex;
		margin-top: 5px;
	}

	.demo-tag-owner {
		background-color: $u-type-error;
		color: #FFFFFF;
		display: flex;
		align-items: center;
		padding: 4rpx 14rpx;
		border-radius: 50rpx;
		font-size: 20rpx;
		line-height: 1;
	}

	.demo-tag-text {
		border: 1px solid #909399;
		color: #909399;
		//margin-left: 10px;
		border-radius: 50rpx;
		line-height: 1;
		padding: 4rpx 14rpx;
		display: flex;
		align-items: center;
		border-radius: 50rpx;
		font-size: 20rpx;
	}

	.demo-price {
		font-size: 30rpx;
		color: $u-type-error;
		margin-top: 5px;
	}

	.demo-shop {
		font-size: 22rpx;
		color: $u-tips-color;
		margin-top: 5px;
	}
</style>
