<template>
	<view class="u-wrap">
		<view class="u-search-box">
			<u-search v-model="searchValue" shape="round" placeholder="输入品种名称" @search="search" @custom="search"></u-search>
		</view>
		<view class="u-menu-wrap">
			<!-- #ifdef APP-PLUS-->
			<scroll-view scroll-y="true" scroll-with-animation class="u-tab-view menu-scroll-view scroll-left" :scroll-top="scrollTop" :scroll-into-view="itemId" :style="{height:scrollviewHigh+'px'}">
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN-->
			<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view scroll-left" :scroll-top="scrollTop" :scroll-into-view="itemId">
			<!-- #endif -->
				<view v-for="(item,index) in goods" :key="index" class="u-tab-item" :class="[current == index ? 'u-tab-item-active' : '']"
				 @tap.stop="swichMenu(index)">
					<text class="u-line-1">{{item.type}}</text>
				</view>
			</scroll-view>
			<!-- #ifdef APP-PLUS-->
			<scroll-view :scroll-top="scrollRightTop" scroll-y="true" scroll-with-animation class="right-box scroll-right" @scroll="rightScroll" :style="{height:scrollviewHigh+'px'}">
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN-->
			<scroll-view :scroll-top="scrollRightTop" scroll-y scroll-with-animation class="right-box scroll-right" @scroll="rightScroll">
			<!-- #endif -->
				<view class="page-view">
					<view class="class-item" :id="'item' + i" v-for="(item , i) in goods" :key="i">
						<view class="item-title">
							<text>{{item.type}}</text>
						</view>
						<!-- 滑动块 -->
						<!-- #ifdef MP-WEIXIN-->
						<u-swipe-action :show="product.hide" v-for="(product, index) in item.products" :index="i" :secondIndex="index" :disabled = "product.move"
						 :key="index" :options="product.options" @click="click" @open="open" v-if="product.show">
							<view :class="[product.value > 0 ? 'food border' : 'food']">
						<!-- #endif -->

								<!-- #ifdef APP-PLUS-->
								<view v-for="(product, index) in item.products" :key="index" :class="[product.value > 0 ? 'food border' : 'food']">
								<!-- #endif -->
									<u-image width="75px" height="75px" :src="ip+product.img" mode="scaleToFill" @click="productInfo(product.id)"></u-image>
									<view class="food-info">
										<!-- #ifdef APP-PLUS-->
										<view>
											<view style="width: 50%;float: left;">
												<view class="food-title">{{product.pdName}}</view>
												<view class="food-num">库存:{{product.num}}</view>
											</view>
											<view style="width: 50%;padding: 10rpx 0rpx;float: left; text-align: center;">
												<u-button :ripple="true" :plain="true" type="primary" size="mini" @click="hideProd(product.id)">隐藏</u-button>
												<u-button :ripple="true" :plain="true" type="error" size="mini" v-if="product.fromApp == 1" @click="removeProd(product.id)">移除</u-button>
											</view>
										</view>
										<!-- #endif -->
										<!-- #ifdef MP-WEIXIN-->
										<view class="food-title">{{product.pdName}}</view>
										<view class="food-num">库存:{{product.num}}({{product.unit}})</view>
										<!-- #endif -->

										<view class="food-btm">
											<text class="food-price">￥{{product.price}}</text>
											<!-- 步进器 -->
											<u-number-box v-model="product.value" @change="valChange(product)" @minus="minus(product)" @plus="plus(product)"
											 :step="step" :disabled-input="disabledInput"></u-number-box>
										</view>
									</view>
								</view>
						<!--#ifdef MP-WEIXIN -->
						</u-swipe-action>
						<!-- #endif -->

					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 弹出层 -->
		<u-popup v-model="show" mode="bottom">
			<view style="margin: 30rpx 30rpx;">
				<view class="pop-btn">
					<u-button :ripple="true" :plain="true" size="mini" @click="clearData()">清空数据</u-button>
				</view>
				<u-table>
					<u-tr>
						<u-th>品种</u-th>
						<u-th>数量x单价</u-th>
						<u-th>金额</u-th>
					</u-tr>
					<u-tr v-for="(product,index) in selectGoods" :key="index">
						<u-td>{{product.pdName}}</u-td>
						<u-td>{{product.value}}x{{product.price}}(元)</u-td>
						<u-td>{{product.price*product.value}}</u-td>
					</u-tr>
					<u-tr>
						<u-td></u-td>
						<u-td>合计：</u-td>
						<u-td>{{totalPrice}}</u-td>
					</u-tr>
				</u-table>
			</view>
		</u-popup>
		<!-- 底部提交栏 -->
		<view class="navigation">
			<view class="left" style="width: 50%;">
				<view class="item car" style="padding: 0;">
					<u-badge class="car-num" :count="totalType" type="error" :offset="[-6, -6]"></u-badge>
					<u-icon name="shopping-cart" :size="60" :color="$u.color['contentColor']" @click="toShow"></u-icon>
				</view>
				<view class="food-btm">
					<text class="food-price" style="font-size: 22px;">￥</text>
					<u-count-to ref="uCountTo" :start-val="0" :end-val="totalPrice" :decimals="2" :font-size="44" color="#f01414"
					 :duration="700"></u-count-to>
				</view>
			</view>
			<view class="right" style="width: 50%;">
				<view class="buy btn u-line-1" style="margin-left: 50%;" @click="toCheck">查看打印</view>
			</view>
		</view>
		</view>
	</view>
