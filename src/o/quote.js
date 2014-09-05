{
	name: '引用楼层',
	desc: '引用某一层的内容',
	flag: __type_floor,
	_proc: function (floorType, args) {
		var $quote = $('<li>').addClass('pad-left').append(
			$('<a>').text('#引用').addClass('jx')
				.data('jx', 'quote').data('floor', args.floorNum)
		).prependTo($('.p_tail', args._main));
	},
	_click: function ($ele, $eve) {
		var $floor  = $ele.parents('.l_post');
		var $editor = $('#ueditor_replace');
		var $quote = $('<p>').appendTo($editor);

		$quote
			.append ('引用 ' + $ele.data('floor') + '楼 @' + $('.p_author_name', $floor).first().text() + ' 的发言：')
			.append ('<br>')
			.append ('——————————')
			.append ('<br>');

		$('.j_d_post_content', $floor).contents().each(function (i, ele) {
			if (ele.nodeType == 3) {
				if (ele.nodeValue.trim() !== '')
					$quote.append (ele.nodeValue);

				return ;
			}

			var $ele = $(ele);
			if ($ele.is('a')) {
				if ($ele.find('img').size()) {
					$quote.append ('[#图片]');
				} else {
					$quote.append ($ele.text());
				}
			} else if ($ele.is ('img')) {
				$quote.append ('[#表情]');
			} else if ($ele.is ('object,embed')) {
				$quote.append ('[#视频]');
			} else {
				$quote.append ($ele.clone());
			}
		});

		$quote.append ('<br>&gt; ');
		$.goToEditor();
	}
}