﻿
interface PlayerView {
    numberOfCards: number;
    isAttacking: boolean;
}

enum Rank {
    Six = 6, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace
}

enum Suit {
    Club, Diamonds, Heart, Spade
}

export interface Card {
    rank: Rank;
    suit: Suit;
}

interface GameView {
    playerID: number

    attackingPlayer: number;
    defendingPlayer: number;

    deckSize: number;
    discardHeapSize: number;
    discardHeapChanged: boolean;

    durak: number;

    hand: Card[];

    playersView: PlayerView[];
    trumpCard: Card;

    attackingCards: Card[];
    defendingCards: Card[];
}

class MousePos {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class View {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private cardWidth: number;
    private cardHeight: number;
    private cardCorner: number;

    private yourTurnStr: string = "Your Turn";
    private takeStr: string = "Take";
    private doneStr: string = "Done";
    private winnerStr: string = "Winner";
    private durakStr: string = "Durak is ";
    private mouseClickMargin: number = 7

    private cardLowerY: number;
    private cardUpperY: number;

    private cardLeftX: number;
    private cardMiddleX: number;
    private cardRightX: number;

    private deckPosX: number;
    private deckPosY: number;

    private offset: number;

    private dir: string = "images/deck/";
    private backCard: string = "2B";

    private cardImages = new Map();
    private boutCardPositions = new Map();

    private textUpperMargin: number;
    private textLeftMargin: number;

    private boxHeight: number;
    private isFirst: boolean;
    private totalCardWidth: number;

    private mousePos: MousePos;
    private gameView: GameView;

    private id: number;
    private totalPlayers: number;

    private textMetrics: TextMetrics
    private socket: WebSocket;

    private defaultWidth: number = 2510;
    private defaultFontSize: number = 20;

    private fontSize: number;

    private positionsAroundTable: { x: number, y: number, tWidth: number }[];
    private positionsAroundTableDuplicate: { x: number, y: number, tWidth: number }[];

    constructor(socket: WebSocket) {
        this.socket = socket;

        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        let context = canvas.getContext("2d");

        this.windowObjectsResize(canvas, context);

        this.mousePos = new MousePos(0, 0);

        this.isFirst = true;

        this.boutCardPositions.set(
            1, [{
                x: this.cardMiddleX,
                y: this.deckPosY
            }]);

        this.boutCardPositions.set(
            2, [
            { x: this.cardMiddleX - 2 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth, y: this.deckPosY }
        ]);

        this.boutCardPositions.set(
            3, [
            {
                x: this.cardMiddleX - 2 * this.cardWidth - this.cardWidth / 2,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX,
                y: this.deckPosY
            },
            {
                x: this.cardMiddleX + this.cardWidth + this.cardWidth / 2,
                y: this.deckPosY
            }
        ]);

        this.boutCardPositions.set(
            4, [
            { x: this.cardMiddleX - 4 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX - 2 * this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + this.cardWidth, y: this.deckPosY },
            { x: this.cardMiddleX + 2 * this.cardWidth, y: this.deckPosY }
        ]);

        this.canvas.addEventListener("click", (e) => {
            this.mousePos.x = e.x;
            this.mousePos.y = e.y;
            console.log("The mouse click at : " + this.mousePos.x + " " + this.mousePos.y)

            this.CheckMouseClick();
        });

        window.addEventListener("resize", () => this.reportWindowResize(this.canvas, this.context));

    }

    public setConnectionFields(gameView: GameView, id: number, players: number) {

        this.gameView = gameView;
        this.id = id;
        this.totalPlayers = players;


        console.log(gameView);
    }

    private reportWindowResize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        this.windowObjectsResize(canvas, context);
        this.displayStateOfTheGame();
    }

