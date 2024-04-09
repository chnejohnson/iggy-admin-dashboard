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
					<!-- Select organization -->
					<div class="dropdown-center mt-4 d-grid gap-2">
						<button
							v-if="isActivated"
							class="btn btn-dark dropdown-toggle"
							type="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							{{ selectedProjectName || 'Select an Organization' }}
						</button>

						<div class="dropdown-menu p-2">
							<li v-for="project in projects" :key="project.name">
								<button class="dropdown-item" type="button" @click="selectedProjectName = project.name">
									{{ project.name }}
								</button>
							</li>
						</div>
					</div>
					<!-- END Select organization -->

					<!-- Select contract -->
					<div class="dropdown-center mt-4 d-grid gap-2">
						<button
							v-if="isActivated"
							:disabled="!selectedProjectName"
							class="btn btn-dark dropdown-toggle"
							type="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							{{ selectedContract ? selectedContract.name : 'Select a Contract' }}
						</button>

						<div class="dropdown-menu p-2">
							<div class="mb-3">
								<li><h6 class="dropdown-header">Minted Posts</h6></li>
								<li>
									<button @click="onClickSelectContract('IggyPostMinter')" class="dropdown-item">
										Post Minter (IggyPostMinter)
									</button>
								</li>
								<li>
									<button @click="onClickSelectContract('IggyPostNft1155')" class="dropdown-item">
										Post NFT (IggyPostNft1155)
									</button>
								</li>
								<li><hr class="dropdown-divider" /></li>

								<li><h6 class="dropdown-header">NFT Launchpad</h6></li>
								<li>
									<button
										@click="onClickSelectContract('IggyLaunchpad721Bonding')"
										class="dropdown-item"
									>
										NFT Launchpad (IggyLaunchpad721Bonding)
									</button>
								</li>
								<li>
									<button @click="onClickSelectContract('NftDirectory')" class="dropdown-item">
										NFT Directory (NftDirectory)
									</button>
								</li>
							</div>
						</div>
					</div>
					<!-- END Select contract -->
				</div>

				<div class="modal-footer d-flex justify-content-center">
					<button
						v-if="isActivated"
						class="btn btn-lg btn-dark"
						:disabled="!selectedProjectName || !selectedContract"
						@click="onClickLoad"
					>
						<span
							v-if="false"
							class="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
						Load
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
import WaitingToast from './WaitingToast.vue'
import PROJECTS_JSON from '../data/projects.json'

export default {
	name: 'StoredContractsModal',
	emits: ['loadStoredContracts'],

	data() {
		return {
			selectedProjectName: null,
			selectedContract: null,
			// modal open/close
			isModalOpen: false,
			observer: null,
		}
	},

	computed: {
		projects() {
			return PROJECTS_JSON
		},
	},

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
				// clear selectedProjectName and selectedContract
				this.selectedProjectName = null
				this.selectedContract = null
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

		onClickSelectContract(type) {
			if (!this.selectedProjectName) throw new Error('selectedProjectName is required')
			if (!this.projects.length) throw new Error('Projects not found')

			const project = this.projects.find(p => p.name === this.selectedProjectName)
			if (!project) throw new Error('Project not found')

			let contract

			project.categories.forEach(category => {
				category.contracts.forEach(c => {
					if (c.type === type) {
						contract = c
					}
				})
			})
			if (!contract) throw new Error('Contract not found')

			this.selectedContract = contract

			// console.log('selectedProjectName', this.selectedProjectName)
			// console.log('selectedContract', this.selectedContract)
		},

		onClickLoad() {
			if (!this.selectedProjectName) throw new Error('selectedProjectName is required')
			if (!this.selectedContract) throw new Error('selectedContract is required')

			this.$emit('loadStoredContracts', {
				address: this.selectedContract.address,
				type: this.selectedContract.type,
			})

			document.getElementById('closeStoredContractsModal').click()
		},
	},

	setup() {
		const { address, isActivated, signer } = useEthers()
		const toast = useToast()

		return { address, isActivated, signer, toast }
	},
}
</script>
