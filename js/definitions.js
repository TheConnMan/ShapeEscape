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

var defaults = {
	a: function(d, c, w, h) {
		return Math.atan2(c.y - d.y, c.x - d.x);
	},
	x: function(d, c, w, h) {
		var x = d.x + get(d.m, d, c, w, h) * Math.cos(d.a) / (d.r * d.r);
		return (x + d.r <= w && x >= d.r) ? x : d.x;
	},
	y: function(d, c, w, h) {
		var y = d.y + get(d.m, d, c, w, h) * Math.sin(d.a) / (d.r * d.r);
		return (y + d.r <= h && y >= d.r) ? y : d.y;
	}
};

function Physics(params) {
	var config = params || {};
	this.a = config.a || defaults.a;
	this.x = config.x || defaults.x;
	this.y = config.y || defaults.y;
}

Physics.prototype.config = function() {
	return {
		a: this.a,
		x: this.x,
		y: this.y
	};
};

Physics.prototype.move = function(d, cur, gameW, gameH) {
	d.a = this.a(d, cur, gameW, gameH);
	d.x = this.x(d, cur, gameW, gameH);
	d.y = this.y(d, cur, gameW, gameH);
};

var physics = {
	follow: new Physics(),
	followGhost: new Physics({
		a: function(d, c, w, h) {
			return Math.atan2(Math.abs(c.y - d.y) > Math.abs(h + c.y - d.y) ? h + c.y - d.y : c.y - d.y, Math.abs(c.x - d.x) > Math.abs(w + c.x - d.x) ? w + c.x - d.x : c.x - d.x);
		},
		x: function(d, c, w, h) {
			return (d.x + get(d.m, d, c, w, h) * Math.cos(d.a) / (d.r * d.r) + w) % w;
		},
		y: function(d, c, w, h) {
			return (d.y + get(d.m, d, c, w, h) * Math.sin(d.a) / (d.r * d.r) + h) % h;
		}
	})
};
physics.trajectory = new Physics({
	a: function(d, c, w, h) {
		return Math.atan2(c.y + 200 * movement.y - d.y, c.x + 100 * movement.x - d.x);
	},
	x: physics.follow.config().x,
	y: physics.follow.config().y
});
physics.follower = new Physics({
	a: function(d, c, w, h) {
		return Math.atan2(c.y - 50 * movement.y - d.y, c.x - 50 * movement.x - d.x);
	},
	x: physics.follow.config().x,
	y: physics.follow.config().y
});
physics.gaurd = new Physics({
	a: function(d, c, w, h) {
		return dist(d.sx - c.x, d.sy - c.y) <= 200 ? Math.atan2(c.y - d.y, c.x - d.x) : Math.atan2(d.sy - d.y, d.sx - d.x);
	},
	x: function(d, c, w, h) {
		return dist(d.sx - d.x, d.sy - d.y) <= 10 && dist(d.sx - c.x, d.sy - c.y) > 200 ? d.x : physics.follow.config().x(d, c, w, h);
	},
	y: function(d, c, w, h) {
		return dist(d.sx - d.x, d.sy - d.y) <= 10 && dist(d.sx - c.x, d.sy - c.y) > 200 ? d.y : physics.follow.config().y(d, c, w, h);
	}
});
physics.shy = new Physics({
	a: function(d, c, w, h) {
		return Math.PI + physics.follow.config().a(d, c, w, h);
	},
	x: physics.follow.config().x,
	y: physics.follow.config().y
});
physics.shy2 = new Physics({
	a: function(d, c, w, h) {
		var a = physics.follow.config().a(d, c, w, h);
		return Math.cos(Math.atan2(movement.y, movement.x) - a) < 0 && (movement.y !== 0 || movement.x !== 0) ? Math.PI + a : a;
	},
	x: function(d, c, w, h) {
		return d.x + Math.cos((movement.y !== 0 && movement.x !== 0) ? Math.atan2(movement.y, movement.x) - d.a : 0) * (physics.follow.config().x(d, c, w, h) - d.x);
	},
	y: function(d, c, w, h) {
		return d.y + Math.cos((movement.y !== 0 && movement.x !== 0) ? Math.atan2(movement.y, movement.x) - d.a : 0) * (physics.follow.config().y(d, c, w, h) - d.y);
	}
});
physics.teleporter = new Physics({
	a: function(d, c, w, h) {
		return physics.follow.config().a(d, c, w, h) + Math.PI * (Math.random() - 0.5) / 2;
	},
	x: function(d, c, w, h) {
		return Math.random() < 0.0025 ? d.x + Math.cos(d.a) * 100 : d.x;
	},
	y: function(d, c, w, h) {
		return Math.random() < 0.0025 ? d.y + Math.sin(d.a) * 100 : d.y;
	}
});
physics.circle = new Physics({
	a: function(d, c, w, h) {
		return 2 * Math.PI * (new Date().getTime() / 1000 + d.o) % (2 * Math.PI);
	},
	x: function(d, c, w, h) {
		return 100 * Math.cos(d.a) + d.sx;
	},
	y: function(d, c, w, h) {
		return 100 * Math.sin(d.a) + d.sy;
	}
});
physics.bee = new Physics({
	a: function(d, c, w, h) {
		return Math.atan2(c.y - d.y, c.x - d.x) + Math.PI / 2 * Math.cos(new Date().getTime() / 100 + 2 * d.o * Math.PI);
	},
	x: physics.follow.config().x,
	y: physics.follow.config().y
});
physics.strike = new Physics({
	a: physics.gaurd.a,
	x: function(d, c, w, h) {
		var dr = dist(d.x - c.x, d.y - c.y);
		return dr <= 150 && dr > 75 ? d.x + 10 * Math.cos(d.a) : physics.gaurd.config().x(d, c, w, h);
	},
	y: function(d, c, w, h) {
		var dr = dist(d.x - c.x, d.y - c.y);
		return dr <= 150 && dr > 75 ? d.y + 10 * Math.sin(d.a) : physics.gaurd.config().y(d, c, w, h);
	}
});
physics.orbit = new Physics({
	a: function(d, c, w, h) {
		return dist(d.sx - c.x, d.sy - c.y) <= 200 ? Math.atan2(c.y - d.y, c.x - d.x) + Math.PI / 2 : Math.atan2(d.sy - d.y, d.sx - d.x);
	},
	x: physics.gaurd.config().x,
	y: physics.gaurd.config().y
});
physics.territorialCorner = new Physics({
	a: physics.trajectory.config().a,
	x: function(d, c, w, h) {
		var fn = d.sx > w / 2 ? Math.max : Math.min;
		return fn(physics.trajectory.config().x(d, c, w, h), w / 2);
	},
	y: function(d, c, w, h) {
		var fn = d.sy > w / 2 ? Math.max : Math.min;
		return fn(physics.trajectory.config().y(d, c, w, h), w / 2);
	}
});
physics.territorialHalfX = new Physics({
	a: physics.trajectory.config().a,
	x: physics.territorialCorner.config().x,
	y: physics.trajectory.config().y
});
physics.territorialHalfY = new Physics({
	a: physics.trajectory.config().a,
	x: physics.trajectory.config().x,
	y: physics.territorialCorner.config().y
});
physics.spiral = new Physics({
	a: function(d, c, w, h) {
		return Math.atan2(c.y - d.y, c.x - d.x) + (Math.PI - 0.15) / 2;
	},
	x: physics.follow.config().x,
	y: physics.follow.config().y
});
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
	follower: {
		name: 'Follower',
		bio: "Follower just wants to be with you. He'll follow you around wherever you go.",
		r: 25,
		momentum: 350,
		points: 3,
		color: '#66FF66',
		physics: physics.follower
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
	},
	territorial: {
		name: 'Territorial',
		bio: "Territorial either stays its corner, its vertical half, or its horizontal half. Which one does each Territorial pick?",
		r: 25,
		momentum: 300,
		points: 3,
		color: '#663300',
		physics: function() {
			var num = Math.random();
			if (num < 1 / 3) {
				return physics.territorialCorner;
			}
			if (num < 2 / 3) {
				return physics.territorialHalfX;
			}
			return physics.territorialHalfY;
		}
	},
	spiral: {
		name: 'Closing In',
		bio: "Closing In spirals towards you. Slowly but surely she'll get you. Don't let her get too close.",
		r: 10,
		momentum: 400,
		points: 3,
		color: '#DD44DD',
		physics: physics.spiral
	}
}, defaultStart = {
	x: function(w, h) { return w / 2; },
	y: function(w, h) { return h / 2; }
};

