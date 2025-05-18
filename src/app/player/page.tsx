"use client";
import { useState } from "react";
import { Card } from "@/utils/blackjack";
import { calculateScore } from "@/utils/blackjacklogic";

export default function PlayerPage({ deck, setDeck }: { deck: Card[]; setDeck: (deck: Card[]) => void }) {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);

  const handleHit = () => {
    if (deck.length === 0) return; // Prevent drawing if the deck is empty
    const drawnCard = deck[0]; // Draw the top card
    setPlayerHand([...playerHand, drawnCard]); // Add the card to the player's hand
    setDeck(deck.slice(1)); // Remove the drawn card from the deck
  };

  const playerScore = calculateScore(playerHand);

  return (
    <div>
      <h2>Players Hand</h2>
      <ul>
        {playerHand.map((card, index) => (
          <li key={index}>
            {card.value} of {card.suit}
          </li>
        ))}
      </ul>
      <p>Score: {playerScore}</p>
      <button onClick={handleHit}>Hit</button>
      <button>Stand</button>
    </div>
  );
}