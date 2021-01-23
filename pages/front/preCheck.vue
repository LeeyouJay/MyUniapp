<template>
	<view class="wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
			<u-form-item label-width="150" :label-position="labelPosition" label="客户名称" prop="name">
				<u-input :border="border" placeholder="请输入客户姓名" v-model="model.name" type="text"></u-input>
			</u-form-item>
			<u-form-item :label-position="labelPosition" label="结算方式" prop="payType" label-width="150">
				<u-radio-group v-model="radio" @change="radioGroupChange">
					<u-radio shape="circle" v-model="item.checked" v-for="(item, index) in radioList" :key="index" :name="item.name">{{ item.name }}</u-radio>
				</u-radio-group>
			</u-form-item>
			<u-form-item :label-position="labelPosition" label="所在地区" prop="region" label-width="150">
				<u-input :border="border" type="select" :select-open="selectShow" v-model="model.region" placeholder="请选择商品类型"
				 @click="selectShow = true"></u-input>
			</u-form-item>
			<u-form-item :rightIconStyle="{color: '#888', fontSize: '32rpx'}" right-icon="kefu-ermai" :label-position="labelPosition"
			 label="联系方式" label-width="150" prop="phone">
				<u-input :border="border" placeholder="请输入客户手机号" v-model="model.phone" type="number"></u-input>
			</u-form-item>
			<u-form-item :label-position="labelPosition" label="收银员" label-width="150" prop="checker">
				<u-input :border="border" placeholder="请输您的姓名" v-model="model.checker" type="text"></u-input>
			</u-form-item>
			<u-form-item :label-position="labelPosition" label="售后电话" label-width="150" >
				<u-input :border="border" placeholder="请输售后电话" v-model="model.support" type="number"></u-input>
			</u-form-item>
		</u-form>

		<u-divider></u-divider>
		<u-row gutter="16" >
			<u-col span="4">
				<view class="goods-list">
					品种名称
				</view>
			</u-col>
			<u-col span="4">
				<view class="goods-list">
					数量x单价
				</view>
			</u-col>
			<u-col span="4">
				<view class="goods-list">
					小计
				</view>
			</u-col>
		</u-row>
		<u-row gutter="16" v-for="(row,index) in selectGoods " :key="index">
			<u-col span="4">
				<view class="goods-list">
					{{row.pdName}}
				</view>
			</u-col>
			<u-col span="4">
				<view class="goods-list">
					{{row.value}}x{{row.price}}
				</view>
			</u-col>
			<u-col span="4">
				<view class="goods-list">
					{{row.price*row.value}}元
				</view>
			</u-col>
		</u-row>
		<u-row gutter="16">
			<u-col span="4">
				<view class="goods-list">
					合计：
				</view>
			</u-col>
			<u-col span="8">
				<view class="goods-list" style="margin-bottom: 30rpx;">
					{{totalPrice}}元
				</view>
			</u-col>
		</u-row>
		<view style="margin-bottom: 10%;">
			<u-button :ripple="true" type="primary" @click="submit" size="medium">提交</u-button>
			<view style="float: right;">
				<u-button :ripple="true" type="primary" :loading="isReceiptSend" :disabled="isReceiptSend" @click="toPrint" size="medium">打印</u-button>
			</view>
		</view>
		<u-select mode="single-column" :list="selectList" v-model="selectShow" @confirm="selectConfirm"></u-select>
		<u-modal v-model="openModal" content="请重新连接打印机!" confirm-text="去连接" :show-cancel-button="true" @confirm="toConnect" @cancel="doNothing"></u-modal>
		<u-modal v-model="submitModal" content="已打印成功!" confirm-text="提交" :show-cancel-button="true" @confirm="submit" @cancel="doNothing"></u-modal>
	</view>
</template>

