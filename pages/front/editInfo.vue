<template>
	<jinEdit placeholder="请输入内容" @editOk="editOk" :uploadFileUrl="action" :header="header" :formData="product" :html="product.characters"></jinEdit>
</template>

<script>
	var that;
	import jinEdit from '../../components/jin-edit/jin-edit.vue';
	export default {
		data() {
			return {
				header: {
					'Content-Type': 'multipart/form-data',
					"Authorization": uni.getStorageSync('token')
				},
				action: this.$Request.config("APIHOST") + '/addImg',
				product:{
					id:'',
					pdName:'',
					characters:''
				}
			}
		},
		components: {jinEdit},
		created() {
			
		},
		onLoad(option) {
			that = this;
			that.product.id = option.id;
			that.getProductInfo(that.product.id);
		},
		onReady() {
			
		},
		methods: {
			// 点击发布
			editOk(res) {
				//console.log(res);
				that.product.characters = res.html
				that.updateInfo(that.product);
			},
			//获取品种信息
			getProductInfo(id){
				this.$Request.getT('/findById/' + id).then(res => {
					if (res.status == 200) {
						that.product.pdName = res.data.pdName;
						that.product.characters = res.data.characters;
						//console.log("数据加载完成！")
					} else
						this.$queue.showToast(res.msg);
				})
			},
			//提交修改
			updateInfo(product){
				console.log(product);
				this.$Request.post('/updateInfo',product).then(res =>{
					if(res.status == 200){
						this.$queue.showToast("提交成功！")
						let pages = getCurrentPages(); // 当前页面
						let beforePage = pages[pages.length - 2]; // 前一个页面
						setTimeout(function() {
							uni.navigateBack({
								success: function() {
									beforePage.$vm.findById(that.product.id);
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
</style>
