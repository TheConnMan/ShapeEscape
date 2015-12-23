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
		a: function(d, c, w, h) { return Math.atan2(Math.abs(c.y - d.y) > Math.abs(h + c.y - d.y) ? h + c.y - d.y : c.y - d.y, Math.abs(c.x - d.x) > Math.abs(w + c.x - d.x) ? w + c.x - d.x : c.x - d.x); },
		dx: function(d, c, w, h) { return (d.x + get(d.m, d, c, w, h) * Math.cos(d.a) / (d.r * d.r) + w) % w; },
		dy: function(d, c, w, h) { return (d.y + get(d.m, d, c, w, h) * Math.sin(d.a) / (d.r * d.r) + h) % h; }
	}
};
physics.trajectory = {
	a: function(d, c, w, h) { return Math.atan2(c.y + 200 * movement.y - d.y, c.x + 100 * movement.x - d.x); },
	dx: physics.follow.dx,
	dy: physics.follow.dy
};
physics.gaurd = {
	a: function(d, c, w, h) { return dist(d.sx - c.x, d.sy - c.y) <= 200 ? Math.atan2(c.y - d.y, c.x - d.x) : Math.atan2(d.sy - d.y, d.sx - d.x); },
	dx: function(d, c, w, h) { return dist(d.sx - d.x, d.sy - d.y) <= 10 && dist(d.sx - c.x, d.sy - c.y) > 200 ? d.x : physics.follow.dx(d, c, w, h); },
	dy: function(d, c, w, h) { return dist(d.sx - d.x, d.sy - d.y) <= 10 && dist(d.sx - c.x, d.sy - c.y) > 200 ? d.y : physics.follow.dy(d, c, w, h); }
};
physics.shy = {
	a: function(d, c, w, h) { return Math.PI + physics.follow.a(d, c, w, h); },
	dx: physics.follow.dx,
	dy: physics.follow.dy
};
physics.shy2 = {
	a: function(d, c, w, h) { var a = physics.follow.a(d, c, w, h); return Math.cos(Math.atan2(movement.y, movement.x) - a) < 0 && (movement.y !== 0 || movement.x !== 0) ? Math.PI + a : a; },
	dx: function(d, c, w, h) { return d.x + Math.cos((movement.y !== 0 && movement.x !== 0) ? Math.atan2(movement.y, movement.x) - d.a : 0) * (physics.follow.dx(d, c, w, h) - d.x); },
	dy: function(d, c, w, h) { return d.y + Math.cos((movement.y !== 0 && movement.x !== 0) ? Math.atan2(movement.y, movement.x) - d.a : 0) * (physics.follow.dy(d, c, w, h) - d.y); }
};
physics.teleporter = {
	a: function(d, c, w, h) { return physics.follow.a(d, c, w, h) + Math.PI * (Math.random() - 0.5) / 2; },
	dx: function(d, c, w, h) { return Math.random() < 0.0025 ? d.x + Math.cos(d.a) * 100 : d.x; },
	dy: function(d, c, w, h) { return Math.random() < 0.0025 ? d.y + Math.sin(d.a) * 100 : d.y; }
};
physics.circle = {
	a: function(d, c, w, h) { return 2 * Math.PI * (new Date().getTime() / 1000 + d.o) % (2 * Math.PI); },
	dx: function(d, c, w, h) { return 100 * Math.cos(d.a) + d.sx; },
	dy: function(d, c, w, h) { return 100 * Math.sin(d.a) + d.sy; }
};
physics.bee = {
	a: function(d, c, w, h) { return Math.atan2(c.y - d.y, c.x - d.x) + Math.PI / 2 * Math.cos(new Date().getTime() / 100 + 2 * d.o * Math.PI); },
	dx: physics.follow.dx,
	dy: physics.follow.dy
};
physics.strike = {
	a: physics.gaurd.a,
	dx: function(d, c, w, h) { var dr = dist(d.x - c.x, d.y - c.y); return dr <= 150 && dr > 75 ? d.x + 10 * Math.cos(d.a) : physics.gaurd.dx(d, c, w, h); },
	dy: function(d, c, w, h) { var dr = dist(d.x - c.x, d.y - c.y); return dr <= 150 && dr > 75 ? d.y + 10 * Math.sin(d.a) : physics.gaurd.dy(d, c, w, h); }
};
physics.orbit = {
		a: function(d, c, w, h) { return dist(d.sx - c.x, d.sy - c.y) <= 200 ? Math.atan2(c.y - d.y, c.x - d.x) + Math.PI / 2 : Math.atan2(d.sy - d.y, d.sx - d.x); },
		dx: physics.gaurd.dx,
		dy: physics.gaurd.dy
	};
