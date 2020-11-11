function showMessage(text){
	$('#register-info').text(text);
	$('#mask').addClass('active');
	$('#vp-dialog').addClass('active');
	$('#vp-register').hide();
}


$(document).ready(function(){
	(function(){
		servername = 'sr';
        parent = '#voiceprintdetection-distinguish-page';
        waveform = '#waveform4';
        wavetimeline = '#wave-timeline4';
        wavespectrogram = '#wave-spectrogram4';
	})();

	//选项卡切换
	$('.voiceprint-paging-item').click(function (e) {
        e.preventDefault();
        var index = $('.voiceprint-paging-item').index($(this));
        if(index == 0){
        	servername = 'sr';
            parent = '#voiceprintdetection-distinguish-page';
            waveform = '#waveform4';
            wavetimeline = '#wave-timeline4';
            wavespectrogram = '#wave-spectrogram4';
        }
        else if(index == 1){
        	servername = 'sr';
            parent = '#voiceprintdetection-speechrecognition-page';
            waveform = '#waveform5';
            wavetimeline = '#wave-timeline5';
            wavespectrogram = '#wave-spectrogram5';
        }

        $('.voiceprint-paging-link').removeClass('active');
        $('.voiceprint-paging-item').eq(index).find('.voiceprint-paging-link').addClass('active');
        $('.vd-gallery-page').eq(index).removeClass('hidden').siblings().addClass('hidden');
    });

    //返回主页面
    // $('#return-index-btn').click(function(){
    // 	servername = 'asr';
    //     parent = '#tm-gallery-page-automaticspeechrecognition';
    //     waveform = '#waveform1';
    //     wavetimeline = '#wave-timeline1';
    //     wavespectrogram = '#wave-spectrogram1';
    // });

	//关闭弹窗
    $('#vp-dialog-quit').click(function(e){
    	e.preventDefault();
    	$('#vp-dialog').removeClass('active');
    	$('#mask').removeClass('active');
    });

    //弹窗中的注册链接
    $('#vp-register').click(function(e){
    	e.preventDefault();
    	$('#vp-dialog').removeClass('active');
    	$('.voiceprint-paging-link').removeClass('active');
    	$('.voiceprint-paging-item').eq(0).find('.voiceprint-paging-link').addClass('active');
        $('.vd-gallery-page').eq(0).removeClass('hidden').siblings().addClass('hidden');
        $('#mask').removeClass('active');
    });

    $("#mp3_name4").change(function () {
        flag = false;
        parent = '#voiceprintdetection-distinguish-page';
        waveform = '#waveform4';
        wavetimeline = '#wave-timeline4';
        wavespectrogram = '#wave-spectrogram4';
        mp3name = this.value;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name);
    });

    // 注册时候的录音——开始录音
    var startRegisterReco = false;
    var registerRecoVideo = null;
    var registerFormdata = new FormData();
    $('#register-recording-start').click(function(){
		console.log(startRegisterReco)
    	if(!startRegisterReco){
	    	navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
		    navigator.getUserMedia({
		        audio: true,
		    }, function (stream) {
		        registerRecoVideo = RecordRTC(
					stream, {
						type: 'audio'
					}
				);

		        registerRecoVideo.startRecording();

		    }, function (error) {
		        alert(error.toString());
		    });
		    startRegisterReco = true;
		}
    });

	// 注册时候的录音，结束录音
    $('#register-recording-end').click(function(){
    	if(startRegisterReco){
			// todo, 这里需要设置同步、异步按钮
			// js  同步实现: 因为会异步调用设置的方法，必须要等其执行完才能想向下执行
	    	registerRecoVideo.stopRecording(function () {
		        var fileName = getTime() + '.webm';
		        registerFormdata.set("audio", registerRecoVideo.getBlob()); // form input type="file"
				registerFormdata.set("mp3name", fileName);
				startRegisterReco = false;
		    });
	    }
	});

	// 录音文件上传，注册按钮的ID，改变事件
	$('#vp-file').change(function(){
		var voiceFile = $('#vp-file').prop('files')[0];
		// var reader = new FileReader();
		// var rs = reader.readAsArrayBuffer(voiceFile);
		// reader.onload =function(e){
		// 	if(typeof e.target.result === 'object'){
		// 		registerFormdata.set("audio", new Blob([e.target.result]));
		// 	}
		// 	else{
		// 		registerFormdata.set("audio", e.target.result);
		// 	}
		// }
		var fileName = getTime() + '.wav';
		console.log(voiceFile)
		registerFormdata.set("audio", voiceFile);
		registerFormdata.set("mp3name", fileName);
	});

	// 声纹识别中上传语音文件，voice recognition的ID，改变事件
	$('#vp-file1').change(function(e){
		var form_data = new FormData($('#vp-form1')[0]);
        flag = true;
        var re;
        request('/upload/sr', form_data, function (data) {
            re = data;
        })
        mp3name = e.currentTarget.files[0].name;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag);
	});

	// 说话人识别中上传语音文件，personal speaker recognition的ID：改变事件
	$('#vp-file2').change(function(e){
		var form_data = new FormData($('#vp-form2')[0]);
        flag = true;
        var re;
        request('/upload/sr', form_data, function (data) {
            re = data;
        })
        mp3name = e.currentTarget.files[0].name;
        initAndLoadSpectrogram(parent, waveform, wavetimeline, wavespectrogram, mp3name, flag);
	});

    // 声纹注册表单提交，提交注册按钮：点击事件
    $('#register-submit').click(function(){
		console.log(registerFormdata)
    	var name = $("#voice-name").val();
    	registerFormdata.set("name", name);

    	if(name == '' || (registerRecoVideo == null && $('#vp-file').val() == '')){
    		var info = 'Please complete the information!';
    		showMessage(info);
    	}
    	else{
	    	$.ajax({
	            url: "/enroll",
	            type: 'post',
	            async: false,
	            processData: false,
	            contentType: false,
	            data: registerFormdata,
	            dataType: 'json',
	            success: function (data) {
	                console.log(data);
	                var info = data['result'];
	                showMessage(info);
	            }
	        });
	        registerRecoVideo = null;
	    }
	    return false;
    });

});
