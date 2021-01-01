<template>
	<view class="wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">

			<u-form-item label-width="150" label="品种名称" prop="pdName">
				<u-input  placeholder="请输入品种名称" v-model="model.pdName" :disabled="lockName"  maxlength =10 type="text"></u-input>
			</u-form-item>

			<u-form-item label="类型" prop="typeName" label-width="150">
				<u-input  type="select" :select-open="selectShow" v-model="model.type" placeholder="请选择类型" @click="selectShow = true"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="rmb" label="零售价" label-width="150"
			 prop="price">
				<u-input placeholder="请输入零售价格(元/包)" v-model="model.price" maxlength =10 type="digit"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="rmb" label="进货价" label-width="150"
			 prop="cost">
				<u-input  placeholder="请输入进货价格(元/包)" v-model="model.cost" maxlength =10 type="digit"></u-input>
			</u-form-item>

			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="car" label="库存(包)" label-width="150"
			 prop="num">
				<u-input  placeholder="请输入剩余库存数量" v-model="model.num" maxlength =10 type="digit"></u-input>
			</u-form-item>
			
			<u-form-item :rightIconStyle="{color: '#888', fontSize: '40rpx'}" right-icon="bookmark" label="规格" prop="unit" label-width="150">
				<u-input  placeholder="如:两斤/包" v-model="model.unit" maxlength =10 type="text"></u-input>
			</u-form-item>

			<u-form-item label="上传图片" prop="photo" label-width="150">
				<u-upload ref="uUpload" width="160" :max-count="1" :max-size="3 * 1024 * 1024" 
				:action="action" :auto-upload="autoUpload"  :header="header" :form-data="model" :before-upload="beforeUpload"
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
				ip: this.$Request.config("APIHOST"),
				loading:false,
				action: this.$Request.config("APIHOST") + '/addProduct',
				header: {
					'Content-Type': 'multipart/form-data',
					"Authorization": uni.getStorageSync('token')
				},
				img:'',
				productId:'',
				isEdit:false,
				autoUpload:false,
				lockName:false,
				model: {
					id:'',
					pdName: '',
					typeName:'',
					typeId: '',
					price: '',
					cost: '',
					num: '',
					unit:'',
					photo: '',
				},
				rules: {
					pdName: [{
						required: true,
						message: '请输入品种名称',
						trigger: ['change','blur'],
					}],
					type: [{
						required: true,
						message: '请选择类型',
						trigger: ['change','blur'],
					}],
					price: [{
							required: true,
							message: '请输入售价',
							trigger: ['change','blur'],
							type:'number'
						},
						// {
						// 	validator: (rule, value, callback) => {
						// 		return this.$u.test.number(value);
						// 	},
						// 	message: '请输入数字',
						// 	trigger: ['change','blur'],
						// }
					],
					cost: [{
							required: true,
							message: '请输入进价',
							trigger: ['change','blur'],
							type:'number'
						},
						// {
						// 	validator: (rule, value, callback) => {
						// 		return this.$u.test.number(value);
						// 	},
						// 	message: '请输入数字',
						// 	trigger: ['change','blur'],
						// }
					],
					num: [{
							required: true,
							message: '请输库存数量(包)',
							trigger: ['change','blur'],
							type:'number'
						},
						// {
						// 	validator: (rule, value, callback) => {
						// 		return this.$u.test.number(value);
						// 	},
						// 	message: '请输入数字',
						// 	trigger: ['change','blur'],
						// }
					],
					photo: [{
						required: true,
						message: '请添加品种图片',
						trigger: 'blur',
					}],
					unit:[{
						required: true,
						message: '请添加规格',
						trigger: ['change','blur'],
					}]
				},
				selectShow: false,
				selectList: [],
				errorType: ['message'],
			}
		},
		onLoad(option) {
			that = this;
			if(option.id){
				that.productId = option.id
				that.getProductInfo(that.productId)
				that.action = that.ip+'/addImg'
				that.isEdit = true;
				that.autoUpload = true;
			}
			that.getAllType();
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
			if(that.isEdit){
				setTimeout(function() {
					that.$refs.uUpload.lists.push({
								error:false,
								progress:0,
								url:that.img
							})
				}, 200)
			}
		},
		methods: {
			selectConfirm(e) {
				this.model.type = '';
				this.model.typeId = '';
				e.map((val, index) => {
					this.model.typeId = val.value
					this.model.type = val.label;
				})
			},
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						console.log('验证通过');
						that.loading = true;
						//添加模式
						if(!that.isEdit)
							this.$refs.uUpload.upload();
						else
							//编辑模式
							that.editProduct(that.model)
					} else {
						console.log('验证失败');
					}
				});
			},
			//选择图片时 
			choose(lists) {
				if (lists.length > 0){
					that.model.photo = 'done'
				}else
					that.model.photo = ''
			},
			//上传前
			beforeUpload(index, list) {
				if(!that.model.pdName){
					this.$queue.showToast('请先输入品种名称！');
					this.$refs.uUpload.clear()
					return false;
				}else
					return true
				
			},
			//提交成功回调
			uploadSuccess(data, index, lists) {
				if (data.status == 200) {
					uni.setStorageSync('reloadList',true);
					if(!that.isEdit)
						this.$queue.showToast("添加成功！")
					that.loading = false;
					that.lockName = true;
					if(!that.isEdit)
						setTimeout(function() {
							that.loading = false;
							uni.navigateBack({})
						}, 1500)
				} else{
					this.$queue.showToast(data.msg)
					that.$refs.uUpload.clear();
					that.model.photo = '';
					that.loading = false;
				}
					
			},
			//提交失败回调
			uploadFail(data, index, lists) {
				if (data.statusCode == 403) {
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}else{
					this.$queue.showToast("提交失败！")
					that.loading = false;
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
			},
			addProduct(product){
				this.$Request.post('/addProduct',product).then(res => {
					if (res.status == 200) {
						this.$queue.showToast("提交成功！")
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 前一个页面
						setTimeout(function() {
							uni.navigateBack({
								success: function() {
									beforePage.$vm.clearData(); 
								}
							})
						}, 1500)
					}
				})
			},
			
			
			//进入编辑时的方法
			getProductInfo(id){
				this.$Request.getT('/findById/' + id).then(res => {
					if (res.status == 200) {
						that.model.id = res.data.id;
						that.model.pdName = res.data.pdName;
						that.model.cost = res.data.cost;
						that.model.num = res.data.num;
						that.model.price = res.data.price;
						that.model.unit = res.data.unit;
						that.model.type = res.data.type;
						that.model.typeId = res.data.typeId;
						
						that.img = that.ip + res.data.img;
						
					} else
						this.$queue.showToast(res.msg);
				})
			},
			editProduct(product){
				this.$Request.post('/editProduct',product).then(res =>{
					if(res.status == 200){
						this.$queue.showToast("提交成功！")
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 前一个页面
						setTimeout(function() {
							uni.navigateBack({
								success: function() {
									beforePage.$vm.clearData();
								}
							})
						}, 1500)
					}else{
						that.loading = false;
						this.$queue.showToast(res.msg)
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
