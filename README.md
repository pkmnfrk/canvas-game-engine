canvas-game-engine
==================

An HTML/JavaScript game creation engine. Includes support for [Tiled](http://www.mapeditor.org/) maps.

Requirements
------------
The only external library that is required is jQuery.

canvas-game-engine is AMD-compliant, so you can use something like [require.js](http://requirejs.org) to load it.

Quick-start guide
-----------------

1. Create your base page with a container `div` tag.
		
	    <!doctype html>
	    <html>
	    <head>
	    <title>My Game</title>
	    </head>
	    <body>
	    <div id="container"/>
	    <!-- put scripts here -->
	    </body>
	    </html>

2. Load jQuery and canvas-game-engine using your favourite method.

	Using require.js:

		<script data-main="main" src="require.js"></script>
		
		//in main.js
		requirejs(['jquery', 'canvas-game-engine', function($, CGE) { //...

	(Note that in this case, jQuery will be loaded automatically even if it's not loaded by your script)

	Manually loading:
	
		<script src="jquery.js"></script>
		<script src="canvas-game-engine.js"></script>
		<script>
		//...
		</script>

3. Instantiate a game manager:
	
		var gameManager = new CGE.GameManager({
			main: $("#container"),
			window: window
		});
4. Load a map, and make it active:
		
		var map = gameManager.loadMap('maps/myMap.tmx');

		gameManager.setMap(map);

