<template>
	<view class="wrap">
		<view class="u-search-box">
			<u-calendar v-model="calendar" mode="date" @change="chooseDate"></u-calendar>
			<view>
				<view style="width: 30%;float: left;"><u-input v-model="selectDate" type="text" input-align="center"  :disabled="true" placeholder="请选择日期" :custom-style="inputStyle" @click="calendar = true"/></view>
				<view style="width: 65%;float: right;"><u-search v-model="searchName" :action-style="searchBtnStyle" shape="round" input-align="center" placeholder="请输入查询名称" @custom="search" @blur="onSearch"></u-search></view>
			</view>
		</view>
		<view class="u-tabs-box">
			<u-tabs-swiper activeColor="#2979ff" ref="tabs" :list="list" :current="current" @change="change" :is-scroll="false" bar-width="120"></u-tabs-swiper>
		</view>
		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
			<!-- 第一栏 -->
			<swiper-item class="swiper-item" >
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottom">
					<view class="page-box">
						<view v-if="importList.length == 0">
							<view class="centre">
								<image src="https://cdn.uviewui.com/uview/template/taobao-order.png" mode=""></image>
								<view class="explain">
									暂无数据
									<view class="tips">可以去看看有哪些品种</view>
								</view>
							</view>
						</view>
						<view class="order" v-for="(res, front) in importList" :key="res.id">
							<view class="top">
								<view class="left" @click="toRemittance(res)">
									<u-icon name="account" :size="40" color="rgb(94,94,94)"></u-icon>
									<view class="store">{{res.pcpName}}</view>
								</view>
								<view class="right" style="font-size: 28rpx; font-weight: bold;">{{res.company?res.company:''}}</view>
							</view>
							
							<view class="item">
								<u-row gutter="0" style="width: 100%;">
									<u-col span="4">
										<view class="demo-layout layout-title">时间</view>
									</u-col>
									<u-col span="4">
										<view class="demo-layout layout-title">品种</view>
									</u-col>
									<u-col span="2">
										<view class="demo-layout layout-title">数量</view>
									</u-col>
									<u-col span="2">
										<view class="demo-layout layout-title">件数</view>
									</u-col>
									<view v-for="(item,index) in res.stock" :key="item.id">
									<u-col span="4">
										<view class="demo-layout layout-content">{{item.inDate}}</view>
									</u-col>
									<u-col span="4">
										<view class="demo-layout layout-content">{{item.pdName}}</view>
									</u-col>
									<u-col span="2">
										<view class="demo-layout layout-content">{{item.count}}</view>
									</u-col>
									<u-col span="2">
										<view class="demo-layout layout-content">{{item.unit}}</view>
									</u-col>
									</view>
								</u-row>
							</view>
							<view class="total" >
								共
								<text class="total-price">{{res.countType}}</text>
								种类型 合计:
								<text class="total-price">
									￥{{priceInt(res.totalCost)}}
									<text class="decimal">.{{priceDecimal(res.totalCost)}}</text>
								</text>
							</view>
							<view class="bottom">
								
							</view>
						</view>
						<u-loadmore :status="loadStatus[0]" bgColor="#f2f2f2"></u-loadmore>
					</view>
				</scroll-view>
			</swiper-item>
			<!-- 第二栏 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottom">
					<view class="page-box">
						<view v-if="orderList.length == 0">
							<view class="centre">
								<image src="https://cdn.uviewui.com/uview/template/taobao-order.png" mode=""></image>
								<view class="explain">
									暂无数据
									<view class="tips">可以去看看有哪些品种</view>
								</view>
							</view>
						</view>
						<view class="order" v-for="(res, front) in orderList" :key="res.id">
							<view class="top">
								<view class="left">
									<u-icon name="account" :size="40" color="rgb(94,94,94)"></u-icon>
									<view class="store">{{ res.consumer }}</view>
								</view>
								<view class="tag region" >{{res.region}}</view>
								<view class="right">{{ res.createTime }}</view>
							</view>
							<view class="item" v-for="(item, index) in res.orderDetails" :key="item.id" @click="productInfo(res.orderDetails[index])">
								<view class="left">
									<!-- <image style="width: 90px; height: 90px;" :src="ip+item.imgUrl" :lazy-load="true" mode="aspectFill"></image> -->
									<u-image :border-radius="18" width="90px" height="90px" :src="ip+item.imgUrl" mode="aspectFill">
										<u-loading slot="loading"></u-loading>
										<view slot="error" style="font-size: 24rpx;">加载失败</view>
									</u-image>
								</view>
								<view class="midRight">
									<view class="content">
										<view class="title u-line-2">{{ item.pdName }}</view>
										<view class="unit">规格：{{item.unit}}</view>
										<view class="type" :class="[item.type == '水稻' ? 'rice' : item.type == '玉米' ? 'corn' :  item.type == '农药' ? 'pesticide' : item.type == '肥料' ? 'fertilizer':'peanut']" >{{ item.type }}</view>
									</view>
									<view class="right">
										<view class="price">
											￥{{ priceInt(item.price) }}
											<text class="decimal">.{{ priceDecimal(item.price) }}</text>
										</view>
										<view class="number">x{{ item.value }}</view>
									</view>
								</view>
							</view>
							<view style="display: flex;margin-top: 20rpx;">
								<view style="width: 30%;padding: 0 20rpx;" >
									<!-- <view class="tag hasPay" style="background-color: #2b85e4;" >{{res.region}}</view> -->
								</view>
								
								<view class="total" style="width: 70%;">
									共
									<text class="total-price">{{ totalNum(res.orderDetails) }}</text>
									种类型 合计:
									<text class="total-price">
										￥{{ priceInt(res.totalPrice) }}.
										<text class="decimal">{{ priceDecimal(res.totalPrice) }}</text>
									</text>
								</view>
							</view>
							<view class="bottom">
								联系电话：
								<text @click="phoneCall(res.phone)">{{res.phone}}</text>
								<!-- <view class="more"><u-icon name="more-dot-fill" color="rgb(203,203,203)"></u-icon></view>
								<view class="logistics btn">查看物流</view>
								<view class="exchange btn">卖了换钱</view>
								<view class="evaluate btn">评价</view> -->
							</view>
						</view>
						<u-loadmore :status="loadStatus[1]" bgColor="#f2f2f2"></u-loadmore>
					</view>
				</scroll-view>
			</swiper-item>
			<!-- 第三栏 -->
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottom">
					<view class="page-box">
						<view v-if="wholesale.length == 0">
							<view class="centre">
								<image src="https://cdn.uviewui.com/uview/template/taobao-order.png" mode=""></image>
								<view class="explain">
									暂无数据
									<view class="tips">可以去看看有哪些品种</view>
								</view>
							</view>
						</view>
						<view class="order" v-for="(res, front) in wholesale" :key="res.id">
							<view class="top">
								<view class="left">
									<u-icon name="account" :size="40" color="rgb(94,94,94)"></u-icon>
									<view class="store">{{ res.consumer }}</view>
								</view>
								<view class="right">{{ res.createTime }}</view>
							</view>
							<view class="item" v-for="(item, index) in res.saleDetails" :key="item.id" @click="productInfo(res.saleDetails[index])">
								<view class="left">
									<!-- <image style="width: 90px; height: 90px;" :src="ip+item.imgUrl" :lazy-load="true" mode="aspectFill"></image> -->
									<u-image :border-radius="18" width="90px" height="90px" :src="ip+item.imgUrl" mode="aspectFill">
										<u-loading slot="loading"></u-loading>
										<view slot="error" style="font-size: 24rpx;">加载失败</view>
									</u-image>
								</view>
								<view class="midRight">
									<view class="content">
										<view class="title u-line-2">{{ item.pdName }}</view>
										<view class="unit">规格：{{item.unit}}</view>
										<view class="type" :class="[item.type == '水稻' ? 'rice' : item.type == '玉米' ? 'corn' :  item.type == '农药' ? 'pesticide' : item.type == '肥料' ? 'fertilizer':'peanut']" >{{ item.type }}</view>
									</view>
									<view class="right">
										<view class="price">
											￥{{ priceInt(item.price) }}
											<text class="decimal">.{{ priceDecimal(item.price) }}</text>
										</view>
										<view class="number">x{{ item.num }}</view>
									</view>
								</view>
							</view>
							<view style="display: flex;margin-top: 20rpx;">
								<view style="width: 30%;padding: 0 20rpx;" @click="showRemark(res)">
									<view class="tag" :class="[res.payType == '未支付'?'noPay':res.payType == '部分已付'?'somePay':'hasPay']">{{res.payType}}</view>
								</view>
								<view class="total" style="width: 70%;">
									共
									<text class="total-price">{{ totalNum(res.saleDetails) }}</text>
									种类型 合计:
									<text class="total-price">
										￥{{ priceInt(res.totalPrice) }}.
										<text class="decimal">{{ priceDecimal(res.totalPrice) }}</text>
									</text>
								</view>
							</view>
							<view class="bottom">
								联系电话：
								<text @click="phoneCall(res.phone)">{{res.phone}}</text>
								<!-- <view class="more"><u-icon name="more-dot-fill" color="rgb(203,203,203)"></u-icon></view>
								<view class="logistics btn">查看物流</view>
								<view class="exchange btn">卖了换钱</view>
								<view class="evaluate btn">评价</view> -->
							</view>
						</view>
						<u-loadmore :status="loadStatus[2]" bgColor="#f2f2f2"></u-loadmore>
					</view>
				</scroll-view>
			</swiper-item>	
		</swiper>
		<u-modal width="90%" :async-close="true" :show-title="false" :show-cancel-button="true" 
		confirm-text="提交修改" cancel-text="返回" v-model="openModal" @confirm="submit" @cancel="doCancel">
			<view class="slot-content">
				<u-form :model="model" ref="uForm">
					<u-form-item  label="结算方式" prop="payType" label-width="130">
						<u-radio-group v-model="radio" @change="radioGroupChange">
							<u-radio shape="circle" v-model="item.checked" v-for="(item, index) in radioList" :key="index" :name="item.name">{{ item.name }}</u-radio>
						</u-radio-group>
					</u-form-item>
					<u-form-item :rightIconStyle="{color: '#888', fontSize: '28rpx'}" right-icon="edit-pen" label="记录" label-width="130" prop="record">
						<u-input :border="true" :clearable="false" placeholder="添加更改记录" v-model="model.record" @blur="onRecord" type="textarea" :height="33" :auto-height="true"></u-input>
					</u-form-item>
					<u-form-item label="备注:" label-width="130" prop="remark">
						<view style="line-height: 1.5;">{{remark}}</view>
					</u-form-item>
				</u-form>
			</view>
		</u-modal>
		<u-modal title="备注" v-model="submitModal" :content="remark" :mask-close-able="true" :show-confirm-button="false"></u-modal>
	</view>
