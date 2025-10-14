import React, { useState, useEffect, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function App() {
  const APP_NAME = "System Inventory Items Consumable";
  const theme = { red: "#B91C1C", green: "#16A34A", brown: "#8B5E3C", cream: "#FBF7F2", panel: "#FFFFFF", accent: "#EDE2D6" };

  const LS = (k, def) => {
    try {
      const r = localStorage.getItem(k);
      return r ? JSON.parse(r) : def;
    } catch (e) {
      return def;
    }
  };

  const [stockData, setStockData] = useState(() => LS("stockData", [
    { kodebarang: "BRG001", namabarang: "Filter Oli", satuan: "pcs", statusbarang: "aktif", jumlahbarang: 120 },
    { kodebarang: "BRG002", namabarang: "Kain Lap", satuan: "roll", statusbarang: "aktif", jumlahbarang: 75 },
    { kodebarang: "BRG003", namabarang: "Seal Kit", satuan: "set", statusbarang: "aktif", jumlahbarang: 20 },
    { kodebarang: "BRG004", namabarang: "Belt V", satuan: "pcs", statusbarang: "aktif", jumlahbarang: 200 },
    { kodebarang: "BRG005", namabarang: "Grease", satuan: "kg", statusbarang: "aktif", jumlahbarang: 35 }
  ]));

  const [orderData, setOrderData] = useState(() => LS("orderData", [
    { idorderbarang: 1, nospp: "SPP-1001", kodebarang: "BRG001", namabarang: "Filter Oli", jumlahbarang: 50, satuan: "pcs", tanggalorder: "2025-09-10" },
    { idorderbarang: 2, nospp: "SPP-1002", kodebarang: "BRG002", namabarang: "Kain Lap", jumlahbarang: 30, satuan: "roll", tanggalorder: "2025-09-15" }
  ]));

  const [updateByHcs, setUpdateByHcs] = useState(() => LS("updateByHcs", [
    { IUpdate: 1, IDorderbarang: 1, nospp: "SPP-1001", kodebarang: "BRG001", namabarang: "Filter Oli", jumlahbarang: 50, tanggalorder: "2025-09-10", status: "dikonfirmasi", jumlahkedatangan: 50 }
  ]));

  const [tableStock, setTableStock] = useState(() => LS("tableStock", [
    { IDstock: 1, IDorderbarang: 1, kodebarang: "BRG001", namabarang: "Filter Oli", jumlahbarang: 120, satuan: "pcs", status: "ada", jumlahorder: 50, jumlahoutstanding: 0 }
  ]));

  const [pengeluaran, setPengeluaran] = useState(() => LS("pengeluaran", [
    { IDpengeluaran: 1, IDstock: 1, kodebarang: "BRG003", namabarang: "Seal Kit", jumlahbarang: 5, satuan: "set", area: "Gudang A", subarea: "Rak 1", tanggalpengeluaran: "2025-10-12" },
    { IDpengeluaran: 2, IDstock: 1, kodebarang: "BRG001", namabarang: "Filter Oli", jumlahbarang: 12, satuan: "pcs", area: "Gudang B", subarea: "Rak 4", tanggalpengeluaran: "2025-10-13" }
  ]));

  const [history, setHistory] = useState(() => LS("history", [
    { IDhistory: 1, IDpengeluaran: 1, tanggalpengeluaran: "2025-10-12", kodebarang: "BRG003", namabarang: "Seal Kit", jumlahbarang: 5, satuan: "set", area: "Gudang A", subarea: "Rak 1" }
  ]));

  const [notifications, setNotifications] = useState(() => LS("notifications", [
    { id: Date.now(), type: "info", text: "Preview siap - data dummy terpasang", time: new Date().toLocaleString() }
  ]));

  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);

  const SIM_INTERVAL_MS = 300000;
  const SIM_COUNTDOWN_START = Math.floor(SIM_INTERVAL_MS / 1000);
  const [simRunning, setSimRunning] = useState(true);
  const [simNext, setSimNext] = useState(SIM_COUNTDOWN_START);

  const audioRef = useRef(null);
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioRef.current = ctx;
    } catch (e) {
      audioRef.current = null;
    }
  }, []);

  const playPing = () => {
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.0015;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => { try { osc.stop(); } catch (e) {} }, 120);
    } catch (e) {}
  };

  useEffect(() => { localStorage.setItem("stockData", JSON.stringify(stockData)); }, [stockData]);
  useEffect(() => { localStorage.setItem("orderData", JSON.stringify(orderData)); }, [orderData]);
  useEffect(() => { localStorage.setItem("updateByHcs", JSON.stringify(updateByHcs)); }, [updateByHcs]);
  useEffect(() => { localStorage.setItem("tableStock", JSON.stringify(tableStock)); }, [tableStock]);
  useEffect(() => { localStorage.setItem("pengeluaran", JSON.stringify(pengeluaran)); }, [pengeluaran]);
  useEffect(() => { localStorage.setItem("history", JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem("notifications", JSON.stringify(notifications)); }, [notifications]);

  const chartStock = stockData.map(s => ({ name: s.namabarang, stock: s.jumlahbarang }));
  const chartOrders = useMemo(() => {
    const months = {};
    orderData.forEach(o => {
      const m = (o.tanggalorder || '').slice(0, 7);
      if (!m) return;
      months[m] = (months[m] || 0) + (o.jumlahbarang || 0);
    });
    return Object.entries(months).map(([k, v]) => ({ month: k, orders: v }));
  }, [orderData]);

  const chartPengeluaranDept = useMemo(() => {
    const d = {};
    pengeluaran.forEach(p => { d[p.area] = (d[p.area] || 0) + (p.jumlahbarang || 0); });
    return Object.entries(d).map(([k, v]) => ({ name: k, value: v }));
  }, [pengeluaran]);

  const addNotification = (type, text) => {
    const n = { id: Date.now() + Math.random(), type, text, time: new Date().toLocaleString() };
    setNotifications(s => [n, ...s]);
    playPing();
  };

  useEffect(() => {
    let intervalId = null;
    if (simRunning) {
      intervalId = setInterval(() => {
        const ev = Math.random();
        if (ev < 0.4) {
          const candidates = stockData.filter(s => s.jumlahbarang > 1);
          if (candidates.length) {
            const item = candidates[Math.floor(Math.random() * candidates.length)];
            const qty = Math.min(Math.max(1, Math.floor(Math.random() * 5)), item.jumlahbarang);
            const newId = (pengeluaran.length ? Math.max(...pengeluaran.map(p => p.IDpengeluaran)) + 1 : 1);
            const p = { IDpengeluaran: newId, IDstock: (tableStock[0] && tableStock[0].IDstock) || 1, kodebarang: item.kodebarang, namabarang: item.namabarang, jumlahbarang: qty, satuan: item.satuan, area: 'Produksi', subarea: 'Line 1', tanggalpengeluaran: new Date().toISOString().slice(0, 10) };
            setPengeluaran(s => [p, ...s]);
            setStockData(s => s.map(x => x.kodebarang === item.kodebarang ? { ...x, jumlahbarang: Math.max(0, x.jumlahbarang - qty) } : x));
            const hId = (history.length ? Math.max(...history.map(h => h.IDhistory)) + 1 : 1);
            setHistory(h => [{ IDhistory: hId, IDpengeluaran: p.IDpengeluaran, tanggalpengeluaran: p.tanggalpengeluaran, kodebarang: p.kodebarang, namabarang: p.namabarang, jumlahbarang: p.jumlahbarang, satuan: p.satuan, area: p.area, subarea: p.subarea }, ...h]);
            addNotification('warning', 'Pengeluaran: ' + p.namabarang + ' qty ' + p.jumlahbarang);
          }
        } else if (ev < 0.7) {
          const newId = (orderData.length ? Math.max(...orderData.map(o => o.idorderbarang)) + 1 : 1);
          const sample = stockData[Math.floor(Math.random() * stockData.length)];
          if (sample) {
            const ord = { idorderbarang: newId, nospp: 'SPP-' + newId, kodebarang: sample.kodebarang, namabarang: sample.namabarang, jumlahbarang: Math.floor(Math.random() * 50) + 1, satuan: sample.satuan, tanggalorder: new Date().toISOString().slice(0, 10) };
            setOrderData(s => [ord, ...s]);
            addNotification('info', 'Order masuk: ' + ord.nospp + ' - ' + ord.namabarang);
          }
        } else {
          const newId = (updateByHcs.length ? Math.max(...updateByHcs.map(u => u.IUpdate)) + 1 : 1);
            const sample = orderData.length ? orderData[0] : stockData[0];
            if (sample) {
              const upd = { IUpdate: newId, IDorderbarang: sample.idorderbarang || 1, nospp: sample.nospp || ('SPP-' + newId), kodebarang: sample.kodebarang, namabarang: sample.namabarang, jumlahbarang: 10, tanggalorder: new Date().toISOString().slice(0, 10), status: 'Diterima', jumlahkedatangan: 10 };
              setUpdateByHcs(s => [upd, ...s]);
              setStockData(s => s.map(x => x.kodebarang === upd.kodebarang ? { ...x, jumlahbarang: x.jumlahbarang + upd.jumlahkedatangan } : x));
              addNotification('success', 'Kedatangan: ' + upd.namabarang + ' qty ' + upd.jumlahkedatangan);
            }
        }
      }, SIM_INTERVAL_MS);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [simRunning, stockData, pengeluaran, orderData, updateByHcs, history]);

  useEffect(() => {
    let t = null;
    if (simRunning) {
      setSimNext(SIM_COUNTDOWN_START);
      t = setInterval(() => setSimNext(s => s > 0 ? s - 1 : SIM_COUNTDOWN_START), 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [simRunning]);

  const exportCSV = (rows, filename) => {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => '"' + String(r[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = (htmlContent, title) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const doc = '<html><head><title>' + (title || 'laporan') + '</title><style>body{font-family:Arial;padding:20px}</style></head><body>' + htmlContent + '</body></html>';
    w.document.write(doc);
    w.document.close();
    w.focus();
  };

  const Badge = ({ count }) => (<span style={{ background: theme.red, color: '#fff', borderRadius: 10, padding: '2px 7px', fontSize: 12 }}>{count}</span>);
  const [notifOpen, setNotifOpen] = useState(false);

  const filter = (data) => { if (!search) return data; const q = search.toLowerCase(); return data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q))); };

  const SmallTable = ({ cols, rows, actions }) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', background: theme.panel }}>
        <thead>
          <tr>
            {cols.map(c => <th key={c} style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #eee', fontSize: 13 }}>{c}</th>)}
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f3f3f3' }}>
              {cols.map(c => <td key={c} style={{ padding: '8px 6px', fontSize: 13 }}>{String(r[c] ?? r[c.toLowerCase()] ?? '-')}</td>)}
              {actions && <td style={{ padding: '8px 6px' }}>{actions.map((a, i) => (<button key={i} onClick={() => a.onClick(r)} style={{ marginRight: 8, padding: '6px 8px', fontSize: 12, borderRadius: 6, background: theme.red, color: '#fff', border: 'none' }}>{a.label}</button>))}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Dashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        <div style={{ padding: 16, borderRadius: 8, background: theme.panel, border: '1px solid ' + theme.accent }}>
          <div style={{ fontSize: 13, color: '#666' }}>Total Barang</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stockData.length}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, background: theme.panel, border: '1px solid ' + theme.accent }}>
          <div style={{ fontSize: 13, color: '#666' }}>Total Stok</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stockData.reduce((s, i) => s + i.jumlahbarang, 0)}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, background: theme.panel, border: '1px solid ' + theme.accent }}>
          <div style={{ fontSize: 13, color: '#666' }}>Jumlah Pengeluaran</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{pengeluaran.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: 16, borderRadius: 8, background: theme.panel }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Grafik Stok</h4>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={chartStock}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="stock" fill={theme.green} /></BarChart></ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 8, background: theme.panel }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Grafik Order Bulanan</h4>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartOrders}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line dataKey="orders" stroke={theme.green} strokeWidth={2} /></LineChart></ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 8, background: theme.panel }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Pengeluaran per Dept</h4>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartPengeluaranDept} dataKey="value" nameKey="name" outerRadius={70} label>{chartPengeluaranDept.map((_, i) => (<Cell key={i} fill={[theme.green, theme.red, theme.brown][i % 3]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 8, background: theme.panel }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Peringatan Stok Rendah</h4>
          {stockData.filter(s => s.jumlahbarang < 50).length ? (
            <ul style={{ marginLeft: 18 }}>{stockData.filter(s => s.jumlahbarang < 50).map(s => (<li key={s.kodebarang}>{s.namabarang} - {s.jumlahbarang} {s.satuan}</li>))}</ul>
          ) : (<div style={{ color: '#777', fontSize: 13 }}>Tidak ada stok rendah</div>)}
        </div>
      </div>
    </div>
  );

  const CekStokPage = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Cek Stok</h3>
        <div>
          <button onClick={() => exportCSV(stockData, 'tabelbarang.csv')} style={{ marginRight: 8, padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button>
          <button onClick={() => exportPDF('<h3>Tabelbarang</h3><pre>' + JSON.stringify(stockData, null, 2) + '</pre>', 'tabelbarang')} style={{ padding: '8px 10px', background: theme.brown, color: '#fff', border: 'none', borderRadius: 6 }}>Export PDF (print)</button>
        </div>
      </div>
      <SmallTable cols={["kodebarang", "namabarang", "satuan", "statusbarang", "jumlahbarang"]} rows={filter(stockData)} />
    </div>
  );

  const OrderPage = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Order Barang (SPP)</h3>
        <div>
          <button onClick={() => exportCSV(orderData, 'tabelorderbarang.csv')} style={{ marginRight: 8, padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button>
          <button onClick={() => exportPDF('<h3>Tabelorderbarang</h3><pre>' + JSON.stringify(orderData, null, 2) + '</pre>', 'tabelorderbarang')} style={{ padding: '8px 10px', background: theme.brown, color: '#fff', border: 'none', borderRadius: 6 }}>Export PDF (print)</button>
        </div>
      </div>
      <SmallTable cols={["idorderbarang", "nospp", "kodebarang", "namabarang", "jumlahbarang", "satuan", "tanggalorder"]} rows={filter(orderData)} actions={[{ label: 'Terima', onClick: (r) => {
        const newId = (updateByHcs.length ? Math.max(...updateByHcs.map(u => u.IUpdate)) + 1 : 1);
        const upd = { IUpdate: newId, IDorderbarang: r.idorderbarang, nospp: r.nospp, kodebarang: r.kodebarang, namabarang: r.namabarang, jumlahbarang: r.jumlahbarang, tanggalorder: r.tanggalorder, status: 'Diterima', jumlahkedatangan: r.jumlahbarang };
        setUpdateByHcs(s => [upd, ...s]);
        setStockData(s => s.map(x => x.kodebarang === r.kodebarang ? { ...x, jumlahbarang: x.jumlahbarang + r.jumlahbarang } : x));
        addNotification('success', 'SPP diterima: ' + r.nospp);
      } }]} />
    </div>
  );

  const UpdatePage = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Update by HCS (Kedatangan)</h3>
        <div>
          <button onClick={() => exportCSV(updateByHcs, 'tabelupdatebyhcs.csv')} style={{ marginRight: 8, padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button>
          <button onClick={() => exportPDF('<h3>Tabelupdatebyhcs</h3><pre>' + JSON.stringify(updateByHcs, null, 2) + '</pre>', 'tabelupdatebyhcs')} style={{ padding: '8px 10px', background: theme.brown, color: '#fff', border: 'none', borderRadius: 6 }}>Export PDF (print)</button>
        </div>
      </div>
      <SmallTable cols={["IUpdate", "IDorderbarang", "nospp", "kodebarang", "namabarang", "jumlahbarang", "tanggalorder", "status", "jumlahkedatangan"]} rows={filter(updateByHcs)} />
    </div>
  );

  const PermintaanPage = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Permintaan Barang</h3>
        <div>
          <button onClick={() => exportCSV(history.filter(h => h.aktivitas === 'Permintaan'), 'permintaan.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button>
        </div>
      </div>
      <SmallTable cols={["IDhistory", "kodebarang", "namabarang", "jumlahbarang", "area", "subarea", "tanggalpengeluaran"]} rows={filter(history)} />
    </div>
  );

  const PengeluaranPage = () => {
    const [modalItem, setModalItem] = useState(null);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Pengeluaran Barang</h3>
          <div>
            <button onClick={() => exportCSV(pengeluaran, 'tabelpengeluaranbarang.csv')} style={{ marginRight: 8, padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button>
            <button onClick={() => exportPDF('<h3>Tabelpengeluaranbarang</h3><pre>' + JSON.stringify(pengeluaran, null, 2) + '</pre>', 'tabelpengeluaranbarang')} style={{ padding: '8px 10px', background: theme.brown, color: '#fff', border: 'none', borderRadius: 6 }}>Export PDF (print)</button>
          </div>
        </div>
        <SmallTable cols={["IDpengeluaran", "IDstock", "kodebarang", "namabarang", "jumlahbarang", "satuan", "area", "subarea", "tanggalpengeluaran"]} rows={filter(pengeluaran)} actions={[{ label: 'Lihat Riwayat', onClick: (r) => setModalItem(r) }]} />

        {modalItem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setModalItem(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', margin: '6% auto', padding: 20, width: '90%', maxWidth: 700, borderRadius: 8 }}>
              <h4 style={{ marginTop: 0, marginBottom: 8 }}>Riwayat Pengeluaran: {modalItem.namabarang}</h4>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {history.filter(h => h.kodebarang === modalItem.kodebarang).map(h => (
                  <div key={h.IDhistory} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <div style={{ fontSize: 13 }}>Tanggal: {h.tanggalpengeluaran}</div>
                    <div style={{ fontSize: 13 }}>Jumlah: {h.jumlahbarang} {h.satuan}</div>
                    <div style={{ fontSize: 13 }}>Area: {h.area} / {h.subarea}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}><button onClick={() => setModalItem(null)} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Tutup</button></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const HistoryPage = () => (
    <div>
      <h3 style={{ margin: 0, marginBottom: 12 }}>History</h3>
      <SmallTable cols={["IDhistory", "IDpengeluaran", "tanggalpengeluaran", "kodebarang", "namabarang", "jumlahbarang", "satuan", "area", "subarea"]} rows={filter(history)} />
    </div>
  );

  const DatabaseView = () => (
    <div>
      <h3 style={{ margin: 0, marginBottom: 12 }}>Database View</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        <section style={{ background: theme.panel, padding: 12, borderRadius: 8 }}><strong>Tabelbarang</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(stockData, null, 2)}</pre><div style={{ marginTop: 8 }}><button onClick={() => exportCSV(stockData, 'tabelbarang.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button></div></section>
        <section style={{ background: theme.panel, padding: 12, borderRadius: 8 }}><strong>Tabelorderbarang</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(orderData, null, 2)}</pre><div style={{ marginTop: 8 }}><button onClick={() => exportCSV(orderData, 'tabelorderbarang.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button></div></section>
        <section style={{ background: theme.panel, padding: 12, borderRadius: 8 }}><strong>Tabelupdatebyhcs</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(updateByHcs, null, 2)}</pre><div style={{ marginTop: 8 }}><button onClick={() => exportCSV(updateByHcs, 'tabelupdatebyhcs.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button></div></section>
        <section style={{ background: theme.panel, padding: 12, borderRadius: 8 }}><strong>Tabelstock</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(tableStock, null, 2)}</pre><div style={{ marginTop: 8 }}><button onClick={() => exportCSV(tableStock, 'tabelstock.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button></div></section>
        <section style={{ background: theme.panel, padding: 12, borderRadius: 8 }}><strong>Tabelpengeluaranbarang</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(pengeluaran, null, 2)}</pre><div style={{ marginTop: 8 }}><button onClick={() => exportCSV(pengeluaran, 'tabelpengeluaranbarang.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button></div></section>
        <section style={{ background: theme.panel, padding: 12, borderRadius: 8 }}><strong>Tabelhistory</strong><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(history, null, 2)}</pre><div style={{ marginTop: 8 }}><button onClick={() => exportCSV(history, 'tabelhistory.csv')} style={{ padding: '8px 10px', background: theme.red, color: '#fff', border: 'none', borderRadius: 6 }}>Export CSV</button></div></section>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: theme.cream, minHeight: '100vh' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: 260, background: 'linear-gradient(180deg, rgba(139,94,60,0.14), ' + theme.accent + ' 80%)', padding: 20, boxSizing: 'border-box' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.brown }}>{APP_NAME}</div>
            <div style={{ fontSize: 12, color: '#6b6b6b' }}>Inventory / Consumable</div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Dashboard', 'Cek Stok', 'Order Barang', 'Update Kedatangan', 'Permintaan Barang', 'Pengeluaran Barang', 'History', 'Database View'].map(m => (
              <button key={m} onClick={() => setActivePage(m)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, background: activePage === m ? theme.red : 'transparent', color: activePage === m ? '#fff' : '#333', border: 'none', cursor: 'pointer' }}>{m}</button>
            ))}
          </nav>

          <div style={{ position: 'absolute', left: 20, bottom: 20 }}>
            <label style={{ fontSize: 13, color: '#4b4b4b' }}><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />&nbsp;Dark mode</label>
          </div>
        </aside>

        <main style={{ flex: 1, padding: 20 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0, color: '#333' }}>{activePage}</h2>
              <div style={{ fontSize: 12, color: '#666' }}>Preview interactive — mock data</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setNotifOpen(s => !s)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Notifikasi">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C7.64 5.36 6 7.929 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke={theme.brown} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {notifications.length > 0 && <span style={{ position: 'absolute', top: -8, right: -6 }}><Badge count={notifications.length} /></span>}

                {notifOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 34, width: 320, background: theme.panel, border: '1px solid #eee', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: 8 }}>
                    <div style={{ padding: 10, borderBottom: '1px solid #f5f5f5', fontWeight: 700 }}>Notifikasi</div>
                    <div style={{ maxHeight: 260, overflow: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{ padding: 10, borderBottom: '1px solid #fafafa' }}>
                          <div style={{ fontSize: 13, color: '#333' }}>{n.text}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{n.time}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 10, textAlign: 'right' }}><button onClick={() => setNotifications([])} style={{ padding: '8px 10px', background: theme.brown, color: '#fff', border: 'none', borderRadius: 6 }}>Clear</button></div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 13, color: '#666' }}>Sim: {simRunning ? 'Aktif' : 'Pause'}</div>
                <div style={{ fontSize: 13, color: '#666' }}>Next: {simNext}s</div>
                <button onClick={() => setSimRunning(s => !s)} style={{ padding: '8px 10px', background: simRunning ? theme.red : '#ddd', color: simRunning ? '#fff' : '#333', border: 'none', borderRadius: 6 }}>{simRunning ? 'Pause' : 'Resume'}</button>
              </div>
            </div>
          </header>

          <section style={{ background: theme.panel, padding: 16, borderRadius: 10, minHeight: 460 }}>
            {activePage === 'Dashboard' && <Dashboard />}
            {activePage === 'Cek Stok' && <CekStokPage />}
            {activePage === 'Order Barang' && <OrderPage />}
            {activePage === 'Update Kedatangan' && <UpdatePage />}
            {activePage === 'Permintaan Barang' && <PermintaanPage />}
            {activePage === 'Pengeluaran Barang' && <PengeluaranPage />}
            {activePage === 'History' && <HistoryPage />}
            {activePage === 'Database View' && <DatabaseView />}
          </section>
        </main>
      </div>
    </div>
  );
}
