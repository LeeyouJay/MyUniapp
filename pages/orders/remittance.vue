<template>
	<view class="wrap">
		<u-form :model="model" ref="uForm" >
			<u-form-item label-width="150" label="负责人:" prop="name" :rightIconStyle="iconStyle" right-icon="account">
				<u-input :disabled="true" v-model="model.name"  type="text"></u-input>
			</u-form-item>
			<u-form-item label-width="150"  label="公司:" prop="company" :rightIconStyle="iconStyle" right-icon="home">
				<u-input :disabled="true" placeholder="暂无" v-model="model.company"  type="text"></u-input>
			</u-form-item>
			
			<u-form-item label="联系电话:" label-width="150" prop="phone" :rightIconStyle="iconStyle" right-icon="phone" >
				<u-input :disabled="true" placeholder="暂无" v-model="model.phone" type="number" @click="phoneCall(model.phone)"></u-input>
			</u-form-item>
			
			<u-form-item label-width="150"  label="总进货额:" prop="totalCost" :rightIconStyle="iconStyle" right-icon="rmb-circle">
				<u-input :disabled="true" v-model="model.totalCost"  type="text"></u-input>
			</u-form-item>
			<u-form-item label-width="150"  label="退货额:" prop="returnCost" :rightIconStyle="iconStyle" right-icon="rmb-circle">
				<u-input :disabled="true" v-model="model.returnCost"  type="text"></u-input>
			</u-form-item>
			<u-form-item label-width="150"  label="结余:" prop="debt" :rightIconStyle="iconStyle" right-icon="rmb-circle">
				<u-input :disabled="true" v-model="model.debt"  type="text"></u-input>
			</u-form-item>
		</u-form>
		<view style="margin-top: 30rpx;">
			<u-divider>结算明细</u-divider>
		</view>
		
		<view style="margin-top: 30rpx;">
			<u-table>
				<u-tr>
					<u-th>结算方式</u-th>
					<u-th>结算日期</u-th>
					<u-th>金额</u-th>
				</u-tr>
				<u-tr v-for="(item,index) in model.payRecords" :key="index">
					<u-td>{{item.payment}}</u-td>
					<u-td>{{item.payDate}}</u-td>
					<u-td>{{item.pay}}</u-td>
				</u-tr>
				<u-tr>
					<u-td></u-td>
					<u-td>合计：</u-td>
					<u-td>{{model.totalPay}}</u-td>
				</u-tr>
			</u-table>
		</view>
		
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				model:{
					name:'',
					principalId:'',
					company:'',
					phone:'',
					totalCost:0,
					totalPay:0,
					returnCost:0,
					debt:0,
					payRecords:[]
				},
				iconStyle:{
					color: '#888', 
					fontSize: '32rpx'
				}
			}
		},
		onLoad(option) {
			that = this;
			
			this.getByPcpId(option.id)
		},
		methods: {
			phoneCall(phoneNumber){
				if(phoneNumber=="" || isNaN(phoneNumber)) return
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
			getByPcpId(id){
				this.$Request.getT('/getRemittanceByPcpId/' + id).then(res => {
					if (res.status == 200) {
						that.model = res.data
					}
				})
			}
		}

	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 30rpx 50rpx 60rpx 50rpx;
	}
</style>