    private windowObjectsResize(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        console.log("WINDOW CHANGES");

        canvas.width = window.innerWidth - 50;
        canvas.height = window.innerHeight - 50;

        console.log(canvas.width);
        console.log(canvas.height);

        this.canvas = canvas;
        this.context = context;

        this.textUpperMargin = this.canvas.height / 60;
        this.textLeftMargin = this.canvas.width / 251;

        this.context.font = this.getFont();

        console.log(this.context.font);

        this.cardWidth = this.canvas.width / 20;
        this.cardHeight = this.cardWidth + this.cardWidth / 5;
        this.cardCorner = this.cardWidth / 4;

        this.cardMiddleX = this.canvas.width / 2;
        this.cardLeftX = this.canvas.width / 7;
        this.cardRightX = this.canvas.width / 7 * 6;

        this.boxHeight = this.fontSize + this.textUpperMargin;

        this.cardUpperY = this.canvas.height / 40;
        this.cardLowerY = this.canvas.height - this.cardHeight - this.cardUpperY - this.boxHeight;

        this.deckPosX = this.canvas.width / 7 * 0.5;
        this.deckPosY = this.canvas.height / 2 - 90;

        this.offset = this.cardHeight + this.boxHeight;

        this.positionsAroundTable = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ]

        this.positionsAroundTableDuplicate = [
            { x: this.cardMiddleX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardLowerY, tWidth: 0 },
            { x: this.cardLeftX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardMiddleX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardUpperY, tWidth: 0 },
            { x: this.cardRightX, y: this.cardLowerY, tWidth: 0 }
        ]

