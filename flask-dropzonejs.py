from flask import Flask, render_template, request, jsonify
import os
import requests
import json
import datetime
import time
import glob
import json

app = Flask(__name__)
UPLOAD_PATH = 'static/uploads'
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(APP_ROOT, UPLOAD_PATH)
TEMP_FOLDER = os.path.join(UPLOAD_FOLDER, 'temp')

# server url
asrUrl = 'http://127.0.0.1:9009/asr'
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
    return 'ok'

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


if __name__ == '__main__':
    #app.run(host="127.0.0.1", port=5000, debug=True)
    app.run(
        debug = True,
        host="0.0.0.0", 
        port=4000
    )
