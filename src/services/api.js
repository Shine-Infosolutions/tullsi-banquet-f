import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shine-banquet-hotel-backend.vercel.app'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Root API
export const rootAPI = {
  healthCheck: () => api.get('/'),
}

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/api/bookings/create', data),
  getAll: () => api.get('/api/bookings'),
  getPaginated: (page = 1) => api.get(`/api/bookings/pg?page=${page}`),
  search: (query) => api.get(`/api/bookings/search?q=${query}`),
  getById: (id) => api.get(`/api/bookings/get/${id}`),
  update: (id, data) => api.put(`/api/bookings/update/${id}`, data),
  delete: (id) => api.delete(`/api/bookings/delete/${id}`),
}

// Category APIs
export const categoryAPI = {
  create: (data) => api.post('/api/categories/create', data),
  getAll: () => api.get('/api/categories/all'),
  getById: (id) => api.get(`/api/categories/get/${id}`),
  update: (id, data) => api.put(`/api/categories/update/${id}`, data),
  delete: (id) => api.delete(`/api/categories/delete/${id}`),
}

// Menu APIs
export const menuAPI = {
  getByBookingId: (bookingId) => api.get(`/api/menus/${bookingId}`),
  getByCustomerRef: (customerRef) => api.get(`/api/menus/all/${customerRef}`),
  updateByCustomerRef: (customerRef, data) => api.put(`/api/menus/update/${customerRef}`, data),
}

// Plan Limit APIs
export const planLimitAPI = {
  getAll: () => api.get('/api/plan-limits/get'),
  getFormatted: () => api.get('/api/plan-limits/formatted'),
  getByPlan: (ratePlan, foodType) => api.get(`/api/plan-limits/${ratePlan}/${foodType}`),
  upsert: (data) => api.post('/api/plan-limits', data),
  initialize: () => api.post('/api/plan-limits/initialize'),
}

export default api