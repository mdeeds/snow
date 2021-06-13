import { Ball } from './ball';
import { Hud } from './hud';
import { Log } from './log';
import { MouseSource } from './mouseSource';
import { MovementSink } from './movementSink';
import { MovementSource } from './movementSource';
import { NetworkSource } from './networkSource';
import { PeerGroup } from './peerGroup';

const playerColors = ['blue', 'green', 'purple', 'red', 'orange', 'yellow'];

export class Main {
  private balls: Set<Ball> = new Set<Ball>();
  private sources: MovementSource[] = [];
  private canvas: HTMLCanvasElement;
  private frameNumber: number = 0;
  private peerGroup: PeerGroup;
  private isServer: boolean;
  private hud: Hud;
  private metIds: Set<string> = new Set<string>();
  private playerBalls: Map<string, Ball> = new Map<string, Ball>();

  constructor(peerGroup: PeerGroup, playerNumber: number, hostId: string,
    hud: Hud) {
    this.peerGroup = peerGroup;
    this.isServer = (peerGroup.getId() === hostId) || (!hostId);
    this.hud = hud;
    this.hud.setNumberOfPlayers(1);
    Log.info(
      `I am ${peerGroup.getId()} ${this.isServer ? 'server' : 'client'}`);

    const body = document.getElementsByTagName("body")[0];
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 1024;

    for (let i = 0; i < 300; ++i) {
      const b = new Ball(Math.random() * 1024, Math.random() * 1024,
        Ball.minRadius);
      this.balls.add(b);
    }

    const b = new Ball(Math.random() * 1024, Math.random() * 1024,
      Ball.minRadius);
    b.c = playerColors[playerNumber];
    const sink = new MovementSink(b, this.balls);
    const mouseSource = new MouseSource(this.canvas, peerGroup, sink);
    this.sources.push(mouseSource);
    this.playerBalls.set('', b);

    const knownColors: string[] = [];
    for (const b of this.playerBalls.values()) {
      knownColors.push(b.c);
    }
    this.hud.setKnownColors(knownColors);

    peerGroup.addMeetCallback((newId: string) => {
      Log.info(`Meet callback: ${newId} -> ${this.peerGroup.getId()}`);
      this.handleMeet(newId);
    });

    this.peerGroup.addCallback('meet', (fromId: string, data: string) => {
      Log.info(`Meet message: ${fromId} -> ${this.peerGroup.getId()}`);
      this.handleMeet(fromId);
    })

    if (!this.isServer) {
      peerGroup.addCallback('frameNumber', (fromId: string, data: string) => {
        this.frameNumber = parseInt(data);
      });
    }

    this.peerGroup.addCallback('myPlayerNumber',
      (fromId: string, data: string) => {
        const playerNumber = parseInt(data);
        let b: Ball;
        if (this.playerBalls.has(fromId)) {
          b = this.playerBalls.get(fromId);
        } else {
          b = new Ball(512, 512, Ball.minRadius);
          this.playerBalls.set(fromId, b);
        }
        b.c = playerColors[playerNumber];
        const knownColors: string[] = [];
        for (const b of this.playerBalls.values()) {
          knownColors.push(b.c);
        }
        this.hud.setKnownColors(knownColors);
      })

    this.peerGroup.addListener((fromId: string, data: string) => {
      Log.info(`(${this.peerGroup.getId()}) unhandled <- ${fromId} : ${data}`);
    })

    body.appendChild(this.canvas);
    this.renderLoop();
  }

  private handleMeet(newId: string) {
    if (this.metIds.has(newId)) {
      return;
    } else {
      this.metIds.add(newId);
      this.hud.setNumberOfPlayers(this.metIds.size + 1);
    }
    let newBall: Ball;
    if (!this.playerBalls.has(newId)) {
      newBall = new Ball(512, 512, Ball.minRadius);
      newBall.c = 'magenta';
      this.playerBalls.set(newId, newBall);
      const knownColors: string[] = [];
      for (const b of this.playerBalls.values()) {
        knownColors.push(b.c);
      }
      this.hud.setKnownColors(knownColors);
    } else {
      newBall = this.playerBalls.get(newId);
    }
    const newSink = new MovementSink(newBall, this.balls);
    const ns = new NetworkSource(newId, this.peerGroup, newSink);
    this.sources.push(ns);
    setTimeout(() => {
      this.peerGroup.broadcast('meet', this.peerGroup.getId());
      Log.info(`Broadcast ${this.peerGroup.getId()} meet -> ` +
        `${this.peerGroup.getNumPeers()}`);
    }, 3000);
  }

  private bounce(a: Ball, b: Ball) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    const d = Math.sqrt(dx2 + dy2);
    const minD = a.r + b.r * 1.05;
    const p = (d - minD) / d;
    a.x += p * dx;
    a.y += p * dy;
    b.x -= p * dx;
    b.y -= p * dy;
  }

  renderLoop() {
    ++this.frameNumber;
    if (this.isServer && this.frameNumber % 32 == 0) {
      this.peerGroup.broadcast('frameNumber', this.frameNumber.toFixed(0));
    }
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const colorScores = new Map<string, number>();
    for (const b of this.balls) {
      b.render(ctx, this.frameNumber);
      if (colorScores.has(b.c)) {
        colorScores.set(b.c, colorScores.get(b.c) + b.r * b.r);
      } else {
        colorScores.set(b.c, b.r * b.r);
      }
    }
    for (const m of this.sources) {
      m.update(this.frameNumber);
    }

    const ballsToRemove: Ball[] = [];
    for (let b of this.playerBalls.values()) {
      b.render(ctx, this.frameNumber);
      if (colorScores.has(b.c)) {
        colorScores.set(b.c, colorScores.get(b.c) + b.r * b.r);
      } else {
        colorScores.set(b.c, b.r * b.r);
      }
      for (let o of this.balls) {
        if (o.touching(b)) {
          // You can always eat balls of your own color.
          // You can also eat balls that are no bigger than you.
          if (o.c === b.c || o.r <= b.r) {
            b.r = Math.sqrt(o.r * o.r + b.r * b.r);
            ballsToRemove.push(o);
          } else {
            this.bounce(b, o);
          }
        }
      }
    }
    for (const b of ballsToRemove) {
      this.balls.delete(b);
    }
    for (const [color, score] of colorScores.entries()) {
      this.hud.setColorScore(color, score);
    }

    requestAnimationFrame(() => { this.renderLoop(); });
  }
}