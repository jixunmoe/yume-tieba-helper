{
	name: '移除会员彩名',
	desc: '全部变成变成默认链接颜色。',
	flag: __type_floor | __type_lzl | __type_forum,

	clsList: ['sign_highlight', 'vip_red', 'fiesta_member', 'fiesta_member_red', 'member_thread_title_frs', 'sign_highlight'],

	rmOrange: function (target) {
		var $target = $(target);

		for (var i = 1; i < this.clsList.length; i++)
			$('.' + this.clsList[i], $target.removeClass (this.clsList[i])).removeClass(this.clsList[i]);
	},

	_init: function () {
		// 标题红名移除
		this.rmOrange ('body');
	},
	_proc: function (floorType, args) {
		this.rmOrange (args._main);
	}

}