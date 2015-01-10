{
	name: '3 天循环隐藏',
	desc: '3 天循环屏蔽指定用户的帖子, 统一封锁.',
	flag: __type_postact | __type_forum,

	_findUser: function (name) {
		if (0 === this.blockList.author.length)
			return -1;

		for (var i = this.blockList.author.length; i--; ) {
			if (this.blockList.author[i].name == name)
				return i;
		}

		return -1;
	},
	_userExist: function (user) {
		return -1 !== this._findUser(user);
	},

	_conf: function () {
		var that = this;


		var $tpl = $(Mustache.render(this.tplHideAuthor, {
			author: this.blockList.author.map (function (e, i) {
				return { name: e.name, time: e.time ? $.toDateStr (new Date(e.time)) : '尚未' };
			})
		}));

		var $wndHideUser = $.dialog.open ($tpl, {
			title: '3天循环隐藏模组配置 - 记得点一次 [全部封禁]',
			width: 370,
			height: 400
		});

		var $inp = $('#jx_new_id', $tpl);
		var cbAddName = function () {
			var user = $inp.val ().trim();
			that._updList ();

			if (0 === user.length || that._userExist(user))
				return ;

			$inp.val ('');

			$(Mustache.render (that.tplNewLine, {
				name: user,
				time: '尚未'
			})).insertBefore($('#jx_last_line_of_3day_block', $tpl));
			that.blockList.author.push ({
				name: user,
				time: 0
			});
			that._saveList ();
		};

		// 绑定事件
		$('#jx_add', $tpl).click(cbAddName);
		$inp.keypress(function (e) {
			if (e.which === 13)
				cbAddName ();
		});
		$tpl
			.on ('click', '.jx_man_hide, .jx_man_rm', function (e) {
				var $l = $(e.target);
				if ($l.hasClass ('text-disabled'))
					return ;
				$l.addClass ('text-disabled');


				var $un = $l.parent().data('name');
				that._updList();
				switch (true) {
					case $l.hasClass ('jx_man_hide'):
						that.blockList.author[that._findUser($un)].time = $.stamp();
						that._hide (function () {}, $un);
						break;
					case $l.hasClass ('jx_man_rm'):
						that.blockList.author.splice(that._findUser($un), 1);
						$l.parent().hide ();
						break;
				}
				that._saveList();
			});

		$('#jx_close', $tpl).click($wndHideUser.close.bind($wndHideUser));
		$('#jx_all', $tpl).click(function () {
			var hideStatus = $('#jx_hide_info', $tpl).show().text ('正在初始化…');

			that.hideQueue.onProgress = function (i, t) {
				hideStatus.text(Mustache.render('正在隐藏 {{i}} / {{t}}... 请勿关闭该窗口!', {i: i, t: t}));
			};
			that.hideQueue.onComplete = function () {
				that.hideQueue.onProgress = that.hideQueue.onComplete = null;
				hideStatus.text ('全部用户已成功隐藏!');
			};
			that.hideQueue.add.apply (
				that.hideQueue,
				Array.prototype.slice.call($('a.jx.jx_man_hide:not(.text-disabled)').addClass('text-disabled').map(function (i, e) {
					return $(e).parent().data('name');
				}))
			);
		});
		return $tpl;
	},

	_hide: function (cb, author) {
		// 检查是否在列表
		this._updList ();
		if (this._userExist (author)) {
			// 如果存在, 修正上次隐藏时间
			this.blockList.author[this._findUser(author)].time = $.stamp();
			this._saveList ();
		}
		console.info ('开始隐藏: %s', author);

		$.ajax ({
			url: '/tphide/add',
			type: 'POST',
			data: {
				type: 1,
				hide_un: author,
				ie: 'utf-8'
			},
			dataType: 'json'
		}).success (cb);
	},

	_init: function () {
		this.tplHideAuthor = <% ~hide_loops_config.html %>;
		this.tplNewLine = <% ~hide_loops_author.html %>;
		this._updList ();

		var _hide = this._hide.bind (this);
		this.hideQueue = new IntervalLoop ([], _hide, 400).loop ();

		var curTime = $.stamp ();
		var t3Days  = 3 * 24 * 60 * 60;

		var that = this;
		this.blockList.author.forEach (function (e) {
			if (curTime - e.time > t3Days)
				that.hideQueue.add (e.name);
		});
	},

	_updList: function () {
		this.blockList = $.extend ({
			author: [
				// 格式如下
				//{
				//	name: '炮弹56',
				//	lastHide: 0
				//}
			]
		}, $conf.get (this.id, {}));
	},
	_saveList: function () {
		$conf.set (this.id, this.blockList);
	},

	_findNameAndHide: function (e) {
		var floorData = $(e.target).parents('.lzl_single_post,.l_post')
						  .first().getField();
		var author = floorData.user_name || floorData.author.user_name;
		if (this._userExist(author)) {
			$.dialog.alert (Mustache.render(<% ~hide_loops_already_in_list.html %>, {name: author}), {
				title: '3 天循环隐藏'
			});
			return ;
		}
		this._updList ();
		this.blockList.author.push ({
			name: author,
			time: $.stamp()
		});
		this._saveList ();
		this._hide (function (r) {
			$.dialog.alert (Mustache.render(<% ~hide_loop_result.html %>,
			$.extend ({name: author}, r)), {
				title: '3 天循环隐藏 (楼中楼无效)'
			});
		}, author);
	},

	_menu: function (floorType, args) {
		var $act = $('.user-hide-post-action', args._main);
		var $actHidePost = $.create('a', 'jx jx-post-action');

		$actHidePost
			.text ('加入 3 天循环隐藏列表')
			.appendTo ($act)
			.data ('jx', this.id)
			.data ('eve', args._main.getField().author.user_name)
			.click(this._findNameAndHide.bind(this));
	}
}