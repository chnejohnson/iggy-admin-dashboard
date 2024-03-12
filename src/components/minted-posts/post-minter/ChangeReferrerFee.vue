<template>
  <div class="d-flex justify-content-center">
    <div class="card text-white bg-secondary default-card">
      <div class="card-body">
        <div class="text-center">
          <button class="btn btn-secondary text-uppercase mb-3">
            Change referrer's fee
          </button>
        </div>

        <p class="text-center">
          Current fee: {{ currentFeePercentage }}%
        </p>

        <div class="row">
          <div class="col-md-6 offset-md-3">
            <div class="input-group mb-3">
              <input type="text" class="form-control border border-white" v-model="newFeePercentage">
              <span class="input-group-text bg-primary">%</span>
            </div>
          </div>
        </div>

        <div class="text-center">
          <button @click="submit" class="btn btn-primary" :disabled="waiting || !newFeePercentage">
            <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Submit
          </button>
      </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";

import WaitingToast from "../../WaitingToast.vue";
import useChainHelpers from "../../../composables/useChainHelpers";

export default {
  name: "IggyPostMinterChangeReferrerFee",
  props: ['contractAddress'],

  data() {
    return {
      currentFeeBips: 0,
      newFeePercentage: 0,
      successMessage: "You have successfully changed the referrer's fee!",
      waiting: false
    }
  },

  mounted() {
    this.loadData();
  },

  computed: {
    currentFeePercentage() {
      return this.currentFeeBips / 100;
    }
  },

  methods: {
    async loadData() {
      this.waiting = true;

      // interface of the contract
      const contractInterface = new ethers.utils.Interface([
        "function referrerFee() external view returns (uint256)"
      ]);

      // contract instance
      const contract = new ethers.Contract(this.contractAddress, contractInterface, this.signer);

      try {
        this.currentFeeBips = await contract.referrerFee();
      } catch (e) {
        this.toast({
          title: "Error",
          message: "Failed to load referrer's fee",
          type: TYPE.ERROR
        });
      }

      this.waiting = false;
    },

    async submit() {
      this.waiting = true;

      const newFeeBips = Number(this.newFeePercentage) * 100;

      const contractInterface = new ethers.utils.Interface([
        "function changeReferrerFee(uint256 _fee) external"
      ]);

      const contract = new ethers.Contract(this.contractAddress, contractInterface, this.signer);

      try {
        const tx = await contract.changeReferrerFee(
          newFeeBips
        );
        
        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl(this.chainId)+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast(this.successMessage, {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl(this.chainId)+"/tx/"+tx.hash, '_blank').focus()
          });

          // TODO: add custom actions after successful transaction (if needed)
          this.currentFeeBips = newFeeBips;

          this.waiting = false;

        } else {
          this.toast.dismiss(toastWait);

          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl(this.chainId)+"/tx/"+tx.hash, '_blank').focus()
          });

          console.log(receipt);
          this.waiting = false;
        }
      } catch (e) {
        this.waiting = false;
        console.log(e);
        this.toast(e.message, {type: TYPE.ERROR});
      }
    }
  },

  setup() {
    const { chainId, isActivated, signer } = useEthers();
    const { getBlockExplorerBaseUrl } = useChainHelpers();
    const toast = useToast();

    return {
      chainId,
      getBlockExplorerBaseUrl,
      isActivated,
      signer,
      toast
    }
  },
}
</script>