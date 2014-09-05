{
	name: '贴吧贴子屏蔽',
	desc: '根据规则屏蔽指定贴子',
	flag: __type_floor | __type_forum | __type_lzl,

	// 辅助函数
	_match_type: function (_M) {
		switch (_M) {
			case this.__M_REGEX:
				return 'tp_regex';
			case this.__M_PLAIN:
				return 'tp_plain';
		}

		return 'undefined_' + _M;
	},
	// 辅助函数
	_range: function (old, min, max) {
		return Math.min (Math.max (min, old), max);
	},

	// 初始化样式表
	_init: function () {
		_css
			.append ('ul#jx_post_kword > li {margin-bottom: .2em}')
			.append ('.jx_word { padding: 0 .5em; width: 8em } span.regex::before, span.regex::after { content: "/"; color: #777 }')
			.append ('span.regex > .jx_word { border: 0; padding: 0 .2em }')
			.append ('.jx_modifier { width: 4em; border: 0; padding: 0 0 0 .2em }')

			.append ('.jx_post_block_stripe::before{content: "共隐藏 " attr(hide-count) " 个数据"}');


		$.extend (this, {
			// Action to take when match
			__ACT_BAR:  0,
			__ACT_OPA:  1,
			__ACT_HIDE: 2,

			// Keyword match method
			__M_REGEX:  0,
			__M_PLAIN:  1
		});

		this.config = $.extend ({
			onmatch: this.__ACT_OPA,
			opacity: 30,

			kword: [{
				type: this.__M_PLAIN,
				word: '泽火革'
			}],
			user: [
				'炮弹56',
				'炮弹52'
			]
		}, $conf.get (this.id));
		this._compileRegex ();

		this.$tplConfig = <% ~block_post.html %>;
		this.$tplAddWord = <% ~block_post_kword.html %>;
	
		this.css = $('<style>').appendTo (document.head);
		this._rebuildStyle ();
	},

	// 重构样式表
	_rebuildStyle: function () {
		var sBuilder = '.jx_post_block_act {';
		switch (this.config.onmatch) {
			case this.__ACT_BAR:
				sBuilder += 'display: none;';
				break;
			case this.__ACT_HIDE:
				sBuilder += [
						'display: none;',
					'}',

					'.jx_post_block_stripe {',
						'display: none'
					// , '}'
				].join ('');
				break;
			case this.__ACT_OPA:
				sBuilder += [
						'opacity: ' + (this.config.opacity / 100) + ';',
						'transition: opacity .5s;',
					'}',

					'.jx_post_block_act:hover {',
						'opacity: .9;',
					'}',

					'.jx_post_block_stripe {',
						'display: none'
					// , '}'
				].join ('');
				break;
		}

		sBuilder += '}';
		this.css.text(sBuilder);
	},
	// 编译正则匹配
	_compileRegex: function () {
		var that = this;
		this.config.kword.forEach (function (e) {
			try {
				if (e.type === that.__M_REGEX)
					e.regex = new RegExp (e.word, e.modi);
			} catch (err) {
				console.error ('编译正则表达式时出错!\n表达式: %s, 开关: %s', err.word, err.modi);
				err.regex = { test: function () { return false; } };
			}
		});
	},

	// 配置窗口回调
	_conf: function () {
		var $view = $.extend(true, {}, this.config);

		$view.tp_hide = $view.onmatch === this.__ACT_HIDE;
		$view.tp_opa  = $view.onmatch === this.__ACT_OPA;
		$view.tp_bar  = $view.onmatch === this.__ACT_BAR;

		for (var i = 0; i < $view.kword.length; i++)
			$view.kword[i][this._match_type($view.kword[i].type)] = true;
		$view.user = $view.user.join ('\n');

		var $tpl = $(Mustache.render (this.$tplConfig, $view));

		var $wndBlocker = $.dialog.open ($tpl, {
			title: '贴子关键字屏蔽',
			width:  300,
			height: 400
		});

		var that = this;
		$tpl.on ('click', 'a.jx-rm-key', function () {
			// 移除那一行
			$(this).parent ().remove ();
		}).on ('change', '.jx_word_type', function () {
			var isRegex = parseInt (this.value) === that.__M_REGEX;

			var line = $(this).parent ();
			line.find ('.jx_word').parent().toggleClass ('regex', isRegex);
			line.find ('.jx_modifier').toggleClass ('hide', !isRegex);
		}).on ('change', '#jx_post_match', function () {
			$('#jx_post_opa', $tpl).parent ().toggleClass ('hide', parseInt (this.value) !== that.__ACT_OPA);
		}).on ('click', '.ui_btn', function () {
			switch ($(this).data('btn')) {
				case 'add':
					var $tplAdd = $(that.$tplAddWord);
					$('#jx_post_kword', $tpl).append ($tplAdd);
					$tplAdd.find ('.tg_focus').removeClass ('.tg_focus').focus();
					break;
				case 'save':
					var newConf = {
						onmatch: parseInt ($('#jx_post_match', $tpl).val()),
						opacity: that._range (parseInt ($('#jx_post_opa', $tpl).val()), 0, 100),
						kword: [],
						user:  $('#jx_post_user', $tpl).val().split ('\n')
					};
					$('#jx_post_kword > li').each (function () {
						var rule = $(this);
						newConf.kword.push ({
							type: parseInt (rule.find ('select').val ()),
							word: rule.find ('.jx_word').val (),
							modi: rule.find ('.jx_modifier').val ()
						});
					});
					$conf.set (that.id, newConf);
					that.config = newConf;

					that._compileRegex ();
					that._rebuildStyle ();
					$wndBlocker.close ();
					break;
				case 'close':
					$wndBlocker.close ();
					break;
			}
		});
	},

	// 标记贴子为隐藏
	_hit: function (floor) {
		floor.addClass ('jx_post_block_act');

		if (floor.prev().is('script'))
			floor.prev().remove ();

		if (floor.prev().is('.jx_post_block_act')) {
			// 寻找横条
			var prev = floor.prev ();
			while (!prev.is ('.jx_post_block_stripe'))
				prev = prev.prev ();

			prev.attr ('hide-count', parseInt (prev.attr ('hide-count')) + 1);
		} else {
			$('<div>').addClass ('jx_post_block_stripe floor-stripe')
				.attr('hide-count', 1).insertBefore (floor);
		}
	},

	_getAuthor: function (f) {
		return f.user_name || f.author_name || f.author.user_name;
	},

	_proc: function (floorType, args) {
		// 首先检查用户名
		if (this.config.user.indexOf (this._getAuthor(args._main.getField ())) !== -1) {
			this._hit (args._main);
			return ;
		}

		var floorContent;
		switch (floorType) {
			case __type_forum:
				floorContent = $('.threadlist_text', args._main).text();
				break;
			case __type_floor:
				floorContent = $('.d_post_content', args._main).text();
				break;
			case __type_lzl:
				floorContent = $('.lzl_content_main', args._main).text();
				break;
		}

		// 然后循环检查关键字匹配
		for (var i = this.config.kword.length; i--; ) {
			switch (this.config.kword[i].type) {
				case this.__M_REGEX:
					if (this.config.kword[i].regex.test (floorContent))
						this._hit (args._main);
					break;

				case this.__M_PLAIN:
					if (floorContent.indexOf (this.config.kword[i].word) !== -1)
						this._hit (args._main);
					break;
			}
		}
	}
}