import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   DATA & CONSTANTS
═══════════════════════════════════════════════════════ */
const UGANDA_KB = `UGANDA ENVIRONMENTAL INTELLIGENCE — 2025

DEFORESTATION: Uganda lost 63% forest cover since 1990. Only ~9% remains (down from 45%).
Annual loss: ~122,000 ha. Mabira Forest (30,000 ha), Budongo (825 km²), Bwindi (331 km²) are critical.
Causes: charcoal (90% of urban households), timber, agri-expansion, population pressure (230/km²).

WETLANDS: 60% of wetlands destroyed since 1994. ~26,000 km² remaining (13% of land area).
Nakivubo Wetland filters 60% of Kampala's wastewater. Threats: agriculture drainage, urban expansion.

LAKE VICTORIA: 68,800 km² — Africa's largest lake. Receives 40M litres untreated sewage/day from Kampala.
Water hyacinth covers ~17,000 km² periodically. 200+ endemic fish species extinct since Nile Perch intro (1950s).
Eutrophication, heavy metals, plastic waste, overfishing are main threats.

KAMPALA: 2,000+ tonnes solid waste/day, only 40% collected. 150+ flood-prone areas.
PM2.5: 40-60 µg/m³ (WHO limit: 5 µg/m³). Kiteezi landfill at capacity.

CLIMATE: +1.3°C since 1960. Projected +2-3°C by 2050. Two rainy seasons (Mar-May, Oct-Dec).
Karamoja faces severe drought. Bududa landslides (2010/2018/2019) killed 300+.
Maize, beans, coffee yields down 10-20% due to climate variability.

ENERGY: 42% national electricity access. 72% urban, 18% rural.
90% households use charcoal/biomass. Hydropower = 90% of grid (Bujagali, Nalubaale, Owen Falls).
Solar: 5-6 kWh/m²/day potential. Rural Electrification Agency (REA) expanding solar.

CO2: 5.8 Mt/year total. 0.13 t per capita (vs global 4.7 t). Uganda emits 36x less than global avg.
Deforestation = 60% of emissions. Energy = 25%.

ORGANISATIONS: NEMA (regulator), NFA (forests), KCCA (Kampala), NWSC (water), REA (rural energy),
DWRM (water resources), LVEMP (Lake Victoria — World Bank funded).`;

const CITIES = [
  { name:"Kampala", lat:0.3476,  lon:32.5825, region:"Central", pop:"3.6M" },
  { name:"Gulu",    lat:2.7745,  lon:32.2990, region:"North",   pop:"250K" },
  { name:"Mbarara", lat:-0.6037, lon:30.6545, region:"West",    pop:"200K" },
  { name:"Jinja",   lat:0.4244,  lon:33.2041, region:"East",    pop:"300K" },
  { name:"Entebbe", lat:0.0512,  lon:32.4637, region:"Central", pop:"70K"  },
  { name:"Mbale",   lat:1.0808,  lon:34.1751, region:"East",    pop:"180K" }
];

const CO2_SERIES = [
  { year:"2000", uganda:2.1, global:369 }, { year:"2004", uganda:2.8, global:377 },
  { year:"2008", uganda:3.5, global:385 }, { year:"2012", uganda:4.2, global:394 },
  { year:"2016", uganda:4.9, global:403 }, { year:"2020", uganda:5.1, global:413 },
  { year:"2024", uganda:5.8, global:422 }
];

const FOREST_SERIES = [
  { year:"1990", pct:45 }, { year:"1995", pct:35 }, { year:"2000", pct:28 },
  { year:"2005", pct:22 }, { year:"2010", pct:18 }, { year:"2015", pct:13 },
  { year:"2020", pct:10 }, { year:"2024", pct:9  }
];

const SECTORS = [
  { label:"Agriculture", value:43, color:"#34d399" },
  { label:"Energy",      value:28, color:"#60a5fa" },
  { label:"Transport",   value:15, color:"#fbbf24" },
  { label:"Industry",    value:8,  color:"#fb923c" },
  { label:"Waste",       value:6,  color:"#f87171" }
];

const ISSUES = [
  { id:"deforestation", icon:"🌳", title:"Deforestation",       sev:"Critical", color:"#34d399",
    stat:"Only 9% forest cover remains",
    causes:"Charcoal production (90% of households), agricultural expansion, illegal logging, rapid population growth.",
    impact:"122,000 ha lost annually. Loss of biodiversity, increased flooding, soil erosion, reduced rainfall regulation.",
    solutions:["REDD+ carbon credit programs for forest communities","Promote improved cookstoves & LPG alternatives","Enforce National Forestry & Tree Planting Act","Community forest management programs","Plant indigenous species in degraded zones"],
    orgs:"NFA · NEMA · WWF Uganda · Nature Uganda" },
  { id:"wetlands", icon:"🌿", title:"Wetland Destruction",    sev:"Critical", color:"#6ee7b7",
    stat:"60% of wetlands destroyed since 1994",
    causes:"Drainage for rice/sugarcane agriculture, urban construction on wetlands, industrial pollution.",
    impact:"Reduced natural flood buffering, less water filtration, loss of fish breeding habitat.",
    solutions:["Enforce wetland buffer zone laws via NEMA","Alternative livelihoods for wetland communities","Kampala Wetland Restoration Master Plan","Community wetland monitoring programs"],
    orgs:"NEMA · DWRM · Wetlands Management Department" },
  { id:"lake", icon:"💧", title:"Lake Victoria Pollution", sev:"High",     color:"#60a5fa",
    stat:"40M litres sewage/day from Kampala",
    causes:"Untreated sewage, industrial effluents, agricultural runoff, plastic waste from lakeside communities.",
    impact:"Threatens 30M+ people's water source, water hyacinth blooms (~17,000 km²), fish stock decline.",
    solutions:["Expand LVEMP wastewater treatment plants","Plastic waste collection schemes for fishing villages","Industrial effluent monitoring & fines","Tri-national cooperation: Uganda, Kenya, Tanzania"],
    orgs:"NWSC · LVEMP · LVFO · NEMA" },
  { id:"waste", icon:"♻️", title:"Urban Waste Crisis",      sev:"High",     color:"#fbbf24",
    stat:"2,000+ tonnes waste/day in Kampala",
    causes:"Rapid urbanisation outpacing infrastructure, inadequate collection, low recycling culture.",
    impact:"Open burning causes severe air pollution. Groundwater contamination. Disease vector breeding.",
    solutions:["Formalise waste picker cooperatives","Biogas plants from organic waste","Extended Producer Responsibility legislation","Decentralised community composting hubs"],
    orgs:"KCCA · NEMA · Kampala Sanitation Programme" },
  { id:"climate", icon:"🌡️", title:"Climate Change",          sev:"High",     color:"#fb923c",
    stat:"+1.3°C rise since 1960",
    causes:"Global GHG emissions (Uganda contributes <0.1%), local deforestation amplifying local warming.",
    impact:"Erratic rainfall, Karamoja drought, increased flooding, 10-20% drop in crop yields.",
    solutions:["Drought-resistant crop varieties (NARO programs)","Rainwater harvesting for smallholder farmers","Flood & drought early warning systems","Climate-smart agriculture training at district level"],
    orgs:"MAAIF · NARO · OPM · Met Department Uganda" },
  { id:"energy", icon:"⚡", title:"Energy & Clean Cooking", sev:"Medium",   color:"#a78bfa",
    stat:"90% households use charcoal/biomass",
    causes:"Only 42% national electricity access. High cost of clean alternatives. Grid unreliability.",
    impact:"16,000+ deaths/year from indoor air pollution. Major driver of deforestation.",
    solutions:["Scale rural solar home systems via REA","Promote LPG & biogas for cooking","Expand Karuma & Isimba hydropower grid","Mini-grid development for rural areas"],
    orgs:"REA · MEMD · ERA · GIZ Uganda" }
];

