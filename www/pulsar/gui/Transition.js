$.import('../stdlib/Bezier.js')

Pulsar.class('Transition', function($)
{
	$('static var').FRAME_RATE = 60

	$('var').timeInterval = 0.5

	$('func').init = function(timeInterval)
	{
		if (timeInterval)
			this.timeInterval = timeInterval
	}

	$('func').transitionTimingEase = function*()
	{
		yield* this.transitionTimingCubicBezier(new Point(0.25, 0.1), new Point(0.25, 1))
	}

	$('func').transitionTimingLinear = function*()
	{
		yield* this.transitionTimingCubicBezier(new Point(0, 0), new Point(1, 1))
	}

	$('func').transitionTimingEaseIn = function*()
	{
		yield* this.transitionTimingCubicBezier(new Point(0.42, 0), new Point(1, 1))
	}

	$('func').transitionTimingEaseOut = function*()
	{
		yield* this.transitionTimingCubicBezier(new Point(0, 0), new Point(0.58, 1))
	}

	$('func').transitionTimingEaseInOut = function*()
	{
		yield* this.transitionTimingCubicBezier(new Point(0.42, 0), new Point(0.58, 1))
	}

	$('func').transitionTimingCubicBezier = function*(p1, p2)
	{
		let bezier = new Bezier(
			{ x: 0, y: 0 },
			{ x: p1.x, y: p1.y },
			{ x: p2.x, y: p2.y },
			{ x: this.timeInterval, y: 1 }
		)

		let frames = bezier.getLUT(this.timeInterval * Transition.FRAME_RATE)

		for (let i = 0, count = frames.length; i < count; i ++)
			yield frames[i].y
	}
})
