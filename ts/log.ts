export class Log {
  private static debugging: boolean = Log.checkDebugging();

  static checkDebugging() {
    if (typeof (document) === 'undefined') {
      return true;
    }
    const url = new URL(document.URL);
    return !!url.searchParams.get('debug');
  }

  private static nowString(): string {
    return `${(window.performance.now() / 1000).toFixed(2)}`;
  }

  static info(message: any) {
    console.log(`${Log.nowString()} ${message} `);
  }

  static debug(message: any) {
    if (Log.debugging) {
      console.log(`${Log.nowString()} ${message} `);
    }
  }
}