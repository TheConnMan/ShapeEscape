/*
 * OPTIONS
 * Required
 * title - Title of the level
 * speed - Speed of the user, can be a function
 * r - Radius of the user, can be a function
 * 
 * Personalities
 * name - Name
 * bio - Short biography
 * r - Radius, can be function
 * momentum - Momentum, can be function
 * color - Shape color
 * physics - Physics object for how shape behaves
 * 
 * Physics
 * a - Function to determine trajectory angle
 * dx - Function to determine change in x on tick
 * dy - Function to determine change in y on tick
 */
var physics = {
	follow: {
		a: function(d, c, w, h) { return Math.atan2(c.y - d.y, c.x - d.x); },
		dx: function(d, c, w, h) { var x = d.x + get(d.m, d, c, w, h) * Math.cos(d.a) / (d.r * d.r); return (x + d.r <= w && x >= d.r) ? x : d.x; },
		dy: function(d, c, w, h) { var y = d.y + get(d.m, d, c, w, h) * Math.sin(d.a) / (d.r * d.r); return (y + d.r <= h && y >= d.r) ? y : d.y; }
	}, followGhost: {
		a: function(d, c, w, h) { return Math.atan2(Math.abs(c.y - d.y) > Math.abs(h + c.y - d.y) ? h + c.y - d.y : c.y - d.y, Math.abs(c.x - d.x) > Math.abs(w + c.x - d.x) ? w + c.x - d.x : c.x - d.x) },
		dx: function(d, c, w, h) { return (d.x + get(d.m, d, c, w, h) * Math.cos(d.a) / (d.r * d.r) + w) % w; },
		dy: function(d, c, w, h) { return (d.y + get(d.m, d, c, w, h) * Math.sin(d.a) / (d.r * d.r) + h) % h; }
	}
};
physics.trajectory = {
	a: function(d, c, w, h) { return Math.atan2(c.y + 200 * movement.y - d.y, c.x + 100 * movement.x - d.x) },
	dx: physics.follow.dx,
	dy: physics.follow.dy
};
physics.gaurd = {
	a: function(d, c, w, h) { return dist(d.sx - c.x, d.sy - c.y) <= 200 ? Math.atan2(c.y - d.y, c.x - d.x) : Math.atan2(d.sy - d.y, d.sx - d.x) },
	dx: physics.follow.dx,
	dy: physics.follow.dy
};
physics.shy = {
	a: function(d, c, w, h) { return Math.PI + physics.follow.a(d, c, w, h); },
	dx: physics.follow.dx,
	dy: physics.follow.dy
};
physics.shy2 = {
	a: function(d, c, w, h) { var a = physics.follow.a(d, c, w, h); return Math.cos(Math.atan2(movement.y, movement.x) - a) < 0 && (movement.y != 0 || movement.x != 0) ? Math.PI + a : a; },
	dx: function(d, c, w, h) { return d.x + Math.cos((movement.y != 0 && movement.x != 0) ? Math.atan2(movement.y, movement.x) - d.a : 0) * (physics.follow.dx(d, c, w, h) - d.x); },
	dy: function(d, c, w, h) { return d.y + Math.cos((movement.y != 0 && movement.x != 0) ? Math.atan2(movement.y, movement.x) - d.a : 0) * (physics.follow.dy(d, c, w, h) - d.y); }
};
physics.teleporter = {
	a: function(d, c, w, h) { return physics.follow.a(d, c, w, h) + Math.PI * (Math.random() - 0.5) / 2; },
	dx: function(d, c, w, h) { return Math.random() < .0025 ? d.x + Math.cos(d.a) * 100 : d.x; },
	dy: function(d, c, w, h) { return Math.random() < .0025 ? d.y + Math.sin(d.a) * 100 : d.y; }
};
physics.circle = {
	a: function(d, c, w, h) { return 2 * Math.PI * (new Date().getTime() / 1000 + d.o) % (2 * Math.PI); },
	dx: function(d, c, w, h) { return 100 * Math.cos(d.a) + d.sx },
	dy: function(d, c, w, h) { return 100 * Math.sin(d.a) + d.sy; }
};
var personalities = {
	basic: {
		name: 'Basic',
		bio: "Basic is your average Joe. He enjoys lounging around, weekends, and chasing you. He likes a relaxing chase, but likes to clear his mind while doing so. He'll go to where you are, but can easily be decieved if you run circles around him.",
		r: 20,
		momentum: 150,
		color: 'gray',
		physics: physics.follow
	},
	basicGhost: {
		name: 'Ghost',
		bio: "Ghost is a run-of-the-mill ghost. She puts in about as much effor as Basic, but doesn't care for pesky walls. She'll chase you and it it's faster to go through the wall to get you she will.",
		r: 20,
		momentum: 150,
		color: '#EEE',
		physics: physics.followGhost
	},
	seeker: {
		name: 'Seeker',
		bio: "Seeker's gotten some intel about where you're going and moves to intercept you. Watch out: this guy's sneaky.",
		r: 20,
		momentum: 250,
		color: 'blue',
		physics: physics.trajectory
	},
	gaurd: {
		name: 'Gaurd Dog',
		bio: "Gaurd Dog won't bother you if you're far away, but if you get too close to him he'll chase after you. He's very protective of his space.",
		r: 20,
		momentum: 350,
		color: 'green',
		physics: physics.gaurd
	},
	shyGuy: {
		name: 'Shy Guy',
		bio: "Shy Guy is, well, a shy guy. He's big, but once you get to know him he's a cool dude.",
		r: 150,
		momentum: 35000,
		color: 'red',
		physics: physics.shy
	},
	shyGuy2: {
		name: 'Not-So-Shy Guy',
		bio: "This guy acts like he's shy, but he really isn't. He's just trying to sneak up on you when you're not looking...",
		r: 40,
		momentum: 900,
		color: 'darkred',
		physics: physics.shy2
	},
	teleporter: {
		name: 'Teleporter',
		bio: "Teleporter has a bit of a glitch: he can teleport, but it only works some of the time. Watch out, he could get lucky.",
		r: 40,
		momentum: 900,
		color: 'steelblue',
		physics: physics.teleporter
	},
	circle: {
		name: 'Circle',
		bio: "Circle likes his circle. He won't bother you, just don't get in his way.",
		r: 20,
		momentum: 900,
		color: 'purple',
		physics: physics.circle
	}
}, defaultStart = {
	x: function(w, h) { return w / 2; },
	y: function(w, h) { return h / 2; }
};

