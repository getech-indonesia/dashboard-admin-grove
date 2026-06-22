import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetListings(page = 1, pageSize = 20, keyword = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-listings', page, pageSize, keyword, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/listings', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    sectorId: sectorId || undefined
                }
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}

export function useGetListingDetail(id) {
    return useQuery({
        queryKey: ['admin-listings', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/listings/${id}`)
            return response.data
        },
        enabled: !!id,
        staleTime: 0,
    })
}

export function useGetStockPrices(symbol, before) {
    return useQuery({
        queryKey: ['stock-prices', symbol, before],
        queryFn: async () => {
            const url = `/admin/stocks/${symbol}/stock-price${before ? `?before=${before}` : ''}`
            const response = await axiosClient.get(url)
            return response.data
        },
        enabled: !!symbol
    })
}

export function useSyncStockPrice(id, symbol) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const response = await axiosClient.post(`/admin/stock-prices/sync`, undefined, {
                params: { listingId: id }
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
            queryClient.invalidateQueries({ queryKey: ['stock-prices', symbol] })
        }
    })
}

export function useGetGroveScores(page = 1, pageSize = 20, q = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-listings-scores', page, pageSize, q, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/listings/scores', {
                params: {
                    page,
                    pageSize,
                    q: q || undefined,
                    sectorId: sectorId || undefined
                }
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}