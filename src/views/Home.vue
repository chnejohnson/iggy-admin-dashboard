<template>

  <!-- Search contract -->
  <div class="d-flex justify-content-center">
    <div class="card text-white bg-primary default-card">
      <div class="card-body text-center">

        <button
          v-if="!isActivated" 
          class="btn btn-primary" 
          type="button"
          data-bs-toggle="modal" 
          data-bs-target="#connectModal"
        >
          Connect wallet
        </button>

        <!-- Select network -->
        <button 
          v-if="isActivated" 
          class="btn btn-primary dropdown-toggle" 
          type="button" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          CHAIN: {{ getChainName(chainId) }}
        </button>
        
        <div class="dropdown-menu p-2 dropdown-menu-end">
          <div class="mb-3">
            <input 
              class="form-control mb-2" 
              placeholder="Find network"
              v-model="filterNetwork" 
            />

            <li>
              <button 
                class="dropdown-item" 
                type="button"
                v-for="networkName in getNetworks"
                :key="networkName"
                @click="changeNetwork(networkName)"
              >SWITCH TO {{ networkName }}</button>
            </li>
          </div>
        </div>
        <!-- END Select network -->

        <!-- Contract Address Input -->
        <div class="mt-4">
          <input 
            v-model="contractAddrOrDomain"
            class="form-control form-control-lg text-center"
            placeholder="Contract address or domain" 
            v-on:keyup.enter="loadData"
          >
        </div>
        <!-- END Contract Address Input -->

        <!-- Load button -->
        <button
          v-if="isActivated && !showSwitchChain"
          class="btn btn-lg btn-dark mt-4 mb-2"
          :disabled="waitingData"
          @click="loadData"
        >
          <span v-if="waitingData" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Load Data
        </button>
        <!-- END Load button -->

        <!-- Copy URL button -->
        <button
          v-if="isActivated && !showSwitchChain && getContractUrl && contractAddress && isCurrentUserManager"
          class="btn btn-lg btn-outline-light mt-4 mb-2 ms-2"
          @click="copyUrl"
        >
          Copy URL
        </button>
        <!-- END Copy URL button -->

        <!-- Switch network button -->
        <button
          v-if="isActivated && showSwitchChain"
          class="btn btn-lg btn-dark mt-4 mb-2"
          @click="changeNetwork(urlChainName)"
        >
          Switch to {{ urlChainName }}
        </button>
        <!-- END Switch network button -->

        <!-- Connect wallet button -->
        <button
          v-if="!isActivated"
          class="btn btn-lg btn-dark mt-4 mb-2"
          data-bs-toggle="modal" 
          data-bs-target="#connectModal"
        >
          Connect wallet
        </button>
        <!-- END Connect wallet button -->

        <div v-if="isCurrentUserManager || isCurrentUserOwner">
          <hr />

          <p v-if="isCurrentUserManager && !isCurrentUserOwner">You are a manager of this smart contract.</p>
          <p v-if="isCurrentUserOwner">You are the owner of this smart contract.</p>
        </div>

      </div>
    </div>
  </div>

  <!-- Managers list -->
  <ManagersList 
    v-if="contractAddress && (managers.length > 0 || isCurrentUserOwner)" 
    :key="managers.length" 
    :managers="managers" 
    :isCurrentUserOwner="isCurrentUserOwner" 
    :contractAddress="contractAddress" 
    @removeFromManagers="removeFromManagers"
  />

  <!-- Info -->
  <Info v-if="contractAddress && isCurrentUserManager" />
</template>

<script>
import Info from "../components/Info.vue";
import ManagersList from "../components/ManagersList.vue";
import WaitingToast from "../components/WaitingToast.vue";
import useChainHelpers from "../composables/useChainHelpers";
import useDomainHelpers from "../composables/useDomainHelpers";
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";

