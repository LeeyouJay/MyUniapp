<template>
	<view class="u-wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
			<u-form-item label-width="150" :label-position="left" label="客户名称" prop="name">
				<u-input :border="border" placeholder="请输入客户姓名" v-model="model.name" type="text"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '32rpx'}" right-icon="kefu-ermai" :label-position="left"
			 label="联系方式" label-width="150" prop="phone">
				<u-input :border="border" placeholder="请输入客户手机号" v-model="model.phone" type="number"></u-input>
			</u-form-item>
			
			<u-form-item :label-position="left" label="结算方式" prop="payType" label-width="150">
				<u-radio-group v-model="radio" @change="radioGroupChange">
					<u-radio shape="circle" v-model="item.checked" v-for="(item, index) in radioList" :key="index" :name="item.name">{{ item.name }}</u-radio>
				</u-radio-group>
			</u-form-item>
			
		</u-form>
		<u-row gutter="16">
			<u-col span="3">
				<view class="demo-layout title">品种名称</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout title">数量(包)</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout title">批发单价</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout title">小计</view>
			</u-col>
		</u-row>
		<u-row gutter="16" v-for="(item, index) in products" :key="index">
			<u-col span="3">
				<view class="demo-layout context">{{item.pdName}}</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout " style="background: #FFFFFF;">
					<u-input v-model="item.num" type="digit" input-align="center"  placeholder="请输入数量" :clearable="false" :custom-style="inputStyle"/>
				</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout " style="background: #FFFFFF;">
					<input class="input" v-model="item.price" type="digit" :placeholder="'默认'+oldPrice[index]+'￥'" placeholder-style="color: #c0c4cc;" :auto-blur="true" @blur="setPrice(item,index)" />
					<!-- <u-input v-model="item.price" type="digit" input-align="center"  :placeholder="'默认'+oldPrice[index]+'￥'" :clearable="false" :custom-style="inputStyle"/> -->
				</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout context">{{totalCalculate(item)}}</view>
			</u-col>
		</u-row>
		<u-row gutter="16">
			<u-col span="3" offset="6">
				<view class="demo-layout sumTotal">合计：</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout sumTotal" style="color:#f01414;">￥{{sumPrice(products)}}</view>
			</u-col>
			<u-col span="3">
				<view class="blank"></view>
			</u-col>
		</u-row>
		<view style="margin-bottom: 10%;">
			<u-button :ripple="true" type="primary" @click="submit" size="medium">提交</u-button>
			<view style="float: right;">
				<u-button :ripple="true" type="primary" :loading="isReceiptSend" :disabled="isReceiptSend" @click="toPrint" size="medium">打印</u-button>
			</view>
		</view>
		<u-modal v-model="openModal" content="请重新连接打印机!" confirm-text="去连接" :show-cancel-button="true" @confirm="toConnect" @cancel="doNothing"></u-modal>
		<u-modal v-model="submitModal" content="已打印成功!" confirm-text="提交" :show-cancel-button="true" @confirm="submit" @cancel="doNothing"></u-modal>
		
	</view>
</template>

<script>
	var that
	export default {
		data() {
			return {
				products: [],
				isReceiptSend: false,
				totalPrice:0,
				oldPrice:[],
				inputStyle:{
					'backgroundColor': '#f2f2f2',
					//'borderRadius': '100rpx'
					'border': '1px solid #f2f2f2'
				},
				model: {
					name: '',
					payType: '银行转账',
					phone: '',
				},
				rules: {
					name: [{
							required: true,
							message: '请输入姓名',
							trigger: 'blur',
						},
						{
							validator: (rule, value, callback) => {
								return this.$u.test.chinese(value);
							},
							message: '姓名必须为中文',
							trigger: ['change', 'blur'],
						}
					],
					phone: [{
						validator: (rule, value, callback) => {
							if (value == "")
								return true;
							else
								return this.$u.test.mobile(value);
						},
						message: '手机号码不正确',
						trigger: ['blur'],
					}]
				},
				radioList: [{
						name: '银行转账',
						checked: true,
					},
					{
						name: '支付宝',
						checked: false,
					},
					{
						name: '微信',
						checked: false,
					},
					{
						name: '未支付',
						checked: false,
					}
				],
				radio:'银行转账',
				errorType: ['message'],
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad(option) {
			that = this
			var ids = JSON.parse(option.data);
			this.getByIds(ids)
		},
		onPullDownRefresh() {
			setTimeout(function() {

				uni.stopPullDownRefresh(); //停止下拉刷新动画
			}, 1000);
		},
		methods: {
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						if(that.products.some(val=> val.num ==0)){
							this.$queue.showToast("请输入批发数量！")
							
							console.log('验证失败');
							return
						}
						
						var data = {
							consumer: that.model.name,
							payType: that.model.payType,
							phone: that.model.phone,
							saleDetails:that.products
						}
						that.addSaleOrder(data);
					} else {
						console.log('验证失败');
					}
				});
			},
			addSaleOrder(data){
				this.$Request.post("/addSaleOrder", data).then(res => {
					if (res.status == 200) {
						this.$queue.showToast("提交成功！")
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 前一个页面
						uni.setStorageSync('reloadSales',true);
						setTimeout(function() {
							uni.navigateBack({
								success: function() {
									beforePage.$vm.clearFromBack(); 
								}
							})
						}, 1200)
					}
				});
			},
			radioGroupChange(e) {
				this.model.payType = e;
			},
			doNothing(){
				//什么都不做
			},
			getByIds(ids){
				this.$Request.post("/getByIds", ids).then(res => {
					if (res.status == 200) {
						that.products = res.data
						that.products.map(val=>{
							this.oldPrice.push(val.price)
							val.num=0;
							val.total=0;
						})
					}
				});
			},
			setPrice(item,index){
				if(item.price == 0){
					item.price = this.oldPrice[index];
				}
				return item.price;
			},
			
			totalCalculate(item){
				item.total = this.accMul(item.num,item.price);
				return item.total;
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
			sumPrice(products){
				var sum = products.reduce((prev, cur) =>{
				    return that.accAdd(cur.total, prev);
				},0);
				return sum;
			},
			
			toPrint(){
				// this.$refs.uForm.validate(valid=>{
				// 	if(valid)
				// 		that.print();
					
				// })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.u-wrap {
		height: calc(100vh);
		display: flex;
		flex-direction: column;
		 padding: 30rpx;
	}
	.demo-layout{
		text-align: center;
	    height: 70rpx;
	    border-radius: 10rpx;
	    margin-top: 15rpx;
		font-size: 30rpx;
		line-height: 2;
	}
	.title{
		background: #f2f2f2;
		font-weight: bold;
		font-size: 34rpx;
		line-height: 2;
	}
	.context{
		padding-top: 10rpx;
	}
	.sumTotal{
		font-weight: bold;
	}
	.blank{
		height: 70rpx;
	}
	.input{
		min-height: 38px;
		background-color: #f2f2f2;
		border: 1px solid #f2f2f2;
		text-align: center;
		font-size: 28rpx;
		color: #303133;
	}
</style>
