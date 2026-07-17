import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  TrendingUp,
  Table2,
} from 'lucide-react'
import Pagination from '@/components/dashboard/Pagination'
import { useGetAllCorporateActions } from '@/hooks/useCorporateActions'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ACTION_TONE_MAP = [
  { match: /split/i, classes: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { match: /dividend/i, classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  { match: /warrant/i, classes: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
  { match: /rights/i, classes: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
  { match: /bonus/i, classes: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
  { match: /merger|acquisition|takeover/i, classes: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20' },
  { match: /buyback/i, classes: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
]

const toDateKey = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDateKey = (dateKey) => {
  if (!dateKey) return null
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)

const formatDisplayDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatCompactNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  return new Intl.NumberFormat('en-US').format(numeric)
}

const humanizeActionType = (value) => {
  if (!value) return 'Unknown'
  return value
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

const getActionTone = (value) => {
  if (!value) return 'bg-zinc-900 text-zinc-400 border-zinc-800'
  const tone = ACTION_TONE_MAP.find((item) => item.match.test(value))
  return tone?.classes || 'bg-zinc-900 text-zinc-300 border-zinc-800'
}

const getActionDate = (item) => item.effectiveDate || item.announcementDate || null

const getActionDateKey = (item) => {
  const rawDate = getActionDate(item)
  return rawDate ? rawDate.split('T')[0] : ''
}

const normalizeText = (value) => (value || '').toString().toLowerCase()

export default function CorporateActionPage() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDateKey, setSelectedDateKey] = useState('')
  const [tablePage, setTablePage] = useState(1)
  const [selectedDayPage, setSelectedDayPage] = useState(1)

  const pageSize = 20
  const { data, isLoading, isError, error } = useGetAllCorporateActions(pageSize)

  const corporateActions = data?.items || []
  const pagination = data?.pagination || { total: corporateActions.length, totalPages: 1 }

  const normalizedActions = useMemo(() => {
    return corporateActions
      .map((item) => {
        const effectiveDate = item.effectiveDate ? new Date(item.effectiveDate) : null
        const announcementDate = item.announcementDate ? new Date(item.announcementDate) : null

        return {
          ...item,
          effectiveDateValue: effectiveDate,
          announcementDateValue: announcementDate,
          scopedDateKey: getActionDateKey(item),
          searchBlob: [
            item.actionType,
            item.company?.displayName,
            item.company?.legalName,
            item.listings?.map((listing) => listing.symbol).join(' '),
            item.listings?.map((listing) => listing.exchange).join(' '),
            item.sharesOffered,
            item.offeringPrice,
            item.splitRatio,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        }
      })
      .sort((left, right) => {
        const leftTime = left.effectiveDateValue?.getTime() || left.announcementDateValue?.getTime() || 0
        const rightTime = right.effectiveDateValue?.getTime() || right.announcementDateValue?.getTime() || 0
        return rightTime - leftTime
      })
  }, [corporateActions])

  const monthActions = useMemo(() => {
    return normalizedActions.filter((item) => {
      const date = item.effectiveDateValue || item.announcementDateValue
      if (!date) return false
      return date.getFullYear() === visibleMonth.getFullYear() && date.getMonth() === visibleMonth.getMonth()
    })
  }, [normalizedActions, visibleMonth])

  const actionsByDate = useMemo(() => {
    return normalizedActions.reduce((acc, item) => {
      const key = item.scopedDateKey
      if (!key) return acc
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }, [normalizedActions])

  const selectedDate = useMemo(() => fromDateKey(selectedDateKey), [selectedDateKey])
  const selectedDateActions = selectedDateKey ? (actionsByDate[selectedDateKey] || []) : []
  const selectedDayTotalPages = Math.max(1, Math.ceil(selectedDateActions.length / pageSize))
  const selectedDayPageSafe = Math.min(selectedDayPage, selectedDayTotalPages)
  const selectedDayPagedActions = useMemo(() => {
    const startIndex = (selectedDayPageSafe - 1) * pageSize
    return selectedDateActions.slice(startIndex, startIndex + pageSize)
  }, [selectedDateActions, selectedDayPageSafe])

  const tableTotalPages = Math.max(1, Math.ceil(normalizedActions.length / pageSize))
  const tablePageSafe = Math.min(tablePage, tableTotalPages)
  const tablePagedActions = useMemo(() => {
    const startIndex = (tablePageSafe - 1) * pageSize
    return normalizedActions.slice(startIndex, startIndex + pageSize)
  }, [normalizedActions, tablePageSafe])

  const monthCells = useMemo(() => {
    const start = startOfMonth(visibleMonth)
    const startDay = start.getDay()

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(start.getFullYear(), start.getMonth(), index - startDay + 1)
      const inCurrentMonth = cellDate.getMonth() === visibleMonth.getMonth()
      const dateKey = toDateKey(cellDate)

      return {
        date: cellDate,
        dateKey,
        inCurrentMonth,
        hasActions: Boolean(actionsByDate[dateKey]?.length),
        count: actionsByDate[dateKey]?.length || 0,
      }
    })
  }, [visibleMonth, actionsByDate])

  const visibleLabel = selectedDate
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(selectedDate)
    : formatMonthLabel(visibleMonth)

  const monthCompanyCount = useMemo(() => {
    const companies = new Set(monthActions.map((item) => item.company?.id).filter(Boolean))
    return companies.size
  }, [monthActions])

  const monthTypeCount = useMemo(() => {
    const types = new Set(monthActions.map((item) => item.actionType).filter(Boolean))
    return types.size
  }, [monthActions])

  const monthUpcomingCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return normalizedActions.filter((item) => {
      const date = item.effectiveDateValue || item.announcementDateValue
      if (!date) return false
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)
      return compareDate >= today
    }).length
  }, [normalizedActions])

  const selectedDateCount = selectedDateKey ? selectedDateActions.length : 0

  const goToPreviousMonth = () => {
    setSelectedDateKey('')
    setSelectedDayPage(1)
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setSelectedDateKey('')
    setSelectedDayPage(1)
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  const goToCurrentMonth = () => {
    setSelectedDateKey('')
    setSelectedDayPage(1)
    setVisibleMonth(startOfMonth(new Date()))
  }

  const handleDayClick = (date) => {
    setVisibleMonth(startOfMonth(date))
    setSelectedDateKey(toDateKey(date))
    setSelectedDayPage(1)
  }

  useEffect(() => {
    setSelectedDayPage(1)
  }, [selectedDateKey])

  useEffect(() => {
    setTablePage(1)
  }, [normalizedActions.length])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-900 pb-5 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-zinc-100">
            <CalendarDays className="w-6 h-6 text-emerald-400" />
            Corporate Action
          </h1>
          <p className="mt-1.5 text-xs font-normal tracking-normal text-zinc-500">
            Monitor market corporate actions with a monthly calendar view and a structured activity table.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-900 bg-[#09090b] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Total Actions
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-100">{normalizedActions.length.toLocaleString('en-US')}</div>
          <div className="mt-1 text-xs text-zinc-500">All loaded records from the paginated feed.</div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-[#09090b] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <Building2 className="h-3.5 w-3.5 text-emerald-400" />
            Companies
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-100">{monthCompanyCount.toLocaleString('en-US')}</div>
          <div className="mt-1 text-xs text-zinc-500">Distinct issuers in the active calendar month.</div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-[#09090b] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            Action Types
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-100">{monthTypeCount.toLocaleString('en-US')}</div>
          <div className="mt-1 text-xs text-zinc-500">Unique corporate action categories this month.</div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-[#09090b] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <Table2 className="h-3.5 w-3.5 text-emerald-400" />
            Upcoming
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-100">{monthUpcomingCount.toLocaleString('en-US')}</div>
          <div className="mt-1 text-xs text-zinc-500">Effective dates on or after today.</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-[#09090b] shadow-sm">
          <div className="flex flex-col gap-4 border-b border-zinc-900 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-zinc-100">
                <CalendarDays className="h-4 w-4 text-emerald-400" />
                {formatMonthLabel(visibleMonth)}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Click a day to scope the Selected Day panel below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToCurrentMonth}
                className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-zinc-900 bg-[#0c0c0e] px-3 py-2">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-zinc-900 p-px">
            {monthCells.map((cell) => {
              const isSelected = cell.dateKey === selectedDateKey
              const isToday = cell.dateKey === toDateKey(new Date())
              const badgeValue = cell.count > 20 ? '20+' : cell.count

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => handleDayClick(cell.date)}
                  className={`min-h-24 bg-[#09090b] p-2 text-left transition-colors hover:bg-[#0c0c0e] ${
                    cell.inCurrentMonth ? 'text-zinc-200' : 'text-zinc-600'
                  } ${isSelected ? 'bg-emerald-500/5 ring-1 ring-emerald-500/70' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-emerald-500 text-zinc-950'
                          : isSelected
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {cell.count > 0 && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        {badgeValue}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1">
                    {cell.hasActions ? (
                      <>
                        <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-500/80 via-emerald-400 to-cyan-400" />
                        <p className="text-[10px] text-zinc-500">
                          {cell.count} action{cell.count > 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] text-zinc-700">No events</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-[#09090b] shadow-sm">
          <div className="border-b border-zinc-900 p-4">
            <div className="flex items-center gap-2 font-semibold text-zinc-100">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              {selectedDateKey ? 'Selected Day' : 'Month Overview'}
            </div>
            <p className="mt-1 text-xs text-zinc-500">{visibleLabel}</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="rounded-xl border border-zinc-900 bg-[#0c0c0e] p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Selection Summary</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-zinc-500">Visible month items</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-100">{monthActions.length.toLocaleString('en-US')}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Selected day items</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-100">{selectedDateCount.toLocaleString('en-US')}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-[#0c0c0e]">
              <div className="border-b border-zinc-900 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Actions on selected date
              </div>

              <div className="max-h-[460px] divide-y divide-zinc-900 overflow-y-auto">
                {selectedDayPagedActions.length > 0 ? (
                  selectedDayPagedActions.map((item) => (
                    <div key={item.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-100">
                            {item.company?.displayName || item.company?.legalName || 'Unknown Company'}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-zinc-500">
                            {item.listings?.[0]?.symbol
                              ? `${item.listings[0].symbol} • ${item.listings[0].exchange || '-'}`
                              : 'Listing unavailable'}
                          </div>
                        </div>

                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${getActionTone(item.actionType)}`}>
                          {humanizeActionType(item.actionType)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center text-xs text-zinc-600">
                    No corporate actions found for this day.
                  </div>
                )}
              </div>

              {selectedDateKey && selectedDateActions.length > 0 && (
                <div className="border-t border-zinc-900 px-4 py-3">
                  <Pagination
                    page={selectedDayPageSafe}
                    totalPages={selectedDayTotalPages}
                    total={selectedDateActions.length}
                    itemsCount={selectedDayPagedActions.length}
                    onPageChange={setSelectedDayPage}
                    pageSize={pageSize}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-900 bg-[#09090b] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-900 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-zinc-100">
              <Table2 className="h-4 w-4 text-emerald-400" />
              Corporate Action Table
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Showing all loaded records with pagination.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex h-56 items-center justify-center font-mono text-xs text-zinc-500">
            Loading corporate action records...
          </div>
        )}

        {isError && (
          <div className="flex h-56 items-center justify-center px-4 text-center font-mono text-xs text-red-400">
            Failed to load corporate actions: {error?.response?.data?.message || error.message}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse">
                <thead className="border-b border-zinc-900 bg-[#0c0c0e]">
                  <tr>
                    <th className="w-[140px] px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Date
                    </th>
                    <th className="w-[28%] px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Company
                    </th>
                    <th className="w-[170px] px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Listing
                    </th>
                    <th className="w-[190px] px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Action Type
                    </th>
                    <th className="w-[220px] px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Terms
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-900">
                  {tablePagedActions.length > 0 ? (
                    tablePagedActions.map((item) => (
                      <tr key={item.id} className="group transition-colors duration-100 hover:bg-[#0c0c0e]/60">
                        <td className="align-top px-5 py-4">
                          <div className="space-y-1">
                            <div className="font-mono text-[13px] text-zinc-200">
                              {formatDisplayDate(item.effectiveDate || item.announcementDate)}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                              {item.announcementDate ? 'Announcement' : 'Effective'}
                            </div>
                            {item.announcementDate && (
                              <div className="font-mono text-[11px] text-zinc-500">
                                Ann: {formatDisplayDate(item.announcementDate)}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="align-top px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:text-emerald-400">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium text-zinc-100">
                                {item.company?.displayName || item.company?.legalName || 'Unknown Company'}
                              </div>
                              <div className="mt-0.5 truncate text-[11px] text-zinc-500">
                                {item.company?.legalName || '-'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="align-top px-5 py-4">
                          <div className="space-y-2">
                            {item.listings?.length > 0 ? item.listings.map((listing) => (
                              <div
                                key={listing.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300"
                              >
                                <span className="font-semibold text-zinc-100">{listing.symbol || '-'}</span>
                                <span className="text-zinc-600">{listing.exchange || '-'}</span>
                              </div>
                            )) : (
                              <span className="text-[11px] text-zinc-600">No listing linked</span>
                            )}
                          </div>
                        </td>

                        <td className="align-top px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getActionTone(item.actionType)}`}>
                            {humanizeActionType(item.actionType)}
                          </span>
                        </td>

                        <td className="align-top px-5 py-4 text-[11px] text-zinc-400">
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-zinc-600">Shares Offered:</span>{' '}
                              <span className="font-mono text-zinc-300">{formatCompactNumber(item.sharesOffered)}</span>
                            </div>
                            <div>
                              <span className="text-zinc-600">Split Ratio:</span>{' '}
                              <span className="font-mono text-zinc-300">{formatCompactNumber(item.splitRatio)}</span>
                            </div>
                            <div>
                              <span className="text-zinc-600">Offering Price:</span>{' '}
                              <span className="font-mono text-zinc-300">{formatCompactNumber(item.offeringPrice)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center text-xs text-zinc-600">
                        No corporate actions matched the loaded records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-zinc-900 px-4 py-3">
              <Pagination
                page={tablePageSafe}
                totalPages={tableTotalPages}
                total={normalizedActions.length}
                itemsCount={tablePagedActions.length}
                onPageChange={setTablePage}
                pageSize={pageSize}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
