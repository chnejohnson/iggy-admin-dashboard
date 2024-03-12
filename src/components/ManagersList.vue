<template>
<div>
  <div class="d-flex justify-content-center" v-if="isActivated">
    <div class="card text-white bg-secondary default-card">
      <div class="card-body">
        <div class="text-center">
          <button class="btn btn-secondary text-uppercase mb-3">
            Managers
          </button>
        </div>

        <p v-if="managers.length == 0" class="text-center">
          There are no managers yet.
        </p>

        <!-- Managers table -->
        <table class="table table-hover table-secondary table-borderless">
          <tbody>
            <tr>
              <th>#</th>
              <th>Manager address</th>
              <th v-if="isCurrentUserOwner">Actions</th>
            </tr>
            <tr v-for="(manager, index) in managers" :key="manager.address">
              <td>{{ index }}</td>
              <td>
                <a :href="getBlockExplorerBaseUrl(chainId)+'/address/'+manager.address" target="_blank" class="text-white text-break text-decoration-none">
                  {{ manager.address }}
                </a>
              </td>
              <td v-if="isCurrentUserOwner">
                <a 
                  class="text-white text-decoration-none" href="#" data-bs-toggle="modal" 
                  :data-bs-target="'#removeManagerModal'+index"
                >Remove</a>
              </td>

              <!-- Remove manager modal -->
              <div class="modal fade" :id="'removeManagerModal'+index" tabindex="-1" :aria-labelledby="'removeManagerModalLabel'+index" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">

                    <div class="modal-header">
                      <h5 class="modal-title">Remove manager</h5>
                      <button :id="'closeRemoveManagerModal'+index" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true"></span>
                      </button>
                    </div>

                    <div class="modal-body text-break">
                      <p>Remove {{ shortenAddress(manager.address) }} from the managers list?</p>
                    </div>

                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button @click="removeManagerByIndex(index)" type="button" class="btn btn-primary" :disabled="waitingRemove">
                        <span v-if="waitingRemove" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Remove manager
                      </button>
                    </div>

                  </div>
                </div>
              </div>
              <!-- END Remove manager modal -->
            </tr>
          </tbody>
        </table>

        <!-- Add manager button -->
        <div class="text-center" v-if="isCurrentUserOwner">
          <hr />

          <button 
            class="btn btn-primary text-uppercase mb-3"
            data-bs-toggle="modal" 
            data-bs-target="#addManagerModal"
          >
            Add manager
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add manager modal -->
  <AddManager @managerAdded="addToManagers" :contractAddress="contractAddress" />
</div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers, shortenAddress } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";

import WaitingToast from "./WaitingToast.vue";
import AddManager from './owner/AddManager.vue';
import useChainHelpers from "../composables/useChainHelpers";

export default {
  name: "ManagersList",
  props: ["contractAddress", "isCurrentUserOwner", "managers"],
  emits: ["removeFromManagers"],

  data() {
    return {
      waitingRemove: false
    }
  },

  components: {
    AddManager
  },

  methods: {
    addToManagers(manager) {
      this.managers.push(manager);
    },

    async removeManagerByIndex(index) { 
      this.waitingRemove = true;
      
      const intfc = new ethers.utils.Interface([
        "function removeManagerByIndex(uint256 index_) external"
      ]);
      const contract = new ethers.Contract(this.contractAddress, intfc, this.signer);

      try {
        const tx = await contract.removeManagerByIndex(index);
        
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
          this.toast("You have successfully removed a manager!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl(this.chainId)+"/tx/"+tx.hash, '_blank').focus()
          });

          // update managers list (emit removeFromManagers event)
          this.$emit("removeFromManagers", index);

          document.getElementById('closeRemoveManagerModal'+index).click();

          this.waitingRemove = false;

        } else {
          this.toast.dismiss(toastWait);

          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl(this.chainId)+"/tx/"+tx.hash, '_blank').focus()
          });

          console.log(receipt);
          this.waitingRemove = false;
        }
      } catch (e) {
        this.waitingRemove = false;
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
      shortenAddress,
      signer,
      toast
    }
  },
}
</script>

<style scoped>
.table {
  --bs-table-accent-bg: none;
}
</style>