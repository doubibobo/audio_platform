var wavesurfer = window.wavesurfer;
var servername = 'asr';
var count = 0;                      // 会议室记录系统中对于语音的编号，默认为0

console.log(wavesurfer)
var GLOBAL_ACTIONS = {
    play: function () {
        wavesurfer.playPause();
    },

    back: function () {
        wavesurfer.skipBackward();
    },

    forth: function () {
        wavesurfer.skipForward();
    },

    stop: function () {
        wavesurfer.stop();
    },
    start_reco: function () {
        startre();
    },
    ai_reco: function () {
        stopre();
    },
    // register_recording: function () {
    //     register_record();
    // },
    // register_end_recording: function () {
    //     register_record_ending();
    // },
    meeting_reco_starting: function () {
        startremeeting();
    }, 
    meeting_reco_ending: function () {
        endremeeting();
    },
    'toggle-mute': function () {
        wavesurfer.toggleMute();
    }
};

// ATTENTION: THE PERMISSION IS ONLY AGREED BY THE PROTOCOL OF HTTPS
//录音
var reco = null;
var audio_context = null;
var recordVideo = null;
var timer = null;           // 定时器变量

function getTime() {
    var date = new Date();
    //年
    var year = date.getFullYear();
    //月
    var month = date.getMonth() + 1;
    //日
    var day = date.getDate();
    //时
    var hh = date.getHours();
    //分
    var mm = date.getMinutes();
    //秒
    var ss = date.getSeconds();
    var rq = year + month + day + hh + mm + ss;
    return rq
}

function startre() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(
        {
            audio: true,
        }, 
        function (stream) {
            recordVideo = RecordRTC(
                stream, {
                    type: 'audio',
                }
            );
            recordVideo.startRecording();
        }, 
        function (error) {
            alert(error.toString());
        }
    );
}

function stopre() {
    recordVideo.stopRecording(function () {
        flag = true;
        mp3name = getTime() + '.webm';
        var formdata = new FormData(); // form 表单 {key:value}
        formdata.append("audio", recordVideo.getBlob()); // form input type="file"
        formdata.append("name", servername);
        formdata.append("mp3name", mp3name);
        // formData.append('video-blob', recordVideo.getBlob());
        $.ajax({
            url: "/receive_audio",
            type: 'post',
            async: false,
            processData: false,
            contentType: false,
            data: formdata,
            dataType: 'json',
            success: function (data) {
                console.log(data);
            }
        })

        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag);

    });
}

function startremeeting() {
    // 开启录音功能
    startre()
    // 记录语音的段数
    count = 0
    timer = setInterval(posttempdata, 10000)
    console.log("1234567")
}

// TODO 这里应该采取缓冲区的做法，判断当前缓冲区里面的文件
// TODO 是否包含转折片段
// TODO 如果包含转折片段，则需进行定位
// TODO 将转折之前的片段发送到后端服务器中
// TODO 转折之后的判断再从开始放起

function posttempdata() {
    recordVideo.stopRecording(function () {
        flag = true;
        mp3name = getTime() + '_' + count + '.webm';
        count++;

        // 填充并设置表单
        var formdata = new FormData();
        formdata.append("audio", recordVideo.getBlob());
        formdata.append("name", "asr_sr")
        formdata.append("mp3name", mp3name)
        
        // 发送同步请求
        $.ajax({
            url: "/receive_audio",
            type: "post",
            async: true,
            processData: false,
            contentType: false,
            data: formdata,
            dataType: 'json',
            success: function (data) {
                console.log(data);
            }
        })
        
        // 展示语音的相关信息
        initAndLoadSpectrogram(parent, "#waveform6", "#wave-timeline6", "#wave-spectrogram6", mp3name, flag);
    })
    // 重新开启录音
    startre()
}

function endremeeting() {
    if (timer == null) {
        alert("please first beginning the recording before stopping! ")
    } else {
        clearInterval(timer)
        console.log("posting ended!")
    }
}

// function register_record_ending() {
//     recordVideo.stopRecording
// }


// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (e) {
        var map = {
            32: 'play', // space
            37: 'back', // left
            39: 'forth' // right
        };
        var action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target) {
                e.preventDefault();
            }
            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function (el) {
        el.addEventListener('click', function (e) {
            var action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});

// Misc
document.addEventListener('DOMContentLoaded', function () {
    // Web Audio not supported
    if (!window.AudioContext && !window.webkitAudioContext) {
        var demo = document.querySelector('#demo');
        if (demo) {
            // demo.innerHTML = '<img src="/example/screenshot.png" />';
        }
    }

    // Navbar links
    // var ul = document.querySelector('.nav-pills');
    // var pills = ul.querySelectorAll('li');
    // var active = pills[0];
    // if (location.search) {
    //     var first = location.search.split('&')[0];
    //     var link = ul.querySelector('a[href="' + first + '"]');
    //     if (link) {
    //         active = link.parentNode;
    //     }
    // }
    // active && active.classList.add('active');
});