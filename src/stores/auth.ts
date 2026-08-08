import { defineStore } from 'pinia'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(username: string, password: string) {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        throw new Error('Identifiants incorrects')
      }

      const data = await response.json()

      this.token = data.token
      this.user = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})