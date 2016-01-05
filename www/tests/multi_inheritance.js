Pulsar.class('A', Object, function($)
{
	$('var').varA1 = 'varA1';
	$().init = function(){}
	$().print = function() { alert (this.varA1) }
});

Pulsar.class('B', Object, function($)
{
	$('private var').varB1 = 'varB1';
	$().init = function(s){}
	$().print = function() { alert($(this).varB1) }
});

Pulsar.class('C', A, function($)
{
	$().init = function() { this.varA1 = 'varA1 from C' }
});

Pulsar.class('D', B, function($)
{
	$('static var').staticVarD = '';
	
	$('var').instanceVarD = 'JO LOCO';
	
	$('private var').priv = 'priv from D';
	
	$.initialization = function()
	{	
		D.staticVarD = 'AFTER INITIALIZATION';
	}
	
	$().init = function(varB1) { $(this).priv = 'ieieie' }
	
	$().print = function()
	{
		B.prototype.print.call(this);
		
		alert($(this).priv);
	}
	
	$().toString = function()
	{
		return `D.toString(${$(this).varB1})`;
	}
});

Pulsar.class('E', C, function($)
{
	$('let').a = $.new(D, 'James');
	
	$('var').x = undefined;
	
	$().init = function()
	{
		C.prototype.init.apply(this, arguments);
		
		this.x = 23;
	}
});

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