'use strict';

var wavesurfer;
var mp3name

var nowtime
var totaltime
var parent = '#tm-gallery-page-automaticspeechrecognition';
var waveform = '#waveform1';
var wavetimeline = '#wave-timeline1';
var wavespectrogram = '#wave-spectrogram1';
var flag = false

var sedresult

// Init & load
function initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag) {
    if (wavesurfer) {
        wavesurfer.destroy();
    }
    // 创建频谱图实例
    var options = {
        container: waveform,
        waveColor: 'violet',
        progressColor: '#0000ff',
        loaderColor: 'purple',
        cursorColor: '#ff0000',
        cursorWidth: 2,
        autoCenter: false,
        fillParent: true,
        hideScrollbar: false,
        plugins: [
            WaveSurfer.timeline.create({ //timeline plugin
                container: wavetimeline,
                height: 10,
            }),
            WaveSurfer.spectrogram.create({
                container: wavespectrogram,
                labels: false,

            })
        ]
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    if (location.search.match('normalize')) {
        options.normalize = true;
    }

    // console.log(options)
    wavesurfer = WaveSurfer.create(options);
    /* Progress bar */
    (function () {
        var progressDiv = document.querySelector('#progress-bar');
        var progressBar = progressDiv.querySelector('.progress-bar');

        var showProgress = function (percent) {
            progressDiv.style.display = 'block';
            progressBar.style.width = percent + '%';
        };

        var hideProgress = function () {
            progressDiv.style.display = 'none';
        };

        wavesurfer.on('loading', showProgress);
        wavesurfer.on('ready', hideProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
    })();
    // 前序操作已经保证：实时录音已上传到/temp目录下，而录音文件上传到其它目录下
    // 由于会议室记录系统不涉及语音文件上传，故先不考虑flag为false时的处理情况
    if (flag) {
        wavesurfer.load('static/uploads/temp/' + mp3name);
    } else {
        if (waveform == '#waveform1') {
            wavesurfer.load('static/uploads/asr/' + mp3name);
        } else if (waveform == '#waveform2') {
            wavesurfer.load('static/uploads/ser/' + mp3name);
        } else if (waveform == '#waveform3') {
            wavesurfer.load('static/uploads/sed/' + mp3name);
        } else if (waveform == '#waveform4') {
            wavesurfer.load('static/uploads/sr/' + mp3name);
        } else if (waveform == '#waveform5') {
            wavesurfer.load('static/uploads/sr/' + mp3name);
        }

    }

    wavesurfer.on("audioprocess", () => {
        nowtime = wavesurfer.getCurrentTime().toFixed(2);
        if (waveform == '#waveform3') {
            var temp = sedresult.result;
            if (temp.hasOwnProperty(parseInt(nowtime)))
                //var temp = sedresult.result[parseInt(nowtime)][1];
                $(parent).find("#decoderesult").text(temp[parseInt(nowtime)][1])
        }
        $(parent).find("#nowtime").text(nowtime);
    });
    wavesurfer.on("seek", () => {
        nowtime = wavesurfer.getCurrentTime().toFixed(2);
        if (waveform == '#waveform3') {
            var temp = sedresult.result[parseInt(nowtime)][1];
            $(parent).find("#decoderesult").text(temp)
        }
        $(parent).find("#nowtime").text(nowtime);
    });
    wavesurfer.on("ready", () => {
        $(parent).find("#nowtime").text(0);
        var totaltime = wavesurfer.getDuration().toFixed(2);
        $(parent).find("#totaltime").text(totaltime);
        var result;
        if (flag) {
            if (waveform == '#waveform1') {
                result = asrtemp(mp3name);
                $(parent).find("#decoderesult").text(result);
            } else if (waveform == '#waveform2') {
                result = sertemp(mp3name);
                $(parent).find("#decoderesult").text(result);
            } else if (waveform == '#waveform3') {
                sedresult = sedtemp(mp3name);
                $(parent).find("#decoderesult").text(sedresult.result[0][1]);
            } else if (waveform == '#waveform4') {
                result = srtemp(mp3name);
                console.log(result)
                if (result['result'] == '') {
                    $(parent).find("#speaker-name").text("unknown");
                    $('#register-info').text('User not registered!');
                    $('#mask').addClass('active');
                    $('#vp-dialog').addClass('active');
                    $('#vp-register').show();
                } else {
                    $(parent).find("#speaker-name").text(result['result']);
                }
            } else if (waveform == '#waveform5') {
                result = meetingtemp(mp3name);
                console.log(result)
                // 判断是否是声纹库中的人
                var speaker_name = result["sr"]["result"]
                var speech_recognition = result["asr"]["result"]
                var message = "successful recognition"
                if (speaker_name == "unkown") {
                    message = "failure recognition， the voice is not registered in the system!"
                    speaker_name = ""
                    speech_recognition = ""
                }
                $(parent).find("#message").text(message)
                $(parent).find("#speaker-name").text(speaker_name)
                $(parent).find("#speaker-recognition").text(speech_recognition)

            } else if (waveform == '#waveform6') {
                // 这里是会议室记录系统
                result = meetingtemp(mp3name);
                var old_value = document.getElementById("meeting-asr-sr").value;
                console.log(old_value);
                console.log(result);
                $("#meeting-asr-sr").text(old_value + '\n' + result['sr']['result'] + ": " + result['asr']['result']);
            }

        } else {
            if (waveform == '#waveform1') {
                result = asr(mp3name);
                $(parent).find("#decoderesult").text(result);
            } else if (waveform == '#waveform2') {
                result = ser(mp3name);
                $(parent).find("#decoderesult").text(result);
            } else if (waveform == '#waveform3') {
                sedresult = sed(mp3name);
                $(parent).find("#decoderesult").text(sedresult.result[0][1]);
            }
        }

    });

}

// document.addEventListener('DOMContentLoaded', function() {
//     initAndLoadSpectrogram(mp3name);
//     //Load a colormap json file to be passed to the spectrogram.create method.
//     // WaveSurfer.util
//     //     .fetchFile({ url: 'hot-colormap.json', responseType: 'json' })
//     //     .on('success', colorMap => {
//     //         initAndLoadSpectrogram(colorMap);
//     //     });
// });

var asr = function (mp3name) {
    var result;
    $.ajax({
        url: "/asr", //对应flask中的路由
        async: false,
        type: "POST", //请求方法
        data: mp3name, //传送的数据
        dataType: "text", //传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            console.log(data)
            result = eval('(' + data + ')');
        }
    })
    return result.result
}

var ser = function (mp3name) {
    var result;
    $.ajax({
        url: "/ser",                            //对应flask中的路由
        async: false,
        type: "POST",                           //请求方法
        data: mp3name,                          //传送的数据
        dataType: "text",                       //传送的数据类型
        success: function (data) {              //成功得到返回数据后回调的函数
            console.log(data)
            result = eval('(' + data + ')');

        }
    })
    return result.result
}

var sed = function (mp3name) {
    var result;
    $.ajax({
        url: "/sed",                            //对应flask中的路由
        async: false,
        type: "POST",                           //请求方法
        data: mp3name,                          //传送的数据
        dataType: "json",                       //传送的数据类型
        success: function (data) {              //成功得到返回数据后回调的函数
            console.log(data)
            result = data
        }
    })
    return result
};

// todo 声纹识别的ajax回调
var sr = function (mp3name) {
    var result;
    $.ajax({
        url: "/sr",                             //对应flask中的路由
        async: false,
        type: "POST",                           //请求方法
        data: mp3name,                          //传送的数据
        dataType: "json",                       //传送的数据类型
        success: function (data) {              //成功得到返回数据后回调的函数
            console.log(data)
            result = data
        }
    })
    return result
};

var asrtemp = function (mp3name) {
    var result;
    $.ajax({
        url: "/asr/temp", //对应flask中的路由
        async: false,
        type: "POST", //请求方法
        data: mp3name, //传送的数据
        dataType: "text", //传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            console.log(data)
            result = eval('(' + data + ')');
        }
    })
    return result.result
}

