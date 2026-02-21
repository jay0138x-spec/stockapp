"use client";
import React,{useState,useMemo,useEffect}from"react";
import{Activity,BookOpen,RefreshCw,Search,ExternalLink,TrendingUp,TrendingDown,DollarSign,AlertCircle}from"lucide-react";

type Stock={id:string;name:string;price:number;change:number;changePercent:number;themes:string[]};

const stocks:Stock[]=[
{id:"2330",name:"台積電",price:1915,change:45,changePercent:2.41,themes:["半導體","AI"]},
{id:"3372",name:"典範",price:21.7,change:1.3,changePercent:6.37,themes:["半導體"]}
];

export default function SaraApp(){
const[selected,setSelected]=useState(stocks[0]);
const[search,setSearch]=useState("");
const f=(n:number)=>n.toFixed(2);
const c=(n:number)=>n>=0?"text-red-500":"text-green-500";

return(
<div className="flex h-screen bg-gray-50">
<div className="w-64 bg-white border-r p-4">
<h1 className="text-lg font-bold flex items-center gap-2">< Activity className="text-pink-500"/>莎拉看盤</h1>
<input type="text"placeholder="搜尋"className="w-full mt-4 p-2 border rounded"value={search}onChange={e=>setSearch(e.target.value)}/>
{stocks.filter(s=>s.name.includes(search)||s.id.includes(search)).map(s=>(
<div key={s.id}onClick={()=>setSelected(s)}className={`p-3 cursor-pointer border-b ${s.id===selected.id?"bg-pink-50":""}`}>
<div className="font-bold">{s.name}<span className="text-gray-400 text-sm ml-1">{s.id}</span></div>
<div className={c(s.change)}>{s.change>=0?"+":""}{s.change.toFixed(2)} ({s.change>=0?"+":""}{s.changePercent.toFixed(2)}%)</div>
</div>))}
</div>
<div className="flex-1 p-8">
<div className="bg-white p-6 rounded-lg shadow">
<div className="flex justify-between items-center mb-6">
<div><h2 className="text-3xl font-bold">{selected.name}</h2><span className="text-gray-500">{selected.id}</span></div>
<a href={"https://tw.stock.yahoo.com/"+selected.id}target="_blank"className="flex items-center gap-1 text-sm text-gray-500">< ExternalLink className="w-4 h-4"/>Yahoo</a>
</div>
<div className={`text-5xl font-bold ${c(selected.change)}`}>{selected.price.toFixed(2)}</div>
<div className={`flex items-center gap-2 ${c(selected.change)}`}>
{selected.change>=0?<TrendingUp className="w-6 h-6"/>:<TrendingDown className="w-6 h-6"/>}
<span className="text-xl">{selected.change>=0?"+":""}{selected.change.toFixed(2)} ({selected.change>=0?"+":""}{selected.changePercent.toFixed(2)}%)</span>
</div>
<div className="mt-6 flex gap-2">{selected.themes.map(t=><span key={t}className="px-3 py-1 bg-gray-100 rounded text-sm">{t}</span>)}</div>
</div>
<div className="bg-white p-6 rounded-lg shadow mt-6"><h3 className="font-bold flex items-center gap-2"><BookOpen className="w-5 h-5"/>型態分析</h3><p className="mt-2 text-gray-600">請按「更新分析」載入K線資料</p></div>
<div className="bg-white p-6 rounded-lg shadow mt-6"><h3 className="font-bold flex items-center gap-2"><DollarSign className="w-5 h-5"/>營收</h3><p className="mt-2 text-gray-600">待串接API</p></div>
<div className="bg-white p-6 rounded-lg shadow mt-6"><h3 className="font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5"/>停損停利</h3><p className="mt-2 text-gray-600">待串接API</p></div>
</div>
</div>
);}
