/workspace/stock-sara-app$ /bin/bash -lc 'pwd && rg --files | head'
/workspace/stock-sara-app
/workspace/stock-sara-app$ /bin/bash -lc 'find . -maxdepth 2 -type f | head -n 50'
./.git/index
./.git/config
./.git/description
./.git/packed-refs
./.git/FETCH_HEAD
./.git/HEAD
./.gitkeep
/workspace/stock-sara-app$ /bin/bash -lc 'find /workspace -name AGENTS.md -print'
/workspace/stock-sara-app$ /bin/bash -lc 'git status --short && git branch --show-current && git log --oneline -n 3'
work
1d983f5 Initialize repository
/workspace/stock-sara-app$ /bin/bash -lc 'cat > SaraApp.tsx <<'"'"'EOF'"'"'
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type Indicators = {
  ma5?: number | null;
  ma10?: number | null;
  ma20?: number | null;
  ma60?: number | null;
  ma240?: number | null;
};

type RiskPlan = {
  stopLoss?: number | null;
  takeProfit?: number | null;
  trailingStopPct?: number | null;
  positionNote?: string;
};

type Revenue = {
  month: string;
  mom: string;
  yoy: string;
};

type NewsItem = {
  date: string;
  title: string;
};

type Stock = {
  id: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  asOf?: string;
  themes: string[];
  candles?: Candle[];
  indicators?: Indicators;
  morphology: string;
  morphologyDesc: string;
  risk?: RiskPlan;
  notes?: string;
  aiRating: string;
  aiAnalysis: string;
  revenue: Revenue;
  news: NewsItem[];
};

const fmt = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : "--");
const getPriceColor = (c: number) => (c >= 0 ? "text-red-500" : "text-green-500");

const sma = (v: number[], p: number) => {
  if (v.length < p) return null;
  let s = 0;
  for (let i = v.length - p; i < v.length; i += 1) s += v[i];
  return s / p;
};

const calcIndicators = (candles: Candle[]): Indicators => {
  const closePrices = candles.map((x) => x.close);
  return {
    ma5: sma(closePrices, 5),
    ma10: sma(closePrices, 10),
    ma20: sma(closePrices, 20),
    ma60: sma(closePrices, 60),
    ma240: sma(closePrices, 240),
  };
};

const inferMorphology = (price: number, indicators: Indicators) => {
  const { ma5, ma10, ma60 } = indicators;

  if (ma5 && ma10 && price >= ma5 && ma5 >= ma10) {
    return { m: "沿5MA上攻(多方)", d: "短線強勢，守MA10不破" };
  }

  if (ma60 && price < ma60) {
    return { m: "跌破生命線(偏空)", d: "偏空思維" };
  }

  return { m: "區間整理", d: "觀察為主" };
};

const initialStocks: Stock[] = [
  {
    id: "2330",
    name: "台積電",
    price: 1915,
    change: 45,
    changePercent: 2.41,
    themes: ["半導體", "AI"],
    morphology: "多方",
    morphologyDesc: "技術面偏多",
    revenue: { month: "2500億", mom: "+5.2%", yoy: "+20%" },
    aiRating: "強烈買進",
    aiAnalysis: "AI題材發酵，可分批布局",
    news: [],
    risk: {},
  },
  {
    id: "3372",
    name: "典範",
    price: 21.7,
    change: 1.3,
    changePercent: 6.37,
    themes: ["半導體"],
    morphology: "多方整理",
    morphologyDesc: "站上均線，持續上攻",
    revenue: { month: "1.15億", mom: "+1.35%", yoy: "+60%" },
    aiRating: "偏多",
    aiAnalysis: "營收年增60%",
    news: [],
    risk: {},
  },
];

const Pill = ({ l, v }: { l: string; v?: number | null }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <div className="mb-1 text-xs text-slate-500">{l}</div>
    <div className="font-black text-slate-800">{v == null ? "--" : v.toFixed(2)}</div>
  </div>
);