var sertemp = function (mp3name) {
    var result;
    $.ajax({
        url: "/ser/temp", //对应flask中的路由
        async: false,
        type: "POST", //请求方法
        data: mp3name, //传送的数据
        dataType: "text", //传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            console.log(data)
            result = eval('(' + data + ')');

        }
    })
    return result.result
}

var sedtemp = function (mp3name) {
    var result;
    $.ajax({
        url: "/sed/temp", //对应flask中的路由
        async: false,
        type: "POST", //请求方法
        data: mp3name, //传送的数据
        dataType: "json", //传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            console.log(data)
            result = data
        }
    })
    return result;
};

var srtemp = function (mp3name) {
    var result;
    $.ajax({
        url: "/sr/temp", //对应flask中的路由
        async: false,
        type: "POST", //请求方法
        data: mp3name, //传送的数据
        dataType: "json", //传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            console.log(data)
            result = data
        }
    })
    return result;
};

var meetingtemp = function (mp3name) {
    var result;
    $.ajax({
        url: "/meeting",
        async: false,
        type: "POST", //请求方法
        data: mp3name, //传送的数据
        dataType: "json", //传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            console.log(data)
            result = data
        }
    })
    return result;
}

// // 个性化语音识别
// var psr = function (mp3name) {
//     var results;
//     $.ajax({
//         url: "/psr",
//         async: false,
//         type: "POST", //请求方法
//         data: mp3name, //传送的数据
//         dataType: "json", //传送的数据类型
//         success: function (data) { //成功得到返回数据后回调的函数
//             console.log(data)
//             result = data
//         }
//     })
//     return results;
// }

