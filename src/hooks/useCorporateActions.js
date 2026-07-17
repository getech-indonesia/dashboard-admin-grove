import { useQuery } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetCorporateActions(page = 1, pageSize = 1000) {
  return useQuery({
    queryKey: ['admin-corporate-actions', page, pageSize],
    queryFn: async () => {
      const response = await axiosClient.get('/admin/corporate-action', {
        params: {
          page,
          pageSize,
        },
      })
      return response.data
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetAllCorporateActions(pageSize = 20) {
  return useQuery({
    queryKey: ['admin-corporate-actions-all', pageSize],
    queryFn: async () => {
      const firstResponse = await axiosClient.get('/admin/corporate-action', {
        params: {
          page: 1,
          pageSize,
        },
      })

      const firstData = firstResponse.data
      const firstItems = Array.isArray(firstData) ? firstData : (firstData?.items || [])
      const pagination = firstData?.pagination || { total: firstItems.length, totalPages: 1 }
      const totalPages = pagination.totalPages || 1

      if (totalPages <= 1) {
        return {
          items: firstItems,
          pagination: {
            ...pagination,
            total: pagination.total ?? firstItems.length,
            totalPages: 1,
          },
        }
      }

      const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
        axiosClient.get('/admin/corporate-action', {
          params: {
            page: index + 2,
            pageSize,
          },
        })
      )

      const remainingResponses = await Promise.all(pageRequests)
      const remainingItems = remainingResponses.flatMap((response) => {
        const responseData = response.data
        return Array.isArray(responseData) ? responseData : (responseData?.items || [])
      })

      const allItems = [...firstItems, ...remainingItems]

      return {
        items: allItems,
        pagination: {
          ...pagination,
          total: pagination.total ?? allItems.length,
          totalPages: Math.max(1, Math.ceil(allItems.length / pageSize)),
        },
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  })
}
