/*
 * OPTIONS
 * Required
 * title - Title of the level
 * momentum - Total momentum of each circle, can be function
 * ballNum - Number of circles
 * expandSpeed - Expansion speed of the user's circle, can be function
 * 
 * One of the following sets
 * avgSize, sizeVar - Average radius of a circle, variance of the circle radius
 * r - Radius of each node, can be a function
 * 
 * Optional
 * angle - Starting angle of each node, can be a function
 * randAngleInt - Interval in milliseconds when each circle gets a new, random angle
 * contributor - Contributor of the level
 */
var physics = {
	follow: {
		a: function(d, c, w, h) { return Math.atan2(c.y - d.y, c.x - d.x); },
		dx: function(d, c, w, h) { return (d.x + ($.isFunction(d.m) ? d.m(d, c, w, h) : d.m) * Math.cos(d.a) / (d.r * d.r) + w) % w; },
		dy: function(d, c, w, h) { return (d.y + ($.isFunction(d.m) ? d.m(d, c, w, h) : d.m) * Math.sin(d.a) / (d.r * d.r) + h) % h; }
	}
}
physics.followGhost = {
	a: function(d, c, w, h) { return Math.atan2(Math.abs(c.y - d.y) > Math.abs(h + c.y - d.y) ? h + c.y - d.y : c.y - d.y, Math.abs(c.x - d.x) > Math.abs(w + c.x - d.x) ? w + c.x - d.x : c.x - d.x) },
	dx: physics.follow.dx,
	dy: physics.follow.dy
}
physics.trajectory = {
	a: function(d, c, w, h) { return Math.atan2(c.y + 	200 * movement.y - d.y, c.x + 100 * movement.x - d.x) },
	dx: physics.follow.dx,
	dy: physics.follow.dy
}
physics.gaurd = {
	a: physics.follow.a,
	dx: function(d, c, w, h) { return dist(d.sx - c.x, d.sy - c.y) <= 100 ? physics.follow.dx(d, c, w, h) : d.sx },
	dy: function(d, c, w, h) { return dist(d.sx - c.x, d.sy - c.y) <= 100 ? physics.follow.dy(d, c, w, h) : d.sy }
}
var personalities = {
	basic: {
		r: 20,
		momentum: 150,
		color: 'gray',
		physics: physics.follow,
		collide: true
	},
	basicGhost: {
		r: 20,
		momentum: 150,
		color: 'lightgray',
		physics: physics.followGhost,
		collide: false
	},
	seeker: {
		r: 20,
		momentum: 300,
		color: 'lightgray',
		physics: physics.trajectory,
		collide: false
	},
	gaurd: {
		r: 20,
		momentum: 200,
		color: 'lightgray',
		physics: physics.gaurd,
		collide: false
	}
};
var levels = {1: {title: 'Meet Basic', speed: 1, r: 20, personalities: {basic: 10}},
		2: {title: 'Ghost', speed: 1, r: 20, personalities: {basicGhost: 5, basic: 5}},
		3: {title: 'Seekers', speed: 1, r: 20, personalities: {seeker: 5}},
		4: {title: 'Gaurd', speed: 1, r: 20, personalities: {gaurd: 5}}};
var custom = {}, current, userColor = 'lightblue', defaultInterval, scoreStorage = 'bestShapeEscape', customStorage = 'customShapeEscape', movement = {x: 0, y: 0}, down = [], playing = false;;

$(document).ready(function() {
	$('#customButtons').hide();
	gameW = $('#game').width(), gameH = $('#game').width();
	if (window.localStorage[customStorage]) {
		custom = JSON.parse(window.localStorage[customStorage])
	}
	var sto = window.localStorage[scoreStorage]
	if (!sto || typeof(JSON.parse(sto)) != 'object' || !JSON.parse(sto)[1]) {
		window.localStorage[scoreStorage] = JSON.stringify({1: 0})
		init(1)
		$('#levelEnd').reveal({
		     animation: 'fadeAndPop',
		     animationspeed: 300,
		     closeonbackgroundclick: true,
		     dismissmodalclass: 'close'
		});
	} else {
		renumberCustom()
		var a = getFinishedLevels();
		if (a.length != Object.keys(levels).length && parseInt(a[a.length - 1]) <= a.length) {
			init(parseInt(a[a.length - 1]) + 1);
		} else {
			init(a[a.length - 1]);
		}
		if (a.length >= 10) {
			$('#custom').show();
		}
	}
	//$("#pop")[0].load();
	//$("#tada")[0].load();
	//$("#tada")[0].volume = .1;
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
})

