{
	name: '楼中楼帖子引用',
	desc: '引用楼中楼的回复',
	flag: __type_lzl,
	_proc: function (floorType, args) {
		$('<a>').text('引用').addClass('jx d_tail')
			.insertBefore($('.lzl_time', args._main))
			.after($('<span>').addClass('d_tail').text(' | '))
			.data('jx', 'quote_lzl');
	},
	_click: function ($ele, $eve) {
		var $editor = $('#ueditor_replace');
		var $cnt = $ele.parents('.lzl_cnt');
		$('<p>').appendTo($editor)
			.append ('引用 @' + $cnt.find('.j_user_card').attr('username') + ' 在楼中楼的发言：<br>')
			.append ($ele.parents('.lzl_cnt').find('.lzl_content_main').text())
			.append ('<br>')
			.append ('——————————')
			.append ('<br> &gt;<br>');

		$.goToEditor();
	}
}