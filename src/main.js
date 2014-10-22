<% @header.js %>

var w = unsafeWindow, _main;
jQuery(function ($) {
	var iv = setInterval(function () {
		if (w.jQuery && w.PageData && w.PageData.tbs) {
			clearInterval(iv);
			console.log('PageData loaded.');

			if (!w.bdShare) {
				w.bdShare = unsafeObject({
					ready: false
				});
			}

			w.PageData.games = unsafeObject([]);

			unsafeExec (function () {
				// 改进自 congxz6688 的 tieba_quote [#147]
				// 节取自 寂寞的原子 的  悬浮窗脚本 [#116]
				_.Module.use("common/widget/RichPoster", {},
					function (t) {
						t.init();
						t.unbindScrollEvent();
					});
			});

			_main ($, w.PageData);
		}
	}, 500);

	setTimeout (function () {
		// 15s later force kill waiting.
		clearInterval (iv);
	}, 15000);
});

var __type_floor   = 1,
	__type_lzl     = 2,
	__type_forum   = 4,
	__type_postact = 8;

var __mod_default  = 0,
	__mod_enable   = 1,
	__mod_disable  = 2;

_main = function ($, wPageData) {
	// 检查是否在贴吧
	if (!wPageData.forum) return ;
	var isThread = !!wPageData.thread;
	var _css  = $('<style>');
	var _cssH = $('<style>').text('.ads{display:none !important;}');


	//// Function Helper
	Object.defineProperty (Function.prototype, 'extract', {
		value: function () {
			return this.toString().match(/\/\*([\s\S]+)\*\//)[1];
		}
	});

	var _function = function (foo, proto) {
		foo.prototype = proto;
		return foo;
	};

	var $conf = new (_function (function () {}, {
		get: function (m, def) {
			var val = GM_getValue (m, null);
			if (!val) return def;

			try {
				return JSON.parse (val);
			} catch (e) {
				return def;
			}
		},
		set: function (m, val) {
			return GM_setValue (m, JSON.stringify (val));
		},
		rm: function () {
			[].forEach.call (arguments, GM_deleteValue);
		},
		ls: function () {
			return GM_listValues ();
		}
	})) ();

	var _hide = function () {
		_cssH.prepend (Array.prototype.join.call(arguments, ',') + ',');
	};


	var _run = function (foo, name) {
		console.groupCollapsed ('[贴吧助手]: ' + (name || '[未知区段]'));

		for (var args = [], i = 2, ret; i<arguments.length; i++)
			args.push (arguments[i]);

		try {
			ret = foo.apply (this, args);
			console.info ('Section returned: ', ret);
		} catch (err) {
			console.error ('Error at %s: %s', name || '[unknown]', err.message);
			console.error (err);
		}
		console.groupEnd ();

		return ret;
	};

	$.fn.getField = function () {
		// var $data = this.attr('data-field');
		var $data = this.data ('field');

		if ('string' == typeof $data[1])
			return JSON.parse($data.replace(/'/g, '"'));
		return $data;
	};

	$.goToEditor = function () {
		$('#ueditor_replace').focus ();
		$.scrollTo($('#tb_rich_poster_container'), 500);
	};
	$.create = function (ele, cls, attr) {
		var r = $(document.createElement (ele));

		if (cls)
			r.addClass (cls);
		if (attr)
			r.attr (attr);

		return r;
	};
	$.stamp = function () {
		return + new Date ();
	};
	$.toDateStr = function (d) {
		return d.toLocaleString();
	};

	var modules = {
		<% #modules.js %>
	};

	var _menu = (function () {
		var $template = <% ~main_config.html %>;

		return _run.bind ({}, function () {
			var $view = {
				modules: []
			};
			for (var x in modules) {
				if (modules.hasOwnProperty(x)) {
					var isEnable = lMods.hasOwnProperty(x);
					$view.modules.push ({
						id: x,
						name: modules[x].name,
						desc: modules[x].desc,
						enable: isEnable,
						config: isEnable && !!modules[x]._conf
					});
				}
			}
			var $tpl = $(Mustache.render ($template, $view));

			var $wndConfig = $.dialog.open ($tpl, {
				title: '贴吧助手 - 配置窗口 (刷新后生效)',
				height: 200
			});

			$('.jx_conf', $tpl).click(function () {
				var x = $(this).data('config');
				if (lMods.hasOwnProperty(x))
					_run (lMods[x]._conf.bind (lMods[x]), '模组配置 [' + lMods[x].name + ' (' + x + ')]');
			});

			$('#jx_save', $tpl).click(function () {
				var newStatus = {};
				$('#jx_conf_modules>label>input', $tpl).each(function (i, inp) {
					newStatus[$(inp).data('module')] = inp.checked ? __mod_enable : __mod_disable;
				});
				$conf.set ('modules', newStatus);
				$wndConfig.close ();
			});
			$('#jx_close', $tpl).click($wndConfig.close.bind($wndConfig));
		}, '助手设定界面');
	})();

	// 未登录用户可以通过 GM 菜单激活配置项
	GM_registerMenuCommand ('梦姬贴吧助手模块配置', _menu);

	if (unsafeWindow.__YUME_DEBUG__) {
		GM_registerMenuCommand ('打印模组配置', function () {
			console.info ('梦姬模组配置: ');
			console.info ($conf.get ('modules'));
		});
	}

	_run (function () {
		var _callMenu = function ($parent) {
			console.info ('成功捕捉到菜单元素，传递至回调…');
			_run (function () {
				var $menuItem = $('<li>'),
					$menuLink = $('<a>' ).appendTo ($menuItem).addClass('jx').text('助手设置');
				$parent.find ('.u_tb_profile').before($menuItem);
				$menuLink.click (_menu);
			}, '菜单召唤');
		};
	
		var ma = new MutationObserver (function ($q) {
			try {
				$($q).each(function (i, $eve) {
					$($eve.addedNodes).each(function (i, $ele) {
						if ($ele.nodeType != 3 && $ele.className == 'u_ddl') {
							throw {ele: $($ele), name: 's'};
						}
					});
				});
			} catch (err) {
				if (err.ele) {
					ma.disconnect();

					_callMenu (err.ele);
					return ;
				}

				throw err;
			}
		});

		var _m = $('.u_setting>.u_ddl');
		if (_m.length) {
			_callMenu (_m);
		} else {
			ma.observe($('.u_setting')[0], {
				childList: true,
				subtree: true
			});
		}
	}, '捕捉设定');
	// console.log ($('li.u_setting .u_tb_profile'));

	var lMods = {};

	_run (function () {
		_css = $('<style>').appendTo(document.head);
		_css.append (<% ~tieba.css %>);
		_cssH.insertAfter(_css);
		
		// 配置项更新
		switch ($conf.get ('confVer', [0])[0]) {
			case 0:
				var $disabledMods = $conf.get ('modules', []);
				var $modsList = {};
				$disabledMods.forEach (function (e) {
					$modsList[e] = __mod_disable;
				});
				$conf.set ('modules', $modsList);
				break;

		}
		$conf.set ('confVer', [1]);

		var $mods = $conf.get ('modules', {});
		console.log ($mods);
		
		$.each (modules, function (mId, fMod) {
			if ($mods[mId] == __mod_disable
				|| ( ($mods[mId] == __mod_default || !$mods.hasOwnProperty(mId))
					&& fMod.def === false
				)
			) return ;

			lMods[mId] = fMod;
			lMods[mId].id = mId;
			if (lMods[mId]._init) {
				console.info ('初始化模组: %s[%s]', mId, lMods[mId].name);
				lMods[mId]._init.call (lMods[mId]);
			}

		});
		console.log (lMods);
	}, 'Init. modules');

	var _event = function (floorType, otherInfo, _proc) {
		var fooCB = _proc || '_proc';
		$.each (lMods, function (mId, m) {
			if (!m[fooCB] || !(m.flag & floorType))
				return;

			_run (m[fooCB].bind(m, floorType, otherInfo), m.name);
		});
	};

	var _procLzlContainer = function (i, tailer) {
		var $tailer = $(tailer),
			_main   = $tailer.parents('.l_post');

		console.log ($tailer, _main);

		_event (__type_floor, {
			_main:    _main,
			floor:    _main,
			// 「'」is not standard, convert to 「"」 first.
			floorNum: parseInt($tailer.getField().floor_num),
			tail:     $('.p_tail', _main)
		});

		// 处理解析 lzl 帖子（…
		// $tailer.find('.lzl_single_post').each(_procLzlPost);
		return _main;
	};

	var _procThreadList = function (i, threadlist) {
		var $thread = $(threadlist);
		_event (__type_forum, {
			_main:  $thread,
			thread: $thread
		});
		return $thread;
	};

	var _procLzlPost = function (i, lzlPost) {
		var $lzl = $(lzlPost);
		_event (__type_lzl, {
			_main:  $lzl,
			lzl: $lzl
		});
		return $lzl;
	};

	if (isThread) {
		$('.j_lzl_container').each(_run.bind ({}, _procLzlContainer, '初始化帖子搜索'));
		$('.lzl_single_post').each(_run.bind ({}, _procLzlPost, '初始化楼中楼搜索'));
	} else {
		$('.j_thread_list').each(_run.bind ({}, _procThreadList  , '初始化贴吧页帖子搜索'));
	}
	var mo = new MutationObserver (function (eve) {
		_run (function () {
			$(eve).each(function (i, eve) {
				if (!eve.addedNodes.length) return ;

				$(eve.addedNodes).each(function (i, ele) {
					// Text node.
					if (ele.nodeType == 3) return ;

					var $ele = $(ele),
						_type = 0,
						$tmp;

					// 单贴处理
					if ($ele.hasClass ('j_lzl_container')) {
						// _type = __type_floor;
						$tmp = _procLzlContainer (i, $ele);
						$tmp.find('.lzl_single_post').each(_procLzlPost);
					} else if ($ele.hasClass ('j_thread_list')) {
						// 贴吧主页面
						_procThreadList (i, $ele);
					} else if ($ele.hasClass ('lzl_single_post')) {
						// 仅限翻页时触发
						_procLzlPost (i, $ele);
					} else if ($ele.hasClass ('user-hide-post-action') && !$ele.hasClass('jx_post')) {
						$ele.addClass('jx_post');
						_event (__type_postact, {
							_main: $ele.parents('.l_post'),
							_menu: $ele
						}, '_menu');
					}
				});
			});
		}, '页面元素插入');
	});

	$(document.body).on ('click', '.jx', function (eve) {
		var $eve  = $(eve.target);
		var $data = $eve.data ('jx');
		if (!$data || !lMods[$data] || !lMods[$data]._click) return ;

		_run.call (lMods[$data], lMods[$data]._click, '>> 单击助手功能: ' + $data, $eve, $eve.data('eve'));
	});

	mo.observe($('#j_p_postlist,#thread_list').get(0), {
		childList: true,
		subtree: true
	});
};