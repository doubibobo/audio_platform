from flask import Flask, render_template, request, jsonify
import os
import requests
import json
import datetime
import time
import glob
import json

import numpy
import struct
import webrtcvad
import bisect
from scipy.io import wavfile
import librosa
import wave
import scipy.signal as signal

app = Flask(__name__)
UPLOAD_PATH = 'static/uploads'
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(APP_ROOT, UPLOAD_PATH)
TEMP_FOLDER = os.path.join(UPLOAD_FOLDER, 'temp')

# server url
asrUrl = 'http://127.0.0.1:9010/asr'
serUrl = 'http://127.0.0.1:9006/ser'
srUrl = 'http://127.0.0.1:9008/sr'
enrollUrl = 'http://127.0.0.1:9008/enroll'
sedUrl = 'http://127.0.0.1:9007/sed'

# folders location


def delfile(path):
    fileNames = glob.glob(path + r'\*')
    for fileName in fileNames:
        try:
            os.remove(fileName)
        except:
            try:
                os.rmdir(fileName)
            except:
                delfile(fileName)
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
    command = "ffmpeg -loglevel quiet -i {} -ac {} -ar {} {}".format(webm_path, channel, sampling_rate, wav_path)
    # print('命令是：',command)
    # 执行终端命令
    os.system(command)
    print("文件格式转化时间" + str(time.time() - start_time))

def save_as_wav(wave_data, dest_file):
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
    delfile(TEMP_FOLDER)
    for filename in os.listdir(UPLOAD_FOLDER + '/asr'):
        if (isAudioFormat(filename)):
            all_mp3_files1.append(filename)
    for filename in os.listdir(UPLOAD_FOLDER + '/ser'):
        if (isAudioFormat(filename)):
            all_mp3_files2.append(filename)
    for filename in os.listdir(UPLOAD_FOLDER + '/sed'):
        if (isAudioFormat(filename)):
            all_mp3_files3.append(filename)
    for filename in os.listdir(UPLOAD_FOLDER + '/sr'):
        if (isAudioFormat(filename)):
            all_mp3_files4.append(filename)
    all_mp3_files1.sort()
    all_mp3_files2.sort()
    all_mp3_files3.sort()
    all_mp3_files4.sort()
    return render_template('index.html', **locals())


@app.route('/voiceprint')
def voiceprint():
    all_mp3_files4 = []
    print(UPLOAD_FOLDER + '/sr')
    for filename in os.listdir(UPLOAD_FOLDER + '/sr'):
        if (isAudioFormat(filename)):
            all_mp3_files4.append(filename)
    print(all_mp3_files4)
    return render_template('voiceprint.html', **locals())


@app.route('/meeting', methods=['GET', 'POST'])
def meeting():
    if request.method == 'GET':
        return render_template('meeting.html', **locals())
    elif request.method == 'POST':
        # 后端接收到请求后，首先提取通过接口/recieve_data存储的文件数据
        receive_data = request.get_data().decode()
        # 此时需要分别请求 语音识别 和 声纹识别 两个接口（位于其它两个不同的服务器上），并将数据返回
        files = {'file': open(UPLOAD_PATH + '/temp/' + receive_data, 'rb')}
        sr_result = requests.post(srUrl, files=files)
        files['file'].close()

        files = {'file': open(UPLOAD_PATH + '/temp/' + receive_data, 'rb')}
        asr_result = requests.post(asrUrl, files=files)
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
        return render_template('new_meeting.html', **locals())


# @app.route('/psr', methods=['POST'])
# def psr():
    # # 后端接收到请求后，首先提取通过接口/recieve_data存储的文件数据
    # receive_data = request.get_data().decode()
    # # 此时需要分别请求 语音识别 和 声纹识别 两个接口（位于其它两个不同的服务器上），并将数据返回
    # files = {'file': open(UPLOAD_PATH + '/temp/' + receive_data, 'rb')}
    # sr_result = requests.post(srUrl, files=files)
    # files['file'].close()

    # files = {'file': open(UPLOAD_PATH + '/temp/' + receive_data, 'rb')}
    # asr_result = requests.post(asrUrl, files=files)
    # files['file'].close()

    # print(sr_result)
    
    # if sr_result["result"] == "unkown":
    #     return jsonify({

    #     })

    # # todo 此处需要对请求成功与否做出判断
    # return jsonify({
    #     "sr": sr_result.json(),
    #     "asr": asr_result.json()
    # })


@app.route('/asr', methods=['GET', 'POST'])
def asr():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = asrUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/asr/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())


@app.route('/ser', methods=['GET', 'POST'])
def ser():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = serUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/ser/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())


@app.route('/sed', methods=['GET', 'POST'])
def sed():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = sedUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/sed/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())

@app.route('/sr', methods=['GET', 'POST'])
def sr():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = srUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/sr/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())


