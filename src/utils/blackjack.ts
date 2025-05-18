 export type Card = {
  suit: "♥" | "♦" | "♣" | "♠";
  value: string;
};

export function createDeck() {
  const suits: ("♥" | "♦" | "♣" | "♠")[] = ["♥", "♦", "♣", "♠"]; // Explicitly type the suits array
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];
  const Deck: Card[] = [];
  for (const suit of suits) {
    for (const value of values) {
      Deck.push({ suit, value }); // Use the dynamically assigned suit
    }
  }
  return Deck;
}
