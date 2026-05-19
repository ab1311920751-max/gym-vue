import request from '../utils/request'

export const createBooking = (data) => request.post('/booking', data)

export const listMyBookings = () => request.get('/booking/my')

export const cancelBooking = (id) => request.post(`/booking/cancel/${id}`)

export const listAdminBookings = () => request.get('/booking/admin/list')