function init(level) {
	playing = true;
	
	d3.select("#game").html('')

	var svg = d3.select("#game").append("svg:svg")
				.attr("width", gameW).attr("height", gameH).attr("id", "svg");
	
	var params = levels[level]
	if (!params) {
		params = custom[level]
		$('#customButtons').show()
		$('#delete').unbind('click');
		$('#delete').click(function() {
			delete custom[level];
			[scoreStorage, customStorage].forEach(function(d) {
				var sto = JSON.parse(window.localStorage[d]);
				delete sto[level];
				window.localStorage[d] = JSON.stringify(sto);
			})
			renumberCustom();
			$('#customButtons').hide();
			var a = getFinishedLevels();
			if (a.length != Object.keys(levels)) {
				init(parseInt(a[a.length - 1]) + 1);
			} else {
				init(a[a.length - 1]);
			}
		})
	}

	$('#title').html('Level ' + level + ' - ' + params.title)
	$('#current').html('0');
	if (params.contributor) {
		$('#contributor').html('Contributed by ' + params.contributor);
	} else {
		$('#contributor').html('');
	}
	var best = JSON.parse(window.localStorage[scoreStorage])
	if (!best[level]) {
		best[level] = 0
		window.localStorage[scoreStorage] = JSON.stringify(best)
	}
	initLevels(Object.keys(levels).concat(Object.keys(custom)), Object.keys(JSON.parse(window.localStorage[scoreStorage])), level)
	$('#best').html(best[level])
	
	if (Object.keys(custom).indexOf(level.toString()) != -1) {
		current = params;
	} else {
		current = null;
	}
	
	var color = d3.scale.category10();
	
	var nodes = [];
	Object.keys(params.personalities).forEach(function(k) {
		d3.range(params.personalities[k]).forEach(function() {
			console.log(k)
			var obj = personalities[k];
			var o = Math.random()
			var r = $.isFunction(r) ? obj.r(o) : obj.r;
			var rad = obj.r;
			var me = {r: rad,
				x: Math.random() * (gameW - 2 * r) + r,
				y: Math.random() * (gameH - 2 * r) + r,
				m: obj.momentum, o: o, color: obj.color,
				physics: obj.physics};
			me.sx = me.x;
			me.sy = me.y;
			nodes.push(me);
		})
	});
	var userNode = d3.range(1).map(function() {
		return {r: params.r, x: gameW / 2, y: gameH / 2, color: userColor};
	});
	
	var shapes = svg.selectAll('.shapes')
		.data(nodes).enter()
		.append('circle')
		.attr('class', 'shapes')
		.attr('r', function(d) { return d.r; })
		.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
		.attr('fill', function(d, i) { return d.color; });
	
	var user = svg.selectAll('.user')
		.data(userNode).enter()
		.append('circle')
		.attr('class', 'user')
		.attr('r', function(d) { return d.r; })
		.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
		.attr('fill', function(d) { return d.color; });
	
	d3.select('body').on("keydown", function() {
			switch(d3.event.keyCode) {
			case 37:
				changeMovement(-1, 0, d3.event.keyCode, true);
				break;
			case 38:
				changeMovement(0, -1, d3.event.keyCode, true);
				break;
			case 39:
				changeMovement(1, 0, d3.event.keyCode, true);
				break;
			case 40:
				changeMovement(0, 1, d3.event.keyCode, true);
				break;
			}
		}).on("keyup", function() {
			switch(d3.event.keyCode) {
			case 37:
				changeMovement(1, 0, d3.event.keyCode, false);
				break;
			case 38:
				changeMovement(0, 1, d3.event.keyCode, false);
				break;
			case 39:
				changeMovement(-1, 0, d3.event.keyCode, false);
				break;
			case 40:
				changeMovement(0, -1, d3.event.keyCode, false);
				break;
			}
		});
	
	function changeMovement(x, y, key, isDown) {
		if (!defaultInterval && isDown && playing) {
			start = new Date().getTime();
			defaultInterval = setInterval(redraw, 1)
		}
		if ((isDown && down.indexOf(key) == -1) || !isDown) {
			movement.x += x;
			movement.y += y;
			if (isDown) {
				down.push(key);
			} else {
				down.splice(down.indexOf(key), 1);
			}
		}
		d3.event.preventDefault();
	}
			
	function redraw() {
		var cur = svg.select('.user').datum();
		var t = Math.floor((new Date().getTime() - start) / 1000);
		shapes.each(function(d) {
			d.a = d.physics.a(d, cur, gameW, gameH);
			d.x = d.physics.dx(d, cur, gameW, gameH);
			d.y = d.physics.dy(d, cur, gameW, gameH);
			if (collide(d, cur)) {
				levelEnd(t, level);
			}
		})
		shapes.attr("transform", function(d) { return 'translate(' + d.x + ', ' + d.y + ')'; });
		user.each(function(d) {
			var r = $.isFunction(d.r) ? d.r(d) : d.r;
			if (d.x + movement.x * params.speed <= gameW - r && d.x + movement.x * params.speed >= r) {
				d.x += movement.x * params.speed;
			}
			if (d.y + movement.y * params.speed <= gameH - r && d.y + movement.y * params.speed >= r) {
				d.y += movement.y * params.speed;
			}
		});
		user.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		if (t > parseInt($('#current').html())) {
			$('#current').html(t);
		}
		if (pass(t)) {
			levelEnd(t, level);
		}
	}
}

