<template>
	<view class="wrap">
		<u-form :model="model" :rules="rules" ref="uForm" :errorType="errorType">
			
			<u-form-item label-width="170" label="品种名称：" prop="pdName">
				<u-input  placeholder="请输入品种名称" v-model="model.pdName" maxlength =10 type="text"></u-input>
			</u-form-item>
			
			<u-form-item label-width="170" label="株高(cm)：" prop="height">
				<u-input  placeholder="请输入株高" v-model="model.height" maxlength =10 type="digit"></u-input>
			</u-form-item>
	
			<u-form-item label="亩产量(公斤)：" label-width="170" prop="yield">
				<u-input placeholder="请输入亩产量" v-model="model.yield" maxlength =10 type="digit"></u-input>
			</u-form-item>
	
			<u-form-item label="最小生育期(天)：" label-width="170" prop="periodMin">
				<u-input  placeholder="请输入最小天数" v-model="model.periodMin" maxlength =10 type="digit"></u-input>
			</u-form-item>
	
			<u-form-item label="最大生育期(天)：" label-width="170" prop="periodMax">
				<u-input  placeholder="请输入最大天数" v-model="model.periodMax" maxlength =10 type="digit"></u-input>
			</u-form-item>
	
		</u-form>
		<u-button :ripple="true" type="primary" @click="submit" size="default" >提交</u-button>
	</view>
</template>

<script>
	var that;
	export default {
		data(){
			return{
				model: {
					id:'',
					pdName:'',
					periodMin:'',
					periodMax:'',
					height:'',
					yield:''
				},
				rules:{
					pdName: [{
						required: true,
						message: '请输入品种名称',
						trigger: ['change','blur'],
					}],
					periodMin: [{
							required: true,
							message: '请输入数字',
							trigger: ['change','blur'],
							type:'number'
						}],
					periodMax: [{
							required: true,
							message: '请输入数字',
							trigger: ['change','blur'],
							type:'number'
						}],
					height: [{
							required: true,
							message: '请输入数字',
							trigger: ['change','blur'],
							type:'number'
						}],
					yield:[{
							required: true,
							message: '请输入数字',
							trigger: ['change','blur'],
							type:'number'
						}]
				},
				errorType: ['message'],
				
			}
		},
		onLoad(option) {
			that = this;
			that.model.id= option.id
			that.model.pdName = option.pdName
			that.model.periodMin = option.min
			that.model.periodMax  = option.max
			that.model.height = option.height
			that.model.yield = option.yield
		},
		onReady(option){
			this.$refs.uForm.setRules(this.rules);
		},
		methods:{
			submit(){
				this.$refs.uForm.validate(valid => {
					if (valid) {
						console.log('验证通过');
						that.editBase(that.model)
						
					} else {
						console.log('验证失败');
					}
				});
			},
			editBase(product){
				this.$Request.post('/updateBase',product).then(res =>{
					if(res.status == 200){
						this.$queue.showToast("提交成功！")
						let pages = getCurrentPages();
						let beforePage = pages[pages.length - 2]; 
						setTimeout(function() {
							uni.setStorageSync('reloadList',true);
							uni.navigateBack({
								success: function() {
									beforePage.$vm.findById(that.model.id)
									beforePage.$vm.show = true; 
									setTimeout(function(){
										beforePage.$vm.show = false; 
									},30)
								}
							})
						}, 1500)
					}else{
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
