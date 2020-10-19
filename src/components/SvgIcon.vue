<template>
	<i class="svg-icon">
		<Icons :name="iconName" style="width:100%;height:100%;display:block"></Icons>
	</i>
</template>

<script>
    import Icons from 'vue-svg-icon/Icon.vue';
	export default {
        name:"Icon",
        components:{Icons},
		props: {
			name:{
				type: String,
				required: true
            }
		},
		computed: {
			iconName() {
				return `${this.name}`
            }
            
		}
	}
</script>

<style scoped>
.svg-icon {
	cursor: pointer;
	width: 20px;
	height: 20px;
	vertical-align: middle;
}
</style>
