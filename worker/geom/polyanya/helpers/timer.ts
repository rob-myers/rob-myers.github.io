export default class Timer {

  /** Ms since epoch */
  stop_time: number;
  /** Ms since epoch */
  start_time: number;

  constructor() {
    this.start_time = 0;
    this.stop_time = 0;
  }

  get_time_nano() {
    return Date.now();
  }
  
  start() {
    this.start_time = Date.now();
    this.stop_time = this.start_time;
  }
  
  stop() {
    this.stop_time = Date.now();
  }
  
  elapsed_time_nano() {
    return this.stop_time - this.start_time;
  }
  
  reset() {
    this.start_time = 0;
    this.stop_time = 0;
  }
  
  elapsed_time_micro() {
    return this.elapsed_time_nano() / 1000.0;
  }

}
