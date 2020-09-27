export default {
	methods: {
        toast(text,variant){
            this.$bvToast.toast(text, {
                title: '提示',
                toaster: 'b-toaster-top-center',
                solid: true,
                variant,
                autoHideDelay:500
            })
       },
	}
}

