import { Card } from "@/utils/blackjack";

export function calculateScore(hand: Card[]): number {
  let score = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (["Jack", "Queen", "King"].includes(card.value)) {
      score += 10; // Face cards are worth 10
    } else if (card.value === "Ace") {
      aces += 1;
      score += 11; // Aces are worth 11 initially
    } else {
      score += parseInt(card.value, 10); // Number cards are worth their value
    }
  });

  // Adjust the Aces if the score exceeds 21

  while (score > 21 && aces > 0) {
    score -= 10; // Change Ace from 11 to 1
    aces -= 1;
  }
  return score;
}

// Function to determine the winner

export function determineWinner(playerScore: number, dealerScore: number): string {
    if (playerScore > 21) return "Dealer Wins! Player Buster.";
    if (dealerScore > 21) return "Player Wins! Dealer Buster.";
    if (playerScore > dealerScore) return "Player Wins!";
    if (dealerScore > playerScore) return "Dealer Wins!";
    return "It's a Tie!";
}