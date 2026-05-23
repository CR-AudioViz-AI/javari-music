"use client";
// app/page.tsx — Javari Music · CR AudioViz AI · EIN 39-3646201
import { useState } from "react";
const TOOLS = [{"icon": "\ud83c\udfa4", "label": "Lyric Writer", "desc": "Song lyrics in any genre", "href": "/lyrics"}, {"icon": "\ud83d\udccb", "label": "Press Release", "desc": "Music PR and announcements", "href": "/press"}, {"icon": "\ud83d\udcdd", "label": "EPK", "desc": "Electronic press kit content", "href": "/epk"}, {"icon": "\ud83d\udcf1", "label": "Social Content", "desc": "Music promotion content", "href": "/social"}];
export default function Page() {
  const [input,setInput]=useState(""); const [out,setOut]=useState(""); const [loading,setLoading]=useState(false);
  async function go() { if(!input.trim())return; setLoading(true);setOut("");
    try { const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:input}],stream:false,systemOverride:"You are a professional songwriter and music industry expert. Write compelling original lyrics and music business content."})});
      const d=await r.json(); setOut(d?.choices?.[0]?.message?.content||d?.content||"Error.");
    } catch {setOut("Error.");} setLoading(false); }
  return (<div style={{minHeight:"100vh",background:"#040912",color:"#e2e8f0",fontFamily:"system-ui"}}>
    <nav style={{background:"#1E3A5F",padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🎵</span><span style={{fontWeight:800,color:"#FF0800",fontSize:15}}>Javari Music</span></div>
      <a href="https://craudiovizai.com/auth/signup" style={{background:"#FF0800",color:"#fff",borderRadius:7,padding:"5px 14px",fontSize:12,fontWeight:700,textDecoration:"none"}}>Sign Up Free</a>
    </nav>
    <section style={{background:"linear-gradient(135deg,#1E3A5F,#040912)",padding:"56px 24px 48px",textAlign:"center"}}>
      <h1 style={{fontSize:"clamp(24px,4vw,44px)",fontWeight:900,color:"#fff",margin:"0 0 12px",lineHeight:1.05}}>AI Tools for<br/><span style={{color:"#FF0800"}}>Musicians & Producers</span></h1>
      <p style={{color:"rgba(255,255,255,0.7)",fontSize:15,lineHeight:1.65,margin:0}}>Lyrics, press releases, EPKs, social content, and music business documents.</p>
    </section>
    <section style={{maxWidth:720,margin:"0 auto",padding:"28px 20px 0"}}>
      <div style={{background:"#0F1F32",border:"1px solid rgba(0,180,216,0.12)",borderRadius:14,padding:"20px 24px"}}>
        <h2 style={{margin:"0 0 12px",fontSize:15,fontWeight:700,color:"#fff"}}>Write Song Lyrics</h2>
        <div style={{display:"flex",gap:8}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Genre: country, theme: coming home after years away, verse/chorus/verse format..." style={{flex:1,background:"#172D48",border:"1px solid rgba(0,180,216,0.15)",borderRadius:8,padding:"10px 12px",color:"#e2e8f0",fontSize:13,outline:"none",fontFamily:"system-ui"}}/>
        <button onClick={go} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?"#0F1F32":"#1E3A5F",color:loading||!input.trim()?"#374151":"#FF0800",border:"1px solid rgba(0,180,216,0.2)",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"system-ui"}}>{loading?"...":"Go"}</button></div>
        {out&&<div style={{marginTop:14,padding:"12px 14px",background:"rgba(0,180,216,0.05)",border:"1px solid rgba(0,180,216,0.1)",borderRadius:8}}><pre style={{margin:0,fontSize:13,color:"#e2e8f0",lineHeight:1.65,whiteSpace:"pre-wrap",fontFamily:"system-ui",maxHeight:320,overflowY:"auto"}}>{out}</pre></div>}
      </div>
    </section>
    <section style={{maxWidth:960,margin:"0 auto",padding:"36px 20px 72px"}}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
      {TOOLS.map((t:any)=>(<a key={t.href} href={t.href} style={{background:"#0F1F32",border:"1px solid rgba(0,180,216,0.08)",borderRadius:14,padding:"18px 16px",textDecoration:"none",display:"block"}}><span style={{fontSize:26,display:"block",marginBottom:8}}>{t.icon}</span><div style={{fontWeight:700,fontSize:13,color:"#e2e8f0",marginBottom:4}}>{t.label}</div><div style={{fontSize:11,color:"#6B7280",lineHeight:1.4}}>{t.desc}</div></a>))}
    </div></section>
    <footer style={{borderTop:"1px solid rgba(0,180,216,0.08)",padding:"12px 24px",textAlign:"center"}}><p style={{color:"#374151",fontSize:11,margin:0}}>© 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · <a href="https://craudiovizai.com/auth/signup" style={{color:"#FF0800",textDecoration:"none",fontWeight:600}}>Sign Up Free</a></p></footer>
  </div>);
}