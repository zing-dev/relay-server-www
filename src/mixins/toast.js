export default {
	methods: {
        toast(text,variant){
            this.$bvToast.toast(text, {
                title: '提示',
                solid: true,
                variant,
                autoHideDelay:500
            })
       },
	}
}

