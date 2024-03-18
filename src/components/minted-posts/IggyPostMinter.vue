<template>
	<IggyPostMinterChangeDaoFee :contractAddress="contractAddress" />
	<IggyPostMinterChangeReferrerFee :contractAddress="contractAddress" />
	<IggyPostMinterChangeStatsAddress :contractAddress="contractAddress" />
</template>

<script>
import IggyPostMinterChangeDaoFee from './post-minter/ChangeDaoFee.vue'
import IggyPostMinterChangeReferrerFee from './post-minter/ChangeReferrerFee.vue'
import IggyPostMinterChangeStatsAddress from './post-minter/ChangeStatsAddress.vue'

export default {
	name: 'IggyPostMinter',
	props: ['contractAddress'],

	components: {
		IggyPostMinterChangeDaoFee,
		IggyPostMinterChangeReferrerFee,
		IggyPostMinterChangeStatsAddress,
	},
}
</script>