const Num = ({
  l,
  v,
  p,
  c,
}: {
  l: string;
  v?: number | null;
  p: string;
  c: (value: number | null) => void;
}) => (
  <div>
    <div className="mb-2 text-xs font-bold text-slate-500">{l}</div>
    <input
      type="number"
      inputMode="decimal"
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
      placeholder={p}
      value={v ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          c(null);
          return;
        }
        const n = Number(raw);
        c(Number.isFinite(n) ? n : null);
      }}
    />
  </div>
);

const Row = ({ s, sel, on }: { s: Stock; sel: boolean; on: () => void }) => (
  <div
    onClick={on}
    className={`cursor-pointer border-b border-slate-50 p-4 transition-colors ${
      sel ? "border-l-4 border-l-pink-500 bg-pink-50" : "hover:bg-slate-50"
    }`}
  >
    <div className="mb-1 flex items-center justify-between">
      <div className="font-bold">
        {s.name}
        <span className="text-xs font-normal text-slate-400">{s.id}</span>
      </div>
      <div className={`font-bold ${getPriceColor(s.change)}`}>{fmt(s.price, 1)}</div>
    </div>
    <div className="flex items-center justify-between text-sm">
      <div className="text-xs text-slate-500">{s.morphology}</div>
      <div className={`flex items-center gap-1 ${getPriceColor(s.change)}`}>
        {s.change >= 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>
          {s.change >= 0 ? "+" : ""}
          {fmt(s.change, 1)}({s.change >= 0 ? "+" : ""}
          {fmt(s.changePercent, 2)}%)
        </span>
      </div>
    </div>
  </div>
);

const api = {
  fetchQuote: async (symbol: string) => {
    try {
      const r = await fetch(`/api/quote?symbol=${symbol}`);
      return r.ok ? await r.json() : null;
    } catch {
      return null;
    }
  },
  fetchCandles: async (symbol: string, months = 18) => {
    try {
      const r = await fetch(`/api/candles?symbol=${symbol}&months=${months}`);
      if (!r.ok) return [];
      const d = await r.json();
      return d.candles || [];
    } catch {
      return [];
    }
  },
  generateStrategy: async (p: {
    symbol: string;
    name: string;
    price: number;
    morphology: string;
    indicators: Indicators;
    risk: RiskPlan;
  }) => {
    let t = "";
    if (p.morphology.includes("多方")) t += "• 偏多結構，可分批進場\n";
    else if (p.morphology.includes("空方")) t += "• 偏空結構，建議觀望\n";
    else t += "• 區間整理，觀察為主\n";

    if (p.indicators.ma5 && p.indicators.ma10) {
      t +=
        p.indicators.ma5 > p.indicators.ma10
          ? "• 均線黃金交叉，短線偏多\n"
          : "• 均線死亡交叉，短線偏空\n";
    }

    if (p.risk.stopLoss) t += `• 停損設在：${p.risk.stopLoss}\n`;
    if (p.risk.takeProfit) t += `• 停利設在：${p.risk.takeProfit}\n`;
    t += "• 嚴守紀律";
    return t;
  },
};

export default function SaraApp() {
  const [watchlist, setWatchlist] = useState(initialStocks);
  const [selectedId, setSelectedId] = useState(initialStocks[0]?.id || "");
  const selectedStock = useMemo(
    () => watchlist.find((s) => s.id === selectedId) || null,
    [watchlist, selectedId],
  );
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [strategy, setStrategy] = useState("");
  const [genStrat, setGenStrat] = useState(false);

  useEffect(() => {
    setStrategy("");
  }, [selectedId]);

  const patch = (id: string, p: Partial<Stock>) => {
    setWatchlist((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
  };

  const updRisk = (id: string, r: Partial<RiskPlan>) => {
    setWatchlist((prev) =>
      prev.map((s) => (s.id === id ? { ...s, risk: { ...(s.risk || {}), ...r } } : s)),
    );
  };

  const sync = async () => {
    try {
      setSyncing(true);
      for (const s of watchlist) {
        const q = await api.fetchQuote(s.id).catch(() => null);
        if (!q) continue;
        patch(s.id, {
          price: typeof q.price === "number" ? q.price : s.price,
          change: typeof q.change === "number" ? q.change : s.change,
          changePercent:
            typeof q.changePercent === "number" ? q.changePercent : s.changePercent,
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const refresh = async (id: string) => {
    const s = watchlist.find((x) => x.id === id);
    if (!s) return;

    try {
      setAnalyzing(true);
      const candles = await api.fetchCandles(id, 18).catch(() => []);
      const ind = candles.length ? calcIndicators(candles) : s.indicators || {};
      const lastClose = candles.length ? candles[candles.length - 1].close : s.price;
      const m = inferMorphology(lastClose, ind);
      patch(id, {
        candles,
        indicators: ind,
        price: lastClose,
        morphology: m.m,
        morphologyDesc: m.d,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const genStratFn = async () => {
    if (!selectedStock) return;
    setGenStrat(true);
    setStrategy("");

    try {
      const t = await api.generateStrategy({
        symbol: selectedStock.id,
        name: selectedStock.name,
        price: selectedStock.price,
        morphology: selectedStock.morphology,
        indicators: selectedStock.indicators || {},
        risk: selectedStock.risk || {},
      });
      setStrategy(t);
    } finally {
      setGenStrat(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
        <div className="relative border-b border-slate-100 bg-slate-900 p-5 text-white">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Activity className="text-pink-400" />莎拉型態學 AI 看盤
          </h1>
          <p className="mt-1 text-xs text-slate-400">K線 x 均線 x 停損停利</p>
          <button
            onClick={sync}
            disabled={syncing}
            className="absolute right-4 top-5 rounded-full bg-slate-800 p-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋股號/股名"
              className="w-full rounded-lg bg-slate-100 py-2 pl-9 pr-4 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {watchlist
            .filter((s) => s.name.includes(search) || s.id.includes(search))
            .map((s) => (
              <Row key={s.id} s={s} sel={s.id === selectedId} on={() => setSelectedId(s.id)} />
            ))}
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="text-center text-xs text-slate-400">股票檔案庫（開發中）</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        {!selectedStock ? (
          <div className="text-slate-400">請選擇股票</div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-end justify-between rounded-2xl bg-white p-6 shadow-sm">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-3xl font-black">{selectedStock.name}</h2>
                  <span className="text-lg text-slate-500">{selectedStock.id}</span>
                  <a
                    href={`https://tw.stock.yahoo.com/${selectedStock.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />Yahoo
                  </a>
                  <button
                    onClick={() => refresh(selectedStock.id)}
                    disabled={analyzing}
                    className="flex items-center gap-1 rounded bg-pink-50 px-2 py-1 text-xs font-bold"
                  >
                    {analyzing ? "分析中" : "更新分析"}
                  </button>
                </div>
                <div className="flex gap-2">
                  {selectedStock.themes.map((t, i) => (
                    <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-black ${getPriceColor(selectedStock.change)}`}>
                  {fmt(selectedStock.price, 1)}
                </div>
                <div className={`flex items-center gap-1 ${getPriceColor(selectedStock.change)}`}>
                  {selectedStock.change >= 0 ? "+" : ""}
                  {fmt(selectedStock.change, 1)}({selectedStock.change >= 0 ? "+" : ""}
                  {fmt(selectedStock.changePercent, 2)}%)
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-bold">型態判斷</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  selectedStock.morphology.includes("多方")
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedStock.morphology}
              </span>
              <p className="mt-3 text-slate-600">{selectedStock.morphologyDesc}</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Pill l="MA5" v={selectedStock.indicators?.ma5} />
                <Pill l="MA10" v={selectedStock.indicators?.ma10} />
                <Pill l="MA20" v={selectedStock.indicators?.ma20} />
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">AI評等</h3>
                </div>
                <span
                  className={`text-sm font-bold ${
                    selectedStock.aiRating.includes("買") ? "text-red-400" : "text-yellow-400"
                  }`}
                >
                  {selectedStock.aiRating}
                </span>
              </div>
              <p className="text-sm text-indigo-100">{selectedStock.aiAnalysis}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold">風險規劃</h3>
              <div className="grid grid-cols-3 gap-3">
                <Num
                  l="停損"
                  v={selectedStock.risk?.stopLoss}
                  p="例如 1850"
                  c={(v) => updRisk(selectedStock.id, { stopLoss: v })}
                />
                <Num
                  l="停利"
                  v={selectedStock.risk?.takeProfit}
                  p="例如 2050"
                  c={(v) => updRisk(selectedStock.id, { takeProfit: v })}
                />
                <Num
                  l="移動停利(%)"
                  v={selectedStock.risk?.trailingStopPct}
                  p="例如 5"
                  c={(v) => updRisk(selectedStock.id, { trailingStopPct: v })}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold">策略建議</h3>
                <button
                  onClick={genStratFn}
                  disabled={genStrat}
                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white"
                >
                  {genStrat ? "生成中..." : "產生策略"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700">{strategy || "尚未生成"}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
EOF'
/workspace/stock-sara-app$ /bin/bash -lc 'git diff --check && wc -l SaraApp.tsx'
510 SaraApp.tsx
/workspace/stock-sara-app$ /bin/bash -lc 'git add SaraApp.tsx && git commit -m "Fix and reformat SaraApp component"'
[work 22ab71a] Fix and reformat SaraApp component
 1 file changed, 510 insertions(+)
 create mode 100644 SaraApp.tsx
/workspace/stock-sara-app$ /bin/bash -lc 'nl -ba SaraApp.tsx | sed -n '"'"'1,260p'"'"''
1	"use client";
     2	
     3	import React, { useEffect, useMemo, useState } from "react";
     4	import {
     5	  Activity,
     6	  BookOpen,
     7	  ExternalLink,
     8	  RefreshCw,
     9	  Search,
    10	  TrendingDown,
    11	  TrendingUp,
    12	} from "lucide-react";
    13	
    14	type Candle = {
    15	  date: string;
    16	  open: number;
    17	  high: number;
    18	  low: number;
    19	  close: number;
    20	  volume?: number;
    21	};
    22	
    23	type Indicators = {
    24	  ma5?: number | null;
    25	  ma10?: number | null;
    26	  ma20?: number | null;
    27	  ma60?: number | null;
    28	  ma240?: number | null;
    29	};
    30	
    31	type RiskPlan = {
    32	  stopLoss?: number | null;
    33	  takeProfit?: number | null;
    34	  trailingStopPct?: number | null;
    35	  positionNote?: string;
    36	};
    37	
    38	type Revenue = {
    39	  month: string;
    40	  mom: string;
    41	  yoy: string;
    42	};
    43	
    44	type NewsItem = {
    45	  date: string;
    46	  title: string;
    47	};
    48	
    49	type Stock = {
    50	  id: string;
    51	  name: string;
    52	  price: number;
    53	  change: number;
    54	  changePercent: number;
    55	  asOf?: string;
    56	  themes: string[];
    57	  candles?: Candle[];
    58	  indicators?: Indicators;
    59	  morphology: string;
    60	  morphologyDesc: string;
    61	  risk?: RiskPlan;
    62	  notes?: string;
    63	  aiRating: string;
    64	  aiAnalysis: string;
    65	  revenue: Revenue;
    66	  news: NewsItem[];
    67	};
    68	
    69	const fmt = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : "--");
    70	const getPriceColor = (c: number) => (c >= 0 ? "text-red-500" : "text-green-500");
    71	
    72	const sma = (v: number[], p: number) => {
    73	  if (v.length < p) return null;
    74	  let s = 0;
    75	  for (let i = v.length - p; i < v.length; i += 1) s += v[i];
    76	  return s / p;
    77	};
    78	
    79	const calcIndicators = (candles: Candle[]): Indicators => {
    80	  const closePrices = candles.map((x) => x.close);
    81	  return {
    82	    ma5: sma(closePrices, 5),
    83	    ma10: sma(closePrices, 10),
    84	    ma20: sma(closePrices, 20),
    85	    ma60: sma(closePrices, 60),
    86	    ma240: sma(closePrices, 240),
    87	  };
    88	};
    89	
    90	const inferMorphology = (price: number, indicators: Indicators) => {
    91	  const { ma5, ma10, ma60 } = indicators;
    92	
    93	  if (ma5 && ma10 && price >= ma5 && ma5 >= ma10) {
    94	    return { m: "沿5MA上攻(多方)", d: "短線強勢，守MA10不破" };
    95	  }
    96	
    97	  if (ma60 && price < ma60) {
    98	    return { m: "跌破生命線(偏空)", d: "偏空思維" };
    99	  }
   100	
   101	  return { m: "區間整理", d: "觀察為主" };
   102	};
   103	
   104	const initialStocks: Stock[] = [
   105	  {
   106	    id: "2330",
   107	    name: "台積電",
   108	    price: 1915,
   109	    change: 45,
   110	    changePercent: 2.41,
   111	    themes: ["半導體", "AI"],
   112	    morphology: "多方",
   113	    morphologyDesc: "技術面偏多",
   114	    revenue: { month: "2500億", mom: "+5.2%", yoy: "+20%" },
   115	    aiRating: "強烈買進",
   116	    aiAnalysis: "AI題材發酵，可分批布局",
   117	    news: [],
   118	    risk: {},
   119	  },
   120	  {
   121	    id: "3372",
   122	    name: "典範",
   123	    price: 21.7,
   124	    change: 1.3,
   125	    changePercent: 6.37,
   126	    themes: ["半導體"],
   127	    morphology: "多方整理",
   128	    morphologyDesc: "站上均線，持續上攻",
   129	    revenue: { month: "1.15億", mom: "+1.35%", yoy: "+60%" },
   130	    aiRating: "偏多",
   131	    aiAnalysis: "營收年增60%",
   132	    news: [],
   133	    risk: {},
   134	  },
   135	];
   136	
   137	const Pill = ({ l, v }: { l: string; v?: number | null }) => (
   138	  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
   139	    <div className="mb-1 text-xs text-slate-500">{l}</div>
   140	    <div className="font-black text-slate-800">{v == null ? "--" : v.toFixed(2)}</div>
   141	  </div>
   142	);
   143	
   144	const Num = ({
   145	  l,
   146	  v,
   147	  p,
   148	  c,
   149	}: {
   150	  l: string;
   151	  v?: number | null;
   152	  p: string;
   153	  c: (value: number | null) => void;
   154	}) => (
   155	  <div>
   156	    <div className="mb-2 text-xs font-bold text-slate-500">{l}</div>
   157	    <input
   158	      type="number"
   159	      inputMode="decimal"
   160	      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
   161	      placeholder={p}
   162	      value={v ?? ""}
   163	      onChange={(e) => {
   164	        const raw = e.target.value;
   165	        if (raw === "") {
   166	          c(null);
   167	          return;
   168	        }
   169	        const n = Number(raw);
   170	        c(Number.isFinite(n) ? n : null);
   171	      }}
   172	    />
   173	  </div>
   174	);
   175	
   176	const Row = ({ s, sel, on }: { s: Stock; sel: boolean; on: () => void }) => (
   177	  <div
   178	    onClick={on}
   179	    className={`cursor-pointer border-b border-slate-50 p-4 transition-colors ${
   180	      sel ? "border-l-4 border-l-pink-500 bg-pink-50" : "hover:bg-slate-50"
   181	    }`}
   182	  >
   183	    <div className="mb-1 flex items-center justify-between">
   184	      <div className="font-bold">
   185	        {s.name}
   186	        <span className="text-xs font-normal text-slate-400">{s.id}</span>
   187	      </div>
   188	      <div className={`font-bold ${getPriceColor(s.change)}`}>{fmt(s.price, 1)}</div>
   189	    </div>
   190	    <div className="flex items-center justify-between text-sm">
   191	      <div className="text-xs text-slate-500">{s.morphology}</div>
   192	      <div className={`flex items-center gap-1 ${getPriceColor(s.change)}`}>
   193	        {s.change >= 0 ? (
   194	          <TrendingUp className="h-3 w-3" />
   195	        ) : (
   196	          <TrendingDown className="h-3 w-3" />
   197	        )}
   198	        <span>
   199	          {s.change >= 0 ? "+" : ""}
   200	          {fmt(s.change, 1)}({s.change >= 0 ? "+" : ""}
   201	          {fmt(s.changePercent, 2)}%)
   202	        </span>
   203	      </div>
   204	    </div>
   205	  </div>
   206	);
   207	
   208	const api = {
   209	  fetchQuote: async (symbol: string) => {
   210	    try {
   211	      const r = await fetch(`/api/quote?symbol=${symbol}`);
   212	      return r.ok ? await r.json() : null;
   213	    } catch {
   214	      return null;
   215	    }
   216	  },
   217	  fetchCandles: async (symbol: string, months = 18) => {
   218	    try {
   219	      const r = await fetch(`/api/candles?symbol=${symbol}&months=${months}`);
   220	      if (!r.ok) return [];
   221	      const d = await r.json();
   222	      return d.candles || [];
   223	    } catch {
   224	      return [];
   225	    }
   226	  },
   227	  generateStrategy: async (p: {
   228	    symbol: string;
   229	    name: string;
   230	    price: number;
   231	    morphology: string;
   232	    indicators: Indicators;
   233	    risk: RiskPlan;
   234	  }) => {
   235	    let t = "";
   236	    if (p.morphology.includes("多方")) t += "• 偏多結構，可分批進場\n";
   237	    else if (p.morphology.includes("空方")) t += "• 偏空結構，建議觀望\n";
   238	    else t += "• 區間整理，觀察為主\n";
   239	
   240	    if (p.indicators.ma5 && p.indicators.ma10) {
   241	      t +=
   242	        p.indicators.ma5 > p.indicators.ma10
   243	          ? "• 均線黃金交叉，短線偏多\n"
   244	          : "• 均線死亡交叉，短線偏空\n";
   245	    }
   246	
   247	    if (p.risk.stopLoss) t += `• 停損設在：${p.risk.stopLoss}\n`;
   248	    if (p.risk.takeProfit) t += `• 停利設在：${p.risk.takeProfit}\n`;
   249	    t += "• 嚴守紀律";
   250	    return t;
   251	  },
   252	};
   253	
   254	export default function SaraApp() {
   255	  const [watchlist, setWatchlist] = useState(initialStocks);
   256	  const [selectedId, setSelectedId] = useState(initialStocks[0]?.id || "");
   257	  const selectedStock = useMemo(
   258	    () => watchlist.find((s) => s.id === selectedId) || null,
   259	    [watchlist, selectedId],
   260	  );
/workspace/stock-sara-app$ /bin/bash -lc 'nl -ba SaraApp.tsx | sed -n '"'"'261,520p'"'"''
261	  const [search, setSearch] = useState("");
   262	  const [syncing, setSyncing] = useState(false);
   263	  const [analyzing, setAnalyzing] = useState(false);
   264	  const [strategy, setStrategy] = useState("");
   265	  const [genStrat, setGenStrat] = useState(false);
   266	
   267	  useEffect(() => {
   268	    setStrategy("");
   269	  }, [selectedId]);
   270	
   271	  const patch = (id: string, p: Partial<Stock>) => {
   272	    setWatchlist((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
   273	  };
   274	
   275	  const updRisk = (id: string, r: Partial<RiskPlan>) => {
   276	    setWatchlist((prev) =>
   277	      prev.map((s) => (s.id === id ? { ...s, risk: { ...(s.risk || {}), ...r } } : s)),
   278	    );
   279	  };
   280	
   281	  const sync = async () => {
   282	    try {
   283	      setSyncing(true);
   284	      for (const s of watchlist) {
   285	        const q = await api.fetchQuote(s.id).catch(() => null);
   286	        if (!q) continue;
   287	        patch(s.id, {
   288	          price: typeof q.price === "number" ? q.price : s.price,
   289	          change: typeof q.change === "number" ? q.change : s.change,
   290	          changePercent:
   291	            typeof q.changePercent === "number" ? q.changePercent : s.changePercent,
   292	        });
   293	      }
   294	    } finally {
   295	      setSyncing(false);
   296	    }
   297	  };
   298	
   299	  const refresh = async (id: string) => {
   300	    const s = watchlist.find((x) => x.id === id);
   301	    if (!s) return;
   302	
   303	    try {
   304	      setAnalyzing(true);
   305	      const candles = await api.fetchCandles(id, 18).catch(() => []);
   306	      const ind = candles.length ? calcIndicators(candles) : s.indicators || {};
   307	      const lastClose = candles.length ? candles[candles.length - 1].close : s.price;
   308	      const m = inferMorphology(lastClose, ind);
   309	      patch(id, {
   310	        candles,
   311	        indicators: ind,
   312	        price: lastClose,
   313	        morphology: m.m,
   314	        morphologyDesc: m.d,
   315	      });
   316	    } finally {
   317	      setAnalyzing(false);
   318	    }
   319	  };
   320	
   321	  const genStratFn = async () => {
   322	    if (!selectedStock) return;
   323	    setGenStrat(true);
   324	    setStrategy("");
   325	
   326	    try {
   327	      const t = await api.generateStrategy({
   328	        symbol: selectedStock.id,
   329	        name: selectedStock.name,
   330	        price: selectedStock.price,
   331	        morphology: selectedStock.morphology,
   332	        indicators: selectedStock.indicators || {},
   333	        risk: selectedStock.risk || {},
   334	      });
   335	      setStrategy(t);
   336	    } finally {
   337	      setGenStrat(false);
   338	    }
   339	  };
   340	
   341	  return (
   342	    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
   343	      <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
   344	        <div className="relative border-b border-slate-100 bg-slate-900 p-5 text-white">
   345	          <h1 className="flex items-center gap-2 text-xl font-bold">
   346	            <Activity className="text-pink-400" />莎拉型態學 AI 看盤
   347	          </h1>
   348	          <p className="mt-1 text-xs text-slate-400">K線 x 均線 x 停損停利</p>
   349	          <button
   350	            onClick={sync}
   351	            disabled={syncing}
   352	            className="absolute right-4 top-5 rounded-full bg-slate-800 p-2"
   353	          >
   354	            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
   355	          </button>
   356	        </div>
   357	
   358	        <div className="p-4">
   359	          <div className="relative">
   360	            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
   361	            <input
   362	              type="text"
   363	              placeholder="搜尋股號/股名"
   364	              className="w-full rounded-lg bg-slate-100 py-2 pl-9 pr-4 text-sm"
   365	              value={search}
   366	              onChange={(e) => setSearch(e.target.value)}
   367	            />
   368	          </div>
   369	        </div>
   370	
   371	        <div className="flex-1 overflow-y-auto">
   372	          {watchlist
   373	            .filter((s) => s.name.includes(search) || s.id.includes(search))
   374	            .map((s) => (
   375	              <Row key={s.id} s={s} sel={s.id === selectedId} on={() => setSelectedId(s.id)} />
   376	            ))}
   377	        </div>
   378	
   379	        <div className="border-t border-slate-200 p-4">
   380	          <div className="text-center text-xs text-slate-400">股票檔案庫（開發中）</div>
   381	        </div>
   382	      </div>
   383	
   384	      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
   385	        {!selectedStock ? (
   386	          <div className="text-slate-400">請選擇股票</div>
   387	        ) : (
   388	          <div className="mx-auto max-w-5xl space-y-6">
   389	            <div className="flex items-end justify-between rounded-2xl bg-white p-6 shadow-sm">
   390	              <div>
   391	                <div className="mb-2 flex items-center gap-3">
   392	                  <h2 className="text-3xl font-black">{selectedStock.name}</h2>
   393	                  <span className="text-lg text-slate-500">{selectedStock.id}</span>
   394	                  <a
   395	                    href={`https://tw.stock.yahoo.com/${selectedStock.id}`}
   396	                    target="_blank"
   397	                    rel="noreferrer"
   398	                    className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs"
   399	                  >
   400	                    <ExternalLink className="h-3 w-3" />Yahoo
   401	                  </a>
   402	                  <button
   403	                    onClick={() => refresh(selectedStock.id)}
   404	                    disabled={analyzing}
   405	                    className="flex items-center gap-1 rounded bg-pink-50 px-2 py-1 text-xs font-bold"
   406	                  >
   407	                    {analyzing ? "分析中" : "更新分析"}
   408	                  </button>
   409	                </div>
   410	                <div className="flex gap-2">
   411	                  {selectedStock.themes.map((t, i) => (
   412	                    <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs">
   413	                      {t}
   414	                    </span>
   415	                  ))}
   416	                </div>
   417	              </div>
   418	              <div className="text-right">
   419	                <div className={`text-5xl font-black ${getPriceColor(selectedStock.change)}`}>
   420	                  {fmt(selectedStock.price, 1)}
   421	                </div>
   422	                <div className={`flex items-center gap-1 ${getPriceColor(selectedStock.change)}`}>
   423	                  {selectedStock.change >= 0 ? "+" : ""}
   424	                  {fmt(selectedStock.change, 1)}({selectedStock.change >= 0 ? "+" : ""}
   425	                  {fmt(selectedStock.changePercent, 2)}%)
   426	                </div>
   427	              </div>
   428	            </div>
   429	
   430	            <div className="rounded-2xl bg-white p-6 shadow-sm">
   431	              <div className="mb-4 flex items-center gap-2">
   432	                <BookOpen className="h-5 w-5" />
   433	                <h3 className="font-bold">型態判斷</h3>
   434	              </div>
   435	              <span
   436	                className={`rounded-full px-3 py-1 text-sm font-bold ${
   437	                  selectedStock.morphology.includes("多方")
   438	                    ? "bg-red-100 text-red-700"
   439	                    : "bg-yellow-100 text-yellow-700"
   440	                }`}
   441	              >
   442	                {selectedStock.morphology}
   443	              </span>
   444	              <p className="mt-3 text-slate-600">{selectedStock.morphologyDesc}</p>
   445	              <div className="mt-5 grid grid-cols-3 gap-3">
   446	                <Pill l="MA5" v={selectedStock.indicators?.ma5} />
   447	                <Pill l="MA10" v={selectedStock.indicators?.ma10} />
   448	                <Pill l="MA20" v={selectedStock.indicators?.ma20} />
   449	              </div>
   450	            </div>
   451	
   452	            <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white">
   453	              <div className="mb-4 flex items-start justify-between">
   454	                <div className="flex items-center gap-2">
   455	                  <h3 className="font-bold">AI評等</h3>
   456	                </div>
   457	                <span
   458	                  className={`text-sm font-bold ${
   459	                    selectedStock.aiRating.includes("買") ? "text-red-400" : "text-yellow-400"
   460	                  }`}
   461	                >
   462	                  {selectedStock.aiRating}
   463	                </span>
   464	              </div>
   465	              <p className="text-sm text-indigo-100">{selectedStock.aiAnalysis}</p>
   466	            </div>
   467	
   468	            <div className="rounded-2xl bg-white p-6 shadow-sm">
   469	              <h3 className="mb-4 font-bold">風險規劃</h3>
   470	              <div className="grid grid-cols-3 gap-3">
   471	                <Num
   472	                  l="停損"
   473	                  v={selectedStock.risk?.stopLoss}
   474	                  p="例如 1850"
   475	                  c={(v) => updRisk(selectedStock.id, { stopLoss: v })}
   476	                />
   477	                <Num
   478	                  l="停利"
   479	                  v={selectedStock.risk?.takeProfit}
   480	                  p="例如 2050"
   481	                  c={(v) => updRisk(selectedStock.id, { takeProfit: v })}
   482	                />
   483	                <Num
   484	                  l="移動停利(%)"
   485	                  v={selectedStock.risk?.trailingStopPct}
   486	                  p="例如 5"
   487	                  c={(v) => updRisk(selectedStock.id, { trailingStopPct: v })}
   488	                />
   489	              </div>
   490	            </div>
   491	
   492	            <div className="rounded-2xl bg-white p-6 shadow-sm">
   493	              <div className="mb-3 flex items-center justify-between">
   494	                <h3 className="font-bold">策略建議</h3>
   495	                <button
   496	                  onClick={genStratFn}
   497	                  disabled={genStrat}
   498	                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white"
   499	                >
   500	                  {genStrat ? "生成中..." : "產生策略"}
   501	                </button>
   502	              </div>
   503	              <pre className="whitespace-pre-wrap text-sm text-slate-700">{strategy || "尚未生成"}</pre>
   504	            </div>
   505	          </div>
   506	        )}
   507	      </div>
   508	    </div>
   509	  );
   510	}
/workspace/stock-sara-app$ /bin/bash -lc 'git status --short && git rev-parse --short HEAD'
22ab71a
