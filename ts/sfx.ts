export class Sfx {
  static clips = new Map<string, HTMLAudioElement>();

  static prime(name: string) {
    const audio = document.createElement('audio');
    audio.src = `sfx/${name}.wav`;
    audio.hidden = true;
    document.getElementsByTagName('body')[0].appendChild(audio);
    this.clips.set(name, audio);
  }

  static play(name: string) {
    if (this.clips.has(name)) {
      this.clips.get(name).currentTime = 0.0;
      this.clips.get(name).play();
    } else {
      this.prime(name);
      this.clips.get(name).currentTime = 0.0;
      this.clips.get(name).play();
    }
  }

}