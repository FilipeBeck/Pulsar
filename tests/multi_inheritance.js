Pulsar.class('A', Object, function($){ $().init = function($){}});
Pulsar.class('B', Object, function($){ $().init = function($){}});
Pulsar.class('C', A, function($){});
Pulsar.class('D', B, function($){});
Pulsar.class('E', C, function($){});
Pulsar.class('F', C, function($){});
Pulsar.class('G', D, function($){});
Pulsar.class('H', D, function($){});
Pulsar.class('I', F, G, function($){});
Pulsar.class('Q', I, function($){});
Pulsar.class('J', E, function($){});
Pulsar.class('O', J, function($){});
Pulsar.class('L', J, function($){});
Pulsar.class('P', O, function($){});
Pulsar.class('W', P, function($){});
Pulsar.class('Z', P, function($){});
Pulsar.class('PI', Z, Q, function($){});
Pulsar.class('M', L, function($){});
Pulsar.class('Y', M, function($){});
Pulsar.class('N', H, function($){});
Pulsar.class('R', N, function($){});
Pulsar.class('S', N, function($){});
Pulsar.class('T', R, S, function($){});
Pulsar.class('U', T, function($){});
Pulsar.class('V', T, function($){});
Pulsar.class('X', T, function($){});
Pulsar.class('PA', PI, U, function($){});

var names = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'PI', 'PA' ];
var classes = {};

for (var i in names)
	classes[names[i]] = new window[names[i]]();