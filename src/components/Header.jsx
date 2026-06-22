import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

/* ── tiny twinkling stars in navbar ── */
const NavStars = () => (
  <div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:"inherit",pointerEvents:"none",zIndex:0}}>
    {Array.from({length:24},(_,i)=>(
      <motion.div key={i}
        style={{position:"absolute",left:`${4+(i*41)%93}%`,top:`${8+(i*19)%84}%`,width:i%5===0?2:1,height:i%5===0?2:1,borderRadius:"50%",background:`rgba(${i%2===0?"45,212,191":"103,232,249"},0.7)`}}
        animate={{opacity:[0.15,0.9,0.15],scale:[1,1.6,1]}}
        transition={{duration:1.8+(i%4)*0.6,delay:(i%6)*0.4,repeat:Infinity,ease:"easeInOut"}}/>
    ))}
  </div>
);

/* ── orbital ring on hover ── */
const OrbitalRing = ({visible,color}) => (
  <AnimatePresence>
    {visible&&(
      <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1,rotate:360}} exit={{scale:0,opacity:0}}
        transition={{scale:{duration:0.25},opacity:{duration:0.2},rotate:{duration:2.5,repeat:Infinity,ease:"linear"}}}
        style={{position:"absolute",inset:"-7px",borderRadius:"50%",border:`1px dashed ${color}88`,pointerEvents:"none",zIndex:0}}/>
    )}
  </AnimatePresence>
);

/* ── planet nav pill ── */
const PlanetPill = ({label,to,isActive,index,color,size=8}) => {
  const ref=useRef(null);
  const mx=useMotionValue(0),my=useMotionValue(0);
  const sx=useSpring(mx,{stiffness:320,damping:22}),sy=useSpring(my,{stiffness:320,damping:22});
  const [hov,setHov]=useState(false);
  return (
    <motion.li style={{listStyle:"none",position:"relative"}}
      initial={{opacity:0,y:-28,scale:0.4}}
      animate={{opacity:1,y:0,scale:1}}
      transition={{delay:0.12+index*0.08,duration:0.7,ease:[0.22,1,0.36,1]}}>
      <Link to={to} style={{textDecoration:"none"}}>
        <motion.div ref={ref} style={{x:sx,y:sy,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}
          onMouseMove={e=>{const r=ref.current?.getBoundingClientRect();if(!r)return;mx.set((e.clientX-(r.left+r.width/2))*0.28);my.set((e.clientY-(r.top+r.height/2))*0.28);}}
          onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);mx.set(0);my.set(0);}}
          whileHover={{scale:1.1}}>
          <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:isActive?size+6:size+2,height:isActive?size+6:size+2}}>
            <OrbitalRing visible={hov||isActive} color={color}/>
            <motion.div style={{
              width:isActive?size+4:size,height:isActive?size+4:size,borderRadius:"50%",position:"relative",zIndex:1,
              background:isActive?`radial-gradient(circle at 30% 30%,#fff,${color})`:`radial-gradient(circle at 30% 30%,rgba(255,255,255,0.5),${color}70)`,
              boxShadow:isActive?`0 0 14px ${color},0 0 28px ${color}55`:hov?`0 0 10px ${color}88`:"none",
            }}
              animate={{scale:isActive?[1,1.25,1]:1,boxShadow:isActive?[`0 0 8px ${color}`,`0 0 22px ${color}`,`0 0 8px ${color}`]:undefined}}
              transition={{duration:2,repeat:isActive?Infinity:0,ease:"easeInOut"}}/>
          </div>
          <div style={{fontSize:"11.5px",color:isActive?color:hov?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.55)",fontWeight:isActive?700:500,letterSpacing:"0.06em",whiteSpace:"nowrap",transition:"color 0.2s",textShadow:isActive?`0 0 12px ${color}CC`:"none"}}>
            {label}
          </div>
          {isActive&&(
            <motion.div style={{height:"2px",width:"20px",borderRadius:"2px",background:`linear-gradient(90deg,transparent,${color},transparent)`,boxShadow:`0 0 6px ${color}`}}
              animate={{opacity:[0.5,1,0.5],scaleX:[0.7,1,0.7]}} transition={{duration:2,repeat:Infinity}}/>
          )}
        </motion.div>
      </Link>
    </motion.li>
  );
};

