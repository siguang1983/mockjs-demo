/*
* auth: siguang
* date: 2017/01/16
* 手机实名
*/
$(function(){

	var statusCode = 0,						// 存储状态码
		sendUrl = '',						// 提交URL
		dataInfo = null,					// response数据
		isRequestCode = false,				// 请求状态
		returnCode = '',					// 第二种状态，针对自动验证码第三步返回552情况
		codeTimer = null;					

	var oPhone = $("#phone"),				// 手机号
		oPassword = $("#password"),			// 服务密码
		oImageCode = $("#imageCode"),		// 图片验证
		oSmsVerify = $("#smsVerify"),		// 短信验证
		oAgreement = $("#agreement");		// 授权

	var oPhoneBox = $("#phoneBox"),
		oPasswordBox = $("#passwordBox"),
		oPhotoCaptchaBox = $("#photoCaptchaBox"),
		oMessageBox = $("#messageBox"),
		oAuthorizationBox = $("#authorizationBox"),
		oGetCodeBtn = $("#getCodeBtn"),			// 获取短信验证码按钮
		oGetPictureBtn = $("#getPictureBtn"),	// 获取图片验证码按钮
		oImgCode = $("#imgCode"),
		oQuestMessage = $("#questMessage");	

	// 表单验证规则
	var verify = {
		phone: function(val){
			if(val == ''){
				AppCommon.appDialog({
	                message: '请输入手机号码',
	                status: 'alert'
	            });
				return false;
			}
			if(!AppCommon.re.regPhoneNum(val)){
				AppCommon.appDialog({
	                message: '手机号码输入错误',
	                status: 'alert'
	            });
				return false;
			}
			return true;
		},
		password: function(val){
			if(val == ''){
				AppCommon.appDialog({
	                message: '服务密码不能为空',
	                status: 'alert'
	            });
				return false;
			}
			if(!AppCommon.re.regPassword1(val)){
				AppCommon.appDialog({
	                message: '请输入6-16位数字,字母,字符组合',
	                status: 'alert'
	            });
				return false;
			}
			return true;
		},
		captcha: function(val){
			if(val == '' || val.length < 4){
				AppCommon.appDialog({
	                message: '验证码输入错误',
	                status: 'alert'
	            });
				return false;
			}
			return true;
		},
		messageCode: function(val){
			if(val == '' || val.length < 6){
				AppCommon.appDialog({
	                message: '短信验证码输入错误',
	                status: 'alert'
	            });
				return false;
			}
			return true;
		},
		agreement: function(){
			if(oAgreement.is(':checked')){
				return true;
			}
			else{
				AppCommon.appDialog({
	                message: '请同意协议协议并勾选',
	                status: 'alert'
	            });
	            return false;
			}
		}
	}

	// 清空表单元素值
	function clearFromValue(){
		oPhone.val('');
		oPassword.val('');
		oImageCode.val('');
		oSmsVerify.val('');
		dataInfo = null;
		statusCode = 0;
		isRequestCode = false;
	}

	// 清除定时器
	function clearTime(){
		clearInterval(codeTimer);
		oGetCodeBtn.attr({'data-msg-status': 'true'}).text('获取验证码');
		oGetPictureBtn.attr({'data-msg-status': 'true'}).text('获取验证码');
	}

	// 根据状态码切换状态和展示元素
	function statusChange(){
		$(".user-pwd").hide();
		oAuthorizationBox.hide();
		oQuestMessage.hide();
		oGetCodeBtn.show();

		switch(statusCode){
			case 0:
				oPasswordBox.show();
				oAuthorizationBox.show();
				break;

			case 541: 	// 手动获取手机验证码
				oMessageBox.show();
				break;

			case 542: 	// 自动获取手机验证码
				oMessageBox.show();
				computeRequestTime(oGetCodeBtn);
				break;

			case 543:
				oImgCode.attr({'src': dataInfo.captcha});
				oPhotoCaptchaBox.show();
				computeRequestTime(oGetPictureBtn);
				break;

			case 544:
				computeRequestTime(oGetPictureBtn);
				oImgCode.attr({'src': dataInfo.captcha});
				oQuestMessage.text(dataInfo.smsmessage);
				oGetCodeBtn.hide();
				oQuestMessage.show();
				oMessageBox.show();
				oPhotoCaptchaBox.show();
				break;

			default: break;
		}
	}

	/*
	* 获取验证码计时用于图片和短信 
	* @btnId 点击按钮的id
	* @fn 可选参数  用于点击获取验证码时触发的方法
	*/ 
	function computeRequestTime(btnId, fn){
		var isQuery = btnId.attr('data-msg-status');
		var time = 60;

		if(isQuery == 'true'){
			if(fn){
				fn();
			}			
			isRequestCode = false;
			btnId.attr({'data-msg-status': 'false'});
			codeTimer = setInterval(function(){
				time--;
				if(time <= 0){
					clearInterval(codeTimer);
					isRequestCode = true;
					btnId.attr({'data-msg-status': 'true'}).text('获取验证码');
				}
				else{
					btnId.text(time + '秒后获取');
				}
			}, 1000);
		}		
	}


	// 第一步 提交手机服务密码
	function sendSavePhoneInfo(){
		if(!verify.password(oPassword.val())){
			return ;
		}
		if(!verify.agreement()){
			return ;
		}

		AppCommon.ajax({
            url: sendUrl,
            type: "post",
            data: {
            	servicePasswork: oPassword.val(),
            	latitude: '',
            	longitude: ''
            },
            success: function(response) {
            	var resStatus = response.status;
				
				// 提交成功，请求步聚2
            	if(resStatus == 0){
					dataInfo = response.data;
					getActiveCode();
            	}
            	else if(resStatus == 546){
            		AppCommon.appDialog({
		                message: '服务不可用',
		                status: 'alert'
		            });
            	}
            	else if(resStatus == 545){
            		AppCommon.appDialog({
		                message: '手机号或者服务密码错误',
		                status: 'alert'
		            });
            	}
            	else {
            		AppCommon.appDialog({
		                message: response.message,
		                status: 'alert'
		            });
            	}
            },
            error: function(err) {
				AppCommon.appDialog({
				    message: '网络发生错误请稍后在试',
				    status: 'alert'
				});
            }
        });
	}

	// 第二步 根据省份和运营商，返回四种不同的验证规则
	function getActiveCode(){
		AppCommon.ajax({
            url: '/app/v1/sysUser/getActiveCode',
            type: "post",
            data: {
            	jobid: dataInfo.jobid
            },
            dataType: 'json',
            success: function(response) {
            	var resStatus = response.status;

            	if(resStatus == 0){
					// 成功

					return ;
				}
				else if (/^(541|542|543|544)$/.test(resStatus)){
            		statusCode = resStatus;
					dataInfo = response.data;
            	}
            	else if(resStatus == 545){
            		AppCommon.appDialog({
		                message: '手机号或者服务密码错误',
		                status: 'alert'
		            });
            	}
            	else if (resStatus == 545){
            		AppCommon.appDialog({
		                message: '服务不可用',
		                status: 'alert'
		            });
            	}
            	else {
        			AppCommon.appDialog({
		                message: response.message,
		                status: 'alert'
		            });
            	}
            	statusChange();
            },
            error: function(err) {
				AppCommon.appDialog({
				    message: '网络发生错误请稍后在试',
				    status: 'alert'
				});
            }
        });
	}

	// 获取手动获取短信验证码
	function getMessageCode(){
		AppCommon.ajax({
            url: '/app/v1/sysUser/requestActiveCode',
            type: "post",
            data: {
            	"jobid": dataInfo.jobid
            },
            dataType: 'json',
            success: function(response) {
            	var resStatus = response.status;

            	if(resStatus == 552 || resStatus == 553){
            		clearTime();
            		AppCommon.appDialog({
		                message: '请重新获取验证码',
		                status: 'alert'
		            });
            	}
            	else{
            		if(resStatus != 0){
            			AppCommon.appDialog({
			                message: response.message,
			                status: 'alert'
			            });
            		}            		
            	}        		
            },
            error: function(response) {
				AppCommon.appDialog({
				    message: '网络发生错误请稍后在试',
				    status: 'alert'
				});
            }
        });
	}


	// 第四步1 提交手动短信验证码
	function sendManualMessageCode(){
		var smsCode = oSmsVerify.val();
		if(!verify.messageCode(smsCode)){
			return ;
		}

		AppCommon.ajax({
            url: sendUrl,
            type: "post",
            timeout:100,
            data: {
            	"jobid": dataInfo.jobid,
				"activecode": smsCode
            },
            dataType: 'json',
            success: function(response) {
            	if(response.status == '0'){
            		// 提交成功
            	}
            	else if (response.status == '500'){
            		clearTime();
            		AppCommon.appDialog({
		                message: '验证码错误或已过期，请重新获取验证码',
		                status: 'alert'
		            });
            	}
            	else{
            		AppCommon.appDialog({
		                message: response.message,
		                status: 'alert'
		            });
            	}
            },
            error: function(response) {
				AppCommon.appDialog({
				    message: '网络发生错误请稍后在试',
				    status: 'alert'
				});
            }
        });
	}


	// 第三步2 提交自动获取短信验证码
	function sendAutoMessageCode(){
		if(!verify.messageCode(oSmsVerify.val())){
			return ;
		}

		AppCommon.ajax({
            url: sendUrl,
            type: "post",
            data: {
            	"jobid": dataInfo.jobid,
				"activecode": oSmsVerify.val()
            },
            dataType: 'json',
            success: function(response) {
            	if(response.status == '0'){
            		// 提交成功
            		returnCode = '';
            	}
            	else if(response.status = '552'){
					$("#smsVerify").val('');
					computeRequestTime(oGetCodeBtn);
            		returnCode = 552;
            	}
            	else {
            		AppCommon.appDialog({
		                message: response.message,
		                status: 'alert'
		            });
		            returnCode = '';
            	}
            },
            error: function(response) {
				AppCommon.appDialog({
				    message: '网络发生错误请稍后在试',
				    status: 'alert'
				});
            }
        });
	}

	// 第三步3 提交图片验证码
	function sendPhotoCode(){
		var imageCode = oImageCode.val();

		if(!verify.captcha(imageCode)){
			return ;
		}

		AppCommon.ajax({
            url: sendUrl,
            type: "post",
            data: {
            	"jobid": dataInfo.jobid,
				"imagecode": imageCode 
            },
            dataType: 'json',
            success: function(response) {
            	if(response.status == '0'){
            		// 提交成功
            	}
            	else if(response.status == '553'){
            		AppCommon.appDialog({
		                message: '请重新获取验证码',
		                status: 'alert'
		            });
		            getActiveCode();
            	}
            	else{
            		AppCommon.appDialog({
		                message: response.message,
		                status: 'alert'
		            });
            	}
            },
            error: function(response) {
            	// 21
            	console.log('图片验码提交成功')
            }
        });
	}

	// 第三步4 提交短信和图片验证码
	function sendMessageAndPhotoCode(){
		var smsCode = oSmsVerify.val(),
			imageCode = oImageCode.val();

		if(!verify.captcha(imageCode)){
			return ;
		}		
		if(!verify.messageCode(smsCode)){
			return ;
		}

		AppCommon.ajax({
            url: sendUrl,
            type: "post",
            data: {
            	"jobid": dataInfo.jobid,
				"imagecode": imageCode,
				"activecode": smsCode
            },
            dataType: 'json',
            success: function(response) {
            	if(response.status == '0'){
            		// 提交成功
            	}
            	else if(response.status == '553'){
            		AppCommon.appDialog({
		                message: '重新获取验证码',
		                status: 'alert'
		            });
            	}
            	else{
            		AppCommon.appDialog({
		                message: response.message,
		                status: 'alert'
		            });
            	}
            },
            error: function(response) {
				AppCommon.appDialog({
				    message: '网络发生错误请稍后在试',
				    status: 'alert'
				});
            }
        });
	}


	// 初始化
	function init(){
		sendUrl = '/app/v1/sysUser/savePhoneInfo';
		oPasswordBox.show();

		$("#submitVerification").on('tap', function(){
			switch(statusCode){
				case 0:
					sendUrl = "/app/v1/sysUser/savePhoneInfo";
					sendSavePhoneInfo();
					break;

				case 541:
					sendUrl = '/app/v1/sysUser/repayRequestActiveCode';
					oGetCodeBtn.attr('data-msg-status', 'false');
					sendManualMessageCode();
					break;

				case 542:
					if(returnCode == '552'){
						sendUrl = '/app/v1/sysUser/repayRequestActiveCode';
						sendManualMessageCode();
					}
					else{
						sendUrl = '/app/v1/sysUser/activeCode';
						sendAutoMessageCode();
					}
					break;

				case 543:
					sendUrl = '/app/v1/sysUser/imageCode';
					sendPhotoCode();
					break;

				case 544:
					sendUrl = '/app/v1/sysUser/activeImageCode';
					sendMessageAndPhotoCode();
					break;

				default: break;
			}
		})

		$("#getCodeBtn").on('tap', function(){
			if(statusCode == 541){
				computeRequestTime(oGetCodeBtn, getMessageCode);
			}
			else if(statusCode == 542){
				computeRequestTime(oGetCodeBtn, getActiveCode);
			}

			// if(statusCode == '542'){
			// 	如果自动调用，第三步情况二分两种情况，
			// 	1是直接成功提交完成，2是返回522状态还需要调用第四步
			// 	如果非
			// 	if(returnCode == ''){
			// 		computeRequestTime(getActiveCode);
			// 	}
			// 	else if(returnCode == '552'){
			// 		computeRequestTime(getActiveCode);		// 重获取走第二步
			// 	}
			// }
		})

		// 获取图片验证码
		$("#getPictureBtn").on('tap', function(){
			computeRequestTime(oGetPictureBtn, getActiveCode);
		})
	}
	
	init();
})
