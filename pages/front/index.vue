<template>
	<view class="u-wrap">
		<view class="u-search-box">
			<u-search v-model="searchValue" shape="round" placeholder="输入品种名称" :action-style="searchBtnStyle" @custom="search" @blur="onSearch"></u-search>
		</view>
		<view class="u-menu-wrap">
			<scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view scroll-left" :scroll-top="scrollTop" :scroll-into-view="itemId">
				<view v-for="(item,index) in goods" :key="index" class="u-tab-item" :class="[current == index ? 'u-tab-item-active' : '']"
				 @tap.stop="swichMenu(index)">
					<text class="u-line-1">{{item.type}}</text>
				</view>
			</scroll-view>
			<scroll-view :scroll-top="scrollRightTop" scroll-y scroll-with-animation class="right-box scroll-right" @scroll="rightScroll">
				<view class="page-view">
					<view class="class-item" :id="'item' + i" v-for="(item , i) in goods" :key="i">
						<view class="item-title">
							<text>{{item.type}}</text>
						</view>
						<!-- 滑动块 -->
						<u-swipe-action :show="product.hide" v-for="(product, index) in item.products" :index="i" :secondIndex="index" :disabled = "product.move"
						 :key="index" :options="product.options" @click="swipeClick" @open="swipeOpen" v-if="product.show">
							<view :class="[product.value > 0 ? 'food border' : 'food']">
									<view style="width: 75px;height: 75px;" @click="productInfo(product.id)">
										<u-lazy-load :image="ip+product.img" :border-radius="16" :height="136" img-mode="aspectFill"></u-lazy-load>
									</view>
									
									<!-- <u-image width="75px" height="75px" :src="ip+product.img" mode="aspectFill" @click="productInfo(product.id)">
										<u-loading slot="loading"></u-loading>
										<view slot="error" style="font-size: 24rpx;">加载失败</view>
									</u-image> -->
									<view class="food-info">
										<view class="food-title">{{product.pdName}}</view>
										<view class="food-num">库存:{{product.num}}({{product.unit}})</view>
										<view class="food-btm">
											<text class="food-price">￥{{product.price}}</text>
											<!-- 步进器 -->
											<u-number-box v-model="product.value" @change="valChange(product,i,index)" @minus="minus(product)" @plus="plus(product)"
											 :step="step" :disabled-input="disabledInput"></u-number-box>
										</view>
									</view>
								</view>
						</u-swipe-action>

					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 弹出层 -->
		<u-popup v-model="checkShow" mode="bottom">
			<view style="margin: 30rpx 30rpx;">
				<view class="pop-btn">
					<u-button :ripple="true" :plain="true" size="mini" @click="clearFromBack()">清空数据</u-button>
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
		
		<u-popup v-model="showList" mode="bottom" height="85%">
			<view style="margin: 30rpx 30rpx;">
				<view class="pop-btn" style="display: flex;">
					<view  style="width: 50%;width: 50%; align-self: center; text-align: center; font-weight: bold;">
						请选择要批发的品种
					</view>
					<view style="width: 50%;">
						<u-button :ripple="true" size="medium" shape="circle" type="success" @click="wholesale">确定</u-button>
					</view>
				</view>
				<view class="pop-content">
					<u-checkbox-group @change="checkboxGroupChange" v-if="hackReset">
					<u-row gutter="0" v-for="(res , front) in goods" :key="front">
						<u-col span="12">
							<view class="demo-layout-type">
								{{res.type}}
							</view>
						</u-col>
						<u-col span="4" v-for="(item, index) in res.products" :key="item.id" v-if="item.show">
							<view class="demo-layout">
								<u-checkbox @change="checkboxChange" v-model="item.isSelected"
								:name="item.id">{{item.pdName}}</u-checkbox>
							</view>
						</u-col>
					</u-row>
					</u-checkbox-group>
				</view>
			</view>
		</u-popup>
		<!-- 底部提交栏 -->
		<view class="navigation">
			<view class="left" style="width: 35%;">
				<view class="item car" style="padding: 0;">
					<u-badge class="car-num" :count="totalType" type="error" :offset="[-6, -6]"></u-badge>
					<u-icon name="shopping-cart" :size="60" :color="$u.color['contentColor']" @click="toShow"></u-icon>
				</view>
				<view class="food-btm">
					<text class="food-price" style="font-size: 22px;">￥{{totalPrice}}</text>
					<!-- <u-count-to ref="uCountTo" :start-val="0" :end-val="totalPrice" :decimals="2" :font-size="44" color="#f01414"
					 :duration="700"></u-count-to> -->
				</view>
			</view>
			<view class="right" style="width: 65%;">
				<view class="sale btn u-line-1" @click="toSale">批发</view>
				<view class="buy btn u-line-1" @click="toCheck">查看打印</view>
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
				isChange:false,
				disabledInput: false,
				checkShow: false,
				showList:false,
				hackReset:false,
				boxFirst:'',
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
				checkboxGoods:[],
				options1: [{
						text: '隐藏',
						style: {
							backgroundColor: '#007aff'
						}
					},
					{
						text: '编辑',
						style: {
							backgroundColor: '#ffaa00'
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
					},
					{
						text: '编辑',
						style: {
							backgroundColor: '#ffaa00'
						}
					}
				],
				scrollviewHigh:0,
				searchBtnStyle:{
					'width': '18%',
					'borderRadius': '32rpx',
					'lineHeight': '64rpx',
					'color': '#ffffff',
					'fontSize': '26rpx',
					'backgroundColor': '#2979ff'
				}
			}
		},
		onLoad() {
			that = this;
			this.getList();
		},
		onShareAppMessage() {
			return {
				title: '产品列表',
				imageUrl:'https://chenyi.ink:8600/Arslinth/static/wallhaven-min.jpg',
				path: '/pages/front/toShare'
			}
		},
		onShow() {
			var flag = uni.getStorageSync('reloadList');
			if (flag) {
				this.getList();
				uni.removeStorageSync('reloadList');
			} else{
				that.goods.map(item=>item.products.map(val=>val.hide = false))

				this.$Request.getT('/user')
			}
				

		},
		onReady() {
			this.getMenuItemTop();
			setTimeout(()=>{ this.isChange=true }, 200);
		},
		onPullDownRefresh() {
			setTimeout(function() {
				that.getList();
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			onSearch(e){
				this.searchValue = e;
			},
			// 选中任一checkbox时，由checkbox-group触发
			checkboxGroupChange(e) {
				this.checkboxGoods = e
				//console.log(e);
			},
			checkboxChange(e) {
				//console.log(e);
			},
			//第一层下标，第二层下标，option的下标
			swipeClick(index, secondIndex, idx) {
				var id = this.goods[index].products[secondIndex].id;
				if (idx == 0) {
					that.hideProd(id);
				} else if(idx == 1) {
					that.editProduct(id);
				}else{
					that.removeProd(id);
				}
			},
			swipeOpen(index, secondIndex) {
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
				that.$Request.getT('/changeStatus/' + id + '/' + false).then(res => {
					if (res.status == 200) {
						that.$queue.showToast("隐藏成功");
						that.getList();
					} else {
						that.$queue.showToast(res.msg);
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
							that.$Request.getT('/removeProd/' + id).then(res => {
								if (res.status == 200) {
									that.$queue.showToast('删除成功！')
									that.getList();
								} else
									that.$queue.showToast(res.msg)
							})
						}
					}
				})
			},
			editProduct(id){
				uni.navigateTo({
					url: '../my/addProduct?id=' + id
				})
			},
			productInfo(id) {
				uni.navigateTo({
					url: '../front/productInfo?id=' + id
				})
			},
			reloadChooseGroup(again) {
				if(again)
					this.goods.map(item=>item.products.map(val=>val.isSelected = false));
				this.checkboxGoods = [];
				this.showList = false;
				this.hackReset = false;
				this.$nextTick(() => {
					this.hackReset = true;
				})
			},
			clearFromBack() {
				this.showList = false;
				this.getList();
			},
			toSale(){
				this.showList = true;
			},
			wholesale(){
				if (that.checkboxGoods.length == 0) {
					this.$queue.showToast("请先选择商品！")
					return
				}
				var data = JSON.stringify(that.checkboxGoods);
				uni.navigateTo({
					url: '../orders/wholeSale?data='+data
				})
			},
			toCheck() {
				this.selectGoods = []
				this.goods.map(good=>good.products.map(val=>{
					if(val.value>0){
						this.selectGoods.push({
							pdName: val.pdName,
							value: val.value,
							price: val.price,
							cost:val.cost,
							type:val.type,
						})
					}
				}));
				if (that.selectGoods.length == 0) {
					this.$queue.showToast("请先选择商品！")
					return
				}
				var navData = JSON.stringify(that.selectGoods);
				uni.navigateTo({
					url: '../front/preCheck?data=' + navData + '&totalPrice=' + that.totalPrice
				})
			},
			toShow() {
				this.selectGoods = []
				this.goods.map(good=>good.products.map(val=>{
					if(val.value>0){
						this.selectGoods.push({
							pdName: val.pdName,
							value: val.value,
							price: val.price,
							cost:val.cost,
							type:val.type,
						})
					}
				}));
				this.checkShow = true;
			},
			valChange(product,index,secondIndex) {
				if(this.isChange){
					// console.log("index:"+index);
					// console.log("secondIndex:"+secondIndex);
					//使用传统for循环达到最快效率 map() 建议在赋值时使用
					var temp =[];
					that.goods.map(item=>item.products.map(val=>{
						if(val.value>0)
							temp.push(that.accMul(val.price, val.value))
					}))
					// for (let i = 0; i < that.goods.length; i++) {
					// 	for (let j = 0; j < that.goods[i].products.length; j++) {
					// 		let val = that.goods[i].products[j]
					// 		temp.push(that.accMul(val.price, val.value))
					// 	}
					// }
					var tempSum = 0
					var typeCount = 0;
					for (let i = 0; i < temp.length; i++) {
						tempSum = that.accAdd(tempSum,temp[i]).toFixed(2);
						if(temp[i]>0)
							typeCount++
					}
					that.totalType = typeCount;
					that.totalPrice = tempSum
					
					if(product.value > 0)
						product.move = true;
					else
						product.move = false;
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
						var data = res.data;
						data.map(item=>item.products.map(val=>{
							val.hide = false;
							val.move = false;
							val.isSelected = false;
							if (val.fromApp == 1)
								val.options = that.options1
							else
								val.options = that.options2
						}))
						that.goods = data;
						that.reloadChooseGroup(false)
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
	.demo-layout{
	    height: 80rpx;
	    border-radius: 10rpx;
	    margin-top: 15rpx;
	    padding-left: 8rpx;
	    padding-top: 14rpx;
	}
	.demo-layout-type{
		height: 80rpx;
		border-radius: 30rpx;
		background-color: #d8e4f1;
		margin-top: 15rpx;
		font-size: 40rpx;
		font-weight: bold;
		font-variant: diagonal-fractions;
		line-height: 2;
		padding-left: 24rpx;
	}
	.pop-content{
		display: flex;
		flex-direction: column;
		flex: 1;
	}
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
		border-radius: 20rpx;
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
				text-align: center;
				width: 36%;
				color: #ffffff;
				margin-left: 11%;
			}

			.cart {
				background-color: #ed3f14;
				margin-right: 30rpx;
			}

			.buy {
				background-color: #2979FF;
			}
			.sale{
				background-color: #18b566;
			}
		}
	}
</style>
