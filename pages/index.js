// pages/index.js
export default function Construccion() {
  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0b0b0c',color:'#fff',textAlign:'center',padding:'2rem'}}>
      <div>
        <div style={{fontSize:28, fontWeight:800, marginBottom:8}}>🚧 PadelMatch Sync está en construcción</div>
        <div style={{opacity:.8}}>Pronto podrás encontrar tu pareja de pádel ideal.</div>
        <p style={{marginTop:16,opacity:.7}}>Mientras tanto visita <a href="/landing" style={{color:'#0fd1a8',textDecoration:'underline'}}>padelmatchsync.com/landing</a></p>
      </div>
    </div>
  );
}
