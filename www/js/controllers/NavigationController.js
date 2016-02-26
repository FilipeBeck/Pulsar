$.import('ViewController.js');

Pulsar.class('NavigationController', ViewController, function($)
{
	$('var').indexIdentifier = null;
	
	$('var').rootScene = {
		get: function(){ return this.scenes[0]; }
	}
	
	$('var').topScene = {
		get: function(){ return this.scenes[this.scenes.length - 1]; }
	}
	
	$('var').scenes = $.new(Array);
	
	$().viewDidLoad = function()
	{
		this.view.node.style.position = 'absolute';
		
		var self = this;
		
		this.scenes.push(this.storyboard.instantiateSceneWithIdentifier(this.indexIdentifier, this.view, function(controller){
			controller.navigationController = self;
		}));
	}
	
	$().pushScene = function(scene)
	{
		
	}
	
	$().performSegue = function(identifier, sender)
	{
		var self = this;
		
		var currentScene = this.topScene;
		currentScene.node.style.position = 'absolute';
		
		this.scenes.push(this.storyboard.instantiateSceneWithIdentifier(identifier, this.view, function(controller){
			controller.navigationController = self;
			View.animate(1.0, function(){
				currentScene.node.style.left = 20.0;
			}, function(){
				currentScene.removeFromSuperview();
			});
		}));
	}
})