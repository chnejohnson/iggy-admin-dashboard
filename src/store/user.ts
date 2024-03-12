import { defineStore } from 'pinia';

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      defaultDomain: null,
      domainSearchStatus: false, // is a domain search for the connected user still in progress?
    }
  },

  getters: {
    getDefaultDomain(state) {
      return state.defaultDomain;
    },

    getDomainSearchStatus(state) {
      return state.domainSearchStatus;
    },
  }
  
})