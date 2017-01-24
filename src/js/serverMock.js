
var Random = Mock.Random;
var captchaImg = Random.dataImage('55x22', 'S2EQ');
var phoneNumber = '请发送xxx到100' + Random.natural(10,99);
console.log(phoneNumber);

var data = Mock.mock( // 保存申请时手机实名信息
	'/app/v1/sysUser/savePhoneInfo',
	{
		'status':0,		// 546：服务不可用、545：手机号或者服务密码错误、0成功、非0失败 /0|545|546/
		'data': {
			'jobid': /\d{8}/
		},
		'message': ''
	}
)
.mock(	// 根据省份和运营商，返回四种不同的验证规则
	'/app/v1/sysUser/getActiveCode',
	{
		// 541 手动短信  542 自动短信  543 图片验证   544 图片和短信验证    545 手机号或者服务密码错误    546：服务不可用
		'status': 541,
		'data': {
			'jobid': /\d{8}/,
			'captcha': captchaImg,
			'smsmessage': phoneNumber,
		},
		'message': ''
	}
)
.mock(	// 手动获取短信
	'/app/v1/sysUser/requestActiveCode',
	{
		'status': 0,		// 552 553重新获取
		'data': {
			'jobid': /\d{8}/,
			'captcha': captchaImg,
			'smsmessage': phoneNumber,
		},
		'message': ''
	}
)
.mock(	// 提交第四步
	'/app/v1/sysUser/repayRequestActiveCode',
	{
		'status': 500,		// 550验证码错误或者验证码过期
		'data': {},
		'message': ''
	}
)
.mock(	// 提交自动获取短信
	'/app/v1/sysUser/activeCode',
	{
		'status': 552,	// 552 第四步、还需要手机验证码	   553重新获取
		'data': {
			'jobid': /\d{8}/
		},
		'message': ''
	}
)
.mock(	// 提交图片验证
	'/app/v1/sysUser/imageCode',
	{
		'status': 0,	// 553 请重新获取验证码
		'data': {
			'jobid': /\d{8}/
		},
		'message': ''
	}
)
.mock(	// 提交图片和短信验证
	'/app/v1/sysUser/activeImageCode',
	{
		'status': 553,	// 553 请重新获取验证码
		'data': {
			'jobid': /\d{8}/
		},
		'message': ''
	}
)
