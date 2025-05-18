import {Card} from "@/utils/blackjack";
import {calculateScore} from "@/utils/blackjacklogic";

// Function for the dealer to play their turn

export function dealerTurn(deck: Card[], dealerHand: Card[]): {updatedDeck: Card[]; updatedDealerHand: Card[]} {
    const hand = [...dealerHand];
    const remainingDeck = [...deck];

    while (calculateScore(hand)< 17) {
        const drawnCard = remainingDeck.shift();
        if (drawnCard) hand.push(drawnCard);
    }

    return {updatedDeck : remainingDeck , updatedDealerHand : hand};
}