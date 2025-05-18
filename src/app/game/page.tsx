"use client";
import "./game-immersive.css";
import { Button, Typography, Card as AntCard } from "antd";
import { useState } from "react";
import { createDeck, Card } from "@/utils/blackjack";
import { calculateScore, determineWinner } from "@/utils/blackjacklogic";
import { dealerTurn } from "@/utils/dealerlogic";

// const { Title, Text } = Typography;

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GamePage() {
  // Add bank and bet selection state
  const [bank, setBank] = useState<number>(1000);
  const [bet, setBet] = useState<number>(0);
  const [betSelection, setBetSelection] = useState<number[]>([]); // array of selected chips
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [playerTurn, setPlayerTurn] = useState(true);

  // Predefined bet options
  const betOptions: number[] = [10, 20, 50, 100];

  // Place bet and deal initial cards
  const handleStartGame = () => {
    if (bet === 0 || bet > bank) return;
    setBank((prev) => prev - bet);

    // Deal two cards to player and dealer
    const shuffled = shuffleDeck(createDeck());
    const initialPlayerHand = [shuffled[0], shuffled[2]];
    const initialDealerHand = [shuffled[1], shuffled[3]];
    setDeck(shuffled.slice(4));
    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);

    // Blackjack detection
    const playerScore = calculateScore(initialPlayerHand);
    const dealerScore = calculateScore(initialDealerHand);

    if (playerScore === 21 && dealerScore === 21) {
      setWinner("It's a Tie! Both have Blackjack.");
      setGameOver(true);
      setPlayerTurn(false);
      setBank((prev) => prev + bet); // refund bet
    } else if (playerScore === 21) {
      setWinner("Player Wins with Blackjack!");
      setGameOver(true);
      setPlayerTurn(false);
      setBank((prev) => prev + bet * 2);
    } else if (dealerScore === 21) {
      setWinner("Dealer Wins with Blackjack!");
      setGameOver(true);
      setPlayerTurn(false);
      // bet already subtracted
    } else {
      setGameOver(false);
      setWinner(null);
      setPlayerTurn(true);
    }
  };

  // Player draws a card
  const handleHit = () => {
    if (!playerTurn || gameOver || deck.length === 0 || bet === null) return;
    const card = deck[0];
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));
    if (calculateScore(newHand) > 21) {
      setGameOver(true);
      setWinner("Dealer Wins! Player Busted.");
      setPlayerTurn(false);
      // No balance change needed, bet already deducted
    }
  };

  // Player ends turn, dealer plays
  const handleStand = () => {
    setPlayerTurn(false);
    const { updatedDeck, updatedDealerHand } = dealerTurn(deck, dealerHand);
    setDeck(updatedDeck);
    setDealerHand(updatedDealerHand);
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(updatedDealerHand);
    const result = determineWinner(playerScore, dealerScore);
    setGameOver(true);
    setWinner(result);
    if (result.startsWith("Player Wins")) {
      setBank((prev) => prev + bet * 2);
    } else if (result.startsWith("It's a Tie")) {
      setBank((prev) => prev + bet);
    }
    // On loss, bet is already subtracted
  };

  // Reset bet selection
  const handleResetBet = () => {
    setBet(0);
    setBetSelection([]);
  };

  // Add chip to bet (accumulate chips, don't start game)
  const handleAddChip = (amount: number) => {
    if (bet + amount > bank) return;
    setBet((prev) => prev + amount);
    setBetSelection((prev) => [...prev, amount]);
  };

  // Remove chip from bet
  const handleRemoveChip = (idx: number) => {
    const removed = betSelection[idx];
    setBet((prev) => prev - removed);
    setBetSelection((prev) => prev.filter((_, i) => i !== idx));
  };

  // Restart game and reset bet
  const handleRestart = () => {
    setDeck(shuffleDeck(createDeck()));
    setPlayerHand([]);
    setDealerHand([]);
    setGameOver(false);
    setWinner(null);
    setPlayerTurn(true);
    setBet(0);
    setBetSelection([]);
  };

  // Helper to render a card visually
  function renderCard(card: Card, idx: number, hidden = false) {
    if (hidden) {
      return (
        <div
          className="card-visual"
          key={idx}
          style={{
            background:
              "repeating-linear-gradient(135deg, #bbb 0 8px, #eee 8px 16px)",
            color: "#bbb",
            zIndex: 1,
          }}
        >
          <div className="corner top">?</div>
          <div className="corner bottom">?</div>
          <div className="suit">?</div>
        </div>
      );
    }
    const isRed = card.suit === "♥" || card.suit === "♦";
    return (
      <div
        className={`card-visual ${isRed ? "red" : "black"}`}
        key={idx}
        style={{ zIndex: 1 }}
      >
        <div className="corner top">
          {card.value} <span>{card.suit}</span>
        </div>
        <div className="corner bottom">
          {card.value} <span>{card.suit}</span>
        </div>
        <div className="suit">{card.suit}</div>
      </div>
    );
  }

  // Track if dealer's hand is revealed
  // const dealerRevealed = !playerTurn || gameOver;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="bg-immersive" />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          position: "relative",
        }}
      >
        <AntCard
          style={{
            width: 480,
            maxWidth: "98vw",
            background: "rgba(30,32,36,0.92)",
            borderRadius: 22,
            boxShadow: "0 12px 48px 0 rgba(31, 38, 135, 0.37)",
            padding: 36,
            border: "1.5px solid #222",
            backdropFilter: "blur(2px)",
          }}
          bordered={false}
        >
          <div style={{ textAlign: "center" }}>
            <Typography.Title
              level={2}
              style={{
                color: "#fff",
                marginBottom: 0,
                letterSpacing: 1,
                fontWeight: 800,
                textShadow: "0 2px 8px #0008",
              }}
            >
              Blackjack
            </Typography.Title>
            <Typography.Text style={{ color: "#ffd700", fontSize: 18, fontWeight: 700, marginTop: 8, display: 'block' }}>
              Bank: ${bank}
            </Typography.Text>
          </div>
          {/* Bet selection UI: only show if game not started (playerHand.length === 0 && dealerHand.length === 0) */}
          {playerHand.length === 0 && dealerHand.length === 0 && (
            <div style={{ margin: "32px 0 24px 0", textAlign: "center" }}>
              <Typography.Text
                style={{
                  color: "#fff",
                  fontWeight: 500,
                  marginBottom: 16,
                  display: "block",
                  fontSize: 18,
                }}
              >
                Choose your bet:
              </Typography.Text>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
                {betOptions.map((amount) => (
                  <Button
                    key={amount}
                    shape="circle"
                    size="large"
                    onClick={() => handleAddChip(amount)}
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 22,
                      fontWeight: 700,
                      background: "linear-gradient(145deg, #f5f5f5 0%, #e0e0e0 100%)",
                      boxShadow: "0 6px 18px 0 #0004, 0 2px 8px #fff8 inset",
                      border: "2.5px solid #ffd700",
                      color: "#222",
                      margin: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              {/* Show selected chips */}
              {betSelection.length > 0 && (
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {betSelection.map((chip, idx) => (
                    <Button
                      key={idx}
                      shape="circle"
                      size="large"
                      onClick={() => handleRemoveChip(idx)}
                      style={{
                        width: 48,
                        height: 48,
                        fontSize: 18,
                        fontWeight: 700,
                        background: "linear-gradient(145deg, #ffd700 0%, #fffbe6 100%)",
                        boxShadow: "0 2px 8px 0 #0002, 0 1px 4px #fff8 inset",
                        border: "2px solid #e0c200",
                        color: "#222",
                        margin: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      ${chip}
                    </Button>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
                <Button
                  onClick={handleResetBet}
                  size="large"
                  style={{
                    borderRadius: 32,
                    background: "#222",
                    color: "#fff",
                    fontWeight: 600,
                    boxShadow: "0 2px 8px #0006",
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={bet === 0}
                  onClick={handleStartGame}
                  style={{
                    borderRadius: 32,
                    background: "linear-gradient(145deg, #ffd700 0%, #fffbe6 100%)",
                    color: "#222",
                    fontWeight: 700,
                    boxShadow: "0 4px 16px #ffd70088",
                  }}
                >
                  Start Game
                </Button>
              </div>
            </div>
          )}
          {/* Dealer's Hand: show first card, second card hidden unless dealerRevealed */}
          {playerHand.length > 0 && (
            <div style={{ margin: "32px 0 18px 0" }}>
              <div
                style={{
                  color: "#aaa",
                  fontWeight: 500,
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                Dealers Hand
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                {dealerHand.map((card, idx) =>
                  idx === 1 && !(gameOver || !playerTurn)
                    ? renderCard(card, idx, true)
                    : renderCard(card, idx)
                )}
              </div>
              <div
                style={{
                  color: "#ffd700",
                  fontWeight: 700,
                  fontSize: 18,
                  marginTop: 0,
                }}
              >
                Score: {gameOver || !playerTurn
                  ? calculateScore(dealerHand)
                  : dealerHand.length > 0
                  ? calculateScore([dealerHand[0]]) + " + ?"
                  : 0}
              </div>
            </div>
          )}
          {/* Player's Hand */}
          {playerHand.length > 0 && (
            <div style={{ margin: "32px 0 18px 0" }}>
              <div
                style={{
                  color: "#aaa",
                  fontWeight: 500,
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                Players Hand
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                {playerHand.map((card, idx) => renderCard(card, idx))}
              </div>
              <div
                style={{
                  color: "#ffd700",
                  fontWeight: 700,
                  fontSize: 18,
                  marginTop: 0,
                }}
              >
                Score: {calculateScore(playerHand)}
              </div>
            </div>
          )}
          {/* Only show Hit/Stand if game is in progress (playerHand.length > 0 && !gameOver) */}
          {playerHand.length > 0 && !gameOver && (
            <div style={{ margin: "28px 0 0 0", textAlign: "center" }}>
              <Button
                type="default"
                size="large"
                onClick={handleHit}
                disabled={gameOver || !playerTurn}
                style={{
                  marginRight: 12,
                  fontWeight: 600,
                  paddingLeft: 24,
                  paddingRight: 24,
                }}
              >
                Hit
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleStand}
                disabled={gameOver || !playerTurn}
                style={{ fontWeight: 600, paddingLeft: 24, paddingRight: 24 }}
              >
                Stand
              </Button>
            </div>
          )}
          {/* End result screen: show different styles for win/lose/tie */}
          {winner && (
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <div
                style={{
                  color: winner.includes("Player Wins")
                    ? "#52c41a"
                    : winner.includes("Dealer Wins")
                    ? "#ff4d4f"
                    : "#ffd700",
                  fontWeight: 700,
                  fontSize: 26,
                  margin: "18px 0 8px 0",
                  textShadow: winner.includes("Player Wins")
                    ? "0 2px 12px #52c41a88"
                    : winner.includes("Dealer Wins")
                    ? "0 2px 12px #ff4d4f88"
                    : "0 2px 12px #ffd70088",
                  letterSpacing: 1.2,
                  borderRadius: 12,
                  padding: "16px 0 10px 0",
                  background:
                    winner.includes("Player Wins")
                      ? "linear-gradient(90deg, #eaffd0 0%, #b6fcb6 100%)"
                      : winner.includes("Dealer Wins")
                      ? "linear-gradient(90deg, #ffeaea 0%, #ffd6d6 100%)"
                      : "linear-gradient(90deg, #fffbe6 0%, #fffbe6 100%)",
                  border:
                    winner.includes("Player Wins")
                      ? "2px solid #52c41a"
                      : winner.includes("Dealer Wins")
                      ? "2px solid #ff4d4f"
                      : "2px solid #ffd700",
                  boxShadow:
                    winner.includes("Player Wins")
                      ? "0 4px 24px #52c41a33"
                      : winner.includes("Dealer Wins")
                      ? "0 4px 24px #ff4d4f33"
                      : "0 4px 24px #ffd70033",
                  transition: "all 0.2s",
                }}
              >
                {winner.includes("Player Wins") && (
                  <>
                    <span role="img" aria-label="win">🏆</span> <b>Congratulations!</b> <br />
                    <span style={{ fontSize: 20 }}>{winner}</span>
                  </>
                )}
                {winner.includes("Dealer Wins") && (
                  <>
                    <span role="img" aria-label="lose">💀</span> <b>Better luck next time!</b> <br />
                    <span style={{ fontSize: 20 }}>{winner}</span>
                  </>
                )}
                {winner.includes("Tie") && (
                  <>
                    <span role="img" aria-label="tie">🤝</span> <b>Its a Tie!</b> <br />
                    <span style={{ fontSize: 20 }}>{winner}</span>
                  </>
                )}
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleRestart}
                style={{ fontWeight: 600, marginTop: 16 }}
              >
                Play Again
              </Button>
            </div>
          )}
        </AntCard>
      </div>
    </div>
  );
}
