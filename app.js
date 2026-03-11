const { useState, useEffect, useRef, useMemo, useCallback } = React;
const {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, PieChart, Pie, AreaChart, Area,
} = Recharts;
// lucide-react UMD exposes as either `lucide` or `LucideReact`
const _lucide = window.lucide || window.LucideReact || {};
const {
  LayoutDashboard, BookOpen, BarChart2, Calendar, Settings, ChevronLeft,
  ChevronRight, TrendingUp, TrendingDown, Plus, Filter, Search, Download,
  Upload, X, Check, Zap, Target, AlertTriangle, Award, Activity, Clock,
  ArrowUp, ArrowDown, Minus, Bell, User, Tag, RefreshCw, Eye, EyeOff,
  ChevronDown, ChevronUp, MoreHorizontal, Star, Flame, Shield
} = _lucide;

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SETUPS = ['Breakout','Pullback','Reversal','Gap Fill','VWAP Bounce','Momentum','Scalp','Other'];
const EMOTIONS = ['Neutral','Disciplined','FOMO','Revenge','Fearful','Confident'];
const EMOTION_EMOJI = { Neutral:'😐', Disciplined:'🧠', FOMO:'😨', Revenge:'😤', Fearful:'😰', Confident:'🎯' };
const TICKERS = ['TSLA','NVDA','AAPL','SPY','QQQ','AMD','META','AMZN','MSFT','GOOGL'];

