import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import { Link } from "react-router-dom";
import { whatwedo } from "../data/whatwedo";
import { ArrowRight } from "lucide-react";
import { faculty } from "../data/team";
import Reveal from "../components/Reveal";
import "../clip-art.css";

/* ══ CountUp ══ */
const CountUp=({target,suffix=""})=>{const[n,setN]=useState(0);useEffect(()=>{let f=0;const t=setInterval(()=>{f++;setN(Math.floor(target*(1-Math.pow(1-f/80,3))));if(f>=80){setN(target);clearInterval(t);}},16);return()=>clearInterval(t);},[target]);return<>{n}{suffix}</>;};

/* ══ 3D Tilt ══ */
const TiltCard=({children,style})=>{const ref=useRef(null);const mx=useMotionValue(0),my=useMotionValue(0);const rX=useSpring(useTransform(my,[-0.5,0.5],[7,-7]),{stiffness:200,damping:24});const rY=useSpring(useTransform(mx,[-0.5,0.5],[-7,7]),{stiffness:200,damping:24});return(<motion.div ref={ref} style={{rotateX:rX,rotateY:rY,transformStyle:"preserve-3d",perspective:1000,...style}} onMouseMove={e=>{const r=ref.current?.getBoundingClientRect();if(!r)return;mx.set((e.clientX-r.left)/r.width-0.5);my.set((e.clientY-r.top)/r.height-0.5);}} onMouseLeave={()=>{mx.set(0);my.set(0);}}>{children}</motion.div>);};

