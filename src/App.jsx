import { useState, useEffect } from "react";
// eslint-disable-next-line
import { AnimatePresence, motion } from "framer-motion";
import { sampleCards } from "./sampleData";
import "./App.css";

function getHiddenCardsFromCookie() {
  const match = document.cookie.match(/hiddenCards=([^;]*)/);
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return [];
    }
  }
  return [];
}

function setHiddenCardsCookie(hiddenCards) {
  document.cookie = `hiddenCards=${encodeURIComponent(
    JSON.stringify(hiddenCards)
  )};path=/;max-age=31536000`;
}

function App() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [viewedCards, setViewedCards] = useState(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hiddenCards, setHiddenCards] = useState(getHiddenCardsFromCookie());

  // Load sample data on component mount
  useEffect(() => {
    setCards(sampleCards);
  }, []);

  // Save hidden cards to cookies whenever they change
  useEffect(() => {
    setHiddenCardsCookie(hiddenCards);
  }, [hiddenCards]);

  const handleCardClick = (card) => {
    if (viewedCards.has(card.id)) {
      setViewedCards((prev) => {
        const newViewedCards = new Set(prev);
        newViewedCards.delete(card.id);
        return newViewedCards;
      });
    } else {
      setSelectedCard(card);
      setViewedCards((prev) => new Set(prev).add(card.id));
    }
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  // Group cards by rarity (reverse order for Base at the bottom)
  const rarityOrder = ["Mythic", "Advanced", "Skilled", "Base"];
  const groupedCards = rarityOrder
    .map((rarity) => ({
      rarity,
      cards: cards.filter(
        (card) => card.rarity === rarity && !hiddenCards.includes(card.id)
      ),
    }))
    .filter((group) => group.cards.length > 0);

  // Settings menu logic
  const allCards = cards;
  const toggleCardVisible = (id) => {
    setHiddenCards((prev) =>
      prev.includes(id) ? prev.filter((hid) => hid !== id) : [...prev, id]
    );
  };

  return (
    <div className="app">
      <button
        className="settings-cog"
        aria-label="Settings"
        onClick={() => setSettingsOpen((o) => !o)}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="14"
            cy="14"
            r="13"
            stroke="#bbb"
            strokeWidth="2"
            fill="#f7f7f7"
          />
          <path
            d="M14 9.5A4.5 4.5 0 1 1 9.5 14 4.5 4.5 0 0 1 14 9.5m0-2A6.5 6.5 0 1 0 20.5 14 6.5 6.5 0 0 0 14 7.5z"
            fill="#bbb"
          />
        </svg>
      </button>
      {settingsOpen && (
        <div className="settings-menu">
          <div className="settings-title">Show Cards</div>
          <div className="settings-list">
            {rarityOrder.map((rarity) => {
              const rarityCards = allCards.filter(
                (card) => card.rarity === rarity
              );
              if (rarityCards.length === 0) return null;

              return (
                <div key={rarity} className="settings-rarity-group">
                  <div
                    className={`settings-rarity-separator rarity-${rarity.toLowerCase()}`}
                  >
                    {rarity}
                  </div>
                  {rarityCards.map((card) => (
                    <label key={card.id} className="settings-checkbox">
                      <input
                        type="checkbox"
                        checked={!hiddenCards.includes(card.id)}
                        onChange={() => toggleCardVisible(card.id)}
                      />
                      <span>{card.title}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          <button
            className="settings-close"
            onClick={() => setSettingsOpen(false)}
          >
            Close
          </button>
        </div>
      )}
      <div className="cards-grid">
        <AnimatePresence>
          {groupedCards.map((group) => (
            <div key={group.rarity} className="rarity-group">
              <div
                className={`rarity-separator rarity-${group.rarity.toLowerCase()}`}
              >
                <span className="rarity-separator-label">{group.rarity}</span>
              </div>
              {group.cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onCardClick={handleCardClick}
                  isViewed={viewedCards.has(card.id)}
                />
              ))}
            </div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {selectedCard && (
          <Modal card={selectedCard} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ card, onClose }) {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: {
      scale: 0.5,
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
  };

  return (
    <motion.div
      className="modal-backdrop"
      onClick={onClose}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Card card={card} isModal={true} />
      </motion.div>
    </motion.div>
  );
}

function Card({ card, onCardClick, isModal, isViewed }) {
  const isFlipped = isModal || isViewed;
  const isShiny = card.shiny;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Base":
        return "#b0b0b0";
      case "Skilled":
        return "#4CAF50";
      case "Advanced":
        return "#2196F3";
      case "Mythic":
        return "#FF9800";
      default:
        return "#b0b0b0";
    }
  };

  const formatEffect = (value) => {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return "0";
  };

  const handleCardClick = () => {
    if (isModal) return;
    onCardClick(card);
  };

  return (
    <div
      className={`card-container${isModal ? " is-modal" : ""}${
        isShiny ? " shiny" : ""
      }`}
    >
      <div
        className="card"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <div
          className="card-inner"
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s",
          }}
        >
          <div className="card-front">
            <div className="card-image-grayscale">
              <img src={card.image} alt="Card back" />
            </div>
            <div
              className={`card-rarity card-rarity-back rarity-${card.rarity.toLowerCase()}`}
              style={{
                backgroundColor: getRarityColor(card.rarity),
                position: "absolute",
                top: 10,
                right: 10,
              }}
            >
              {card.rarity}
            </div>
            {isShiny && (
              <span
                className="shiny-star"
                aria-label="Shiny card"
                title="Shiny card"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="11,2 13.5,8.5 20.5,9 15,13.5 16.5,20.5 11,16.5 5.5,20.5 7,13.5 1.5,9 8.5,8.5"
                    fill="#ffd700"
                    stroke="#fff"
                    stroke-width="2"
                  />
                </svg>
              </span>
            )}
          </div>
          <div className="card-back">
            <div className="card-header">
              <div className="card-title">{card.title}</div>
              <div
                className={`card-rarity rarity-${card.rarity.toLowerCase()}`}
                style={{ backgroundColor: getRarityColor(card.rarity) }}
              >
                {card.rarity}
              </div>
              {isShiny && (
                <span
                  className="shiny-star"
                  aria-label="Shiny card"
                  title="Shiny card"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polygon
                      points="11,2 13.5,8.5 20.5,9 15,13.5 16.5,20.5 11,16.5 5.5,20.5 7,13.5 1.5,9 8.5,8.5"
                      fill="#ffd700"
                      stroke="#fff"
                      stroke-width="2"
                    />
                  </svg>
                </span>
              )}
            </div>
            <div className="card-image card-image-square">
              <img src={card.image} alt={card.title} />
            </div>
            <div className="card-content">
              <p>{card.content}</p>
            </div>
            <div className="card-effects">
              <h4>Effects:</h4>
              <div className="effects-grid">
                <div className="effect-item">
                  <span className="effect-label">Engagement</span>
                  <span
                    className={`effect-value ${
                      card.effects.engagement > 0
                        ? "positive"
                        : card.effects.engagement < 0
                        ? "negative"
                        : "neutral"
                    }`}
                  >
                    {formatEffect(card.effects.engagement)}
                  </span>
                </div>
                <div className="effect-item">
                  <span className="effect-label">Composure</span>
                  <span
                    className={`effect-value ${
                      card.effects.composure > 0
                        ? "positive"
                        : card.effects.composure < 0
                        ? "negative"
                        : "neutral"
                    }`}
                  >
                    {formatEffect(card.effects.composure)}
                  </span>
                </div>
                <div className="effect-item">
                  <span className="effect-label">Clarity</span>
                  <span
                    className={`effect-value ${
                      card.effects.clarity > 0
                        ? "positive"
                        : card.effects.clarity < 0
                        ? "negative"
                        : "neutral"
                    }`}
                  >
                    {formatEffect(card.effects.clarity)}
                  </span>
                </div>
                <div className="effect-item">
                  <span className="effect-label">Adaptability</span>
                  <span
                    className={`effect-value ${
                      card.effects.adaptability > 0
                        ? "positive"
                        : card.effects.adaptability < 0
                        ? "negative"
                        : "neutral"
                    }`}
                  >
                    {formatEffect(card.effects.adaptability)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
