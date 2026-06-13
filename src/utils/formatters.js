export const formatCurrency = (amount, currencyCode = 'IDR') => {
  const value = Number(amount) || 0
  const formatter = new Intl.NumberFormat(
    currencyCode === 'IDR' ? 'id-ID' : 'en-US',
    {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  )
  const formatted = formatter.format(Math.abs(value))
  return value < 0 ? `-${formatted}` : formatted
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
