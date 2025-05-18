"use client";
import { InputNumber, Button, Typography, Card as AntCard } from "antd";
import { useState } from "react";
import { createDeck, Card } from "@/utils/blackjack";
import { calculateScore, determineWinner } from "@/utils/blackjacklogic";
import { dealerTurn } from "@/utils/dealerlogic";

const { Title, Text } = Typography;

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GamePage() {
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [playerTurn, setPlayerTurn] = useState(true);

  // Betting state
  const [bet, setBet] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(1000); // Starting balance
  const [betInput, setBetInput] = useState<string>("");

  // Place bet and deal initial cards
  const handlePlaceBet = () => {
    const betAmount = parseInt(betInput, 10);
    if (
      isNaN(betAmount) ||
      betAmount < 10 ||
      betAmount > 100 ||
      betAmount > balance
    ) {
      alert(
        "Bet must be a number between 10 and 100, and not more than your balance."
      );
      return;
    }
    setBet(betAmount);
    setBalance(balance - betAmount);

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
      setBalance((b) => (b !== null && betAmount ? b + betAmount : b)); // Refund bet
      setPlayerTurn(false);
    } else if (playerScore === 21) {
      setWinner("Player Wins with Blackjack!");
      setGameOver(true);
      setBalance((b) => (b !== null && betAmount ? b + betAmount * 2.5 : b)); // Blackjack pays 3:2
      setPlayerTurn(false);
    } else if (dealerScore === 21) {
      setWinner("Dealer Wins with Blackjack!");
      setGameOver(true);
      setPlayerTurn(false);
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

    // Balance logic
    if (result.startsWith("Player Wins")) {
      setBalance((b) => (b !== null && bet !== null ? b + bet * 2 : b));
    } else if (result.startsWith("It's a Tie")) {
      setBalance((b) => (b !== null && bet !== null ? b + bet : b));
    }
    // If dealer wins, bet is already deducted
  };

  // Restart game and reset bet
  const handleRestart = () => {
    setDeck(shuffleDeck(createDeck()));
    setPlayerHand([]);
    setDealerHand([]);
    setGameOver(false);
    setWinner(null);
    setPlayerTurn(true);
    setBet(null);
    setBetInput("");
  };

  // Game over if balance is zero
  const isBankrupt = balance < 10;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <Title level={1} style={{ color: "#fff" }}>
        Blackjack Game
      </Title>
      <Text style={{ color: "#ccc" }}>Balance: ${balance}</Text>
      {isBankrupt && (
        <AntCard style={{ margin: "16px 0", background: "#ffeded" }}>
          <Text type="danger">Game Over! You ran out of money.</Text>
        </AntCard>
      )}
      {!isBankrupt && bet === null ? (
        <div>
          <InputNumber
            min={10}
            max={Math.min(100, balance)}
            placeholder="Enter your bet"
            value={betInput ? Number(betInput) : undefined}
            onChange={(value) => setBetInput(value ? value.toString() : "")}
          />
          <Button
            type="primary"
            onClick={handlePlaceBet}
            style={{ marginLeft: 8 }}
          >
            Place Bet
          </Button>
        </div>
      ) : null}
      {!isBankrupt && bet !== null && (
        <>
          <p>Current Bet: ${bet}</p>
          <AntCard title="Player's Hand" style={{ marginBottom: 16 }}>
            <ul>
              {playerHand.map((card, i) => (
                <li key={i}>
                  {card.value} of {card.suit}
                </li>
              ))}
            </ul>
            <p>Score: {calculateScore(playerHand)}</p>
            {!gameOver && playerTurn && (
              <>
                <Button onClick={handleHit} style={{ marginRight: 8 }}>
                  Hit
                </Button>
                <Button onClick={handleStand}>Stand</Button>
              </>
            )}
          </AntCard>
          <AntCard title="Dealer's Hand">
            <ul>
              {dealerHand.map((card, i) => {
                if (i === 1 && playerTurn && !gameOver) {
                  return <li key={i}>Hidden Card</li>;
                }
                return (
                  <li key={i}>
                    {card.value} of {card.suit}
                  </li>
                );
              })}
            </ul>
            <p>
              Score:{" "}
              {playerTurn && !gameOver
                ? calculateScore([dealerHand[0]])
                : calculateScore(dealerHand)}
            </p>
          </AntCard>
          {gameOver && (
            <>
              <h2>{winner}</h2>
              <Button onClick={handleRestart} type="primary">
                Restart Game
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
