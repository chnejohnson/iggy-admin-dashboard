<template>
  <IggyPostMinterChangeDaoFee :contractAddress="contractAddress" />

  <IggyPostMinterChangeReferrerFee :contractAddress="contractAddress" />
</template>

<script>
import IggyPostMinterChangeDaoFee from "./post-minter/ChangeDaoFee.vue"
import IggyPostMinterChangeReferrerFee from "./post-minter/ChangeReferrerFee.vue"

export default {
  name: "IggyPostMinter",
  props: ['contractAddress'],

  components: {
    IggyPostMinterChangeDaoFee,
    IggyPostMinterChangeReferrerFee
  }

  /* 
  Contract code: https://github.com/iggy-social/iggy-contracts/blob/main/contracts/post/IggyPostMinter.sol

  TODO:
  - changeStatsAddress
  */
}
</script>