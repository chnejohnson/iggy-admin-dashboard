<template>
  <div class="d-flex justify-content-center">
    <div class="card text-white bg-secondary default-card">
      <div class="card-body">
        <div class="text-center">
          <button class="btn btn-secondary text-uppercase mb-3">
            NFT Directory
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
  name: "NftDirectory",
  props: ['contractAddress'],

  /* 
  Contract code: https://github.com/iggy-social/iggy-contracts/blob/main/contracts/launchpad/erc721/NftDirectory.sol

  TODO:
  - addNftAddressToFeatured
  - removeNftAddressFromFeatured
  - addNftAddressToAll
  - removeNftAddressFromAllByIndex (in order to avoid removing the wrong NFT, first fetch the NFT that user wants to remove 
      via allNftContracts(index) call and show it in a modal, where user needs to confirm the removal)
  */
}
</script>