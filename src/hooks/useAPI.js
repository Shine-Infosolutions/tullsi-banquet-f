import { useState } from 'react'
import { bookingAPI, categoryAPI, menuAPI, planLimitAPI } from '../services/api'

export const useAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRequest = async (apiCall) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    // Booking methods
    createBooking: (data) => handleRequest(() => bookingAPI.create(data)),
    getBookings: () => handleRequest(() => bookingAPI.getAll()),
    getBookingsPaginated: (page) => handleRequest(() => bookingAPI.getPaginated(page)),
    searchBookings: (query) => handleRequest(() => bookingAPI.search(query)),
    getBookingById: (id) => handleRequest(() => bookingAPI.getById(id)),
    updateBooking: (id, data) => handleRequest(() => bookingAPI.update(id, data)),
    deleteBooking: (id) => handleRequest(() => bookingAPI.delete(id)),
    
    // Category methods
    createCategory: (data) => handleRequest(() => categoryAPI.create(data)),
    getCategories: () => handleRequest(() => categoryAPI.getAll()),
    getCategoryById: (id) => handleRequest(() => categoryAPI.getById(id)),
    updateCategory: (id, data) => handleRequest(() => categoryAPI.update(id, data)),
    deleteCategory: (id) => handleRequest(() => categoryAPI.delete(id)),
    
    // Menu methods
    getMenuByBookingId: (bookingId) => handleRequest(() => menuAPI.getByBookingId(bookingId)),
    getMenuByCustomerRef: (customerRef) => handleRequest(() => menuAPI.getByCustomerRef(customerRef)),
    updateMenuByCustomerRef: (customerRef, data) => handleRequest(() => menuAPI.updateByCustomerRef(customerRef, data)),
    
    // Plan Limit methods
    getPlanLimits: () => handleRequest(() => planLimitAPI.getAll()),
    getFormattedLimits: () => handleRequest(() => planLimitAPI.getFormatted()),
    getPlanLimit: (ratePlan, foodType) => handleRequest(() => planLimitAPI.getByPlan(ratePlan, foodType)),
    upsertPlanLimit: (data) => handleRequest(() => planLimitAPI.upsert(data)),
    initializePlanLimits: () => handleRequest(() => planLimitAPI.initialize()),
  }
}