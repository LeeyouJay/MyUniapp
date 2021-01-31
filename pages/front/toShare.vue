<template>
	<view class="page">
		<view class="u-tabs-box">
			<u-tabs-swiper activeColor="#2979ff" ref="tabs" name="typeName" :list="list" :current="current" @change="change"
			 :is-scroll="false" bar-width="120"></u-tabs-swiper>
		</view>
		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
			<swiper-item class="swiper-item" v-for="(res, front) in list" :key="res.id">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @refresherpulling="refresherpulling">
					<view class="page-box">
						<u-waterfall v-model="res.products" ref="uWaterfall">
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
										<view class="demo-tag-text" :class="[item.typeId == '水稻' ? 'rice' : item.typeId == '玉米' ? 'corn' :  item.typeId == '农药' ? 'pesticide' : item.typeId == '肥料' ? 'fertilizer': 'peanut']">
											{{item.typeId}}
										</view>
									</view>
									<view class="demo-flex">
										<view class="demo-shop">
											规格：{{item.unit}}
										</view>
										<view class="demo-price">
											￥{{item.price}}
										</view>
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
										<view class="demo-tag-text" :class="[item.typeId == '水稻' ? 'rice' : item.typeId == '玉米' ? 'corn' :  item.typeId == '农药' ? 'pesticide' : item.typeId == '肥料' ? 'fertilizer': 'peanut']">
											{{item.typeId}}
										</view>
									</view>
									<view class="demo-flex">
										<view class="demo-shop">
											规格：{{item.unit}}
										</view>
										<view class="demo-price">
											￥{{item.price}}
										</view>
									</view>
								</view>
							</template>
						</u-waterfall>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				ip: this.$Request.config("APIHOST"),
				swiperCurrent: 0,
				current: 0,
				list: [],
				data:[]
			}
		},
		onLoad() {
			that = this;
			uni.removeStorageSync('token');
			this.getList()
		},
		onShareAppMessage() {
			return {
				title: '产品列表',
				imageUrl:'https://chenyi.ink:8600/Arslinth/static/wallhaven-min.jpg',
				path: '/pages/front/toShare'
			}
		},
		onPullDownRefresh() {
			setTimeout(() => {
				this.getList()
				// this.$nextTick(()=>{
					
				// })
				uni.stopPullDownRefresh();
			}, 1000)
		},
		methods: {
			productInfo(id) {
				uni.navigateTo({
					url: '../front/productInfo?id=' + id
				})
			},
			getList() {
				this.$Request.getT('/getShareProducts').then(res => {
					if (res.status == 200) {
						var goods = res.data;
						goods.map(item => {
							item.products.map(val => {val.img = that.ip + val.img;})
						});
						that.list = goods;
					} else {
						this.$queue.showToast(res.msg);
					}
				})
			},
			refresherpulling(){
				console.log("1111")
			},
			clear() {
				this.$refs.uWaterfall.clear();
			},
			// tab栏切换
			change(index) {
				this.swiperCurrent = index;
			},
			transition({detail: {dx}}) {
				this.$refs.tabs.setDx(dx);
			},
			animationfinish({detail: {current}}) {
				this.$refs.tabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.current = current;
			}
		}

	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: #eee;
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--window-top));
		width: 100%;
	}
	.page-box{
		padding-bottom: 40rpx;
	}
	.swiper-box {
		flex: 1;
	}

	.swiper-item {
		height: 1000px;
	}

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
		// border: 1px solid #2979ff;
		// color: #2979ff;
		//margin-left: 10px;
		border-radius: 50rpx;
		line-height: 1;
		padding: 4rpx 14rpx;
		display: flex;
		align-items: center;
		border-radius: 50rpx;
		font-size: 20rpx;
	}
	.rice {
		border: 1px solid #2979ff;
		color: #2979ff;
	}
	.corn {
		border: 1px solid #ff9900;
		color: #ff9900;
	}
	.pesticide{
		border: 1px solid #fa3534;
		color: #fa3534;
	}
	.peanut{
		border: 1px solid #19be6b;
		color: #19be6b;
	}
	.fertilizer{
		border:1px solid #aa00ff;
		color: #aa00ff;
	}	
	.demo-price {
		font-size: 40rpx;
		color: $u-type-error;
		align-self: center;
		width: 20%;
		//margin-top: 5px;
		text-align-last: right;
	}
	
	.demo-shop {
		align-self: center;
		width: 65%;
		font-size: 24rpx;
		color: $u-tips-color;
		margin-top: 5px;
	}
	.demo-flex{
		display: flex;
	}
</style>