/* ── About dropdown ── */
const SpaceDropdown = ({links,index,isActive}) => {
  const [open,setOpen]=useState(false);
  const [hov,setHov]=useState(false);
  const tid=useRef(null);
  const enter=()=>{clearTimeout(tid.current);setOpen(true);setHov(true);};
  const leave=()=>{tid.current=setTimeout(()=>{setOpen(false);setHov(false);},120);};
  const color="#22d3ee";
  return (
    <motion.li style={{listStyle:"none",position:"relative"}}
      initial={{opacity:0,y:-28,scale:0.4}} animate={{opacity:1,y:0,scale:1}}
      transition={{delay:0.12+index*0.08,duration:0.7,ease:[0.22,1,0.36,1]}}
      onMouseEnter={enter} onMouseLeave={leave}>
      <motion.div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}} whileHover={{scale:1.1}}>
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:14,height:14}}>
          <OrbitalRing visible={hov||isActive} color={color}/>
          <motion.div style={{width:isActive?10:8,height:isActive?10:8,borderRadius:"50%",zIndex:1,position:"relative",
            background:isActive?`radial-gradient(circle at 30% 30%,#fff,${color})`:`radial-gradient(circle at 30% 30%,rgba(255,255,255,0.5),${color}70)`,
            boxShadow:isActive?`0 0 14px ${color},0 0 28px ${color}55`:hov?`0 0 10px ${color}88`:"none",cursor:"pointer"}}
            animate={{scale:isActive?[1,1.25,1]:1}} transition={{duration:2,repeat:isActive?Infinity:0}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"3px",cursor:"pointer"}}>
          <span style={{fontSize:"11.5px",color:isActive?color:hov?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.55)",fontWeight:isActive?700:500,letterSpacing:"0.06em",transition:"color 0.2s"}}>About</span>
          <motion.span animate={{rotate:open?180:0}} transition={{duration:0.25}} style={{fontSize:"8px",color:"rgba(255,255,255,0.35)",display:"inline-block"}}>▾</motion.span>
        </div>
      </motion.div>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:8,scale:0.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.9}}
            transition={{duration:0.2,ease:[0.22,1,0.36,1]}}
            onMouseEnter={enter} onMouseLeave={leave}
            style={{position:"absolute",top:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",width:"210px",
              background:"rgba(2,8,20,0.97)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
              border:"1px solid rgba(45,212,191,0.25)",borderRadius:"16px",overflow:"hidden",
              boxShadow:"0 24px 60px rgba(0,0,0,0.85),0 0 30px rgba(45,212,191,0.08)",zIndex:50,padding:"8px"}}>
            <div style={{position:"absolute",top:0,left:"25%",right:"25%",height:"1px",background:"linear-gradient(90deg,transparent,rgba(45,212,191,0.8),transparent)"}}/>
            {links.map(({label,to,icon},i)=>(
              <motion.div key={label} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}>
                <DropItem label={label} to={to} icon={icon}/>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const DropItem = ({label,to,icon}) => {
  const [hov,setHov]=useState(false);
  return (
    <Link to={to} style={{textDecoration:"none",display:"block"}}>
      <motion.div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} animate={{x:hov?5:0}} transition={{duration:0.16}}
        style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",borderRadius:"10px",
          background:hov?"rgba(45,212,191,0.1)":"transparent",border:hov?"1px solid rgba(45,212,191,0.22)":"1px solid transparent",
          transition:"background 0.18s,border 0.18s",cursor:"pointer"}}>
        <span style={{fontSize:"14px"}}>{icon}</span>
        <span style={{fontSize:"13px",color:hov?"#fff":"rgba(255,255,255,0.7)",fontWeight:500,flex:1,transition:"color 0.18s"}}>{label}</span>
        <motion.span animate={{opacity:hov?1:0,x:hov?0:-4}} style={{color:"#2dd4bf",fontSize:"11px"}}>→</motion.span>
      </motion.div>
    </Link>
  );
};