const NEWS_CATS = [
  { id:"uganda",       label:"🇺🇬 Uganda",          q:"Uganda environment climate sustainability deforestation 2025 news" },
  { id:"lakes",        label:"💧 Lakes & Water",     q:"Lake Victoria Uganda water pollution wetlands conservation 2025" },
  { id:"forests",      label:"🌳 Forests",           q:"Uganda deforestation Mabira forest conservation 2025 news" },
  { id:"climate",      label:"🌡️ Climate",           q:"Uganda East Africa climate change floods drought 2025 news" },
  { id:"energy",       label:"⚡ Clean Energy",      q:"Uganda renewable solar clean cooking energy access 2025" },
  { id:"wildlife",     label:"🦍 Wildlife",          q:"Uganda wildlife gorillas national parks conservation 2025" },
  { id:"africa",       label:"🌍 Africa Wide",       q:"Africa environmental sustainability climate news 2025" }
];

/* ═══════════════════════════════════════════════════════
   WEATHER API (Open-Meteo — free, no key needed)
═══════════════════════════════════════════════════════ */
const WX_CODE_MAP = {
  0:["Clear Sky","☀️"], 1:["Mainly Clear","🌤️"], 2:["Partly Cloudy","⛅"], 3:["Overcast","☁️"],
  45:["Foggy","🌫️"], 48:["Icy Fog","🌫️"],
  51:["Light Drizzle","🌦️"], 53:["Drizzle","🌦️"], 55:["Heavy Drizzle","🌧️"],
  61:["Light Rain","🌧️"], 63:["Moderate Rain","🌧️"], 65:["Heavy Rain","🌧️"],
  71:["Light Snow","🌨️"], 73:["Snow","🌨️"], 75:["Heavy Snow","❄️"],
  80:["Rain Showers","🌦️"], 81:["Showers","🌧️"], 82:["Heavy Showers","⛈️"],
  85:["Snow Showers","🌨️"], 86:["Heavy Snow Showers","❄️"],
  95:["Thunderstorm","⛈️"], 96:["Thunderstorm+Hail","⛈️"], 99:["Thunderstorm+Hail","⛈️"]
};
const wxInfo = (c) => WX_CODE_MAP[c] || ["Variable","🌤️"];

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,` +
    `weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
    `precipitation_probability_max,weather_code,uv_index_max,wind_speed_10m_max` +
    `&forecast_days=7&timezone=Africa%2FNairobi`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Weather fetch failed");
  return r.json();
}

/* ═══════════════════════════════════════════════════════
   CLAUDE API
═══════════════════════════════════════════════════════ */
async function callClaude(messages, system, useSearch = false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system,
    messages
  };
  if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (!d.content) throw new Error("No content in response");
  return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

const CHAT_SYSTEM = `You are EcoIntelligence AI — expert environmental sustainability assistant for Uganda and East Africa.

KNOWLEDGE BASE:
${UGANDA_KB}

RULES:
1. Never fabricate statistics — use knowledge base or say "data unavailable"
2. Always prioritise Uganda-specific context
3. Compare to global/African averages when helpful
4. Suggest practical, locally-feasible solutions
5. Reference real orgs: NEMA, NFA, KCCA, NWSC, REA, DWRM, LVEMP
6. Keep responses focused: 3-5 paragraphs max
7. Format with **bold** for key figures
8. When discussing weather, connect to climate change and environmental impact`;

/* ═══════════════════════════════════════════════════════
   MINI SVG CHARTS
═══════════════════════════════════════════════════════ */
function SparkLine({ data, xKey, yKey, color = "#34d399", h = 100 }) {
  const vals = data.map(d => d[yKey]);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const W = 400, H = h;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d[yKey] - min) / range) * (H - 8) - 4
  }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 4}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <linearGradient id={`sg-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#sg-${yKey})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="#0d1117" strokeWidth="1.5" />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 9, color: "#4b5563", fontFamily: "var(--mono)", letterSpacing: "0.02em" }}>{d[xKey]}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, xKey, yKey, color = "#60a5fa", h = 110 }) {
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: h, padding: "0 2px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{
            width: "100%", borderRadius: "3px 3px 0 0",
            background: `linear-gradient(to top, ${color}cc, ${color}55)`,
            height: `${(d[yKey] / max) * (h - 18)}px`, minHeight: 2
          }} />
          <span style={{ fontSize: 8, color: "#4b5563", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>{d[xKey]}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ data, size = 100 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const R = 38, cx = 50, cy = 50;
  const slices = data.map(d => {
    const pct = d.value / total;
    const s = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    const e = cum * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + R * Math.cos(s), y1 = cy + R * Math.sin(s);
    const x2 = cx + R * Math.cos(e), y2 = cy + R * Math.sin(e);
    return { ...d, path: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${pct > 0.5 ? 1 : 0},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z` };
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity="0.88" />)}
      <circle cx={cx} cy={cy} r="24" fill="#0d1117" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════════════════════ */
function Spinner({ s = 18 }) {
  return (
    <div style={{
      width: s, height: s, border: `2px solid #1a2332`, borderTopColor: "#34d399",
      borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block"
    }} />
  );
}

function Badge({ text, color = "#34d399" }) {
  return (
    <span style={{
      background: color + "1a", color, border: `1px solid ${color}44`,
      padding: "2px 9px", borderRadius: 99, fontSize: 10,
      fontFamily: "var(--mono)", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap"
    }}>{text}</span>
  );
}

function SevBadge({ sev }) {
  const map = { Critical: "#f87171", High: "#fbbf24", Medium: "#a78bfa", Low: "#34d399" };
  return <Badge text={sev} color={map[sev] || "#94a3b8"} />;
}

function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: "#0d1117", border: `1px solid ${glow ? glow + "44" : "#1a2332"}`,
      borderRadius: 14, overflow: "hidden",
      boxShadow: glow ? `0 0 28px ${glow}12` : "none",
      transition: "border-color 0.25s, box-shadow 0.25s",
      ...style
    }}>{children}</div>
  );
}

function CardInner({ children, style = {} }) {
  return <div style={{ padding: "20px 22px", ...style }}>{children}</div>;
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em",
      color: "#34d399", textTransform: "uppercase", marginBottom: 6
    }}>{children}</div>
  );
}