var levels = [
	{title: 'Meet Basic', speed: 1, r: 20, personalities: {basic: 10}},
	{title: 'Ghost', speed: 1, r: 20, personalities: {basicGhost: 5, basic: 5}},
	{title: 'Follower', speed: 1, r: 20, personalities: {follower: 3}},
	{title: 'Seeker', speed: 1, r: 20, personalities: {seeker: 1}},
	{title: 'Gaurd', speed: 1, r: 20, personalities: {gaurd: 5, basic: 5}},
	{title: 'Seeker Pack', speed: 1, r: 20, personalities: {seeker: 4}},
	{title: 'Save Your Strength', speed: function(d) { return 0.3 + Math.max((1000 - d.dist) / 2000, 0); }, r: 20, personalities: {basic: 5}},
	{title: 'Shy Guy', speed: 1, r: 20, personalities: {shyGuy: 2, follower: 2, seeker: 2}},
	{title: 'Not-So-Shy Guy', speed: 1, r: 20, personalities: {shyGuy2: 5, seeker: 1}},
	{title: 'Teleporter', speed: 1, r: 20, personalities: {teleporter: 5}},
	{title: 'Circles', speed: 1, r: 20, personalities: {circle: 10, seeker: 1}},
	{title: 'Territorial', speed: 1, r: 20, personalities: {territorial: 9}},
	{title: 'House Party', speed: 1, r: 20, personalities: {basic: 1, basicGhost: 1, follower: 1, seeker: 1, gaurd: 1, shyGuy: 1, shyGuy2: 1, teleporter: 1, circle: 1, territorial: 1}},
	{title: 'Bumbble Bees', speed: 1, r: 20, personalities: {bee: 5}},
	{title: 'Black Mamba', speed: 1, r: 20, personalities: {mamba: 5, basic: 2}},
	{title: 'That\'s no moon...', speed: 1, r: 20, personalities: {orbit: 4, seeker: 2}},
	{title: 'Spiral', speed: 1, r: 20, personalities: {spiral: 2, basic: 1}}
].reduce(function(all, cur, i) {
	all[i + 1] = cur;
	return all;
}, {});
