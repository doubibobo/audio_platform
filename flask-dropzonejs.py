from dehaze_video import simplest_cb
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask.wrappers import Response
from SqQueue import SqQueue

import cv2 as cv
import glob
import json
import numpy
import os
import requests
import time
import struct
import wave
import webrtcvad


app = Flask(__name__)
UPLOAD_PATH = 'static/uploads'
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(APP_ROOT, UPLOAD_PATH)
TEMP_FOLDER = os.path.join(UPLOAD_FOLDER, 'temp')

# server url
asrUrl_deep = 'http://127.0.0.1:11253/asr'
asrUrl = 'http://127.0.0.1:9010/asr'
serUrl = 'http://127.0.0.1:9006/ser'
srUrl = 'http://127.0.0.1:9008/sr'
enrollUrl = 'http://127.0.0.1:9008/enroll'
sedUrl = 'http://127.0.0.1:9007/sed'


def del_file(path):
    """
    删除文件、文件夹
    :param path: 路径
    :return: 无返回值
    """
    file_names = glob.glob(path + r'\*')
    for fileName in file_names:
        try:
            os.remove(fileName)
        except OSError:
            try:
                os.rmdir(fileName)
            except OSError:
                del_file(fileName)
                os.rmdir(fileName)


def webm_to_wav(webm_path, wav_path, sampling_rate, channel):
    """
    webm 转 wav
    :param webm_path: 输入 webm 路劲
    :param wav_path: 输出 wav 路径
    :param sampling_rate: 采样率
    :param channel: 通道数
    :return: wav文件
    """
    # 如果存在wav_path文件，先删除。
    if os.path.exists(wav_path):  # 如果文件存在
        # 删除文件，可使用以下两种方法。
        os.remove(wav_path)
    start_time = time.time()
    # 终端命令
    command = "ffmpeg -loglevel quiet -i {} -ac {} -ar {} {}".format(webm_path,
                                                                     channel,
                                                                     sampling_rate,
                                                                     wav_path)
    # print('命令是：',command)
    # 执行终端命令
    os.system(command)
    print("文件格式转化时间" + str(time.time() - start_time))


def vad_with_webrtc(wav, sample_rate, frame_window=0.020, signal_byte=2):
    """
    对原始语音信号做vad处理，只返回有效信息
    :param wav: 原始声音信号
    :param sample_rate: 采样率
    :param frame_window: 每一帧的长度，以ms为单位
    :param signal_byte: 每个采样点的存储大小，默认是以int16的形式存储，为2字节
    :return: 无返回值，直接存储到新的文件夹中
    """
    vad = webrtcvad.Vad()
    vad.set_mode(1)
    start, end = 0, len(wav)

    buffer_wav = struct.pack("%dh" % end, *wav)

    samples_per_window = int(frame_window * sample_rate + 0.4)

    # 保存vad识别的每一个片段
    segments, intervals = [], []
    try:
        for start in numpy.arange(0, end, samples_per_window):
            # print(start)
            stop = min(start + samples_per_window, end)

            is_speech = vad.is_speech(buffer_wav[start * signal_byte: stop * signal_byte],
                                      sample_rate=sample_rate, length=samples_per_window)
            segments.append(dict(
                start=start,
                stop=stop,
                is_speech=is_speech
            ))
            if len(intervals) == 0:
                if is_speech:
                    intervals.append([start, stop])
                else:
                    pass
            else:
                if is_speech:
                    if intervals[-1][1] == start:
                        intervals[-1][1] = stop
                    else:
                        intervals.append([start, stop])
                else:
                    pass

    except IndexError:
        # 最后一帧可能会因为不满足windows_duration的条件而使程序发生异常
        # 故直接舍弃最后一帧
        print("finally has an error for the last frame!")
    finally:
        # speech_samples = numpy.concatenate(
        #         [wav[segment['start']: segment['stop']] for segment in segments if segment['is_speech']])
        print(intervals)
    return intervals


