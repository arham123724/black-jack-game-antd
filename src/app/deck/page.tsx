"use client";
import { createDeck, Card } from "@/utils/blackjack";
import { useState } from "react";

export default function DeckPage() {
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);

  // Function to shuffle the deck

  const shuffleDeck = () => {

    //create a copy of the deck

    const shuffled = [...deck];

    //shuffle the deck using Fisher-Yates algorithm

    for (let i = shuffled.length - 1; i > 0; i--) {

      // Generate a random index

      const j = Math.floor(Math.random() * (i + 1));

      // Swap the cards

      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Function to draw cards from the deck

    const drawCards = (count: number) => {

        if (count <= 0 || count > deck.length) {
            throw new Error("Invalid count: must be between 1 and the number of cards in the deck.");
        }

        // Take the first 'count' cards
        const drawnCards = deck.slice(0,count);

        // Add the drawn cards to the player's hand
        setPlayerHand([...playerHand, ...drawnCards]);

        // Remove the drawn cards from the deck
        setDeck(deck.slice(count));
    };

    //Shuffle the deck when the page loads 
    const handleShuffle = () => {
        setDeck(shuffleDeck());

        // Reset the player's hand
        setPlayerHand([]);
    };

  return (
    <div>
      <h1>Blackjack Game</h1>

        {/* Shuffle Button */}
        <button onClick={handleShuffle}>Shuffle Deck</button>

        {/* Draw Cards Button */}
        <button onClick={()=> drawCards(2)}>Draw 2 Cards</button>

        <h2>Players Hand</h2>

      <ul>
        {playerHand.map((card, index) => (
          <li key={index}>
            {card.value} of {card.suit}
          </li>
        ))}
      </ul>

      <h2>Remaining Deck</h2>
      <p>Cards left in deck: {deck.length}</p>
    </div>
  );
}
