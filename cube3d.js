/**
 * RubiksCube3D — Isometric canvas renderer
 * size:2 → 4 stickers per face | size:3 → 9 stickers per face
 */
class RubiksCube3D {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.size   = opts.size   || 3;
    this.cell   = opts.cell   || (this.size === 2 ? 54 : 38);
    this.gap    = opts.gap    || 4;
    this.rotX   = opts.rotX  ?? -0.46;
    this.rotY   = opts.rotY  ?? 0.72;
    this._drag  = false; this._lx = 0; this._ly = 0;
    this._raf   = null;

    this.COLORS = {
      U:'#F5F5EE', D:'#F9C920', F:'#E53935',
      B:'#F07820', R:'#1E6FAD', L:'#43A047', X:'#1a1a1a'
    };

    const n = this.size * this.size;
    this.faces = {
      U:Array(n).fill('U'), D:Array(n).fill('D'),
      F:Array(n).fill('F'), B:Array(n).fill('B'),
      R:Array(n).fill('R'), L:Array(n).fill('L'),
    };

    this._bindEvents();
    this._render();
  }

  _proj(x, y, z) {
    const cx=Math.cos(this.rotX), sx=Math.sin(this.rotX);
    const cy=Math.cos(this.rotY), sy=Math.sin(this.rotY);
    const x1= cy*x+sy*z,  z1=-sy*x+cy*z;
    const y2= sx*z1+cx*y, z2= cx*z1-sx*y;
    const f=420, d=f+z2;
    return { sx: this.canvas.width/2+x1*f/d, sy: this.canvas.height/2+y2*f/d, z: z2 };
  }

  _visible(face) {
    const n={U:[0,-1,0],D:[0,1,0],F:[0,0,1],B:[0,0,-1],R:[1,0,0],L:[-1,0,0]}[face];
    const cx=Math.cos(this.rotX), sx=Math.sin(this.rotX);
    const cy=Math.cos(this.rotY), sy=Math.sin(this.rotY);
    return n[0]*sy + n[1]*(-sx*cy) + n[2]*(cx*cy) > 0.02;
  }

  _render() {
    const {ctx,canvas,size,cell,gap,faces,COLORS} = this;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const step = cell+gap;
    const half = (size*step-gap)/2;
    const polys = [];

    const push = (faceKey, ox,oy,oz, ax,ay,az, bx,by,bz, u,v) => {
      const col = COLORS[faces[faceKey][v*size+u]] || COLORS.X;
      const pts = [
        [ox,oy,oz],
        [ox+ax*cell,oy+ay*cell,oz+az*cell],
        [ox+ax*cell+bx*cell,oy+ay*cell+by*cell,oz+az*cell+bz*cell],
        [ox+bx*cell,oy+by*cell,oz+bz*cell],
      ].map(([x,y,z])=>this._proj(x,y,z));
      polys.push({pts, col, z: pts.reduce((s,p)=>s+p.z,0)/4});
    };

    for(let row=0; row<size; row++) {
      for(let col=0; col<size; col++) {
        const x0=-half+col*step, y0=-half+row*step;
        if(this._visible('F')) push('F', x0,y0,half+1,       1,0,0, 0,1,0, col,row);
        if(this._visible('B')) push('B', half-col*step,y0,-half-1, -1,0,0, 0,1,0, col,row);
        if(this._visible('R')) push('R', half+1,y0,half-col*step,  0,0,-1, 0,1,0, col,row);
        if(this._visible('L')) push('L', -half-1,y0,-half+col*step, 0,0,1, 0,1,0, col,row);
        if(this._visible('U')) push('U', x0,-half-1,half-row*step,  1,0,0, 0,0,-1, col,row);
        if(this._visible('D')) push('D', x0,half+1,-half+row*step,  1,0,0, 0,0,1, col,row);
      }
    }

    polys.sort((a,b)=>a.z-b.z);
    for(const p of polys) {
      ctx.beginPath();
      ctx.moveTo(p.pts[0].sx, p.pts[0].sy);
      for(let i=1;i<4;i++) ctx.lineTo(p.pts[i].sx, p.pts[i].sy);
      ctx.closePath();
      ctx.fillStyle = p.col;
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  _bindEvents() {
    const el = this.canvas;
    const dn = (x,y) => { this._drag=true; this._lx=x; this._ly=y; };
    const mv = (x,y) => {
      if(!this._drag) return;
      this.rotY += (x-this._lx)*0.013;
      this.rotX += (y-this._ly)*0.013;
      this.rotX = Math.max(-1.25, Math.min(1.25, this.rotX));
      this._lx=x; this._ly=y;
      this._render();
    };
    el.addEventListener('mousedown', e=>dn(e.clientX,e.clientY));
    el.addEventListener('touchstart', e=>{e.preventDefault(); dn(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    window.addEventListener('mouseup', ()=>this._drag=false);
    window.addEventListener('touchend', ()=>this._drag=false);
    window.addEventListener('mousemove', e=>mv(e.clientX,e.clientY));
    window.addEventListener('touchmove', e=>mv(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
  }

  spin(speed=0.006) {
    const tick = () => {
      if(!this._drag){ this.rotY+=speed; this._render(); }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() { if(this._raf) cancelAnimationFrame(this._raf); }
}