def save_as_wav(wave_data, dest_file):
    """
    将前端传过来的Numpy数组保存为wav格式文件
    :param wave_data:
    :param dest_file:
    :return:
    """
    # 打开WAV文档
    f = wave.open(dest_file, "wb")
    # 配置声道数、量化位数和取样频率
    f.setnchannels(1)
    f.setsampwidth(4)
    f.setframerate(16000)
    # 将wav_data转换为二进制数据写入文件
    f.writeframes(wave_data.tostring())
    f.close()


@app.route('/')
def index():
    all_mp3_files1 = []
    all_mp3_files2 = []
    all_mp3_files3 = []
    all_mp3_files4 = []
    del_file(TEMP_FOLDER)
    for filename in os.listdir(UPLOAD_FOLDER + '/asr'):
        if is_audio_format(filename):
            all_mp3_files1.append(filename)
    for filename in os.listdir(UPLOAD_FOLDER + '/ser'):
        if is_audio_format(filename):
            all_mp3_files2.append(filename)
    for filename in os.listdir(UPLOAD_FOLDER + '/sed'):
        if is_audio_format(filename):
            all_mp3_files3.append(filename)
    for filename in os.listdir(UPLOAD_FOLDER + '/sr'):
        if is_audio_format(filename):
            all_mp3_files4.append(filename)
    all_mp3_files1.sort()
    all_mp3_files2.sort()
    all_mp3_files3.sort()
    all_mp3_files4.sort()
    return render_template('index.html', **locals())


@app.route('/getAudios', methods=["POST"])
def get_audios():
    data = request.get_data()
    data = json.loads(data.decode('utf-8'))
    server_name = data['serverName']
    all_mp3_files = []
    for filename in os.listdir(UPLOAD_FOLDER + '/' + server_name):
        if is_audio_format(filename):
            all_mp3_files.append(filename)
    all_mp3_files.sort()
    data = {
        'data': all_mp3_files,
        'dir': os.path.join(UPLOAD_PATH, server_name),
        'upload_dir': os.path.join(UPLOAD_PATH, 'temp')
    }
    return jsonify(data)


@app.route('/voiceprint')
def voiceprint():
    all_mp3_files4 = []
    print(UPLOAD_FOLDER + '/sr')
    for filename in os.listdir(UPLOAD_FOLDER + '/sr'):
        if is_audio_format(filename):
            all_mp3_files4.append(filename)
    print(all_mp3_files4)
    return render_template('voiceprint.html', **locals())


@app.route('/meeting', methods=['GET', 'POST'])
def meeting():
    if request.method == 'GET':
        return render_template('meeting.html', **locals())
    elif request.method == 'POST':
        # 后端接收到请求后，首先提取通过接口/receive_data存储的文件数据
        receive_data = request.get_data().decode()
        # 此时需要分别请求 语音识别 和 声纹识别 两个接口（位于其它两个不同的服务器上），并将数据返回
        files = {'file': open(UPLOAD_FOLDER + '/temp/' + receive_data, 'rb')}
        sr_result = requests.post(srUrl, files=files)
        # sr_result = make_simple_json()
        files['file'].close()

        files = {'file': open(UPLOAD_FOLDER + '/temp/' + receive_data, 'rb')}
        asr_result = requests.post(asrUrl, files=files)
        # asr_result = make_simple_json()
        files['file'].close()

        # todo 此处需要对请求成功与否做出判断
        return jsonify({
            "sr": sr_result.json(),
            "asr": asr_result.json()
        })
    else:
        print("error method to access this interface! please check it.")


@app.route('/meetings', methods=['GET'])
def meetings():
    if request.method == 'GET':
        return render_template('new_meeting.html', async_mode=socketIO.async_mode)


def make_simple_json():
    data = TestJson({'result': 'unknown'})
    return data


def make_list_json():
    return TestJson({'result': [[1, 2], [2, 3], [3, 4], [4, 5]]})


class TestJson:
    def __init__(self, data):
        self.data = data

    def json(self):
        return self.data


