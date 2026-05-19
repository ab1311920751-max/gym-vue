import request from '../utils/request'

export const getCart = () => request.get('/cart')

export const addToCart = (courseId) => request.post(`/cart/${courseId}`)

export const removeFromCart = (id) => request.delete(`/cart/${id}`)

export const checkout = () => request.post('/cart/checkout')