</template>

<script>
	var that;
export default {
	data() {
		return {
			ip: this.$Request.config("APIHOST"),
			searchName:"",
			selectDate:"",
			orderList: [],
			wholesale: [],
			importList:[],
			openModal:false,
			submitModal:false,
			remark:'',
			record:'',
			calendar:false,
			orderLimit:0,
			saleLimit:0,
			importLimit:0,
			toOnShow:false,
			list: [{name:'进货记录'},{name: '发票记录'},{name: '批发记录'}],
			model:{
				id:'',
				payType:'',
				record:''
			},
			radioList: [
				{
					name: '未支付',
					checked: false
				},
				{
					name: '部分已付',
					checked: false
				},
				{	
					name:'已付清',
					checked:false
				}
			],
			radio:'',
			current: 0,
			swiperCurrent: 0,
			tabsHeight: 0,
			dx: 0,
			loadStatus: ['loadmore','loadmore','loadmore','loadmore'],
			inputStyle:{
				'backgroundColor': '#f2f2f2',
				'borderRadius': '100rpx'
			},
			searchBtnStyle:{
				//'margin': '80rpx auto',
				'width': '25%',
				'borderRadius': '32rpx',
				'lineHeight': '64rpx',
				'color': '#ffffff',
				'fontSize': '26rpx',
				'backgroundColor': '#2979ff'
			},
		};
	},
	onPullDownRefresh() {
		this.searchName="";
		this.selectDate="";
		setTimeout(function() {
			that.importList = [];
			that.importLimit = 0;
			that.getImportList();
			
			
			that.orderList = [];
			that.orderLimit = 0;
			that.getOrderList();
			
			that.saleLimit = 0;
			that.wholesale = [];
			that.getSaleList();
			
			
			uni.stopPullDownRefresh(); //停止下拉刷新动画
		}, 1000);
	},
	onLoad() {
		that = this;
		this.getImportList();
		
		setTimeout(() => {that.getOrderList();}, 50);
		setTimeout(() => {that.getSaleList();}, 100);
		
		setTimeout(() => {
			if(this.importList.length<5)
				this.loadStatus.splice(0,1,"nomore");
			
			if(this.orderList.length<5)
				this.loadStatus.splice(1,1,"nomore");
				
			if(this.wholesale.length<5)
				this.loadStatus.splice(2,1,"nomore");
				
		}, 200);
		
	},
	onShow() {
		//防止与onLoad加载冲突
		if(this.toOnShow){
			if (uni.getStorageSync('reloadOrders')) {
				that.orderList = [];
				that.orderLimit = 0;
				that.getOrderList();
				uni.removeStorageSync('reloadOrders');
			}
			if (uni.getStorageSync('reloadSales')) {
				that.saleLimit = 0;
				that.wholesale = [];
				that.getSaleList();
				uni.removeStorageSync('reloadSales');
			}
		}
		this.toOnShow = true;
	},
	
	computed: {

	},
	methods: {
		phoneCall(phoneNumber){
			if(isNaN(phoneNumber)) return
			uni.setClipboardData({
			    data: phoneNumber,
			    success: function () {
			        console.log("复制到剪切板")
			    }
			});
			uni.makePhoneCall({
			    phoneNumber: phoneNumber,
				success: (res) => {
					console.log("正在拨打电话....")
				},
				fail: (e) => {
					console.log("拨打失败")
				}
			});
		},
		toRemittance(res){
			uni.navigateTo({
				url: '../orders/remittance?id='+res.id
			})
		},
		onSearch(e){
			this.searchName = e;
		},
		search(){
			switch(this.swiperCurrent){
				case 0:
					this.importLimit = 0;
					this.importList = [];
					setTimeout(() => {that.getImportList();}, 200);
				break;
				case 1:
					this.orderLimit = 0;
					this.orderList = [];
					setTimeout(() => {that.getOrderList();}, 200);
				break;
				case 2:
					this.saleLimit = 0;
					this.wholesale = [];
					setTimeout(() => {that.getSaleList();}, 200);
				break;
			}
			
		},
		doCancel(){
			this.model.record = ""
		},
		submit(){
			this.changePayType()
		},
		onRecord(e){
			this.model.record = e;
		},
		radioGroupChange(e) {
			this.model.payType = e;
		},
		showRemark(sale){
			if(sale.payType == '已付清'){
				this.remark = sale.remark?sale.remark:'暂无'
				this.submitModal = true;
				return
			}
			this.model.id = sale.id;
			this.model.payType = sale.payType;
			if(sale.record)
				this.model.record = sale.record;
			this.radio = sale.payType;
			this.radioList.map(val=>{
				if(val.name == sale.payType)
					val.checked = true;
			})
			this.remark = sale.remark?sale.remark:'暂无'
			this.openModal = true ;
		},
		chooseDate(e){
			that.selectDate = e.result;
		},
		changePayType(){
			this.$Request.post("/changePayType", that.model).then(res => {
				if (res.status == 200) {
					this.$queue.showToast("提交成功！")
					that.wholesale = [];
					setTimeout(()=>{
						this.openModal = false;
						this.model.record = "";
						that.saleLimit = 0;
						that.getSaleList();
						},800)
				}
			});
		},
		//滑到底部加载更多
		reachBottom() {
			
			switch(this.swiperCurrent){
				case 0:
					if(this.importLimit*5>that.importList.length){
						this.loadStatus.splice(this.current,1,"nomore")
						return
					}
					setTimeout(() => {
						this.loadStatus.splice(this.current,1,"loading")
						setTimeout(() => {this.getImportList();}, 1200);
					}, 500);
				break;
				case 1:
					if(this.orderLimit*5>that.orderList.length){
						this.loadStatus.splice(this.current,1,"nomore")
						return
					}
					setTimeout(() => {
						this.loadStatus.splice(this.current,1,"loading")
						setTimeout(() => {this.getOrderList();}, 1200);
					}, 500);
				break;
				case 2:
				if(this.saleLimit*5>that.wholesale.length){
					this.loadStatus.splice(this.current,1,"nomore")
					return
				}
				setTimeout(() => {
					this.loadStatus.splice(this.current,1,"loading")
					setTimeout(() => {this.getSaleList();}, 1200);
				}, 500);
				break;
			}
		},
		getImportList() {
			this.$Request.getT('/getImportList/'+that.importLimit+'?searchName='+that.searchName+'&selectDate='+that.selectDate).then(res => {
				if (res.status == 200) {
					let dataList = res.data;
					if(dataList == null || dataList.length == 0){
						this.loadStatus.splice(this.current,1,"nomore")
						that.importLimit++;
						return;
					}
					dataList.map(val=>that.importList.push(val));
					that.loadStatus.splice(that.current,1,"loadmore")
					that.importLimit++;
				}else {
					this.$queue.showToast(res.msg);
				}
				
			})
		},
		// 发票记录
		getOrderList() {
			this.$Request.getT('/getOrders/'+that.orderLimit+'?searchName='+that.searchName+'&selectDate='+that.selectDate).then(res => {
				if (res.status == 200) {
					let dataList = res.data;
					if(dataList == null || dataList.length == 0){
						this.loadStatus.splice(this.current,1,"nomore")
						that.orderLimit++;
						return;
					}
					dataList.map(val=>that.orderList.push(val));
					that.loadStatus.splice(that.current,1,"loadmore")
					that.orderLimit++;
				}else {
					this.$queue.showToast(res.msg);
				}
				
			})
		},
		// 批发记录
		getSaleList() {
			this.$Request.getT('/getSales/'+that.saleLimit+'?searchName='+that.searchName+'&selectDate='+that.selectDate).then(res => {
				if (res.status == 200) {
					let dataList = res.data;
					if(dataList == null || dataList.length == 0){
						this.loadStatus.splice(this.current,1,"nomore")
						that.saleLimit++;
						return;
					}
					dataList.map(val=>that.wholesale.push(val));
					that.loadStatus.splice(that.current,1,"loadmore")
					that.saleLimit++;
				}else {
					this.$queue.showToast(res.msg);
				}
				
			})
		},
		productInfo(item) {
			uni.navigateTo({
				url: '../front/productInfo?id=' + item.productId
			})
		},
		
		totalNum(item) {
			if(item)
				return item.length;
			else
				return 0;
		},
		// 价格小数
		priceDecimal(val) {
			if (val !== parseInt(val)){
				val = val.toString()
				return val.slice(-2);
			}
			else 
				return '00';
		},
		// 价格整数
		priceInt(val) {
			if (val !== parseInt(val)){
				val = val.toString()
				return val.split('.')[0];
			}
			else 
				return val;
		},
		// tab栏切换
		change(index) {
			this.swiperCurrent = index;
		},
		transition({ detail: { dx } }) {
			this.$refs.tabs.setDx(dx);
		},
		animationfinish({ detail: { current } }) {
			this.$refs.tabs.setFinishCurrent(current);
			this.swiperCurrent = current;
			this.current = current;
		}
	}
};
</script>

