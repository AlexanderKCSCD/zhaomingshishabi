import React, { useState } from "react";
import axios from "axios";

export default function BusinessSimApp() {
  const [name, setName] = useState("");
  const [round, setRound] = useState(1);
  const [loan, setLoan] = useState(0);
  const [production, setProduction] = useState(0);
  const [quality, setQuality] = useState(0);
  const [marketing, setMarketing] = useState(0);
  const [log, setLog] = useState([]);
  const [funds, setFunds] = useState(null);
  const [message, setMessage] = useState("");

  const createCompany = async () => {
    try {
      const res = await axios.post("http://localhost:5000/create_company", { name });
      setMessage(res.data.message);
      setFunds(res.data.funds);
      setLog([]);
    } catch (err) {
      setMessage(err.response?.data?.error || "创建失败");
    }
  };

  const submitStrategy = async () => {
    try {
      const res = await axios.post("http://localhost:5000/submit_strategy", {
        name,
        round,
        loan,
        production,
        quality,
        marketing,
      });
      setMessage(res.data.message);
      setFunds(res.data.remaining_funds);
      fetchCompany();
    } catch (err) {
      setMessage(err.response?.data?.error || "提交失败");
    }
  };

  const fetchCompany = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get_company", {
        params: { name },
      });
      setLog(res.data.history);
      setFunds(res.data.funds);
    } catch (err) {
      setMessage("读取公司信息失败");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Business Simulation</h1>

      <div className="space-y-2">
        <input className="w-full p-2 border rounded" placeholder="公司名" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={createCompany}>创建公司</button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input className="p-2 border rounded" type="number" placeholder="轮次" value={round} onChange={(e) => setRound(Number(e.target.value))} />
        <input className="p-2 border rounded" type="number" placeholder="贷款" value={loan} onChange={(e) => setLoan(Number(e.target.value))} />
        <input className="p-2 border rounded" type="number" placeholder="生产" value={production} onChange={(e) => setProduction(Number(e.target.value))} />
        <input className="p-2 border rounded" type="number" placeholder="质量" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        <input className="p-2 border rounded" type="number" placeholder="营销" value={marketing} onChange={(e) => setMarketing(Number(e.target.value))} />
        <button className="bg-green-600 text-white px-4 py-2 rounded col-span-2" onClick={submitStrategy}>提交策略</button>
      </div>

      <div className="text-sm text-gray-600">资金余额：{funds !== null ? funds + " 元" : "-"}</div>
      <div className="text-red-600">{message}</div>

      <h2 className="text-xl font-semibold mt-4">历史记录</h2>
      <ul className="space-y-1">
        {log.map((entry, idx) => (
          <li key={idx} className="border p-2 rounded">
            第{entry.round}轮：贷款{entry.loan}，生产{entry.production}，质量{entry.quality}，营销{entry.marketing}，剩余{entry.remaining_funds}元
          </li>
        ))}
      </ul>
    </div>
  );
}
