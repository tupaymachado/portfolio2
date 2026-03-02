import { useRef, useState, useCallback, useEffect } from 'react';
import styles from './PaintApp.module.css';
import AppMenuBar from '../../AppMenuBar/AppMenuBar';
import type { AppMenuBarItem } from '../../AppMenuBar/AppMenuBar';

type Tool =
  | 'freeselect' | 'select'
  | 'eraser' | 'fill'
  | 'eyedropper' | 'magnifier'
  | 'pencil' | 'brush'
  | 'airbrush' | 'text'
  | 'line' | 'curve'
  | 'rectangle' | 'polygon'
  | 'ellipse' | 'roundrect';

const TOOLS: { id: Tool; symbol: string; label: string }[] = [
  { id: 'freeselect', symbol: '✦', label: 'Seleção livre' },
  { id: 'select',     symbol: '⊡', label: 'Seleção retangular' },
  { id: 'eraser',     symbol: '▭', label: 'Borracha' },
  { id: 'fill',       symbol: '◢', label: 'Preenchimento com cor' },
  { id: 'eyedropper', symbol: '◈', label: 'Conta-gotas' },
  { id: 'magnifier',  symbol: '⊕', label: 'Lupa' },
  { id: 'pencil',     symbol: '✏', label: 'Lápis' },
  { id: 'brush',      symbol: '▋', label: 'Pincel' },
  { id: 'airbrush',   symbol: '⋰', label: 'Aerógrafo' },
  { id: 'text',       symbol: 'A', label: 'Texto' },
  { id: 'line',       symbol: '╱', label: 'Linha' },
  { id: 'curve',      symbol: '∿', label: 'Curva' },
  { id: 'rectangle',  symbol: '□', label: 'Retângulo' },
  { id: 'polygon',    symbol: '▱', label: 'Polígono' },
  { id: 'ellipse',    symbol: '○', label: 'Elipse' },
  { id: 'roundrect',  symbol: '▢', label: 'Ret. arredondado' },
];

const PALETTE: string[] = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080c0', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
];

const CANVAS_W = 800;
const CANVAS_H = 500;

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillHex: string) {
  const { r: fr, g: fg, b: fb } = hexToRgb(fillHex);
  const idata = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const d = idata.data;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(startX)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(startY)));
  const si = (y0 * w + x0) * 4;
  const tr = d[si], tg = d[si + 1], tb = d[si + 2];
  if (tr === fr && tg === fg && tb === fb) return;

  const visited = new Uint8Array(w * h);
  const stack = [x0 + y0 * w];

  while (stack.length) {
    const i = stack.pop()!;
    if (visited[i]) continue;
    visited[i] = 1;
    const p = i * 4;
    if (d[p] !== tr || d[p + 1] !== tg || d[p + 2] !== tb) continue;
    d[p] = fr; d[p + 1] = fg; d[p + 2] = fb; d[p + 3] = 255;
    const x = i % w, y = Math.floor(i / w);
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
  ctx.putImageData(idata, 0, 0);
}


