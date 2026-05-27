// Centralized client API service pipelines
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export const apiService = {
  fetchBranches: async () => {
    const res = await fetch(`${API_URL}/branches`)
    return res.json()
  },
  
  fetchAppointments: async (branchId: string, date: string) => {
    const res = await fetch(`${API_URL}/appointments?branchId=${branchId}&date=${date}`)
    return res.json()
  }
}
