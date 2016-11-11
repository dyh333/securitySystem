/* 
 * Context.js
 * Copyright Jacob Kelley
 * MIT License
 */

var context = context || (function () {
    
	var map,basicTools,eventAction=[],targetDom;
	var options = {
		fadeSpeed: 100,
		filter: function ($obj) {
			// Modify $obj, Do not return
		},
		above: 'auto',
		preventDoubleContext: true,
		compress: false
	};

	function initialize(opts) {
		
		options = $.extend({}, options, opts);
		map=opts.map;
		basicTools=opts.basicTools;
		$(document).on('click', '#map', function () {
			$('.dropdown-context').fadeOut(options.fadeSpeed, function(){
				$('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
			});
		});
		
		$(document).on('mouseleave', '.dropdown-context', function () {
			$('.dropdown-context').fadeOut(options.fadeSpeed, function(){
				$('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
			});
		});
		
		if(options.preventDoubleContext){
			$(document).on('contextmenu', '.dropdown-context', function (e) {
				e.preventDefault();
			});
		}
		$(document).on('mouseenter', '.dropdown-submenu', function(){
			var $sub = $(this).find('.dropdown-context-sub:first'),
				subWidth = $sub.width(),
				subLeft = $sub.offset().left,
				collision = (subWidth+subLeft) > window.innerWidth;
			if(collision){
				$sub.addClass('drop-left');
			}
		});
		
	}

	function updateOptions(opts){
		options = $.extend({}, options, opts);
	}

	function buildMenu(data, id, subMenu) {
		eventAction=[];
		var subClass = (subMenu) ? ' dropdown-context-sub' : '',
			compressed = options.compress ? ' compressed-context' : '',
			$menu = $('<ul class="dropdown-menu dropdown-context' + subClass + compressed+'" id="dropdown-' + id + '"></ul>');
        var i = 0,n=0, linkTarget = '';
        for(i; i<data.length; i++) {
        	if (typeof data[i].divider !== 'undefined') {
				$menu.append('<li class="divider"></li>');
			} else if (typeof data[i].header !== 'undefined') {
				$menu.append('<li class="nav-header">' + data[i].header + '</li>');
			} else {
				if (typeof data[i].href == 'undefined') {
					data[i].href = '#';
				}
				if (typeof data[i].target !== 'undefined') {
					linkTarget = ' target="'+data[i].target+'"';
				}
				if (typeof data[i].subMenu !== 'undefined') {
					$sub = ('<li class="dropdown-submenu"><a tabindex="-1" href="' + data[i].href + '">' + data[i].text + '</a></li>');
				} else {
					$sub = $('<li><a tabindex="-1" href="' + data[i].href + '"'+linkTarget+'>' + data[i].text + '</a></li>');
				}
				if (typeof data[i].action !== 'undefined') {
					var actiond = new Date(),
						actionID = 'event-' + actiond.getTime() * Math.floor(Math.random()*100000);
					eventAction.push(data[i].action);
					$sub.find('a').attr({'id':actionID,'data-id':n});
					n++;
					$('#' + actionID).addClass('context-event');
					$(document).on('click', '#' + actionID, function(e){
						var id= parseInt($(this).data("id"));
						eventAction[id].call(this,targetDom);
					});
				}
				$menu.append($sub);
				if (typeof data[i].subMenu != 'undefined') {
					var subMenuData = buildMenu(data[i].subMenu, id, true);
					$menu.find('li:last').append(subMenuData);
				}
			}
			if (typeof options.filter == 'function') {
				options.filter($menu.find('li:last'));
			}
		}
		
		
		return $menu;
	}

	function addContext(selector, data) {
		
		var d = new Date(),
			id = d.getTime(),
			$menu = buildMenu(data, id);
			
		$('body').append($menu);
		
		//实例化插件
		var layer=null;
		if($(selector).hasClass("baseMap")){
			$('#slider_mapBar').bind('change', function() {
				if(layer!=null)
					layer.setOpacity(parseFloat($(this).val()));
			});
		}
		else{
			$('#slider_layerView').bind('change', function() {
				if(layer!=null)
					layer.setOpacity(parseFloat($(this).val()/10));
			});
		}

		
		var layerId=null,layer=null;
		$(document).on('contextmenu', selector, function (e) {

			e.preventDefault();
			e.stopPropagation();

			targetDom=$(e.currentTarget);
			//查询当前图层透明度的值
			layerId = $(e.currentTarget).children('p').data('id')?$(e.currentTarget).children('p').data('id'):$(e.currentTarget).attr("id");
			layer=map.getLayer(layerId);
			if(typeof(layer)==='undefined' || layer.visible===false){layer=null;return false;};
			var nowOpacity=basicTools.changeOpacity(map, layerId);
			if($(e.currentTarget).hasClass("node-layerTree")){
				$('#slider_layerView').val(nowOpacity*10);
			}
			else if($(e.currentTarget).hasClass("baseMap")){
				$('#slider_mapBar').val(nowOpacity);
			}

			
			$('.dropdown-context:not(.dropdown-context-sub)').hide();
			
			var $dd = $('#dropdown-' + id);
			if (typeof options.above == 'boolean' && options.above) {
				$dd.addClass('dropdown-context-up').css({
					top: e.pageY - 20 - $('#dropdown-' + id).height(),
					left: e.pageX - 13
				}).fadeIn(options.fadeSpeed);
			} else if (typeof options.above == 'string' && options.above == 'auto') {
				$dd.removeClass('dropdown-context-up');
				var autoH = $dd.height() + 12;
				if ((e.pageY + autoH) > $('.map').height()) {
					$dd.addClass('dropdown-context-up').css({
						top: e.pageY - 20 - autoH,
						left: e.pageX - 13
					}).fadeIn(options.fadeSpeed);
				} else {
					$dd.css({
						top: e.pageY + 10,
						left: e.pageX - 13
					}).fadeIn(options.fadeSpeed);
				}
			}
		});
	}
	
	function destroyContext(selector) {
		$(document).off('contextmenu', selector).off('click', '.context-event');
	}
	
	return {
		init: initialize,
		settings: updateOptions,
		attach: addContext,
		destroy: destroyContext
	};
})();