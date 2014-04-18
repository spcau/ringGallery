/*
** ringGallery: javascript function for displying photos
** http://github.com/spcau/ringGallery
*/
function ringGallery(dOuter, pics, urlPath) {
'use strict';
var	dMain = ndiv('rgmain'),
	dScroll = ndiv('rgscroll'),
	dMenu = ndiv('rgmenu'),
	dControl = ndiv('rgctrl'),
	dVbar = ndiv('rgvbar'),
	dVmeter = ndiv('rgvmtr'),
	dVtime = ndiv('rgvtime'),
	dNumber = ndiv('rgnum'),
	dIndex = null,
	btnSlide, btnStop, btnFirst, btnPrev, btnNext, btnLast, btnIndex, btnPlay, btnPause,
	npics = pics.length,
	ipic = 0,
	sTransition, sTransform,
	hasVideo = false, bgZoom,
	ssOn = false, ssLast = 0, ssInt = 0, ssNext = 0, ssPause = false,
	SS_DELAY = 3000, TIMER_MOVE_MS = 150, TIMER_SLIDESHOW_MS = 1200,
	scrollX = 0, touchX, touchNext, touchPrev,
	htmlWait,
	isMenuAlways = false, inBottom = false, menuHideTimeout = 0;


/*
** CSS functions
*/
function cssfx2(p, s) {
	return p + s + p + '-webkit-' + s + p + '-moz-' + s + p + '-ms-' + s;
}

function cssfx(s) {
	return cssfx2('', s);
}

function c2h(c,a) {
	return (((a*255)<<24|c<<16|c<<8|c)>>>0).toString(16);
}

function cssBg(c0,c1,a) {
	return 'background:none;' + cssfx2('background:','linear-gradient(top,rgba('+c0+','+c0+','+c0+','+a+'),rgba('+c1+','+c1+','+c1+','+a+'));') +
		"filter:progid:DXImageTransform.Microsoft.gradient(startColorStr='#" + c2h(c0,a) + "',endColorStr='#" + c2h(c1,a) + "');";
}

function cssTrn(e, s) {
	if (sTransition) {
		e.style[sTransition] = s;
	}
}

function nEl(n, c) {
	var d = document.createElement(n);
	d.className = c || '';
	return d;
}

function ndiv(c) {
	return nEl('div', c);
}

function initCss() {
	var MBAR = '2.8em',
		el = nEl('style'),
		css = el.style, i, s,
		absinline = 'position:absolute;display:inline-block;';

	function prop(n1, n2) {
		var j, n, p = ['webkit','Moz','O','ms'];
		for (j = 0 ; j < 4; j++) {
			n = p[j] + n2;
			if (n in css) {
				return n;
			}
		}
		return n1 in css ? n1 : null;
	}

	function add(a,b) {
		try {
			if (css.insertRule) {
				css.insertRule(a+ '{' + b + '}',0);
			} else {
				css.addRule(a,b);
			}
		} catch (err) { }
	}

	sTransition = prop('transition', 'Transition');
	sTransform = prop('transform', 'Transform');
	bgZoom = !('backgroundSize' in css);
	el.type = 'text/css';
	document.getElementsByTagName('head')[0].appendChild(el);
	css = el.sheet || el.styleSheet;

	add('.rgmain',
		absinline +
		'text-align:left;' +
		'background:#000;' +
		'color:white;' +
		'width:100%;height:100%;' +
		cssfx('user-select:none;'));

	add('.rgbottom', absinline + 'width:100%;bottom:0;height:' + MBAR);

	add('.rgmenu',
		absinline +
		'text-align:center;' +
		'vertical-align:middle;' +
		cssBg(48,16,0.7) +
		'line-height:' + MBAR + ';' +
		'width:100%;top:100%;height:' + MBAR);

	add('.rgscroll',
		absinline +
		'width:400%;height:100%');

	add('.rgbox',
		'position:relative;' +
		'display:inline-block;' +
		'width:25%;height:100%;' +
		'overflow:hidden;' +
		'cursor:pointer');

	s = 'background-repeat:no-repeat;background-position:center center;';
	add('.rgbtn',
		'display:inline-block;' +
		'cursor:pointer;' +
		'width:' + MBAR + ';height:100%;' +
		'border:1px outset #484848;' + s);

	add('.rgbtn:hover', 'background-color:#404040');

	add('.rgimgbox',
		absinline + s +
		'background-size:contain;' +
		'height:100%;width:100%');

	add('.rgvideo',
		absinline +
		'width:100% !important;height:100% !important');

	add('.rgvbar',
		absinline +
		'text-align:left;' +
		'left:0;width:100%;height:2em;bottom:100%');

	s = absinline + 'left:0;width:100%;height:6px;';
	add('.rgvmtr', s + cssBg(48,48,0.3) + 'bottom:0');
	add('.rgvmtr0', s + cssBg(255,220,1));
	add('.rgvmtr1', s + cssBg(255,220,0.2));

	add('.rgvtime',
		absinline +
		cssBg(32,32,0.7) +
		'padding:3px;' +
		'font-size:.9em;' +
		'line-height:1em;' +
		'left:0;bottom:6px');

	add('.rgnum',
		'display:inline-block;' +
		'font-size:1.2em');

	add('.rgbbtn',
		absinline +
		'pointer-events:none;' +
		'top:50%;width:3em;height:4em;' +
		'margin:-2em 0;' +
		'box-shadow:2px 2px 4px 0 #101010;' +
		cssBg(128,128,0.5) +
		cssfx('border-radius:1em;'));

	s = absinline + 'width:0;height:0;top:1.2em;border:.8em solid transparent;';
	add('.rgarrowleft', s + 'left:.2em;border-right-color:white');
	add('.rgarrowright', s + 'right:.2em;border-left-color:white');

	add('.rgctrl',
		absinline +
		'pointer-events:none;' +
		'top:50%;left:50%;width:10em;height:10em;' +
		cssBg(130,99,0.9) +
		'box-shadow:8px 8px 16px 0 #202020;' +
		'margin:-5em;' +
		cssfx('border-radius:2em;'));

	s = absinline + 'background:white;';
	add('.rgstop', s + 'top:30%;left:30%;right:30%;bottom:30%');
	add('.rgpause', s + 'top:25%;width:13%;bottom:25%;');
	add('.rgplay', absinline +
		'width:0;height:0;top:20%;left:32%;' +
		'border:3em solid transparent;' +
		'border-left:4.8em solid white');

	add('.rgidx',
		absinline +
		'width:100%;height:100%;' +
		cssBg(0,0,0.7));

	add('.rgidx>div',
		absinline +
		'text-align:left;' +
		'top:5%;left:5%;max-width:90%;max-height:85%;' +
		'overflow-y:auto;' +
		'border:solid 2px #606060;' +
		'background:#303030;' +
		'padding:8px');

	add('.rgidx>div>img',
		'height:55px;max-width:150px;' +
		'margin:3px;padding:2px;' +
		'background:#e0e0e0;' +
		'cursor:pointer');

	add('.rgidx>div>img:hover', 'opacity:.5');

	if (sTransition) {
		add('div.rgwait',
			absinline +
			'width:10em;height:10em;' +
			'top:50%;left:50%;' +
			'margin:-5em');

		add('div.rgwait>div',
			absinline +
			'width:10%;height:28%;' +
			'left:45%;top:36%;' +
			'background:white;' +
			cssfx('animation:waitfade 1s linear infinite;') +
			cssfx('border-radius:4em;'));

		s = 'from {opacity:1;} to {opacity:.1;}';
		add('@keyframes waitfade', s);
		add('@-webkit-keyframes waitfade', s);
		htmlWait = '';
		for (i = 0; i < 10; i++) {
			add('div.rgwait div.b' + i,
				cssfx('transform:' + 'rotate(' + ((360/10) * i) + 'deg) translate(0, -110%);') +
				cssfx('animation-delay:' + ((i-10)/10) + 's;'));
			htmlWait += '<div class="b' + i + '"></div>';
		}
	} else {
		add('.rgwait',
			absinline +
			'top:50%;left:10%;right:10%;' +
			'text-align:center;' +
			'margin:auto;' +
			'font-size:2em;' +
			'font-weight:bold;' +
			'padding:.5em;' +
			cssBg(60,40,0.7));
		htmlWait = 'Loading...';
	}
}

function showBtn(e, b) {
	e.style.display = b ? 'inline-block' : 'none';
}

function unHide(e) {
	e.style.visibility = 'visible';
}

function hide(e) {
	e.style.visibility = 'hidden';
}

function isHide(e) {
	return e.style.visibility == 'hidden';
}

function setBtns() {
	var n = !ssOn;
	showBtn(btnSlide, n);
	showBtn(btnStop, ssOn);
	showBtn(btnPlay, ssOn && ssPause);
	showBtn(btnPause, ssOn && !ssPause);
	showBtn(btnFirst, n);
	showBtn(btnLast, n);
	showBtn(btnIndex, n);
}

function getVid(n) {
	return dScroll.childNodes[n].childNodes[1].firstChild;
}

function getImg(n) {
	return dScroll.childNodes[n].firstChild.firstChild;
}

/*
** Video playback timer display
*/
function t2s(s) {
	var m = ~~(s / 60);
	s = ~~s % 60;
	return m + ':' + (s < 10 ? '0' : '') + s;
}

function vidTimer() {
	var vid = this, w = '0', s = '';
	if (vid == getVid(1) && vid.duration) {
		w = (vid.currentTime * 100 / vid.duration) + '%';
		s = t2s(vid.currentTime) + ' / ' + t2s(vid.duration);
	}
	dVmeter.lastChild.style.width = w;
	dVtime.innerHTML = s;
	unHide(dVbar);
}

function vidBuffer() {
	var vid = this;
	dVmeter.firstChild.style.width = (vid == getVid(1) && vid.duration && vid.buffered.end(0)) ?  (vid.buffered.end(0) * 100 / vid.duration) + '%' : '0';
}

function setControls() {
	var	vid = getVid(1),
		type = -1, 
		v = false,
		i, c;
	if (hasVideo && !isHide(vid.parentNode)) {
		if (vid.ended) {
			type = 2;
		} else if (vid.paused) {
			type = vid.currentTime == 0 ? 1 : 0;
		}
		v  = vid.duration;
	} else if (ssOn && ssPause) {
		type = 0;
	}
	v ? unHide(dVbar) : hide(dVbar);
	type >= 0 ? unHide(dControl) : hide(dControl);
	for (i = 0; i < 3; i++) {
		c = dControl.childNodes[i];
		type == i ? unHide(c) : hide(c);
	}
}

function imgComplete(img) {
	return img.complete || img.readyState == 'complete';
}

function imgCallback() {
	var imgbox = this.parentNode;
	if (imgComplete(this) && !isHide(imgbox)) {
		hide(imgbox.parentNode.lastChild);
		imgResize(this);
		if (this == getImg(1) && ipic < npics - 1) {
			setPic(2, ipic + 1);
		}
	}
}

function addListener(e, n, fn) {
	e.addEventListener ?  e.addEventListener(n, fn, false) : e.attachEvent('on' + n, fn);
}

function vidStop(vid) {
	if (hasVideo && !isHide(vid.parentNode)) {
		vid.pause();
		vid.removeAttribute('src');
	}
}

function clearBox(box) {
	var imgbox = box.firstChild,
		vidbox = imgbox.nextSibling;
	hide(imgbox);
	hide(vidbox);
	vidStop(vidbox.firstChild);
}

function imgResize(img) {
	if (bgZoom && imgComplete(img)) {
		var pp = img.parentNode.parentNode,
			bw = pp.clientWidth, bh = pp.clientHeight,
			iw = img.width, ih = img.height;
		if (iw && ih && bw && bh) {
			img.parentNode.style.zoom = (Math.min(bw * 100 / iw, bh * 100 / ih)) + '%';
		}
	}
}

function endsWith(s1, s2) {
	var i = s1.lastIndexOf(s2);
	return (i != -1) && (i + s2.length == s1.length);
}

function setPic(n, p) {
	var box = dScroll.childNodes[n],
		imgbox = box.firstChild,
		vidbox = imgbox.nextSibling,
		wait = box.lastChild,
		img, vid,
		g = pics[(p + npics) % npics],
		url = urlPath + g.photo;

	if (g.video) {
		vid = vidbox.firstChild;
		hide(imgbox);
		unHide(vidbox);
		url = urlPath + g.video;
		if (hasVideo && !endsWith(vid.src, url)) {
			vid.src = url;
			vid.poster = g.poster ? urlPath + g.poster : '';
			vidTimer.call(vid);
		} else {
			vidbox.style.backgroundImage = g.poster ? 'url(' + urlPath + g.poster + ')' : '';
		}
		hide(wait);
	} else {
		img = imgbox.firstChild;
		hide(vidbox);
		unHide(imgbox);
		if (!endsWith(img.src, url)) {
			img.src = url;
			imgbox.style.backgroundImage = 'url(' + url + ')';
		}
		imgComplete(img) ? hide(wait) : unHide(wait);
	}
}

function doClick(fn) {
	var vid = getVid(1);
	if (hasVideo && !isHide(vid.parentNode) && !vid.ended) {
		vid.paused ? vid.play() : vid.pause();
		setControls();
	} else {
		ssOn ? slidePlayPause() : fn();
	}
}

function setScrollX(x) {
	scrollX = x;
	if (sTransform) {
		dScroll.style[sTransform] = 'translate3d(' + x + 'px,0,0)';
	} else {
		dScroll.style.left = x + 'px';
	}
	return x;
}

function scroll2view() {
	setScrollX(-dMain.clientWidth);
	dNumber.innerHTML = (ipic+1) + '/' + npics;
	setControls();
}

function viewPic() {
	cssTrn(dScroll, 'all ' + (ssOn ? TIMER_SLIDESHOW_MS + 'ms ease': TIMER_MOVE_MS + 'ms linear'));
	scroll2view();
}

/*
** Photo navigation
*/
function gotoPic(n) {
	var dx = scrollX, dd, img;
	cssTrn(dScroll, '');
	if (n == 1 || (n == 2 && ipic < npics - 1)) {
		vidStop(getVid(1));
		dd = dScroll.firstChild;
		setScrollX(dx + dd.clientWidth);
		dScroll.appendChild(dd);
		ipic = n == 1 ? (ipic + 1) % npics : npics - 1;
		clearBox(dd);
	} else if (n == -1 || (n == -2 && ipic > 0)) {
		vidStop(getVid(1));
		dd = dScroll.lastChild;
		setScrollX(dx - dd.clientWidth);
		dScroll.insertBefore(dd, dScroll.firstChild);
		ipic = n == -1 ? (ipic - 1 + npics) % npics : 0;
		clearBox(dd);
	} else {
		setPic(1, ipic);
	}
	img = getImg(1);
	if (n == 1 && !isHide(img.parentNode) && imgComplete(img)) {
		setPic(2, ipic + 1);
	}
	setTimeout(viewPic, 50);
	if (!ssOn) {
		menuPeek();
	}
	if (n == 0) {
		dMain.focus();
	}
}

function picFirst(){gotoPic(-2);}
function picLast(){gotoPic(2);}
function picNext(){gotoPic(1);}
function picPrev(){gotoPic(-1);}

function addBtn(tip, flt, fn, gif) {
	var btn = ndiv('rgbtn');
	btn.style.cssText = 'float:' + flt + ';background-image:url(data:image/gif;base64,' + gif + ')';
	btn.title = tip;
	btn.onclick = fn;
	return dMenu.appendChild(btn);
}

/*
** Slide show functions
*/
function slideStop() {
	if (!ssOn) {
		return;
	}
	if (ssInt != 0) {
		clearInterval(ssInt);
		ssInt = 0;
	}
	ssOn = false;
	setBtns();
	setControls();
}

function slideShowFn() {
	var vid = getVid(1),
		isvid = (hasVideo && !isHide(vid.parentNode)),
		now;
	if (isvid && !vid.ended) {
		return;
	}
	if (ipic == ssLast) {
		slideStop();
	} else if (!ssPause) {
		now = new Date().getTime();
		if (now > ssNext) {
			vid = getVid(2);
			isvid = (hasVideo && !isHide(vid.parentNode));
			if (isvid || imgComplete(getImg(2))) {
				ssNext = now + SS_DELAY + (sTransition ? TIMER_SLIDESHOW_MS : 0);
				picNext();
				setPic(2, ipic + 1);
				if (isvid) {
					setTimeout(function(){ vid.play(); }, TIMER_SLIDESHOW_MS);
				}
			}
		}
	}
}

function goSlideShow() {
	var vid = getVid(1),
		isvid = (hasVideo && !isHide(vid.parentNode));
	if (ssOn) {
		slideStop();
		return;
	}
	ssOn = true;
	ssLast = (ipic - 1 + npics) % npics;
	ssInt = setInterval(slideShowFn, 200);
	ssNext = new Date().getTime() + SS_DELAY;
	ssPause = false;
	setPic(2, ipic + 1);
	setBtns();
	if (isvid) {
		vid.play();
	}
}

function slidePlayPause() {
	if (!ssOn) {
		return;
	}
	if (ssPause) {
		ssNext = new Date().getTime() + SS_DELAY;
	}
	ssPause = !ssPause;
	setBtns();
	setControls();
	menuPeek();
}

/*
** Full screen functions
*/
function isFullScr() {
	var doc = document;
	return doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
}

function goFull() {
	var doc = document;
	if (!isFullScr()) {
		if (dOuter.requestFullscreen) {
			dOuter.requestFullscreen();
		} else if (dOuter.webkitRequestFullscreen) {
			dOuter.webkitRequestFullscreen();
		} else if (dOuter.msRequestFullscreen) {
			dOuter.msRequestFullscreen();
		} else if (dOuter.mozRequestFullScreen) {
			dOuter.mozRequestFullScreen();
		}
	} else {
		if (doc.exitFullscreen) {
			doc.exitFullscreen();
		}
		else if (doc.webkitExitFullscreen) {
			doc.webkitExitFullscreen();
		}
		else if (doc.msExitFullscreen) {
			doc.msExitFullscreen();
		}
		else if (doc.mozCancelFullScreen) {
			doc.mozCancelFullScreen();
		}
	}
	dMain.focus();
}

function goBack() {
	window.history.back();
}

/*
** Photo Index
*/
function chooseIndex() {
	ipic = parseInt(this.id);
	setPic(1, ipic);
	scroll2view();
	hide(dIndex);
}

function goIndex() {
	if (dIndex) {
		unHide(dIndex);
		return;
	}
	var dv = ndiv(), i, img;
	for (i = 0; i < npics; i++) {
		img = new Image();
		img.src = urlPath + pics[i].thumb;
		img.id = i;
		img.onclick = chooseIndex;
		dv.appendChild(img);
	}
	dIndex = ndiv('rgidx');
	dIndex.onclick = function(){ hide(dIndex); };
	dMain.appendChild(dIndex).appendChild(dv);
}


/*
** Functions for handling hiding/showing of menu bar
*/
function menuOn() {
	dMenu.style.top = '0';
	unHide(btnPrev);
	unHide(btnNext);
}

function menuHide() {
	dMenu.style.top = '100%';
	hide(btnPrev);
	hide(btnNext);
	menuHideTimeout = 0;
}

function menuHideOff() {
	if (menuHideTimeout != 0) {
		clearTimeout(menuHideTimeout);
		menuHideTimeout = 0;
	}
}

function menuOff() {
	if (isMenuAlways) {
		return;
	}
	menuHideOff();
	menuHideTimeout = setTimeout(menuHide, 3500);
}

function menuPeek() {
	if (!inBottom) {
		menuOn();
		menuOff();
	}
}

function menuAlways(on) {
	isMenuAlways = on;
	if (on) {
		menuHideOff();
		menuOn();
	} else {
		menuOff();
	}
}

function mouseBottomEnter() {
	inBottom = true;
	menuHideOff();
	menuOn();
}

function mouseBottomLeave() {
	inBottom = false;
	menuOff();
}

/*
** Handle touch and mouse events
*/
function doTouch(phase, sx, dx) {
	var ww = dMain.clientWidth, xx;
	if (phase == 'move') {
		xx = setScrollX(dx + touchX);
		if (!touchNext && xx < -ww * 1.05) {
			setPic(2, ipic + 1);
			touchNext = true;
		} else if (!touchPrev && xx > -ww * 0.95) {
			setPic(0, ipic - 1);
			touchPrev = true;
		}
	} else if (phase == 'start') {
		touchX = scrollX;
		touchNext = touchPrev = false;
		cssTrn(dScroll, '');
		menuAlways(true);
	} else if (phase == 'end') {
		if (scrollX < -ww * 1.2) {
			picNext();
		} else if (scrollX > -ww * 0.8) {
			picPrev();
		} else {
			gotoPic(0);
		}
		menuAlways(false);
	} else if (phase == 'abort') {
		if (sx < ww * 0.2) {
			picPrev();
		} else if (sx > ww * 0.8) {
			picNext();
		} else {
			doClick(picNext);
		}
		menuAlways(false);
	}
}

function addTouch() {
	var	startX, distX,
		inMouse = false,
		inTouch = false;

	function doPrevent(e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	}

	function moveIt(e, x) {
		doPrevent(e);
		if (Math.abs(x - distX) > 2) {
			distX = x;
			doTouch('move', startX, x);
		}
	}

	function moveStart(e) {
		doPrevent(e);
		distX = 0;
		doTouch('start', startX,  0);
	}

	function moveEnd(e) {
		doPrevent(e);
		doTouch(Math.abs(distX) <= 0 ? 'abort' : 'end', startX, distX);
	}

	function touchStart(e) {
		if (!inTouch && !inMouse && e.changedTouches.length == 1) {
			inTouch = true;
			startX = e.changedTouches[0].pageX;
			moveStart(e);
		}
	}

	function touchMove(e) {
		if (inTouch) {
			moveIt(e, e.changedTouches[0].pageX - startX);
		}
	}

	function touchEnd(e) {
		if (inTouch) {
			inTouch = false;
			moveEnd(e);
		}
	}

	function mouseDown(e) {
		if (!inTouch && !inMouse && ((e.which || e.button) == 1)) {
			inMouse = true;
			startX = e.pageX || e.clientX;
			moveStart(e);
		}
	}

	function mouseMove(e) {
		if (inMouse) {
			moveIt(e, (e.pageX || e.clientX) - startX);
		}
	}

	function mouseUp(e) {
		if (inMouse) {
			inMouse = false;
			moveEnd(e);
		}
	}

	addListener(dScroll, 'touchstart', touchStart);
	addListener(dScroll, 'touchmove', touchMove);
	addListener(dScroll, 'touchend', touchEnd);
	addListener(dScroll, 'mousedown', mouseDown);
	addListener(dScroll, 'mousemove', mouseMove);
	addListener(dScroll, 'mouseup', mouseUp);
}

/*
** Handle key press
*/
function keyDown(e) {
	e = e || window.event;
	if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
		return;
	}
	switch (e.keyCode) {
	case 36:
		picFirst();
		break;
	case 37:
		picPrev();
		break;
	case 39:
		picNext();
		break;
	case 35:
		picLast();
		break;
	case 27:
		slideStop();
		break;
	case 32:
		doClick(picNext);
		break;
	}
}