export default {
  name: "Home",

  data() {
    return {
      contractAddrOrDomain: null,
      isCurrentUserManager: false,
      isCurrentUserOwner: false,
      filterNetwork: null,
      contractAddress: null,
      managers: [],
      urlChain: null,
      waitingData: false
    }
  },

  components: {
    Info,
    ManagersList,
    WaitingToast
  },

  created() {
    // pass contract address through URL query (e.g. ?addr=0x123...abc, or ?id=0x123...abc)
    if (this.$route.query.addr) {
      this.contractAddrOrDomain = this.$route.query.addr;
    } else if (this.$route.query.id) {
      this.contractAddrOrDomain = this.$route.query.id;
    }

    if (this.$route.query.chain) {
      this.urlChain = this.$route.query.chain;
      this.urlChainName = this.getChainName(Number(this.urlChain));
    }
  },

  computed: {

    getContractUrl() {
      if (this.contractAddress && this.chainId) {
        return window.location.origin + "/?addr=" + this.contractAddress + "&chain=" + this.chainId;
      }

      return null;
    },

    getNetworks() {
      const networkNames = this.getSupportedChains();

      if (this.filterNetwork) {
        return networkNames.filter(item => item.includes(this.filterNetwork.toUpperCase())); //filtered
      }

      return networkNames;
    },

    showSwitchChain() {
      if (this.urlChain && this.chainId) {
        if (Number(this.urlChain) !== Number(this.chainId)) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {

    changeNetwork(networkName) {
      this.switchOrAddChain(window.ethereum, networkName);
    },

    copyUrl() {
      navigator.clipboard.writeText(this.getContractUrl);
      this.toast("Copied to clipboard.", {type: TYPE.SUCCESS});
    },

    async loadData() {
      // reset data
      this.managers = [];
      this.isCurrentUserManager = false;
      this.isCurrentUserOwner = false;
      this.contractAddress = null;

      try {
        this.waitingData = true;

        if (ethers.utils.isAddress(this.contractAddrOrDomain)) {
          this.contractAddress = this.contractAddrOrDomain;
        } else {
          this.contractAddress = await this.getDomainHolder(this.contractAddrOrDomain);
          
          if (!this.contractAddress || this.contractAddress === ethers.constants.AddressZero) {
            this.toast("This name does not have an owner.", {type: TYPE.ERROR});
            this.waitingData = false;
            return;
          }
        }

        // interface of the contract
        const contractInterface = new ethers.utils.Interface([
          "function owner() external view returns (address)",
          "function isManager(address) external view returns (bool)",
          "function getManagers() external view returns (address[] memory)"
        ]);

        // contract instance
        const contract = new ethers.Contract(this.contractAddress, contractInterface, this.signer);

        // check if current user is owner
        const owner = await contract.owner();
        this.isCurrentUserOwner = String(owner).toLowerCase() === String(this.address).toLowerCase();

        // if current user is not owner, check if current user is manager
        if (!this.isCurrentUserOwner) {
          this.isCurrentUserManager = await contract.isManager(this.address);
        } else {
          // if current user is owner, also mark it as manager
          this.isCurrentUserManager = true;
        }

        if (!this.isCurrentUserManager) {
          this.toast("You are not a manager or owner of this smart contract.", {type: TYPE.ERROR});
          this.waitingData = false;
          return;
        }

        // get managers
        const managers = await contract.getManagers();

        // parse managers
        for (let i = 0; i < managers.length; i++) {
          this.managers.push({
            address: managers[i]
          });
        }

        this.waitingData = false;
      } catch (error) {
        console.log(error);
        this.toast(error.message, {type: TYPE.ERROR});
        this.waitingData = false;
        return;
      }
    },

    removeFromManagers(index) {
      this.managers.splice(index, 1);
    },

  },

  setup() {
    const { address, balance, chainId, isActivated, signer } = useEthers();
    const { getBlockExplorerBaseUrl, getChainName, getSupportedChains, switchOrAddChain } = useChainHelpers();
    const toast = useToast();
    const { getDomainHolder } = useDomainHelpers();

    return { 
      address, balance, chainId, getDomainHolder, getBlockExplorerBaseUrl, getChainName, getSupportedChains, 
      isActivated, signer, switchOrAddChain, toast 
    }
  }

}
</script>
