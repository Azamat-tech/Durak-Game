export class CardView {
    constructor(canvas) {
        this.cardWidth = 100;
        this.cardHeight = 130;
        this.deckPosY = 320;
        this.dir = "images/deck/";
        this.cardImages = new Map();
        this.backCard = "2B";
        this.canvas = canvas;
        this.cardMiddleX = this.canvas.width / 2 - 100;
        this.cardLeftX = 50;
        this.cardRightX = this.canvas.width - 250;
        this.cardLowerY = this.canvas.height - this.cardHeight - 40;
        this.cardUpperY = 50;
        this.deckPosY = this.canvas.height / 2 - 90;
    }
    /*
        Returns the string from number that represents the
        rank of the card
    */
    fromIntToRank(enumRank) {
        if (4 < enumRank && enumRank < 10) {
            return enumRank.toString();
        }
        return "TJQKA"[enumRank - 10];
    }
    /*
        Returns the string from number that represents the
        suit of the card
    */
    fromIntToSuit(enumSuit) {
        return "CDHS"[enumSuit];
    }
}
//# sourceMappingURL=card.js.map