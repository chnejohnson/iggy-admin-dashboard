<template>
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container-fluid">

    <router-link to="/" class="navbar-brand">
      <a class="navbar-brand" href="#">Iggy Admin/Manager Dashboard</a>
    </router-link>


    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarColor01">

      <ul class="navbar-nav ms-auto">

        <li class="nav-item">
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#aboutModal">About</button>
        </li>

        <li v-if="isActivated" class="nav-item dropdown">
          <button 
						class="btn btn-primary dropdown-toggle network-dropdown" 
						data-bs-toggle="dropdown" type="button" 
						aria-haspopup="true" aria-expanded="false"
					>{{ getChainName(chainId) }}</button>

          <div class="dropdown-menu p-2 dropdown-menu-end set-cursor-pointer">
            <input 
              class="form-control mb-2" 
              placeholder="Find network"
              v-model="filterNetwork" 
            />

            <span 
              class="dropdown-item"
              v-for="networkName in getNetworks"
              :key="networkName"
              @click="changeNetwork(networkName)"
            >{{networkName}}</span>
          </div>
        </li>

        <li v-if="isActivated" class="nav-item dropdown">
          <button 
						class="btn btn-primary dropdown-toggle" 
						data-bs-toggle="dropdown" type="button" 
						aria-haspopup="true" aria-expanded="false"
					>
            {{ getDomainOrAddress }}
            <span v-if="userStore.getDomainSearchStatus" class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
          </button>

          <div class="dropdown-menu dropdown-menu-end set-cursor-pointer">
            
            <a :href="getBlockExplorerBaseUrl(chainId)+'/address/'+address" class="short-address" target="_blank">
              <span class="dropdown-item">
                {{ shortenAddress(address) }}
              </span>
            </a>
            
            <span class="dropdown-item" @click="disconnectWallet">Disconnect</span>
          </div>
        </li>

				<li class="nav-item">
					<button v-if="!isActivated" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#connectModal">Connect wallet</button>
				</li>

      </ul>

    </div>
  </div>
</nav>

<!-- About modal -->
<div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">About</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"></span>
        </button>
      </div>
      <div class="modal-body">
        <p>
          This is an app where managers of an Iggy-based chat or social network can manage their smart contracts.
        </p>

        <p>
          The contract owner has all the rights of a manager, plus the ability to add or remove managers.
        </p>
      </div>
    </div>
  </div>
</div>
<!-- END About modal -->
</template>

<script>
import { useBoard, useEthers, useWallet, shortenAddress } from 'vue-dapp';

import useChainHelpers from "../composables/useChainHelpers";
import { useUserStore } from '../store/user';

export default {
  name: "Navbar",

  data() {
    return {
      filterNetwork: null,
    }
  },

  computed: {
    getDomainOrAddress() {
      if (this.userStore.getDefaultDomain) {
        return this.userStore.getDefaultDomain;
      } else {
        return shortenAddress(this.address);
      }
    },

    getNetworks() {
      const networkNames = this.getSupportedChains();

      if (this.filterNetwork) {
        return networkNames.filter(item => item.includes(this.filterNetwork.toUpperCase())); //filtered
      }

      return networkNames;
    },
  },

  methods: {
    changeNetwork(networkName) {
      this.switchOrAddChain(window.ethereum, networkName);
    },

    disconnectWallet() {
      this.disconnect();
      window.localStorage.removeItem("connected");
    }
  },

  setup() {
    const { open } = useBoard();
		const { address, chainId, isActivated } = useEthers();
		const { disconnect } = useWallet();
		const { getBlockExplorerBaseUrl, getChainName, getSupportedChains, switchOrAddChain } = useChainHelpers();
    const userStore = useUserStore();

		return {
			address,
			chainId,
			disconnect,
      getBlockExplorerBaseUrl,
			getChainName,
			getSupportedChains,
			isActivated,
			open,
			shortenAddress,
			switchOrAddChain,
      userStore
		}
  },
}
</script>

<style scoped>
.network-dropdown {
  text-transform: lowercase;
}

.network-dropdown::first-letter {
  text-transform: uppercase;
}

.short-address {
  text-decoration: none;
}
</style>