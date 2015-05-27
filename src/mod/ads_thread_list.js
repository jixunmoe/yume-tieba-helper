{
	name: '屏蔽直播贴等乱七八糟内容 (实验性)',
	desc: '如题。',
	flag: ~0,
	_init: function () {
		var $ads = [
			// 帖子列表顶部, 如直播贴
			'#threadListGroupCnt'
		].join(', ');

		$($ads).remove();
		$('<style>').text($ads + '{display: none !important}').appendTo('head');
	}
}