var personalities = {
	basic: {
		name: 'Basic',
		bio: "Basic is your average Joe. He enjoys lounging around, weekends, and chasing you. He likes a relaxing chase, but likes to clear his mind while doing so. He'll go to where you are, but can easily be decieved if you run circles around him.",
		r: 20,
		momentum: 150,
		points: 1,
		color: 'gray',
		physics: physics.follow
	},
	basicGhost: {
		name: 'Ghost',
		bio: "Ghost is a run-of-the-mill ghost. She puts in about as much effor as Basic, but doesn't care for pesky walls. She'll chase you and it it's faster to go through the wall to get you she will.",
		r: 20,
		momentum: 150,
		points: 3,
		color: '#EEE',
		physics: physics.followGhost
	},
	seeker: {
		name: 'Seeker',
		bio: "Seeker's gotten some intel about where you're going and moves to intercept you. Watch out: this guy's sneaky.",
		r: 20,
		momentum: 250,
		points: 5,
		color: 'blue',
		physics: physics.trajectory
	},
	gaurd: {
		name: 'Gaurd Dog',
		bio: "Gaurd Dog won't bother you if you're far away, but if you get too close to him he'll chase after you. He's very protective of his space.",
		r: 20,
		momentum: 350,
		points: 4,
		color: 'green',
		physics: physics.gaurd
	},
	shyGuy: {
		name: 'Shy Guy',
		bio: "Shy Guy is, well, a shy guy. He's big, but once you get to know him he's a cool dude.",
		r: 150,
		momentum: 35000,
		points: 2,
		color: 'red',
		physics: physics.shy
	},
	shyGuy2: {
		name: 'Not-So-Shy Guy',
		bio: "This guy acts like he's shy, but he really isn't. He's just trying to sneak up on you when you're not looking...",
		r: 40,
		momentum: 900,
		points: 3,
		color: 'darkred',
		physics: physics.shy2
	},
	teleporter: {
		name: 'Teleporter',
		bio: "Teleporter has a bit of a glitch: he can teleport, but it only works some of the time. Watch out, he could get lucky.",
		r: 40,
		momentum: 900,
		points: 4,
		color: 'steelblue',
		physics: physics.teleporter
	},
	circle: {
		name: 'Circle',
		bio: "Circle likes his circle. He won't bother you, just don't get in his way.",
		r: 20,
		momentum: 900,
		points: 3,
		color: 'purple',
		physics: physics.circle
	},
	bee: {
		name: 'Bumbble Bee',
		bio: "Buzzzz buzzzzzzzzzzzzzz.",
		r: 20,
		momentum: 400,
		points: 2,
		color: 'yellow',
		physics: physics.bee
	},
	mamba: {
		name: 'Black Mamba',
		bio: "The Black Mamba is like the Gaurd, but moves very fast once you're within striking distance. If you see it move, run in the opposite direction.",
		r: 10,
		momentum: 100,
		points: 4,
		color: 'black',
		physics: physics.strike
	},
	orbit: {
		name: 'Orbital',
		bio: "The Orbital orbits you when you get near. I think he's calling you fat.",
		r: 10,
		momentum: 400,
		points: 1,
		color: 'brown',
		physics: physics.orbit
	}
}, defaultStart = {
	x: function(w, h) { return w / 2; },
	y: function(w, h) { return h / 2; }
};

var levels = {
	1: {title: 'Meet Basic', speed: 1, r: 20, personalities: {basic: 10}},
	2: {title: 'Ghost', speed: 1, r: 20, personalities: {basicGhost: 5, basic: 5}},
	3: {title: 'Seeker', speed: 1, r: 20, personalities: {seeker: 1}},
	4: {title: 'Gaurd', speed: 1, r: 20, personalities: {gaurd: 5, basic: 5}},
	5: {title: 'Seeker Pack', speed: 1, r: 20, personalities: {seeker: 4}},
	6: {title: 'Save Your Strength', speed: function(d) { return 0.3 + Math.max((1000 - d.dist) / 2000, 0); }, r: 20, personalities: {basic: 5}},
	7: {title: 'Shy Guy', speed: 1, r: 20, personalities: {shyGuy: 2, seeker: 2}},
	8: {title: 'Not-So-Shy Guy', speed: 1, r: 20, personalities: {shyGuy2: 5, seeker: 1}},
	9: {title: 'Teleporter', speed: 1, r: 20, personalities: {teleporter: 5}},
	10: {title: 'Circles', speed: 1, r: 20, personalities: {circle: 10, seeker: 1}},
	11: {title: 'House Party', speed: 1, r: 20, personalities: {basic: 1, basicGhost: 1, seeker: 1, gaurd: 1, shyGuy: 1, shyGuy2: 1, teleporter: 1, circle: 1}},
	12: {title: 'Bumbble Bees', speed: 1, r: 20, personalities: {bee: 5}},
	13: {title: 'Black Mamba', speed: 1, r: 20, personalities: {mamba: 5, basic: 2}},
	14: {title: 'That\'s no moon...', speed: 1, r: 20, personalities: {orbit: 4, seeker: 2}}
};
