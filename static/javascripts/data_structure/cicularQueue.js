/**
 * Initialize your data structure here. Set the size of the queue to be k.
 * @param {number} k
 */
var MyCircularQueue = function(k) {
    this.size = k
    this.head = -1
    this.tail = -1
    this.data = []
};

/**
 * Insert an element into the circular queue. Return true if the operation is successful. 
 * Attention:
 *      in the situation of audiostream, every value needed to insert is a array.
 * @param {number} value
 * @return {boolean}
 */
MyCircularQueue.prototype.enQueue = function(value) {
    if (this.isFull()) {
        return false
    }
    if (this.isEmpty()) {
        this.head = 0
    }
    this.tail = (this.tail + 1) % this.size
    this.data[this.tail] = value
    return true
};

/**
 * Delete an element from the circular queue. Return true if the operation is successful.
 * @return {boolean}
 */
MyCircularQueue.prototype.deQueue = function() {
    if (!this.isEmpty()) {
        if (this.tail === this.head) {
            this.tail = -1
            this.head = -1
        } else {
            this.head = (this.head + 1)%this.size
        }
        return true
    }
    return false
};

/**
 * Get the front item from the queue.
 * @return {number}
 */
MyCircularQueue.prototype.Front = function() {
    return this.head === -1? -1 : this.data[this.head]
};

/**
 * Get the last item from the queue.
 * @return {number}
 */
MyCircularQueue.prototype.Rear = function() {
    return this.tail === -1 ? -1 : this.data[this.tail]
};

/**
 * Checks whether the circular queue is empty or not.
 * @return {boolean}
 */
MyCircularQueue.prototype.isEmpty = function() {
    return this.tail === -1 && this.head === -1
};

/**
 * Checks whether the circular queue is full or not.
 * @return {boolean}
 */
MyCircularQueue.prototype.isFull = function() {
    return (this.tail + 1) % this.size === this.head
};

MyCircularQueue.createNew = function(k) {
    return new MyCircularQueue(k)
};

const _MyCircularQueue = MyCircularQueue;
export { _MyCircularQueue as MyCircularQueue };

/** 
 * Your MyCircularQueue object will be instantiated and called as such:
 * var obj = Object.create(MyCircularQueue).createNew(k)
 * var param_1 = obj.enQueue(value)
 * var param_2 = obj.deQueue()
 * var param_3 = obj.Front()
 * var param_4 = obj.Rear()
 * var param_5 = obj.isEmpty()
 * var param_6 = obj.isFull()
 */