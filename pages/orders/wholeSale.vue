<template>
	<view class="u-wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
			<u-form-item label-width="150" :label-position="left" label="客户名称" prop="name">
				<u-input :border="true" placeholder="请输入客户姓名" v-model="model.name" @blur="onName" type="text"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '32rpx'}" right-icon="phone" :label-position="left"
			 label="联系方式" label-width="150" prop="phone">
				<u-input :border="true" placeholder="请输入客户手机号" v-model="model.phone" type="number"></u-input>
			</u-form-item>
			
			<u-form-item :label-position="left" label="结算状态" prop="payType" label-width="150">
				<u-radio-group v-model="radio" @change="radioGroupChange">
					<u-radio shape="circle" v-model="item.checked" v-for="(item, index) in radioList" :key="index" :name="item.name">{{ item.name }}</u-radio>
				</u-radio-group>
			</u-form-item>
			<u-form-item :rightIconStyle="{color: '#888', fontSize: '32rpx'}" right-icon="edit-pen" :label-position="left"
			 label="备注" label-width="150" prop="remark">
				<u-input :border="true" placeholder="请输入详细备注" v-model="model.remark" @blur="onRemark" type="textarea" :height="50" :auto-height="true"></u-input>
			</u-form-item>
			
		</u-form>
		<u-row gutter="16">
			<u-col span="4">
				<view class="demo-layout title">品种名称</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout title">数量(包)</view>
			</u-col>
			<u-col span="2">
				<view class="demo-layout title">单价</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout title">小计</view>
			</u-col>
		</u-row>
		<u-row gutter="16" v-for="(item, index) in products" :key="index">
			<u-col span="4">
				<view class="demo-layout context">{{item.pdName}}</view>
			</u-col>
			<u-col span="3">
				<view class="demo-layout " style="background: #FFFFFF;">
					<input class="input" v-model="item.num" type="digit"
					:auto-blur="true" 
					placeholder="请输入数量" placeholder-style="color: #c0c4cc;" 
					@input="checkInput(item,false,$event)" />
					<!-- <u-input v-model="item.num" type="digit" input-align="center"  placeholder="请输入数量" :clearable="false" :custom-style="inputStyle"/> -->
				</view>
			</u-col>
			<u-col span="2">
				<view class="demo-layout " style="background: #FFFFFF;">
					<input class="input" v-model="item.price" type="digit" 
					:placeholder="oldPrice[index]+'￥'" placeholder-style="color: #c0c4cc;" 
					:auto-blur="true" 
					@input="checkInput(item,true,$event)"
					@blur="setPrice(item,index)" />
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
		<u-modal v-model="openModal" :content="contentMsg" confirm-text="去连接" :show-cancel-button="true" @confirm="toConnect" @cancel="doNothing"></u-modal>
		<u-modal v-model="submitModal" content="数据发送成功!" confirm-text="提交" :show-cancel-button="true" @confirm="submit" @cancel="doNothing"></u-modal>
		
	</view>
</template>

