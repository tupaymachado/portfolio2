import { useState, useCallback, useEffect, useRef } from 'react';
import { useSystemStore } from '../../../stores/useSystemStore';
import styles from './MinesweeperApp.module.css';
import { useWindowContext, useWindowStore } from '../../../stores/useWindowStore';

interface Difficulty {
    label: string;
    rows: number;
    cols: number;
    mines: number;
}

const DIFFICULTIES: Record<string, Difficulty> = {
    beginner: { label: 'Iniciante', rows: 9, cols: 9, mines: 10 },
    intermediate: { label: 'Intermediário', rows: 16, cols: 16, mines: 40 },
    expert: { label: 'Avançado', rows: 16, cols: 30, mines: 99 },
};

const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
];

interface Cell {
    mine: boolean;
    neighborMines: number;
    revealed: boolean;
    flagged: boolean;
}

type GameState = 'idle' | 'playing' | 'won' | 'lost';

// Cria board vazio
function createEmptyBoard(rows: number, cols: number): Cell[] {
    return Array.from({ length: rows * cols }, () => ({
        mine: false,
        neighborMines: 0,
        revealed: false,
        flagged: false,
    }));
}

// Distribui minas com zona segura
function placeMines(board: Cell[], safeIndex: number, rows: number, cols: number, minesCount: number): Cell[] {
    const totalCells = rows * cols;
    const safeRow = Math.floor(safeIndex / cols);
    const safeCol = safeIndex % cols;

    const safeZone = new Set<number>([safeIndex]);
    for (const [dr, dc] of DIRECTIONS) {
        const r = safeRow + dr;
        const c = safeCol + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
            safeZone.add(r * cols + c);
        }
    }

    const eligible = [];
    for (let i = 0; i < totalCells; i++) {
        if (!safeZone.has(i)) eligible.push(i);
    }

    for (let i = 0; i < minesCount; i++) {
        const j = i + Math.floor(Math.random() * (eligible.length - i));
        [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    const newBoard = board.map(cell => ({ ...cell }));
    for (let i = 0; i < minesCount; i++) {
        newBoard[eligible[i]].mine = true;
    }

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (newBoard[index].mine) continue;
            let count = 0;
            for (const [dr, dc] of DIRECTIONS) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (newBoard[nr * cols + nc].mine) count++;
                }
            }
            newBoard[index].neighborMines = count;
        }
    }

    return newBoard;
}

// Flood fill via BFS
function floodFill(board: Cell[], startIndex: number, rows: number, cols: number): Cell[] {
    const newBoard = board.map(cell => ({ ...cell }));
    const queue: number[] = [startIndex];
    const visited = new Set<number>([startIndex]);

    while (queue.length > 0) {
        const currentIndex = queue.shift()!;
        const currentRow = Math.floor(currentIndex / cols);
        const currentCol = currentIndex % cols;
        newBoard[currentIndex].revealed = true;

        for (const [dr, dc] of DIRECTIONS) {
            const nr = currentRow + dr;
            const nc = currentCol + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            const ni = nr * cols + nc;
            if (visited.has(ni)) continue;
            visited.add(ni);
            const neighbor = newBoard[ni];
            if (neighbor.mine || neighbor.flagged) continue;
            if (neighbor.neighborMines > 0) {
                neighbor.revealed = true;
                continue;
            }
            queue.push(ni);
        }
    }
    return newBoard;
}

function checkWin(board: Cell[], minesCount: number): boolean {
    const revealedCount = board.filter(c => c.revealed).length;
    return revealedCount === board.length - minesCount;
}

const NUMBER_COLORS: Record<number, string> = {
    1: '#0000FF', 2: '#008000', 3: '#FF0000', 4: '#000080',
    5: '#800000', 6: '#008080', 7: '#000000', 8: '#808080',
};

