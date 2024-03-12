<template>
<!-- Add manager modal -->
<div class="modal fade" id="addManagerModal" tabindex="-1" aria-labelledby="addManagerModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add a new manager</h5>
        <button id="closeAddManagerModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div class="modal-body">
        <div class="mt-2">
          <input 
            v-model="newManagerAddress"
            class="form-control form-control-lg text-center"
            placeholder="Enter new manager's address"
          />
        </div>
        
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button @click="add" type="button" class="btn btn-primary" :disabled="waiting || !newManagerAddress">
          <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Submit
        </button>
      </div>
    </div>
  </div>
</div>
<!-- END Add manager modal -->
</template>
  
<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";

import WaitingToast from "../WaitingToast.vue";
import useChainHelpers from "../../composables/useChainHelpers";

export default {
  name: "AddManager",
  props: ['contractAddress'],
  emits: ['managerAdded'], // TODO: create an object { 0: address }

  data() {
    return {
      newManagerAddress: null,
      waiting: false,
    };
  },

  computed: {
    cleanAddress() {
      return String(this.newManagerAddress).trim();
    }
  },

  methods: {
    async add() {  
      this.waiting = true;
      
      const intfc = new ethers.utils.Interface([
        "function addManager(address manager_) external"
      ]);
      const contract = new ethers.Contract(this.contractAddress, intfc, this.signer);

      try {
        const tx = await contract.addManager(
          this.cleanAddress
        );
        
        const toastWait = this.toast(
          {
            component: WaitingToast, // @todo
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
          this.toast("You have successfully added a new manager!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl(this.chainId)+"/tx/"+tx.hash, '_blank').focus()
          });

          // update managers list (emit managerAdded event from AddManager.vue to Home.vue)
          this.$emit("managerAdded", {
            address: this.cleanAddress,
          });

          document.getElementById('closeAddManagerModal').click();

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
    },
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