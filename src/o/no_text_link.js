{
	name: '屏蔽帖子内文字推广链接',
	desc: '将帖子内的文字推广搜索链接替换为普通文本',
	flag: __type_lzl | __type_floor,
	_proc: function (floorType, args) {
		this.rmLinkText (args._main);
	},
	_init: function () {
		this.rmLinkText ();
	},
	rmLinkText: function (_p) {
		$(_p || 'body').find ('a.ps_cb').each(function () {
			$(this).after (document.createTextNode (this.textContent));
		}).remove();
	}
}