<template>
	<div
		ref="modalRef"
		id="changeTextPreviewModal"
		class="modal fade"
		tabindex="-1"
		aria-labelledby="changeTextPreviewModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="changeTextPreviewModalLabel">Change Text Preview</h1>
					<button
						id="closeChangeTextPreviewModal"
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<p>Token ID: {{ tokenId }}</p>
					<p>Current Text Preview: {{ textPreview }}</p>

					<p>New Text Preview:</p>

					<div class="row">
						<div class="col-sm-6 mb-2">
							<div class="input-group flex-nowrap">
								<input
									type="text"
									class="form-control"
									v-model="newTextPreview"
									aria-describedby="addon-wrapping"
									:disabled="inputDisabled"
								/>
							</div>
						</div>
						<small>
							<em> Don't set the text over {{ maxTextPreviewLength }} text preview limit. </em>
						</small>
					</div>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

					<button
						type="button"
						class="btn btn-primary"
						:disabled="changeTextPreviewDisabled"
						@click="changeTextPreview"
					>
						<span
							v-if="loading"
							class="spinner-border spinner-border-sm mx-1"
							role="status"
							aria-hidden="true"
						></span>
						Submit
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import WaitingToast from '../../WaitingToast.vue'

export default {
	name: 'ChangeTextPreviewModal',
	props: ['contractAddress'],

	data() {
		return {
			textPreview: null,
			maxTextPreviewLength: null,
			newTextPreview: '',
			loading: false,
			inputDisabled: false,

			// modal open/close
			isModalOpen: false,
			observer: null,
		}
	},

	computed: {
		tokenId() {
			return this.$route.query.tokenId
		},
		changeTextPreviewDisabled() {
			if (this.loading) return true
			if (this.textPreview === this.newTextPreview) return true
			return false
		},
	},

	mounted() {
		// Noted that it mounted when the page is loaded even if the modal is not opened
		// create observer to watch for modal open/close
		this.observer = new MutationObserver(mutations => {
			for (const m of mutations) {
				const newValue = m.target.getAttribute(m.attributeName)
				this.$nextTick(() => {
					this.onModalOpen(newValue, m.oldValue)
				})
			}
		})

		this.observer.observe(this.$refs.modalRef, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class'],
		})
	},

	watch: {
		isModalOpen() {
			if (this.isModalOpen) {
				// when modal is opened
				if (!this.tokenId) {
					throw new Error('Cannot open modal without tokenId in query')
				}

				this.getTextPreview()
			} else {
				// when modal is closed
				this.$router.push({
					name: this.$route.name,
					query: { ...this.$route.query, tokenId: undefined },
				})
			}
		},
	},

	methods: {
		async getTextPreview() {
			if (this.isActivated) {
				this.inputDisabled = true

				try {
					const iface = new ethers.utils.Interface([
						'function getPost(uint256) public view returns (uint256,string,address,string,string,uint256)',
						'function maxTextPreviewLength() public view returns (uint256)',
					])

					const contract = new ethers.Contract(this.contractAddress, iface, this.signer)

					const post = await contract.getPost(BigInt(this.tokenId))
					const maxTextPreviewLength = await contract.maxTextPreviewLength()

					this.textPreview = post[3]
					this.newTextPreview = post[3]
					this.maxTextPreviewLength = Number(maxTextPreviewLength)
				} catch (err) {
					console.error('Failed to get text preview' + err)
					this.toast('Error: Failed to get text preview', {
						type: 'error',
					})
				} finally {
					this.inputDisabled = false
				}
			}
		},
		async changeTextPreview() {
			this.loading = true
			this.inputDisabled = true

			if (this.isActivated) {
				try {
					// check if the new text preview is over than the max length
					if (this.newTextPreview.length > this.maxTextPreviewLength) {
						throw new Error('Text preview is too long', { type: 'error' })
					}

					const iface = new ethers.utils.Interface([
						'function ownerChangeTextPreview(uint256 _tokenId, string memory _newTextPreview)',
					])
					const contract = new ethers.Contract(this.contractAddress, iface, this.signer)

					const tx = await contract.ownerChangeTextPreview(this.tokenId, this.newTextPreview)

					const toastWait = this.toast(
						{
							component: WaitingToast,
							props: {
								text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
							},
						},
						{
							type: 'info',
							onClick: () =>
								window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
						},
					)

					const receipt = await tx.wait()

					if (receipt.status === 1) {
						this.toast.dismiss(toastWait)
						this.toast('You have successfully changed your default post price!', {
							type: 'success',
							onClick: () =>
								window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
						})
						document.getElementById('closeChangeTextPreviewModal').click()
					} else {
						this.toast.dismiss(toastWait)
						this.toast('Transaction has failed.', {
							type: 'error',
							onClick: () =>
								window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
						})
						console.log(receipt)
					}
				} catch (e) {
					console.error('error: ' + e)
					this.toast('Error: ' + e, { type: 'error' })
					return
				} finally {
					this.getTextPreview() // update the value whenever tx is successful or not
					this.loading = false
					this.inputDisabled = false
				}
			}
		},
		onModalOpen(classAttrValue) {
			const classList = classAttrValue.split(' ')
			if (classList.includes('show')) {
				this.isModalOpen = true
			} else {
				this.isModalOpen = false
			}
		},
	},

	setup() {
		const { address, isActivated, signer } = useEthers()
		const toast = useToast()

		return { address, isActivated, signer, toast }
	},
}
</script>