/* ════════════════════════════════════════
   MAIN HEADER
════════════════════════════════════════ */
const Header = () => {
  const [menu,setMenu]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [prog,setProg]=useState(0);
  const location=useLocation();

  useEffect(()=>{
    const fn=()=>{
      const s=window.scrollY;setScrolled(s>24);
      const max=document.body.scrollHeight-window.innerHeight;
      setProg(max>0?Math.min(s/max,1):0);
    };
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  useEffect(()=>{setMenu(false);},[location]);
  const isActive=(to)=>to==="/"?location.pathname==="/":location.pathname.startsWith(to);

  // Planet colours follow DQ logo palette: teal, cyan, seafoam, aqua, turquoise, mint
  const planets=[
    {label:"Home",      to:"/",           color:"#2dd4bf",size:9, idx:0},
    {label:"Events",    to:"/events",     color:"#06b6d4",size:8, idx:2},
    {label:"Gallery",   to:"/gallery",    color:"#0891b2",size:7, idx:3},
    {label:"Team",      to:"/team",       color:"#14b8a6",size:8, idx:4},
    {label:"Newsletter",to:"/newsletter", color:"#67e8f9",size:7, idx:5},
  ];
  const aboutLinks=[
    {label:"About us",      to:"/about",               icon:"🌊"},
    {label:"Testimonials",  to:"/testimonials",         icon:"💎"},
    {label:"Founders block",to:"/about#foundersBlock",  icon:"⚡"},
  ];

  return (
    <>
      <motion.nav
        initial={{y:-110,opacity:0}}
        animate={{y:0,opacity:1}}
        transition={{duration:1.0,ease:[0.22,1,0.36,1]}}
        style={{position:"fixed",top:"10px",left:"50%",transform:"translateX(-50%)",width:"calc(100% - 24px)",maxWidth:"1220px",zIndex:102}}
      >
        {/* Comet progress */}
        <motion.div style={{position:"absolute",top:0,left:0,height:"2px",borderRadius:"2px 2px 0 0",
          background:"linear-gradient(90deg,#2dd4bf,#06b6d4,#0e7490,#2dd4bf)",
          scaleX:prog,transformOrigin:"left",zIndex:10,boxShadow:"0 0 12px rgba(45,212,191,0.9)"}}/>

        {/* Nebula glow border pulse */}
        <motion.div style={{position:"absolute",inset:"-1px",borderRadius:"21px",zIndex:-1,pointerEvents:"none"}}
          animate={{boxShadow:["0 0 0px rgba(45,212,191,0)","0 0 28px rgba(45,212,191,0.3)","0 0 0px rgba(45,212,191,0)"]}}
          transition={{duration:3.5,repeat:Infinity,ease:"easeInOut"}}/>

        <motion.div
          animate={{background:scrolled?"rgba(1,12,20,0.96)":"rgba(2,16,28,0.7)",
            boxShadow:scrolled?"0 8px 48px rgba(0,0,0,0.85),inset 0 1px 0 rgba(45,212,191,0.12)":"0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(45,212,191,0.06)"}}
          transition={{duration:0.4}}
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:"62px",borderRadius:"20px",
            backdropFilter:"blur(32px) saturate(180%)",WebkitBackdropFilter:"blur(32px) saturate(180%)",
            border:"1px solid rgba(45,212,191,0.18)",overflow:"hidden",position:"relative"}}>

          <NavStars/>

          {/* Shooting light sweep */}
          <motion.div style={{position:"absolute",top:0,bottom:0,width:"4px",
            background:"linear-gradient(90deg,transparent,rgba(45,212,191,0.3),transparent)",pointerEvents:"none",zIndex:2}}
            animate={{x:["-40px","1400px"],opacity:[0,1,0]}}
            transition={{duration:3.5,repeat:Infinity,repeatDelay:7,ease:"easeOut"}}/>

          {/* ── SUN: DQ Logo ── */}
          <motion.div initial={{opacity:0,scale:0,rotate:-90}} animate={{opacity:1,scale:1,rotate:0}}
            transition={{duration:1.1,ease:[0.22,1,0.36,1],delay:0.05}}>
            <Link to="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"12px",flexShrink:0}}>
              <div style={{position:"relative"}}>
                {/* Sun corona rings */}
                {[1,2,3].map(i=>(
                  <motion.div key={i}
                    style={{position:"absolute",inset:`${-(i*7)}px`,borderRadius:"50%",border:`1px solid rgba(45,212,191,${0.35/i})`,pointerEvents:"none"}}
                    animate={{scale:[1,1.08+i*0.04,1],opacity:[0.5/i,0.9/i,0.5/i]}}
                    transition={{duration:2.5+i*0.5,repeat:Infinity,ease:"easeInOut",delay:i*0.3}}/>
                ))}
                <motion.div style={{position:"absolute",inset:"-10px",borderRadius:"50%",background:"radial-gradient(circle,rgba(45,212,191,0.28) 0%,transparent 70%)",pointerEvents:"none"}}
                  animate={{scale:[1,1.35,1],opacity:[0.5,0.9,0.5]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}/>
                <motion.img src="/logo.png" alt="DQ"
                  animate={{filter:["drop-shadow(0 0 6px rgba(45,212,191,0.7)) brightness(1.1)","drop-shadow(0 0 18px rgba(45,212,191,1)) brightness(1.35)","drop-shadow(0 0 6px rgba(45,212,191,0.7)) brightness(1.1)"]}}
                  transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
                  style={{width:40,height:40,objectFit:"contain",display:"block",position:"relative",zIndex:2}}/>
              </div>
              <div className="hidden sm:block">
                <motion.div style={{color:"rgba(255,255,255,0.96)",fontWeight:800,fontSize:"14px",letterSpacing:"0.15em",lineHeight:1}}
                  animate={{textShadow:["0 0 0px rgba(45,212,191,0)","0 0 16px rgba(45,212,191,0.8)","0 0 0px rgba(45,212,191,0)"]}}
                  transition={{duration:3,repeat:Infinity,repeatDelay:1}}>VJDQ</motion.div>
                <motion.div style={{fontSize:"9px",color:"rgba(45,212,191,0.55)",letterSpacing:"0.12em",marginTop:"1px"}}
                  animate={{opacity:[0.4,0.9,0.4]}} transition={{duration:2.5,repeat:Infinity}}>✦ DATA QUESTERS</motion.div>
              </div>
            </Link>
          </motion.div>

          {/* ── PLANET LINKS ── */}
          <ul style={{display:"flex",alignItems:"flex-end",gap:"6px",listStyle:"none",margin:0,padding:"0 0 4px",position:"relative"}} className="hidden md:flex">
            {/* Orbital belt */}
            <div style={{position:"absolute",bottom:"7px",left:"-8px",right:"-8px",height:"1px",background:"linear-gradient(90deg,transparent,rgba(45,212,191,0.06),rgba(45,212,191,0.14),rgba(45,212,191,0.06),transparent)",pointerEvents:"none"}}/>
            <PlanetPill {...planets[0]} isActive={isActive("/")}/>
            <SpaceDropdown links={aboutLinks} index={1} isActive={location.pathname.includes("about")||location.pathname.includes("testimonials")}/>
            {planets.slice(1).map(p=><PlanetPill key={p.label} {...p} isActive={isActive(p.to)}/>)}
          </ul>

          {/* HAMBURGER */}
          <motion.button onClick={()=>setMenu(!menu)} whileTap={{scale:0.88}}
            style={{display:"flex",flexDirection:"column",gap:"5px",padding:"8px",background:"transparent",border:"none",cursor:"pointer",borderRadius:"10px",zIndex:3}}
            className="md:hidden"
            animate={{background:menu?"rgba(45,212,191,0.15)":"transparent"}}>
            {[0,1,2].map(i=>(
              <motion.span key={i}
                animate={{rotate:i===0&&menu?45:i===2&&menu?-45:0,y:i===0&&menu?7:i===2&&menu?-7:0,opacity:i===1&&menu?0:1,scaleX:i===1&&menu?0:1,background:menu?"#2dd4bf":"rgba(255,255,255,0.85)"}}
                transition={{duration:0.3,ease:[0.22,1,0.36,1]}}
                style={{display:"block",width:"20px",height:"2px",borderRadius:"2px",transformOrigin:"center"}}/>
            ))}
          </motion.button>
        </motion.div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menu&&(
          <motion.div initial={{opacity:0,y:-18,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-18,scale:0.95}}
            transition={{duration:0.28,ease:[0.22,1,0.36,1]}}
            style={{position:"fixed",top:"82px",left:"12px",right:"12px",zIndex:101,background:"rgba(1,12,20,0.98)",
              backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",border:"1px solid rgba(45,212,191,0.2)",
              borderRadius:"20px",overflow:"hidden",boxShadow:"0 28px 80px rgba(0,0,0,0.9)"}}
            className="md:hidden">
            <div style={{height:"2px",background:"linear-gradient(90deg,transparent,#2dd4bf,#06b6d4,#0891b2,transparent)"}}/>
            <ul style={{listStyle:"none",padding:"10px",margin:0}}>
              {[
                {label:"Home",to:"/",icon:"🌊",sub:false,color:"#2dd4bf"},
                {label:"About us",to:"/about",icon:"💎",sub:true,color:"#22d3ee"},
                {label:"Testimonials",to:"/testimonials",icon:"⭐",sub:true,color:"#22d3ee"},
                {label:"Founders block",to:"/about#foundersBlock",icon:"⚡",sub:true,color:"#22d3ee"},
                {label:"Events",to:"/events",icon:"🚀",sub:false,color:"#06b6d4"},
                {label:"Gallery",to:"/gallery",icon:"🔭",sub:false,color:"#0891b2"},
                {label:"Team",to:"/team",icon:"🌐",sub:false,color:"#14b8a6"},
                {label:"Newsletter",to:"/newsletter",icon:"📡",sub:false,color:"#67e8f9"},
              ].map(({label,to,icon,sub,color},i)=>(
                <motion.li key={label} initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:i*0.05,duration:0.3}}>
                  <Link to={to} onClick={()=>setMenu(false)} style={{textDecoration:"none"}}>
                    <MobileItem label={label} icon={icon} sub={sub} color={color} isActive={isActive(to)}/>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileItem = ({label,icon,sub,color,isActive}) => {
  const [hov,setHov]=useState(false);
  return (
    <motion.div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} animate={{x:hov?5:0}} transition={{duration:0.16}}
      style={{display:"flex",alignItems:"center",gap:"10px",padding:sub?"9px 12px 9px 30px":"11px 12px",borderRadius:"12px",marginBottom:"2px",
        background:isActive?`${color}18`:hov?"rgba(255,255,255,0.04)":"transparent",
        border:isActive?`1px solid ${color}40`:"1px solid transparent",transition:"all 0.18s"}}>
      <span style={{fontSize:"15px"}}>{icon}</span>
      <span style={{fontSize:sub?"13px":"14px",color:isActive?color:sub?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.88)",fontWeight:isActive?700:sub?400:500,letterSpacing:"0.03em",flex:1}}>{label}</span>
      {isActive&&<motion.div initial={{scale:0}} animate={{scale:1}} style={{width:6,height:6,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/>}
    </motion.div>
  );
};

export default Header;
