declare let playingTable: HTMLDivElement;
declare let startButton: HTMLButtonElement;
declare let socket: WebSocket;
declare let connectionUrl: string;
declare let tag: HTMLParagraphElement;
declare let text: any;
declare let className: string;
declare let scheme: string;
declare let port: string;
declare let id: number;
declare let nPlayers: number;
declare let nPlayersPlaying: number;
declare let gameInProgress: boolean;
declare let existingPlayers: number[];
declare let informLeavingCommand: string;
declare let joinGameCommand: string;
declare let requestStateGameCommand: string;
declare let setTotalPlayersCommand: string;
declare let allCommands: string[];
declare function displayGame(): void;
declare function stopDisplayGame(): void;
declare function updateState(): void;
declare function setTotalPlayingPlayers(count: number): void;
declare function placePlayers(newDiv: HTMLDivElement, className: string, pos: number[]): void;
declare function setHTMLForPlayers(player: number, newDiv: HTMLDivElement, className: string): void;
declare function shuffle(): number[];
declare function displayPlayersPositionsAroundTable(redraw: boolean): void;
declare function displayOtherPlayers(newDiv: HTMLDivElement): void;
declare function displayMainPlayer(newDiv: HTMLDivElement): void;
declare function constructJSONPayload(message: any): string;
declare function setTotalPlayers(count: number): void;
declare function setPlayerID(identifier: number): void;
declare function htmlEscape(str: string): string;
