export class Wire {
  static encode = (typeof (Buffer) !== 'undefined') ?
    (text: string) => {
      return Buffer.from(text, 'binary').toString('base64')
    } : (text: string) => { return window.btoa(text); };

  static decode = (typeof (Buffer) !== 'undefined') ?
    (text: string) => {
      return Buffer.from(text, 'base64').toString('binary')
    } : (text: string) => { return window.atob(text); };
}