@app.route('/asr', methods=['GET', 'POST'])
def asr():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = asrUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/asr/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/ser', methods=['GET', 'POST'])
def ser():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = serUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/ser/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/sed', methods=['GET', 'POST'])
def sed():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = sedUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/sed/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_list_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/sr', methods=['GET', 'POST'])
def sr():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = srUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/sr/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/asr/temp', methods=['GET', 'POST'])
def asr_temp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = asrUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/temp/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/ser/temp', methods=['GET', 'POST'])
def ser_temp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = serUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/temp/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/sed/temp', methods=['GET', 'POST'])
def sed_temp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = sedUrl
    audio_name = recv_data
    files = {'file': open(UPLOAD_FOLDER + '/temp/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_list_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/sr/temp', methods=['GET', 'POST'])
def sr_temp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = srUrl
    audio_name = recv_data
    for one_file in os.listdir(UPLOAD_FOLDER + '/temp/'):
        print(one_file)
    files = {'file': open(UPLOAD_FOLDER + '/temp/' + audio_name, 'rb')}
    data = requests.post(url, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


def is_audio_format(link):
    if (link.find('.mp3') > -1 or link.find('.wav') > -1 or link.find(
            '.flac') > -1 or link.find('.webm') > -1):
        return True
    return False


@app.route('/upload/asr', methods=['GET', 'POST'])
def upload1():
    if request.method == 'POST':
        file = request.files['file']
        print(file)
        print(file.filename)
        upload_path = '{}/{}'.format(UPLOAD_FOLDER + '/temp', file.filename)
        file.save(upload_path)
        return file.filename


@app.route('/upload/ser', methods=['GET', 'POST'])
def upload2():
    if request.method == 'POST':
        file = request.files['file']
        upload_path = '{}/{}'.format(UPLOAD_FOLDER + '/temp', file.filename)
        file.save(upload_path)
        return file.filename


@app.route('/upload/sed', methods=['GET', 'POST'])
def upload3():
    if request.method == 'POST':
        file = request.files['file']
        upload_path = '{}/{}'.format(UPLOAD_FOLDER + '/temp', file.filename)
        file.save(upload_path)
        return file.filename


@app.route('/upload/sr', methods=['GET', 'POST'])
def upload4():
    if request.method == 'POST':
        file = request.files['file']
        upload_path = '{}/{}'.format(UPLOAD_FOLDER + '/temp', file.filename)
        file.save(upload_path)
        return file.filename
    else:
        return False


@app.route("/receive_audio", methods=["POST"])
def receive_audio():
    file = request.files.get("audio")
    filename = request.form["mp3name"]
    servername = request.form["name"]
    print(filename)
    print(servername)

    if file:
        upload_path = '{}/{}'.format(UPLOAD_FOLDER + '/temp', filename)
        file.save(upload_path)
    else:
        return 'false'

    webm_path = upload_path
    wav_path = upload_path.split('.')[0] + '.wav'
    print("webm_path is " + webm_path)
    print("wav_path is " + wav_path)
    sampling_rate = 16000
    channel = 1
    webm_to_wav(webm_path, wav_path, sampling_rate, channel)
    return 'ok'


@app.route('/enroll', methods=['GET', 'POST'])
def enroll():
    file = request.files.get("audio")
    filename = request.form["mp3name"]
    name = request.form["name"]
    print(file)
    if file:
        upload_path = '{}/{}'.format(UPLOAD_FOLDER + '/temp', filename)
        file.save(upload_path)
    else:
        return jsonify({
            "code": 500
        })
    url = enrollUrl
    webm_path = upload_path
    wav_path = upload_path.split('.')[0] + '.wav'
    print("webm_path is " + webm_path)
    print("wav_path is " + wav_path)
    sampling_rate = 16000
    channel = 1
    webm_to_wav(webm_path, wav_path, sampling_rate, channel)

    files = {'file': open(wav_path, 'rb')}
    print("==============\n")
    print(filename)
    print("==============\n")
    req = {'name': name}
    data = requests.post(url, data=req, files=files)
    # data = make_simple_json()
    print(data.json())
    return jsonify(data.json())


@app.route('/changeServer', methods=['GET', 'POST'])
def change_server():
    data = request.get_data()
    url_data = json.loads(data.decode("utf-8"))
    print(url_data)
    global asrUrl, serUrl, srUrl, enrollUrl, sedUrl
    asrUrl = url_data.get('asrUrl')
    serUrl = url_data.get('serUrl')
    srUrl = url_data.get('srUrl')
    enrollUrl = url_data.get('enrollUrl')
    sedUrl = url_data.get('sedUrl')
    return 'OK'


class VideoCamera(object):
    def __init__(self, video_path):

        self.cap = cv.VideoCapture(video_path)
        _, self.last_frame = self.cap.read()
        self.fps = self.cap.get(cv.CAP_PROP_FPS)
        self.last_time = time.time()
        self.delay = 1000 // int(self.fps)

    def __del__(self):
        self.cap.release()

    def get_frame(self):
        cur = time.time()
        if cur > self.last_time + self.delay / 1000:
            self.last_time = cur
            success, image = self.cap.read()
            handled_image = simplest_cb(image, 1)
            image = numpy.hstack((image, handled_image))
            if image is None:
                image = self.last_frame
            self.last_frame = image


def gen(camera):
    while True:
        camera.get_frame()
        ret, jpeg = cv.imencode('.jpg', camera.last_frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() +
               b'\r\n\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(
        gen(VideoCamera(os.path.join(APP_ROOT, 'static/img/test.mp4'))),
        mimetype='multipart/x-mixed-replace;boundary=frame'
    )


@app.route('/fog_video_feed')
def fog_video_feed():
    return Response(
        gen(VideoCamera(os.path.join(APP_ROOT, 'static/img/fog_test.flv'))),
        mimetype='multipart/x-mixed-replace;boundary=frame'
    )


@app.route('/opencv', methods=['GET'])
def opencv_html():
    if request.method == 'GET':
        return render_template("opencv.html")


@app.route('/new')
def new():
    return render_template("new.html")


socketIO = SocketIO(app, cors_allowed_origins='*')
# socketIO.init_app(app)

"""
对app进行一些路由设置
"""

"""
对socket进行一些监听设置
"""
# 设置全局缓冲
audio_stream_buffer = {}


def save_wave(wav, file_path):
    # 配置声道数、量化位数和取样频率
    file = wave.open(file_path, 'wb')
    file.setnchannels(1)
    file.setsampwidth(2)
    file.setframerate(16000)
    # 将wav_data转换为二进制数据写入文件
    file.writeframes(wav.tostring())
    file.close()


@socketIO.on('begin_recording', namespace='/test')
def begin_recording(data):
    """
    用来创建针对用户的缓冲区，每个用户在该缓冲区中识别
    :param data: 用户信息
    :return: 发送缓冲区创建成功的消息
    """
    # 首先判断该用户是否已经在缓冲池中
    if data['remote_addr'] not in audio_stream_buffer.keys():
        audio_stream_buffer[data['remote_addr']] = {
            "stream": SqQueue(1365 * 12 * 60 * 5),
        }
        emit('data_response', {
            'code': 200,
            'msg': '录音开始......'
        })
    else:
        emit('data_response', {
            'code': 500,
            'msg': '语音处理完毕前，请不要重复录音！'
        })


@socketIO.on('send_wav_message', namespace='/test')
def sending_message(data):
    vad_frames = list(json.loads(data['vad_frames']).values())
    vad_frames = (numpy.array(vad_frames) * 0x7FFF).astype(numpy.int16).tolist()

    for vad_frame in vad_frames:
        if audio_stream_buffer[data['remote_addr']]['stream'].enqueue(vad_frame):
            continue
        else:
            emit('data_response', {
                'code': 500,
                'msg': '缓冲区满，请稍后再试！'
            })
            break
    emit('data_response', {
        'code': 200,
        'msg': '语音流成功推送！'
    })


@socketIO.on('send_result', namespace='/test')
def sending_result(data):
    print("收到请求！")
    key, value = data['remote_addr'], audio_stream_buffer[data['remote_addr']]
    # 记录首次静音检测片段的大小
    vad_frame_length = 4096 * 12
    while audio_stream_buffer[key]['stream'].queue_length() != 0:
        print("继续检测......")
        # 对大约3s的数据做静音检测
        if value['stream'].queue_length() >= vad_frame_length:
            # 获得队列中前3s的数据，静音检测2s
            buffer_temp, queue_front = value['stream'].get_queue(vad_frame_length), vad_frame_length - 4096 * 2
            # 去掉静音片段，并将1365 × 36之前的语音发送做语音识别和声纹识别
            intervals = vad_with_webrtc(
                numpy.array(
                    buffer_temp, dtype=numpy.int16
                ),
                16000
            )
            interval_file_name = str(int(round(time.time() * 1000)))
            print(interval_file_name)
            print(intervals)
            save_wave(
                numpy.array(buffer_temp, dtype=numpy.int16),
                UPLOAD_PATH + '/temp/' + interval_file_name + '.wav'
            ),
            for i in range(len(intervals)):
                # 此时需要分别请求 语音识别 和 声纹识别 两个接口（位于其它两个不同的服务器上），并将数据返回
                # 将语音保存temp文件中
                # wavfile.write(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i), 16000, intervals[i])
                # 1. 非静音片段的右端点 小于 取出的语音流长度[这里往前取一点，]，则正常识别, 1*4096表示0.256s的数据
                if intervals[i][1] < queue_front:
                    save_wave(
                        numpy.array(
                            buffer_temp[intervals[i][0]: intervals[i][1]],
                            dtype=numpy.int16
                        ),
                        UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i) + '.wav'
                    )

                    files = {'file': open(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i) + '.wav', 'rb')}
                    sr_result = requests.post(srUrl, files=files)
                    files['file'].close()
                    
                    files = {'file': open(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i) + '.wav', 'rb')}
                    asr_result = requests.post(asrUrl, files=files)
                    files['file'].close()
                    # TODO asr_result.json(), sr.result.json()
                    emit('asr_sr_result', {
                        'code': 200,
                        "sr": sr_result.json(),
                        "asr": asr_result.json()
                    })
                vad_frame_length = 4096 * 12

                # 2. 非静音片段的右端点 等于 取出的语音长度，则不进行识别，与后续语音流拼接后识别
                if intervals[i][1] >= queue_front:
                    queue_front = intervals[i][0]
                    vad_frame_length = 4096 * 12 + intervals[i][1] - intervals[i][0]
                    break

            # 清除队列中已经识别完成的语音流，将队列的头部指向queue_front
            print('the queue_front is ' + str(queue_front))
            audio_stream_buffer[key]['stream'].redirect_queue(queue_front)
        else:
            # # 剩余的不足3s的语音直接舍弃
            break
            # continue
    emit('data_response', {
        'code': 200,
        'msg': '语音流识别完毕！'
    })


