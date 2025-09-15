export default class MinHeap {
    constructor() {
      this.heap = [];
    }
    size() { return this.heap.length; }
    push(item, priority) {
      this.heap.push({ item, priority });
      this._siftUp(this.heap.length - 1);
    }
    pop() {
      if (!this.heap.length) return null;
      const top = this.heap[0].item;
      const last = this.heap.pop();
      if (this.heap.length) {
        this.heap[0] = last;
        this._siftDown(0);
      }
      return top;
    }
    _siftUp(i) {
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (this.heap[parent].priority <= this.heap[i].priority) break;
        [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
        i = parent;
      }
    }
    _siftDown(i) {
      const n = this.heap.length;
      while (true) {
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        let smallest = i;
        if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
        if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
        if (smallest === i) break;
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      }
    }
  }
  