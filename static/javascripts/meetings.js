$(document).ready(function() {

    console.log("this is the project of recording... ")

    // 创建循环队列
    // copy at https://juejin.im/post/6844903717418844168
    /**
     * Initialize your data structure here. Set the size of the queue to be k.
     * @param {number} k
     */
    var MyCircularQueue = function(k) {
        this.size = k       // 队列大小
        this.head = -1      // 队列头
        this.tail = -1      // 队列尾
        this.capacity = 0   // 队列实际容量，只在添加和删除时更新
        this.data = []      // 队列具体数据
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
        this.capacity = this.capacity + 1
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
                this.head = (this.head + 1) % this.size
            }
            this.capacity = this.capacity - 1
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

    const GLOBAL_ACTIONS = {
        meeting_reco_starting: function () {
            record();
        },
        meeting_reco_ending: function () {
            stopRecord();
        }
    };


    let namespace = '/test';

    // Connect to the Socket.IO server.
    // The connection URL has the following format, relative to the current page:
    //     http[s]://<domain>:<port>[/<namespace>]
    let socket = io(namespace);

    $('#meeting_reco_starting').click(
        function (){
            console.log("enter the project of recording... ")
            // 浏览器录音功能的重写
            window.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            }).then(mediaStream => {
                console.log(mediaStream)
                beginRecord(mediaStream);
            }).catch(err => {
                // 如果用户没有麦克风或者用户拒绝了，或者连接出了问题等
                // 这边都会抛异常，并且通过error.name知道是哪种类型的错误
                console.error(err);
            });

            window.flag = false;
            socket.emit('begin_recording', {
                'remote_addr': location.host
            })
        }
    )
    $('#meeting_reco_ending').click(
        function (){
            window.localStream.getAudioTracks()[0].stop();
            window.mediaNode.disconnect();
            window.jsNode.disconnect();
            console.log(audioBufferQueue);
            socket.close()
        }
    )
    /**
     * 浏览器录音功能重写
     * 功能是：调用浏览器的录音设备，并将语音流输出到另一个设备
     */
    // function record() {
    //     console.log("enter the project of recording... ")
    //     // 浏览器录音功能的重写
    //     window.navigator.mediaDevices.getUserMedia({
    //         audio: true
    //     }).then(mediaStream => {
    //         console.log(mediaStream)
    //         beginRecord(mediaStream);
    //     }).catch(err => {
    //         // 如果用户没有麦克风或者用户拒绝了，或者连接出了问题等
    //         // 这边都会抛异常，并且通过error.name知道是哪种类型的错误
    //         console.error(err);
    //     });
    // }

    /**
     * 输入语音流和输出语音流的连接
     * @param {MediaStream} mediaStream
     */
    function beginRecord(mediaStream) {
        // 保存localStream，录音停止的时候用
        window.localStream = mediaStream
        // 音频流的处理
        // let audioContext = new (window.AudioContext({ sampleRate: 16000 }) || window.webkitAudioContext);
        let audioContext = new window.AudioContext({ sampleRate: 16000 })
        window.mediaNode = audioContext.createMediaStreamSource(mediaStream);
        // 创建JSNode
        window.jsNode = createJSNode(audioContext);
        // 需要连到扬声器消费掉outputBuffer，process回调才能触发
        // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
        jsNode.connect(audioContext.destination)
        jsNode.onaudioprocess = onAudioProcess;
        mediaNode.connect(jsNode);
        // 连接到扬声器进行播放
        // mediaNode.connect(audioContext.destination)
    }

    /**
     * 获取录音数据，并创建保存对象的实例
     * @param {AudioContext} audioContext
     * @return {creator}
     *      creator实例包含两个缓冲区，一是输入inputBuffer，另一个是outputBuffer，它们都是AudioBuffer实例
     *      通常情况下，可以在onaudioprocess回调中获取到inputBuffer的数据，处理之后再放到outputBuffer
     */
    function createJSNode(audioContext) {
        const BUFFER_SIZE = 4096;
        const INPUT_CHANNEL_COUNT = 1;
        const OUTPUT_CHANNEL_COUNT = 1;

        // 转全局变量
        window.BUFFER_SIZE = BUFFER_SIZE;

        let creator = audioContext.createScriptProcessor || audioContext.createJavaScriptNode;
        creator = creator.bind(audioContext);
        return creator(
            BUFFER_SIZE, INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT
        );
    }

    // 创建队列，保存经过处理后的outputBuffer信息
    // 按照现有的BGUFFER_SIZE，bufferQueue中每12个元素才能代表1s，缓冲区留足10min
    // 按照前端采样率48kHZ的界定
    // 该缓冲区所占存储空间为：1365 * 8192 * 4B = 43680KB = 42.66MB
    // 能够保存11.4min的数据，可防止因网络卡顿造成语音数据丢失。
    // 大小为2MB，默认缓冲区的时间长度为1min，按照16KHz、2字节的换算，约为1.8MB
    let audioBufferQueue = Object.create(MyCircularQueue).createNew(8192);

    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    socket.on('data_response', function(msg, cb) {
        document.getElementById('asr_sr_log').innerHTML
            = document.getElementById('asr_sr_log').innerHTML + '\r\n code # ' + msg.code + ': ' + msg.msg;
        if (cb)
            cb();
    });

    socket.on('asr_sr_result', function(msg, cb) {
        document.getElementById('meeting-asr-sr').innerHTML
            = document.getElementById('meeting-asr-sr').innerHTML + '\r\n code # ' + msg.code + ' ' + msg.sr.result + ': ' + msg.asr.result;
    });

    // TODO 监听缓冲区变量audioBufferQueue，当其size大于36时，传到后端做VAD检测
    let proxy = new Proxy({'capacity': 0}, {
        get: function(target, name) {
            console.log("the capacity is " + target[name]);
            if (name in target) {
                console.log(target)
                console.log("the capacity is " + target[name]);
                if (target[name] >= 12) {
                    // 如果缓冲区中含有3s以上的数据
                    let vad_frames = new Float32Array(12 * audioBufferQueue.data[audioBufferQueue.head].length), offset = 0;
                    for (let i = 0; i < 12; i++) {
                        console.log(audioBufferQueue)
                        vad_frames.set(audioBufferQueue.data[(audioBufferQueue.head) % audioBufferQueue.size], offset);
                        offset += audioBufferQueue.data[audioBufferQueue.head].length;
                        if (audioBufferQueue.deQueue()) {
                            console.log(i + "deleting...")
                            target[name] -= 1;
                        }
                    }

                    console.log("waiting vad detected frames");
                    console.log(vad_frames);

                    let formData = new FormData();
                    formData.append("vad_frames", JSON.stringify(vad_frames));      // TODO 这个地方需要改进,要不然网络传输开销太大了
                    formData.append("id", (new Date()).valueOf());

                    socket.emit('send_wav_message', {
                        'vad_frames': JSON.stringify(vad_frames),
                        'remote_addr': location.host
                    })
                    if (!window.flag) {
                        // 在上传至少一个缓冲区时请求结果
                        socket.emit('send_result', {
                            'remote_addr': location.host
                        })
                        window.flag=true;
                    }
                }
                return target[name];
            } else {
                return 37;
            }
        }
    });

    /**
     * 将语音数据存入缓冲区，缓冲区默认大小为512 * 4KB，16kHZ下1min长度的数据
     * @param {creator} event
     */
    function onAudioProcess (event) {
        // 将缓存push到audioBufferQueue中
        if (audioBufferQueue.enQueue(event.inputBuffer.getChannelData(0).slice(0))) {
            proxy.capacity += 1;
            console.log('进入缓存!');
        } else {
            console.log('缓冲区已满，请稍候再试!');
        }
        console.log(event.inputBuffer);
    }

    console.log("listen the capacity... ");

    // /**
    //  * 停止录音，这里有一个变量作用域的问题
    //  */
    // function stopRecord() {
    //     localStream.getAudioTracks()[0].stop();
    //     mediaNode.disconnect();
    //     jsNode.disconnect();
    //     console.log(audioBufferQueue);
    //     // TODO 需要清空缓冲区
    // }
});