const SEED_TRADES = [
  // Week 1: Feb 9-13
  { id:1,  date:'2026-02-09', time:'09:32', ticker:'TSLA', direction:'Long',  entry:285.40, exit:291.20, size:200, setup:'Breakout',    emotion:'Disciplined', notes:'Perfect gap-and-go setup. Held to target.' },
  { id:2,  date:'2026-02-09', time:'10:15', ticker:'NVDA', direction:'Long',  entry:624.50, exit:618.30, size:100, setup:'Pullback',    emotion:'Fearful',     notes:'Bailed too early on the dip — should have held.' },
  { id:3,  date:'2026-02-09', time:'11:40', ticker:'SPY',  direction:'Short', entry:497.80, exit:495.40, size:300, setup:'Reversal',   emotion:'Disciplined', notes:'' },
  { id:4,  date:'2026-02-10', time:'09:35', ticker:'AAPL', direction:'Long',  entry:227.10, exit:232.85, size:200, setup:'Gap Fill',    emotion:'Confident',   notes:'Clean gap fill trade. Textbook.' },
  { id:5,  date:'2026-02-10', time:'10:02', ticker:'QQQ',  direction:'Long',  entry:521.30, exit:'525.90', size:150, setup:'Breakout',  emotion:'Disciplined', notes:'' },
  { id:6,  date:'2026-02-10', time:'13:20', ticker:'AMD',  direction:'Long',  entry:168.40, exit:165.20, size:200, setup:'Pullback',   emotion:'FOMO',        notes:'Chased this one — entered way too late.' },
  { id:7,  date:'2026-02-11', time:'09:31', ticker:'TSLA', direction:'Long',  entry:289.50, exit:298.70, size:300, setup:'Momentum',   emotion:'Confident',   notes:'Nailed the open momentum. Stuck to my plan.' },
  { id:8,  date:'2026-02-11', time:'10:45', ticker:'META', direction:'Short', entry:612.40, exit:606.10, size:100, setup:'Reversal',   emotion:'Disciplined', notes:'' },
  { id:9,  date:'2026-02-11', time:'14:00', ticker:'NVDA', direction:'Long',  entry:628.90, exit:622.40, size:100, setup:'Pullback',   emotion:'Revenge',     notes:'Revenge trade after morning loss. Knew it was wrong.' },
  { id:10, date:'2026-02-12', time:'09:33', ticker:'SPY',  direction:'Long',  entry:498.60, exit:502.10, size:400, setup:'Gap Fill',   emotion:'Disciplined', notes:'' },
  { id:11, date:'2026-02-12', time:'10:20', ticker:'TSLA', direction:'Short', entry:292.30, exit:287.40, size:200, setup:'Reversal',   emotion:'Confident',   notes:'Spotted the double top early.' },
  { id:12, date:'2026-02-12', time:'11:30', ticker:'AAPL', direction:'Long',  entry:229.50, exit:227.80, size:300, setup:'VWAP Bounce',emotion:'Fearful',     notes:'Got spooked by a red candle, closed too early.' },
  { id:13, date:'2026-02-13', time:'09:35', ticker:'QQQ',  direction:'Long',  entry:523.70, exit:528.40, size:200, setup:'Breakout',   emotion:'Disciplined', notes:'' },
  { id:14, date:'2026-02-13', time:'10:55', ticker:'AMD',  direction:'Long',  entry:170.30, exit:'173.60', size:300, setup:'Momentum', emotion:'Confident',   notes:'Great follow-through.' },

  // Week 2: Feb 16-20
  { id:15, date:'2026-02-17', time:'09:31', ticker:'NVDA', direction:'Long',  entry:631.00, exit:641.80, size:150, setup:'Gap Fill',   emotion:'Disciplined', notes:'Pre-market thesis played out perfectly.' },
  { id:16, date:'2026-02-17', time:'10:40', ticker:'TSLA', direction:'Short', entry:287.60, exit:291.20, size:200, setup:'Reversal',   emotion:'FOMO',        notes:'Faded a strong trend — bad idea.' },
  { id:17, date:'2026-02-17', time:'13:10', ticker:'SPY',  direction:'Long',  entry:500.20, exit:503.70, size:300, setup:'VWAP Bounce',emotion:'Neutral',     notes:'' },
  { id:18, date:'2026-02-18', time:'09:32', ticker:'AAPL', direction:'Long',  entry:231.40, exit:236.90, size:200, setup:'Breakout',   emotion:'Disciplined', notes:'Classic breakout with volume.' },
  { id:19, date:'2026-02-18', time:'10:15', ticker:'GOOGL',direction:'Long',  entry:185.30, exit:183.10, size:300, setup:'Pullback',   emotion:'Revenge',     notes:'Revenge trade — should not have been in this.' },
  { id:20, date:'2026-02-18', time:'11:00', ticker:'META', direction:'Long',  entry:608.70, exit:615.40, size:100, setup:'Momentum',   emotion:'Neutral',     notes:'' },
  { id:21, date:'2026-02-19', time:'09:34', ticker:'TSLA', direction:'Long',  entry:290.10, exit:297.80, size:300, setup:'Breakout',   emotion:'Confident',   notes:'Strong open, held full target. Perfect trade.' },
  { id:22, date:'2026-02-19', time:'10:30', ticker:'NVDA', direction:'Long',  entry:635.20, exit:631.40, size:100, setup:'Pullback',   emotion:'FOMO',        notes:'Jumped in too early, no confirmation.' },
  { id:23, date:'2026-02-19', time:'14:20', ticker:'AMD',  direction:'Short', entry:172.40, exit:169.80, size:200, setup:'Reversal',   emotion:'Disciplined', notes:'Clean setup off resistance.' },
  { id:24, date:'2026-02-20', time:'09:31', ticker:'SPY',  direction:'Long',  entry:501.50, exit:506.30, size:400, setup:'Gap Fill',   emotion:'Disciplined', notes:'' },
  { id:25, date:'2026-02-20', time:'10:45', ticker:'QQQ',  direction:'Short', entry:525.80, exit:522.10, size:150, setup:'Reversal',   emotion:'Confident',   notes:'Nailed the short at resistance.' },
  { id:26, date:'2026-02-20', time:'12:30', ticker:'AAPL', direction:'Long',  entry:233.20, exit:231.50, size:200, setup:'Pullback',   emotion:'Fearful',     notes:'Closed early, left money on the table.' },

  // Week 3: Feb 23-27 (rough week)
  { id:27, date:'2026-02-23', time:'09:32', ticker:'NVDA', direction:'Long',  entry:629.40, exit:621.70, size:200, setup:'Breakout',   emotion:'FOMO',        notes:'Chased the open — no setup, just noise.' },
  { id:28, date:'2026-02-23', time:'10:20', ticker:'TSLA', direction:'Long',  entry:286.30, exit:281.90, size:300, setup:'Pullback',   emotion:'Revenge',     notes:'Trying to make back morning losses. Dumb.' },
  { id:29, date:'2026-02-23', time:'11:15', ticker:'META', direction:'Long',  entry:610.50, exit:607.30, size:100, setup:'VWAP Bounce',emotion:'Fearful',     notes:'' },
  { id:30, date:'2026-02-24', time:'09:35', ticker:'SPY',  direction:'Long',  entry:499.80, exit:505.40, size:400, setup:'Gap Fill',   emotion:'Disciplined', notes:'Bounced back. Clean setup.' },
  { id:31, date:'2026-02-24', time:'10:10', ticker:'AAPL', direction:'Long',  entry:230.70, exit:235.80, size:200, setup:'Breakout',   emotion:'Confident',   notes:'Great momentum trade.' },
  { id:32, date:'2026-02-24', time:'13:40', ticker:'AMD',  direction:'Short', entry:171.20, exit:174.60, size:300, setup:'Reversal',   emotion:'Revenge',     notes:'Kept fighting the trend. Never again.' },
  { id:33, date:'2026-02-25', time:'09:31', ticker:'TSLA', direction:'Long',  entry:288.40, exit:295.60, size:200, setup:'Momentum',   emotion:'Disciplined', notes:'Composed trade after Tuesday losses.' },
  { id:34, date:'2026-02-25', time:'10:30', ticker:'NVDA', direction:'Long',  entry:637.80, exit:644.20, size:100, setup:'Breakout',   emotion:'Disciplined', notes:'Setup confirmed, let it run.' },
  { id:35, date:'2026-02-25', time:'11:50', ticker:'QQQ',  direction:'Long',  entry:524.30, exit:522.10, size:200, setup:'Pullback',   emotion:'Fearful',     notes:'Stopped out slightly early on volatility.' },
  { id:36, date:'2026-02-26', time:'09:33', ticker:'GOOGL',direction:'Long',  entry:187.40, exit:191.60, size:300, setup:'Gap Fill',   emotion:'Neutral',     notes:'' },
  { id:37, date:'2026-02-26', time:'10:50', ticker:'MSFT', direction:'Long',  entry:412.30, exit:408.90, size:200, setup:'Pullback',   emotion:'FOMO',        notes:'Didn\'t wait for confirmation.' },
  { id:38, date:'2026-02-27', time:'09:31', ticker:'SPY',  direction:'Long',  entry:503.40, exit:508.80, size:400, setup:'Breakout',   emotion:'Disciplined', notes:'Clean Friday breakout.' },
  { id:39, date:'2026-02-27', time:'10:30', ticker:'TSLA', direction:'Short', entry:291.80, exit:285.90, size:200, setup:'Reversal',   emotion:'Confident',   notes:'Perfect short setup — weekly resistance.' },

  // Week 4: Mar 2-6
  { id:40, date:'2026-03-02', time:'09:32', ticker:'NVDA', direction:'Long',  entry:640.50, exit:651.30, size:150, setup:'Gap Fill',   emotion:'Disciplined', notes:'Gap fill on earnings beat. Let it run.' },
  { id:41, date:'2026-03-02', time:'10:15', ticker:'AAPL', direction:'Long',  entry:235.60, exit:240.20, size:200, setup:'Breakout',   emotion:'Confident',   notes:'Broke out of 3-day consolidation.' },
  { id:42, date:'2026-03-02', time:'14:00', ticker:'AMD',  direction:'Long',  entry:173.80, exit:171.40, size:200, setup:'VWAP Bounce',emotion:'Fearful',     notes:'Got scared out of a winning trade.' },
  { id:43, date:'2026-03-03', time:'09:31', ticker:'TSLA', direction:'Long',  entry:293.70, exit:301.40, size:300, setup:'Momentum',   emotion:'Disciplined', notes:'Best trade of the week. Held through pullback.' },
  { id:44, date:'2026-03-03', time:'10:40', ticker:'SPY',  direction:'Short', entry:505.60, exit:502.10, size:400, setup:'Reversal',   emotion:'Neutral',     notes:'' },
  { id:45, date:'2026-03-03', time:'13:15', ticker:'META', direction:'Long',  entry:616.80, exit:621.30, size:100, setup:'Pullback',   emotion:'Disciplined', notes:'' },
  { id:46, date:'2026-03-04', time:'09:33', ticker:'GOOGL',direction:'Long',  entry:189.20, exit:186.80, size:300, setup:'Breakout',   emotion:'FOMO',        notes:'Breakout failure — entered on weak volume.' },
  { id:47, date:'2026-03-04', time:'10:20', ticker:'NVDA', direction:'Long',  entry:648.30, exit:655.70, size:100, setup:'Momentum',   emotion:'Confident',   notes:'Continuation from yesterday.' },
  { id:48, date:'2026-03-04', time:'11:30', ticker:'QQQ',  direction:'Long',  entry:527.40, exit:531.90, size:200, setup:'VWAP Bounce',emotion:'Neutral',     notes:'' },
  { id:49, date:'2026-03-05', time:'09:31', ticker:'TSLA', direction:'Long',  entry:298.40, exit:306.70, size:200, setup:'Breakout',   emotion:'Disciplined', notes:'Held through the pullback at 302. Perfect.' },
  { id:50, date:'2026-03-05', time:'10:45', ticker:'AAPL', direction:'Short', entry:238.90, exit:242.10, size:300, setup:'Reversal',   emotion:'Revenge',     notes:'Fought the trend all day. Stubborn.' },
  { id:51, date:'2026-03-05', time:'13:00', ticker:'AMD',  direction:'Long',  entry:175.60, exit:179.20, size:300, setup:'Momentum',   emotion:'Neutral',     notes:'' },
  { id:52, date:'2026-03-06', time:'09:32', ticker:'SPY',  direction:'Long',  entry:506.80, exit:512.40, size:500, setup:'Gap Fill',   emotion:'Disciplined', notes:'Week-end gap fill. Size up on conviction plays.' },
  { id:53, date:'2026-03-06', time:'10:30', ticker:'MSFT', direction:'Long',  entry:416.40, exit:421.80, size:200, setup:'Breakout',   emotion:'Confident',   notes:'ATH breakout — held the whole move.' },

  // Week 5: Mar 9-10
  { id:54, date:'2026-03-09', time:'09:31', ticker:'NVDA', direction:'Long',  entry:652.10, exit:661.40, size:150, setup:'Gap Fill',   emotion:'Disciplined', notes:'Fresh week. Disciplined and focused.' },
  { id:55, date:'2026-03-09', time:'10:05', ticker:'TSLA', direction:'Short', entry:301.50, exit:295.80, size:200, setup:'Reversal',   emotion:'Confident',   notes:'Clean rejection at weekly level.' },
  { id:56, date:'2026-03-09', time:'11:20', ticker:'SPY',  direction:'Long',  entry:509.30, exit:513.60, size:400, setup:'Breakout',   emotion:'Disciplined', notes:'' },
  { id:57, date:'2026-03-10', time:'09:31', ticker:'AAPL', direction:'Long',  entry:241.20, exit:246.80, size:200, setup:'Momentum',   emotion:'Confident',   notes:'Strong open, held to EOD.' },
  { id:58, date:'2026-03-10', time:'10:15', ticker:'NVDA', direction:'Long',  entry:658.40, exit:654.20, size:100, setup:'Pullback',   emotion:'FOMO',        notes:'Rushed in on weak pullback signal.' },
  { id:59, date:'2026-03-10', time:'11:00', ticker:'QQQ',  direction:'Long',  entry:529.80, exit:534.50, size:200, setup:'VWAP Bounce',emotion:'Disciplined', notes:'Perfect VWAP bounce entry.' },
].map(t => ({
  ...t,
  exit: parseFloat(t.exit),
  pnl: parseFloat((((parseFloat(t.exit) - t.entry) * (t.direction === 'Long' ? 1 : -1)) * t.size).toFixed(2)),
  pnlPct: parseFloat(((Math.abs(parseFloat(t.exit) - t.entry) / t.entry) * 100 * (((parseFloat(t.exit) - t.entry) * (t.direction === 'Long' ? 1 : -1)) >= 0 ? 1 : -1)).toFixed(2)),
  duration: Math.floor(Math.random() * 180 + 5) + 'm',
  rMultiple: parseFloat(((((parseFloat(t.exit) - t.entry) * (t.direction === 'Long' ? 1 : -1)) * t.size) / (Math.abs(t.entry * 0.01 * t.size))).toFixed(2)),
}));

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt$ = v => {
  const abs = Math.abs(v);
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (v < 0 ? '-$' : '$') + str;
};
const fmtPct = v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
const fmtDate = d => {
  const [y,m,day] = d.split('-');
  return `${m}/${day}/${y}`;
};
const pnlClass = v => v >= 0 ? 'pnl-positive' : 'pnl-negative';
const emotionColor = {
  Neutral:     { bg:'#1e293b', text:'#94a3b8' },
  Disciplined: { bg:'#052e16', text:'#22c55e' },
  FOMO:        { bg:'#2a1a00', text:'#f59e0b' },
  Revenge:     { bg:'#2a0a0a', text:'#ef4444' },
  Fearful:     { bg:'#1a1040', text:'#818cf8' },
  Confident:   { bg:'#0a1f2e', text:'#38bdf8' },
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return React.createElement('div', { className:'fixed top-4 right-4 z-50 flex flex-col gap-2' },
    toasts.map(t => React.createElement('div', {
      key: t.id,
      className: 'toast flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl',
      style: { background:'#1c2230', border:'1px solid #22c55e40', color:'#e2e8f0', minWidth:'280px' }
    },
      React.createElement('span', { style:{color:'#22c55e'} }, '✓'),
      React.createElement('span', null, t.msg)
    ))
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const items = [
    { id:'dashboard', icon: LayoutDashboard, label:'Dashboard' },
    { id:'tradelog',  icon: BookOpen,        label:'Trade Log' },
    { id:'analytics', icon: BarChart2,       label:'Analytics' },
    { id:'calendar',  icon: Calendar,        label:'Calendar' },
    { id:'settings',  icon: Settings,        label:'Settings' },
  ];
  return React.createElement('div', {
    className:'flex flex-col h-screen sticky top-0 transition-all duration-300',
    style:{ width: collapsed ? 60 : 220, background:'#161b22', borderRight:'1px solid #1e293b', flexShrink:0 }
  },
    // Logo
    React.createElement('div', { className:'flex items-center gap-3 px-4 py-5', style:{borderBottom:'1px solid #1e293b', minHeight:64} },
      React.createElement('div', {
        className:'flex items-center justify-center rounded-lg',
        style:{width:32,height:32,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',flexShrink:0}
      }, React.createElement(Activity, {size:18,color:'white'})),
      !collapsed && React.createElement('span', {
        className:'font-heading font-bold text-base tracking-tight',
        style:{color:'#e2e8f0'}
      }, 'TradeLog')
    ),
    // Nav items
    React.createElement('nav', { className:'flex-1 py-4 flex flex-col gap-1 px-2' },
      items.map(item => {
        const Icon = item.icon;
        const active = page === item.id;
        return React.createElement('button', {
          key: item.id,
          onClick: () => setPage(item.id),
          className:'nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left',
          style:{
            background: active ? '#1c2230' : 'transparent',
            color: active ? '#3b82f6' : '#64748b',
            border: active ? '1px solid #1e3a5f' : '1px solid transparent',
          }
        },
          React.createElement(Icon, { size:18 }),
          !collapsed && React.createElement('span', null, item.label)
        );
      })
    ),
    // Collapse toggle
    React.createElement('button', {
      onClick: () => setCollapsed(!collapsed),
      className:'flex items-center justify-center py-4 nav-item',
      style:{ borderTop:'1px solid #1e293b', color:'#475569' }
    },
      collapsed
        ? React.createElement(ChevronRight, {size:16})
        : React.createElement('div', {className:'flex items-center gap-2 text-xs'}, React.createElement(ChevronLeft, {size:16}), 'Collapse')
    )
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return React.createElement('div', {
    className:'card-hover rounded-xl p-5 flex flex-col gap-2',
    style:{ background:'#161b22', border:'1px solid #1e293b' }
  },
    React.createElement('div', { className:'flex items-center justify-between' },
      React.createElement('span', { className:'text-xs font-medium uppercase tracking-wider', style:{color:'#475569'} }, label),
      Icon && React.createElement('div', {
        className:'flex items-center justify-center rounded-lg w-8 h-8',
        style:{ background: color + '15' }
      }, React.createElement(Icon, {size:16, color}))
    ),
    React.createElement('div', { className:'stat-anim text-2xl font-heading font-bold', style:{color: color || '#e2e8f0'} }, value),
    sub && React.createElement('div', { className:'text-xs', style:{color:'#475569'} }, sub)
  );
}

// ─── EQUITY CURVE CHART ───────────────────────────────────────────────────────
function EquityCurve({ trades }) {
  const data = useMemo(() => {
    const sorted = [...trades].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    let cum = 0;
    const byDay = {};
    sorted.forEach(t => {
      cum += t.pnl;
      byDay[t.date] = byDay[t.date] || { date: t.date, pnl: 0 };
      byDay[t.date].pnl += t.pnl;
      byDay[t.date].cumPnl = cum;
    });
    return Object.values(byDay).map(d => ({ ...d, label: fmtDate(d.date) }));
  }, [trades]);

  const isUp = data.length > 0 && data[data.length-1].cumPnl >= 0;
  const color = isUp ? '#22c55e' : '#ef4444';

  return React.createElement('div', { className:'rounded-xl p-5', style:{background:'#161b22',border:'1px solid #1e293b'} },
    React.createElement('div', {className:'flex items-center justify-between mb-4'},
      React.createElement('h3', {className:'font-heading font-semibold text-sm', style:{color:'#e2e8f0'}}, 'Equity Curve'),
      React.createElement('span', {className:'text-xs font-mono', style:{color}}, isUp ? '▲' : '▼')
    ),
    React.createElement(ResponsiveContainer, {width:'100%', height:200},
      React.createElement(AreaChart, {data, margin:{top:5,right:5,left:0,bottom:5}},
        React.createElement('defs',null,
          React.createElement('linearGradient',{id:'equityGrad',x1:'0',y1:'0',x2:'0',y2:'1'},
            React.createElement('stop',{offset:'5%',stopColor:color,stopOpacity:0.3}),
            React.createElement('stop',{offset:'95%',stopColor:color,stopOpacity:0})
          )
        ),
        React.createElement(CartesianGrid,{strokeDasharray:'3 3',stroke:'#1e293b',vertical:false}),
        React.createElement(XAxis,{dataKey:'label',tick:{fill:'#475569',fontSize:10},tickLine:false,axisLine:false,interval:'preserveStartEnd'}),
        React.createElement(YAxis,{tickFormatter:v=>fmt$(v),tick:{fill:'#475569',fontSize:10},tickLine:false,axisLine:false,width:70}),
        React.createElement(Tooltip,{
          contentStyle:{background:'#1c2230',border:'1px solid #1e293b',borderRadius:8,color:'#e2e8f0',fontSize:12},
          formatter:(v)=>[fmt$(v),'Cumulative P&L'],
          labelStyle:{color:'#94a3b8'}
        }),
        React.createElement(ReferenceLine,{y:0,stroke:'#334155',strokeDasharray:'3 3'}),
        React.createElement(Area,{type:'monotone',dataKey:'cumPnl',stroke:color,strokeWidth:2,fill:'url(#equityGrad)'})
      )
    )
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ trades, setPage }) {
  const stats = useMemo(() => {
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const be = trades.filter(t => t.pnl === 0);
    const totalPnl = trades.reduce((s,t) => s+t.pnl, 0);
    const avgWin = wins.length ? wins.reduce((s,t)=>s+t.pnl,0)/wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s,t)=>s+t.pnl,0)/losses.length) : 0;
    const profitFactor = avgLoss > 0 ? (wins.reduce((s,t)=>s+t.pnl,0)/Math.abs(losses.reduce((s,t)=>s+t.pnl,0))) : 0;
    return { totalPnl, winRate: wins.length/trades.length*100, wins:wins.length, losses:losses.length, be:be.length, avgWin, avgLoss, profitFactor };
  }, [trades]);

  const insights = useMemo(() => {
    const byEmotion = {};
    EMOTIONS.forEach(e => {
      const et = trades.filter(t=>t.emotion===e);
      if(!et.length) return;
      byEmotion[e] = { wr: et.filter(t=>t.pnl>0).length/et.length*100, count:et.length };
    });
    const byDow = {};
    ['Mon','Tue','Wed','Thu','Fri'].forEach((d,i)=>{ byDow[d]={pnl:0,count:0,wins:0}; });
    trades.forEach(t => {
      const dow = new Date(t.date).toLocaleDateString('en-US',{weekday:'short'});
      if(byDow[dow]) { byDow[dow].pnl+=t.pnl; byDow[dow].count++; byDow[dow].wins+=t.pnl>0?1:0; }
    });
    const bestDow = Object.entries(byDow).sort((a,b)=>b[1].pnl-a[1].pnl)[0];
    const worstDow = Object.entries(byDow).sort((a,b)=>a[1].pnl-b[1].pnl)[0];
    const fomoWr = byEmotion['FOMO']?.wr || 0;
    const discWr = byEmotion['Disciplined']?.wr || 0;
    const revengeWr = byEmotion['Revenge']?.wr || 0;

    const byTicker = {};
    trades.forEach(t => {
      if(!byTicker[t.ticker]) byTicker[t.ticker]={pnl:0,wins:0,count:0};
      byTicker[t.ticker].pnl+=t.pnl; byTicker[t.ticker].wins+=t.pnl>0?1:0; byTicker[t.ticker].count++;
    });
    const bestTicker = Object.entries(byTicker).sort((a,b)=>b[1].pnl-a[1].pnl)[0];

    // Check for loss streak pattern
    const sorted = [...trades].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
    let maxRevStreak=0, cur=0;
    sorted.forEach(t=>{ if(t.pnl<0){cur++;maxRevStreak=Math.max(maxRevStreak,cur);}else cur=0; });

    return [
      fomoWr < discWr - 15 && { icon:'🚨', color:'#ef4444', title:'Emotion Alert', body:`When trading with FOMO, your win rate is ${fomoWr.toFixed(0)}% vs ${discWr.toFixed(0)}% when Disciplined — a ${(discWr-fomoWr).toFixed(0)}pt difference.` },
      revengeWr < 40 && { icon:'⚠️', color:'#f59e0b', title:'Revenge Pattern', body:`Revenge trades have a ${revengeWr.toFixed(0)}% win rate. Consider a rule: 3 losses → stop trading for the day.` },
      bestDow && { icon:'📅', color:'#3b82f6', title:'Best Day', body:`${bestDow[0]} is your best trading day (${fmt$(bestDow[1].pnl)} total). ${worstDow[0]} is your worst — consider reducing size.` },
      bestTicker && { icon:'🎯', color:'#22c55e', title:'Best Ticker', body:`${bestTicker[0]} is your most profitable ticker at ${fmt$(bestTicker[1].pnl)} total with ${(bestTicker[1].wins/bestTicker[1].count*100).toFixed(0)}% win rate.` },
    ].filter(Boolean);
  }, [trades]);

  const recent = [...trades].sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time)).slice(0,8);

  return React.createElement('div', { className:'flex flex-col gap-6 p-6 overflow-auto h-screen' },
    React.createElement('div', { className:'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h1', { className:'font-heading font-bold text-xl', style:{color:'#e2e8f0'} }, 'Dashboard'),
        React.createElement('p', { className:'text-xs mt-1', style:{color:'#475569'} }, 'Today: ' + fmtDate('2026-03-10'))
      )
    ),
    // Stats row
    React.createElement('div', { className:'grid grid-cols-4 gap-4' },
      React.createElement(StatCard, { label:'Total P&L', value:fmt$(stats.totalPnl), sub:`${fmtPct(stats.totalPnl/10000*100)} return`, icon:TrendingUp, color: stats.totalPnl>=0?'#22c55e':'#ef4444' }),
      React.createElement(StatCard, { label:'Win Rate', value:`${stats.winRate.toFixed(1)}%`, sub:`${stats.wins}W / ${stats.losses}L / ${stats.be}BE`, icon:Target, color:'#3b82f6' }),
      React.createElement(StatCard, { label:'Avg Win / Loss', value:`${stats.avgLoss>0?(stats.avgWin/stats.avgLoss).toFixed(2):'—'}R`, sub:`${fmt$(stats.avgWin)} avg win · ${fmt$(stats.avgLoss)} avg loss`, icon:Activity, color:'#f59e0b' }),
      React.createElement(StatCard, { label:'Total Trades', value:trades.length, sub:`Profit Factor: ${stats.profitFactor.toFixed(2)}`, icon:Zap, color:'#818cf8' }),
    ),
    // Charts row
    React.createElement('div', { className:'grid gap-4', style:{gridTemplateColumns:'2fr 1fr'} },
      React.createElement(EquityCurve, { trades }),
      React.createElement('div', { className:'rounded-xl p-5 flex flex-col gap-3', style:{background:'#161b22',border:'1px solid #1e293b'} },
        React.createElement('h3', {className:'font-heading font-semibold text-sm', style:{color:'#e2e8f0'}}, 'AI Insights'),
        ...insights.map((ins,i) => React.createElement('div', {
          key:i,
          className:'rounded-lg p-3 text-xs leading-relaxed',
          style:{background:'#0d1117',border:`1px solid ${ins.color}25`}
        },
          React.createElement('div', {className:'flex items-center gap-2 mb-1'},
            React.createElement('span', null, ins.icon),
            React.createElement('span', {className:'font-semibold font-heading', style:{color:ins.color}}, ins.title)
          ),
          React.createElement('span', {style:{color:'#94a3b8'}}, ins.body)
        ))
      )
    ),
    // Recent trades
    React.createElement('div', { className:'rounded-xl', style:{background:'#161b22',border:'1px solid #1e293b'} },
      React.createElement('div', { className:'flex items-center justify-between px-5 py-4', style:{borderBottom:'1px solid #1e293b'} },
        React.createElement('h3', {className:'font-heading font-semibold text-sm', style:{color:'#e2e8f0'}}, 'Recent Trades'),
        React.createElement('button', {
          onClick:()=>setPage('tradelog'),
          className:'text-xs font-medium',
          style:{color:'#3b82f6'}
        }, 'View all →')
      ),
      React.createElement('table', { className:'w-full text-xs' },
        React.createElement('thead', null,
          React.createElement('tr', { style:{borderBottom:'1px solid #1e293b'} },
            ['Date','Ticker','Dir','Entry','Exit','P&L','Setup','Emotion'].map(h =>
              React.createElement('th', {key:h, className:'text-left px-5 py-3 font-medium uppercase tracking-wider', style:{color:'#475569'}}, h)
            )
          )
        ),
        React.createElement('tbody', null,
          recent.map((t,i) => React.createElement('tr', {
            key:t.id,
            className:'row-hover',
            style:{borderBottom:'1px solid #0d111780', background: i%2===0?'transparent':'#0d111730'}
          },
            React.createElement('td', {className:'px-5 py-3 font-mono', style:{color:'#64748b'}}, fmtDate(t.date)),
            React.createElement('td', {className:'px-5 py-3 font-heading font-bold', style:{color:'#e2e8f0'}}, t.ticker),
            React.createElement('td', {className:'px-5 py-3'},
              React.createElement('span', {className:`badge-${t.direction.toLowerCase()} rounded px-2 py-0.5 text-xs font-medium`}, t.direction)
            ),
            React.createElement('td', {className:'px-5 py-3 font-mono', style:{color:'#94a3b8'}}, '$'+t.entry.toFixed(2)),
            React.createElement('td', {className:'px-5 py-3 font-mono', style:{color:'#94a3b8'}}, '$'+t.exit.toFixed(2)),
            React.createElement('td', {className:'px-5 py-3 font-mono font-bold '+pnlClass(t.pnl)}, fmt$(t.pnl)),
            React.createElement('td', {className:'px-5 py-3', style:{color:'#64748b'}}, t.setup),
            React.createElement('td', {className:'px-5 py-3'},
              React.createElement('span', {className:'emotion-chip', style:{background:emotionColor[t.emotion]?.bg, color:emotionColor[t.emotion]?.text}},
                EMOTION_EMOJI[t.emotion], t.emotion
              )
            )
          ))
        )
      )
    )
  );
}

