<template>
	<view class="wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">

			<u-form-item label-width="150" label="品种名称" prop="pdName">
				<u-input  placeholder="请输入品种名称" v-model="model.pdName" type="text"></u-input>
			</u-form-item>

			<u-form-item label="类型" prop="typeName" label-width="150">
				<u-input  type="select" :select-open="selectShow" v-model="model.typeName" placeholder="请选择类型" @click="selectShow = true"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="rmb" label="零售价" label-width="150"
			 prop="price">
				<u-input placeholder="请输入零售价格(元/包)" v-model="model.price" type="digit"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="rmb" label="进货价" label-width="150"
			 prop="cost">
				<u-input  placeholder="请输入进货价格(元/包)" v-model="model.cost" type="digit"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="car" label="库存(包)" label-width="150"
			 prop="num">
				<u-input  placeholder="请输入剩余库存数量" v-model="model.num" type="digit"></u-input>
			</u-form-item>

			<u-form-item label="上传图片" prop="photo" label-width="150">
				<u-upload ref="uUpload" width="160" :max-count="1" :max-size="3 * 1024 * 1024" 
				:action="action" :auto-upload="false"  :header="header" :form-data="model" 
				@on-success="uploadSuccess" @on-error="uploadFail" @on-list-change="choose"></u-upload>
			</u-form-item>

		</u-form>
		<u-button :ripple="true" type="primary" @click="submit" size="default" :loading="loading">提交</u-button>
		<u-select mode="single-column" :list="selectList" v-model="selectShow" @confirm="selectConfirm"></u-select>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				loading:false,
				action: this.$Request.config("APIHOST") + '/addProduct',
				header: {
					'Content-Type': 'multipart/form-data',
					"Authorization": uni.getStorageSync('token')
				},
				model: {
					pdName: '',
					typeName:'',
					type: '',
					price: '',
					cost: '',
					num: '',
					photo: ''
				},
				rules: {
					pdName: [{
						required: true,
						message: '请输入品种名称',
						trigger: 'blur',
					}],
					type: [{
						required: true,
						message: '请选择类型',
						trigger: 'change',
					}],
					price: [{
							required: true,
							message: '请输入售价',
							trigger: 'blur',
						},
						{
							validator: (rule, value, callback) => {
								return this.$u.test.number(value);
							},
							message: '请输入数字',
							trigger: ['change'],
						}
					],
					cost: [{
							required: true,
							message: '请输入进价',
							trigger: 'blur',
						},
						{
							validator: (rule, value, callback) => {
								return this.$u.test.number(value);
							},
							message: '请输入数字',
							trigger: ['change', 'blur'],
						}
					],
					num: [{
							required: true,
							message: '请输库存数量(包)',
							trigger: 'blur',
						},
						{
							validator: (rule, value, callback) => {
								return this.$u.test.number(value);
							},
							message: '请输入数字',
							trigger: ['change'],
						}
					],
					photo: [{
						required: true,
						message: '请添加品种图片',
						trigger: ['blur'],
					}]
				},
				selectShow: false,
				selectList: [],
				errorType: ['message'],
			}
		},
		onLoad() {
			that = this;
			that.getAllType();
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		methods: {
			selectConfirm(e) {
				this.model.type = '';
				this.model.typeName = '';
				e.map((val, index) => {
					console.log(val)
					this.model.type = val.value
					this.model.typeName = val.label;
				})
			},
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						console.log('验证通过');
						that.loading = true;
						this.$refs.uUpload.upload();
					} else {
						console.log('验证失败');
					}
				});
			},
			//选择图片时 
			choose(lists) {
				if (lists.length > 0)
					that.model.photo = 'done'
				else
					that.model.photo = ''
			},
			//提交成功回调
			uploadSuccess(data, index, lists) {
				if (data.status == 200) {
					uni.setStorageSync('reloadList',true);
					this.$queue.showToast("添加成功！")
					setTimeout(function() {
						that.loading = false;
						uni.navigateBack({})
					}, 1500)
				} else{
					this.$queue.showToast(data.msg)
					setTimeout(function() {
						that.$refs.uUpload.clear();
						that.model.photo = '';
					}, 1000)
				}
					
			},
			//提交失败回调
			uploadFail(data, index, lists) {
				console.log(data)
				if (data.statusCode == 403) {
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}
			},
			getAllType(){
				this.$Request.getT('/getAllType').then(res => {
					if (res.status == 200) {
						for (var i = 0; i < res.data.length; i++) {
							var data = res.data[i]
							that.selectList.push({
								value:data.id,
								label:data.typeName
							})
						}
					} else if (res.status == 403) {
						uni.reLaunch({
							url: '/pages/login/login'
						})
					} else {
						this.$queue.showToast(res.msg);
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.wrap {
		padding: 30rpx;
	}

	.u-row {
		margin: 40rpx 0;
	}
</style>
