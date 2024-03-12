<template>
	<Navbar />

	<router-view></router-view>

	<!-- Connect Wallet modal -->
	<div class="modal modal-sm fade" id="connectModal" tabindex="-1" aria-labelledby="connectModalLabel" aria-hidden="true">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Connect your wallet</h5>
					<button id="closeConnectModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
						<span aria-hidden="true"></span>
					</button>
				</div>
				<div class="modal-body row">

					<div class="card col-6 set-cursor-pointer" @click="connectMetaMask">
						<img src="./assets/img/wallets/rabby.png" class="card-img-top card-img-wallet" alt="Rabby">
						<small class="text-center mb-3 text-muted">Rabby</small>
					</div> 

					<div class="card col-6 set-cursor-pointer" @click="connectMetaMask">
						<img src="./assets/img/wallets/metamask.png" class="card-img-top card-img-wallet" alt="MetaMask">
						<small class="text-center mb-3 text-muted">MetaMask</small>
					</div>

					<div class="card col-6 set-cursor-pointer" @click="connectMetaMask">
						<img src="./assets/img/wallets/bifrost.png" class="card-img-top card-img-wallet" alt="Bifrost">
						<small class="text-center mb-3 text-muted">Bifrost</small>
					</div> 

					<div class="card col-6 set-cursor-pointer" @click="connectCoinbase">
						<img src="./assets/img/wallets/coinbase.png" class="card-img-top card-img-wallet" alt="Coinbase">
						<small class="text-center mb-3 text-muted">Coinbase Wallet</small>
					</div>

					<div class="card col-6 set-cursor-pointer" @click="connectMetaMask">
						<img src="./assets/img/wallets/brave.png" class="card-img-top card-img-wallet" alt="Brave">
						<small class="text-center mb-3 text-muted">Brave Wallet</small>
					</div>

					<div class="card col-6 set-cursor-pointer" @click="connectMetaMask">
						<img src="./assets/img/wallets/trust.png" class="card-img-top card-img-wallet" alt="Trust Wallet">
						<small class="text-center mb-3 text-muted">Trust Wallet</small>
					</div>

					<div class="card col-6 set-cursor-pointer" @click="connectMetaMask">
						<img src="./assets/img/wallets/imtoken.png" class="card-img-top card-img-wallet" alt="imToken">
						<small class="text-center mb-3 text-muted">imToken</small>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- END Connect Wallet modal -->
</template>

<script>
import Navbar from './components/Navbar.vue';
import { MetaMaskConnector, CoinbaseWalletConnector } from 'vue-dapp';
import { useEthers, useWallet } from 'vue-dapp';

export default {
  name: "App",

	components: {
		Navbar
	},

	created() {
		// if user already connected before, connect them automatically on the next visit
		if (!this.isActivated) {
			if (localStorage.getItem("connected") == "metamask") {
				this.connectMetaMask();
			} else if (localStorage.getItem("connected") == "coinbase") {
				this.connectCoinbase();
			}
		}
	},

	methods: {
		async connectCoinbase() {
			await this.connectWith(this.coinbaseConnector);
			localStorage.setItem("connected", "coinbase"); // store in local storage to autoconnect next time
			document.getElementById('closeConnectModal').click();
		},

		async connectMetaMask() {
			await this.connectWith(this.mmConnector);
			localStorage.setItem("connected", "metamask"); // store in local storage to autoconnect next time
			document.getElementById('closeConnectModal').click();
		}
	},

  setup() {
		const { address, chainId, isActivated } = useEthers();
		const { connectWith } = useWallet();

		const coinbaseConnector = new CoinbaseWalletConnector({
			appName: 'Iggy Admin/Manager Dashboard',
			jsonRpcUrl: "https://rpc.ankr.com/optimism",
		});

		const mmConnector = new MetaMaskConnector({
			appUrl: 'https://admin.iggy.social',
		});

		return {
			address,
			chainId,
			coinbaseConnector,
			connectWith,
			isActivated,
			mmConnector
		}
  }
}
</script>
