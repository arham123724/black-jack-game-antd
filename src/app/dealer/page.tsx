"use client";
import { useState } from "react";
import { Card } from "@/utils/blackjack";
import { dealerTurn } from "@/utils/dealerlogic";
import { calculateScore } from "@/utils/blackjacklogic";

export default function DealerPage({ deck, setDeck }: { deck: Card[]; setDeck: (deck: Card[]) => void }) {
  const [dealerHand, setDealerHand] = useState<Card[]>([]);

  const handleDealerTurn = () => {
    const { updatedDeck, updatedDealerHand } = dealerTurn(deck, dealerHand);
    setDeck(updatedDeck);
    setDealerHand(updatedDealerHand);
  };

  const dealerScore = calculateScore(dealerHand);

  return (
    <div>
      <h2>Dealers Hand</h2>
      <ul>
        {dealerHand.map((card, index) => (
          <li key={index}>
            {card.value} of {card.suit}
          </li>
        ))}
      </ul>
      <p>Score: {dealerScore}</p>
      <button onClick={handleDealerTurn}>Play Dealers Turn</button>
    </div>
  );
}