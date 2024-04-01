<template>
	<div class="d-flex justify-content-center">
		<div class="card text-white bg-secondary default-card">
			<div class="card-body">
				<div class="text-center">
					<button class="btn btn-secondary text-uppercase mb-3">Change text preview</button>
				</div>

				<p class="text-center">Token ID</p>

				<div class="row">
					<div class="col-md-6 offset-md-3">
						<div class="input-group mb-3">
							<input type="number" class="form-control border border-white" v-model="tokenId" />
							<!-- <span class="input-group-text bg-primary"></span> -->
						</div>
					</div>
				</div>

				<div class="text-center mb-3">
					<button @click="loadData" class="btn btn-primary" :disabled="waiting || tokenId === null">
						<span
							v-if="waiting"
							class="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
						Load Data
					</button>
				</div>

				<div v-if="isPostLoaded && tokenId" class="text-center">
					<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changeTextPreviewModal">
						Change text preview
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ethers } from 'ethers'
import { useEthers } from 'vue-dapp'
import { useToast, TYPE } from 'vue-toastification'

import WaitingToast from '../../WaitingToast.vue'
import useChainHelpers from '../../../composables/useChainHelpers'

export default {
	name: 'IggyPostNftChangeTextPreview',
	props: ['contractAddress'],

	data() {
		return {
			tokenId: null,
			waiting: false,
			post: null,
		}
	},

	mounted() {},

	computed: {
		isPostLoaded() {
			return this.post !== null
		},
	},

	methods: {
		async loadData() {
			this.waiting = true

			// interface of the contract
			const contractInterface = new ethers.utils.Interface([
				'function getPost(uint256) public view returns (uint256,string,address,string,string,uint256)',
			])

			// contract instance
			const contract = new ethers.Contract(this.contractAddress, contractInterface, this.signer)

			try {
				const post = await contract.getPost(BigInt(this.tokenId))
				console.log('post', post)
				this.post = post
			} catch (e) {
				console.error(e)
				// this.toast({
				// 	title: 'Error',
				// 	message: 'Failed to load text preview',
				// 	type: TYPE.ERROR,
				// })
			}

			this.waiting = false
		},
	},

	setup() {
		const { chainId, isActivated, signer } = useEthers()
		const { getBlockExplorerBaseUrl } = useChainHelpers()
		const toast = useToast()

		return {
			chainId,
			getBlockExplorerBaseUrl,
			isActivated,
			signer,
			toast,
		}
	},
}
</script>
