{
	name: '挽尊卡隐藏',
	desc: '屏蔽挽尊卡，留下一个横条提示。',
	flag: __type_floor,
	_init: function () {
		_css.append ('.save_lz_face::before{content:attr(who) " 使用了挽尊卡"}');
	},
	_proc: function (floorType, args) {
		if ($('.save_face_post', args._main).size()) {
			// 发现挽尊卡
			$('<div>').addClass('floor-stripe save_lz_face')
				.attr ('who', $('.p_author_name', args._main).text())
				.insertBefore (args._main);

			args._main.addClass('savedFace').hide();
		}
	}
}