var levels = {1: {title: 'Meet Basic', speed: 1, r: 20, personalities: {basic: 10}},
		2: {title: 'Ghost', speed: 1, r: 20, personalities: {basicGhost: 5, basic: 5}},
		3: {title: 'Seeker', speed: 1, r: 20, personalities: {seeker: 1}},
		4: {title: 'Gaurd', speed: 1, r: 20, personalities: {gaurd: 5, basic: 5}},
		5: {title: 'Seeker Pack', speed: 1, r: 20, personalities: {seeker: 4}},
		6: {title: 'Save Your Strength', speed: function(d) { return .3 + Math.max((1000 - d.dist) / 2000, 0); }, r: 20, personalities: {basic: 5}},
		7: {title: 'Shy Guy', speed: 1, r: 20, personalities: {shyGuy: 2, seeker: 2}},
		8: {title: 'Not-So-Shy Guy', speed: 1, r: 20, personalities: {shyGuy2: 5, seeker: 1}},
		9: {title: 'Teleporter', speed: 1, r: 20, personalities: {teleporter: 5}},
		10: {title: 'Circle', speed: 1, r: 20, personalities: {circle: 10, seeker: 1}},
		11: {title: 'House Party', speed: 1, r: 20, personalities: {basic: 1, basicGhost: 1, seeker: 1, gaurd: 1, shyGuy: 1, shyGuy2: 1, teleporter: 1, circle: 1}}};
var custom = {}, current, userColor = 'lightblue', defaultInterval, scoreStorage = 'bestShapeEscape',
		customStorage = 'customShapeEscape', movement = {x: 0, y: 0}, down = [], playing = false, buffer = 200;