/* ══════════════════════════════════════════
   FULL SPACE BACKGROUND — DQ teal/cyan palette
══════════════════════════════════════════ */
const SpaceBG = () => {
  const stars = Array.from({length:220},(_,i)=>({x:Math.random()*100,y:Math.random()*100,s:Math.random()*2.2+0.4,d:Math.random()*4+1.8,dl:Math.random()*5,op:Math.random()*0.6+0.2}));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {/* Deep ocean-space base */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 25% 35%,#021820 0%,#010c14 40%,#000a10 70%,#000508 100%)"}}/>

      {/* Teal nebula clouds */}
      {[
        {x:"18%",y:"25%",w:380,h:240,c:"rgba(45,212,191,0.07)",d:15,dl:0},
        {x:"78%",y:"18%",w:320,h:200,c:"rgba(6,182,212,0.06)",d:19,dl:3},
        {x:"55%",y:"68%",w:420,h:260,c:"rgba(20,184,166,0.06)",d:17,dl:5},
        {x:"8%",y:"72%",w:280,h:180,c:"rgba(103,232,249,0.05)",d:13,dl:2},
        {x:"88%",y:"60%",w:260,h:160,c:"rgba(45,212,191,0.05)",d:22,dl:6},
        {x:"42%",y:"40%",w:500,h:320,c:"rgba(8,145,178,0.04)",d:25,dl:4},
      ].map((n,i)=>(
        <motion.div key={i}
          style={{position:"absolute",left:n.x,top:n.y,width:n.w,height:n.h,transform:"translate(-50%,-50%)",
            background:`radial-gradient(ellipse,${n.c} 0%,transparent 70%)`,borderRadius:"50%"}}
          animate={{scale:[1,1.14,0.93,1],x:[0,22,-14,0],y:[0,-16,10,0],opacity:[0.7,1,0.75,0.7]}}
          transition={{duration:n.d,delay:n.dl,repeat:Infinity,ease:"easeInOut"}}/>
      ))}

      {/* Stars */}
      {stars.map((s,i)=>(
        <motion.div key={i}
          style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,borderRadius:"50%",
            background:i%5===0?"rgba(103,232,249,0.9)":i%4===0?"rgba(45,212,191,0.8)":"rgba(255,255,255,0.85)",opacity:s.op}}
          animate={{opacity:[s.op*0.2,s.op,s.op*0.2],scale:[1,s.s>1.4?1.6:1.2,1]}}
          transition={{duration:s.d,delay:s.dl,repeat:Infinity,ease:"easeInOut"}}/>
      ))}

      {/* Cyan aurora curtains */}
      <motion.div style={{position:"absolute",top:0,left:"-10%",right:"-10%",height:"45%",
        background:"linear-gradient(180deg,transparent,rgba(45,212,191,0.025) 30%,rgba(6,182,212,0.04) 60%,transparent)",
        transform:"skewY(-3deg)",pointerEvents:"none"}}
        animate={{opacity:[0.5,1,0.5],y:[0,12,0]}} transition={{duration:9,repeat:Infinity,ease:"easeInOut"}}/>
      <motion.div style={{position:"absolute",top:"20%",left:"-10%",right:"-10%",height:"30%",
        background:"linear-gradient(180deg,transparent,rgba(20,184,166,0.03) 50%,transparent)",
        transform:"skewY(2deg)",pointerEvents:"none"}}
        animate={{opacity:[0.3,0.8,0.3],y:[0,-8,0]}} transition={{duration:12,repeat:Infinity,ease:"easeInOut",delay:3}}/>

      {/* Shooting stars — teal */}
      {[0,1,2].map(i=>(
        <motion.div key={i}
          style={{position:"absolute",top:`${12+i*22}%`,left:"-5%",width:"140px",height:"1.5px",
            background:`linear-gradient(90deg,transparent,rgba(${i===0?"45,212,191":i===1?"6,182,212":"103,232,249"},0.9),rgba(255,255,255,0.4),transparent)`,
            borderRadius:"2px"}}
          animate={{x:["0vw","115vw"],opacity:[0,1,1,0]}}
          transition={{duration:1.2,delay:4+i*9,repeat:Infinity,repeatDelay:10+i*6,ease:"easeOut"}}/>
      ))}

      {/* Distant teal planets */}
      {[
        {x:"92%",y:"12%",r:20,top:"rgba(255,255,255,0.3)",base:"rgba(45,212,191,0.55)",d:7},
        {x:"4%",y:"65%",r:14,top:"rgba(255,255,255,0.25)",base:"rgba(6,182,212,0.45)",d:9},
        {x:"88%",y:"78%",r:10,top:"rgba(255,255,255,0.2)",base:"rgba(20,184,166,0.5)",d:6},
      ].map((p,i)=>(
        <motion.div key={i}
          style={{position:"absolute",left:p.x,top:p.y,width:p.r*2,height:p.r*2,borderRadius:"50%",
            background:`radial-gradient(circle at 32% 32%,${p.top},${p.base})`,
            boxShadow:`0 0 ${p.r*1.5}px ${p.base.replace("0.5","0.4")}`,transform:"translate(-50%,-50%)"}}
          animate={{y:[0,-10,0],scale:[1,1.05,1]}}
          transition={{duration:p.d,repeat:Infinity,ease:"easeInOut",delay:i*1.8}}/>
      ))}

      {/* Subtle teal grid lines — very faint */}
      <div style={{position:"absolute",inset:0,
        backgroundImage:"linear-gradient(rgba(45,212,191,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.025) 1px,transparent 1px)",
        backgroundSize:"80px 80px",pointerEvents:"none"}}/>

      {/* Horizon glow */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"200px",
        background:"linear-gradient(to top,rgba(45,212,191,0.06),transparent)",pointerEvents:"none"}}/>
    </div>
  );
};