function collide(d, e) {
	return dist(d.x - e.x, d.y - e.y) <= e.r + d.r;
}

function dist(x, y) {
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function levelEnd(t, level) {
	playing = false;
	clearInterval(defaultInterval);
	defaultInterval = null;
	var best = JSON.parse(window.localStorage[scoreStorage])
	if (pass(t)) {
		//$("#tada")[0].play();
		var html;
		html = '<h1>You Completed Level ' + level + '</h1>';
		if (levels[parseInt(level) + 1] || custom[parseInt(level) + 1]) {
			html += '<button class="close" onclick="init(' + (parseInt(level) + 1) + ')">Next Level</button>';
		} else {
			html += '<button class="close" onclick="init(' + level + ')">Retry Level</button>';
		}
		if (level == 9) {
			html += "<p>Congratulations, you've beaten 10 of the levels! Now you can build your own!</p>";
			$('#custom').show();
			html += '<button class="close" onclick="window.location.href=\'#custom\'">Build My Own</button>';
		}
		$('#modalContent').html(html);
		$('#levelEnd').reveal({
		     animation: 'fadeAndPop',
		     animationspeed: 300,
		     closeonbackgroundclick: false,
		     dismissmodalclass: 'close'
		});
	} else { 
		//$("#pop")[0].play();
		init(level);
	}
	if (best[level] < t) {
		best[level] = t;
		window.localStorage[scoreStorage] = JSON.stringify(best)
		$('#best').html(t)
	}
}

function initLevels(all, open, cur) {
	d3.select("#levels").html('')
	
	var w = 380, perRow = 14, rw = w / perRow, pad = 2, h = rw * (1 + Math.floor(all.length / perRow));
	var svg = d3.select("#levels").append("svg:svg")
		.attr("width", w).attr("height", h).attr("id", "levelSvg");
	
	var nodes = d3.range(all.length).map(function(d) {
		return { level: all[d], open: (open.indexOf(all[d]) != -1), h: rw - 2 * pad, w: rw - 2 * pad, x: (d * rw) % w + pad, y: Math.floor(d / perRow) * rw + pad };
	})

	var root = svg.selectAll(".level")
		.data(nodes).enter()
		.append("g")
		.attr("width", function(d) { return d.w; })
		.attr("height", function(d) { return d.h; })
	var rect = root
		.append("svg:rect")
		.attr("class", "level")
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("width", function(d) { return d.w; })
		.attr("height", function(d) { return d.h; })
		.style("fill", function(d) { return (d.level == cur ? 'blue' : (d.open ? 'lightblue' : 'gray')); })
	root.append('text')
		.attr('class', 'levelText')
		.attr("transform", function(d) { return 'translate(' + (d.x + d.w / 2) + ',' + (d.y + d.h / 2 + 6) + ')'; })
		.text(function(d) { return d.level; });
	
	root.on('click', function(d) {
		if (d.open) {
			if (defaultInterval) {
				clearInterval(defaultInterval);
			}
			if (moveInterval) {
				clearInterval(moveInterval);
			}
			init(d.level);
		}
	})
}

function getFinishedLevels() {
	var scores = JSON.parse(window.localStorage[scoreStorage]);
	var levelKeys = Object.keys(levels);
	var finished = []
	levelKeys.forEach(function(d) {
		if (pass(scores[d])) {
			finished.push(d)
		}
	})
	return finished;
}

function pass(t) {
	return t >= 10;
}

function build() {
	/*var num = Object.keys(levels).length + Object.keys(custom).length + 1;
	var t = $('#buildTitle').val(), n = parseInt($('#buildNum').val()),
		size = parseInt($('#buildSize').val()), v = $('#buildVariance').val() * size,
		speed = parseFloat($('#buildSpeed').val()), e = parseFloat($('#buildExpansion').val()),
		interval = parseInt($('#buildInterval').val()), period = parseInt($('#buildPeriod').val()),
		angle = parseInt($('#buildAngle').val());
	if (t && n) {
		var obj = {title: t, momentum: size * size * speed / 5, ballNum: n, expandSpeed: e, randAngleInt: interval};
		if (period) {
			obj.r = function(o) { return size + v * Math.cos(2 * Math.PI * (new Date() / period + o)); };
		} else {
			obj.avgSize = size;
			obj.sizeVar = v;
		}
		if (angle) {
			obj.angle = function(o) { return Math.floor(angle * o) * 2 * Math.PI / angle; };
		}
		custom[num] = obj;
		window.localStorage[customStorage] = JSON.stringify(custom);
		init(num)
	} else {
		var html = '<h1>Error</h1>';
		html += '<p>Your title or number of circles was invalid.</p>';
		html += '<button class="close">My b</button>';
		$('#modalContent').html(html);
		$('#levelEnd').reveal({
		     animation: 'fadeAndPop',
		     animationspeed: 300,
		     closeonbackgroundclick: true,
		     dismissmodalclass: 'close'
		});
	}*/
}

function renumberCustom() {
	var levelKeys = Object.keys(levels)
	var levelMax = levelKeys[levelKeys.length - 1]
	var customKeys = Object.keys(custom)
	var temp = {}
	var best = JSON.parse(window.localStorage[scoreStorage]);
	var bestTemp = JSON.parse(window.localStorage[scoreStorage]);
	customKeys.forEach(function(d, i) {
		delete bestTemp[d]
		bestTemp[parseInt(levelMax) + i + 1] = best[d];
		temp[parseInt(levelMax) + i + 1] = custom[d];
	})
	custom = temp;
	window.localStorage[customStorage] = JSON.stringify(custom);
	window.localStorage[scoreStorage] = JSON.stringify(bestTemp);
}

function submit() {
	if (current) {
		var m = 'Brian - Check out this new level.%0A%0A%0A%0ALeave the text below, it describes your level.%0A' + JSON.stringify(current)
		sendGmail({to: 'brian@theconnman.com', subject: 'New Circles Level', message: m})
	}
}

function sendGmail(opts){
    var str = 'http://mail.google.com/mail/?view=cm&fs=1'+
	    '&to=' + opts.to +
	    '&su=' + opts.subject +
	    '&body=' + opts.message +
	    '&ui=1';
    window.open(str, '_blank');
}