<style>
/* #ifndef H5 */
page {
	height: 100%;
	background-color: #f2f2f2;
}
/* #endif */
</style>

<style lang="scss" scoped>
.slot-content {
	//font-size: 28rpx;
	//color: $u-content-color;
	padding: 30rpx 30rpx 0 30rpx;
}
.midRight{
	position: relative;
	width: 75%;
}
.order {
	width: 710rpx;
	background-color: #ffffff;
	margin: 20rpx auto;
	border-radius: 20rpx;
	box-sizing: border-box;
	padding: 20rpx;
	font-size: 28rpx;
	.top {
		display: flex;
		justify-content: space-between;
		.left {
			display: flex;
			align-items: center;
			.store {
				margin: 0 10rpx;
				font-size: 38rpx;
				font-weight: bold;
			}
		}
		.right {
			line-height: 2;
			color: #2979ff;
		}
	}
	.item {
		display: flex;
		margin: 20rpx 0 0;
		padding: 0 20rpx;
		.left {
			width: 30%;
			margin-right: 4%;
			// padding-right: 20rpx;
			image {
				width: 200rpx;
				height: 200rpx;
				border-radius: 10rpx;
			}
		}
		.content {
			position: absolute;
			top: 0;
			bottom: 0;
			right: 0;
			left: 0;
			height: 90%;
			margin: auto 0;
			
			.title {
				margin-bottom: 3%;
				font-size: 32rpx;
			}
			.unit{
				font-size: 26rpx;
				color: $u-tips-color;
			}
			.type {
				line-height: 1;
				padding: 2rpx 12rpx;
				align-items: center;
				border-radius: 50rpx;
				font-size: 26rpx;
				width: 80rpx;
				margin-top: 3%;
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
			.delivery-time {
				color: #e5d001;
				font-size: 26rpx;
			}
		}
		.right {
			position: absolute;
			top: 0;
			bottom: 0;
			right: 0;
			left: 0;
			height: 90%;
			margin: auto 0;			
			margin-left: 10rpx;
			text-align: right;
			.price{
				margin-bottom: 10rpx;
				font-size: 32rpx;
			}
			.decimal {
				font-size: 30rpx;
				margin-top: 4rpx;
			}
			.number {
				color: $u-tips-color;
				margin: 10rpx 0;
				font-size: 30rpx;
			}
		}
	}
	.total {
		text-align: right;
		font-size: 30rpx;
		padding: 0 20rpx;
		color: $u-tips-color;
		.total-price {
			color: #f01414;
			font-size: 32rpx;
		}
	}
	.bottom {
		display: flex;
		margin-top: 40rpx;
		padding: 0 10rpx;
		justify-content: space-between;
		align-items: center;
		justify-content: left;
		font-size: 30rpx;
		color: #2979ff;
		.btn {
			line-height: 52rpx;
			width: 160rpx;
			border-radius: 26rpx;
			border: 2rpx solid $u-border-color;
			font-size: 26rpx;
			text-align: center;
			color: $u-type-info-dark;
		}
		.evaluate {
			color: $u-type-warning-dark;
			border-color: $u-type-warning-dark;
		}
	}
}
.centre {
	text-align: center;
	margin: 200rpx auto;
	font-size: 32rpx;
	image {
		width: 164rpx;
		height: 164rpx;
		border-radius: 50%;
		margin-bottom: 20rpx;
	}
	.tips {
		font-size: 24rpx;
		color: #999999;
		margin-top: 20rpx;
	}
	.btn {
		margin: 80rpx auto;
		width: 200rpx;
		border-radius: 32rpx;
		line-height: 64rpx;
		color: #aa00ff;
		font-size: 26rpx;
		background: linear-gradient(270deg, rgba(249, 116, 90, 1) 0%, rgba(255, 158, 1, 1) 100%);
	}
}
.demo-layout{
	text-align: center;
	padding: 5px 3px;
	height: 65rpx;
	font-size: 30rpx;
}
.layout-title{
	border: solid 1px #e4e7ed;
	color: #303133;
	font-weight: bold;
	background-color: #f5f6f8;
}
.layout-content{
	border-bottom: solid 1px #e4e7ed;
	border-right: solid 1px #e4e7ed;
	border-left: solid 1px #e4e7ed;
	
}
.wrap {
	display: flex;
	flex-direction: column;
	height: calc(100vh - var(--window-top));
	width: 100%;
}
.swiper-box {
	flex: 1;
}
.swiper-item {
	height: 100%;
}
.u-search-box {
	background: #ffffff;
	padding: 18rpx 30rpx;
}
.tag {
	border-radius:  0 100rpx 100rpx 0;
	font-size: 26rpx;
	padding: 12rpx 22rpx;
	box-sizing: border-box;
	align-items: center;
	//border-radius: 6rpx;
	display: table;
	line-height: 1;
}
.hasPay{
	background-color: $u-type-primary;
	color: #FFFFFF;
}
.noPay{
	background-color: $u-type-error;
	color: #FFFFFF;
}
.somePay{
	background-color: $u-type-warning;
	color: #FFFFFF;
}
.region{
	background-color: $u-type-info-light;
	color: $u-type-info;
	border: 1px solid $u-type-info-disabled;
	border-radius: 0 100rpx 100rpx 0;
	margin: auto 0 0 0;
}
</style>