<script>
	var that;
	var tsc = require("../../util/ble/tsc.js");
	var esc = require("../../util/ble/esc.js");
	var encode = require("../../util/ble/encoding.js");
	export default {
		data() {
			return {
				products: [],
				isReceiptSend: false,
				totalPrice:0,
				oldPrice:[],
				Bluetooth:null,
				printTime:'',
				newDateFlag:true,
				looptime: 0,
				lastData: 0,
				currentTime: 1,
				oneTimeData: 20,
				printNum: [],
				printerNum: 1,
				currentPrint:1,
				contentMsg:'请重新连接打印机!',
				openModal:false,
				submitModal:false,
				inputStyle:{
					'backgroundColor': '#f2f2f2',
					//'borderRadius': '100rpx'
					'border': '1px solid #f2f2f2'
				},
				model: {
					name: '',
					payType: '未支付',
					phone: '',
					remark:''
				},
				rules: {
					name: [{
							required: true,
							message: '请输入姓名',
							trigger: 'blur',
						}
						// ,{
						// 	validator: (rule, value, callback) => {
						// 		return this.$u.test.chinese(value);
						// 	},
						// 	message: '姓名必须为中文',
						// 	trigger: ['change', 'blur'],
						// }
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
				radioList: [
					{
						name: '未支付',
						checked: true
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
				radio:'未支付',
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
			this.getBluetooth();
		},
		onShow() {
			this.getBluetooth();
		},
		methods: {
			onName(e){
				this.model.name = e;
			},
			onRemark(e){
				this.model.remark = e;
			},
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						if(that.newDateFlag){
							that.createTime();
						}
						if(that.products.some(val=> val.num ==0)){
							this.$queue.showToast("请输入批发数量！")
							console.log('验证失败');
							return
						}
						
						var data = {
							consumer: that.model.name,
							payType: that.model.payType,
							phone: that.model.phone,
							createTime : that.printTime,
							remark:that.model.remark,
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
									beforePage.$vm.reloadChooseGroup(true); 
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
							val.num="";
							val.total=0;
						})
					}
				});
			},
			checkInput(item,flag,e){
				var p = e.detail.value
				var re = /^[0-9]+.?[0-9]*/;
				　　if (!re.test(Number(p))) {
					p = p.substr(0,p.indexOf(".", p.indexOf(".") + 1));
						if(flag)
							this.$nextTick(() => {
								item.price = Number(p);
							})
						else
							this.$nextTick(() => {
								item.num = Number(p);
							})
				　　}else{
						if(flag)
							item.price = Number(p)
						else
							item.num = Number(p)
					}
			},
			setPrice(item,index){
				if(item.price == 0){
					item.price = this.oldPrice[index];
				}
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
			createTime(){
				var date = new Date();
				var year = date.getFullYear();
				var mon = date.getMonth() + 1;
				var da = date.getDate();
				var h = date.getHours();
				var m = date.getMinutes();
				var s = date.getSeconds();
				var str = year + '-' + mon + '-' + da +  ' ' + h + ':' + m + ':' + s;
				that.printTime = str
			},
			toConnect() {
				uni.navigateTo({
					url: '../my/bleConnect'
				})
			},
			getBluetooth(){
				this.Bluetooth = uni.getStorageSync("Bluetooth");
			},
			toPrint(){
				this.$refs.uForm.validate(valid=>{
					if(valid){
						if(that.products.some(val=> val.num ==0)){
							this.$queue.showToast("请输入批发数量！")
							console.log('验证失败');
							return
						}
						that.print();
						console.log('验证通过!')
					}else
						console.log('验证不通过')
				})
			},
			print() {
				var that = this;
				var canvasWidth = 180
				var canvasHeight = 180
				that.createTime(); 
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
				
				console.log(1);
				var command = esc.jpPrinter.createNew()
				command.init()
				// 标题
				command.bold(1); //加粗
				command.setFontSize(16); //字体大小
				command.setSelectJustification(1) //居中
				command.rowSpace(100);
				command.setText("周鹿种子销售中心");
				command.setPrint();
				command.rowSpace(80);
			
				command.bold(0); //取消加粗
				command.setFontSize(0); //正常字体
				//时间
				command.setSelectJustification(0); //居左
				command.setText("打印时间："+that.printTime);
				command.setPrint();
				//编号
				command.setSelectJustification(0); //居左
				command.setText("收货人："+that.model.name+" "+that.model.phone);
				command.setPrint();
				
				//列表
				command.rowSpace(80); //间距
				command.bold(5); //加粗
				command.setText("品种");
				command.setAbsolutePrintPosition(100);
				command.setText("数量(包)");
				command.setAbsolutePrintPosition(200);
				command.setText("单价");
				command.setAbsolutePrintPosition(270);
				command.setText("小计");
				command.setAbsolutePrintPosition(380);
				command.setPrint()
				var total = 0;
				for(let i = 0;i<that.products.length;i++){
					var good = that.products[i];
					var num = good.num;
					var numUnit = good.numUnit;
					total+=Math.ceil(num/numUnit)
					
					command.bold(0);
					command.setText(good.pdName);
					command.setAbsolutePrintPosition(140);
					command.setText(good.num);
					command.setAbsolutePrintPosition(200);
					command.setText(good.price);
					command.setAbsolutePrintPosition(270);
					command.setText(that.totalCalculate(good)+"元");
					command.setAbsolutePrintPosition(390);
					command.setPrint();
				}
			
				//合计
				command.bold(5); //加粗
				// command.setAbsolutePrintPosition(50);
				// command.setText("支付状态："+that.model.payType);
				command.setAbsolutePrintPosition(200);
				command.setText("合计："+that.sumPrice(that.products)+"元");
				command.setPrint();
				
				command.rowSpace(80)
				command.setAbsolutePrintPosition(0);
				command.setText("支付状态："+that.model.payType);
				command.setPrint()
				//备注
				//command.rowSpace(120); //间距
				command.setText("备注："+that.model.remark);
				command.setPrint()
			
				//提示
				command.rowSpace(80); //间距
				//command.bold(2); 
				//command.setSelectJustification(0); //左对齐
				// command.setText("售出商品购买后7天内,可凭小票退换");
				// command.setPrint();
				// command.setText("(注：吊牌未拆剪,商品未洗涤)");
				// command.setPrint();
			
				//电话
				command.setSelectJustification(0); //居左
				command.setText("联系电话:18177150996");
				command.setPrint();
				// command.setText("联系地址:马山县周鹿镇中心街桥头路交汇处");
				// command.setPrint();
				command.setText("确认签字：");
				command.setPrint();
				
				
				
			
				command.setPrintAndFeedRow(3);
			
				that.isReceiptSend = true;
				that.prepareSend(command.getData());
			},
			//准备发送，根据每次发送字节数来处理分包数量
			prepareSend(buff) {
				console.log(2);
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
					that.contentMsg = '无法获取蓝牙信息！'
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
						that.newDateFlag = false;
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
					},
					fail: function(e) {
						console.log("打印失败！")
						console.log(e)
						that.isReceiptSend = false;
						that.contentMsg ="打印失败!"+e.errCode
						that.openModal = true;
						return;
					}
				})
			},
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
		font-size: 28rpx;
		padding-top: 8rpx;
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