<script>
	var that;
	var tsc = require("../../util/ble/tsc.js");
	var esc = require("../../util/ble/esc.js");
	var encode = require("../../util/ble/encoding.js");
	export default {
		data() {
			let that = this;
			return {
				remember:true,
				looptime: 0,
				currentTime: 1,
				lastData: 0,
				oneTimeData: 20,
				printNum: [],
				printerNum: 1,
				currentPrint: 1,
				isReceiptSend: false,
				isLabelSend: false,
				openModal: false,
				submitModal:false,
				totalPrice: 0,
				model: {
					name: '未填写',
					payType: '现金',
					region: '周鹿街',
					phone: '',
					checker: '',
					support:'18177150996'
				},
				selectList: [],
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
					payType: [{
						required: true,
						message: '请选择任意一种支付方式',
						trigger: 'change',
					}],
					region: [{
						required: true,
						message: '请选择地区',
						trigger: 'change',
					}],
					phone: [{
						validator: (rule, value, callback) => {
							if (value == "")
								return true;
							else
								return this.$u.test.mobile(value);
						},
						message: '手机号码不正确',
						trigger: ['blur'],
					}],
					checker: [{
							required: true,
							message: '请输入姓名',
							trigger: 'blur',
						},
						{
							validator: (rule, value, callback) => {
								uni.setStorageSync('checker', value);
								return this.$u.test.chinese(value);
							},
							message: '姓名必须为中文',
							trigger: ['change', 'blur'],
						}
					]
				},
				border: true,
				radioList: [{
						name: '现金',
						checked: true,
					},
					{
						name: '支付宝',
						checked: false,
					},
					{
						name: '微信',
						checked: false,
					}
				],
				radio: '现金',
				actionSheetShow: false,
				selectShow: false,
				labelPosition: 'left',
				codeTips: '',
				errorType: ['message'],
				selectGoods: [],
				goodsArray: [],
				Bluetooth: null
			};
		},
		onLoad(options) {
			that = this;
			that.getBluetooth();
			this.model.checker = uni.getStorageSync('checker');
			that.selectGoods = JSON.parse(options.data);
			that.totalPrice = options.totalPrice;
			that.getRegion();
			for (var i = 0; i < that.selectGoods.length; i++) {
				var good = {
					pdName: that.selectGoods[i].pdName,
					value: that.selectGoods[i].value,
					price: that.selectGoods[i].price,
					cost:that.selectGoods[i].cost,
					type:that.selectGoods[i].type,
				}
				that.goodsArray.push(good)
			}
			
		},
		onShow(){
			this.getBluetooth();
		},
		computed: {
			borderCurrent() {
				return this.border ? 0 : 1;
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			getBluetooth(){
				this.Bluetooth = uni.getStorageSync("Bluetooth");
			},
			toConnect() {
				uni.navigateTo({
					url: '../my/bleConnect'
				})
			},
			doNothing(){
				//什么都不做
			},
			getRegion(){
				this.$Request.getT('/region').then(res=>{
					if (res.status == 200) {
						var data = res.data;
						for (var i = 0; i < data.length; i++) {
							that.selectList.push({
								value:data[i],
								label:data[i]
							});
						}
					}
				})
			},
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						console.log('验证通过');
						var data = {
							consumer: that.model.name,
							payType: that.model.payType,
							region: that.model.region,
							phone: that.model.phone,
							checker: that.model.checker
						}
						that.addOrder(data, that.goodsArray);
					} else {
						console.log('验证失败');
					}
				});
			},
			// radio选择发生变化
			radioGroupChange(e) {
				this.model.payType = e;
			},
			// 选择商品类型回调
			selectConfirm(e) {
				this.model.region = '';
				e.map((val, index) => {
					this.model.region += this.model.region == '' ? val.label : '-' + val.label;
				})
			},
			addOrder(data, goodsArray) {
				this.$Request.post("/addOrder?consumer=" + data.consumer + "&payType=" + data.payType + "&region=" + data.region +
					"&phone=" + data.phone + "&checker=" + data.checker, goodsArray).then(res => {
					if (res.status == 200) {
						this.$queue.showToast("提交成功！")
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 前一个页面
						uni.setStorageSync('reloadOrders',true);
						setTimeout(function() {
							uni.navigateBack({
								success: function() {
									beforePage.$vm.clearFromBack(); 
								}
							})
						}, 1500)
					}
				});
			},
			toPrint(){
				this.$refs.uForm.validate(valid=>{
					if(valid)
						that.print();
					else
						console.log('验证不通过')
				})
			},
			print() {
				var that = this;
				var canvasWidth = 180
				var canvasHeight = 180
				Date.prototype.Format = function (fmt) { // author: meizz
				    var o = {
				        "M+": this.getMonth() + 1, // 月份
				        "d+": this.getDate(), // 日
				        "h+": this.getHours(), // 小时
				        "m+": this.getMinutes(), // 分
				        "s+": this.getSeconds(), // 秒
				        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
				        "S": this.getMilliseconds() // 毫秒
				    };
				    if (/(y+)/.test(fmt))
				        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
				    for (var k in o)
				        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
				            return fmt;
				}
				var time = new Date().Format("yyyy-MM-dd hh:mm:ss"); 
				console.log(that.Bluetooth);
				var command = esc.jpPrinter.createNew()
				command.init()
				// 标题
				command.bold(1); //加粗
				command.setFontSize(16); //字体大小
				command.setSelectJustification(1) //居中
				command.rowSpace(100);
				command.setText("周鹿种子销售中心");
				command.setPrint();
				command.rowSpace(60);

				command.bold(0); //取消加粗
				command.setFontSize(0); //正常字体
				//时间
				command.setSelectJustification(0); //居左
				command.setText("打印时间："+time);
				command.setPrint();
				//编号
				command.setSelectJustification(0); //居左
				command.setText("客户名称："+that.model.name);
				command.setPrint();
				
				command.setSelectJustification(0); //居左
				command.setText("所在地区："+that.model.region);
				command.setPrintAndFeed(80); //打印并走纸feed个单位
				//列表
				command.rowSpace(80); //间距
				command.bold(5); //加粗
				command.setText("品种");
				command.setAbsolutePrintPosition(100);
				command.setText("数量");
				command.setAbsolutePrintPosition(200);
				command.setText("单价");
				command.setAbsolutePrintPosition(270);
				command.setText("小计");
				command.setAbsolutePrintPosition(380);
				command.setPrint()
				var total = 0;
				for(let i = 0;i<that.selectGoods.length;i++){
					var good = that.selectGoods[i];
					total+=good.value;
					command.bold(0);
					command.setText(good.pdName);
					command.setAbsolutePrintPosition(140);
					command.setText(good.value);
					command.setAbsolutePrintPosition(200);
					command.setText(good.price);
					command.setAbsolutePrintPosition(270);
					command.setText(good.price*good.value+"元");
					command.setAbsolutePrintPosition(390);
					command.setPrint();
				}

				//合计
				command.bold(5); //加粗
				command.setAbsolutePrintPosition(50);
				command.setText("总数："+total);
				command.setAbsolutePrintPosition(200);
				command.setText("合计："+that.totalPrice+"元");
				command.setPrint();
				
				// 收银员
				command.rowSpace(120); //间距
				command.setText("收银："+that.model.checker);
				command.setPrint()

				//提示
				command.rowSpace(80); //间距
				command.bold(2); //加粗
				command.setSelectJustification(0); //左对齐
				// command.setText("售出商品购买后7天内,可凭小票退换");
				// command.setPrint();
				// command.setText("(注：吊牌未拆剪,商品未洗涤)");
				// command.setPrint();

				//电话
				command.setSelectJustification(0); //居左
				command.setText("售后电话:"+that.model.support);
				command.setPrint();
				command.setText("联系地址:马山县周鹿镇中心街桥头路交汇处");
				command.setPrint();

				command.setPrintAndFeedRow(3);

				that.isReceiptSend = true;
				that.prepareSend(command.getData());
			},
			//准备发送，根据每次发送字节数来处理分包数量
			prepareSend(buff) {
				console.log(buff);
				let that = this
				let time = that.oneTimeData
				let looptime = parseInt(buff.length / time);
				let lastData = parseInt(buff.length % time);
				console.log(looptime + "---" + lastData)
				this.looptime = looptime + 1;
				this.lastData = lastData;
				this.currentTime = 1;
				that.Send(buff)
			},
			//分包发送
			Send(buff) {
				let that = this
				let {
					currentTime,
					looptime: loopTime,
					lastData,
					oneTimeData: onTimeData,
					printerNum: printNum,
					currentPrint
				} = that;
				let buf;
				let dataView;
				if (currentTime < loopTime) {
					buf = new ArrayBuffer(onTimeData)
					dataView = new DataView(buf)
					for (var i = 0; i < onTimeData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
					}
				} else {
					buf = new ArrayBuffer(lastData)
					dataView = new DataView(buf)
					for (var i = 0; i < lastData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
					}
				}
				console.log("第" + currentTime + "次发送数据大小为：" + buf.byteLength)
				let {
					BLEInformation
				} = that.Bluetooth;
				console.log(BLEInformation);
				if(BLEInformation==undefined || BLEInformation.deviceId==undefined){
					that.isReceiptSend = false;
					that.openModal = true;
					return
				}
				uni.writeBLECharacteristicValue({
					deviceId: BLEInformation.deviceId,
					serviceId: BLEInformation.writeServiceId,
					characteristicId: BLEInformation.writeCharaterId,
					value: buf,
					success: function(res) {
						console.log("打印成功！")
						console.log(res)
						// if(res.code ==0){
							currentTime++
							if (currentTime <= loopTime) {
								that.currentTime = currentTime;
								that.Send(buff)
							} else {
								if (currentPrint == printNum) {
									that.looptime = 0;
									that.lastData = 0;
									that.currentTime = 1;
									that.isReceiptSend = false;
									that.isLabelSend = false;
									that.currentPrint = 1;
									that.submitModal = true;
									that.isReceiptSend = false;
								} else {//以下为打印多张时循环
									currentPrint++;
									that.currentPrint = currentPrint;
									that.currentTime = 1;
									that.Send(buff)
								}
							}
						// }else{
						// 	console.log(res.errCode)
						// 	console.log("打印出现异常！请查看打印机状态")
						// 	//this.$queue.showToast("打印出现异常！请查看打印机状态")
						// }
					},
					fail: function(e) {
						console.log("打印失败！")
						console.log(e)
						that.isReceiptSend = false;
						that.openModal = true;
						return;
					}
				})
			},
		}

	};
</script>

<style scoped lang="scss">
	.wrap {
		padding: 30rpx;
	}

	.u-row {
		margin: 40rpx 0;
	}

	.goods-list {
		margin-top: 30rpx !important;
		font-size: 20px;
		margin-top: 2px;
		text-align: center;
	}
</style>
