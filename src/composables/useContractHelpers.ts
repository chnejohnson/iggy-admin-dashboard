import { ref } from 'vue'
import PROJECTS_JSON from '../data/projects.json'

export default function useContractHelper() {
	function getProjects() {
		return PROJECTS_JSON
	}

	const selectedContract = ref(null)

	function selectContract(name) {}

	return {
		getProjects,
	}
}
