"use strict";

//$.import('test2.js')
//$.import('test2.js')

Pulsar.class('Undef', Object, function($)
{
	$('public var').p = 'IIEIE'
	
	$().init = function()
	{
		
	}
	
	$().print = function()
	{
		alert(this.p)
	}
})

/**
 * Elemento HTML
 */
Pulsar.class('Element', Object, function($)
{
	/** Referência ao elemento no documento */
	$('private var').node = undefined;
	
	/**
	 * Cria o elemento
	 * @param {String} tagName Nome do elemento
	 */
	$().init = function(tagName)
	{
		if (typeof tagName === 'string')
			$(this).node = document.createElement(tagName);
		else
			$(this).node = tagName;
	}
	
	$().append = function(child)
	{
		$(this).node.appendChild($(child).node);
	}
	
	$().print = function()
	{
		console.log('Element.print()', this);
	}
})

Pulsar.class('View', Element, function($)
{
	$('public let').subviews = [];
	
	$().init = function()
	{
		Element.prototype.init.call(this, 'div');
	}
	
	$('public').addSubview = function(subview)
	{
		this.subviews.push(subview);
		this.append(subview);
	}
})

Pulsar.class('Window', View, function($)
{
	$().init = function()
	{
		Element.prototype.init.call(this, document.body);
	}
})

Pulsar.class('Label', View, function($)
{
	$('public var').text = {
		get: function() {
			return $(this).node.innerHTLM
		},
		set: function(newValue) {
			var node = document.createElement('p');
			node.innerHTML = newValue;
			this.append(new Element(node));
		}
	}
})

Pulsar.class('Different', Object, function($)
{
	$('private var').node = undefined;
	
	$().init = function()
	{
		$(this).node = document.createElement('p');
	}
})

var win = new Window();
var view = new View();
var label = new Label();
label.text = 'This is a text label';
view.addSubview(label);
win.addSubview(view);

//var element = {};
//Element.prototype.constructor.call(element);
//document.createElement('p');
//console.log('ELEMENT', element);
//element = new UIView()
//element = new Element()
//document.body.appendChild(element);
//element.show();
//view.print();

/*function UIView()
{
	this.print = function()
	{
		console.log('new UIView()', this);
	}
}

UIView.prototype = Object.create(HTMLElement.prototype);

var view = new UIView();
view.print();
*/

/**
 * Um ponto 2D
 */
Pulsar.class('Point', Object, function($)
{
	/** Abcissa e ordenada */
	$('public var').location = new Dictionary({ x: 100.0, y: 200.0 })
	
	/**
	 * Construtor
	 * @param {number} x Abcissa
	 * @param {number} y Ordenada
	 */
	$().init = function(x, y)
	{
		console.log('Point.init(x,y)', this);
		
		this.location.x = x
		this.location.y = y
	}
	
	/**
	 * Imprime os atributos
	 */
	$().print = function()
	{
		console.log('Point.print()', this);
	}
	
	$('private let').p = 'PRIVATE POINT';
	
	$().alertPoint = function()
	{
		alert($(this).p)
	}
})

/**
 * Uma grandeza vetorial
 */
Pulsar.class('Vectorial', Object, function($)
{
	/** Ângulo */
	$('public var').angle = Math.PI;
	/** Delta X */
	$('public var').dx = {
		get: function() { return Math.cos(this.angle) }
	}
	/** Delta Y */
	$('public var').dy = {
		get: function() { return Math.sin(this.angle) }
	}
	
	$().init = function(angle)
	{
		console.log('Vectorial.init(angle)', this);
		
		this.angle = angle
	}
	
	$().print = function()
	{
		console.log('Vectorial.print()', this);
	}
	
	$('private let').v = 'PRIVATE VECTORIAL'
	$().alertVectorial = function()
	{
		alert($(this).v)
	}
})

/**
 * Uma partícula
 */
Pulsar.class('Particle', Point, Vectorial, function($)
{
	$('static var').p = 'NEW PRIVATE POINT IN PARTICLE'
	
	$().init = function(x, y, angle)
	{
		console.log('Particle.init(x,y, angle)', this.location);
		
		//Vectorial.prototype.init.call(this, angle);
		//Point.prototype.init.call(this, x, y);
	}
	
	$().print = function()
	{
		console.log('Particle.print()', this);
	}
	
	$('private var').pa = 'PRIVATE PARTICLE'
	
	$().alertParticle = function()
	{
		alert($(this).pa)
	}
})

Pulsar.class('Sprite', Particle, function($)
{
	$('public var').image = 'IMAGE.jpg'
	
	$().init = function(image)
	{
		
		this.image = image
	}
	
	$('private let').biruBiru = 35;
})

var point = new Point(10.0, 20.0);
var vecttorial = new Vectorial(Math.PI / 2.0)
var particle = new Particle(8.0, 16.0, Math.PI / 2.0)
var sprite = new Sprite('MyImage.png')

point.print()
vecttorial.print()
particle.print()
sprite.print();

//point.alertPoint()
//particle.alertPoint()
//particle.alertVectorial()
//particle.alertParticle()

console.log('END')

