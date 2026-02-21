import { NextRequest, NextResponse } from 'next/server';

const FINMIND_API = 'https://api.finmindtrade.com/api/v4';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: '缺少股票代碼' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${FINMIND_API}/data?dataset=TaiwanStockPrice&data_date=${getToday()}&stock_id=${symbol}`
    );

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: '找不到資料' }, { status: 404 });
    }

    const stockData = data.data[0];
    const change = stockData.close - stockData.yesterday_close;
    const changePercent = (change / stockData.yesterday_close) * 100;

    return NextResponse.json({
      name: stockData.stock_id,
      price: stockData.close,
      change: change,
      changePercent: changePercent,
      asOf: stockData.date,
    });
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
