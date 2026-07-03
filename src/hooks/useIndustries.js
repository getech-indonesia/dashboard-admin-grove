import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

// Fetch all industries (supporting page, pageSize, q, keyword, sectorId)
export function useGetIndustries(params = { page: 1, pageSize: 100 }) {
    return useQuery({
        queryKey: ['admin-industries', params],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/industries', { params })
            return response.data
        },
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch single industry by ID
export function useGetIndustry(id) {
    return useQuery({
        queryKey: ['admin-industry', id],
        queryFn: async () => {
            if (!id) return null
            const response = await axiosClient.get(`/admin/industries/${id}`)
            return response.data
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

// Create new industry
export function useCreateIndustry() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.post('/admin/industries', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-industries'] })
            queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
        },
    })
}

// Update industry by ID
export function useUpdateIndustry() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const response = await axiosClient.patch(`/admin/industries/${id}`, payload)
            return response.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-industries'] })
            queryClient.invalidateQueries({ queryKey: ['admin-industry', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
        },
    })
}

// Delete industry by ID
export function useDeleteIndustry() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosClient.delete(`/admin/industries/${id}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-industries'] })
            queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
        },
    })
}
