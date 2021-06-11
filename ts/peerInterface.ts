export interface DataConnectionInterface {
  peer: string;
  open: boolean;
  on(evType: string, callback: Function): void;
  send(message: string): void;
}

export interface PeerInterface {
  id: string;
  on(evType: string, callback: Function): void;
  reconnect(): void;
  connect(to: string): DataConnectionInterface;
}
