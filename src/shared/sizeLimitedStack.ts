export class SizeLimitedStack<T> {
  private maxSize: number;
  private array: T[];

  constructor(maxSize: number=50, ...args: any[]) {
    this.array = new Array<T>(...args);
    this.maxSize = maxSize;
  }

  push(item: T) {
    this.array.unshift(item);
    while (this.array.length > this.maxSize) {
      this.array.pop();
    }
  }

  pop(): T {
    return this.array.shift();
  }

  get(index: number): T {
    return this.array[index];
  }

  peek(): T {
    return this.array[0];
  }

  map(callbackFn: (value: T, index: number, array: T[]) => void, thisArg?: any) {
    return this.array.map(callbackFn, thisArg);
  }

  exhaust(callbackFn: (value: T, index: number, array: T[]) => void, thisArg?: any) {
    this.array.forEach(callbackFn, thisArg);
    this.array = new Array<T>();
  }
}