        this.displayPlayers();
    }

    private getFont(): string {
        let ration: number = this.defaultFontSize / this.defaultWidth;
        let size: number = this.canvas.width * ration;
        this.fontSize = size;
        return "bold " + (size | 0) + "px Serif";
    }

    private isDefending(): boolean {
        return this.gameView.defendingPlayer == this.id;
    }

    private isAttacking(): boolean {
        return this.gameView.attackingPlayer == this.id;
    }

    private drawBox(text: string, x: number, y: number, width: number, strokeStyle: string,
        textStyle: string) {
        this.textMetrics = this.context.measureText(text);

        this.context.save()

        this.context.fillStyle = textStyle;
        this.context.strokeStyle = strokeStyle;

        this.context.fillText(text, x - this.textMetrics.width / 2 + width / 2, y);
        this.context.strokeRect(x - this.textMetrics.width / 2 - this.textLeftMargin + width / 2,
            y - this.textUpperMargin, this.textMetrics.width + 2 * this.textLeftMargin,
            this.boxHeight);

        this.context.restore();
    }

    /*
        Display attacking and defending cards in the middle of the table 
    */
    public displayBout(): void {
        let pos: { x: number, y: number }[];
        let attackingCardSize: number = this.gameView.attackingCards.length;
        let defendingCardSize: number = this.gameView.defendingCards.length;

        for (let i = 0; i < attackingCardSize; i++) {
            let img: HTMLImageElement = this.cardImage(this.gameView.attackingCards[i]);
            pos = this.boutCardPositions.get(attackingCardSize % 4);

            this.context.drawImage(img, pos[i].x, pos[i].y, this.cardWidth, this.cardHeight);
        }

        for (let i = 0; i < defendingCardSize; i++) {
            let img: HTMLImageElement = this.cardImage(this.gameView.defendingCards[i]);

            this.context.drawImage(img, pos[i].x + 20, pos[i].y, this.cardWidth, this.cardHeight);
        }
    }

    /*
        Returns the index of the selected card position
    */
    private GetCardSelected(): number {
        let x: number = this.positionsAroundTable[0].x;
        let w: number = this.positionsAroundTable[0].tWidth;

        return (this.mousePos.x - x - this.mouseClickMargin) / this.cardCorner;
    }

    /*
        Check if the mouse click is within the main players hand
    */
    private isCardSelected(): boolean {
        let x: number = this.positionsAroundTable[0].x;
        let y: number = this.positionsAroundTable[0].y;
        let w: number = this.positionsAroundTable[0].tWidth;

        return x + this.mouseClickMargin < this.mousePos.x &&
            this.mousePos.x <= x + w + this.mouseClickMargin &&
            y < this.mousePos.y && this.mousePos.y <= y + this.cardHeight;
    }

    private withinTheButton(text: string) {
        let x: number = this.positionsAroundTable[0].x;
        let y: number = this.positionsAroundTable[0].y;
        let w: number = this.positionsAroundTable[0].tWidth;

        this.textMetrics = this.context.measureText(text);

        return x + w + this.cardWidth - this.textMetrics.width / 2 <
            this.mousePos.x && this.mousePos.x <= x + w + this.cardWidth -
            this.textMetrics.width / 2 + this.textLeftMargin + this.textMetrics.width +
            this.context.lineWidth && y + this.offset - this.textUpperMargin +
            this.context.lineWidth < this.mousePos.y && this.mousePos.y <= y + this.offset +
            this.boxHeight - this.textUpperMargin + this.context.lineWidth;
    }

    private isButtonSelected(): boolean {
        if (this.isAttacking()) {
            return this.withinTheButton(this.doneStr);
        }
        else if (this.isDefending()) {
            return this.withinTheButton(this.takeStr);
        }
    }

    /*
        Function that tells which card the attacking player has selected to attack 
    */
    private CheckMouseClick(): void {
        let strJSON: string;
        if (this.isAttacking() || this.isDefending()) {
            if (this.isCardSelected()) {
                let cardIndex: number = Math.floor(this.GetCardSelected());

                if (cardIndex >= this.gameView.hand.length) {
                    cardIndex = this.gameView.hand.length - 1;
                }

                console.log("Card Index clicked is " + cardIndex);

                strJSON = JSON.stringify({
                    Message: this.isAttacking() ? "Attacking" : "Defending",
                    Card: cardIndex
                });
            }
            else if (this.isButtonSelected()) {
                this.isFirst = true;

                strJSON = JSON.stringify({
                    Message: this.isAttacking() ? "Done" : "Take"
                });
            } else {
                return;
            }

            this.socket.send(strJSON);
            console.log(strJSON);
        }
    }

    /*
        Display Discarded Heap 
    */
    public displayDiscardedHeap(): void {

        for (let i = 0; i < this.gameView.discardHeapSize; i++) {
            let img: HTMLImageElement = this.cardImage();
            this.context.save();

            this.context.translate(this.cardRightX + this.cardWidth + this.cardWidth / 2,
                this.deckPosY + this.cardHeight / 2);

            // getting random angle and y position to replicate the real world discarded pile
            let angle: number = Math.random() * Math.PI * 2;
            let yPos: number = Math.random() * (this.deckPosY + this.canvas.width / 24 -
                this.deckPosY - this.canvas.width / 24) + this.deckPosY - this.canvas.width / 24;

            this.context.rotate(angle);
            this.context.translate(-this.cardRightX - this.cardWidth / 2,
                -this.deckPosY - this.cardHeight / 2);
            this.context.drawImage(img, this.cardRightX, yPos,
                this.cardWidth, this.cardHeight);

            this.context.restore();
        }
    }

    /*
        Dispaly the Suit of the Trump card when there is no deck  
    */
    public displayTrumpSuit(): void {
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.drawImage(img, this.cardLeftX, this.deckPosY,
            this.cardWidth, this.cardHeight);
    }

    /*
        Display the Deck of the game with the trump card at the bottom
        perpendicular to the rest of the face-down deck 
    */
    public displayDeck(): void {
        let img: HTMLImageElement = this.cardImage(this.gameView.trumpCard);
        this.context.save();

        this.context.translate(this.deckPosX + this.cardWidth + this.cardWidth / 2,
            this.deckPosY + this.cardHeight / 2);
        this.context.rotate(Math.PI / 2);
        this.context.translate(-this.deckPosX - this.cardWidth / 2,
            -this.deckPosY - this.cardHeight / 2);
        this.context.drawImage(img, this.deckPosX, this.deckPosY,
            this.cardWidth, this.cardHeight);

        this.context.restore();

        // draw the rest of the deck 
        for (let i = 0; i < this.gameView.deckSize - 1; i++) {
            img = this.cardImage();
            this.context.drawImage(
                img, this.deckPosX + i + this.cardWidth * 1 / 150, this.deckPosY,
                this.cardWidth, this.cardHeight
            );
        }
    }

    /*
        Returns the string from number that represents the 
        rank of the card
    */
    public fromIntToRank(enumRank: number): string {
        if (4 < enumRank && enumRank < 10) {
            return enumRank.toString();
        }

        return "TJQKA"[enumRank - 10];

    }
    /*
        Returns the string from number that represents the
        suit of the card
    */
    public fromIntToSuit(enumSuit: number): string {
        return "CDHS"[enumSuit];
    }


    /*
        Returns an image for a given card.
    */
    public cardImage(card?: Card): HTMLImageElement {
        let strCard: string;
        if (card) {
            let strRank: string = this.fromIntToRank(card.rank);
            let strSuit: string = this.fromIntToSuit(card.suit);
            strCard = strRank.concat(strSuit);
        } else {
            strCard = this.backCard;
        }


        if (this.cardImages.has(strCard)) {
            return this.cardImages.get(strCard);
        }
        else {
            let img = new Image();
            img.onload = () => this.displayStateOfTheGame();
            img.src = this.dir.concat(strCard.concat(".png"));

            this.cardImages.set(strCard, img);
            return this.cardImages.get(strCard);
        }
    }

    /*
        displays the cards from the gameView object 
    */
    private displayMainPlayersHand(hand: Card[], x: number, y: number, tWidth: number) {
        if (hand.length != 0) {
            for (let i = 0; i < hand.length; i++) {
                let img: HTMLImageElement = this.cardImage(hand[i]);
                this.context.drawImage(
                    img, x  + i * this.cardCorner, y, this.cardWidth,
                    this.cardHeight
                );
            }
        } else {
            this.drawBox("Winner", x, y, tWidth, 'white', 'white');
        }
    }

    /*
        Displays the face down cards of opponents
    */
    private displayFaceDownCards(playerView: PlayerView, x: number, y: number, tWidth: number) {
        if (playerView.numberOfCards != 0) {
            for (let i = 0; i < playerView.numberOfCards; i++) {
                let img: HTMLImageElement = this.cardImage();
                this.context.drawImage(
                    img, x + i * this.cardCorner, y, this.cardWidth,
                    this.cardHeight
                );
            }
        } else {
            this.drawBox("Winner", x, y, tWidth, 'white', 'white');
        }
    }

    private IsEndGame(): boolean {
        return this.gameView.attackingPlayer == this.gameView.defendingPlayer;
    }

    /*
        Given the positions and boolean variables position around the table, display main players
        and opponenets hand, display attacking and defending players
    */
    public displayPlayersHelper(currentID: number, index: number, position: number[]) {
        let pos: { x: number, y: number, tWidth: number };

        pos = this.positionsAroundTable[position[index] - 1];

        this.context.lineWidth = 5;

        if (currentID == this.id) {
            this.displayMainPlayersHand(this.gameView.hand, pos.x, pos.y, pos.tWidth);
        } else {
            this.displayFaceDownCards(this.gameView.playersView[currentID], pos.x, pos.y, pos.tWidth);
        }
        if (currentID == this.gameView.attackingPlayer) {
            this.context.strokeStyle = 'lime';
        } else if (currentID == this.gameView.defendingPlayer) {
            this.context.strokeStyle = 'red';
        } else {
            this.context.strokeStyle = 'black';
        }

        this.drawBox("Player " + currentID, pos.x,
            pos.y + this.offset, pos.tWidth, this.context.strokeStyle, 'white');

        if (this.id == currentID) {
            // display "Your Turn" if no cards were played 
            if (this.isAttacking() && this.gameView.attackingCards.length == 0) {

                this.drawBox(this.yourTurnStr, pos.x + pos.tWidth / 2 + this.cardWidth,
                    pos.y + this.offset, pos.tWidth, 'white', 'white');
            }

            // display "Done" button on the attacking player if attack successfully defeated 
            // otherwise attack
            if (this.isAttacking() && this.gameView.attackingCards.length ==
                this.gameView.defendingCards.length && this.gameView.attackingCards.length > 0) {
                this.drawBox(this.doneStr, pos.x + pos.tWidth / 2 + this.cardWidth,
                    pos.y + this.offset, pos.tWidth, 'white', 'white');
            }

            // display "Take" button on the defending player if cannot defend / just want to
            if (this.id == this.gameView.defendingPlayer && this.gameView.attackingCards.length >
                this.gameView.defendingCards.length) {
                this.drawBox(this.takeStr, pos.x + pos.tWidth / 2 + this.cardWidth,
                    pos.y + this.offset, pos.tWidth, 'white', 'white');
            }
        }

        if (this.IsEndGame()) {
            this.drawBox(this.durakStr + this.gameView.defendingPlayer, innerWidth / 2 - 50,
                this.deckPosY, pos.tWidth, 'white', 'white');
        }
    }

    /*
        Returns the position of players depending on the
        size of players playing
    */
    private getPositions(totalPlayers: number): number[] {
        switch (totalPlayers) {
            case 2:
                return [1, 4];
            case 3:
                return [1, 3, 5];
            case 4:
                return [1, 3, 4, 5]
            case 5:
                return [1, 2, 3, 5, 6]
            case 6:
                return [1, 2, 3, 4, 5, 6]
        }
    }

    /*
        Displays Players arounds the table 
    */
    public displayPlayers(): void {
        this.context.fillStyle = 'white';

        let position: number[] = this.getPositions(this.totalPlayers);
        let currentID: number;

        for (let i = 0; i < this.totalPlayers; i++) {
            currentID = (this.id + i) % this.totalPlayers;

            // calculate the total width of cards 
            this.totalCardWidth = (this.gameView.playersView[i].numberOfCards - 1) *
                this.cardCorner + this.cardWidth;
            // subtract from given x point in the window the half of the width of cards
            this.positionsAroundTable[position[i] - 1].x =
                this.positionsAroundTableDuplicate[position[i] - 1].x - this.totalCardWidth / 2;

            this.positionsAroundTable[position[i] - 1].tWidth = this.totalCardWidth;

            this.displayPlayersHelper(currentID, i, position);
        }
    }

    /*
        Stops displaying the table and the current number of
        players joined to the game
    */
    public removeTable() {
        this.canvas.style.display = "none";
    }

    /*
        Displays the table and the current number of
        players joined to the game
    */
    public drawTable(): void {
        // Draws the empty table
        this.context.fillStyle = 'green';
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 10;

        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.save();

    }

    /*
        Display the state of the game from the JSON object(attacking player,
        deck size, discarded heap, defending player, hands etc.)
    */
    public displayStateOfTheGame(): void {
        this.drawTable();

        this.displayPlayers();

        if (this.gameView.deckSize == 0) {
            this.displayTrumpSuit();
        } else {
            this.displayDeck();
        }

        if (this.gameView.discardHeapSize != 0 && this.gameView.discardHeapChanged) {
            this.displayDiscardedHeap();
        }

        this.displayBout();
    }

    private errorWrite(textStr: string, x: number, y: number, w: number, h: number, textW: number) {
        this.context.fillText(textStr, x + this.textLeftMargin,
            this.deckPosY - 2 * this.textUpperMargin);

        this.context.strokeRect(x, y, w, h);
    }

    private clear(x: number, y: number, w: number, h: number): void {
        this.context.fillStyle = 'green';
        this.context.fillRect(x - 5, y - 5, w + 10, h + 10);
    }

    /*
        Display the error if Attack/Defense is illegal
    */
    public errorDisplay(type: string): void {
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'white';

        let textStr: string;

        switch (type) {
            case "illegal":
                textStr = "Illegal Card Played";
                break;
            case "wait":
                textStr = this.isAttacking() ? "Wait For The Defending Player" :
                    "Wait For The Attacking Player";
                break;
            default:
                console.log("Unknown type of the string (Check the error types)");
                break;
        }
        this.textMetrics = this.context.measureText(textStr);

        let x: number = this.positionsAroundTable[0].x - this.textLeftMargin;
        let y: number = this.deckPosY - 3 * this.textUpperMargin;
        let w: number = this.textMetrics.width + 2 * this.textLeftMargin;
        let h: number = this.boxHeight;

        this.errorWrite(textStr, x, y, w, h, this.textMetrics.width);
        setTimeout(() => this.clear(x, y, w, h), 3000);
    }
}