</template>
<script>
	var that;
	export default {
		data() {
			return {
				ip: this.$Request.config("APIHOST"),
				step: 1,
				disabledInput: false,
				show: false,
				totalType: 0,
				totalPrice: 0,
				scrollTop: 0, //tab标题的滚动条位置
				oldScrollTop: 0,
				current: 0, // 预设当前项的值
				menuHeight: 0, // 左边菜单的高度
				menuItemHeight: 0, // 左边菜单item的高度
				itemId: '', // 栏目右边scroll-view用于滚动的id
				arr: [],
				goodsArr: [],
				scrollRightTop: 0, // 右边栏目scroll-view的滚动条高度
				timer: null, // 定时器
				searchValue: '',
				goods: [],
				selectGoods: [],
				productTemp: '',
				cache: 0,
				options1: [{
						text: '隐藏',
						style: {
							backgroundColor: '#007aff'
						}
					},
					{
						text: '移除',
						style: {
							backgroundColor: '#dd524d'
						}
					}
				],
				options2: [{
					text: '隐藏',
					style: {
						backgroundColor: '#007aff'
					}
				}],
				scrollviewHigh:0
			}
		},
		onLoad(options) {
			that = this;
			this.getList();
		},
		onShareAppMessage() {
			return {
				title: '种子列表',
				path: 'pages/my/toShare'
			}
		},
		onShow() {
			that = this;
			var flag = uni.getStorageSync('reloadList');
			if (flag) {
				this.getList();
				uni.removeStorageSync('reloadList');
			} else
				this.$Request.getT('/user')

		},
		onReady() {
			this.getMenuItemTop();
			//#ifdef APP-PLUS
			this.getPhoneHeight();
			//#endif
		},
		onPullDownRefresh() {
			setTimeout(function() {
				that.getList();
				that.productTemp = '';
				that.cache = 0;
				uni.stopPullDownRefresh(); //停止下拉刷新动画
			}, 1000);
		},
		methods: {
			//第一层下标，第二层下标，option的下标
			click(index, secondIndex, idx) {
				var id = this.goods[index].products[secondIndex].id;
				if (idx == 1) {
					that.removeProd(id);
				} else {
					that.hideProd(id);
				}
			},
			open(index, secondIndex) {
				// 先将正在被操作的swipeAction标记为打开状态，否则由于props的特性限制，
				// 原本为'false'，再次设置为'false'会无效
				if (this.goods[index].products.length == secondIndex) return
				this.goods[index].products[secondIndex].hide = true;
				for (var i = 0; i < this.goods.length; i++) {
					this.goods[i].products.map((val, idx) => {
						if (secondIndex != idx) {
							this.goods[i].products[idx].hide = false;
						}
					})
				}
			},
			hideProd(id) {
				uni.showModal({
					title: '隐藏',
					content: '确定隐藏所选品种？隐藏之后可在显示管理中重新打开',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.$Request.getT('/changeStatus?id=' + id + '&isShow=' + false).then(res => {
								if (res.status == 200) {
									that.$queue.showToast("隐藏成功");
									that.getList();
									that.productTemp = '';
									that.cache = 0;
								} else {
									that.$queue.showToast(res.msg);
								}
							})
						}
					}
				})
			},
			removeProd(id) {
				uni.showModal({
					title: '移除',
					content: '确定移除所选品种？',
					showCancel: true,
					success: function(res) {
						if (res.confirm) {
							that.$Request.getT('/removeProd?id=' + id).then(res => {
								if (res.status == 200) {
									that.$queue.showToast('删除成功！')
									that.getList();
									that.productTemp = '';
									that.cache = 0;
								} else
									that.$queue.showToast(res.msg)
							})
						}
					}
				})
			},
			productInfo(id) {
				uni.navigateTo({
					url: './productInfo?id=' + id
				})
			},
			clearData() {
				this.totalType = 0;
				this.totalPrice = 0;
				this.selectGoods = [];
				this.getList();
			},
			clearFromBack() {
				this.goods = [];
				this.totalType = 0;
				this.totalPrice = 0;
				this.selectGoods = [];
				this.getList();
			},
			toCheck() {
				if (that.selectGoods.length == 0) {
					this.$queue.showToast("请先选择商品！")
					return
				}
				var navData = JSON.stringify(that.selectGoods);
				uni.navigateTo({
					url: './preCheck?data=' + navData + '&totalPrice=' + that.totalPrice
				})
			},
			toShow() {
				this.show = true;
			},
			getPhoneHeight() {
				uni.getSystemInfo({
					success(res) {
						var phoneHeight = res.windowHeight
						// 计算组件的高度
						let view = uni.createSelectorQuery().select(".navigation")
						view.boundingClientRect(data => {
							that.scrollviewHigh = phoneHeight - data.height-50
							console.log(that.scrollviewHigh);
						}).exec()
					}
				})
			},
			valChange(product) {
				if(product.value > 0)
					product.move = true;
				else
					product.move = false;
					
				if (that.productTemp != product.id) {
					that.productTemp = product.id;
					that.cache = product.num;
				}
				product.num = (that.cache - product.value).toFixed(1)
				if (JSON.stringify(that.selectGoods).indexOf(JSON.stringify(product)) === -1 && product.value != 0) {
					that.selectGoods.push(product)
				} else {
					for (var i = 0; i < that.selectGoods.length; i++) {
						var id = that.selectGoods[i].id;
						if (id == product.id) {
							if (product.value == 0 || product.value == "")
								that.selectGoods.splice(i, 1)
							else
								that.selectGoods[i].value = product.value;
						}
					}
				}
				that.totalType = that.selectGoods.length;
				that.totalPrice = 0;
				for (var i = 0; i < that.selectGoods.length; i++) {
					var price = that.selectGoods[i].price
					var count = that.selectGoods[i].value
					that.totalPrice = that.accAdd(that.totalPrice, that.accMul(price, count)).toFixed(2);
				}
			},
			plus(product) {
				//product.num-=that.step;
			},
			minus(product) {
				//product.num+=that.step;
			},
			search(value) {
				if (value == '' || value == null) {
					that.scrollRightTop = that.oldScrollTop;
					this.$nextTick(function() {
						that.scrollRightTop = 0;
					})
					return
				}
				var currentIndex = this.current;
				var index = 0;
				var products = this.goods[currentIndex].products
				for (var i = 0; i < currentIndex; i++) {
					index += (this.goods[i].products.length);
				}
				for (var i = 0; i < products.length; i++) {
					var product = products[i];
					if (product.pdName.match(value) != null) {
						index += i;
						that.scrollRightTop = that.oldScrollTop;
						this.$nextTick(function() {
							that.scrollRightTop = that.goodsArr[index];
						})
						break;
					}
				}
			},
			// 点击左边的栏目切换
			async swichMenu(index) {
				if (this.arr.length == 0) {
					await this.getMenuItemTop();
				}
				if (index == this.current) return;
				this.scrollRightTop = this.oldScrollTop;
				this.$nextTick(function() {
					this.scrollRightTop = this.arr[index];
					this.current = index;
					this.leftMenuStatus(index);
				})
			},
			// 获取一个目标元素的高度
			getElRect(elClass, dataVal) {
				new Promise((resolve, reject) => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.' + elClass).fields({
						size: true
					}, res => {
						// 如果节点尚未生成，res值为null，循环调用执行
						if (!res) {
							setTimeout(() => {
								this.getElRect(elClass);
							}, 10);
							return;
						}
						this[dataVal] = res.height;
						resolve();
					}).exec();
				})
			},
			// 观测元素相交状态
			async observer() {
				this.goods.map((val, index) => {
					let observer = uni.createIntersectionObserver(this);
					// 检测右边scroll-view的id为itemxx的元素与right-box的相交状态
					// 如果跟.right-box底部相交，就动态设置左边栏目的活动状态
					observer.relativeTo('.right-box', {
						top: 0
					}).observe('#item' + index, res => {
						if (res.intersectionRatio > 0) {
							let id = res.id.substring(4);
							this.leftMenuStatus(id);
						}
					})
				})
			},
			// 设置左边菜单的滚动状态
			async leftMenuStatus(index) {
				this.current = index;
				// 如果为0，意味着尚未初始化
				if (this.menuHeight == 0 || this.menuItemHeight == 0) {
					await this.getElRect('menu-scroll-view', 'menuHeight');
					await this.getElRect('u-tab-item', 'menuItemHeight');
				}
				// 将菜单活动item垂直居中
				this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight / 2;
			},
			// 获取右边菜单每个item到顶部的距离
			getMenuItemTop() {
				new Promise(resolve => {
					let selectorQuery = uni.createSelectorQuery();
					selectorQuery.selectAll('.class-item').boundingClientRect((rects) => {
						// 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
						if (!rects.length) {
							setTimeout(() => {
								this.getMenuItemTop();
							}, 10);
							return;
						}
						rects.forEach((rect) => {
							// 这里减去rects[0].top，是因为第一项顶部可能不是贴到导航栏(比如有个搜索框的情况)
							this.arr.push(rect.top - rects[0].top);
							resolve();
						})
					}).exec()
				})
				this.getGoodItemTop();
			},
			//获取右边每个商品到顶部的距离
			getGoodItemTop() {
				new Promise(resolve => {
					let selectorQuery = uni.createSelectorQuery();
					selectorQuery.selectAll('.food').boundingClientRect((rects) => {
						if (!rects.length) {
							setTimeout(() => {
								this.getGoodItemTop();
							}, 10);
							return;
						}
						rects.forEach((rect) => {
							this.goodsArr.push(rect.top - rects[0].top);
							resolve();
						})
					}).exec()
				})
			},
			// 右边菜单滚动
			async rightScroll(e) {
				this.oldScrollTop = e.detail.scrollTop;
				if (this.arr.length == 0) {
					await this.getMenuItemTop();
				}
				if (this.timer) return;
				if (!this.menuHeight) {
					await this.getElRect('menu-scroll-view', 'menuHeight');
				}
				setTimeout(() => { // 节流
					this.timer = null;
					// scrollHeight为右边菜单垂直中点位置
					let scrollHeight = e.detail.scrollTop + this.menuHeight / 3;
					for (let i = 0; i < this.arr.length; i++) {
						let height1 = this.arr[i];
						let height2 = this.arr[i + 1];
						// 如果不存在height2，意味着数据循环已经到了最后一个，设置左边菜单为最后一项即可
						if (!height2 || scrollHeight >= height1 && scrollHeight < height2) {
							this.leftMenuStatus(i);
							return;
						}
					}
				}, 10)
			},
			getList() {
				this.totalType = 0;
				this.totalPrice = 0;
				this.selectGoods = [];
				this.$Request.getT('/getList').then(res => {
					if (res.status == 200) {
						var goods = res.data;
						for (var i = 0; i < goods.length; i++) {
							for (var j = 0; j < goods[i].products.length; j++) {
								var product = goods[i].products[j]
								product.hide = false
								product.move = false
								if (product.fromApp == 1)
									product.options = that.options1
								else
									product.options = that.options2
							}
						}
						that.goods = goods;
					} else {
						this.$queue.showToast(res.msg);
					}
				})
			},
			//加法函数
			accAdd(arg1, arg2) {
				var r1, r2, m;
				try {
					r1 = arg1.toString().split(".")[1].length;
				} catch (e) {
					r1 = 0;
				}
				try {
					r2 = arg2.toString().split(".")[1].length;
				} catch (e) {
					r2 = 0;
				}
				m = Math.pow(10, Math.max(r1, r2));
				return (arg1 * m + arg2 * m) / m;
			},
			//乘法函数
			accMul(arg1, arg2) {
				var m = 0,
					s1 = arg1.toString(),
					s2 = arg2.toString();
				try {
					m += s1.split(".")[1].length;
				} catch (e) {}
				try {
					m += s2.split(".")[1].length;
				} catch (e) {}
				return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.item {
		display: flex;
		padding: 20rpx;
	}

	.title {
		text-align: left;
		font-size: 28rpx;
		color: $u-content-color;
		margin-top: 20rpx;
	}

	.pop-btn {
		margin-bottom: 20rpx;
		text-align: right;
		margin-right: 1px;
	}

	.close-btn {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.u-wrap {
		height: calc(100vh);
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
		display: flex;
		flex-direction: column;
	}

	.u-search-box {
		padding: 18rpx 30rpx;
	}

	.u-menu-wrap {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.u-tab-item {
		height: 110rpx;
		background: #f6f6f6;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #444;
		font-weight: 400;
		line-height: 1;
	}

	.u-tab-item-active {
		position: relative;
		color: #000;
		font-size: 30rpx;
		font-weight: 600;
		background: #fff;
	}

	.u-tab-item-active::before {
		content: "";
		position: absolute;
		border-left: 4px solid $u-type-primary;
		height: 32rpx;
		left: 0;
		top: 39rpx;
	}

	.u-tab-view {
		height: 100%;
	}

	.scroll-left {
		width: 20%;
	}

	.scroll-right {
		width: 80%;
	}

	.right-box {
		background-color: rgb(250, 250, 250);
	}

	.page-view {
		padding: 16rpx;
	}

	.class-item {
		margin-bottom: 30rpx;
		background-color: #fff;
		padding: 16rpx;
		border-radius: 8rpx;
	}

	.class-item:last-child {
		min-height: 100vh;
	}

	.item-title {
		font-size: 26rpx;
		color: $u-main-color;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.item-container {
		display: flex;
		flex-wrap: wrap;
	}

	.food {
		//width: 100%;
		margin-right: 9rpx;
		margin-bottom: 15rpx;
	}

	.border {
		background-color: #ECF5FF;
		border-style: solid;
		border-color: #2979FF;
		border-width: 1rpx;
		box-shadow:  4rpx 4rpx 9rpx #0068d9, 
		             -4rpx -4rpx 9rpx #008cff;
	}

	.food,
	.food-btm,
	.content {
		display: flex;
		flex-direction: row;
	}

	.food-info {
		margin-left: 20rpx;
		margin-right: 22rpx;
		display: flex;
		flex-direction: column;
		flex: 2;
	}

	.food-btm {
		justify-content: space-between;
	}

	.food-price {
		color: #f01414;
		font-size: 16px;
	}

	.food-title {
		font-size: 32rpx;
		margin-top: 4rpx;
	}

	.food-num {
		font-size: 26rpx;
		margin: 4rpx 0 8rpx;
	}

	.food-del {
		width: 50%;
		padding: 12rpx;
		float: right;
		text-align: center;
	}

	/* 底部菜单栏*/
	.navigation {
		display: flex;
		border: solid 2rpx #f2f2f2;
		background-color: #ffffff;
		padding: 16rpx 0;

		.left {
			display: flex;
			font-size: 20rpx;

			.item {
				margin: 0 30rpx;

				&.car {
					text-align: center;
					position: relative;

					.car-num {
						position: absolute;
						top: -10rpx;
						right: -10rpx;
					}
				}
			}
		}

		.right {
			display: flex;
			font-size: 28rpx;
			align-items: center;

			.btn {
				line-height: 66rpx;
				padding: 0 30rpx;
				border-radius: 36rpx;
				color: #ffffff;
			}

			.cart {
				background-color: #ed3f14;
				margin-right: 30rpx;
			}

			.buy {
				background-color: #2979FF;
			}
		}
	}
</style>
