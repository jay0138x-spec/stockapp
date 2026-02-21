import { NextRequest, NextResponse } from 'next/server';

const FINMIND_API = 'https://api.finmindtrade.com/api/v4';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const months = parseInt(searchParams.get('months') || '18');

  if (!symbol) {
    return NextResponse.json({ error: '缺少股票代碼' }, { status: 400 });
  }

  try {
    const endDate = getToday();
    const startDate = getDateMonthsAgo(months);

    const response = await fetch(
      `${FINMIND_API}/data?dataset=TaiwanStockPrice&start_date=${startDate}&end_date=${endDate}&stock_id=${symbol}`
    );

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: '找不到資料' }, { status: 404 });
    }

    const candles = data.data
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));

    return NextResponse.json({ candles });
  } catch (error) {
    return NextResponse.json({ error: 'API請求失敗' }, { status: 500 });
  }
}

function getToday() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateMonthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
