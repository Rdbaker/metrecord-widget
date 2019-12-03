import { SizeLimitedStack } from "./sizeLimitedStack";
import { IPerformanceTrack } from "./interfaces";


export class CPURecorder {
  private recordCallback: (perf: IPerformanceTrack) => void;
  private ceiling: number;
  private lastCallAt: number;
  private perfs: SizeLimitedStack<IPerformanceTrack>;
  private intervalId: any;
  private flushIntervalId: any;

  constructor(recordCallback: (perf: IPerformanceTrack) => void, ceiling: number=0.8) {
    this.recordCallback = recordCallback;
    this.ceiling = ceiling;
    this.perfs = new SizeLimitedStack(350);
  }

  start = () => {
    this.lastCallAt = performance.now();
    this.intervalId = setInterval(this.measureDiff.bind(this), 100);
    this.flushIntervalId = setInterval(this.flush.bind(this), 2500);
  }

  stop = () => {
    clearInterval(this.intervalId);
    clearInterval(this.flushIntervalId);
    this.intervalId = null;
    this.flushIntervalId = null;
  }

  private measureDiff = () => {
    const now = performance.now();
    // defer as much processing to the execution queue as we can so we don't
    // spend time inside this function and screw up our results
    const diff = now - this.lastCallAt
    setTimeout(() => this.maybeRecordDiff(diff, Date.now()), 0)
    this.lastCallAt = now;
  }

  private maybeRecordDiff = (timeDifference: number, clientTimestamp: number) => {
    const performance: IPerformanceTrack = {
      cpuApprox: Math.abs(timeDifference - 100) / 100,
      clientTimestamp: clientTimestamp,
    };

    if (performance.cpuApprox >= this.ceiling) {
      this.perfs.push(performance);
    }
  }

  private flush() {
    this.perfs.exhaust((perf) => {
      this.recordCallback(perf);
    }, this);
  }
}