/* ══ 3D DQ Logo ══ */
const DQLogo3D = () => (
  <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
    {/* Outer orbit rings */}
    {[{w:300,d:28,dl:0,c:"rgba(45,212,191,0.18)",dc:"#2dd4bf"},{w:255,d:20,dl:0,c:"rgba(6,182,212,0.14)",dc:"#06b6d4"},{w:210,d:13,dl:0,c:"rgba(103,232,249,0.12)",dc:"#67e8f9"}].map((o,i)=>(
      <motion.div key={i}
        style={{position:"absolute",width:o.w,height:o.w,borderRadius:"50%",border:`1px solid ${o.c}`,pointerEvents:"none"}}
        animate={{rotate:i%2===0?360:-360}} transition={{duration:o.d,repeat:Infinity,ease:"linear"}}>
        <div style={{position:"absolute",top:"-5px",left:"50%",transform:"translateX(-50%)",width:9,height:9,borderRadius:"50%",
          background:`radial-gradient(circle at 35% 35%,#fff,${o.dc})`,boxShadow:`0 0 8px ${o.dc},0 0 14px ${o.dc}66`}}/>
      </motion.div>
    ))}

    {/* Logo */}
    <motion.div animate={{y:[0,-14,0],rotate:[0,0.8,-0.8,0]}} transition={{duration:5.5,repeat:Infinity,ease:"easeInOut"}}
      style={{filter:"drop-shadow(0 0 28px rgba(45,212,191,0.95)) drop-shadow(0 0 60px rgba(6,182,212,0.5))",position:"relative",zIndex:2}}>
      <svg viewBox="0 0 240 240" width="250" height="250" style={{overflow:"visible"}}>
        <defs>
          <radialGradient id="aura2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(45,212,191,0.3)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9"/>
            <stop offset="45%" stopColor="#0891b2"/>
            <stop offset="100%" stopColor="#164e63"/>
          </linearGradient>
          <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="55%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#0e7490"/>
          </linearGradient>
          <linearGradient id="sg2" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#134e4a"/>
            <stop offset="100%" stopColor="#0a2d2b"/>
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r="118" fill="url(#aura2)"/>
        <ellipse cx="124" cy="125" rx="90" ry="90" fill="url(#sg2)" opacity="0.6"/>
        <circle cx="120" cy="120" r="108" fill="none" stroke="url(#rg2)" strokeWidth="2" opacity="0.55"/>
        <motion.circle cx="120" cy="120" r="100" fill="none" stroke="rgba(45,212,191,0.22)" strokeWidth="1" strokeDasharray="7 13"
          animate={{rotate:360}} transition={{duration:22,repeat:Infinity,ease:"linear"}} style={{transformOrigin:"120px 120px"}}/>
        <circle cx="120" cy="120" r="92" fill="rgba(1,12,20,0.92)" stroke="url(#rg2)" strokeWidth="3.5"/>
        <circle cx="120" cy="120" r="85" fill="none" stroke="rgba(45,212,191,0.14)" strokeWidth="1"/>

        {/* D */}
        <path d="M44 80 L46 77 L46 163 L44 166 Z" fill="#134e4a" opacity="0.95"/>
        <path d="M44 166 L46 163 L82 163 L80 166 Z" fill="#0a2d2b" opacity="0.95"/>
        <path d="M40 77 L64 77 C90 77 110 95 110 120 C110 145 90 163 64 163 L40 163 Z" fill="none" stroke="url(#lg2)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M56 93 L64 93 C78 93 94 104 94 120 C94 136 78 147 64 147 L56 147 Z" fill="rgba(1,12,20,0.92)"/>
        <path d="M47 85 Q62 80 72 88" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Q */}
        <path d="M196 80 L200 84 L200 163 L196 159 Z" fill="#134e4a" opacity="0.95"/>
        <path d="M200 163 L196 159 L160 159 L164 163 Z" fill="#0a2d2b" opacity="0.95"/>
        <path d="M200 77 L176 77 C150 77 130 95 130 120 C130 145 150 163 176 163 L200 163 Z" fill="none" stroke="url(#lg2)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M184 93 L176 93 C162 93 146 104 146 120 C146 136 162 147 176 147 L184 147 Z" fill="rgba(1,12,20,0.92)"/>
        <line x1="179" y1="141" x2="196" y2="161" stroke="url(#lg2)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M193 85 Q178 80 168 88" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Highlight */}
        <path d="M42 96 Q120 40 198 96" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="10" strokeLinecap="round"/>

        {/* Accent dots */}
        {[[120,28],[212,120],[120,212],[28,120]].map(([cx,cy],i)=>(
          <motion.circle key={i} cx={cx} cy={cy} r="4.5" fill="#2dd4bf"
            animate={{opacity:[0.4,1,0.4],r:[3.5,6,3.5]}}
            transition={{duration:2,delay:i*0.5,repeat:Infinity}}/>
        ))}

        {/* Orbiting sparks */}
        <motion.g animate={{rotate:360}} transition={{duration:6,repeat:Infinity,ease:"linear"}} style={{transformOrigin:"120px 120px"}}>
          <circle cx="120" cy="24" r="5" fill="#fbbf24" style={{filter:"drop-shadow(0 0 7px #fbbf24)"}}/>
        </motion.g>
        <motion.g animate={{rotate:-360}} transition={{duration:10,repeat:Infinity,ease:"linear"}} style={{transformOrigin:"120px 120px"}}>
          <circle cx="120" cy="30" r="3.5" fill="#2dd4bf" style={{filter:"drop-shadow(0 0 5px #2dd4bf)"}}/>
        </motion.g>
        <motion.g animate={{rotate:360}} transition={{duration:16,repeat:Infinity,ease:"linear"}} style={{transformOrigin:"120px 120px"}}>
          <circle cx="120" cy="17" r="2.5" fill="#67e8f9" opacity="0.9"/>
        </motion.g>
      </svg>
    </motion.div>
  </div>
);