function request(uri, form_data, callback) {
    $.ajax({
        url: uri,
        method: 'POST',
        data: form_data,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function (data) {
            callback(data)
        },
    })
}

// 设置监听事件，根据不同的选项卡，设置不同的提交方式
document.addEventListener('DOMContentLoaded', function () {
    $("#mp3_name1").change(function () {
        flag = false;
        parent = '#tm-gallery-page-automaticspeechrecognition';
        waveform = '#waveform1'
        wavetimeline = '#wave-timeline1'
        wavespectrogram = '#wave-spectrogram1'
        mp3name = this.value;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name);
    });
    $("#mp3_name2").change(function () {
        flag = false;
        parent = '#tm-gallery-page-emotionrecognition';
        waveform = '#waveform2'
        wavetimeline = '#wave-timeline2'
        wavespectrogram = '#wave-spectrogram2'
        mp3name = this.value;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name);
    });
    $("#mp3_name3").change(function () {
        flag = false;
        parent = '#tm-gallery-page-soundeventdetection';
        waveform = '#waveform3'
        wavetimeline = '#wave-timeline3'
        wavespectrogram = '#wave-spectrogram3'
        mp3name = this.value;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name);
    });

    $('#image1').change(function (e) {
        var form_data = new FormData($('#form1')[0]); //($('#form1')[0]);
        //form_data.append("file", );
        flag = true;
        var re;
        request('/upload/asr', form_data, function (data) {
            re = data;
        })
        mp3name = e.currentTarget.files[0].name;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag);
    });

    $('#image2').change(function (e) {
        var form_data = new FormData($('#form2')[0]);
        flag = true;
        var re;
        request('/upload/ser', form_data, function (data) {
            re = data;
        })
        mp3name = e.currentTarget.files[0].name;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag);
    });

    $('#image3').change(function (e) {
        var form_data = new FormData($('#form3')[0]);
        flag = true;
        $.ajax({
            url: '/upload/sed',
            method: 'POST',
            async: false,
            data: form_data,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function (data) {}
        });
        mp3name = e.currentTarget.files[0].name;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag);

    });
});