// ─── TRADE LOG ────────────────────────────────────────────────────────────────
function TradeLog({ trades, addTrade, toast }) {
  const [form, setForm] = useState({ ticker:'', direction:'Long', entry:'', exit:'', size:'', date:'2026-03-10', time:'09:30', setup:'Breakout', emotion:'Neutral', notes:'' });
  const [showNotes, setShowNotes] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSetup, setFilterSetup] = useState('All');
  const [filterEmotion, setFilterEmotion] = useState('All');
  const [filterDir, setFilterDir] = useState('All');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const autoPnl = useMemo(() => {
    const e = parseFloat(form.entry), x = parseFloat(form.exit), s = parseFloat(form.size);
    if(isNaN(e)||isNaN(x)||isNaN(s)) return null;
    return ((x-e)*(form.direction==='Long'?1:-1)*s);
  }, [form.entry,form.exit,form.size,form.direction]);

  const handleAdd = () => {
    if(!form.ticker || !form.entry || !form.exit || !form.size) return;
    const e = parseFloat(form.entry), x = parseFloat(form.exit), s = parseFloat(form.size);
    const pnl = ((x-e)*(form.direction==='Long'?1:-1)*s);
    const newTrade = {
      ...form, id: Date.now(), entry:e, exit:x, size:s, pnl: parseFloat(pnl.toFixed(2)),
      pnlPct: parseFloat(((Math.abs(x-e)/e)*100*(pnl>=0?1:-1)).toFixed(2)),
      duration: '-', rMultiple: parseFloat((pnl/(Math.abs(e*0.01*s))).toFixed(2))
    };
    addTrade(newTrade);
    toast(`Trade logged! ${form.ticker} ${pnl>=0?'+':''}${fmt$(pnl)}`);
    setForm({ ticker:'', direction:'Long', entry:'', exit:'', size:'', date:'2026-03-10', time:'09:30', setup:'Breakout', emotion:'Neutral', notes:'' });
  };

  const filtered = useMemo(() => {
    let t = [...trades];
    if(search) t = t.filter(x => x.ticker.includes(search.toUpperCase()) || x.notes?.toLowerCase().includes(search.toLowerCase()));
    if(filterSetup !== 'All') t = t.filter(x => x.setup === filterSetup);
    if(filterEmotion !== 'All') t = t.filter(x => x.emotion === filterEmotion);
    if(filterDir !== 'All') t = t.filter(x => x.direction === filterDir);
    t.sort((a,b) => {
      let va = a[sortKey], vb = b[sortKey];
      if(sortKey==='date') { va = a.date+a.time; vb = b.date+b.time; }
      return sortDir==='asc' ? (va>vb?1:-1) : (va<vb?1:-1);
    });
    return t;
  }, [trades,search,filterSetup,filterEmotion,filterDir,sortKey,sortDir]);

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length/PER_PAGE);
  const filteredPnl = filtered.reduce((s,t)=>s+t.pnl,0);
  const filteredWr = filtered.length ? filtered.filter(t=>t.pnl>0).length/filtered.length*100 : 0;

  const col = k => () => { if(sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(k); setSortDir('desc'); } };
  const SortIcon = ({k}) => sortKey===k ? (sortDir==='asc'?React.createElement(ChevronUp,{size:12}):React.createElement(ChevronDown,{size:12})) : null;

  const inp = 'px-3 py-2 rounded-lg text-sm font-mono bg-transparent border focus:border-blue-500 w-full';
  const inpStyle = {background:'#0d1117',border:'1px solid #1e293b',color:'#e2e8f0'};

  return React.createElement('div', {className:'flex flex-col h-screen overflow-auto'},
    // Quick-add form
    React.createElement('div', {className:'p-4 sticky top-0 z-10', style:{background:'#0d1117',borderBottom:'1px solid #1e293b'}},
      React.createElement('div', {className:'rounded-xl p-4', style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('div', {className:'flex items-center gap-2 mb-3'},
          React.createElement(Plus, {size:14, color:'#3b82f6'}),
          React.createElement('span', {className:'text-xs font-heading font-semibold uppercase tracking-wider', style:{color:'#3b82f6'}}, 'Quick Add Trade')
        ),
        React.createElement('div', {className:'flex items-start gap-2 flex-wrap'},
          // Ticker
          React.createElement('input', {
            placeholder:'TICKER', value:form.ticker, maxLength:5,
            onChange:e=>setForm(f=>({...f,ticker:e.target.value.toUpperCase()})),
            className:'px-3 py-2 rounded-lg text-sm font-heading font-bold uppercase bg-transparent border focus:border-blue-500',
            style:{...inpStyle,width:90,letterSpacing:'0.05em'}
          }),
          // Direction toggle
          React.createElement('div', {className:'flex rounded-lg overflow-hidden', style:{border:'1px solid #1e293b'}},
            ['Long','Short'].map(d => React.createElement('button', {
              key:d, onClick:()=>setForm(f=>({...f,direction:d})),
              className:'px-3 py-2 text-xs font-semibold',
              style:{
                background: form.direction===d ? (d==='Long'?'#052e16':'#2a0a0a') : '#0d1117',
                color: form.direction===d ? (d==='Long'?'#22c55e':'#ef4444') : '#475569',
                border:'none'
              }
            }, d))
          ),
          // Entry/Exit/Size
          ...['entry','exit','size'].map(k => React.createElement('input', {
            key:k, placeholder:{entry:'Entry $',exit:'Exit $',size:'Size'}[k],
            value:form[k], type:'number',
            onChange:e=>setForm(f=>({...f,[k]:e.target.value})),
            className:inp, style:{...inpStyle,width:k==='size'?80:100}
          })),
          // Date/Time
          React.createElement('input', {type:'date',value:form.date,onChange:e=>setForm(f=>({...f,date:e.target.value})),className:inp,style:{...inpStyle,width:140}}),
          React.createElement('input', {type:'time',value:form.time,onChange:e=>setForm(f=>({...f,time:e.target.value})),className:inp,style:{...inpStyle,width:100}}),
          // Setup
          React.createElement('select', {
            value:form.setup, onChange:e=>setForm(f=>({...f,setup:e.target.value})),
            className:inp, style:{...inpStyle,width:140}
          }, SETUPS.map(s=>React.createElement('option',{key:s,value:s},s))),
          // Emotion
          React.createElement('select', {
            value:form.emotion, onChange:e=>setForm(f=>({...f,emotion:e.target.value})),
            className:inp, style:{...inpStyle,width:140}
          }, EMOTIONS.map(e=>React.createElement('option',{key:e,value:e},EMOTION_EMOJI[e]+' '+e))),
          // Auto P&L display
          autoPnl !== null && React.createElement('div', {
            className:'flex items-center px-3 py-2 rounded-lg text-sm font-mono font-bold',
            style:{background:'#0d1117',border:'1px solid #1e293b',color:autoPnl>=0?'#22c55e':'#ef4444'}
          }, (autoPnl>=0?'+':'')+fmt$(autoPnl)),
          // Notes toggle
          React.createElement('button', {
            onClick:()=>setShowNotes(v=>!v),
            className:'px-3 py-2 rounded-lg text-xs',
            style:{background:'#0d1117',border:'1px solid #1e293b',color:'#475569'}
          }, showNotes?'Hide Notes':'+ Notes'),
          // Submit
          React.createElement('button', {
            onClick:handleAdd,
            className:'px-5 py-2 rounded-lg text-sm font-semibold ml-auto',
            style:{background:'#3b82f6',color:'white',border:'none',cursor:'pointer'}
          }, 'Log Trade')
        ),
        showNotes && React.createElement('textarea', {
          placeholder:'Notes... (optional)', value:form.notes, rows:2,
          onChange:e=>setForm(f=>({...f,notes:e.target.value})),
          className:'mt-2 w-full px-3 py-2 rounded-lg text-sm',
          style:{...inpStyle,resize:'vertical',fontFamily:'inherit'}
        })
      )
    ),
    // Filters & table
    React.createElement('div', {className:'flex-1 p-4 flex flex-col gap-4'},
      // Filter bar
      React.createElement('div', {className:'flex items-center gap-3 flex-wrap'},
        React.createElement('div', {className:'flex items-center gap-2 rounded-lg px-3 py-2 flex-1',style:{background:'#161b22',border:'1px solid #1e293b',minWidth:200}},
          React.createElement(Search,{size:14,color:'#475569'}),
          React.createElement('input',{placeholder:'Search ticker or notes...',value:search,onChange:e=>setSearch(e.target.value),className:'bg-transparent text-sm flex-1',style:{border:'none',color:'#e2e8f0',outline:'none'}})
        ),
        ...[
          {label:'Setup',val:filterSetup,set:setFilterSetup,opts:['All',...SETUPS]},
          {label:'Emotion',val:filterEmotion,set:setFilterEmotion,opts:['All',...EMOTIONS]},
          {label:'Dir',val:filterDir,set:setFilterDir,opts:['All','Long','Short']},
        ].map(f=>React.createElement('select',{
          key:f.label,value:f.val,onChange:e=>f.set(e.target.value),
          className:'px-3 py-2 rounded-lg text-sm',
          style:{background:'#161b22',border:'1px solid #1e293b',color:'#94a3b8'}
        },f.opts.map(o=>React.createElement('option',{key:o,value:o},o))))
      ),
      // Table stats
      React.createElement('div', {className:'flex items-center gap-4 text-xs', style:{color:'#475569'}},
        React.createElement('span', null, `Showing ${filtered.length} trades`),
        React.createElement('span', {className:pnlClass(filteredPnl)}, `Net P&L: ${fmt$(filteredPnl)}`),
        React.createElement('span', null, `Win Rate: ${filteredWr.toFixed(1)}%`)
      ),
      // Table
      React.createElement('div', {className:'rounded-xl overflow-hidden', style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('div', {className:'overflow-x-auto'},
          React.createElement('table', {className:'w-full text-xs min-w-max'},
            React.createElement('thead', null,
              React.createElement('tr', {style:{borderBottom:'1px solid #1e293b'}},
                [
                  {k:'date',l:'Date'},{k:'ticker',l:'Ticker'},{k:'direction',l:'Dir'},
                  {k:'entry',l:'Entry'},{k:'exit',l:'Exit'},{k:'size',l:'Size'},
                  {k:'pnl',l:'P&L ($)'},{k:'pnlPct',l:'P&L %'},{k:'rMultiple',l:'R-Mult'},
                  {k:'setup',l:'Setup'},{k:'emotion',l:'Emotion'},{k:'duration',l:'Duration'}
                ].map(h=>React.createElement('th',{
                  key:h.k,onClick:col(h.k),
                  className:'text-left px-4 py-3 font-medium uppercase tracking-wider cursor-pointer select-none',
                  style:{color:'#475569',whiteSpace:'nowrap'}
                },
                  React.createElement('div',{className:'flex items-center gap-1'},h.l,React.createElement(SortIcon,{k:h.k}))
                ))
              )
            ),
            React.createElement('tbody', null,
              paginated.map((t,i)=>React.createElement('tr',{
                key:t.id,className:'row-hover',
                style:{borderBottom:'1px solid #0d111740',background:i%2===0?'transparent':'#0d111720'}
              },
                React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:'#64748b',whiteSpace:'nowrap'}},fmtDate(t.date)+' '+t.time),
                React.createElement('td',{className:'px-4 py-2.5 font-heading font-bold',style:{color:'#e2e8f0'}},t.ticker),
                React.createElement('td',{className:'px-4 py-2.5'},
                  React.createElement('span',{className:`badge-${t.direction.toLowerCase()} rounded px-2 py-0.5 font-medium`},t.direction)
                ),
                React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:'#94a3b8'}},'$'+t.entry.toFixed(2)),
                React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:'#94a3b8'}},'$'+t.exit.toFixed(2)),
                React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:'#94a3b8'}},t.size),
                React.createElement('td',{className:'px-4 py-2.5 font-mono font-bold '+pnlClass(t.pnl)},fmt$(t.pnl)),
                React.createElement('td',{className:'px-4 py-2.5 font-mono '+pnlClass(t.pnlPct)},fmtPct(t.pnlPct)),
                React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:t.rMultiple>=0?'#22c55e':'#ef4444'}},
                  (t.rMultiple>=0?'+':'')+t.rMultiple+'R'
                ),
                React.createElement('td',{className:'px-4 py-2.5',style:{color:'#64748b'}},t.setup),
                React.createElement('td',{className:'px-4 py-2.5'},
                  React.createElement('span',{className:'emotion-chip',style:{background:emotionColor[t.emotion]?.bg,color:emotionColor[t.emotion]?.text}},
                    EMOTION_EMOJI[t.emotion],t.emotion
                  )
                ),
                React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:'#475569'}},t.duration)
              ))
            )
          )
        )
      ),
      // Pagination
      totalPages > 1 && React.createElement('div',{className:'flex items-center justify-center gap-2'},
        React.createElement('button',{onClick:()=>setPage(p=>Math.max(1,p-1)),disabled:page===1,className:'px-3 py-1.5 rounded-lg text-xs',style:{background:'#161b22',border:'1px solid #1e293b',color:'#94a3b8'}},
          React.createElement(ChevronLeft,{size:14})
        ),
        React.createElement('span',{className:'text-xs',style:{color:'#475569'}},`${page} / ${totalPages}`),
        React.createElement('button',{onClick:()=>setPage(p=>Math.min(totalPages,p+1)),disabled:page===totalPages,className:'px-3 py-1.5 rounded-lg text-xs',style:{background:'#161b22',border:'1px solid #1e293b',color:'#94a3b8'}},
          React.createElement(ChevronRight,{size:14})
        )
      )
    )
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({ trades }) {
  const stats = useMemo(() => {
    const wins = trades.filter(t=>t.pnl>0), losses = trades.filter(t=>t.pnl<0);
    const totalWin = wins.reduce((s,t)=>s+t.pnl,0);
    const totalLoss = Math.abs(losses.reduce((s,t)=>s+t.pnl,0));
    const avgWin = wins.length ? totalWin/wins.length : 0;
    const avgLoss = losses.length ? totalLoss/losses.length : 0;
    const pf = totalLoss>0 ? totalWin/totalLoss : 0;
    const expectancy = wins.length/trades.length*avgWin - losses.length/trades.length*avgLoss;
    // Max drawdown
    const sorted = [...trades].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
    let peak=0, dd=0, cum=0;
    sorted.forEach(t=>{ cum+=t.pnl; if(cum>peak) peak=cum; dd=Math.min(dd,cum-peak); });
    // Streaks
    let cur=0, longest=0, curL=0, longestL=0;
    sorted.forEach(t=>{ if(t.pnl>0){cur++;longest=Math.max(longest,cur);curL=0;} else{curL++;longestL=Math.max(longestL,curL);cur=0;}});
    return { totalWin,totalLoss,avgWin,avgLoss,pf,expectancy,maxDd:dd,longestWin:longest,longestLoss:longestL,
      largestWin:Math.max(...wins.map(t=>t.pnl),0), largestLoss:Math.min(...losses.map(t=>t.pnl),0) };
  }, [trades]);

  const bySetup = useMemo(()=>SETUPS.map(s=>{
    const t = trades.filter(x=>x.setup===s);
    if(!t.length) return null;
    return { setup:s, count:t.length, wr:t.filter(x=>x.pnl>0).length/t.length*100, avgPnl:t.reduce((a,b)=>a+b.pnl,0)/t.length, totalPnl:t.reduce((a,b)=>a+b.pnl,0) };
  }).filter(Boolean), [trades]);

  const byEmotion = useMemo(()=>EMOTIONS.map(e=>{
    const t = trades.filter(x=>x.emotion===e);
    if(!t.length) return null;
    return { emotion:e, count:t.length, wr:t.filter(x=>x.pnl>0).length/t.length*100, avgPnl:t.reduce((a,b)=>a+b.pnl,0)/t.length };
  }).filter(Boolean), [trades]);

  const byDow = useMemo(()=>{
    const days = ['Mon','Tue','Wed','Thu','Fri'];
    return days.map(d=>{
      const t = trades.filter(x=>new Date(x.date).toLocaleDateString('en-US',{weekday:'short'})===d);
      return { day:d, count:t.length, wr:t.length?t.filter(x=>x.pnl>0).length/t.length*100:0, totalPnl:t.reduce((a,b)=>a+b.pnl,0) };
    });
  }, [trades]);

  const byTicker = useMemo(()=>TICKERS.map(tk=>{
    const t = trades.filter(x=>x.ticker===tk);
    if(!t.length) return null;
    return { ticker:tk, count:t.length, wr:t.filter(x=>x.pnl>0).length/t.length*100, totalPnl:t.reduce((a,b)=>a+b.pnl,0), avgPnl:t.reduce((a,b)=>a+b.pnl,0)/t.length };
  }).filter(Boolean).sort((a,b)=>b.totalPnl-a.totalPnl), [trades]);

  const byHour = useMemo(()=>{
    const hours = ['9:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','15:00','15:30'];
    return hours.map(h=>{
      const [hr,mn] = h.split(':').map(Number);
      const t = trades.filter(x=>{
        const [th,tm] = x.time.split(':').map(Number);
        return th===hr && Math.abs(tm-mn)<30;
      });
      return { hour:h, totalPnl:t.reduce((a,b)=>a+b.pnl,0), count:t.length, wr:t.length?t.filter(x=>x.pnl>0).length/t.length*100:0 };
    }).filter(x=>x.count>0);
  }, [trades]);

  const kpiCard = (label,value,sub,color='#e2e8f0') =>
    React.createElement('div',{className:'rounded-xl p-4',style:{background:'#161b22',border:'1px solid #1e293b'}},
      React.createElement('div',{className:'text-xs font-medium uppercase tracking-wider mb-1',style:{color:'#475569'}},label),
      React.createElement('div',{className:'font-heading font-bold text-lg',style:{color}},value),
      sub && React.createElement('div',{className:'text-xs mt-1',style:{color:'#475569'}},sub)
    );

  const chartProps = {
    contentStyle:{background:'#1c2230',border:'1px solid #1e293b',borderRadius:8,color:'#e2e8f0',fontSize:11},
    labelStyle:{color:'#94a3b8'}
  };

  return React.createElement('div',{className:'p-6 overflow-auto h-screen flex flex-col gap-6'},
    React.createElement('h1',{className:'font-heading font-bold text-xl',style:{color:'#e2e8f0'}},'Analytics'),
    // KPI row
    React.createElement('div',{className:'grid grid-cols-6 gap-3'},
      kpiCard('Profit Factor',stats.pf.toFixed(2),'',stats.pf>=1.5?'#22c55e':stats.pf>=1?'#f59e0b':'#ef4444'),
      kpiCard('Avg Winner',fmt$(stats.avgWin),'per trade','#22c55e'),
      kpiCard('Avg Loser',fmt$(stats.avgLoss),'per trade','#ef4444'),
      kpiCard('Expectancy',fmt$(stats.expectancy),'per trade',stats.expectancy>=0?'#22c55e':'#ef4444'),
      kpiCard('Max Drawdown',fmt$(stats.maxDd),'','#ef4444'),
      kpiCard('Best Streak',stats.longestWin+'W / '+stats.longestLoss+'L','','#3b82f6'),
    ),
    // Emotion vs Win Rate (the killer feature)
    React.createElement('div',{className:'rounded-xl p-5',style:{background:'#161b22',border:'1px solid #1e3a5f'}},
      React.createElement('div',{className:'flex items-center gap-2 mb-1'},
        React.createElement('span',null,'🧠'),
        React.createElement('h3',{className:'font-heading font-semibold text-sm',style:{color:'#e2e8f0'}},'Emotion vs Performance'),
        React.createElement('span',{className:'text-xs ml-2 px-2 py-0.5 rounded',style:{background:'#1e3a5f',color:'#3b82f6'}},'KEY INSIGHT')
      ),
      React.createElement('p',{className:'text-xs mb-4',style:{color:'#475569'}},
        `Disciplined trades: ${byEmotion.find(e=>e.emotion==='Disciplined')?.wr.toFixed(0)||0}% WR vs FOMO: ${byEmotion.find(e=>e.emotion==='FOMO')?.wr.toFixed(0)||0}% WR vs Revenge: ${byEmotion.find(e=>e.emotion==='Revenge')?.wr.toFixed(0)||0}% WR`
      ),
      React.createElement(ResponsiveContainer,{width:'100%',height:200},
        React.createElement(BarChart,{data:byEmotion,margin:{top:5,right:20,left:0,bottom:5}},
          React.createElement(CartesianGrid,{strokeDasharray:'3 3',stroke:'#1e293b',vertical:false}),
          React.createElement(XAxis,{dataKey:'emotion',tick:{fill:'#94a3b8',fontSize:11},tickLine:false,axisLine:false}),
          React.createElement(YAxis,{tickFormatter:v=>v+'%',tick:{fill:'#475569',fontSize:10},tickLine:false,axisLine:false,domain:[0,100]}),
          React.createElement(Tooltip,{...chartProps,formatter:(v,n)=>[v.toFixed(1)+'%',n]}),
          React.createElement(Bar,{dataKey:'wr',name:'Win Rate',radius:[4,4,0,0]},
            byEmotion.map((e,i)=>React.createElement(Cell,{key:i,fill:emotionColor[e.emotion]?.text||'#3b82f6'}))
          )
        )
      )
    ),
    // Row: Setup + Day of Week
    React.createElement('div',{className:'grid gap-4',style:{gridTemplateColumns:'1fr 1fr'}},
      React.createElement('div',{className:'rounded-xl p-5',style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('h3',{className:'font-heading font-semibold text-sm mb-4',style:{color:'#e2e8f0'}},'By Setup'),
        React.createElement(ResponsiveContainer,{width:'100%',height:200},
          React.createElement(BarChart,{data:bySetup,margin:{top:5,right:10,left:0,bottom:5}},
            React.createElement(CartesianGrid,{strokeDasharray:'3 3',stroke:'#1e293b',vertical:false}),
            React.createElement(XAxis,{dataKey:'setup',tick:{fill:'#94a3b8',fontSize:9},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tickFormatter:v=>fmt$(v),tick:{fill:'#475569',fontSize:9},tickLine:false,axisLine:false,width:60}),
            React.createElement(Tooltip,{...chartProps,formatter:(v)=>[fmt$(v),'Avg P&L']}),
            React.createElement(Bar,{dataKey:'avgPnl',name:'Avg P&L',radius:[4,4,0,0]},
              bySetup.map((s,i)=>React.createElement(Cell,{key:i,fill:s.avgPnl>=0?'#22c55e':'#ef4444'}))
            )
          )
        )
      ),
      React.createElement('div',{className:'rounded-xl p-5',style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('h3',{className:'font-heading font-semibold text-sm mb-4',style:{color:'#e2e8f0'}},'By Day of Week'),
        React.createElement(ResponsiveContainer,{width:'100%',height:200},
          React.createElement(BarChart,{data:byDow,margin:{top:5,right:10,left:0,bottom:5}},
            React.createElement(CartesianGrid,{strokeDasharray:'3 3',stroke:'#1e293b',vertical:false}),
            React.createElement(XAxis,{dataKey:'day',tick:{fill:'#94a3b8',fontSize:11},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tickFormatter:v=>fmt$(v),tick:{fill:'#475569',fontSize:9},tickLine:false,axisLine:false,width:60}),
            React.createElement(Tooltip,{...chartProps,formatter:(v)=>[fmt$(v),'Total P&L']}),
            React.createElement(Bar,{dataKey:'totalPnl',name:'P&L',radius:[4,4,0,0]},
              byDow.map((d,i)=>React.createElement(Cell,{key:i,fill:d.totalPnl>=0?'#22c55e':'#ef4444'}))
            )
          )
        )
      )
    ),
    // Row: Ticker table + Time of day
    React.createElement('div',{className:'grid gap-4',style:{gridTemplateColumns:'1fr 1fr'}},
      React.createElement('div',{className:'rounded-xl overflow-hidden',style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('div',{className:'px-5 py-4',style:{borderBottom:'1px solid #1e293b'}},
          React.createElement('h3',{className:'font-heading font-semibold text-sm',style:{color:'#e2e8f0'}},'By Ticker')
        ),
        React.createElement('table',{className:'w-full text-xs'},
          React.createElement('thead',null,
            React.createElement('tr',{style:{borderBottom:'1px solid #1e293b'}},
              ['Ticker','Trades','Win Rate','Total P&L','Avg P&L'].map(h=>
                React.createElement('th',{key:h,className:'text-left px-4 py-2 text-xs uppercase tracking-wider',style:{color:'#475569'}},h)
              )
            )
          ),
          React.createElement('tbody',null,
            byTicker.map((t,i)=>React.createElement('tr',{key:t.ticker,style:{borderBottom:'1px solid #0d111740',background:i%2===0?'transparent':'#0d111720'}},
              React.createElement('td',{className:'px-4 py-2.5 font-heading font-bold',style:{color:'#e2e8f0'}},t.ticker),
              React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:'#94a3b8'}},t.count),
              React.createElement('td',{className:'px-4 py-2.5 font-mono',style:{color:t.wr>=50?'#22c55e':'#ef4444'}},t.wr.toFixed(0)+'%'),
              React.createElement('td',{className:'px-4 py-2.5 font-mono font-bold '+pnlClass(t.totalPnl)},fmt$(t.totalPnl)),
              React.createElement('td',{className:'px-4 py-2.5 font-mono '+pnlClass(t.avgPnl)},fmt$(t.avgPnl))
            ))
          )
        )
      ),
      React.createElement('div',{className:'rounded-xl p-5',style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('h3',{className:'font-heading font-semibold text-sm mb-4',style:{color:'#e2e8f0'}},'By Time of Day'),
        React.createElement(ResponsiveContainer,{width:'100%',height:220},
          React.createElement(BarChart,{data:byHour,margin:{top:5,right:10,left:0,bottom:20}},
            React.createElement(CartesianGrid,{strokeDasharray:'3 3',stroke:'#1e293b',vertical:false}),
            React.createElement(XAxis,{dataKey:'hour',tick:{fill:'#94a3b8',fontSize:9},tickLine:false,axisLine:false,angle:-45,textAnchor:'end'}),
            React.createElement(YAxis,{tickFormatter:v=>fmt$(v),tick:{fill:'#475569',fontSize:9},tickLine:false,axisLine:false,width:60}),
            React.createElement(Tooltip,{...chartProps,formatter:(v)=>[fmt$(v),'Total P&L']}),
            React.createElement(Bar,{dataKey:'totalPnl',name:'P&L',radius:[4,4,0,0]},
              byHour.map((h,i)=>React.createElement(Cell,{key:i,fill:h.totalPnl>=0?'#22c55e':'#ef4444'}))
            )
          )
        )
      )
    )
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ trades, setPage, setFilter }) {
  const [month, setMonth] = useState(2); // 0-indexed: 2=March 2026
  const year = 2026;

  const byDay = useMemo(() => {
    const m = {};
    trades.forEach(t => {
      if(!m[t.date]) m[t.date] = { pnl:0, count:0, trades:[] };
      m[t.date].pnl += t.pnl;
      m[t.date].count++;
      m[t.date].trades.push(t);
    });
    return m;
  }, [trades]);

  const monthData = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const days = [];
    for(let i=0; i<firstDay; i++) days.push(null);
    for(let d=1; d<=daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      days.push({ day:d, date:dateStr, data:byDay[dateStr]||null });
    }
    return days;
  }, [month, byDay]);

  const summary = useMemo(() => {
    const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
    const monthTrades = trades.filter(t=>t.date.startsWith(monthStr));
    const days = Object.keys(byDay).filter(d=>d.startsWith(monthStr));
    const green = days.filter(d=>byDay[d].pnl>0).length;
    const red = days.filter(d=>byDay[d].pnl<0).length;
    const best = days.length ? days.reduce((a,b)=>byDay[a].pnl>byDay[b].pnl?a:b,days[0]) : null;
    const worst = days.length ? days.reduce((a,b)=>byDay[a].pnl<byDay[b].pnl?a:b,days[0]) : null;
    return { trading:days.length, green, red, totalPnl:monthTrades.reduce((s,t)=>s+t.pnl,0), best, worst };
  }, [month, byDay, trades]);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const cellColor = (data) => {
    if(!data) return 'transparent';
    if(data.pnl > 500) return '#052e16';
    if(data.pnl > 200) return '#0a3d1f';
    if(data.pnl > 0)   return '#0d2818';
    if(data.pnl > -200) return '#2a0a0a';
    if(data.pnl > -500) return '#3d0a0a';
    return '#4d0a0a';
  };

  return React.createElement('div',{className:'p-6 overflow-auto h-screen flex flex-col gap-6'},
    React.createElement('div',{className:'flex items-center justify-between'},
      React.createElement('h1',{className:'font-heading font-bold text-xl',style:{color:'#e2e8f0'}},'Calendar'),
      React.createElement('div',{className:'flex items-center gap-3'},
        React.createElement('button',{onClick:()=>setMonth(m=>m-1),className:'px-3 py-2 rounded-lg',style:{background:'#161b22',border:'1px solid #1e293b',color:'#94a3b8'}},
          React.createElement(ChevronLeft,{size:16})
        ),
        React.createElement('span',{className:'font-heading font-semibold',style:{color:'#e2e8f0'}},`${monthNames[month]} ${year}`),
        React.createElement('button',{onClick:()=>setMonth(m=>m+1),className:'px-3 py-2 rounded-lg',style:{background:'#161b22',border:'1px solid #1e293b',color:'#94a3b8'}},
          React.createElement(ChevronRight,{size:16})
        )
      )
    ),
    // Month summary
    React.createElement('div',{className:'grid grid-cols-5 gap-3'},
      [
        {label:'Trading Days',value:summary.trading},
        {label:'Green Days',value:summary.green,color:'#22c55e'},
        {label:'Red Days',value:summary.red,color:'#ef4444'},
        {label:'Month P&L',value:fmt$(summary.totalPnl),color:summary.totalPnl>=0?'#22c55e':'#ef4444'},
        {label:'Best Day',value:summary.best?fmt$(byDay[summary.best]?.pnl||0):'—',color:'#22c55e'},
      ].map(s=>React.createElement('div',{key:s.label,className:'rounded-xl p-4',style:{background:'#161b22',border:'1px solid #1e293b'}},
        React.createElement('div',{className:'text-xs uppercase tracking-wider mb-1',style:{color:'#475569'}},s.label),
        React.createElement('div',{className:'font-heading font-bold text-xl',style:{color:s.color||'#e2e8f0'}},s.value)
      ))
    ),
    // Calendar grid
    React.createElement('div',{className:'rounded-xl p-4',style:{background:'#161b22',border:'1px solid #1e293b'}},
      React.createElement('div',{className:'grid grid-cols-7 gap-1 mb-2'},
        ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>
          React.createElement('div',{key:d,className:'text-center text-xs font-medium py-2',style:{color:'#475569'}},d)
        )
      ),
      React.createElement('div',{className:'grid grid-cols-7 gap-1'},
        monthData.map((cell,i)=>{
          if(!cell) return React.createElement('div',{key:'e'+i,className:'aspect-square rounded-lg'});
          const {day, date, data} = cell;
          const isWeekend = [0,6].includes(new Date(date).getDay());
          return React.createElement('div',{
            key:date,
            className:'aspect-square rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all',
            style:{
              background: data ? cellColor(data) : isWeekend ? '#0a0f14' : '#0d1117',
              border: `1px solid ${data ? (data.pnl>=0?'#22c55e20':'#ef444420') : '#1e293b30'}`,
            },
            title: data ? `${date}: ${fmt$(data.pnl)} (${data.count} trades)` : date
          },
            React.createElement('span',{className:'text-xs font-mono',style:{color:data?'#94a3b8':'#334155'}},day),
            data && React.createElement('div',{className:'flex flex-col gap-0.5'},
              React.createElement('span',{className:'text-xs font-mono font-bold leading-tight',style:{color:data.pnl>=0?'#22c55e':'#ef4444',fontSize:10}},
                (data.pnl>=0?'+':'')+fmt$(data.pnl)
              ),
              React.createElement('span',{style:{color:'#475569',fontSize:9}},data.count+'t')
            )
          );
        })
      )
    ),
    // Legend
    React.createElement('div',{className:'flex items-center gap-4 text-xs',style:{color:'#475569'}},
      React.createElement('span',null,'P&L Color Scale:'),
      ...[ ['#4d0a0a','< -$500'], ['#2a0a0a','-$200 to 0'], ['#0d2818','$0 to +$200'], ['#052e16','> +$500'] ].map(([c,l])=>
        React.createElement('div',{key:l,className:'flex items-center gap-1.5'},
          React.createElement('div',{className:'w-3 h-3 rounded',style:{background:c,border:'1px solid #1e293b'}}),
          React.createElement('span',null,l)
        )
      )
    )
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsView() {
  const [displayName, setDisplayName] = useState('Alex Chen');
  const [defaultSize, setDefaultSize] = useState('200');
  const [market, setMarket] = useState('Stocks');
  const [commission, setCommission] = useState('0.65');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const inp = 'px-3 py-2.5 rounded-lg text-sm w-full';
  const inpSty = {background:'#0d1117',border:'1px solid #1e293b',color:'#e2e8f0',outline:'none'};

  const Section = ({title,children}) => React.createElement('div',{className:'rounded-xl p-5',style:{background:'#161b22',border:'1px solid #1e293b'}},
    React.createElement('h3',{className:'font-heading font-semibold text-sm mb-4',style:{color:'#e2e8f0'}},title),
    children
  );
  const Field = ({label,children}) => React.createElement('div',{className:'flex items-center gap-4 mb-3'},
    React.createElement('label',{className:'text-sm w-40 flex-shrink-0',style:{color:'#94a3b8'}},label),
    React.createElement('div',{className:'flex-1'},children)
  );

  return React.createElement('div',{className:'p-6 overflow-auto h-screen flex flex-col gap-6'},
    React.createElement('h1',{className:'font-heading font-bold text-xl',style:{color:'#e2e8f0'}},'Settings'),
    React.createElement(Section,{title:'Profile'},
      React.createElement(Field,{label:'Display Name'},
        React.createElement('input',{value:displayName,onChange:e=>setDisplayName(e.target.value),className:inp,style:inpSty})
      ),
      React.createElement(Field,{label:'Default Size'},
        React.createElement('input',{value:defaultSize,onChange:e=>setDefaultSize(e.target.value),type:'number',className:inp,style:inpSty})
      )
    ),
    React.createElement(Section,{title:'Trading Preferences'},
      React.createElement(Field,{label:'Primary Market'},
        React.createElement('select',{value:market,onChange:e=>setMarket(e.target.value),className:inp,style:inpSty},
          ['Stocks','Options','Futures','Crypto'].map(m=>React.createElement('option',{key:m,value:m},m))
        )
      ),
      React.createElement(Field,{label:'Commission / Trade'},
        React.createElement('input',{value:commission,onChange:e=>setCommission(e.target.value),type:'number',step:'0.01',className:inp,style:inpSty})
      )
    ),
    React.createElement(Section,{title:'Setup Tags'},
      React.createElement('div',{className:'flex flex-wrap gap-2'},
        SETUPS.map(s=>React.createElement('span',{key:s,className:'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2',style:{background:'#0d1117',border:'1px solid #1e293b',color:'#94a3b8'}},
          s,React.createElement(X,{size:12,color:'#475569'})
        )),
        React.createElement('button',{className:'px-3 py-1.5 rounded-lg text-xs flex items-center gap-1',style:{background:'#0d1117',border:'1px solid #3b82f640',color:'#3b82f6'}},
          React.createElement(Plus,{size:12}),'Add Tag'
        )
      )
    ),
    React.createElement(Section,{title:'Data'},
      React.createElement('div',{className:'flex gap-3'},
        React.createElement('button',{className:'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm',style:{background:'#0d1117',border:'1px solid #1e293b',color:'#475569',cursor:'not-allowed',opacity:0.5}},
          React.createElement(Upload,{size:14}),'Import CSV (coming soon)'
        ),
        React.createElement('button',{className:'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm',style:{background:'#0d1117',border:'1px solid #1e293b',color:'#475569',cursor:'not-allowed',opacity:0.5}},
          React.createElement(Download,{size:14}),'Export CSV (coming soon)'
        )
      )
    ),
    React.createElement(Section,{title:'Coming Soon 🚀'},
      React.createElement('div',{className:'grid grid-cols-3 gap-3'},
        [
          {icon:'🔗',title:'Broker Integrations',sub:'TD Ameritrade, IBKR, Webull'},
          {icon:'📸',title:'Screenshot Capture',sub:'Auto-attach chart images to trades'},
          {icon:'📱',title:'Mobile App',sub:'iOS & Android companion app'},
        ].map(f=>React.createElement('div',{key:f.title,className:'rounded-lg p-4',style:{background:'#0d1117',border:'1px solid #1e293b'}},
          React.createElement('div',{className:'text-lg mb-1'},f.icon),
          React.createElement('div',{className:'font-medium text-sm mb-1',style:{color:'#94a3b8'}},f.title),
          React.createElement('div',{className:'text-xs',style:{color:'#475569'}},f.sub)
        ))
      )
    ),
    React.createElement('button',{onClick:save,className:'self-start px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2',style:{background:'#3b82f6',color:'white',border:'none',cursor:'pointer'}},
      saved ? React.createElement(Check,{size:16}) : null,
      saved ? 'Saved!' : 'Save Settings'
    )
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [trades, setTrades] = useState(SEED_TRADES);
  const [toasts, setToasts] = useState([]);

  const addTrade = useCallback(t => setTrades(prev => [t, ...prev]), []);
  const toast = useCallback(msg => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, msg}]);
    setTimeout(() => setToasts(prev => prev.filter(t=>t.id!==id)), 3100);
  }, []);

  const pages = {
    dashboard: React.createElement(Dashboard, {trades, setPage}),
    tradelog:  React.createElement(TradeLog, {trades, addTrade, toast}),
    analytics: React.createElement(Analytics, {trades}),
    calendar:  React.createElement(CalendarView, {trades, setPage}),
    settings:  React.createElement(SettingsView),
  };

  return React.createElement('div',{className:'flex h-screen overflow-hidden font-body',style:{background:'#0d1117'}},
    React.createElement(Sidebar,{page,setPage,collapsed,setCollapsed}),
    React.createElement('main',{className:'flex-1 overflow-hidden'},pages[page]),
    React.createElement(Toast,{toasts})
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