/* ══ Laptop ══ */
const Laptop3D = ({isOpen}) => (
  <div style={{position:"relative",width:"390px",height:"282px",transformStyle:"preserve-3d",perspective:"1200px"}}>
    <motion.div initial={{rotateX:-112}} animate={{rotateX:isOpen?0:-112}}
      transition={{duration:2.3,ease:[0.22,1,0.36,1],delay:0.35}}
      style={{position:"absolute",width:"390px",height:"252px",bottom:"26px",left:0,transformOrigin:"bottom center",transformStyle:"preserve-3d"}}>
      <div style={{width:"100%",height:"100%",borderRadius:"14px 14px 0 0",
        background:"linear-gradient(145deg,#0a1e24,#020d14)",
        border:"2px solid rgba(45,212,191,0.3)",borderBottom:"none",
        boxShadow:"0 -4px 40px rgba(45,212,191,0.18),inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow:"hidden",position:"relative"}}>
        {/* Screen */}
        <div style={{position:"absolute",inset:"10px 10px 8px 10px",borderRadius:"8px",
          background:isOpen?"linear-gradient(135deg,#000c12,#011520,#000c12)":"#000",
          overflow:"hidden",transition:"background 0.5s"}}>
          <AnimatePresence>
            {isOpen&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8,duration:0.8}}
                style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                {/* Screen stars */}
                {Array.from({length:35},(_,i)=>(
                  <motion.div key={i}
                    style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
                      width:Math.random()*2+0.5,height:Math.random()*2+0.5,borderRadius:"50%",
                      background:i%3===0?"rgba(45,212,191,0.8)":"rgba(255,255,255,0.7)",opacity:0.5}}
                    animate={{opacity:[0.15,0.8,0.15]}}
                    transition={{duration:2+Math.random()*2,delay:Math.random()*3,repeat:Infinity}}/>
                ))}
                <div style={{position:"absolute",width:"170px",height:"170px",borderRadius:"50%",
                  background:"radial-gradient(circle,rgba(45,212,191,0.22) 0%,transparent 70%)",
                  top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
                <motion.img src="/logo.png" alt="DQ"
                  initial={{scale:0.3,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:2.1,duration:0.7,ease:[0.22,1,0.36,1]}}
                  style={{width:"70px",height:"70px",objectFit:"contain",
                    filter:"drop-shadow(0 0 18px rgba(45,212,191,1)) drop-shadow(0 0 30px rgba(6,182,212,0.6))",position:"relative",zIndex:2}}/>
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:2.4,duration:0.6}} style={{textAlign:"center",zIndex:2}}>
                  <div style={{fontSize:"11.5px",fontWeight:700,color:"#2dd4bf",letterSpacing:"0.16em",textShadow:"0 0 20px rgba(45,212,191,0.9)"}}>VJ DATA QUESTERS</div>
                  <div style={{fontSize:"8.5px",color:"rgba(255,255,255,0.35)",marginTop:"3px",letterSpacing:"0.1em"}}>VNRVJIET · HYDERABAD</div>
                </motion.div>
                <motion.div animate={{y:["-100%","400%"]}} transition={{duration:2.5,delay:2.3,repeat:Infinity,ease:"linear",repeatDelay:1}}
                  style={{position:"absolute",left:0,right:0,height:"1.5px",background:"linear-gradient(90deg,transparent,rgba(45,212,191,0.6),transparent)",pointerEvents:"none"}}/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{position:"absolute",top:"5px",left:"50%",transform:"translateX(-50%)",width:"5px",height:"5px",borderRadius:"50%",
          background:isOpen?"#2dd4bf":"#0a1e24",boxShadow:isOpen?"0 0 8px rgba(45,212,191,1)":"none",transition:"all 1s ease 2s"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"35%",
          background:"linear-gradient(180deg,rgba(45,212,191,0.04) 0%,transparent 100%)",
          borderRadius:"14px 14px 0 0",pointerEvents:"none"}}/>
      </div>
    </motion.div>
    {/* Base */}
    <div style={{position:"absolute",bottom:0,left:0,width:"390px",height:"26px",
      background:"linear-gradient(180deg,#0a1e24,#060f16)",borderRadius:"4px 4px 10px 10px",
      border:"1px solid rgba(45,212,191,0.22)",borderTop:"2px solid rgba(45,212,191,0.38)",
      boxShadow:"0 10px 40px rgba(0,0,0,0.7)"}}>
      {[0,1,2].map(r=><div key={r} style={{position:"absolute",top:`${4+r*7}px`,left:`${18+r*4}px`,right:`${18+r*4}px`,height:"2.5px",borderRadius:"2px",background:"rgba(45,212,191,0.1)"}}/>)}
      <div style={{position:"absolute",bottom:"3px",left:"50%",transform:"translateX(-50%)",width:"65px",height:"7px",borderRadius:"3px",background:"rgba(45,212,191,0.1)",border:"1px solid rgba(45,212,191,0.2)"}}/>
    </div>
    <motion.div initial={{opacity:0,scaleX:0.4}} animate={{opacity:isOpen?0.55:0.15,scaleX:isOpen?1:0.4}} transition={{duration:2}}
      style={{position:"absolute",bottom:"-14px",left:"10%",right:"10%",height:"14px",borderRadius:"50%",
        background:"rgba(0,0,0,0.6)",filter:"blur(10px)"}}/>
  </div>
);