@app.route('/asr/temp', methods=['GET', 'POST'])
def asrtemp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = asrUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/temp/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())


@app.route('/ser/temp', methods=['GET', 'POST'])
def sertemp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = serUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/temp/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())


@app.route('/sed/temp', methods=['GET', 'POST'])
def sedtemp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = sedUrl
    AudioName = recv_data
    files = {'file': open(UPLOAD_PATH+'/temp/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())

@app.route('/sr/temp', methods=['GET', 'POST'])
def srtemp():
    recv_data = request.get_data().decode()
    print(recv_data)
    url = srUrl
    AudioName = recv_data
    for one_file in os.listdir(UPLOAD_PATH+'/temp/'):
        print(one_file)
    files = {'file': open(UPLOAD_PATH+'/temp/'+AudioName, 'rb')}
    data = requests.post(url, files=files)
    print(data.json())
    return jsonify(data.json())


def isAudioFormat(link):
    if (link.find('.mp3') > -1 or link.find('.wav') > -1 or link.find('.flac') > -1 or link.find('.webm') > -1):
        return True
    return False


@app.route('/upload/asr', methods=['GET', 'POST'])
def upload1():
    if request.method == 'POST':
        file = request.files['file']
        print(file)
        print(file.filename)
        upload_path = '{}/{}'.format(UPLOAD_FOLDER+'/temp', file.filename)
        file.save(upload_path)
        return file.filename


@app.route('/upload/ser', methods=['GET', 'POST'])
def upload2():
    if request.method == 'POST':
        file = request.files['file']
        upload_path = '{}/{}'.format(UPLOAD_FOLDER+'/temp', file.filename)
        file.save(upload_path)
        return file.filename


@app.route('/upload/sed', methods=['GET', 'POST'])
def upload3():
    if request.method == 'POST':
        file = request.files['file']
        upload_path = '{}/{}'.format(UPLOAD_FOLDER+'/temp', file.filename)
        file.save(upload_path)
        return file.filename

@app.route('/upload/sr', methods=['GET', 'POST'])
def upload4():
    if request.method == 'POST':
        file = request.files['file']
        upload_path = '{}/{}'.format(UPLOAD_FOLDER+'/temp', file.filename)
        file.save(upload_path)
        return file.filename
    else: 
        return False


@app.route("/receive_audio", methods=["POST"])
def receive_audio():
    file = request.files.get("audio")  # request.files.get("audio")
    # filename = time.strftime(
    #     '%Y-%m-%d %H:%M:%S', time.localtime(time.time())).replace(' ', '').replace('-', '').replace(':', '')+'.mp3'
    filename = request.form["mp3name"]
    servername = request.form["name"]
    print(filename)
    print(servername)

    if file:
        upload_path = '{}/{}'.format(UPLOAD_FOLDER+'/temp', filename)
        file.save(upload_path)

    # 这部分需要做格式转换，将pcm格式转化为wav格式
    # import wave
    # with open(upload_path, 'rb') as pcmfile:
    #     pcmdata = pcmfile.read()
    # with wave.open(upload_path + '.wav', 'wb') as wavfile:
    #     wavfile.setparams((1, 2, 16000, 0, 'NONE', 'NONE'))
    #     wavfile.writeframes(pcmdata)
    webm_path = upload_path
    wav_path = upload_path.split('.')[0] + '.wav'
    print("webm_path is " + webm_path)
    print("wav_path is " + wav_path)
    sampling_rate = 16000
    channel = 1
    webm_to_wav(webm_path, wav_path, sampling_rate, channel)
    return 'ok'

audio_stream_buffer = {}

@app.route('/vad_detected', methods=['POST'])
def vad_detected():
    """
    静音片段检测，该接口实现的功能有：
    1、创建缓冲区，保存前端传过来的语音流
    2、每3s做一次静音片段检测，步长为1s
    3、按照ip地址创建缓冲池
    """
    # vad_frames = json.dump(request.form.get('vad_frames'))
    vad_frames = list(json.loads(request.form.get('vad_frames')).values())

    # print(vad_frames)
    # print(audio_stream_buffer)
    # 首先判断该用户是否已经在缓冲池中
    if request.remote_addr not in audio_stream_buffer.keys():
        audio_stream_buffer[request.remote_addr] = {
            "id": [],
            "stream": [],
        }
    print("the ip is " + request.remote_addr)
    buffer_temp = audio_stream_buffer[request.remote_addr]['stream'].copy()
    position = bisect.bisect(audio_stream_buffer[request.remote_addr]['id'], request.form['id'])
    bisect.insort(audio_stream_buffer[request.remote_addr]['id'], request.form['id'])
    if position == 0:
        previous_frames = []
        previous_frames.extend(vad_frames)
        previous_frames.extend(buffer_temp)
        audio_stream_buffer[request.remote_addr]['stream'] = previous_frames
    else:
        previous_frames = buffer_temp[0: position * len(vad_frames)].copy()
        following_frames = buffer_temp[position * len(vad_frames): ].copy()
        previous_frames.extend(vad_frames)
        previous_frames.extend(following_frames)
        audio_stream_buffer[request.remote_addr]['stream'] = previous_frames

    print(request.form['id'] + '; ' + str(len(audio_stream_buffer[request.remote_addr]['stream'])))

    # 对大约3s的数据做静音检测
    if len(audio_stream_buffer[request.remote_addr]['stream']) >= 1365 * 36:
        # wavfile.write("/home/zhuchuanbo/vad_test/1234.wav", 16000, numpy.array(audio_stream_buffer[request.remote_addr]['stream']))

        # 去掉静音片段，并将1365 × 36之前的语音发送做语音识别和声纹识别
        intervals = librosa.effects.split(numpy.array(audio_stream_buffer[request.remote_addr]['stream']), top_db=30)
        interval_file_name = str(int(round(time.time() * 1000)))
        print(interval_file_name)
        results = {}
        vad_frame_left = 0
        print(intervals)
        for i in range(len(intervals)):
            # 此时需要分别请求 语音识别 和 声纹识别 两个接口（位于其它两个不同的服务器上），并将数据返回
            # 将语音保存temp文件中
            # wavfile.write(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i), 16000, intervals[i])
            
            # 判断右端点
            if intervals[i][1] == len(audio_stream_buffer[request.remote_addr]['stream']):
                vad_frame_left = intervals[i][0]
                break
            save_as_wav(
                numpy.array(audio_stream_buffer[request.remote_addr]['stream'][intervals[i][0]: intervals[i][1]]), 
                UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i)
            )

            files = {'file': open(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i), 'rb')}
            sr_result = requests.post(srUrl, files=files)
            files['file'].close()

            files = {'file': open(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i), 'rb')}
            asr_result = requests.post(asrUrl, files=files)
            files['file'].close()
            results[i] = {
                {
                    "sr": sr_result.json(),
                    "asr": asr_result.json()
                }
            }
        if vad_frame_left != 0:
            # 删除掉前面的片段
            audio_stream_buffer[request.remote_addr]['stream'] = audio_stream_buffer[request.remote_addr]['stream'][vad_frame_left: ]
        else:
            audio_stream_buffer[request.remote_addr]['stream'] = []

        # todo 此处需要对请求成功与否做出判断
        # audio_stream_buffer[request.remote_addr]['stream'] = []
        # print(intervals)
        print(sr_result)
        print(asr_result)
    
    return results
        
    
    # return 'ok'


