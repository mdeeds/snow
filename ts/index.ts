import Peer from "peerjs";
import { PeerGroup } from "./peerGroup";
import { Main } from "./main";
import { Hud } from "./hud";

console.log('Hello, World!');
const url = new URL(document.URL);

async function go() {
  let hud = new Hud();
  let p = new Peer();
  let group: PeerGroup = null;
  let playerNumber = 0;
  let hostId = null;
  if (url.searchParams.get('join')) {
    hostId = url.searchParams.get('join');
    group = await PeerGroup.make(p, hostId);
    playerNumber = parseInt(await group.ask(hostId, 'playerNumber:please'));
  } else {
    group = await PeerGroup.make(p);
    const b = document.createElement('div');
    b.classList.add('joinBox');
    document.getElementsByTagName('body')[0].appendChild(b);
    const a = document.createElement('a');
    const joinUrl = new URL(url.href);
    joinUrl.searchParams.append('join', p.id);
    a.href = `${joinUrl.href}`;
    a.innerText = a.href;
    b.appendChild(a);
  }
  const m = await Main.make(group, playerNumber, hostId, hud);
  console.log('Ready.');
}

go();

