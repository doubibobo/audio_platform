from flask import Flask
from flask_socketio import SocketIO, emit

import time

app = Flask(__name__)

socketIO = SocketIO()
socketIO.init_app(app)

"""
对app进行一些路由设置
"""

"""
对socket进行一些监听设置
"""


@socketIO.on('request_for_response', namespace='/test')
def give_response(data):
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