/* ══ Team Card ══ */
const TeamCard=({person})=>(<Reveal><a href={person.linkedin||null} target="_blank"><div className="py-6 w-full max-w-[280px] mx-auto flex flex-col justify-center items-center bg-[#EEEEEE] hover:scale-[103%] hover:shadow-lg transition-all duration-[300ms] rounded-lg cursor-pointer"><img className="w-[200px] h-[200px] object-cover rounded-full" src={person.image?`/teamImages/${person.image}`:"https://picsum.photos/200"} alt={person.name}/><p className="text-center text-black text-xl font-semibold tracking-wide">{person.name}</p><p className="text-center text-base text-gray-600 font-light">{person.role}</p></div></a></Reveal>);

/* ════════════════════════════════════════
   HOME
════════════════════════════════════════ */
export default function Home() {
  const topTeam=faculty||[];
  const [laptopOpen,setLaptopOpen]=useState(false);
  const [showContent,setShowContent]=useState(false);
  useEffect(()=>{const t1=setTimeout(()=>setLaptopOpen(true),700);const t2=setTimeout(()=>setShowContent(true),2100);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);

  return (
    <div style={{position:"relative"}}>
      {/* SPACE BG — fixed, behind everything */}
      <SpaceBG/>

      {/* ════ HERO ════ */}
      <div style={{minHeight:"100vh",width:"100%",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",paddingTop:"95px",paddingBottom:"50px",boxSizing:"border-box",zIndex:1}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"clamp(14px,2vw,40px)",width:"100%",maxWidth:"1260px",padding:"0 20px",flexWrap:"wrap"}}>

          {/* LEFT — 3D DQ Logo */}
          <motion.div initial={{opacity:0,x:-70,scale:0.72}} animate={{opacity:1,x:0,scale:1}} transition={{duration:1.2,ease:[0.22,1,0.36,1],delay:0.2}} style={{flex:"0 0 auto"}}>
            <TiltCard>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"}}>
                <DQLogo3D/>
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1.0,duration:0.6}} style={{textAlign:"center"}}>
                  <div style={{fontSize:"10px",color:"rgba(45,212,191,0.6)",letterSpacing:"0.2em",fontWeight:700}}>✦ DATA SCIENCE CLUB ✦</div>
                  <div style={{fontSize:"9px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.12em",marginTop:"2px"}}>VNRVJIET · HYDERABAD</div>
                </motion.div>
              </div>
            </TiltCard>
          </motion.div>

          {/* CENTRE — Laptop */}
          <motion.div initial={{opacity:0,y:50,scale:0.8}} animate={{opacity:1,y:0,scale:1}} transition={{duration:1.2,ease:[0.22,1,0.36,1],delay:0.1}} style={{flex:"0 0 auto"}}>
            <TiltCard><Laptop3D isOpen={laptopOpen}/></TiltCard>
          </motion.div>

          {/* RIGHT — Info Card */}
          <motion.div initial={{opacity:0,x:70}} animate={{opacity:showContent?1:0,x:showContent?0:70}} transition={{duration:1.0,ease:[0.22,1,0.36,1]}} style={{flex:"0 0 auto"}}>
            <TiltCard>
              <div style={{position:"relative",padding:"36px 40px",borderRadius:"24px",minWidth:"272px",maxWidth:"355px",
                background:"rgba(1,14,22,0.7)",
                backdropFilter:"blur(32px) saturate(160%)",WebkitBackdropFilter:"blur(32px) saturate(160%)",
                border:"1px solid rgba(45,212,191,0.22)",
                boxShadow:"0 24px 80px rgba(0,0,0,0.75),0 0 40px rgba(45,212,191,0.05),inset 0 1px 0 rgba(45,212,191,0.1)",
                overflow:"hidden"}}>

                {/* Card micro-stars */}
                {Array.from({length:10},(_,i)=>(
                  <motion.div key={i}
                    style={{position:"absolute",left:`${5+(i*33)%90}%`,top:`${5+(i*21)%88}%`,
                      width:i%3===0?2:1,height:i%3===0?2:1,borderRadius:"50%",
                      background:i%2===0?"rgba(45,212,191,0.6)":"rgba(255,255,255,0.5)",pointerEvents:"none"}}
                    animate={{opacity:[0.15,0.8,0.15]}} transition={{duration:2+i%3,delay:i*0.35,repeat:Infinity}}/>
                ))}
                <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(45,212,191,0.07) 0%,transparent 50%)",pointerEvents:"none",borderRadius:"24px"}}/>
                <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:"1px",background:"linear-gradient(90deg,transparent,rgba(45,212,191,0.9),transparent)"}}/>
                <div style={{position:"absolute",top:0,right:0,width:"90px",height:"90px",background:"radial-gradient(circle at top right,rgba(45,212,191,0.16),transparent 70%)",borderRadius:"0 24px 0 0"}}/>

                {/* Badge */}
                <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.2}}
                  style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 12px",borderRadius:"99px",background:"rgba(45,212,191,0.12)",border:"1px solid rgba(45,212,191,0.35)",marginBottom:"14px"}}>
                  <motion.span style={{width:6,height:6,borderRadius:"50%",background:"#2dd4bf",display:"inline-block"}}
                    animate={{boxShadow:["0 0 0px rgba(45,212,191,0)","0 0 12px rgba(45,212,191,1)","0 0 0px rgba(45,212,191,0)"]}}
                    transition={{duration:1.8,repeat:Infinity}}/>
                  <span style={{fontSize:"10px",color:"#2dd4bf",fontWeight:700,letterSpacing:"0.12em"}}>🚀 DATA SCIENCE CLUB</span>
                </motion.div>

                <motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.7}}
                  style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:900,color:"#fff",letterSpacing:"0.03em",lineHeight:1.1,margin:"0 0 5px"}}>
                  VJ DATA<br/>
                  <span style={{background:"linear-gradient(90deg,#2dd4bf,#06b6d4,#0891b2)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>QUESTERS</span>
                </motion.h1>

                <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:0.55,duration:0.7}}
                  style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(45,212,191,0.7),rgba(6,182,212,0.4),transparent)",margin:"10px 0",transformOrigin:"left"}}/>

                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}>
                  <p style={{fontSize:"13px",color:"rgba(255,255,255,0.82)",margin:"0 0 3px",fontWeight:500}}>VNRVJIET, Hyderabad</p>
                  <p style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",fontStyle:"italic",margin:0}}>Differentiated by inputs / Integrated by outputs</p>
                </motion.div>

                <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.95,duration:0.6}}
                  style={{display:"flex",marginTop:"18px",paddingTop:"14px",borderTop:"1px solid rgba(45,212,191,0.1)"}}>
                  {[{value:500,suffix:"+",label:"Members",color:"#2dd4bf"},{value:50,suffix:"+",label:"Events",color:"#06b6d4"},{value:3,suffix:" yrs",label:"Running",color:"#0891b2"}].map(({value,suffix,label,color},i)=>(
                    <div key={label} style={{flex:1,textAlign:"center",borderRight:i<2?"1px solid rgba(45,212,191,0.1)":"none",padding:"0 6px"}}>
                      <div style={{fontSize:"18px",fontWeight:700,color,textShadow:`0 0 14px ${color}66`}}><CountUp target={value} suffix={suffix}/></div>
                      <div style={{fontSize:"9px",color:"rgba(255,255,255,0.32)",marginTop:"2px",letterSpacing:"0.07em"}}>{label}</div>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1.15,duration:0.5}} style={{marginTop:"16px"}}>
                  <Link to="/about" style={{textDecoration:"none"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"11px 20px",borderRadius:"12px",
                      background:"linear-gradient(135deg,rgba(45,212,191,0.22),rgba(6,182,212,0.14))",
                      border:"1px solid rgba(45,212,191,0.45)",color:"#2dd4bf",fontSize:"13px",fontWeight:600,letterSpacing:"0.05em",cursor:"pointer",transition:"all 0.25s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(45,212,191,0.38),rgba(6,182,212,0.28))";e.currentTarget.style.boxShadow="0 8px 28px rgba(45,212,191,0.4)";e.currentTarget.style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(45,212,191,0.22),rgba(6,182,212,0.14))";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
                      🌊 Explore Club <ArrowRight size={14}/>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:3.5}}
          style={{position:"absolute",bottom:"18px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px"}}>
          <span style={{fontSize:"9px",color:"rgba(45,212,191,0.35)",letterSpacing:"0.25em"}}>SCROLL</span>
          <motion.div animate={{scaleY:[1,0.3,1],opacity:[0.5,0.08,0.5]}} transition={{duration:1.6,repeat:Infinity}}
            style={{width:"1px",height:"28px",background:"linear-gradient(to bottom,rgba(45,212,191,0.8),transparent)"}}/>
        </motion.div>
      </div>

      {/* ════ ABOUT ════ */}
      <div className="clip-art-1" style={{position:"relative",zIndex:1}}>
        <div className="z-10 text-justify sm:text-left max-w-5xl mx-auto">
          <div className="lg:hidden"><img src="/logo.png" className="max-w-64 mx-auto"/></div>
          <div className="px-2 pb-20 lg:pt-4">
            <h2 className="text-white pb-3 text-center text-3xl font-semibold">About VJDQ</h2>
            <p className="text-white text-base leading-5 sm:text-lg">Welcome to our Data Science Club, the premier hub for data science enthusiasts at our college. Established with the vision of driving innovation and collaboration, our club serves as the central point for all data science-related activities on campus. We provide comprehensive guidance on projects, offer certifications for both students and faculty, and keep our members informed about the latest industry trends and real-world applications of data science.</p>
            <Link to="/about"><button className="rounded-sm w-32 h-10 bg-white text-black border-none hover:bg-white/65 mt-8 transition-all duration-[300ms] ease-in-out">Know More</button></Link>
          </div>
        </div>
      </div>

      {/* ════ WHAT WE DO ════ */}
      <div className="w-full max-w-3xl mx-auto my-6 text-center" style={{position:"relative",zIndex:1}}>
        <h2 className="text-3xl font-semibold">What we do?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 mx-auto px-2 sm:px-0">
          {whatwedo.map((d,i)=>(
            <Reveal key={i}><Link to={d?.example} className="flex justify-center">
              <div className="w-40 h-16 sm:w-60 sm:h-20 px-2 sm:p-4 flex items-center justify-evenly border border-black/50 rounded-lg bg-white shadow-2xl hover:scale-105 transition-all duration-[300ms] ease-in-out">
                <img src={`/${d.imgURL}`} alt="" className="w-[15%] sm:w-[20%] object-contain" draggable={false}/>
                <h3 className="text-sm sm:text-base lg:text-lg text-black font-semibold flex-1 text-left ml-3">{d.title}</h3>
              </div>
            </Link></Reveal>
          ))}
        </div>
        <div className="flex justify-center">
          <Reveal><Link to="/events" className="px-6 py-3 font-[300] text-base text-white rounded-lg bg-[#0f323fee] hover:bg-[#135168] transition-all duration-[300ms] ease-in-out flex items-center gap-x-2 group">
            <span className="group-hover:scale-105 transition-all duration-[300ms]">View All Activity</span>
            <ArrowRight size={20} className="text-white transform group-hover:translate-x-1 transition-transform duration-[500ms]"/>
          </Link></Reveal>
        </div>
      </div>

      {/* ════ GLIMPSES ════ */}
      <div className="clip-art-combined pt-16 pb-20" style={{position:"relative",zIndex:1}}>
        <section className="max-w-7xl md:max-w-[90%] h-full mx-auto">
          <h2 className="text-center text-3xl font-semibold text-white">Glimpses</h2>
          <div className="flex justify-center"><div className="w-full max-w-6xl mx-auto"><Reveal><Carousel/></Reveal></div></div>
        </section>
      </div>

      {/* ════ TEAM ════ */}
      <section className="max-w-7xl md:max-w-[90%] h-full py-6 px-4 mx-auto" style={{position:"relative",zIndex:1}}>
        <h1 className="text-center text-3xl font-semibold text-black mb-8">Our Coordinators</h1>
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto px-4">
            {topTeam.map((person,i)=><div key={i} className="w-[280px]"><TeamCard person={person}/></div>)}
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <Reveal><Link to="/team" className="px-6 py-3 font-[300] text-base text-white rounded-lg bg-[#135168] hover:bg-[#1a6785] transition-all duration-[300ms] ease-in-out flex items-center gap-x-2 group">
            <span className="group-hover:scale-105 transition-all duration-[300ms]">View Full Team</span>
            <ArrowRight size={20} className="text-white transform group-hover:translate-x-1 transition-transform duration-[500ms]"/>
          </Link></Reveal>
        </div>
      </section>
    </div>
  );
}