function get(val) {
	if ($.isFunction(val)) {
		if (arguments.length == 2) {
			return val(arguments[1]);
		} else if (arguments.length > 2) {
			return val(Array.prototype.slice.call(arguments, 1));
		} else {
			return val();
		}
	} else {
		return val;
	}
}

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
		$('#modalContent').html($('#modalContent').html() + newPersonalityHtml(1) + '<button class="close">Lemme At \'Em!</button>');
		newPersonalityJs(1);
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
			setBuild();
		}
	}
	//$("#pop")[0].load();
	//$("#tada")[0].load();
	//$("#tada")[0].volume = .1;
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
});

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
			if (a.length != Object.keys(levels).length) {
				init(parseInt(a[a.length - 1]) + 1);
			} else {
				init(a[a.length - 1]);
			}
		})
	}

	$('#title').html('Level ' + level + ' - ' + params.title);
	$('#current').html('0');
	if (params.contributor) {
		$('#contributor').html('Contributed by ' + params.contributor);
	} else {
		$('#contributor').html('');
	}
	var startXY;
	if (params.start) {
		startXY = params.start;
	} else {
		startXY = defaultStart;
	}
	var best = JSON.parse(window.localStorage[scoreStorage])
	if (!best[level]) {
		best[level] = 0
		window.localStorage[scoreStorage] = JSON.stringify(best)
	}
	layoutPersonalities();
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
			var obj = personalities[k];
			var o = Math.random()
			var r = get(obj.r, o);
			var rad = obj.r;
			var xy = startingPosition([r, gameW - r], [r, gameH - r], [startXY.x(gameW, gameH), startXY.y(gameW, gameH)], buffer);
			nodes.push({r: rad,
				x: xy[0],
				y: xy[1],
				sx: xy[0],
				sy: xy[1],
				m: obj.momentum, o: o, color: obj.color,
				physics: obj.physics});
		})
	});
	var userNode = d3.range(1).map(function() {
		return {r: params.r, x: startXY.x(gameW, gameH), y: startXY.y(gameW, gameH), color: userColor, dist: 0};
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
			var r = get(d.r, d);
			var s = get(params.speed, d);
			if (d.x + movement.x * s <= gameW - r && d.x + movement.x * s >= r) {
				var move = movement.x ? movement.x * s / dist(movement.x, movement.y) : 0;
				d.x += move;
				d.dist += Math.abs(move);
			}
			if (d.y + movement.y * s <= gameH - r && d.y + movement.y * s >= r) {
				var move = movement.y ? movement.y * s / dist(movement.x, movement.y) : 0;
				d.y += move;
				d.dist += Math.abs(move);
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

function startingPosition(x, y, s, b) {
	var xy;
	while (!xy || dist(xy[0] - s[0], xy[1] - s[1]) <= b) {
		xy = [Math.random() * (x[1] - x[0]) + x[0], Math.random() * (y[1] - y[0]) + y[0]];
	}
	return xy;
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
			html += newPersonalityHtml(parseInt(level) + 1)
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
		if (levels[parseInt(level) + 1] || custom[parseInt(level) + 1]) {
			newPersonalityJs(parseInt(level) + 1);
		}
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

function newPersonalityHtml(level) {
	var all = allNewPersonalities(level);
	if (all.length != 0) {
		return '<h2>New ' + (all.length == 1 ? 'Personality' : 'Personalities') + ' Unlocked!</h2>' + $.map(all, function(d) { return newPersonality(d, personalities[d]); }).join('');
	} else {
		return '';
	}
}

function allNewPersonalities(level) {
	var all = Object.keys(levels[level].personalities);
	for (var i = 1; i < level; i++) {
		Object.keys(levels[i].personalities).forEach(function(d) {
			if (all.indexOf(d) != -1) {
				all.splice(all.indexOf(d), 1);
			}
		})
	}
	return all;
}

function newPersonalityJs(level) {
	var all = allNewPersonalities(level);
	if (all && all.length != 0) {
		all.forEach(function(d) {
			var p = personalities[d];
			drawPersonality(d, p)
		});
	}
}

function drawPersonality(d, obj) {
	d3.select('#' + d).append('circle').attr('transform', 'translate(' + $('#' + d).width() / 2 + ',' + $('#' + d).height() / 2 + ')')
		.attr('r', obj.r).style('fill', obj.color)
}

function newPersonality(d, obj) {
	var html = '<table class="personality"><tr><td class="pic"><svg id="' + d + '" class="svg"></svg></td><td>';
	html += '<h2>' + obj.name + '</h2><p>' + obj.bio + '</p>' + '</td></tr></table>';
	return html;
}

function layoutPersonalities() {
	var w = 400, perRow = 10, pad = 2, dw = w / perRow - 2 * pad, dh = dw, h = (dh + 2 * pad) * Math.floor((Object.keys(personalities).length - 1) / perRow + 1);
	var keys = Object.keys(JSON.parse(window.localStorage[scoreStorage]));
	var level = keys[keys.length - 1];
	var avail = [];
	for (var i = 1; i <= Math.min(level, Object.keys(levels).length); i++) {
		avail = $.merge(avail, Object.keys(levels[i].personalities));
	}
	avail = $.unique(avail);
	d3.select('#personalities').select('svg').remove();
	var svg = d3.select('#personalities').append('svg')
				.attr('width', w).attr('height', h);
	var icons = $.map(avail, function(d, i) {
		return {
			name: d,
			x: (i * (dw + 2 * pad)) % w + pad + dw / 2,
			y: Math.floor(i / perRow) * (dh + 2 * pad) + pad + dh / 2,
			w: dw,
			h: dh,
			d: personalities[d],
			r: dw / 2
		}
	});
	var g = svg.selectAll(".icons")
		.data(icons).enter()
		.append("g")
		.attr("width", function(d) { return d.w; })
		.attr("height", function(d) { return d.h; })
		.attr('class', 'icon');
	g.append('circle').attr('r', function(d) { return d.r; })
		.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
		.style('fill', function(d) { return d.d.color; })
		.on('click', function(d) {
			$('#modalContent').html(newPersonality(d.name, d.d) + '<a class="close-reveal-modal">&#215;</a>');
			drawPersonality(d.name, d.d);
			$('#levelEnd').reveal({
			     animation: 'fadeAndPop',
			     animationspeed: 300,
			     closeonbackgroundclick: true,
			     dismissmodalclass: 'close-reveal-modal'
			});
		});
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
				defaultInterval = null
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
	var num = Object.keys(levels).length + Object.keys(custom).length + 1;
	var t = $('#buildTitle').val(), speed = parseInt($('#buildSpeed').val()),
		size = parseInt($('#buildSize').val());
	var p = {};
	$('.build').each(function() {
		var me = $(this);
		if (!isNaN(parseInt(me.val())) && parseInt(me.val()) != 0) {
			p[me.attr('class').split(' ')[1]] = parseInt(me.val());
		}
	})
	if (Object.keys(p).length != 0) {
		var obj = {title: t, speed: speed, r: size, personalities: p};
		custom[num] = obj;
		window.localStorage[customStorage] = JSON.stringify(custom);
		init(num)
	} else {
		var html = '<h1>Now that level would be a little too easy...</h1>';
		html += '<p>Try selecting at least <i>one</i> enemy.</p>';
		html += '<button class="close">My b</button>';
		$('#modalContent').html(html);
		$('#levelEnd').reveal({
		     animation: 'fadeAndPop',
		     animationspeed: 300,
		     closeonbackgroundclick: true,
		     dismissmodalclass: 'close'
		});
	}
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

function setBuild() {
	var keys = Object.keys(JSON.parse(window.localStorage[scoreStorage]));
	var level = keys[keys.length - 1];
	var avail = [];
	for (var i = 1; i <= Math.min(level, Object.keys(levels).length); i++) {
		avail = $.merge(avail, Object.keys(levels[i].personalities));
	}
	avail = $.unique(avail);
	var html = avail.map(function(a) {
		return '<tr><td>' + personalities[a].name + ':</td><td><input type="number" min="0" value="0" style="width: 40px;" class="build ' + a + '"></td></tr>';
	})
	$('#buildPersonalities').html(html);
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