function navBtn(p) {
	var btn = ndiv('rgbbtn');
	btn.style[p] = '1em';
	btn.appendChild(ndiv('rgarrow' + p));
	hide(btn);
	return dMain.appendChild(btn);
}

/*
** Create buttons and 
*/
function menuBtns() {
	var doc = document;
	btnIndex= addBtn('Index', 'left', goIndex, 'R0lGODlhDQANAIAAAP///wAA/yH5BAEKAAEALAAAAAANAA0AAAIchBMGqMqX2orToYuzzrbLV30UuJUmOVJe2KBKAQA7');
	btnStop = addBtn('Stop', 'left', goSlideShow, 'R0lGODlhCgAKAIAAAP///wAA/yH5BAEKAAEALAAAAAAKAAoAAAIIhI+py+0PYysAOw==');
	btnPlay = addBtn('Play', 'left', slidePlayPause, 'R0lGODlhCQAJAIAAAP///wAA/yH5BAEKAAEALAAAAAAJAAkAAAIPBIIZZrrcEIRvWmoTVdEVADs=');
	btnPause = addBtn('Pause', 'left', slidePlayPause, 'R0lGODlhCgAKAIAAAP///wAA/yH5BAEKAAEALAAAAAAKAAoAAAIRhBFxi8qWHnQvSlspw1svXgAAOw==');
	btnFirst = addBtn('First', 'left', picFirst, 'R0lGODlhDwALAIABAP///wAAACH5BAEKAAEALAAAAAAPAAsAAAIeBIJ4qcb+zAoyVnqxPJv3D26aEzbQeGZoxIztlAAFADs=');
	btnLast = addBtn('Last', 'left', picLast, 'R0lGODlhDwALAIABAP///wAAACH5BAEKAAEALAAAAAAPAAsAAAIdRI6GAa35mIsOTqvm1VL7X3EednAWuTSpujBtUwAAOw==');
	if (!window.navigator.standalone && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled || doc.msFullscreenEnabled || doc.mozFullScreenEnabled)) {
		addBtn('Full Screen', 'right', goFull, 'R0lGODlhDgAOAIABAP///wAAACH5BAEKAAEALAAAAAAOAA4AAAIghBGpx+rBzoNNLgMvovvFPjWTBnrRaFmZynGYeaJfeBQAOw==');
	}
	btnSlide = addBtn('Slide Show', 'right', goSlideShow, 'R0lGODlhDwAQAIABAP///wAAACH5BAEKAAEALAAAAAAPABAAAAIohI8JEcvfmJHwuVQlovneHDVbNzqVpyneAWLhqXGwyJK1CaFvnqpKAQA7');
	if (dOuter.className == 'ragallery') {
		addBtn('Go Back', 'right', goBack, 'R0lGODlhDAAOAIAAAP///////yH5BAEKAAEALAAAAAAMAA4AAAIYBBKme8mGopxUQvdubrVXvTWbR07giDEFADs=');
	}
	dMenu.appendChild(dNumber);
	btnPrev = navBtn('left');
	btnNext = navBtn('right');
	dVbar.appendChild(dVtime);
	dVbar.appendChild(dVmeter);
	dVmeter.appendChild(ndiv('rgvmtr1'));
	dVmeter.appendChild(ndiv('rgvmtr0'));
	hide(dMenu.appendChild(dVbar));
}

