{
	name: '广告隐藏、屏蔽',
	desc: '屏蔽无用、广告内容',
	flag: ~0,
	_init: function () {
		var $ads = [
			// 贴吧推广
			'.spreadad, .game_frs_step1, .BAIDU_CLB_AD, .dasense, .u9_head',

			// 1l 下方的广告
			'#sofa_post, .banner_post',

			// 贴吧顶部广告
			'#pb_adbanner',

			// 右侧
			'.right_section > *:not(#balv_mod)',
			'#aside > *:not(#balv_mod):not(#forumInfoPanel):not(#zyq):not(#adminModePanel)',

			// 客户端发贴 x 倍经验
			'.tb_poster_placeholder',

			// 语音按钮 (需要客户端)
			'.edui-btn-voice, .j_voice_ad_gif, .lzl_panel_voice',

			// 发帖请遵守 ....
			'.poster_head_surveillance',

			// 不水能死何弃疗！
			'.lzl_panel_wrapper > tbody > tr > td:first-child > p',

			// 会员相关广告
			'.doupiao_offline, .fMember_cnt',

			// 右上角
			'.u_tshow, .u_tbmall, .u_app, .u_wallet, .u_xiu8, .u_mytbmall, .u_joinvip',

			// 右下角
			'#pop_frame',

			// 猜拳贴发表
			'.add_guessing_btn',
			
			'.thread_recommend',

			'#tshow_out_date_warn, #selectsearch-icon'
		].join(', ');

		$($ads).remove();
		$('<style>').text($ads + <% ~ads_hide.css %>).appendTo (document.head);

		// 只保留 [看帖、图片、精品、视频] 四个选项
		$('.j_tbnav_tab').filter (function (i) { return i > 3; }).remove ();

		$('.split_text').next('.split_text').remove();
		$('.split').filter(function () {
			return this.nextElementSibling === null
				|| this.nextElementSibling.className == this.className
				|| !$(this.nextElementSibling).is(':visible');
		}).remove();
	}
}