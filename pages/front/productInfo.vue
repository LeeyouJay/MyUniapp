<template>
	<view class="u-wrap" style="margin: 40rpx;">
		<view style="margin-bottom: 20rpx;">
			<u-image mode="aspectFit" width="100%" height="500rpx" :src="avatar" :border-radius="20" @click="preview">
				<u-loading slot="loading"></u-loading>
				<view slot="error" style="font-size: 24rpx;">加载失败</view>
			</u-image>
		</view>
		<u-divider>品种信息</u-divider>
		
		<u-swipe-action :show="show" :index="index" @click="click"  :options="options" :disabled = "!token">
		<view class="infoList">
			<view class="item" style="margin-top: 20rpx;">
				<view class="label">品种名称：</view>
				<view class="context">{{product.pdName}}</view>
			</view>
			<view class="item">
				<view class="label">生育期(天)：</view>
				<view class="context">{{product.periodMin}}-{{product.periodMax}}</view>
			</view>
			<view class="item">
				<view class="label">株高(cm)：</view>
				<view class="context">{{product.height}}</view>
			</view>
			<view class="item">
				<view class="label">亩产量(公斤)：</view>
				<view class="context">{{product.yield}}</view>
			</view>
		</view>
	</u-swipe-action>
		<u-divider>性状特征</u-divider>
		<view class="content">
			<u-parse :html="contents" :tag-style="style" ></u-parse>
			<view style="text-align: right;margin: 20rpx 0;" v-if="token">
				<u-button :ripple="true" type="primary" @click="toEdit(product)" size="medium">重新编辑</u-button>
			</view>
			<view style="height: 20rpx;"></view>
		</view>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				ip: this.$Request.config("APIHOST"),
				product: {
					pdName:'暂无此产品',
					periodMin:0,
					periodMax:0,
					height:0,
					yield:0
				},
				contents: '',
				avatar: '',
				show:false,
				style: {
					p: 'font-size:32rpx'
					
				},
				token:'',
				options: [
					{
						text: '修改',
						style: {
							backgroundColor: '#007aff'
						}
					}
				]
			}
			
		},
		onLoad(option) {
			that = this;
			var id = option.id;
			if(option.isFromShare)
				uni.removeStorageSync('token');
			this.token = uni.getStorageSync("token");
			that.findById(id);
		},
		onShareAppMessage() {
			return {
				title: that.product.pdName,
				path: 'pages/my/productInfo?id='+that.product.id+'&isFromShare='+true
			}
		},
		methods: {
			//预览图片
			preview(){
				let images = [that.avatar]
				uni.previewImage({
					urls:images,
					success: (res) => {
						this.$emit('on-preview', that.avatar,images);
					},
					fail: (e) => {
						console.log(e)
						uni.showToast({
							title: '预览图片失败',
							icon: 'none'
						});
					}
				});
			},
			
			click() {
				//console.log(that.product)
				uni.navigateTo({
					url: '../front/editBase?id=' + that.product.id+'&pdName='+that.product.pdName+'&min='+that.product.periodMin+'&max='+that.product.periodMax+
					'&height='+that.product.height+'&yield='+that.product.yield
				})
			},
			findById(id) {
				this.$Request.getT('/findById/' + id).then(res => {
					if (res.status == 200) {
						that.product = res.data
						that.contents = that.product.characters;
						that.avatar = that.ip + res.data.img;
					} else{
						that.avatar = that.ip+'/uploadimg/noPicture.jpg';
						this.$queue.showToast('找不到此产品！');
					}
				})
			},
			toEdit(product){
				uni.navigateTo({
					url: '../front/editInfo?id=' + product.id
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.u-wrap {
		height: calc(100vh);
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
		//display: flex;
		flex-direction: column;
	}

	.content {
		margin: 50rpx 0rpx;
		color: $u-content-color;
		font-size: 32rpx;
		line-height: 1.8;
	}

	.item {
		clear: both;
		margin-bottom: 20rpx;
	}

	.label {
		height: 40rpx;
		width: 195rpx;
		font-weight: 400;
		float: left;
		display: block;
		text-align: left;
	}

	.context {
		float: left;
	}
	.infoList{
		
	}
</style>
