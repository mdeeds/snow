import { Ball } from './ball';
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
  private playerBalls: Ball[] = [];
  private canvas: HTMLCanvasElement;
  private frameNumber: number = 0;
  private peerGroup: PeerGroup;
  private isServer: boolean;
  private metIds: Set<string> = new Set<string>();

  constructor(peerGroup: PeerGroup, playerNumber: number, hostId: string) {
    this.peerGroup = peerGroup;
    this.isServer = (peerGroup.getId() === hostId) || (!hostId);

    Log.info(
      `I am ${peerGroup.getId()} ${this.isServer ? 'server' : 'client'}`);

    const body = document.getElementsByTagName("body")[0];
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 1024;

    for (let i = 0; i < 1000; ++i) {
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
    this.playerBalls.push(b);

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
    }
    const newBall = new Ball(512, 512, 2);
    newBall.c = 'red';
    const newSink = new MovementSink(newBall, this.balls);
    const ns = new NetworkSource(newId, this.peerGroup, newSink);
    this.sources.push(ns);
    this.playerBalls.push(newBall);
    setTimeout(() => {
      this.peerGroup.broadcast('meet', this.peerGroup.getId());
      Log.info(`Broadcast ${this.peerGroup.getId()} meet -> ` +
        this.peerGroup.getNumPeers());
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
    for (const b of this.balls) {
      b.x += Math.random() - 0.5;
      b.y += Math.random() - 0.5;
      b.render(ctx);
    }
    for (const m of this.sources) {
      m.update(this.frameNumber);
    }

    const ballsToRemove: Ball[] = [];
    for (let b of this.playerBalls) {
      b.render(ctx);
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

    requestAnimationFrame(() => { this.renderLoop(); });
  }
}