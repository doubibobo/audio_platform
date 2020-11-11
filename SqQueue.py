class SqQueue(object):
    def __init__(self, maxsize):
        self.queue = [None] * maxsize
        self.maxsize = maxsize
        self.front = 0
        self.rear = 0

    # 返回当前队列的长度
    def queue_length(self):
        return (self.rear - self.front + self.maxsize) % self.maxsize

    # 如果队列未满，则在队尾插入元素，时间复杂度O(1)
    def enqueue(self, data):
        if (self.rear + 1) % self.maxsize == self.front:
            print("The queue is full!")
            return False
        else:
            self.queue[self.rear] = data
            self.rear = (self.rear + 1) % self.maxsize
            return True

    # 如果队列不为空，则删除队头的元素,时间复杂度O(1)
    def dequeue(self):
        if self.rear == self.front:
            print("The queue is empty!")
            return False
        else:
            data = self.queue[self.front]
            self.queue[self.front] = None
            self.front = (self.front + 1) % self.maxsize
            return data

    # 删除元素到特定的节点，这里已经确保position在[front, end]区间内了
    def redirect_queue(self, position):
        for i in range(position):
            self.dequeue()

    # 获得队列中的元素，但是不删除
    def get_queue(self, length):
        if self.rear == self.front:
            print("The queue is empty!")
            return False
        else:
            return [self.queue[(self.front + index) % self.maxsize] for index in range(length)]

    # 输出队列中的元素
    def show_queue(self):
        for i in range(self.maxsize):
            print(self.queue[i], end=',')
        print(' ')