/*
Pulsar.class('MyClass', Object, function($)
{
	
	// Minha espécie
	$(`public var`).KIND = 'Human';
	// Este é meu nome
	$(`private var`).name = 'Filipe'

	$('var').myName = {
		get: function() {
			return $(this).name
		},
		set: function(newValue) {
			$(this).name = newValue
		}
	}

	// Este é minha  idade
	$(`var`).myAge = 31

	$(`var`).x = 15
	$('let').y = 13

	$('static var').n = {
		get: function() {
			//console.log('MyClass.get(n)', this._n);
			return this._n;
		},
		set: function(newValue) {
			this._n = newValue;
			//.log('MyClass.set(n)', this._n);
		}
	}

	$(`var`).text = {
		get: function () {
			return this._text
		},
		set: function(newValue) {
			this._text = newValue;
		}
	}

	$().print = function()
	{
		//alert('this.n = ' + this.n * 2);
	}

	$().init = function()
	{
		//alert('EI')//$(this1 ).myName = myName;
		// iooioioio
		//$(this1).x = 14
	}
});

Pulsar.class('YourClass', MyClass, function($)
{
	$('let').yourName = 'Beck'
	$(`var`).yourAge = 31

	$().init = function()
	{ //var x = this.text
		//console.log('x', x)
		//this.yourName = yourName
		//this.yourAge = yourAge
	}
})

Pulsar.class('OurClass', MyClass, Object, YourClass, function($)
{
	$('var').ourName = {
		get: function(){
			return this.myName + ' ' + this.yourName
		}
	}

	$('var').ourAge = {
		get: function(){
			return this.myAge + this.yourAge
		}
	}
})

var myClass = new MyClass();
var yourClass = new YourClass();
var ourClass = new OurClass();

myClass.myName = 'filipe roberto'*/

//alert('myClass\nname = ' + myClass.myName + '\nage = ' + myClass.myAge)
//alert('yourClass\nname = ' + yourClass.yourName + '\nage = ' + yourClass.yourAge)
//alert('ourClass\nname = ' + ourClass.ourName + '\nage = ' + ourClass.ourAge)
/*
MyClass.prototype = {
	x: 35
}
var myClass = new MyClass();

Object.defineProperty(myClass, 'x', { value:35});

console.log('MyClass', myClass);
alert('BREAK');

function YourClass()
{
	MyClass.call(this);
}

YourClass.prototype = new MyClass();
YourClass.prototype.y = 44;
var yourClass = new YourClass();
yourClass.z = 88;
console.log('YourClass', yourClass);
alert('BREAK');

function WeClass(){};

WeClass.prototype = Object.create(YourClass.prototype);
WeClass.prototype.y = 44;
var weClass = new WeClass();
weClass.w = 84;
console.log('WeClass', weClass);
alert('BREAK');*/

/*
window['Shape']	= function() {
this.x = 0;
this.y = 0;
}

// superclass method
window['Shape'].prototype.move = function(x, y) {
this.x += x;
this.y += y;
console.info('Shape moved.\n x = ' + this.x + '; y = ' + this.y);
};

// Rectangle - subclass
window['Rectangle'] = function() {
Shape.call(this); // call super constructor.
}

// subclass extends superclass
function create (Class, Superclass)
{
window[Class].prototype = Object.create(Superclass.prototype);
window[Class].prototype.constructor = window[Class];
}

create('Rectangle', Shape)

var rect = new Rectangle();

console.log('Is rect an instance of Rectangle?', rect instanceof Rectangle);// true
console.log('Is rect an instance of Shape?', rect instanceof Shape);// true
rect.move(1, 1); // Outputs, 'Shape moved.'

var Square = function(){
Rectangle.call(this);
}

create('Square', Rectangle);

var square = new Square();

console.log('Is circle an instance of Rectangle?', square instanceof Rectangle);// true
console.log('Is circle an instance of Shape?', square instanceof Shape);// true
square.move(1, 1); // Outputs, 'Shape moved.'

//console.log('SHAPE', shape);
console.log('RECTANGLE', rect);
console.log('SQUARE', square);
alert('SHAPES');*/
/*	Pulsar.class('MyClass', Object,
	{
		qwerty: { value: 33 }
	},
	function()
	{
		this.x = 10;
		this.y = 15;

		this.print = function()
		{
			alert('x = ' + this.x + ' y = ' + this.y);
		};
	});

	var myClass = new MyClass();
	console.log('MyClass', myClass);
	myClass.print();
	alert('BREAK');

	Pulsar.class('MyAnotherClass', MyClass, {}, function()
	{ 
		MyClass.call(this);
		this.z = 'PI';
		alert(this.z);
	});

	var myAnotherClass = new MyAnotherClass();
	console.log('MyAnotherClass', myAnotherClass);
	myAnotherClass.print();

	Pulsar.class('FinalClass', MyAnotherClass, {}, function()
	{
		MyAnotherClass.call(this);
	});

	var finalClass = new FinalClass();
	console.log('FinalClass', finalClass);
	finalClass.print();*/
	//var myDiv = document.getElementById('myDiv1');
	//var myH1 = document.getElementById('myH1');
	//var canvas = document.getElementById('UICanvas1');

	//var context = canvas.getContext('2d');

	//context.fillStyle = "#FF0000";
	//context.fillRect(0,0,canvas.width,canvas.height);