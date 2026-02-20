import type { Suits } from '../logic/Card';

interface FaceCardArtProps {
    rank: 'K' | 'Q' | 'J';
    suit: Suits;
    color: 'red' | 'black';
}

const suitSymbols: Record<Suits, string> = {
    hearts: '♥', diamonds: '♦', spades: '♠', clubs: '♣',
};

// ─── King ─────────────────────────────────────────
function KingSvg({ color, suit }: { color: string; suit: Suits }) {
    return (
        <svg viewBox="0 0 60 80" width="52" height="70" xmlns="http://www.w3.org/2000/svg">
            {/* Crown */}
            <polygon points="10,28 18,14 30,22 42,14 50,28" fill={color} opacity="0.85" />
            <circle cx="10" cy="28" r="3" fill={color} />
            <circle cx="30" cy="22" r="3" fill={color} />
            <circle cx="50" cy="28" r="3" fill={color} />
            {/* Crown base bar */}
            <rect x="9" y="26" width="42" height="6" rx="2" fill={color} opacity="0.7" />
            {/* Head */}
            <ellipse cx="30" cy="42" rx="11" ry="13" fill="#f5e6c8" stroke={color} strokeWidth="1.2" />
            {/* Eyes */}
            <ellipse cx="25" cy="40" rx="2" ry="2.5" fill={color} opacity="0.7" />
            <ellipse cx="35" cy="40" rx="2" ry="2.5" fill={color} opacity="0.7" />
            {/* Beard */}
            <path d="M20 50 Q30 58 40 50" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <path d="M22 52 Q30 60 38 52" fill={color} opacity="0.15" />
            {/* Moustache */}
            <path d="M24 47 Q30 44 36 47" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
            {/* Robe / body */}
            <path d="M18 54 Q12 70 10 78 L50 78 Q48 70 42 54" fill={color} opacity="0.15" stroke={color} strokeWidth="1" />
            {/* Collar */}
            <path d="M20 54 L30 60 L40 54" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
            {/* Scepter / orb */}
            <line x1="30" y1="60" x2="30" y2="76" stroke={color} strokeWidth="2" opacity="0.5" />
            <circle cx="30" cy="60" r="3.5" fill={color} opacity="0.5" />
            {/* Center suit */}
            <text x="30" y="76" textAnchor="middle" fontSize="9" fill={color} opacity="0.9" fontFamily="serif">{suitSymbols[suit]}</text>
        </svg>
    );
}

// ─── Queen ────────────────────────────────────────
function QueenSvg({ color, suit }: { color: string; suit: Suits }) {
    return (
        <svg viewBox="0 0 60 80" width="52" height="70" xmlns="http://www.w3.org/2000/svg">
            {/* Crown — arched style */}
            <path d="M12,28 L16,14 L30,20 L44,14 L48,28 Z" fill={color} opacity="0.85" />
            <circle cx="16" cy="14" r="2.5" fill={color} />
            <circle cx="30" cy="20" r="2.5" fill={color} />
            <circle cx="44" cy="14" r="2.5" fill={color} />
            {/* Jewel on crown */}
            <polygon points="30,18 32,22 30,26 28,22" fill="white" opacity="0.7" />
            {/* Crown base */}
            <rect x="10" y="26" width="40" height="5" rx="2" fill={color} opacity="0.7" />
            {/* Head */}
            <ellipse cx="30" cy="42" rx="10" ry="11" fill="#f5e6c8" stroke={color} strokeWidth="1.2" />
            {/* Eyes */}
            <ellipse cx="25.5" cy="41" rx="1.8" ry="2" fill={color} opacity="0.7" />
            <ellipse cx="34.5" cy="41" rx="1.8" ry="2" fill={color} opacity="0.7" />
            {/* Lips */}
            <path d="M26 47 Q30 50 34 47" fill={color} opacity="0.4" />
            {/* Hair flowing */}
            <path d="M20 36 Q14 48 16 58" fill="none" stroke={color} strokeWidth="2.5" opacity="0.35" />
            <path d="M40 36 Q46 48 44 58" fill="none" stroke={color} strokeWidth="2.5" opacity="0.35" />
            {/* Dress / bodice */}
            <path d="M18 52 Q10 66 9 78 L51 78 Q50 66 42 52" fill={color} opacity="0.15" stroke={color} strokeWidth="1" />
            {/* Collar bow */}
            <path d="M24 52 L30 56 L36 52" fill={color} opacity="0.4" />
            {/* Orb in hand */}
            <circle cx="30" cy="66" r="4" fill={color} opacity="0.35" stroke={color} strokeWidth="1" />
            {/* Center suit */}
            <text x="30" y="76" textAnchor="middle" fontSize="9" fill={color} opacity="0.9" fontFamily="serif">{suitSymbols[suit]}</text>
        </svg>
    );
}

// ─── Jack ─────────────────────────────────────────
function JackSvg({ color, suit }: { color: string; suit: Suits }) {
    return (
        <svg viewBox="0 0 60 80" width="52" height="70" xmlns="http://www.w3.org/2000/svg">
            {/* Feathered hat brim */}
            <ellipse cx="30" cy="26" rx="20" ry="5" fill={color} opacity="0.7" />
            {/* Hat top */}
            <rect x="18" y="12" width="24" height="15" rx="4" fill={color} opacity="0.85" />
            {/* Feather */}
            <path d="M42 12 Q52 6 50 2 Q46 8 40 10" fill={color} opacity="0.5" />
            {/* Hat band */}
            <rect x="18" y="22" width="24" height="4" rx="1" fill="white" opacity="0.25" />
            {/* Head */}
            <ellipse cx="30" cy="41" rx="10" ry="12" fill="#f5e6c8" stroke={color} strokeWidth="1.2" />
            {/* Eyes — cheeky expression */}
            <ellipse cx="25.5" cy="40" rx="1.8" ry="2" fill={color} opacity="0.7" />
            <ellipse cx="34.5" cy="40" rx="1.8" ry="2" fill={color} opacity="0.7" />
            {/* Smirk */}
            <path d="M26 46 Q32 50 36 46" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
            {/* Tunic / doublet */}
            <path d="M18 52 Q13 65 11 78 L49 78 Q47 65 42 52" fill={color} opacity="0.15" stroke={color} strokeWidth="1" />
            {/* Collar */}
            <path d="M20 52 L24 58 L30 54 L36 58 L40 52" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
            {/* Sword / lance diagonal */}
            <line x1="14" y1="78" x2="46" y2="52" stroke={color} strokeWidth="1.8" opacity="0.5" />
            <polygon points="46,52 44,56 48,55" fill={color} opacity="0.5" />
            {/* Center suit */}
            <text x="30" y="76" textAnchor="middle" fontSize="9" fill={color} opacity="0.9" fontFamily="serif">{suitSymbols[suit]}</text>
        </svg>
    );
}

// ─── Export ────────────────────────────────────────
export function FaceCardArt({ rank, suit, color }: FaceCardArtProps) {
    const c = color === 'red' ? '#9b2335' : '#1a1a2e';
    if (rank === 'K') return <KingSvg color={c} suit={suit} />;
    if (rank === 'Q') return <QueenSvg color={c} suit={suit} />;
    return <JackSvg color={c} suit={suit} />;
}
