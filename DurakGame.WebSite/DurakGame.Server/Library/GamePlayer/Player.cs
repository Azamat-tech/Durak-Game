﻿using System;
using System.Collections.Generic;

using DurakGame.Library.GameCard;

namespace DurakGame.Library.GamePlayer
{
    public class Player
    {
        public string name;

        // private Icon icon;

        private List<Card> playersHand = new List<Card>();

        public List<Card> GetPlayersHand() => playersHand;

        public void AddCardsToHand(List<Card> cards)
        {
            for (int i = 0; i < cards.Count; i++)
            {
                playersHand.Add(cards[i]);
            }
        }

        public void RemoveCardFromHand(Card card)
        {
            playersHand.Remove(card);
        }

        public void PrintCards()
        {
            foreach (Card c in playersHand)
            {
                Console.WriteLine("The rank : " + c.GetRank() + ". The suit : " + c.GetSuit());
            }
        }
    }
}
