<template>
	<div class="d-flex justify-content-center">
		<div class="card text-white bg-secondary default-card">
			<div class="card-body">
				<div class="text-center">
					<button class="btn btn-secondary text-uppercase mb-3">Change image</button>
				</div>

				<p class="text-center">Token ID</p>

				<div class="row">
					<div class="col-md-6 offset-md-3">
						<div class="input-group mb-3">
							<input type="number" class="form-control border border-white" v-model="tokenId" />
						</div>
					</div>
				</div>

				<div class="text-center mb-3">
					<button @click="loadData" class="btn btn-primary" :disabled="!tokenId">
						<span
							v-if="waiting"
							class="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
						Load Image Url
					</button>

					<p v-if="isPostLoaded && !hasPost" class="mt-3">Post not found</p>
				</div>

				<!-- hidden -->
				<button
					id="openImageModal"
					class="d-none"
					data-bs-toggle="modal"
					data-bs-target="#changeImageModal"
				></button>
			</div>
		</div>
	</div>
</template>

<script>
import { ethers } from 'ethers'
import { useEthers } from 'vue-dapp'
import { useToast } from 'vue-toastification'

import useChainHelpers from '../../../composables/useChainHelpers'

// dev link http://localhost:5173/?addr=0x111C36B5B09D09Ee17bc351d43b91D8fD2A42901&contract=IggyPostNft1155

export default {
	name: 'IggyPostNftChangeImage',
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
		hasPost() {
			return this.isPostLoaded && Number(this.post[0]) !== 0
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
				this.post = post

				if (Number(this.post[0]) !== 0) {
					// has post
					this.$router.push({
						query: {
							...this.$route.query,
							tokenId: this.tokenId,
						},
					})
					// open modal
					document.getElementById('openImageModal').click()
				}
			} catch (e) {
				console.error(e)
				this.toast('Error: Failed to load image', {
					type: 'error',
				})
			} finally {
				this.waiting = false
			}
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
