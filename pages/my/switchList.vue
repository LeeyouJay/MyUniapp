<template>
	<view class="u-wrap">
		<view class="u-menu-wrap">
				<view class="page-view">
					<view class="class-item" :id="'item' + i" v-for="(item , i) in goods" :key="i">
						<view class="item-title border">
							<text>{{item.type}}</text>
						</view>

						<u-cell-group>
							<u-cell-item :title="product.pdName" :label="'库存：'+product.num" :arrow="false" :value="product.show?'已显示':'已隐藏'"
							 v-for="(product, index) in item.products" :key="index">
								<u-switch slot="right-icon" v-model="product.show" @change="change(product)" :vibrate-short="true"></u-switch>
							</u-cell-item>
						</u-cell-group>

					</view>
				</view>
		</view>
	</view>
</template>

<script>
	var that
	export default {
		data() {
			return {
				scrollRightTop: 0,
				goods: [],
				scrollviewHigh:0
			}
		},
		onLoad() {
			that = this
			this.getList();
		},
		onReady() {
			//#ifdef APP-PLUS
			this.getPhoneHeight();
			//#endif
		},
		onPullDownRefresh() {
			setTimeout(function() {
				that.getList();
				uni.stopPullDownRefresh(); //停止下拉刷新动画
			}, 1000);
		},
		methods: {
			change(product) {
				this.$Request.getT('/changeStatus/'+product.id+'/'+product.show).then(res => {
					if (res.status == 200) {
						if(product.show)
							this.$queue.showToast("显示成功");
						else
							this.$queue.showToast("隐藏成功");
						uni.setStorageSync('reloadList',true);
					} else {
						this.$queue.showToast(res.msg);
					}
				})
				
			},
			getList() {
				this.$Request.getT('/getList').then(res => {
					if (res.status == 200) {
						var goods = res.data;
						that.goods = goods;
					} else {
						this.$queue.showToast(res.msg);
					}
				})
			},
			getPhoneHeight() {
				uni.getSystemInfo({
					success(res) {
						that.scrollviewHigh = res.windowHeight
					}
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
		display: flex;
		flex-direction: column;
	}

	.u-menu-wrap {
		flex: 1;
		display: flex;
		/* overflow: hidden; */
	}

	.page-view {
		padding: 16rpx;
		width: 100%;
	}

	.class-item {
		margin-bottom: 30rpx;
		background-color: #fff;
		padding: 16rpx;
		border-radius: 8rpx;
	}

	.item-title {
		font-size: 36rpx;
		color: $u-main-color;
		font-weight: bold;
		padding: 20rpx ;
	}
	.border {
		background-color: #ECF5FF;
		
	}
</style>