function winResize() {
	var i;
	for (i = 0; i < 3; i++) {
		imgResize(getImg(i));
	}
	cssTrn(dScroll, '');
	scroll2view();
}

function addBox() {
	var box = ndiv('rgbox'),
		imgbox = ndiv('rgimgbox'),
		vidbox = ndiv('rgimgbox'),
		wait = ndiv('rgwait'),
		img = new Image(),
		vid = nEl('video', 'rgvideo');

	dScroll.appendChild(box);
	hide(box.appendChild(imgbox));
	hide(box.appendChild(vidbox));
	hide(box.appendChild(wait));
	hide(imgbox.appendChild(img));
	vidbox.appendChild(vid);
	wait.innerHTML = htmlWait;
	if (bgZoom) {
		img.style.maxWidth = '100%';
	}
	img.onload = img.onerror = imgCallback;
	if (vid.play) {
		hasVideo = true;
		vid.preload = 'none';
		vid.onplay = vid.onpause = vid.onreadystatechange = setControls;
		addListener(vid, 'timeupdate', vidTimer);
		addListener(vid, 'progress', vidBuffer);
	}
}

function main() {
	var d0 = ndiv('rgbottom');
	urlPath = urlPath || '';
	initCss();
	addBox(); addBox(); addBox();
	dMain.tabIndex = "1";
	dMain.onkeydown = keyDown;
	dMain.appendChild(dScroll);
	dMain.appendChild(d0).appendChild(dMenu);
	menuBtns();
	dControl.innerHTML = '<div><div class="rgpause" style="left:32%"></div><div class="rgpause" style="right:32%"></div></div><div class="rgplay"></div><div class="rgstop"></div>';
	hide(dMain.appendChild(dControl));
	setBtns();
	addListener(window, 'resize', winResize);
	addListener(window, 'orientationchange', winResize);
	d0.onmouseenter = mouseBottomEnter;
	d0.onmouseleave = mouseBottomLeave;
	cssTrn(dMenu, 'all 250ms linear');
	addTouch();
	dOuter.appendChild(dMain);
	setPic(1, ipic);
	scroll2view();
	dMain.focus();
}

this.setGallery = function(p, path) {
	urlPath = path || '';
	pics = p;
	npics = p.length;
	ipic = 0;
	if (dIndex) {
		dMain.removeChild(dIndex);
	}
	dIndex = null;
	gotoPic(0);
	setBtns();
	winResize();
};

this.stopGallery = function() {
	slideStop();
	vidStop(getVid(1));
	if (isFullScr()) {
		goFull();
	}
};

main();
}