// ============================================================================
// COMPONENTE LCD DISPLAY
// ============================================================================
// Formata número com 3 dígitos (ex: 5 → "005", -2 → "-02")
function LcdDisplay({ value }: { value: number }) {
    const clamped = Math.max(-99, Math.min(999, value));
    const text = clamped < 0
        ? '-' + String(Math.abs(clamped)).padStart(2, '0')
        : String(clamped).padStart(3, '0');

    return <div className={styles.lcdDisplay}>{text}</div>;
}

export default function MinesweeperApp() {
    const isMobile = useSystemStore(state => state.isMobile);
    const { instanceId } = useWindowContext();
    const updateWindowSize = useWindowStore(state => state.updateWindowSize);

    const [diffKey, setDiffKey] = useState<string>('beginner');
    // Configuração inicial baseada no modo (mobile ou desktop)
    const [config, setConfig] = useState<Difficulty>(DIFFICULTIES['beginner']);
    const [cellSize, setCellSize] = useState(isMobile ? 32 : 24);

    const [board, setBoard] = useState<Cell[]>(() => createEmptyBoard(config.rows, config.cols));
    const [gameState, setGameState] = useState<GameState>('idle');
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Inicia o timer
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimer(0);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev >= 999) return 999; // LCD máximo
                return prev + 1;
            });
        }, 1000);
    }, []);

    // Para o timer
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Reiniciar jogo
    const resetGame = useCallback(() => {
        stopTimer();
        setBoard(createEmptyBoard(config.rows, config.cols));
        setGameState('idle');
        setTimer(0);
    }, [config, stopTimer]);

    // Recalcula configuração baseada na dificuldade e modo (mobile/desktop)
    const calculateResponsiveConfig = useCallback((key: string, mobile: boolean) => {
        const baseDiff = DIFFICULTIES[key];

        // Desktop: usa configuração fixa (hardcoded)
        if (!mobile) {
            return { config: baseDiff, cellSize: 24 };
        }

        // Mobile: recalcula para caber na tela
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Margens aproximadas: 20px laterais, 180px verticais (header, taskbar, win chrome)
        const maxCols = Math.floor((winW - 20) / 32);
        const maxRows = Math.floor((winH - 180) / 32);

        // Clampa as colunas/linhas
        const cols = Math.min(baseDiff.cols, maxCols);

        // Mantém a densidade de minas
        const density = baseDiff.mines / (baseDiff.rows * baseDiff.cols);

        let rows = baseDiff.rows;
        rows = Math.min(rows, maxRows);

        const mines = Math.max(3, Math.floor(rows * cols * density)); // Mínimo 3 minas

        return {
            config: { label: baseDiff.label, rows, cols, mines },
            cellSize: 32
        };
    }, []);

    // Calcula tamanho da janela do programa (OS window)
    const calcWindowSize = useCallback((d: Difficulty, cSize: number) => ({
        width: d.cols * cSize + 42,
        height: d.rows * cSize + 130, // Header + borders
    }), []);

    // Trocar dificuldade — redimensiona a janela!
    const changeDifficulty = useCallback((key: string) => {
        setDiffKey(key); // This will trigger the useEffect below
    }, []);

    // Efeito para ajustar ao resize/mudança de dificuldade
    useEffect(() => {
        const result = calculateResponsiveConfig(diffKey, isMobile);

        setConfig(result.config);
        setCellSize(result.cellSize);
        setBoard(createEmptyBoard(result.config.rows, result.config.cols));
        setGameState('idle');
        setTimer(0);
        if (timerRef.current) clearInterval(timerRef.current);

    }, [diffKey, isMobile, calculateResponsiveConfig]);

    // Atualiza tamanho da janela sempre que config mudar
    useEffect(() => {
        updateWindowSize(instanceId, calcWindowSize(config, cellSize));
    }, [config, cellSize, instanceId, updateWindowSize, calcWindowSize]);

    // Limpa timer ao desmontar
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Clique esquerdo
    const handleCellClick = useCallback((row: number, col: number) => {
        if (gameState === 'won' || gameState === 'lost') return;
        const index = row * config.cols + col;

        setBoard(prev => {
            if (prev[index].revealed || prev[index].flagged) return prev;

            let currentBoard = prev;

            if (gameState === 'idle') {
                currentBoard = placeMines(prev, index, config.rows, config.cols, config.mines);
                setGameState('playing');
                startTimer();
            }

            const cell = currentBoard[index];

            if (cell.mine) {
                const lostBoard = currentBoard.map(c => ({
                    ...c,
                    revealed: c.mine ? true : c.revealed,
                }));
                setGameState('lost');
                stopTimer();
                return lostBoard;
            }

            if (cell.neighborMines > 0) {
                const newBoard = currentBoard.map(c => ({ ...c }));
                newBoard[index].revealed = true;
                if (checkWin(newBoard, config.mines)) {
                    setGameState('won');
                    stopTimer();
                }
                return newBoard;
            }

            const newBoard = floodFill(currentBoard, index, config.rows, config.cols);
            if (checkWin(newBoard, config.mines)) {
                setGameState('won');
                stopTimer();
            }
            return newBoard;
        });
    }, [gameState, config, startTimer, stopTimer]);

    // Clique direito — bandeira
    const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        if (gameState === 'won' || gameState === 'lost' || gameState === 'idle') return;
        const index = row * config.cols + col;

        setBoard(prev => {
            if (prev[index].revealed) return prev;
            const newBoard = prev.map(c => ({ ...c }));
            newBoard[index].flagged = !newBoard[index].flagged;
            return newBoard;
        });
    }, [gameState, config.cols]);

    const flagCount = board.filter(c => c.flagged).length;

    const renderCellContent = (cell: Cell) => {
        if (cell.flagged && !cell.revealed) return <span>🚩</span>;
        if (!cell.revealed) return null;
        if (cell.mine) return <span>💣</span>;
        if (cell.neighborMines > 0) {
            return (
                <span style={{ color: NUMBER_COLORS[cell.neighborMines] }}>
                    {cell.neighborMines}
                </span>
            );
        }
        return null;
    };

    return (
        <div
            className={styles.minesweeperContainer}
            style={{ '--cell-size': `${cellSize}px` } as React.CSSProperties}
        >
            {/* Seletor de dificuldade */}
            <div className={styles.difficultyBar}>
                {Object.entries(DIFFICULTIES).map(([key, d]) => (
                    <button
                        key={key}
                        className={`${styles.diffButton} ${key === diffKey ? styles.diffButtonActive : ''}`}
                        onClick={() => changeDifficulty(key)}
                    >
                        {d.label}
                    </button>
                ))}
            </div>

            <div className={styles.gamePanel}>
                {/* Header: LCD minas | Smiley | LCD timer */}
                <div className={styles.header}>
                    <LcdDisplay value={config.mines - flagCount} />
                    <button className={styles.resetButton} onClick={resetGame}>
                        {gameState === 'lost' ? '😵' : gameState === 'won' ? '�' : '🙂'}
                    </button>
                    <LcdDisplay value={timer} />
                </div>

                {/* Grid */}
                <div
                    className={styles.grid}
                    style={{
                        gridTemplateColumns: `repeat(${config.cols}, var(--cell-size))`,
                        gridTemplateRows: `repeat(${config.rows}, var(--cell-size))`,
                    }}
                >
                    {board.map((cell, index) => {
                        const row = Math.floor(index / config.cols);
                        const col = index % config.cols;
                        const isExploded = gameState === 'lost' && cell.mine && cell.revealed && !cell.flagged;

                        return (
                            <button
                                key={`${row}-${col}`}
                                className={`${cell.revealed ? styles.cellRevealed : styles.cell} ${isExploded ? styles.cellExploded : ''}`}
                                onClick={() => handleCellClick(row, col)}
                                onContextMenu={(e) => handleRightClick(e, row, col)}
                            >
                                {renderCellContent(cell)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
