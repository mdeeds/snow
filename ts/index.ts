import Peer from "peerjs";
import { PeerGroup } from "./peerGroup";
import { Main } from "./main";
import { Hud } from "./hud";
import { start } from "repl";

console.log('Hello, World!');
const url = new URL(document.URL);

async function go() {
  const joinBox = document.createElement('div');
  joinBox.classList.add('joinBox');
  document.getElementsByTagName('body')[0].appendChild(joinBox);
  let hud = new Hud();
  let p = new Peer();
  let group: PeerGroup = null;
  let playerNumber = 0;
  let hostId = null;
  let isServer = false;
  if (url.searchParams.get('join')) {
    hostId = url.searchParams.get('join');
    group = await PeerGroup.make(p, hostId);
    playerNumber = parseInt(await group.ask(hostId, 'playerNumber:please'));
  } else {
    group = await PeerGroup.make(p);
    isServer = true;
  }
  const m = await Main.make(group, playerNumber, hostId, hud);

  if (isServer) {
    const a = document.createElement('a');
    const joinUrl = new URL(url.href);
    joinUrl.searchParams.append('join', p.id);
    a.href = `${joinUrl.href}`;
    a.innerText = a.href;
    joinBox.appendChild(a);
    const startButton = document.createElement('span');
    startButton.id = 'start';
    startButton.innerText = 'Start';
    startButton.addEventListener('click', (ev) => {
      m.populate();
      hud.setTimerEndTime(window.performance.now() + 2 * 60000);
      joinBox.hidden = true;
      setTimeout(() => {
        joinBox.hidden = false;
        m.stop();
      }, 2 * 60000);
    });
    joinBox.appendChild(startButton);
  }
  console.log('Ready.');
}

go();

