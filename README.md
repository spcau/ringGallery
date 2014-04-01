ringGallery
===========

##Description
javascript library for for viewing photos and videos on web pages.

##Features
* Photos are arranged in a ring sequence, forming a continuous loop.
* Navigation buttons for next, previous, first and last photos.
* Index of all photos using small thumbnails image.
* Display photos and videos automatically in a slide show.
* Supports finger swipe action for navigating photos on touch screen devices.
* Supoorts expanding to full screen.
* Supports video playback with HTML5 Video.

#Photo Album Features
* Group photos in albums
* Data for photo album stored in JSON file

##Technical
* Pure javascript, no dependency on other javascript library or resources.
* Works on Desktop browsers: Chromium, Firefox, Safari, IE (8 onwards).
* Works on Mobile browsers: Android, Apple/iOS.
* Supports large numbers of photos (1000+) by loading photos on demand.
* All button images are embeded as base64 encoded Gif images.
* Small size: Around 22K.

##Usage
* Include `ringgallery.js` into your html code.
* Create a empty `<div>` on your web page where you would like the photos to appear.
* Call the ringGallery() function with the given `div`, and an array of photos.

The ringGallery() function takes 2 arguments:

1. the `<div>` element
2. an array of photos, where each array entry contains the photo and thumbnail url.

##Example

	<div style="position:fixed; top:0; left:0; bottom:0; right:0;" id="gallery"></div>
	<script type="text/javascript" src="../ringgallery.js" charset="UTF-8"></script>
	<script type="text/javascript">
	var pics=[	
		{"photo":"DSC00017-1024x768.jpg", "thumb":"DSC00017-sm.jpg"},
		{"photo":"DSC00064-1024x768.jpg", "thumb":"DSC00064-sm.jpg"},
		{"photo":"DSC00075-1024x768.jpg", "thumb":"DSC00075-sm.jpg"},
		{"photo":"DSC_1315-1024x680.jpg", "thumb":"DSC_1315-sm.jpg"},
		{"photo":"DSC00128-1024x768.jpg", "thumb":"DSC00128-sm.jpg"},
		{"photo":"DSC00295-1024x768.jpg", "thumb":"DSC00295-sm.jpg"},
		{"photo":"DSC00384-1024x768.jpg", "thumb":"DSC00384-sm.jpg"}
	]
	window.onload = function(){
			ringGallery(document.getElementById('gallery'), pics);
		}
	</script>

##Demo
See [Photo Gallery Demo](http://raw.githack.com/spcau/ringGallery/master/demo/index.html) here.
([html](http://github.com/spcau/ringGallery/blob/master/demo/index.html) source)

See [Photo Album Demo](http://raw.githack.com/spcau/ringGallery/master/demo/album.html) here.
([html](http://github.com/spcau/ringGallery/blob/master/demo/album.html) source)
