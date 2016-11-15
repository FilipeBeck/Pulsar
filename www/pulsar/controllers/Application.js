Pulsar.class('Application', function($)
{
	$('static let').MAIN_QUEUE = 1

	$('static let').EXCLUSIVE_QUEUE = 2

	$('var').viewController = undefined;

	$('func').init = function(storyboardURL, fileOrFolder)
	{
		if (storyboardURL) {
			// Cena raiz
			var self = this;
			var storyboard = new Storyboard(storyboardURL);
			storyboard.instantiateInitialScene(function(viewController){ self.viewController = viewController });
		}
	}

	$('static func').dispatchAsync = function(queue, closure)
	{ //
		if (queue.constructor.name != 'Number') {
			closure = queue
			queue = Application.MAIN_QUEUE
		}

		if (queue == Application.MAIN_QUEUE) {
			messengers.push(closure)
			window.postMessage(`Application.dispatchAsync - ${messengers.length - 1}`, '*')
		}
		else {
			throw new Error('Application.EXCLUSIVE_QUEUE support not supported yet')
		}
	}

	var messengers = []

	window.addEventListener('message', function messageListener(event)
	{
		let message = event.data.split(' - ')

		if (message[0] == 'Application.dispatchAsync') {
			event.stopPropagation()
			messengers[message[1]]()
			delete messengers[message[1]]
		}
	}, true)
})
