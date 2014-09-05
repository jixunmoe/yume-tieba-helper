{
	name: '隐藏用户图标',
	desc: '将用户名下方、右方的图标集藏起来。',
	def: false,
	flag: ~0,
	_init: function () {
		_hide ('.icon_wrap');
	}
}