<template>
  <IggyPostMinterChangeDaoFee :contractAddress="contractAddress" />
</template>

<script>
import IggyPostMinterChangeDaoFee from "./post-minter/ChangeDaoFee.vue"

export default {
  name: "IggyPostMinter",
  props: ['contractAddress'],

  components: {
    IggyPostMinterChangeDaoFee
  }
}
</script>