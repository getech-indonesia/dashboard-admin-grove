import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetCompanyShareholdings(companyId) {
    return useQuery({
        queryKey: ['admin-shareholdings', 'company', companyId],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/shareholdings/company/${companyId}`)
            return response.data
        },
        enabled: !!companyId,
    })
}

export function useGetShareholding(id) {
    return useQuery({
        queryKey: ['admin-shareholdings', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/shareholdings/${id}`)
            return response.data
        },
        enabled: !!id,
    })
}

export function useCreateShareholding() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.post('/admin/shareholdings', payload)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-shareholdings', 'company', data.companyId] })
        }
    })
}

export function useUpdateShareholding(id) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.patch(`/admin/shareholdings/${id}`, payload)
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-shareholdings', 'company', data.companyId] })
            queryClient.invalidateQueries({ queryKey: ['admin-shareholdings', id] })
        }
    })
}

export function useDeleteShareholding(companyId) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id) => {
            const response = await axiosClient.delete(`/admin/shareholdings/${id}`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shareholdings', 'company', companyId] })
        }
    })
}
