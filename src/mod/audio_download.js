{
	name: '贴吧语音下载',
	desc: '下载贴吧语音~ 啦啦啦~',
	flag: __type_floor | __type_lzl,
	_proc: function (floorType, args) {
		var _player = $('.voice_player:not(.parsed)', args._main);
		if (!_player.size()) return '找不到语音';

		var data = _player.parents('[data-field]').getField(),
			pid = data.spid || data.content.post_id;

		_player.addClass('parsed').after (
			$('<a>').addClass('ui_btn ui_btn_m')
				.attr({
					href: '/voice/index?tid=' + wPageData.thread.thread_id + '&pid=' + pid,
					download: '语音-' + (data.user_name || data.author.user_name) + '-' + pid + '.mp3'
				})
				.css ({
					marginLeft: '1em'
				})
				.append ($('<span>').text('下载'))
		).after($('<br>'));
	}
}