@app.route('/enroll', methods=['GET', 'POST'])
def enroll():
    file = request.files.get("audio")
    filename = request.form["mp3name"]
    name = request.form["name"]
    print(file)
    if file:
        upload_path = '{}/{}'.format(UPLOAD_FOLDER+'/temp', filename)
        file.save(upload_path)
    url = enrollUrl
    files = {'file': open(UPLOAD_PATH+'/temp/'+filename, 'rb')}
    print("==============\n")
    print(filename)
    print("==============\n")
    req = {'name': name}
    data = requests.post(url, data = req, files = files)
    print(data.json())
    return jsonify(data.json())

@app.route('/changeServer', methods=['GET', 'POST'])
def changeServer():
    data = request.get_data();
    urlData = json.loads(data.decode("utf-8"));
    print(urlData)
    asrUrl = urlData.get('asrUrl')
    serUrl = urlData.get('serUrl')
    srUrl = urlData.get('srUrl')
    enrollUrl = urlData.get('enrollUrl')
    sedUrl = urlData.get('sedUrl')
    return 'OK'


video_path = os.path.join(APP_ROOT, 'static/img/test.mp4')


from dehaze_video import simplest_cb
from flask.wrappers import Response
import cv2 as cv


class VideoCamera(object):
    def __init__(self):

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


def gen_pro(camera):
    while True:
        camera.get_frame()
        image = simplest_cb(camera.last_frame, 1)
        ret, jpeg = cv.imencode('.jpg', image)

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(
        gen(VideoCamera()),
        mimetype='multipart/x-mixed-replace;boundary=frame'
    )

@app.route('/video_changed')
def video_changed():
    return Response(gen_pro(VideoCamera()),
                    mimetype='multipart/x-mixed-replace;boundary=frame')

@app.route('/opencv', methods=['GET'])
def opencv_html():
    if request.method == 'GET':
        return render_template("opencv.html")


def delfile(path):
    fileNames = glob.glob(path + r'\*')
    for fileName in fileNames:
        try:
            os.remove(fileName)
        except:
            try:
                os.rmdir(fileName)
            except:
                delfile(fileName)
                os.rmdir(fileName)



if __name__ == '__main__':
    #app.run(host="127.0.0.1", port=5000, debug=True)
    app.run(
        debug = True,
        host="0.0.0.0", 
        port=4000
    )