export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(2);
  const [status, setStatus] = useState('');

  const drawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);
  const undoData = useRef<ImageData | null>(null);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const saveUndo = useCallback(() => {
    const ctx = getCtx();
    if (ctx) undoData.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const spray = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 15;
      ctx.fillRect(x + r * Math.cos(a), y + r * Math.sin(a), 1, 1);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    e.preventDefault();
    const pos = getPos(e);
    const color = e.button === 2 ? bg : fg;
    saveUndo();
    drawing.current = true;
    startPos.current = pos;

    if (['line', 'rectangle', 'ellipse'].includes(tool)) {
      snapshot.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
      return;
    }

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      const c = tool === 'eraser' ? bg : color;
      ctx.strokeStyle = c;
      ctx.lineWidth = tool === 'brush' ? size * 3 : size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + 0.1, pos.y);
      ctx.stroke();
      return;
    }

    if (tool === 'fill') {
      floodFill(ctx, pos.x, pos.y, color);
      return;
    }

    if (tool === 'eyedropper') {
      const px = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      const hex = `#${[px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`;
      e.button === 2 ? setBg(hex) : setFg(hex);
      return;
    }

    if (tool === 'airbrush') {
      spray(ctx, pos.x, pos.y, color);
      return;
    }
  }, [tool, fg, bg, size, saveUndo, spray]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    setStatus(`${Math.floor(pos.x)}, ${Math.floor(pos.y)}`);
    if (!drawing.current) return;

    const color = e.buttons === 2 ? bg : fg;

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? bg : color;
      ctx.lineWidth = tool === 'brush' ? size * 3 : size;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      return;
    }

    if (tool === 'airbrush') {
      spray(ctx, pos.x, pos.y, color);
      return;
    }

    if (['line', 'rectangle', 'ellipse'].includes(tool) && snapshot.current) {
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.beginPath();

      if (tool === 'line') {
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y);
      } else if (tool === 'ellipse') {
        const cx = (startPos.current.x + pos.x) / 2;
        const cy = (startPos.current.y + pos.y) / 2;
        const rx = Math.abs(pos.x - startPos.current.x) / 2;
        const ry = Math.abs(pos.y - startPos.current.y) / 2;
        ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [tool, fg, bg, size, spray]);

  const handleMouseUp = useCallback(() => {
    drawing.current = false;
    snapshot.current = null;
    getCtx()?.beginPath();
  }, []);

  const handleNew = () => {
    saveUndo();
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  };

  const handleSave = () => {
    const link = document.createElement('a');
    link.download = 'untitled.png';
    link.href = canvasRef.current!.toDataURL();
    link.click();
  };

  const handleUndo = () => {
    const ctx = getCtx();
    if (!ctx || !undoData.current) return;
    ctx.putImageData(undoData.current, 0, 0);
    undoData.current = null;
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    saveUndo();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ctx = getCtx();
        if (!ctx) return;
        // Fill background, then draw image scaled to fit (never upscaled)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getCursor = () => {
    if (tool === 'text') return 'text';
    if (tool === 'magnifier') return 'zoom-in';
    return 'crosshair';
  };

  const menuItems: AppMenuBarItem[] = [
    {
      label: 'Arquivo',
      items: [
        { label: 'Novo', onClick: handleNew },
        { label: 'Abrir...', onClick: handleOpen },
        { separator: true },
        { label: 'Salvar como PNG', onClick: handleSave },
      ],
    },
    {
      label: 'Editar',
      items: [
        { label: 'Desfazer', onClick: handleUndo },
      ],
    },
    { label: 'Exibir' },
    { label: 'Imagem' },
    { label: 'Cores' },
    { label: 'Ajuda' },
  ];

  return (
    <div className={styles.container}>
      <AppMenuBar items={menuItems} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={styles.workArea}>
        {/* Tool Panel */}
        <div className={styles.toolbar}>
          <div className={styles.toolGrid}>
            {TOOLS.map(t => (
              <button
                key={t.id}
                className={`${styles.toolBtn} ${tool === t.id ? styles.toolActive : ''}`}
                onClick={() => setTool(t.id)}
                title={t.label}
              >
                {t.symbol}
              </button>
            ))}
          </div>

          {/* Foreground / Background color swatches */}
          <div className={styles.colorSwatch}>
            <div className={styles.swatchBg} style={{ background: bg }} title="Cor de fundo (clique direito na paleta)" />
            <div className={styles.swatchFg} style={{ background: fg }} title="Cor do lápis (clique esquerdo na paleta)" />
          </div>

          {/* Brush sizes */}
          <div className={styles.brushSizes}>
            {([1, 2, 4, 7] as const).map(s => (
              <button
                key={s}
                className={`${styles.sizeBtn} ${size === s ? styles.sizeBtnActive : ''}`}
                onClick={() => setSize(s)}
                title={`Tamanho ${s}`}
              >
                <div style={{ width: Math.min(s * 2, 16), height: Math.min(s * 2, 16), background: '#000', borderRadius: '50%' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas scroll area */}
        <div className={styles.canvasScroll}>
          <div className={styles.canvasShadow}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className={styles.canvas}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={e => e.preventDefault()}
              style={{ cursor: getCursor() }}
            />
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className={styles.palette}>
        <div className={styles.paletteIndicator}>
          <div className={styles.paletteBg} style={{ background: bg }} />
          <div className={styles.paletteFg} style={{ background: fg }} />
        </div>
        <div className={styles.paletteGrid}>
          {PALETTE.map((c, i) => (
            <button
              key={i}
              className={styles.paletteColor}
              style={{ background: c }}
              onClick={() => setFg(c)}
              onContextMenu={e => { e.preventDefault(); setBg(c); }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        {status ? `${status}px` : 'Para obter ajuda, clique em Tópicos da Ajuda no menu Ajuda.'}
      </div>
    </div>
  );
}
