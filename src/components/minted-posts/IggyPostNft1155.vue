<template>
  <IggyPostNftChangeTextPreviewLength :contractAddress="contractAddress" />
</template>

<script>
import IggyPostNftChangeTextPreviewLength from "./post-nft/ChangeTextPreviewLength.vue"

export default {
  name: "IggyPostNft1155",
  props: ['contractAddress'],

  components: {
    IggyPostNftChangeTextPreviewLength
  }

  /* 
  Contract code: https://github.com/iggy-social/iggy-contracts/blob/main/contracts/post/IggyPostNft1155.sol

  TODO:
  - ownerChangeDefaultPrice (change default price for minting a post. The value in contract is in wei, present it to user in ETH)
  - ownerChangeTextPreview (in case there is inappropiate content in the post text)
  - ownerChangeImage (in case there is an inappropiate image in the post)
  */
}
</script>