@socketIO.on('stop_recording', namespace='/test')
def stop_recording(data):
    # 首先判断该用户是否已经在缓冲池中
    if data['remote_addr'] not in audio_stream_buffer.keys():
        emit('data_response', {
            'code': 500,
            'msg': '结束录音之前，请先开始录音！'
        })
    else:
        while audio_stream_buffer[data['remote_addr']]['stream'].queue_length() != 0:
            audio_stream_buffer[data['remote_addr']]['stream'].dequeue()
        audio_stream_buffer.pop(data['remote_addr'])
        emit('data_response', {
            'code': 200,
            'msg': '成功停止录音！'
        })


@socketIO.on('request_for_response', namespace='/test')
def give_response():
    """
    用于接收前端传来的数据，并返回处理结果
    :return: 无
    """
    # 可以进行一些对value的处理或者其它操作，在此期间可以随时调用emit方法向前台发送消息
    emit('response', {
        'code': 200,
        'msg': 'start to process...'
    })

    time.sleep(5)
    emit('response', {
        'code': 200,
        'msg': 'processed'
    })


if __name__ == '__main__':
    # app.run(
    #    debug=True,
    #    host="127.0.0.1",
    #    port=4000
    # )
    socketIO.run(
        app,
        debug=False,
        host='127.0.0.1',
        port=4000
    )
