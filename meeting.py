from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from SqQueue import SqQueue

import time
import json
import numpy
import webrtcvad
import struct
import wave

app = Flask(__name__)

socketIO = SocketIO()
socketIO.init_app(app)

"""
对app进行一些路由设置
"""

"""
对socket进行一些监听设置
"""
# 设置全局缓冲
audio_stream_buffer = {}
# 设置文件上传默认路径
UPLOAD_PATH = 'static/uploads'
asrUrl = 'http://127.0.0.1:9010/asr'
srUrl = 'http://127.0.0.1:9008/sr'


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
    vad.set_mode(0)
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
        # print(intervals)
        # print(segments)
        return intervals


def save_wave(wav, file_path):
    # 配置声道数、量化位数和取样频率
    file = wave.open(file_path, 'wb')
    file.setnchannels(1)
    file.setsampwidth(2)
    file.setframerate(16000)
    # 将wav_data转换为二进制数据写入文件
    file.writeframes(wav.tostring())
    file.close()


@app.route('/')
def index():
    return render_template('new_meeting.html', async_mode=socketIO.async_mode)


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
    time.sleep(5)
    print("收到请求！")
    key, value = data['remote_addr'], audio_stream_buffer[data['remote_addr']]
    # 记录首次静音检测片段的大小
    vad_frame_length = 4096 * 12
    while audio_stream_buffer[key]['stream'].queue_length() != 0:
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

                    # files = {'file': open(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i) + '.wav', 'rb')}
                    # sr_result = requests.post(srUrl, files=files)
                    # files['file'].close()
                    #
                    # files = {'file': open(UPLOAD_PATH + '/temp/' + interval_file_name + '_' + str(i) + '.wav', 'rb')}
                    # asr_result = requests.post(asrUrl, files=files)
                    # files['file'].close()
                    # TODO asr_result.json(), sr.result.json()
                    # results[i] = {
                    #     "sr": {'result': 'unknown'},
                    #     "asr": {'result': '*******'}
                    # }
                    emit('asr_sr_result', {
                        'code': 200,
                        "sr": {'result': 'unknown'},
                        "asr": {'result': '*******'}
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
            # break
            continue
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
def give_response(data):
    """
    用于接收前端传来的数据，并返回处理结果
    :param data:
    :return:
    """
    value = data.get('param')
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
    socketIO.run(
        app,
        debug=True,
        host='0.0.0.0',
        port=5000
    )
