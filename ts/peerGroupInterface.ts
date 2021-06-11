export type CallbackFn = (fromId: string, data: string) => void;
export type AnswerCallbackFn = (fromId: string, message: string) => string;
export type AnswerRecieverFn = (answer: string) => void;
export type MeetCallbackFn = (newId: String) => void;

export interface PeerGroupInterface {
  /**
   * 
   * @param message Message to send to all listeners
   */
  broadcast(name: string, message: string): void;

  /**
   * 
   * @param toId Intended recipient
   * @param message Message to send
   */
  send(toId: string, message: string): void;

  /**
   * 
   * @param name Trigger callback on this named message
   * @param f Callback function
   */
  addCallback(name: string, f: CallbackFn): void;

  addMeetCallback(f: MeetCallbackFn): void;

  /**
   * If no named callback matches, these listeners are called.
   * @param f Callback function
   */
  addListener(f: CallbackFn): void;

  /**
   * Underlying ID of data conneciton.
   */
  getId(): string;

  /**
   * 
   * @param toId Intended recipient
   * @param message Message to send
   * @returns Promise of an answer to this ask.
   */
  ask(toId: string, message: string): Promise<string>;

  /**
   * 
   * @param name Answer to asks prefixed with this name
   * @param f Callback function which returns associated answer.
   */
  addAnswer(name: string, f: AnswerCallbackFn): void;

}