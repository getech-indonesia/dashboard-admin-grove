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


export const formatAbbreviated = (value) => {
  if (!value || parseFloat(value) === 0) return '-';
  const num = Math.abs(parseFloat(value));

  let val = 0;
  let unit = "";

  if (num >= 1e9) {
    val = num / 1e9;
    unit = " B";
  } else if (num >= 1e6) {
    val = num / 1e6;
    unit = " M";
  } else {
    val = num;
  }

  // Konversi ke string, ambil 5 digit angka pertama saja (abaikan titik/koma)
  let str = val.toString().replace('.', '');
  str = str.substring(0, 5);

  // Format balik biar ada koma ribuan (contoh: 14689 -> 14,689)
  // Kita bagi logic-nya supaya kalau digitnya kurang dari 5, tetep rapi
  const formatted = parseInt(str).toLocaleString('en-US');

  return `${formatted}${unit}`;
};