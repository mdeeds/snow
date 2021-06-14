import { Ball } from './ball';
import { ClientState } from './clientState';
import { Hud } from './hud';
import { Log } from './log';
import { MouseSource } from './mouseSource';
import { PeerGroup } from './peerGroup';
import { ServerState } from './serverState';
import { State } from './state';

export class Main {
  private source: MouseSource;
  private canvas: HTMLCanvasElement;
  private peerGroup: PeerGroup;
  private isServer: boolean;
  private hud: Hud;
  private state: State;
  private serverState: ServerState;

  private constructor(peerGroup: PeerGroup, playerNumber: number, hostId: string,
    hud: Hud) {
    this.peerGroup = peerGroup;
    this.isServer = (peerGroup.getId() === hostId) || (!hostId);
    const body = document.getElementsByTagName("body")[0];
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.hud = hud;
    this.hud.setNumberOfPlayers(1);
    Log.info(
      `I am ${peerGroup.getId()} ${this.isServer ? 'server' : 'client'}`);
    this.peerGroup.addListener((fromId: string, data: string) => {
      // Debugging only.
      Log.info(`(${this.peerGroup.getId()}) unhandled <- ${fromId} : ${data}`);
    })

    body.appendChild(this.canvas);
  }

  public static async make(peerGroup: PeerGroup, playerNumber: number, hostId: string,
    hud: Hud): Promise<Main> {
    const self = new Main(peerGroup, playerNumber, hostId, hud);

    if (self.isServer) {
      self.serverState = new ServerState(peerGroup);
      self.state = self.serverState;
      self.serverState.addPlayer(peerGroup.getId(), 0);
      let otherPlayerNumber = 1;
      peerGroup.addAnswer('playerNumber', (fromId: string, message: string) => {
        const response = `${otherPlayerNumber}`;
        self.serverState.addPlayer(fromId, otherPlayerNumber);
        ++otherPlayerNumber;
        return response;
      });
    } else {
      self.state = await ClientState.fetchState(peerGroup, hostId);
    }

    self.source = new MouseSource(self.canvas, self.peerGroup.getId(),
      self.state, self.state.getBall(peerGroup.getId()));

    self.renderLoop();
    return new Promise<Main>((resolve, reject) => {
      resolve(self);
    });
  }

  public populate() {
    if (this.serverState) {
      this.serverState.populate(300, 1024, 1024);
    }
  }

  private renderLoop() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const colorScores = new Map<string, number>();
    this.state.renderBalls(ctx);
    for (const b of this.state.getNonPlayerBalls()) {
      if (colorScores.has(b.c)) {
        colorScores.set(b.c, colorScores.get(b.c) + b.r * b.r);
      } else {
        colorScores.set(b.c, b.r * b.r);
      }
    }
    this.source.update();
    if (this.serverState) {
      this.serverState.update();
    }

    for (let b of this.state.getPlayerBalls()) {
      if (colorScores.has(b.c)) {
        colorScores.set(b.c, colorScores.get(b.c) + b.r * b.r);
      } else {
        colorScores.set(b.c, b.r * b.r);
      }
    }
    for (const [color, score] of colorScores.entries()) {
      this.hud.setColorScore(color, score);
    }

    requestAnimationFrame(() => { this.renderLoop(); });
  }
}