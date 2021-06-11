export class Log {
  private static debugging: boolean = Log.checkDebugging();

  static checkDebugging() {
    if (typeof (document) === 'undefined') {
      return true;
    }
    const url = new URL(document.URL);
    return !!url.searchParams.get('debug');
  }

  static info(message: any) {
    console.log(message);
  }

  static debug(message: any) {
    if (Log.debugging) {
      console.log(`${(window.performance.now() / 1000).toFixed(2)} ` +
        `${message} `);
    }
  }
}