function PageHeader({ label, title, sub }) {
  return (
    <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
      <SectionLabel>{label}</SectionLabel>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function StatTile({ icon, value, label, sub, color = "#34d399" }) {
  return (
    <Card style={{ padding: "18px 20px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.05em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--mono)", marginTop: 5, letterSpacing: "0.03em" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function ProgressRow({ label, value, color }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: "#94a3b8" }}>{label}</span>
        <span style={{ fontWeight: 700, color, fontFamily: "var(--mono)" }}>{value}%</span>
      </div>
      <div style={{ background: "#1a2332", borderRadius: 99, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */
export default function EcoIntelligenceUganda() {
  const [page, setPage]           = useState("home");
  const [mobileOpen, setMobile]   = useState(false);

  // Chat
  const [messages, setMessages]   = useState([{
    role: "assistant",
    content: "🌿 **Welcome to EcoIntelligence AI — Uganda Edition**\n\nI'm your AI environmental analyst with deep knowledge of Uganda's ecosystems, climate, and sustainability challenges.\n\nAsk me anything:\n• 🌳 Mabira or Budongo deforestation\n• 💧 Lake Victoria pollution\n• 🌡️ Climate impacts on Ugandan farmers\n• ♻️ Kampala waste crisis\n• ⚡ Clean energy alternatives\n• 🌍 Uganda vs global comparisons\n\nWhat would you like to explore?"
  }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const historyRef = useRef([]);
  const chatEndRef = useRef(null);

  // Weather
  const [city, setCity]           = useState(CITIES[0]);
  const [wxData, setWxData]       = useState(null);
  const [wxLoading, setWxLoading] = useState(false);
  const [wxError, setWxError]     = useState("");
  const [wxAI, setWxAI]           = useState("");
  const [wxAILoading, setWxAILoading] = useState(false);

  // News
  const [newsCat, setNewsCat]     = useState(NEWS_CATS[0]);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [newsFetched, setNewsFetched] = useState(false);

  // Solutions
  const [activeIssue, setActiveIssue] = useState(null);

  /* ── Effects ── */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { loadWeather(city); }, [city]);

  /* ── Weather ── */
  async function loadWeather(c) {
    setWxLoading(true); setWxError(""); setWxAI("");
    try {
      const d = await getWeather(c.lat, c.lon);
      setWxData({ ...d, cityName: c.name, cityRegion: c.region });
    } catch (e) { setWxError("Failed to load weather data. Please try again."); }
    setWxLoading(false);
  }

  async function runWxAI() {
    if (!wxData) return;
    setWxAILoading(true);
    const { current: cr, daily: dy, cityName } = wxData;
    const prompt = `Analyse this real weather data for ${cityName}, Uganda and provide environmental intelligence:

Current: ${cr.temperature_2m}°C (feels ${cr.apparent_temperature}°C), humidity ${cr.relative_humidity_2m}%, wind ${cr.wind_speed_10m} km/h, precipitation ${cr.precipitation}mm, UV ${cr.uv_index}, condition code ${cr.weather_code}
7-day max rain: ${Math.max(...(dy?.precipitation_sum || [0])).toFixed(1)}mm, max rain probability: ${Math.max(...(dy?.precipitation_probability_max || [0]))}%

Provide:
1. 🌊 Flood/drought risk assessment for ${cityName}
2. 🌾 Agricultural implications for local farmers right now
3. 🔗 Connection to Uganda's long-term climate change trends
4. ✅ 3 specific safety/environmental actions for communities

Be concise, practical, Uganda-specific. Use bullet points.`;
    try {
      const text = await callClaude([{ role: "user", content: prompt }], CHAT_SYSTEM);
      setWxAI(text);
    } catch { setWxAI("Analysis failed — please try again."); }
    setWxAILoading(false);
  }

  /* ── Chat ── */
  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim(); setChatInput(""); setChatLoading(true);
    const userMsg = { role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    try {
      const text = await callClaude([...historyRef.current, userMsg], CHAT_SYSTEM);
      const aMsg = { role: "assistant", content: text };
      setMessages(prev => [...prev, aMsg]);
      historyRef.current = [...historyRef.current, userMsg, aMsg].slice(-20);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please retry." }]);
    }
    setChatLoading(false);
  }

  /* ── News ── */
  async function fetchNews(cat) {
    setNewsLoading(true); setNewsError(""); setNewsItems([]);
    const system = `You are an environmental news aggregator for Uganda and Africa. Use web search to find the latest real news.
Return ONLY a raw JSON array (no markdown, no backticks) of exactly 6 items:
[{"title":"...","summary":"2-3 sentences","source":"publication name","date":"month year","category":"deforestation|water|climate|energy|wildlife|policy|agriculture","urgency":"high|medium|low","location":"specific place in Uganda or Africa"}]
Use ONLY real, verifiable news from 2024-2025. Do not invent stories.`;
    try {
      const raw = await callClaude(
        [{ role: "user", content: `Search for and return latest news about: ${cat.q}. Return only the JSON array.` }],
        system, true
      );
      const s = raw.indexOf("["), e = raw.lastIndexOf("]");
      if (s === -1 || e === -1) throw new Error("No JSON");
      const parsed = JSON.parse(raw.slice(s, e + 1));
      setNewsItems(parsed);
      setNewsFetched(true);
    } catch { setNewsError("Could not retrieve news. The AI may need a moment — please try again."); }
    setNewsLoading(false);
  }

  /* ── STYLES ── */
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #080d14; --surface: #0d1117; --s2: #111827;
      --border: #1a2332; --border2: #1e2d3d;
      --text: #e2e8f0; --text2: #94a3b8; --text3: #4b5563;
      --green: #34d399; --green2: #6ee7b7; --green3: #059669;
      --blue: #60a5fa; --amber: #fbbf24; --orange: #fb923c; --red: #f87171; --purple: #a78bfa;
      --font: 'Sora', system-ui, sans-serif; --mono: 'DM Mono', monospace;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes pulse2   { 0%,100%{opacity:.3;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
    @keyframes ticker   { from{transform:translateX(100%)} to{transform:translateX(-100%)} }
    .page { padding: 32px 20px 80px; max-width: 1240px; margin: 0 auto; animation: fadeIn 0.35s ease; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
    .grid-auto { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
    @media(max-width:800px){.grid2,.grid3,.grid4{grid-template-columns:1fr} .nav-links{display:none} .mob-btn{display:block!important}}
    @media(max-width:600px){.hero-title{font-size:32px!important}}
    .nav-link { background:none; border:none; cursor:pointer; padding:7px 13px; border-radius:8px;
      font-family:var(--font); font-size:13px; font-weight:500; color:var(--text2);
      transition:background .15s,color .15s; }
    .nav-link:hover { background:#1a2332; color:var(--text); }
    .nav-link.active { background:rgba(52,211,153,.1); color:var(--green); }
    .mob-link { display:block; width:100%; text-align:left; padding:13px 18px; border:none;
      background:none; font-family:var(--font); font-size:15px; color:var(--text2); cursor:pointer;
      border-radius:10px; transition:all .15s; }
    .mob-link:hover,.mob-link.active { background:rgba(52,211,153,.08); color:var(--green); }
    .btn-primary { background:linear-gradient(135deg,#34d399,#059669); border:none; border-radius:10px;
      padding:10px 22px; font-family:var(--font); font-weight:700; font-size:13px; color:#0d1117;
      cursor:pointer; transition:opacity .15s,transform .15s; }
    .btn-primary:hover { opacity:.9; transform:translateY(-1px); }
    .btn-primary:disabled { opacity:.45; cursor:not-allowed; transform:none; }
    .btn-ghost { background:rgba(255,255,255,.04); border:1px solid var(--border2);
      border-radius:10px; padding:10px 22px; font-family:var(--font); font-weight:600;
      font-size:13px; color:var(--text2); cursor:pointer; transition:all .15s; }
    .btn-ghost:hover { border-color:#34d39944; color:var(--text); }
    .tab-pill { background:transparent; border:1px solid var(--border2);
      border-radius:99px; padding:6px 14px; font-family:var(--mono);
      font-size:11px; color:var(--text3); cursor:pointer; transition:all .15s; }
    .tab-pill:hover { border-color:var(--border2); color:var(--text2); }
    .tab-pill.active { background:rgba(52,211,153,.1); border-color:#34d39944; color:var(--green); }
    .chat-msgs { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; }
    .chat-msgs::-webkit-scrollbar { width:3px; }
    .bubble { max-width:82%; animation:fadeUp 0.25s ease; }
    .bubble.user { align-self:flex-end; }
    .bubble.assistant { align-self:flex-start; }
    .bubble-body { padding:12px 16px; border-radius:14px; font-size:13.5px; line-height:1.72; white-space:pre-wrap; }
    .bubble.user .bubble-body { background:linear-gradient(135deg,rgba(52,211,153,.18),rgba(96,165,250,.1)); border:1px solid rgba(52,211,153,.2); border-bottom-right-radius:3px; }
    .bubble.assistant .bubble-body { background:#111827; border:1px solid var(--border); border-bottom-left-radius:3px; }
    .typing { display:flex; gap:5px; padding:12px 16px; align-items:center; }
    .dot { width:7px; height:7px; background:var(--green); border-radius:50%; animation:pulse2 1.1s ease infinite; }
    .dot:nth-child(2){animation-delay:.18s} .dot:nth-child(3){animation-delay:.36s}
    .wx-day { background:#111827; border:1px solid var(--border); border-radius:12px;
      padding:14px 10px; text-align:center; transition:all .2s; }
    .wx-day:hover { border-color:#34d39933; transform:translateY(-2px); }
    .news-card { background:#0d1117; border:1px solid var(--border); border-radius:14px;
      padding:18px 20px; display:flex; flex-direction:column; gap:10px;
      animation:fadeUp .3s ease both; transition:border-color .2s,transform .2s; }
    .news-card:hover { border-color:#34d39933; transform:translateY(-2px); }
    .issue-card { background:#0d1117; border:1px solid var(--border); border-radius:14px;
      padding:18px; cursor:pointer; transition:all .2s; }
    .issue-card:hover { border-color:#34d39933; transform:translateY(-2px); }
    .issue-card.active { border-color:#34d39977; background:rgba(52,211,153,.04); }
    .skel { background:linear-gradient(90deg,#111827 25%,#1a2332 50%,#111827 75%);
      background-size:400px 100%; animation:shimmer 1.4s ease-in-out infinite;
      border-radius:6px; }
    @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .divider { height:1px; background:var(--border); margin:20px 0; }
  `;

  /* ── NAV ── */
  const NAV = [
    { id:"home",      label:"Home"              },
    { id:"assistant", label:"AI Assistant"      },
    { id:"dashboard", label:"Dashboard"         },
    { id:"weather",   label:"Weather"           },
    { id:"news",      label:"📰 News"           },
    { id:"solutions", label:"Solutions"         },
    { id:"about",     label:"About"             }
  ];

  /* ════════════════════════════════════════════
     PAGE: HOME
  ════════════════════════════════════════════ */
  function PageHome() {
    return (
      <div className="page">
        {/* Hero */}
        <div style={{ paddingTop: 24, paddingBottom: 48, animation: "fadeUp .5s ease" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.18)", borderRadius:99, padding:"5px 14px", marginBottom:20 }}>
            <div style={{ width:7, height:7, background:"#34d399", borderRadius:"50%", animation:"pulse2 2s infinite" }} />
            <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"#34d399", letterSpacing:"0.1em" }}>LIVE ENVIRONMENTAL INTELLIGENCE · UGANDA EDITION</span>
          </div>
          <h1 className="hero-title" style={{ fontSize:52, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.08, marginBottom:16 }}>
            Uganda's <span style={{ color:"#34d399" }}>Environmental</span><br />Intelligence Platform
          </h1>
          <p style={{ fontSize:16, color:"#94a3b8", maxWidth:560, lineHeight:1.7, marginBottom:32 }}>
            AI-powered insights on Uganda's climate, deforestation, wetlands, and pollution — with real-time weather data and actionable local solutions.
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => setPage("assistant")}>💬 Ask EcoAI</button>
            <button className="btn-ghost" onClick={() => setPage("dashboard")}>📊 Dashboard</button>
            <button className="btn-ghost" onClick={() => setPage("weather")}>🌦️ Weather Monitor</button>
            <button className="btn-ghost" onClick={() => setPage("news")}>📰 Live News</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid4" style={{ marginBottom:20 }}>
          <StatTile icon="🌳" value="9%" label="FOREST COVER REMAINING" sub="Down from 45% in 1990" color="#f87171" />
          <StatTile icon="💧" value="60%" label="WETLANDS DESTROYED" sub="Since 1994" color="#fbbf24" />
          <StatTile icon="🌡️" value="+1.3°C" label="TEMP RISE SINCE 1960" sub="Projected +2-3°C by 2050" color="#fb923c" />
          <StatTile icon="🌍" value="0.13t" label="CO₂ PER CAPITA/YR" sub="36× below global average" color="#34d399" />
        </div>

        {/* Charts row */}
        <div className="grid2" style={{ marginBottom:16 }}>
          <Card>
            <CardInner>
              <SectionLabel>Forest Cover Trend</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:14 }}>Uganda Forest Coverage (%)</div>
              <SparkLine data={FOREST_SERIES} xKey="year" yKey="pct" color="#34d399" h={110} />
              <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)", marginTop:8 }}>Source: Uganda Forest Authority · NFA</div>
            </CardInner>
          </Card>
          <Card>
            <CardInner>
              <SectionLabel>Emissions Trend</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:14 }}>Uganda Total CO₂ (Mt/year)</div>
              <SparkLine data={CO2_SERIES} xKey="year" yKey="uganda" color="#60a5fa" h={110} />
              <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)", marginTop:8 }}>Source: Our World in Data · World Bank</div>
            </CardInner>
          </Card>
        </div>

        {/* Status grid */}
        <Card style={{ marginBottom:16 }}>
          <CardInner>
            <SectionLabel>Environmental Health</SectionLabel>
            <div style={{ fontWeight:700, marginBottom:18 }}>Critical Issues Status</div>
            <div className="grid2">
              <ProgressRow label="Forest Cover Remaining" value={9}  color="#f87171" />
              <ProgressRow label="Wetlands Remaining"     value={40} color="#fbbf24" />
              <ProgressRow label="Lake Victoria Health"   value={28} color="#f87171" />
              <ProgressRow label="Kampala Air Quality"    value={18} color="#f87171" />
              <ProgressRow label="Waste Collection Rate"  value={40} color="#fbbf24" />
              <ProgressRow label="Clean Energy Access"    value={42} color="#a78bfa" />
            </div>
          </CardInner>
        </Card>

        {/* News teaser */}
        <Card glow="#34d399">
          <CardInner>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:18 }}>
              <div>
                <SectionLabel>Real-Time Intelligence</SectionLabel>
                <div style={{ fontWeight:700, fontSize:16 }}>Live Environmental News</div>
                <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>AI web search · Uganda & Africa environmental stories</div>
              </div>
              <button className="btn-primary" onClick={() => setPage("news")}>📰 Open News Feed →</button>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {NEWS_CATS.slice(0,5).map(c => (
                <button key={c.id} className="tab-pill" onClick={() => { setNewsCat(c); setPage("news"); }}>{c.label}</button>
              ))}
            </div>
          </CardInner>
        </Card>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     PAGE: AI ASSISTANT
  ════════════════════════════════════════════ */
  function PageAssistant() {
    const QUICK = [
      "What's causing deforestation in Mabira Forest?",
      "How polluted is Lake Victoria right now?",
      "Clean energy alternatives for rural Uganda?",
      "Uganda's CO₂ vs global average explained",
      "Flood risks in Kampala — causes and solutions",
      "How is climate change hurting Ugandan farmers?"
    ];
    return (
      <div className="page">
        <PageHeader label="AI Environmental Intelligence" title="EcoAI Assistant"
          sub="Powered by Claude AI + Uganda Environmental Knowledge Base (RAG)" />
        <div className="grid2" style={{ gap:20 }}>
          <Card style={{ height:640, display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, background:"linear-gradient(135deg,#34d399,#059669)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🌿</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>EcoAI Uganda</div>
                <div style={{ fontSize:10, color:"#34d399", fontFamily:"var(--mono)" }}>● ONLINE</div>
              </div>
            </div>
            <div className="chat-msgs" ref={chatEndRef}>
              {messages.map((m, i) => (
                <div key={i} className={`bubble ${m.role}`}>
                  {m.role === "assistant" && <div style={{ fontSize:10, color:"#4b5563", fontFamily:"var(--mono)", marginBottom:3, paddingLeft:4 }}>🤖 ECOAI</div>}
                  <div className="bubble-body">{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="bubble assistant">
                  <div className="bubble-body"><div className="typing"><div className="dot"/><div className="dot"/><div className="dot"/></div></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", display:"flex", gap:8 }}>
              <textarea
                style={{ flex:1, background:"#111827", border:"1px solid var(--border)", borderRadius:10, padding:"10px 13px", color:"var(--text)", fontFamily:"var(--font)", fontSize:13, resize:"none", outline:"none", maxHeight:100, minHeight:42, transition:"border-color .2s" }}
                placeholder="Ask about Uganda's environment..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                rows={1}
                onFocus={e => e.target.style.borderColor = "#34d39944"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <button className="btn-primary" onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{ padding:"10px 14px", flexShrink:0 }}>
                {chatLoading ? <Spinner s={16}/> : "↑"}
              </button>
            </div>
          </Card>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card>
              <CardInner>
                <SectionLabel>Quick Topics</SectionLabel>
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                  {QUICK.map((q, i) => (
                    <button key={i} onClick={() => setChatInput(q)}
                      style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:9, padding:"9px 13px", color:"#94a3b8", fontSize:13, textAlign:"left", cursor:"pointer", fontFamily:"var(--font)", transition:"all .15s" }}
                      onMouseEnter={e => { e.target.style.borderColor = "#34d39933"; e.target.style.color = "var(--text)"; }}
                      onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "#94a3b8"; }}>
                      💬 {q}
                    </button>
                  ))}
                </div>
              </CardInner>
            </Card>
            <Card>
              <CardInner>
                <SectionLabel>Knowledge Base</SectionLabel>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                  {["Deforestation","Lake Victoria","Wetlands","Kampala Waste","CO₂ Data","Clean Energy","Climate","Agriculture","NEMA","NFA","LVEMP"].map(t => (
                    <span key={t} style={{ background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.15)", borderRadius:6, padding:"3px 9px", fontSize:11, color:"#34d399", fontFamily:"var(--mono)" }}>{t}</span>
                  ))}
                </div>
                <div style={{ marginTop:12, fontSize:12, color:"#4b5563", lineHeight:1.6 }}>Verified data: NEMA · UFA · World Bank · UNEP · NASA Earth Data · Our World in Data</div>
              </CardInner>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     PAGE: DASHBOARD
  ════════════════════════════════════════════ */
  function PageDashboard() {
    return (
      <div className="page">
        <PageHeader label="Environmental Intelligence" title="Uganda Dashboard" sub="Real-time environmental monitoring and trend analysis" />
        <div className="grid4" style={{ marginBottom:18 }}>
          <StatTile icon="🌳" value="9%"    label="FOREST COVER"         sub="122K ha lost/year"              color="#f87171" />
          <StatTile icon="💧" value="40M L" label="DAILY SEWAGE TO LAKE" sub="From Kampala alone"             color="#fbbf24" />
          <StatTile icon="💨" value="40–60" label="KAMPALA PM2.5 µg/m³"  sub="WHO limit: 5 µg/m³"            color="#fb923c" />
          <StatTile icon="⚡" value="90%"   label="HYDROPOWER SHARE"     sub="Of electricity generated"      color="#34d399" />
        </div>
        <div className="grid2" style={{ marginBottom:16 }}>
          <Card>
            <CardInner>
              <SectionLabel>Trend · 1990–2024</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:4 }}>Forest Cover Collapse</div>
              <div style={{ fontSize:12, color:"#4b5563", fontFamily:"var(--mono)", marginBottom:14 }}>% of Uganda land area</div>
              <BarChart data={FOREST_SERIES} xKey="year" yKey="pct" color="#f87171" h={120} />
              <div style={{ marginTop:14, background:"rgba(248,113,113,.06)", border:"1px solid rgba(248,113,113,.18)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:12, color:"#f87171", fontWeight:700, marginBottom:4 }}>🚨 Critical Status</div>
                <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>At current rates, commercially viable forests could be depleted before 2040. Immediate intervention required.</div>
              </div>
            </CardInner>
          </Card>
          <Card>
            <CardInner>
              <SectionLabel>CO₂ Emissions Trend</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:4 }}>Total Emissions (Mt CO₂/yr)</div>
              <div style={{ fontSize:12, color:"#4b5563", fontFamily:"var(--mono)", marginBottom:14 }}>Uganda absolute emissions</div>
              <SparkLine data={CO2_SERIES} xKey="year" yKey="uganda" color="#60a5fa" h={110} />
              <div style={{ marginTop:14, background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.15)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:12, color:"#34d399", fontWeight:700, marginBottom:4 }}>✅ Context Matters</div>
                <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>Uganda emits 0.13t per capita — 36× below the global average of 4.7t. Uganda suffers climate change disproportionately.</div>
              </div>
            </CardInner>
          </Card>
        </div>
        <div className="grid2" style={{ marginBottom:16 }}>
          <Card>
            <CardInner>
              <SectionLabel>Emissions by Sector</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:18 }}>Uganda CO₂ Breakdown</div>
              <div style={{ display:"flex", alignItems:"center", gap:24 }}>
                <Donut data={SECTORS} size={110} />
                <div style={{ flex:1 }}>
                  {SECTORS.map(s => (
                    <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:s.color, flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"#94a3b8", flex:1 }}>{s.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:s.color, fontFamily:"var(--mono)" }}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardInner>
          </Card>
          <Card>
            <CardInner>
              <SectionLabel>Regional Risk Map</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:16 }}>Risk by Region</div>
              {[
                { r:"Kampala (Central)",    risk:"CRITICAL", c:"#f87171", issues:"Air pollution · Flooding · Waste" },
                { r:"Northern (Gulu)",      risk:"HIGH",     c:"#fbbf24", issues:"Charcoal · Post-conflict reforestation" },
                { r:"Eastern (Mbale)",      risk:"HIGH",     c:"#fbbf24", issues:"Landslides · Mt Elgon deforestation" },
                { r:"Western (Mbarara)",    risk:"MODERATE", c:"#60a5fa", issues:"Pastoral overgrazing · Water access" },
                { r:"Lake Victoria Basin",  risk:"CRITICAL", c:"#f87171", issues:"Sewage · Water hyacinth · Fish decline" },
                { r:"Rwenzori / Fort Portal",risk:"MODERATE",c:"#60a5fa", issues:"Glacier retreat · Forest biodiversity" }
              ].map((row, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 0", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{row.r}</div>
                    <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)", marginTop:2 }}>{row.issues}</div>
                  </div>
                  <Badge text={row.risk} color={row.c} />
                </div>
              ))}
            </CardInner>
          </Card>
        </div>
        <Card>
          <CardInner>
            <SectionLabel>Uganda vs Global</SectionLabel>
            <div style={{ fontWeight:700, marginBottom:16 }}>Atmospheric CO₂ Concentration (ppm)</div>
            <SparkLine data={CO2_SERIES} xKey="year" yKey="global" color="#fbbf24" h={110} />
            <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)", marginTop:8 }}>Global atmospheric CO₂ (ppm) — Mauna Loa · Source: NOAA / Our World in Data</div>
          </CardInner>
        </Card>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     PAGE: WEATHER
  ════════════════════════════════════════════ */
  function PageWeather() {
    const cr = wxData?.current;
    const dy = wxData?.daily;
    const [desc, emoji] = wxInfo(cr?.weather_code || 0);
    const floodRisk = cr?.precipitation > 15 || (cr?.weather_code || 0) >= 80 ? { l:"HIGH", c:"#f87171" }
      : cr?.precipitation > 5 || (cr?.weather_code || 0) >= 61 ? { l:"MOD", c:"#fbbf24" }
      : { l:"LOW", c:"#34d399" };

    return (
      <div className="page">
        <PageHeader label="Real-Time Weather Intelligence" title="Weather & Climate Monitor"
          sub="Live data from Open-Meteo API (no API key required) · 7-day forecast · AI environmental analysis" />

        {/* City tabs */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:22 }}>
          {CITIES.map(c => (
            <button key={c.name} className={`tab-pill ${city.name === c.name ? "active" : ""}`} onClick={() => setCity(c)}>
              📍 {c.name}
            </button>
          ))}
        </div>

        {wxLoading ? (
          <Card><CardInner style={{ textAlign:"center", padding:60 }}>
            <Spinner s={40} />
            <div style={{ color:"#94a3b8", marginTop:16, fontFamily:"var(--mono)", fontSize:12 }}>Fetching live weather for {city.name}…</div>
          </CardInner></Card>
        ) : wxError ? (
          <Card><CardInner style={{ textAlign:"center", padding:40 }}>
            <div style={{ color:"#f87171", marginBottom:12 }}>⚠️ {wxError}</div>
            <button className="btn-ghost" onClick={() => loadWeather(city)}>↻ Retry</button>
          </CardInner></Card>
        ) : wxData && cr ? (<>
          <div className="grid2" style={{ marginBottom:16 }}>
            <Card glow="#34d399">
              <CardInner>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:2 }}>
                  <div>
                    <SectionLabel>Current Conditions</SectionLabel>
                    <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.03em" }}>{city.name}, Uganda</div>
                    <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)" }}>{city.region} Region · Pop {city.pop}</div>
                  </div>
                  <Badge text={`🌊 FLOOD ${floodRisk.l}`} color={floodRisk.c} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:18, padding:"16px 0" }}>
                  <div style={{ fontSize:60, lineHeight:1 }}>{emoji}</div>
                  <div>
                    <div style={{ fontSize:52, fontWeight:800, letterSpacing:"-0.05em", lineHeight:1 }}>{Math.round(cr.temperature_2m)}°C</div>
                    <div style={{ fontSize:16, color:"#94a3b8", marginTop:4 }}>{desc}</div>
                    <div style={{ fontSize:13, color:"#4b5563", marginTop:2, fontFamily:"var(--mono)" }}>Feels {Math.round(cr.apparent_temperature)}°C</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    ["💧 Humidity",    `${cr.relative_humidity_2m}%`],
                    ["🌧️ Rain now",    `${cr.precipitation}mm`],
                    ["💨 Wind",        `${cr.wind_speed_10m} km/h`],
                    ["🌡️ Pressure",   `${cr.surface_pressure} hPa`],
                    ["☀️ UV Index",    `${cr.uv_index}`],
                  ].map(([l,v]) => (
                    <div key={l} style={{ background:"#111827", borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ fontSize:11, color:"#4b5563" }}>{l}</div>
                      <div style={{ fontSize:14, fontWeight:700, fontFamily:"var(--mono)", marginTop:2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </CardInner>
            </Card>

            <Card>
              <CardInner>
                <SectionLabel>Climate Risk Indicators</SectionLabel>
                <div style={{ fontWeight:700, marginBottom:16 }}>Environmental Risk Scores</div>
                <ProgressRow label="Flooding Risk" value={cr.precipitation > 15 ? 82 : cr.precipitation > 5 ? 44 : 16} color="#60a5fa" />
                <ProgressRow label="Heat Stress"   value={cr.temperature_2m > 33 ? 78 : cr.temperature_2m > 29 ? 48 : 22} color="#fb923c" />
                <ProgressRow label="Drought Risk"  value={cr.precipitation === 0 && cr.relative_humidity_2m < 40 ? 68 : 22} color="#f87171" />
                <ProgressRow label="UV Exposure"   value={Math.min(Math.round((cr.uv_index / 11) * 100), 100)} color="#fbbf24" />
                <div className="divider" />
                <div style={{ fontSize:12, color:"#4b5563", lineHeight:1.65 }}>
                  <strong style={{ color:"#94a3b8" }}>Environmental context:</strong> {city.name} sits at {city.region} Uganda.
                  {city.name === "Kampala" ? " 150+ flood-prone areas. Poor drainage amplifies rainfall impacts." :
                   city.name === "Gulu" ? " Northern drought corridor. Karamoja pastoralists most vulnerable." :
                   city.name === "Mbale" ? " High landslide risk on Mt. Elgon slopes. Deforestation worsens risk." :
                   " Monitor for seasonal flooding and agricultural impacts."}
                </div>
              </CardInner>
            </Card>
          </div>

          {/* 7-day forecast */}
          <Card style={{ marginBottom:16 }}>
            <CardInner>
              <SectionLabel>7-Day Forecast</SectionLabel>
              <div style={{ fontWeight:700, marginBottom:16 }}>Daily Outlook — {city.name} · Live from Open-Meteo API</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
                {dy?.time?.slice(0,7).map((date, i) => {
                  const d = new Date(date);
                  const [, icon] = wxInfo(dy.weather_code[i]);
                  const isToday = i === 0;
                  return (
                    <div className="wx-day" key={i} style={isToday ? { borderColor:"#34d39944", background:"rgba(52,211,153,.04)" } : {}}>
                      <div style={{ fontFamily:"var(--mono)", fontSize:9, color:"#4b5563", marginBottom:4 }}>{isToday ? "TODAY" : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]}</div>
                      <div style={{ fontSize:24, margin:"6px 0" }}>{icon}</div>
                      <div style={{ fontSize:13, fontWeight:700 }}>
                        <span style={{ color:"#f87171" }}>{Math.round(dy.temperature_2m_max[i])}°</span>
                        <span style={{ color:"#4b5563" }}>/</span>
                        <span style={{ color:"#60a5fa" }}>{Math.round(dy.temperature_2m_min[i])}°</span>
                      </div>
                      <div style={{ fontSize:10, color:"#60a5fa", fontFamily:"var(--mono)", marginTop:4 }}>💧{dy.precipitation_probability_max[i]}%</div>
                      <div style={{ fontSize:9, color:"#4b5563", fontFamily:"var(--mono)", marginTop:2 }}>{(dy.precipitation_sum[i]||0).toFixed(1)}mm</div>
                    </div>
                  );
                })}
              </div>
            </CardInner>
          </Card>

          {/* AI analysis */}
          <Card glow={wxAI ? "#34d399" : undefined}>
            <CardInner>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
                <div>
                  <SectionLabel>AI Weather Intelligence</SectionLabel>
                  <div style={{ fontWeight:700, fontSize:16 }}>Environmental Risk Analysis</div>
                  <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>AI interprets weather for farming, flooding, and climate impact</div>
                </div>
                <button className="btn-primary" onClick={runWxAI} disabled={wxAILoading}>
                  {wxAILoading ? <><Spinner s={14}/> <span style={{ marginLeft:6 }}>Analysing…</span></> : "🤖 Analyse with AI"}
                </button>
              </div>
              {wxAI ? (
                <div style={{ background:"rgba(52,211,153,.04)", border:"1px solid rgba(52,211,153,.14)", borderRadius:12, padding:"16px 18px", fontSize:14, lineHeight:1.75, whiteSpace:"pre-wrap", color:"var(--text)", animation:"fadeIn .4s ease" }}>{wxAI}</div>
              ) : (
                <div style={{ padding:"28px 0", textAlign:"center", border:"1px dashed var(--border)", borderRadius:12, color:"#4b5563", fontSize:14 }}>
                  Click "Analyse with AI" for environmental risk assessment, agricultural insights, and climate connection for {city.name}
                </div>
              )}
            </CardInner>
          </Card>
        </>) : null}
      </div>
    );
  }

  /* ════════════════════════════════════════════
     PAGE: NEWS
  ════════════════════════════════════════════ */
  function PageNews() {
    const urgColor = { high:"#f87171", medium:"#fbbf24", low:"#60a5fa" };
    const catIcon = { deforestation:"🌳", water:"💧", climate:"🌡️", energy:"⚡", wildlife:"🦍", policy:"📋", agriculture:"🌾" };

    return (
      <div className="page">
        <PageHeader label="Live Environmental Intelligence" title="Environmental News Feed"
          sub="Real-time news powered by Claude AI web search · Uganda & Africa · Updated on demand" />

        {/* Ticker */}
        <div style={{ background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.12)", borderRadius:10, padding:"10px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:12, overflow:"hidden" }}>
          <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:600, color:"#f87171", background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.2)", padding:"3px 9px", borderRadius:6, flexShrink:0 }}>● LIVE</span>
          <span style={{ fontSize:12, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {newsFetched && newsItems.length > 0
              ? `Latest: ${newsItems[0]?.title} — ${newsItems[0]?.source}`
              : "Select a category and click 'Fetch News' to load real-time environmental stories from Uganda and Africa"}
          </span>
        </div>

        {/* Category tabs */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:20 }}>
          {NEWS_CATS.map(c => (
            <button key={c.id} className={`tab-pill ${newsCat.id === c.id ? "active" : ""}`} onClick={() => setNewsCat(c)}>{c.label}</button>
          ))}
        </div>

        {/* Fetch button */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24, flexWrap:"wrap" }}>
          <button className="btn-primary" onClick={() => fetchNews(newsCat)} disabled={newsLoading}>
            {newsLoading ? <><Spinner s={14}/> <span style={{ marginLeft:6 }}>Searching the web…</span></> : `🔍 Fetch Latest ${newsCat.label} News`}
          </button>
          {newsFetched && !newsLoading && (
            <span style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)" }}>✓ {newsItems.length} articles · {new Date().toLocaleTimeString()}</span>
          )}
        </div>

        {newsError && (
          <div style={{ background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.2)", borderRadius:10, padding:"13px 16px", color:"#f87171", fontSize:13, marginBottom:20 }}>⚠️ {newsError}</div>
        )}

        {/* News grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14 }}>
          {/* Loading skeletons */}
          {newsLoading && [0,1,2,3,4,5].map(i => (
            <div key={i} className="news-card" style={{ animationDelay:`${i*.07}s` }}>
              <div className="skel" style={{ height:14, width:"30%" }} />
              <div className="skel" style={{ height:18, width:"90%" }} />
              <div className="skel" style={{ height:14, width:"100%" }} />
              <div className="skel" style={{ height:14, width:"80%" }} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                <div className="skel" style={{ height:12, width:"28%" }} />
                <div className="skel" style={{ height:12, width:"20%" }} />
              </div>
            </div>
          ))}

          {/* Articles */}
          {!newsLoading && newsItems.map((a, i) => (
            <div key={i} className="news-card" style={{ animationDelay:`${i*.06}s` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)" }}>{catIcon[a.category] || "📰"} {a.category?.toUpperCase()}</span>
                <Badge text={a.urgency === "high" ? "🔴 URGENT" : a.urgency === "medium" ? "🟡 NOTABLE" : "🔵 UPDATE"} color={urgColor[a.urgency] || "#60a5fa"} />
              </div>
              <div style={{ fontWeight:700, fontSize:15, lineHeight:1.38, color:"var(--text)" }}>{a.title}</div>
              <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.65, flex:1 }}>{a.summary}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:"1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#34d399", fontFamily:"var(--mono)" }}>{a.source}</div>
                  {a.location && <div style={{ fontSize:11, color:"#6ee7b7", marginTop:2, fontFamily:"var(--mono)" }}>📍 {a.location}</div>}
                </div>
                <span style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)" }}>🗓 {a.date}</span>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!newsLoading && !newsFetched && (
            <div style={{ gridColumn:"1/-1", padding:"60px 24px", textAlign:"center", border:"1px dashed var(--border)", borderRadius:14, color:"#4b5563" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📰</div>
              <div style={{ fontSize:18, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>Ready to fetch live news</div>
              <div style={{ fontSize:14, maxWidth:400, margin:"0 auto", lineHeight:1.65 }}>
                Select a category and click "Fetch News". Claude will search the web and return real, current environmental stories about Uganda and Africa.
              </div>
            </div>
          )}
        </div>

        {/* Summary panel */}
        {newsFetched && newsItems.length > 0 && !newsLoading && (
          <Card style={{ marginTop:24 }}>
            <CardInner>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
                <div>
                  <SectionLabel>News Summary</SectionLabel>
                  <div style={{ fontWeight:700 }}>{newsItems.length} articles · {[...new Set(newsItems.map(a=>a.category))].length} categories</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {["high","medium","low"].map(u => {
                    const n = newsItems.filter(a=>a.urgency===u).length;
                    if (!n) return null;
                    return (
                      <div key={u} style={{ padding:"10px 16px", background:`${urgColor[u]}0d`, border:`1px solid ${urgColor[u]}2a`, borderRadius:10, textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:800, color:urgColor[u], fontFamily:"var(--mono)" }}>{n}</div>
                        <div style={{ fontSize:10, color:"#4b5563", fontFamily:"var(--mono)" }}>{u.toUpperCase()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {[...new Set(newsItems.map(a=>a.location).filter(Boolean))].map(loc => (
                  <span key={loc} style={{ background:"rgba(110,231,183,.06)", border:"1px solid rgba(110,231,183,.15)", borderRadius:99, padding:"4px 12px", fontSize:11, color:"#6ee7b7", fontFamily:"var(--mono)" }}>📍 {loc}</span>
                ))}
              </div>
            </CardInner>
          </Card>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════
     PAGE: SOLUTIONS
  ════════════════════════════════════════════ */
  function PageSolutions() {
    return (
      <div className="page">
        <PageHeader label="Problem → Solution Engine" title="Solutions Hub"
          sub="Select an issue to explore causes, Uganda-specific impacts, and actionable solutions" />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:13, marginBottom:24 }}>
          {ISSUES.map(issue => (
            <div key={issue.id} className={`issue-card ${activeIssue?.id === issue.id ? "active" : ""}`}
              onClick={() => setActiveIssue(activeIssue?.id === issue.id ? null : issue)}>
              <div style={{ fontSize:26, marginBottom:10 }}>{issue.icon}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{issue.title}</div>
                <SevBadge sev={issue.sev} />
              </div>
              <div style={{ fontSize:12, color:issue.color, fontFamily:"var(--mono)", marginBottom:8 }}>{issue.stat}</div>
              <div style={{ fontSize:12, color:"#4b5563" }}>Tap to explore →</div>
            </div>
          ))}
        </div>

        {activeIssue && (
          <Card glow={activeIssue.color} style={{ animation:"fadeUp .3s ease", marginBottom:24 }}>
            <CardInner>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22 }}>
                <div style={{ fontSize:40 }}>{activeIssue.icon}</div>
                <div>
                  <SectionLabel>Deep-Dive Analysis</SectionLabel>
                  <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>{activeIssue.title} in Uganda</h2>
                </div>
              </div>
              <div className="grid3" style={{ marginBottom:20 }}>
                {[
                  { label:"ROOT CAUSES",    c:"#f87171", content:activeIssue.causes },
                  { label:"UGANDA IMPACT",  c:"#fbbf24", content:activeIssue.impact },
                  { label:"KEY METRIC",     c:activeIssue.color, content:activeIssue.stat, big:true }
                ].map(box => (
                  <div key={box.label} style={{ padding:"16px", background:`${box.c}09`, border:`1px solid ${box.c}22`, borderRadius:12 }}>
                    <div style={{ fontSize:10, color:box.c, fontWeight:700, fontFamily:"var(--mono)", letterSpacing:"0.1em", marginBottom:8 }}>{box.label}</div>
                    {box.big
                      ? <><div style={{ fontSize:22, fontWeight:800, color:box.c, marginBottom:6 }}>{box.content}</div><div style={{ fontSize:11, color:"#4b5563" }}>Source: NEMA · World Bank · NFA</div></>
                      : <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.65 }}>{box.content}</div>
                    }
                  </div>
                ))}
              </div>
              <div style={{ fontWeight:700, color:activeIssue.color, fontSize:15, marginBottom:12 }}>✅ Actionable Solutions</div>
              {activeIssue.solutions.map((s, i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"10px 13px", background:`${activeIssue.color}07`, border:`1px solid ${activeIssue.color}18`, borderRadius:10, marginBottom:8, fontSize:14, color:"var(--text)" }}>
                  <div style={{ width:7, height:7, background:activeIssue.color, borderRadius:"50%", marginTop:6, flexShrink:0 }} />
                  <span>{s}</span>
                </div>
              ))}
              <div style={{ marginTop:16, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <div style={{ fontSize:12, color:"#4b5563", fontFamily:"var(--mono)" }}>Key orgs: {activeIssue.orgs}</div>
                <button className="btn-ghost" style={{ fontSize:12, padding:"7px 16px" }}
                  onClick={() => { setChatInput(`Tell me more about solutions for ${activeIssue.title} in Uganda`); setPage("assistant"); }}>
                  💬 Ask EcoAI for more →
                </button>
              </div>
            </CardInner>
          </Card>
        )}

        <Card>
          <CardInner>
            <SectionLabel>Key Organisations</SectionLabel>
            <div style={{ fontWeight:700, marginBottom:16 }}>Uganda Environmental Actors</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12 }}>
              {[
                { a:"NEMA",  f:"National Environment Management Authority",  r:"Regulatory oversight & enforcement" },
                { a:"NFA",   f:"National Forestry Authority",                 r:"Forest management & replanting" },
                { a:"REA",   f:"Rural Electrification Agency",                r:"Clean energy access expansion" },
                { a:"KCCA",  f:"Kampala Capital City Authority",              r:"Urban waste & drainage" },
                { a:"NWSC",  f:"National Water & Sewerage Corporation",       r:"Water supply & treatment" },
                { a:"LVEMP", f:"Lake Victoria Env. Management Project",       r:"World Bank-funded lake restoration" }
              ].map(o => (
                <div key={o.a} style={{ padding:"13px", background:"#111827", borderRadius:10, border:"1px solid var(--border)" }}>
                  <div style={{ fontWeight:800, color:"#34d399", fontSize:15, marginBottom:4 }}>{o.a}</div>
                  <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)", marginBottom:5 }}>{o.f}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{o.r}</div>
                </div>
              ))}
            </div>
          </CardInner>
        </Card>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     PAGE: ABOUT
  ════════════════════════════════════════════ */
  function PageAbout() {
    return (
      <div className="page">
        <PageHeader label="Platform Information" title="About EcoIntelligence AI" />
        <div style={{ maxWidth:780, display:"flex", flexDirection:"column", gap:16 }}>
          {[
            { t:"Our Mission", c:"EcoIntelligence AI – Uganda Edition is an environmental sustainability intelligence platform providing AI-powered, data-driven insights about Uganda's ecological challenges and solutions. We combine Claude AI, real-time weather data, and a curated environmental knowledge base to empower communities, researchers, and policymakers." },
            { t:"Data Sources", list:["NASA Earth Data — satellite imagery and climate measurements","UNEP Environmental Data — global and African environmental indicators","World Bank Climate Data — development and emissions statistics","Our World in Data — CO₂ and emissions time-series","Open-Meteo API — real-time weather and 7-day forecasts (free, no key)","Uganda NEMA — national environmental management data","Uganda Forest Authority (NFA) — deforestation and reforestation statistics","Lake Victoria Environment Management Project (LVEMP)"] },
            { t:"Technology Stack", list:["AI Engine: Claude claude-sonnet-4-20250514 (Anthropic)","RAG: Uganda Environmental Knowledge Base — curated, verified data","News: Claude AI with web_search tool for real-time article retrieval","Weather: Open-Meteo free API (real-time, no key required)","Frontend: React with Sora + DM Mono typography, custom SVG charts"] },
            { t:"Disclaimers", c:"Statistics are sourced from official databases. The AI assistant uses a curated knowledge base and web search. Always consult primary sources for critical decisions. Weather data is live from Open-Meteo. AI environmental analysis should complement, not replace, professional consultation." }
          ].map(sec => (
            <Card key={sec.t}>
              <CardInner>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>{sec.t}</div>
                {sec.c && <p style={{ color:"#94a3b8", lineHeight:1.75, fontSize:14 }}>{sec.c}</p>}
                {sec.list && <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                  {sec.list.map((item, i) => (
                    <li key={i} style={{ display:"flex", gap:10, fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>
                      <span style={{ color:"#34d399", flexShrink:0, marginTop:2 }}>▸</span>{item}
                    </li>
                  ))}
                </ul>}
              </CardInner>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

        {/* Background glows */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", width:600, height:600, background:"#34d399", borderRadius:"50%", filter:"blur(140px)", opacity:.05, top:-200, left:-200, animation:"fadeIn 2s ease" }} />
          <div style={{ position:"absolute", width:400, height:400, background:"#60a5fa", borderRadius:"50%", filter:"blur(120px)", opacity:.04, bottom:"15%", right:-100 }} />
        </div>

        {/* Nav */}
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(8,13,20,.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setPage("home")}>
            <div style={{ width:34, height:34, background:"linear-gradient(135deg,#34d399,#059669)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🌿</div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, letterSpacing:"-0.02em" }}>EcoIntelligence AI</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:9, color:"#34d399", letterSpacing:"0.1em" }}>UGANDA EDITION</div>
            </div>
          </div>
          <div className="nav-links" style={{ display:"flex", gap:2 }}>
            {NAV.map(n => (
              <button key={n.id} className={`nav-link ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>{n.label}</button>
            ))}
          </div>
          <button className="mob-btn" style={{ display:"none", background:"none", border:"none", color:"var(--text)", fontSize:22, cursor:"pointer" }} onClick={() => setMobile(!mobileOpen)}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ position:"fixed", inset:"60px 0 0 0", background:"rgba(8,13,20,.97)", backdropFilter:"blur(20px)", zIndex:99, padding:12, display:"flex", flexDirection:"column", gap:4, animation:"fadeIn .2s ease" }}>
            {NAV.map(n => (
              <button key={n.id} className={`mob-link ${page === n.id ? "active" : ""}`} onClick={() => { setPage(n.id); setMobile(false); }}>{n.label}</button>
            ))}
          </div>
        )}

        {/* Main */}
        <main style={{ paddingTop:60, position:"relative", zIndex:1 }}>
          {page === "home"      && <PageHome />}
          {page === "assistant" && <PageAssistant />}
          {page === "dashboard" && <PageDashboard />}
          {page === "weather"   && <PageWeather />}
          {page === "news"      && <PageNews />}
          {page === "solutions" && <PageSolutions />}
          {page === "about"     && <PageAbout />}
        </main>

        {/* Footer */}
        <div style={{ position:"relative", zIndex:1, borderTop:"1px solid var(--border)", padding:"18px 24px", textAlign:"center" }}>
          <div style={{ fontSize:11, color:"#4b5563", fontFamily:"var(--mono)", letterSpacing:"0.05em" }}>
            EcoIntelligence AI – Uganda Edition · Powered by Claude AI + Open-Meteo · Data: NEMA · World Bank · UNEP · NFA
          </div>
        </div>
      </div>
    </>
  );
}
