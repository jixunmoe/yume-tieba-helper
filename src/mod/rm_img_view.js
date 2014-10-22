{
	name: '看图模式屏蔽',
	desc: '还原旧版贴吧点图看大图功能',
	flag: __type_floor,

	rmImg: function ($root) {
		$('img.BDE_Image', $root).each(function () {
			var m = this.src.match(/\/sign=[a-z0-9]+\/(.+)/i);
			if (!m) return ;
			var imgLink = '//imgsrc.baidu.com/forum/pic/item/' + m[1];
			$('<a>')
				.attr('href', imgLink)
				.attr('target', '_blank')
				.append($('<img>').attr('src', imgLink).addClass('jx_no_overflow'))
				.insertAfter (this);
			$(this).remove();
		});
	},
	_init: function () {
		_css.append ('.jx_no_overflow { max-width: 100%; }');
		this.rmImg (document);
	},
	_proc: function (floorType, args) {
		this.rmImg (args._main);
	}
}