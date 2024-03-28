<template>
	<IggyPostNftChangeTextPreviewLength :contractAddress="contractAddress" />
	<IggyPostNftChangeDefaultPrice :contractAddress="contractAddress" />
	<!-- <IggyPostNftChangeTextPreview :contractAddress="contractAddress" /> -->
	<!-- <IggyPostNftChangeImage :contractAddress="contractAddress" /> -->
</template>

<script>
import IggyPostNftChangeTextPreviewLength from './post-nft/ChangeTextPreviewLength.vue'
import IggyPostNftChangeDefaultPrice from './post-nft/ChangeDefaultPrice.vue'
import IggyPostNftChangeTextPreview from './post-nft/ChangeTextPreview.vue'
import IggyPostNftChangeImage from './post-nft/ChangeImage.vue'

export default {
	name: 'IggyPostNft1155',
	props: ['contractAddress'],

	components: {
		IggyPostNftChangeTextPreviewLength,
		IggyPostNftChangeDefaultPrice,
		IggyPostNftChangeTextPreview,
		IggyPostNftChangeImage,
	},

	/* 
  Contract code: https://github.com/iggy-social/iggy-contracts/blob/main/contracts/post/IggyPostNft1155.sol

  TODO:
  - ownerChangeDefaultPrice (change default price for minting a post. The value in contract is in wei, present it to user in ETH)
  - ownerChangeTextPreview (in case there is inappropiate content in the post text)
  - ownerChangeImage (in case there is an inappropiate image in the post)
  */
}
</script>
