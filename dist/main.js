/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 340:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Ball = void 0;
class Ball {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = 'lightgrey';
    }
    touching(other) {
        const twor2 = other.r * other.r + this.r * this.r;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dx2 = dx * dx;
        const dy2 = dy * dy;
        return (dx2 + dy2) <= twor2;
    }
    render(ctx) {
        if (this.r < 6) {
            ctx.fillStyle = this.c;
        }
        else {
            const gradient = ctx.createRadialGradient(this.x + this.r * 0.2, // x1
            this.y - this.r * 0.1, // y1
            this.r * 0.5, // r1 
            this.x, // x2
            this.y, // y2
            this.r); // r2
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(.9, this.c);
            gradient.addColorStop(1, 'darkgrey');
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, -Math.PI, Math.PI);
        ctx.fill();
    }
}
exports.Ball = Ball;
Ball.minRadius = 2;
//# sourceMappingURL=ball.js.map

/***/ }),

/***/ 138:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const main_1 = __webpack_require__(225);
console.log('Hello, World!');
const m = new main_1.Main();
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 225:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Main = void 0;
const ball_1 = __webpack_require__(340);
const mouseSource_1 = __webpack_require__(907);
const movementSink_1 = __webpack_require__(312);
class Main {
    constructor() {
        this.balls = new Set();
        this.movers = [];
        this.playerBalls = [];
        const body = document.getElementsByTagName("body")[0];
        this.canvas = document.createElement("canvas");
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        for (let i = 0; i < 1000; ++i) {
            const b = new ball_1.Ball(Math.random() * 1024, Math.random() * 1024, ball_1.Ball.minRadius);
            this.balls.add(b);
        }
        const b = new ball_1.Ball(Math.random() * 1024, Math.random() * 1024, ball_1.Ball.minRadius);
        b.c = 'orange';
        const sink = new movementSink_1.MovementSink(b, this.balls);
        const mouseSource = new mouseSource_1.MouseSource(this.canvas, sink);
        this.movers.push(mouseSource);
        this.playerBalls.push(b);
        body.appendChild(this.canvas);
        this.renderLoop();
    }
    bounce(a, b) {
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
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const b of this.balls) {
            b.x += Math.random() - 0.5;
            b.y += Math.random() - 0.5;
            b.render(ctx);
        }
        for (const m of this.movers) {
            m.update();
        }
        const ballsToRemove = [];
        for (let b of this.playerBalls) {
            b.render(ctx);
            for (let o of this.balls) {
                if (o.touching(b)) {
                    if (o.r <= b.r) {
                        b.r = Math.sqrt(o.r * o.r + b.r * b.r);
                        ballsToRemove.push(o);
                    }
                    else {
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
exports.Main = Main;
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 907:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MouseSource = void 0;
class MouseSource {
    constructor(canvas, sink) {
        this.x = 0;
        this.y = 0;
        this.split = false;
        this.sink = sink;
        canvas.addEventListener('mousemove', (ev) => {
            this.x = ev.clientX - canvas.offsetLeft;
            this.y = ev.clientY - canvas.offsetTop;
        });
        canvas.addEventListener('click', (ev) => {
            this.split = true;
        });
    }
    update() {
        this.sink.moveTo(this.x, this.y);
        if (this.split) {
            this.sink.split();
            this.split = false;
        }
    }
}
exports.MouseSource = MouseSource;
//# sourceMappingURL=mouseSource.js.map

/***/ }),

/***/ 312:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MovementSink = void 0;
const ball_1 = __webpack_require__(340);
class MovementSink {
    constructor(ball, nonPlayerBalls) {
        this.lastAngle = 0;
        this.ball = ball;
        this.nonPlayerBalls = nonPlayerBalls;
    }
    distance(dx, dy) {
        const dx2 = dx * dx;
        const dy2 = dy * dy;
        return Math.sqrt(dx2 + dy2);
    }
    moveTo(x, y) {
        const maxSpeed = 30 / Math.pow(this.ball.r, 1.5);
        const dx = x - this.ball.x;
        const dy = y - this.ball.y;
        const d = this.distance(dx, dy);
        if (d <= maxSpeed) {
            this.ball.x = x;
            this.ball.y = y;
        }
        else {
            const p = maxSpeed / d;
            this.ball.x += p * dx;
            this.ball.y += p * dy;
        }
        this.lastAngle = Math.atan2(dy, dx);
    }
    split() {
        const oldRadius = this.ball.r * Math.sqrt(0.45);
        const newRadius = this.ball.r * Math.sqrt(0.55);
        if (newRadius < ball_1.Ball.minRadius) {
            return;
        }
        const dx = this.ball.r * Math.cos(this.lastAngle);
        const dy = this.ball.r * Math.sin(this.lastAngle);
        const b = new ball_1.Ball(this.ball.x - dx, this.ball.y - dy, oldRadius);
        b.c = this.ball.c;
        this.nonPlayerBalls.add(b);
        this.ball.x += dx;
        this.ball.y += dy;
        this.ball.r = newRadius;
    }
}
exports.MovementSink = MovementSink;
//# sourceMappingURL=movementSink.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__(138);
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=main.js.map