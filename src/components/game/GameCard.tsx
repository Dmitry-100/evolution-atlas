import { Shuffle } from "lucide-react";
import { CARDS, cardKind } from "../../game/content";
import { OptimizedImage } from "../ui/optimized-image";
import { CARD_ART } from "../../game/art";

export function GameCard({
  id,
  selected,
  disabled,
  canSwap,
  onSelect,
  onSwap,
}: {
  id: number;
  selected: boolean;
  disabled: boolean;
  canSwap: boolean;
  onSelect: () => void;
  onSwap: () => void;
}) {
  const kind = cardKind(id),
    card = CARDS[kind];
  return (
    <div
      className={`game-card${selected ? " is-selected" : ""}${disabled ? " is-unavailable" : ""}`}
    >
      <button
        className="islands-card-main"
        aria-label={`${card.title}, ${card.cost} ${card.cost === 1 ? "очко" : "очка"}`}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onSelect}
      >
        <span className="game-card-art">
          <OptimizedImage
            src={CARD_ART[kind]}
            alt=""
            width={600}
            height={800}
            draggable={false}
          />
        </span>
        <span className="game-card-cost" title="Стоимость действия">
          {card.cost}
        </span>
        <span className="game-card-copy">
          <strong>{card.title}</strong>
          <span>{card.description}</span>
        </span>
      </button>
      <button
        className="game-card-swap"
        aria-label={`Заменить карту «${card.title}»`}
        title={
          canSwap ? "Одна бесплатная замена за ход" : "Замена уже использована"
        }
        onClick={onSwap}
        disabled={!canSwap}
      >
        <Shuffle size={12} />
        <span>Заменить</span>
      </button>
    </div>
  );
}
