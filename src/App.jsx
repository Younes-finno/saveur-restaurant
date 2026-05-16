import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase.js";

/* ─── Supabase ─── */
export const useOrders = () => {
  const [orders, setOrders] = useState({});

  useEffect(() => {
    // جلب الطلبات عند التحميل
    supabase.from("orders").select("*").then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(o => { map[o.id] = { ...o, tableNum: o.table_num, placedAt: o.placed_at }; });
        setOrders(map);
      }
    });

    // الاستماع للتغييرات لحظياً
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        supabase.from("orders").select("*").then(({ data }) => {
          if (data) {
            const map = {};
            data.forEach(o => { map[o.id] = { ...o, tableNum: o.table_num, placedAt: o.placed_at }; });
            setOrders(map);
          }
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return orders;
};

export const placeOrder = (tableNum, items, note = "") =>
  supabase.from("orders").insert({
    table_num: tableNum,
    items,
    note: note || "",
    status: "new",
    placed_at: Date.now(),
  });

export const setStatus = (id, status) =>
  supabase.from("orders").update({ status }).eq("id", id);


/* ─── Menu ─── */
export const MENU = [
  { id:1,  cat:"مقبلات",  name:"حمّص فاخر",          desc:"حمص كريمي مع زيت الزيتون البكر",      price:28,  time:"8 دقائق",  tag:"الأكثر طلباً" },
  { id:2,  cat:"مقبلات",  name:"تبولة طازجة",         desc:"بقدونس وطماطم وبرغل وعصير ليمون",     price:32,  time:"5 دقائق",  tag:"" },
  { id:3,  cat:"مقبلات",  name:"فتوش الشام",          desc:"خضار موسمية مع خبز مقرمش وسماق",      price:30,  time:"5 دقائق",  tag:"" },
  { id:4,  cat:"رئيسية",  name:"كباب مشوي فاخر",      desc:"لحم بقري ممتاز مع الأعشاب الطازجة",   price:95,  time:"20 دقيقة", tag:"شيف ينصح" },
  { id:5,  cat:"رئيسية",  name:"دجاج مشوي",           desc:"دجاج طازج متبّل بالليمون والأعشاب",   price:75,  time:"18 دقيقة", tag:"" },
  { id:6,  cat:"رئيسية",  name:"فيليه سمك النيل",     desc:"سمك طازج مع صلصة الزبدة والأعشاب",   price:110, time:"22 دقيقة", tag:"طازج اليوم" },
  { id:7,  cat:"رئيسية",  name:"كفتة مشكّلة",         desc:"كفتة لحم مع التوابل الشرقية",         price:85,  time:"18 دقيقة", tag:"" },
  { id:8,  cat:"مشروبات", name:"عصير ليمون بالنعناع", desc:"ليمون طازج مع نعناع وسكر البلّور",    price:18,  time:"3 دقائق",  tag:"" },
  { id:9,  cat:"مشروبات", name:"شاي مغربي",           desc:"شاي أخضر مع نعناع طازج وسكر ناعم",   price:15,  time:"5 دقائق",  tag:"" },
  { id:10, cat:"مشروبات", name:"قهوة عربية",          desc:"قهوة مُعطّرة بالهيل والزعفران",        price:20,  time:"5 دقائق",  tag:"مميز" },
  { id:11, cat:"حلويات",  name:"كنافة نابلسية",       desc:"كنافة بالجبنة الطازجة وقطر العسل",    price:38,  time:"10 دقائق", tag:"الأكثر طلباً" },
  { id:12, cat:"حلويات",  name:"أم علي الفاخرة",      desc:"عجينة بالكريمة المخفوقة والمكسرات",   price:35,  time:"8 دقائق",  tag:"" },
];
export const CATS = ["الكل", ...new Set(MENU.map(i => i.cat))];
export const CAT_ICONS = { "الكل":"✦","مقبلات":"🥗","رئيسية":"🍽","مشروبات":"☕","حلويات":"🍮" };

/* ─── Theme ─── */
export const G = {
  gold:"#C9A96E", goldLight:"#E8D5A3", goldDark:"#9A7A45",
  bg:"#0D0D0B", surface:"#161612", surfaceHigh:"#1E1E19",
  border:"rgba(201,169,110,0.15)", borderHover:"rgba(201,169,110,0.35)",
  text:"#F0EBE0", textMuted:"#8A8070", textSub:"#5A5448",
  red:"#C0392B", green:"#27AE60", amber:"#E67E22",
  greenLight:"rgba(39,174,96,0.15)", redLight:"rgba(192,57,43,0.15)", amberLight:"rgba(230,126,34,0.15)",
};

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Tajawal:wght@300;400;500;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  html,body,#root { height:100%; }
  body { background:${G.bg}; color:${G.text}; direction:rtl; font-family:'Tajawal',sans-serif; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:${G.gold}40; border-radius:2px; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 ${G.gold}50} 50%{box-shadow:0 0 0 8px ${G.gold}00} }
  @keyframes ping    { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2);opacity:0} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  .fade-up  { animation:fadeUp  0.4s ease forwards; }
  .slide-in { animation:slideIn 0.3s ease forwards; }
  .btn-gold { background:linear-gradient(135deg,${G.gold},${G.goldDark}); color:#0D0D0B; border:none; cursor:pointer; font-family:'Tajawal',sans-serif; font-weight:700; transition:all 0.2s; border-radius:10px; }
  .btn-gold:hover  { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px ${G.gold}40; }
  .btn-gold:active { transform:scale(0.98); }
  .btn-outline { background:transparent; border:1px solid ${G.border}; color:${G.text}; cursor:pointer; font-family:'Tajawal',sans-serif; transition:all 0.2s; border-radius:10px; }
  .btn-outline:hover { border-color:${G.gold}; color:${G.gold}; }
  .menu-item { transition:all 0.25s; }
  .menu-item:hover { border-color:${G.borderHover}!important; transform:translateY(-2px); }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
  .qty-btn { transition:all 0.15s; }
  .qty-btn:hover { background:${G.gold}20!important; }
  .chef-card { animation:slideIn 0.4s ease; }
`;

/* ─── Shared UI ─── */
export const Divider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"8px 0" }}>
    <div style={{ flex:1, height:"0.5px", background:`linear-gradient(to left,${G.gold}00,${G.gold}40)` }} />
    <div style={{ width:4, height:4, background:G.gold, borderRadius:"50%", opacity:0.6 }} />
    <div style={{ flex:1, height:"0.5px", background:`linear-gradient(to right,${G.gold}00,${G.gold}40)` }} />
  </div>
);

export const Logo = ({ sub }) => (
  <div style={{ textAlign:"center", padding:"20px 0 16px" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:2 }}>
      <div style={{ width:28, height:1, background:`linear-gradient(to right,transparent,${G.gold})` }} />
      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:G.gold, letterSpacing:2 }}>SAVEUR</span>
      <div style={{ width:28, height:1, background:`linear-gradient(to left,transparent,${G.gold})` }} />
    </div>
    <p style={{ fontSize:11, color:G.textMuted, letterSpacing:3, textTransform:"uppercase" }}>{sub}</p>
  </div>
);

/* ─── Page wrapper ─── */
const Page = ({ children }) => (
  <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:430, margin:"0 auto", background:G.bg, position:"relative", overflow:"hidden" }}>
    {children}
  </div>
);

/* ══════════════════════════════════════════
   CUSTOMER PAGE  →  /
══════════════════════════════════════════ */
function CustomerPage() {
  const [tableNum, setTableNum] = useState(null);
  const [tableInput, setTableInput] = useState("");
  const [cart, setCart]         = useState({});
  const [activeCat, setActiveCat] = useState("الكل");
  const [step, setStep]         = useState("menu");
  const [note, setNote]         = useState("");

  const filtered   = activeCat==="الكل" ? MENU : MENU.filter(i=>i.cat===activeCat);
  const cartItems  = Object.entries(cart).map(([id,qty])=>({...MENU.find(m=>m.id===+id),qty})).filter(Boolean);
  const totalItems = cartItems.reduce((a,i)=>a+i.qty,0);
  const totalPrice = cartItems.reduce((a,i)=>a+i.price*i.qty,0);
  const add    = id => setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const remove = id => setCart(c=>{const n={...c};n[id]>1?n[id]--:delete n[id];return n;});
  const confirm = async () => { await placeOrder(tableNum,cartItems,note); setStep("done"); };

  if (!tableNum) return (
    <Page>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"2rem",gap:24 }} className="fade-up">
        <div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:6 }}>
            <div style={{ width:40,height:0.5,background:`linear-gradient(to right,transparent,${G.gold})` }} />
            <span style={{ fontFamily:"'Playfair Display',serif",fontSize:32,color:G.gold,letterSpacing:3 }}>SAVEUR</span>
            <div style={{ width:40,height:0.5,background:`linear-gradient(to left,transparent,${G.gold})` }} />
          </div>
          <p style={{ textAlign:"center",fontSize:12,color:G.textMuted,letterSpacing:4,textTransform:"uppercase" }}>Fine Dining</p>
        </div>
        <Divider />
        <div style={{ width:"100%",maxWidth:280,textAlign:"center" }}>
          <p style={{ color:G.textMuted,fontSize:14,marginBottom:20 }}>أدخل رقم طاولتك لاستعراض القائمة</p>
          <input type="number" value={tableInput} onChange={e=>setTableInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&tableInput&&setTableNum(+tableInput)} placeholder="رقم الطاولة"
            style={{ width:"100%",background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"14px",color:G.text,fontSize:20,textAlign:"center",fontFamily:"'Tajawal',sans-serif",outline:"none",marginBottom:14,direction:"rtl" }} />
          <button className="btn-gold" onClick={()=>tableInput&&setTableNum(+tableInput)} style={{ width:"100%",padding:"14px",fontSize:16 }}>استعراض المنيو</button>
        </div>
      </div>
    </Page>
  );

  if (step==="done") return (
    <Page>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"2rem",gap:20,textAlign:"center" }} className="fade-up">
        <div style={{ width:80,height:80,borderRadius:"50%",background:`${G.green}20`,border:`2px solid ${G.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,position:"relative" }}>
          ✓<div style={{ position:"absolute",inset:-4,borderRadius:"50%",border:`2px solid ${G.green}`,animation:"ping 1s ease infinite" }} />
        </div>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,color:G.gold,marginBottom:8 }}>تم استلام طلبك</h2>
          <p style={{ color:G.textMuted,fontSize:14,lineHeight:1.7 }}>طاولة رقم {tableNum} · سيصلك طلبك قريباً</p>
        </div>
        <Divider />
        <div style={{ background:G.surface,borderRadius:12,border:`1px solid ${G.border}`,padding:"16px 20px",width:"100%" }}>
          {cartItems.map(item=>(
            <div key={item.id} style={{ display:"flex",justifyContent:"space-between",fontSize:14,padding:"5px 0",color:G.textMuted }}>
              <span>{item.name} <span style={{ color:G.textSub }}>×{item.qty}</span></span>
              <span style={{ color:G.text }}>{item.price*item.qty} ر.س</span>
            </div>
          ))}
          <Divider />
          <div style={{ display:"flex",justifyContent:"space-between",fontWeight:700,color:G.gold }}>
            <span>الإجمالي</span><span>{totalPrice} ر.س</span>
          </div>
        </div>
        <button className="btn-outline" onClick={()=>{setCart({});setStep("menu");}} style={{ padding:"10px 28px",fontSize:14 }}>إضافة طلب آخر</button>
      </div>
    </Page>
  );

  if (step==="cart") return (
    <Page>
      <div style={{ display:"flex",flexDirection:"column",height:"100%" }} className="fade-up">
        <div style={{ padding:"16px 20px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:12 }}>
          <button className="btn-outline" onClick={()=>setStep("menu")} style={{ padding:"6px 14px",fontSize:13 }}>← رجوع</button>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:18,color:G.gold }}>مراجعة الطلب</h3>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:10 }}>
          {cartItems.map(item=>(
            <div key={item.id} className="menu-item" style={{ background:G.surface,borderRadius:12,border:`1px solid ${G.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontWeight:500,fontSize:15,color:G.text }}>{item.name}</p>
                <p style={{ color:G.gold,fontSize:14,marginTop:2 }}>{item.price*item.qty} ر.س</p>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <button className="qty-btn" onClick={()=>remove(item.id)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${G.border}`,background:"transparent",color:G.text,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
                <span style={{ minWidth:20,textAlign:"center",fontWeight:700,color:G.gold }}>{item.qty}</span>
                <button className="qty-btn" onClick={()=>add(item.id)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${G.border}`,background:"transparent",color:G.text,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop:8 }}>
            <p style={{ fontSize:13,color:G.textMuted,marginBottom:8 }}>ملاحظة للشيف (اختياري)</p>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="مثال: بدون بصل، حار جداً..." rows={2}
              style={{ width:"100%",background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"10px 14px",color:G.text,fontSize:14,fontFamily:"'Tajawal',sans-serif",resize:"none",outline:"none" }} />
          </div>
        </div>
        <div style={{ padding:"16px 20px",borderTop:`1px solid ${G.border}` }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}>
            <span style={{ color:G.textMuted,fontSize:14 }}>{totalItems} عنصر</span>
            <span style={{ color:G.gold,fontWeight:700,fontSize:18 }}>{totalPrice} ر.س</span>
          </div>
          <button className="btn-gold" onClick={confirm} style={{ width:"100%",padding:"15px",fontSize:16 }}>تأكيد الطلب</button>
        </div>
      </div>
    </Page>
  );

  return (
    <Page>
      <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
        <Logo sub="قائمة الطعام" />
        <div style={{ padding:"0 16px 12px",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none" }}>
          {CATS.map(cat=>(
            <button key={cat} onClick={()=>setActiveCat(cat)} style={{ flexShrink:0,padding:"6px 14px",borderRadius:20,border:`1px solid ${activeCat===cat?G.gold:G.border}`,background:activeCat===cat?`${G.gold}15`:"transparent",color:activeCat===cat?G.gold:G.textMuted,fontSize:13,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",whiteSpace:"nowrap",transition:"all 0.2s" }}>
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"0 16px 100px",display:"flex",flexDirection:"column",gap:10 }}>
          {filtered.map((item,i)=>(
            <div key={item.id} className="menu-item fade-up" style={{ background:G.surface,borderRadius:14,border:`1px solid ${cart[item.id]?G.gold+"60":G.border}`,padding:"16px",animationDelay:`${i*0.05}s`,cursor:"pointer" }} onClick={()=>add(item.id)}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                <div style={{ flex:1,marginLeft:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <span style={{ fontWeight:600,fontSize:15,color:G.text }}>{item.name}</span>
                    {item.tag&&<span style={{ fontSize:10,background:`${G.gold}20`,color:G.gold,padding:"2px 8px",borderRadius:10,border:`1px solid ${G.gold}40` }}>{item.tag}</span>}
                  </div>
                  <p style={{ color:G.textMuted,fontSize:13,marginBottom:8,lineHeight:1.5 }}>{item.desc}</p>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ color:G.gold,fontWeight:700,fontSize:16 }}>{item.price} <span style={{ fontSize:12,fontWeight:400 }}>ر.س</span></span>
                    <span style={{ color:G.textSub,fontSize:12 }}>⏱ {item.time}</span>
                  </div>
                </div>
                <div>
                  {cart[item.id] ? (
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <button className="qty-btn" onClick={e=>{e.stopPropagation();remove(item.id);}} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${G.border}`,background:"transparent",color:G.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
                      <span style={{ fontWeight:700,color:G.gold,minWidth:16,textAlign:"center" }}>{cart[item.id]}</span>
                      <button className="qty-btn" onClick={e=>{e.stopPropagation();add(item.id);}} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${G.gold}`,background:`${G.gold}20`,color:G.gold,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
                    </div>
                  ) : (
                    <div style={{ width:32,height:32,borderRadius:8,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:G.textMuted,fontSize:20 }}>+</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalItems>0&&(
          <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,padding:"0 0 12px" }}>
            <button className="btn-gold fade-up" onClick={()=>setStep("cart")} style={{ width:"100%",padding:"15px 20px",fontSize:15,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:`0 8px 32px ${G.gold}40` }}>
              <span style={{ background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"2px 10px",fontSize:13 }}>{totalItems} عنصر</span>
              <span>مراجعة الطلب</span>
              <span>{totalPrice} ر.س</span>
            </button>
          </div>
        )}
      </div>
    </Page>
  );
}

/* ══════════════════════════════════════════
   KITCHEN PAGE  →  /kitchen
══════════════════════════════════════════ */
function KitchenPage() {
  const orders = useOrders();
  const list = Object.entries(orders).map(([id,o])=>({...o,id})).sort((a,b)=>b.placedAt-a.placedAt);
  const newCount  = list.filter(o=>o.status==="new").length;
  const prepCount = list.filter(o=>o.status==="preparing").length;
  const meta = {
    new:       { label:"جديد",    color:G.red,   bg:G.redLight,   action:"ابدأ التحضير",   next:"preparing" },
    preparing: { label:"يُحضَّر", color:G.amber, bg:G.amberLight, action:"تم التحضير ✓", next:"ready" },
    ready:     { label:"جاهز",    color:G.green, bg:G.greenLight, action:null },
    paid:      { label:"مدفوع",   color:G.textSub, bg:"transparent", action:null },
  };
  return (
    <Page>
      <style>{globalCss}</style>
      <Logo sub="لوحة المطبخ" />
      <div style={{ padding:"0 16px 16px",display:"flex",gap:10 }}>
        {[{label:"جديد",value:newCount,color:G.red,bg:G.redLight},{label:"يتحضر",value:prepCount,color:G.amber,bg:G.amberLight},{label:"إجمالي",value:list.length,color:G.gold,bg:`${G.gold}15`}].map(s=>(
          <div key={s.label} style={{ flex:1,background:s.bg,border:`1px solid ${s.color}30`,borderRadius:12,padding:"10px 12px",textAlign:"center" }}>
            <div style={{ fontSize:22,fontWeight:700,color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11,color:G.textMuted,marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12 }}>
        {list.length===0&&<div style={{ textAlign:"center",padding:"3rem",color:G.textMuted }}><div style={{ fontSize:48,marginBottom:12,opacity:0.4 }}>🍳</div><p>لا توجد طلبات</p></div>}
        {list.map(order=>{
          const m=meta[order.status]||meta.new;
          const mins=Math.floor((Date.now()-order.placedAt)/60000);
          return (
            <div key={order.id} className="chef-card" style={{ background:G.surface,borderRadius:14,border:`1px solid ${m.color}30`,overflow:"hidden" }}>
              <div style={{ padding:"10px 16px",background:m.bg,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:G.gold }}>طاولة {order.tableNum}</span>
                  {order.status==="new"&&<span style={{ width:8,height:8,borderRadius:"50%",background:G.red,animation:"pulse 1.5s infinite",display:"inline-block" }} />}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ color:G.textMuted,fontSize:12 }}>منذ {mins} د</span>
                  <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:m.bg,color:m.color,border:`1px solid ${m.color}40` }}>{m.label}</span>
                </div>
              </div>
              <div style={{ padding:"12px 16px" }}>
                {order.items.map((item,i)=>(
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<order.items.length-1?`1px solid ${G.border}`:"none" }}>
                    <span style={{ fontSize:14,color:G.text }}>{item.name}</span>
                    <span style={{ fontSize:13,color:G.gold,fontWeight:600 }}>×{item.qty}</span>
                  </div>
                ))}
                {order.note&&<p style={{ marginTop:10,fontSize:13,color:G.amber,background:`${G.amber}10`,padding:"6px 10px",borderRadius:8 }}>📝 {order.note}</p>}
              </div>
              {m.action&&(
                <div style={{ padding:"0 16px 14px" }}>
                  <button className="btn-gold" onClick={()=>setStatus(order.id,m.next)} style={{ width:"100%",padding:"10px",fontSize:14 }}>{m.action}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}

/* ══════════════════════════════════════════
   CASHIER PAGE  →  /cashier
══════════════════════════════════════════ */
function CashierPage() {
  const orders = useOrders();
  const [tableInput,setTableInput]=useState("");
  const [checked,setChecked]=useState(null);
  const tableOrders = checked ? Object.entries(orders).map(([id,o])=>({...o,id})).filter(o=>String(o.tableNum)===String(checked)&&o.status!=="paid") : [];
  const total  = tableOrders.reduce((sum,o)=>sum+o.items.reduce((s,i)=>s+i.price*i.qty,0),0);
  const merged = tableOrders.flatMap(o=>o.items).reduce((acc,item)=>{const ex=acc.find(a=>a.id===item.id);if(ex)ex.qty+=item.qty;else acc.push({...item});return acc;},[]);
  const confirmPay = async () => { await Promise.all(tableOrders.map(o=>setStatus(o.id,"paid"))); setChecked(null);setTableInput(""); };
  return (
    <Page>
      <style>{globalCss}</style>
      <Logo sub="نقطة البيع" />
      <div style={{ padding:"0 20px 20px" }}>
        <p style={{ fontSize:13,color:G.textMuted,marginBottom:10 }}>أدخل رقم الطاولة لاستعراض الحساب</p>
        <div style={{ display:"flex",gap:10 }}>
          <input type="number" value={tableInput} onChange={e=>setTableInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tableInput&&setChecked(tableInput.trim())} placeholder="رقم الطاولة..."
            style={{ flex:1,background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"12px 16px",color:G.text,fontSize:16,fontFamily:"'Tajawal',sans-serif",outline:"none",direction:"rtl" }} />
          <button className="btn-gold" onClick={()=>tableInput&&setChecked(tableInput.trim())} style={{ padding:"12px 24px",fontSize:14 }}>بحث</button>
        </div>
      </div>
      {checked&&(
        <div style={{ flex:1,overflowY:"auto",padding:"0 20px 20px" }} className="fade-up">
          {tableOrders.length===0 ? <div style={{ textAlign:"center",padding:"2rem",color:G.textMuted }}><div style={{ fontSize:36,marginBottom:10,opacity:0.4 }}>🔍</div><p>لا توجد طلبات غير مدفوعة لطاولة {checked}</p></div> : (
            <>
              <div style={{ background:G.surface,borderRadius:14,border:`1px solid ${G.border}`,overflow:"hidden",marginBottom:16 }}>
                <div style={{ padding:"14px 18px",borderBottom:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"'Playfair Display',serif",fontSize:17,color:G.gold }}>طاولة {checked}</span>
                  <span style={{ fontSize:13,color:G.textMuted }}>{tableOrders.length} طلب</span>
                </div>
                <div style={{ padding:"12px 18px" }}>
                  {merged.map((item,i)=>(
                    <div key={item.id} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<merged.length-1?`1px solid ${G.border}`:"none",fontSize:14 }}>
                      <span style={{ color:G.text }}>{item.name} <span style={{ color:G.textSub }}>×{item.qty}</span></span>
                      <span style={{ color:G.gold,fontWeight:500 }}>{item.price*item.qty} ر.س</span>
                    </div>
                  ))}
                </div>
                <Divider />
                <div style={{ padding:"12px 18px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ color:G.textMuted,fontSize:14 }}>الإجمالي</span>
                  <span style={{ fontFamily:"'Playfair Display',serif",fontSize:26,color:G.gold }}>{total} <span style={{ fontSize:14 }}>ر.س</span></span>
                </div>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-outline" onClick={()=>{setChecked(null);setTableInput("");}} style={{ flex:1,padding:"12px",fontSize:14 }}>إلغاء</button>
                <button className="btn-gold" onClick={confirmPay} style={{ flex:2,padding:"12px",fontSize:15 }}>تأكيد الدفع ✓</button>
              </div>
            </>
          )}
        </div>
      )}
    </Page>
  );
}

/* ══════════════════════════════════════════
   MANAGER PAGE  →  /manager
══════════════════════════════════════════ */
function ManagerPage() {
  const [unlocked,setUnlocked]=useState(false);
  const [pin,setPin]=useState("");
  const [pinError,setPinError]=useState(false);
  const orders=useOrders();
  const handleKey=k=>{
    if(k==="del"){setPin(p=>p.slice(0,-1));return;}
    if(pin.length>=4)return;
    const np=pin+k; setPin(np);
    if(np.length===4) setTimeout(()=>{if(np==="1234"){setUnlocked(true);setPin("");}else{setPinError(true);setPin("");setTimeout(()=>setPinError(false),1200);}},120);
  };
  if(!unlocked) return (
    <Page>
      <style>{globalCss}</style>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:22,padding:"2rem" }} className="fade-up">
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:38,marginBottom:8 }}>🔐</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",color:G.gold,fontSize:20,marginBottom:4 }}>لوحة المدير</h2>
          <p style={{ color:G.textMuted,fontSize:13 }}>أدخل رمز الدخول</p>
        </div>
        <div style={{ display:"flex",gap:12 }}>
          {[0,1,2,3].map(i=><div key={i} style={{ width:13,height:13,borderRadius:"50%",background:i<pin.length?G.gold:"transparent",border:`2px solid ${pinError?G.red:i<pin.length?G.gold:G.border}`,transition:"all 0.2s" }} />)}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:216 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"del"].map((k,i)=>(
            <button key={i} onClick={()=>k!==""&&handleKey(String(k))} style={{ height:52,borderRadius:12,border:`1px solid ${k===""?"transparent":G.border}`,background:k===""?"transparent":pinError?`${G.red}15`:G.surface,color:pinError?G.red:G.text,fontSize:k==="del"?16:18,cursor:k===""?"default":"pointer",fontFamily:"'Tajawal',sans-serif",transition:"all 0.15s" }}>
              {k==="del"?"⌫":k}
            </button>
          ))}
        </div>
        <p style={{ fontSize:12,color:G.textSub }}>الرمز: 1234</p>
      </div>
    </Page>
  );

  const allOrders=Object.entries(orders).map(([id,o])=>({...o,id}));
  const paidOrders=allOrders.filter(o=>o.status==="paid");
  const totalRevenue=paidOrders.reduce((s,o)=>s+o.items.reduce((a,i)=>a+i.price*i.qty,0),0);
  const pendingRevenue=allOrders.filter(o=>o.status!=="paid").reduce((s,o)=>s+o.items.reduce((a,i)=>a+i.price*i.qty,0),0);
  const avgOrder=paidOrders.length?Math.round(totalRevenue/paidOrders.length):0;
  const itemStats={};
  allOrders.forEach(o=>o.items.forEach(item=>{if(!itemStats[item.name])itemStats[item.name]={name:item.name,qty:0,revenue:0};itemStats[item.name].qty+=item.qty;itemStats[item.name].revenue+=item.price*item.qty;}));
  const topItems=Object.values(itemStats).sort((a,b)=>b.qty-a.qty);
  const maxQty=topItems.length?topItems[0].qty:1;
  const hourly={};for(let h=8;h<=22;h++)hourly[h]=0;
  allOrders.forEach(o=>{const h=new Date(o.placedAt).getHours();if(hourly[h]!==undefined)hourly[h]++;});
  const hourlyData=Object.entries(hourly).map(([h,c])=>({h:+h,count:c}));
  const maxHour=Math.max(...hourlyData.map(d=>d.count),1);

  return (
    <Page>
      <style>{globalCss}</style>
      <div style={{ padding:"14px 20px 12px",borderBottom:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:18,color:G.gold }}>لوحة المدير</h2>
          <p style={{ fontSize:11,color:G.textMuted,marginTop:2 }}>{new Date().toLocaleDateString("ar-SA",{weekday:"long",month:"long",day:"numeric"})}</p>
        </div>
        <button className="btn-outline" onClick={()=>setUnlocked(false)} style={{ padding:"6px 14px",fontSize:12 }}>خروج</button>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"14px 14px 24px",display:"flex",flexDirection:"column",gap:14 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[{label:"إجمالي المحصّل",value:totalRevenue,unit:"ر.س",icon:"💵",color:G.green,bg:`rgba(39,174,96,0.1)`},{label:"قيد التحصيل",value:pendingRevenue,unit:"ر.س",icon:"⏳",color:G.amber,bg:`rgba(230,126,34,0.1)`},{label:"إجمالي الطلبات",value:allOrders.length,unit:"طلب",icon:"🧾",color:G.gold,bg:`${G.gold}12`},{label:"متوسط الطلب",value:avgOrder,unit:"ر.س",icon:"📈",color:"#A78BFA",bg:"rgba(167,139,250,0.1)"}].map(c=>(
            <div key={c.label} style={{ background:c.bg,border:`1px solid ${c.color}25`,borderRadius:14,padding:"14px 14px 12px" }}>
              <div style={{ fontSize:20,marginBottom:6 }}>{c.icon}</div>
              <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:2 }}>
                <span style={{ fontSize:22,fontWeight:700,color:c.color,fontFamily:"'Playfair Display',serif" }}>{c.value}</span>
                <span style={{ fontSize:12,color:c.color,opacity:0.7 }}>{c.unit}</span>
              </div>
              <div style={{ fontSize:11,color:G.textMuted }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:G.surface,borderRadius:14,border:`1px solid ${G.border}`,padding:"14px 16px" }}>
          <p style={{ fontSize:13,fontWeight:600,color:G.text,marginBottom:12 }}>نشاط الطلبات حسب الساعة</p>
          <div style={{ display:"flex",alignItems:"flex-end",gap:3,height:72 }}>
            {hourlyData.map(d=>(
              <div key={d.h} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                <div title={`${d.h}:00`} style={{ width:"100%",borderRadius:"3px 3px 0 0",background:d.count>0?G.gold:G.surfaceHigh,height:`${Math.max((d.count/maxHour)*60,d.count>0?5:2)}px`,opacity:d.count>0?1:0.3,transition:"height 0.5s ease" }} />
                {(d.h===8||d.h===12||d.h===16||d.h===20)&&<span style={{ fontSize:9,color:G.textSub }}>{d.h}</span>}
              </div>
            ))}
          </div>
          {allOrders.length===0&&<p style={{ textAlign:"center",color:G.textSub,fontSize:12,marginTop:6 }}>لا توجد بيانات بعد</p>}
        </div>
        <div style={{ background:G.surface,borderRadius:14,border:`1px solid ${G.border}`,padding:"14px 16px" }}>
          <p style={{ fontSize:13,fontWeight:600,color:G.text,marginBottom:12 }}>مبيعات الأصناف</p>
          {topItems.length===0?<p style={{ textAlign:"center",color:G.textSub,fontSize:13,padding:"12px 0" }}>لا توجد مبيعات بعد</p>:topItems.map((item,i)=>(
            <div key={item.name} style={{ marginBottom:11 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                  <span style={{ fontSize:13,minWidth:18,textAlign:"center" }}>{["🥇","🥈","🥉"][i]||`${i+1}`}</span>
                  <span style={{ fontSize:13,color:G.text }}>{item.name}</span>
                </div>
                <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                  <span style={{ fontSize:11,color:G.textMuted,background:G.surfaceHigh,padding:"2px 8px",borderRadius:8 }}>{item.qty} وجبة</span>
                  <span style={{ fontSize:13,color:G.gold,fontWeight:600,minWidth:56,textAlign:"left" }}>{item.revenue} ر.س</span>
                </div>
              </div>
              <div style={{ height:4,borderRadius:4,background:G.surfaceHigh }}>
                <div style={{ height:"100%",borderRadius:4,background:i===0?G.gold:i===1?"#9B8FE0":i===2?G.green:G.textSub,width:`${(item.qty/maxQty)*100}%`,opacity:i===0?1:0.7,transition:"width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:G.surface,borderRadius:14,border:`1px solid ${G.border}`,padding:"14px 16px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <p style={{ fontSize:13,fontWeight:600,color:G.text }}>آخر المدفوعات</p>
            <span style={{ fontSize:11,color:G.green,background:`rgba(39,174,96,0.1)`,padding:"3px 10px",borderRadius:10 }}>{paidOrders.length} فاتورة</span>
          </div>
          {paidOrders.length===0?<p style={{ textAlign:"center",color:G.textSub,fontSize:13,padding:"12px 0" }}>لا توجد مدفوعات بعد</p>:[...paidOrders].sort((a,b)=>b.placedAt-a.placedAt).slice(0,6).map((o,idx)=>{
            const amt=o.items.reduce((s,i)=>s+i.price*i.qty,0);
            return (
              <div key={o.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:idx<Math.min(paidOrders.length,6)-1?`1px solid ${G.border}`:"none" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:G.green }} />
                  <span style={{ fontSize:13,color:G.text }}>طاولة {o.tableNum}</span>
                  <span style={{ fontSize:11,color:G.textSub }}>{new Date(o.placedAt).toLocaleTimeString("ar",{hour:"2-digit",minute:"2-digit"})}</span>
                </div>
                <span style={{ fontSize:14,color:G.green,fontWeight:600 }}>+{amt} ر.س</span>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

/* ══════════════════════════════════════════
   ROOT APP — Router
══════════════════════════════════════════ */
export default function App() {
  return (
    <>
      <style>{globalCss}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<CustomerPage />} />
          <Route path="/kitchen"  element={<KitchenPage />} />
          <Route path="/cashier"  element={<CashierPage />} />
          <Route path="/manager"  element={<ManagerPage />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
