<template>
	<div
		ref="modalRef"
		id="storedContractsModal"
		class="modal fade"
		tabindex="-1"
		aria-labelledby="storedContractsModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="storedContractsModalLabel">Select Stored Contracts</h1>
					<button
						id="closeStoredContractsModal"
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<div>hello</div>
				</div>

				<div class="modal-footer"></div>
			</div>
		</div>
	</div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import WaitingToast from './WaitingToast.vue'

export default {
	name: 'StoredContractsModal',
	// props: [],

	data() {
		return {
			// modal open/close
			isModalOpen: false,
			observer: null,
		}
	},

	computed: {},

	mounted() {
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
			} else {
				// when modal is closed
			}
		},
	},

	methods: {
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
