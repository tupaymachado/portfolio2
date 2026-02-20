import type { Card, Suits } from "../logic/Card";
import { getCardColor } from "../logic/cardUtils";
import { FaceCardArt } from "./FaceCardArt";
import styles from "./CardView.module.css";

const suitSymbols: Record<Suits, string> = {
    hearts: '♥',
    diamonds: '♦',
    spades: '♠',
    clubs: '♣',
};

const FACE_RANKS = new Set(['K', 'Q', 'J']);

export function CardView({ card }: { card: Card }) {
    if (!card.faceUp) {
        return <div className={`${styles.card} ${styles.faceDown}`} />;
    }

    const color = getCardColor(card);
    const symbol = suitSymbols[card.suit] ?? '?';
    const isFace = FACE_RANKS.has(String(card.rank));

    return (
        <div className={`${styles.card} ${styles[color]}`}>
            <span className={styles.cornerTopLeft}>
                <span className={styles.rank}>{card.rank}</span>
                <span className={styles.suit}>{symbol}</span>
            </span>

            {isFace ? (
                <span className={styles.faceArt}>
                    <FaceCardArt
                        rank={card.rank as 'K' | 'Q' | 'J'}
                        suit={card.suit}
                        color={color}
                    />
                </span>
            ) : (
                <span className={styles.centerSuit}>{symbol}</span>
            )}

            <span className={styles.cornerBottomRight}>
                <span className={styles.rank}>{card.rank}</span>
                <span className={styles.suit}>{symbol}</span>
            </span>
        </div>
    );
}

export default CardView;