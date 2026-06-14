import { useQuery } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetBalanceSheets(page = 1, pageSize = 20, keyword = '', period = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-balance-sheets', page, pageSize, keyword, period, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/balance-sheets', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    period: period || undefined,
                    sectorId: sectorId || undefined
                }
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}

export function useGetBalanceSheetDetail(id) {
    return useQuery({
        queryKey: ['admin-balance-sheets', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/balance-sheets/${id}`)
            return response.data
        },
        enabled: !!id,
        staleTime: 0,
    })
}