// 根据不同的选项卡，设置不同的页面
$(document).ready(function () {
    // Handle click on paging links
    $('.tm-paging-link').click(function (e) {
        if (wavesurfer) {
            wavesurfer.stop();
        }
        var page = $(this).text().toLowerCase();
        if (page == 'speakerrecognition') {

        } else {
            e.preventDefault();
            if (page == 'automaticspeechrecognition') {
                servername = 'asr';
                parent = '#tm-gallery-page-automaticspeechrecognition';
                waveform = '#waveform1';
                wavetimeline = '#wave-timeline1';
                wavespectrogram = '#wave-spectrogram1';
            } else if (page == 'emotionrecognition') {
                servername = 'ser';
                parent = '#tm-gallery-page-emotionrecognition';
                waveform = '#waveform2'
                wavetimeline = '#wave-timeline2'
                wavespectrogram = '#wave-spectrogram2'
            } else if (page == 'soundeventdetection') {
                servername = 'sed';
                parent = '#tm-gallery-page-soundeventdetection';
                waveform = '#waveform3'
                wavetimeline = '#wave-timeline3'
                wavespectrogram = '#wave-spectrogram3'
            }
        }
        $('.tm-gallery-page').addClass('hidden');
        $('#tm-gallery-page-' + page).removeClass('hidden');
        $('.tm-paging-link').removeClass('active');
        $(this).addClass("active");
    });

    $('#server-select').change(function () {
        var value = $('#server-select option:selected').val();
        var urlData;
        if (value == 'cloud') {
            urlData = serverSource['cloudServer'];
        } else if (value == 'edge') {
            urlData = serverSource['edgeServer'];
        }

        $.ajax({
            url: "/changeServer",
            type: 'post',
            async: false,
            processData: false,
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(urlData),
            dataType: 'json',
            success: function (data) {
                console.log(data);
            }
        });
    });
});

// document.addEventListener('DOMContentLoaded', function() {
//     var wavesurfer = WaveSurfer.create({
//         container: '#waveform',
//         barHeight: 2,
//         cursorColor:'#ff0000',
//         progressColor:'#0000ff',
//         scrollParent:true,
//         height:160,
//         cursorWidth:2,
//         autoCenter:false,
//         fillParent:true,
//         hideScrollbar:false,


//         plugins: [
//             WaveSurfer.timeline.create({        //timeline plugin
                                             
//             container: "#wave-timeline",
//             height: 10,
//         }),
//         WaveSurfer.cursor.create({                              //cursor plugin
//                 container:"#wave-cursor",
//                 showTime: true,
//                 opacity: 1,
//                 customShowTimeStyle: {
//                     'background-color': '#000',
//                     color: '#fff',
//                     padding: '2px',
//                     'font-size': '10px'
//                 }
//             }),
//          WaveSurfer.spectrogram.create({
//                 wavesurfer: wavesurfer,
//                 container: "#wave-spectrogram",
//                 labels: true,
//                 fftSamples:512
//             })
//       ]


//     });

//     //TimeLine
//     wavesurfer.on('ready', function () {
//       var timeline = Object.create(WaveSurfer.timeline);

//       timeline.create({
//         wavesurfer: wavesurfer,
//         container: '#wave-timeline'
//       });
//     });

//     // load 音频
//     wavesurfer.load('static/uploads/lemon.mp3');      //此处添加自己的音频路径（可将音频存入前端可访问的文件夹内，避免跨域）

//     console.log(wavesurfer.getDuration());                 //test
//     console.log(wavesurfer.getVolume());                   // test
//     setTimeout(function(){                                //test
//        console.log(wavesurfer.getDuration());
//     },500)

//     //Stop
//     btnStop.addEventListener('click', function () {
//         wavesurfer.stop();
//     });

//     // PlayPause
//     var playPause = document.querySelector('#playPause');
//     playPause.addEventListener('click', function() {
//         wavesurfer.playPause();
//     });
//     // Toggle play/pause text
//     wavesurfer.on('play', function() {
//         document.querySelector('#play').style.display = 'none';
//         document.querySelector('#pause').style.display = '';
//     });
//     wavesurfer.on('pause', function() {
//         document.querySelector('#play').style.display = '';
//         document.querySelector('#pause').style.display = 'none';
//     });

//     var d1 = new Date();                          //test
//     console.log(d1.toLocaleString());               //test
//     console.log('test');                            //test

//         // Zoom slider
//     var slider = document.querySelector('[data-action="zoom"]');
//     slider.value = wavesurfer.params.minPxPerSec;
//     slider.min = wavesurfer.params.minPxPerSec;
//     slider.addEventListener('input', function() {
//         wavesurfer.zoom(Number(this.value));
//     });

//     });