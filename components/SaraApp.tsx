"use client";
import React,{useState,useEffect}from"react";
import{Activity,BookOpen,RefreshCw,Search,ExternalLink,TrendingUp,TrendingDown,DollarSign,AlertCircle}from"lucide-react";

type Stock={id:string;name:string;price:number;change:number;changePercent:number;themes:string[]};

const api={
  fetchQuote:async(s:string)=>{
    try{
      const r=await fetch("/api/quote?symbol="+s);
      return r.ok?await r.json():null;
    }catch{return null;}
  }
};

export default function SaraApp(){
  const[stocks,setStocks]=useState<Stock[]>([
    {id:"2330",name:"台積電",price:0,change:0,changePercent:0,themes:["半導體","AI"]},
    {id:"3372",name:"典範",price:0,change:0,changePercent:0,themes:["半導體"]}
  ]);
  const[selected,setSelected]=useState<Stock>(stocks[0]);
  const[search,setSearch]=useState("");
  const[loading,setLoading]=useState(false);

  const f=(n:number)=>n.toFixed(2);
  const c=(n:number)=>n>=0?"text-red-500":"text-green-500";

  useEffect(()=>{syncData();},[]);

  const syncData=async()=>{
    setLoading(true);
    const updated=await Promise.all(stocks.map(async(s)=>{
      const q=await api.fetchQuote(s.id);
      if(!q)return s;
      return{...s,price:q.price||s.price,change:q.change||s.change,changePercent:q.changePercent||s.changePercent};
    }));
    setStocks(updated);
    setSelected(updated.find(x=>x.id===selected.id)||updated[0]);
    setLoading(false);
  };

  return(
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r p-4 flex flex-col">
        <h1 className="text-lg font-bold flex items-center gap-2"><Activity className="text-pink-500"/>莎拉看盤</h1>
        <button onClick={syncData}disabled={loading}className="mt-2 flex items-center justify-center gap-1 bg-pink-500 text-white p-2 rounded text-sm">
          <RefreshCw className={`w-4 h-4 ${loading?"animate-spin":""}`}/>{loading?"更新中...":"更新報價"}
        </button>
        <input type="text"placeholder="搜尋"className="w-full mt-4 p-2 border rounded"value={search}onChange={e=>setSearch(e.target.value)}/>
        <div className="flex-1 overflow-auto mt-2">
          {stocks.filter(s=>s.name.includes(search)||s.id.includes(search)).map(s=>(
            <div key={s.id}onClick={()=>setSelected(s)}className={`p-3 cursor-pointer border-b ${s.id===selected.id?"bg-pink-50":""}`}>
              <div className="font-bold">{s.name}<span className="text-gray-400 text-sm ml-1">{s.id}</span></div>
              <div className={c(s.change)}>{s.change>=0?"+":""}{f(s.change)} ({s.change>=0?"+":""}{f(s.changePercent)}%)</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <div><h2 className="text-3xl font-bold">{selected.name}</h2><span className="text-gray-500">{selected.id}</span></div>
            <a href={"https://tw.stock.yahoo.com/"+selected.id}target="_blank"className="flex items-center gap-1 text-sm text-gray-500"><ExternalLink className="w-4 h-4"/>Yahoo</a>
          </div>
          <div className={`text-5xl font-bold ${c(selected.change)}`}>{f(selected.price)}</div>
          <div className={`flex items-center gap-2 ${c(selected.change)}`}>
            {selected.change>=0?<TrendingUp className="w-6 h-6"/>:<TrendingDown className="w-6 h-6"/>}
            <span className="text-xl">{selected.change>=0?"+":""}{f(selected.change)} ({selected.change>=0?"+":""}{f(selected.changePercent)}%)</span>
          </div>
          <div className="mt-6 flex gap-2">{selected.themes.map(t=><span key={t}className="px-3 py-1 bg-gray-100 rounded text-sm">{t}</span>)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mt-6"><h3 className="font-bold flex items-center gap-2"><BookOpen className="w-5 h-5"/>型態分析</h3><p className="mt-2 text-gray-600">請按「更新報價」載入資料</p></div>
        <div className="bg-white p-6 rounded-lg shadow mt-6"><h3 className="font-bold flex items-center gap-2"><DollarSign className="w-5 h-5"/>營收</h3><p className="mt-2 text-gray-600">待串接API</p></div>
        <div className="bg-white p-6 rounded-lg shadow mt-6"><h3 className="font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5"/>停損停利</h3><p className="mt-2 text-gray-600">待串接API</p></div>
      </div>
    </div>
  );
}
