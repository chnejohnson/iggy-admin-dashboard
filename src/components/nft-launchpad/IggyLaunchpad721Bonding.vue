<template>
  <div class="d-flex justify-content-center">
    <div class="card text-white bg-secondary default-card">
      <div class="card-body">
        <div class="text-center">
          <button class="btn btn-secondary text-uppercase mb-3">
            NFT Launchpad
          </button>
        </div>

        <p class="text-center">
          Component text
        </p>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IggyLaunchpad721Bonding",
  props: ['contractAddress'],

  /* 
  Contract code: https://github.com/iggy-social/iggy-contracts/blob/main/contracts/launchpad/erc721/IggyLaunchpad721Bonding.sol

  TODO:
  - setPrice
  - setStatsAddress
  - setMaxNftNameLength
  */
}
</script>