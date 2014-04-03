/*
** ringGallery: javascript function for displying photos
** http://github.com/spcau/ringGallery
*/
function ringGallery(dOuter, pics, urlPath) {
var	dMain = ndiv('rgmain'),
	dScroll = ndiv('rgscroll'),
	dMenu = ndiv('rgmenu'),
	dControl = ndiv('rgctrl'),
	dProgress = ndiv('rgprogress'),
	dNumber = ndiv(),
	dIndex = null,
	btnSlide, btnStop, btnFirst, btnPrev, btnNext, btnLast, btnIndex, btnPlay, btnPause,
	npics = pics.length,
	ipic = 0,
	slideShow = false,
	sTransition, sTransform,
	hasVideo = false,
	bgZoom,
	ssLastPic = 0, ssInterval = 0, ssNextTime = 0, ssPause = false,
	SS_DELAY = 3000, TIMER_MOVE_MS = 150, TIMER_SLIDESHOW_MS = 900,
	scrollX = 0, touchX = 0,
	htmlWait;

function initCss() {
	var MBAR = '1.8em',
		el = nEl('style'),
		css = el.style, i, s,
		absinline = 'position:absolute;display:inline-block;',
		prefix = ['webkit','Moz','O','ms'];

	function prop(n1, n2) {
		var i, s;
		for (i = -1 ; i < 4; i++) {
			s = (i < 0) ? n1 : prefix[i] + n2;
			if (s in css) {
				return s;
			}
		}
		return null;
	}

	function add(a,b) {
		try {
			(css.insertRule) ? css.insertRule(a+ '{' + b + '}',0) : css.addRule(a,b);
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
		'background:#000000;' +
		'color:#ffffff;' +
		'width:100%;height:100%;' +
		cssfx('user-select:none;'));

	add('.rgmenu',
		absinline +
		'overflow:hidden;' +
		'text-align:center;' +
		'vertical-align:middle;' +
		cssBgGrd(48,1,16,1) +
		'line-height:' + MBAR + ';' +
		'width:100%;bottom:0;height:' + MBAR);

	add('.rgscroll',
		absinline +
		'width:400%;top:0;bottom:' + MBAR);

	add('.rgbox',
		'position:relative;' +
		'display:inline-block;' +
		'width:25%;height:100%;' +
		'overflow:hidden;' +
		'cursor:pointer');

	add('.rgimgbox',
		absinline +
		'background-repeat:no-repeat;' +
		'background-position:center center;' +
		'background-size:contain;' +
		'height:100%;width:100%');

	add('.rgvideo',
		absinline +
		'width:100% !important;height:100% !important');

	add('.rgvbar',
		absinline +
		'background-color:rgba(48,48,48,0.3);' +
		'width:100%;height:6px;bottom:0');

	add('.rgvbar0',
		absinline +
		cssBgGrd(255,0.8,220,0.8) +
		'border:1px outset #c0c0c0;' +
		'left:0;height:5px');

	add('.rgvbar1',
		absinline +
		'background:rgba(255,255,255,0.2);' +
		'left:0;height:5px');

	add('.rgvtime',
		absinline +
		'padding:2px 4px;' +
		'margin-bottom:6px;' +
		cssBgGrd(32,0.7,32,0.7) +
		'font-size:0.9em;' +
		'bottom:0;height:1em');

	add('.rgprogress',
		'display:inline-block;' +
		'float:left;' +
		'background:#303030;' +
		'border:1px inset #505050;' +
		'margin:0.5em;' +
		'width:8em');

	add('.rgprogress>div',
		cssBgGrd(240,1,160,1) +
		'border:1px outset #c0c0c0;' +
		'height:0.4em');


	add('.rgbtn',
		'display:inline-block;' +
		'cursor:pointer;' +
		'width:2em;height:100%;' +
		'border:1px outset #505050;' +
		'background-repeat:no-repeat;' +
		'background-position:center center');

	add('.rgbtn:hover', 'background-color:#404040');
	add('.rgbtn:active', 'background-color:#101010');
	add('.rglt', 'float:left');
	add('.rgrt', 'float:right');

	add('.rgctrl',
		absinline +
		'pointer-events:none;' +
		'top:50%;left:50%;width:10em;height:10em;' +
		cssBgGrd(130,0.9,99,0.9) +
		'box-shadow:8px 8px 16px 0 #202020;' +
		'margin:-5em 0 0 -5em;' +
		cssfx('border-radius:2em;'));

	s = absinline + 'background:#ffffff;';
	add('.rgpause0', s + 'top:25%;left:32%;width:13%;bottom:25%');
	add('.rgpause1', s + 'top:25%;right:32%;width:13%;bottom:25%');
	add('.rgstop', s + 'top:30%;left:30%;right:30%;bottom:30%');
	add('.rgplay', absinline +
		'width:0;height:0;top:20%;left:32%;' +
		'border-top:3em solid transparent;' +
		'border-bottom:3em solid transparent;' +
		'border-left:4.8em solid #ffffff');

	add('.rgidx',
		absinline +
		'width:100%;height:100%;z-index:10;' +
		'background:#000000;' +
		'background:rgba(0,0,0,0.7)');

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

	add('.rgidx>div>img:hover',
		'opacity:0.5');

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
			'background:#ffffff;' +
			cssfx('animation:waitfade 1s linear infinite;') +
			cssfx('border-radius:4em;'));

		s = 'from {opacity:1;} to {opacity:0.1;}';
		add('@keyframes waitfade', s);
		add('@-webkit-keyframes waitfade', s);
		htmlWait = '';
		for (i = 0; i < 10; i++) {
			var deg = (360/10) * i, delay = (i-10)/10;
			add('div.rgwait div.b' + i,
				cssfx('transform:' + 'rotate(' + deg + 'deg) translate(0, -110%);') +
				cssfx('animation-delay:' + delay + 's;'));
			htmlWait += '<div class="b' + i + '"></div>';
		}
	} else {
		add('.rgwait',
			absinline +
			'top:50%;left:10%;right:10%;' +
			'text-align:center;' +
			'margin:auto;' +
			'font:bold 3em;' +
			'padding:0.2em 0.5em;' +
			cssBgGrd(60,0.7,40,0.7));
		htmlWait = 'Loading...';
	}
}

function c2h(c,a) {
	var h = (a*255)<<24|c<<16|c<<8|c;
	return (h < 0 ? 0xFFFFFFFF + h + 1 : h).toString(16);
}

function cssBgGrd(c0,a0,c1,a1) {
	var h0 = c2h(c0,a0),
		h1 = c2h(c1,a1);
	return 'background:none;' + cssfx2('background:','linear-gradient(top,rgba('+c0+','+c0+','+c0+','+a0+'),rgba('+c1+','+c1+','+c1+','+a1+'));') +
		"filter:progid:DXImageTransform.Microsoft.gradient(startColorStr='#" + h0 + "',endColorStr='#" + h1 + "');";
}

function nEl(n, c) {
	var d = document.createElement(n);
	d.className = c || '';
	return d;
}

function ndiv(c) {
	return nEl('div', c);
}

function cssfx(s) {
	return s + '-webkit-' + s + '-moz-' + s + '-ms-' + s;
}

function cssfx2(p, s) {
	return p + s + p + '-webkit-' + s + p + '-moz-' + s + p + '-ms-' + s;
}

function addBox() {
	var box = ndiv('rgbox'),
		imgbox = ndiv('rgimgbox'),
		vidbox = ndiv('rgimgbox'),
		wait = ndiv('rgwait'),
		img = new Image(),
		vid = nEl('video', 'rgvideo'),
		vbar = ndiv('rgvbar'),
		vtime = ndiv('rgvtime'),
		ctl = ndiv('rgvctl');

	hide(imgbox);
	hide(vidbox);
	hide(wait);
	hide(img);
	vbar.appendChild(ndiv('rgvbar1'));
	vbar.appendChild(ndiv('rgvbar0'));
	imgbox.appendChild(img);
	vidbox.appendChild(vid);
	vidbox.appendChild(vbar);
	vidbox.appendChild(vtime);
	wait.innerHTML = htmlWait;
	box.appendChild(imgbox);
	box.appendChild(vidbox);
	box.appendChild(wait);
	dScroll.appendChild(box);
	img.style.maxWidth = '100%';
	img.onload = img.onerror = imgCallback;
	if (vid.play) {
		hasVideo = true;
		vid.preload = 'none';
		vid.controls = false;
		vid.onplay = vid.onpause = setControls;
		vid.onreadystatechange = setControls;
		addListener(vid, 'timeupdate', vidTimer);
		addListener(vid, 'progress', vidBuffer);
	}
}

function clearBox(box) {
	var imgbox = box.firstChild,
		vidbox = imgbox.nextSibling;
	hide(imgbox);
	hide(vidbox);
	vidStop(vidbox.firstChild);
}

function getVid(n) {
	return dScroll.childNodes[n].childNodes[1].firstChild;
}

function getImg(n) {
	return dScroll.childNodes[n].firstChild.firstChild;
}

function imgResize(img) {
	if (bgZoom && imgComplete(img)) {
		var pp = img.parentNode.parentNode,
			bw = pp.clientWidth,
			bh = pp.clientHeight,
			iw = img.width,
			ih = img.height;
		if (iw && ih && bw && bh) {
			img.parentNode.style.zoom = (Math.min(bw * 100 / iw, bh * 100 / ih))|0 + '%';
		}
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

function hideWait(e) {
	var d = e.parentNode;
	if (!isHide(d)) {
		hide(d.parentNode.lastChild);
		return true;
	}
	return false;
}

function imgCallback() {
	if (imgComplete(this) && hideWait(this)) {
		imgResize(this);
		if (this == getImg(1) && ipic < npics - 1) {
			setPic(2, ipic + 1);
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
		url;

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
		url = urlPath + g.photo;
		if (!endsWith(img.src, url)) {
			img.src = url;
			imgbox.style.backgroundImage = 'url(' + url + ')';
		}
		imgComplete(img) ? hide(wait) : unHide(wait);
	}
}

function vidStop(vid) {
	if (hasVideo && !isHide(vid.parentNode)) {
		vid.pause();
		vid.removeAttribute('src');
	}
}

function doClick() {
	var vid = getVid(1),
		isvid = (hasVideo && !isHide(vid.parentNode));
	if (!isvid || vid.ended) {
		slideShow ? slidePlayPause() : picNext();
	} else {
		vid.paused ? vid.play() : vid.pause();
		setControls();
	}
}

function t2s(s) {
	var m = (s / 60) | 0;
	s = (s | 0) % 60;
	return m + ':' + (s < 10 ? '0' : '') + s;
}

function vidTimer() {
	if (this != getVid(1)) {
		return;
	}
	var vid = this,
		vbar = vid.nextSibling,
		vtime = vbar.nextSibling,
		w = '0', s = '';
	if (!isNaN(vid.duration)) {
		w = (vid.currentTime * 100 / vid.duration) + '%';
		s = t2s(vid.currentTime) + '&thinsp;/&thinsp;' + t2s(vid.duration);
	}
	vbar.lastChild.style.width = w;
	vtime.innerHTML = s;
}

function vidBuffer() {
	if (this != getVid(1)) {
		return;
	}
	var vid = this,
		vbar = vid.nextSibling
		w = '0'
	if (!isNaN(vid.duration) && vid.buffered.end(0)) {
		w = (vid.buffered.end(0) * 100 / vid.duration) + '%';
	}
	vbar.firstChild.style.width = w;
}

function setControls() {
	var	vid = getVid(1),
		type = -1, i, c;

	if (hasVideo && !isHide(vid.parentNode)) {
		if (vid.ended) {
			type = 2;
		} else if (vid.paused) {
			type = vid.currentTime == 0 ? 1 : 0;
		}
	} else if (slideShow && ssPause) {
		type = 0;
	}
	type >= 0 ? unHide(dControl) : hide(dControl);
	for (i = 0; i < 3; i++) {
		c = dControl.childNodes[i];
		type == i ? unHide(c) : hide(c);
	}
}

function scroll2view() {
	setScrollX(-dMain.clientWidth);
	dNumber.innerHTML = (ipic+1) + '/' + npics;
	setControls();
}

function viewPic() {
	cssTrn(dScroll, 'all ' + (slideShow ? TIMER_SLIDESHOW_MS + 'ms ease': TIMER_MOVE_MS + 'ms linear'));
	scroll2view();
}

function gotoPic(n) {
	var dx = scrollX, dd, img;
	cssTrn(dScroll, '');
	if (n == 1 || (n == 2 && ipic < npics - 1)) {
		vidStop(getVid(1));
		dd = dScroll.firstChild;
		dScroll.appendChild(dd);
		setScrollX(dx + dd.clientWidth);
		ipic = n == 1 ? (ipic + 1) % npics : npics - 1;
		clearBox(dd);
	} else if (n == -1 || (n == -2 && ipic > 0)) {
		vidStop(getVid(1));
		dd = dScroll.lastChild;
		dScroll.insertBefore(dd, dScroll.firstChild);
		setScrollX(dx - dd.clientWidth);
		ipic = n == -1 ? (ipic - 1 + npics) % npics : 0;
		clearBox(dd);
	}
	setPic(1, ipic);
	img = getImg(1);
	if (n == 1 && !isHide(img.parentNode) && imgComplete(img)) {
		setPic(2, ipic + 1);
	}
	setTimeout(viewPic, 50);
	if (slideShow) {
		dProgress.firstChild.style.width = (((npics - ssLastPic) + ipic) % (npics + 1) * 100 / npics) + '%';
	}
	if (n == 0) {
		dMain.focus();
	}
}

function picFirst(){gotoPic(-2);}
function picLast(){gotoPic(2);}
function picNext(){gotoPic(1);}
function picPrev(){gotoPic(-1);}

function cssTrn(e, s) {
	if (sTransition) {
		e.style[sTransition] = s;
	}
}

function setScrollX(x) {
	scrollX = x;
	sTransform ? dScroll.style[sTransform] = 'translate3d(' + x + 'px,0,0)' : dScroll.style.left = x + 'px';
	return x;
}

function addListener(e, n, fn) {
	e.addEventListener ?  e.addEventListener(n, fn, false) : e.attachEvent('on' + n, fn);
}

function addBtn(tip, fl, fn, gif) {
	var btn = ndiv('rgbtn ' + fl);
	btn.style.backgroundImage = 'url(data:image/gif;base64,' + gif + ')';
	btn.title = tip;
	btn.onclick = fn;
	return dMenu.appendChild(btn);
}

function imgComplete(img) {
	return img.complete || img.readyState == 'complete';
}

function slideShowFn() {
	var vid = getVid(1),
		isvid = (hasVideo && !isHide(vid.parentNode));
	if (isvid && !vid.ended) {
		return;
	}
	if (ipic == ssLastPic) {
		stopSlide();
	} else if (!ssPause) {
		var now = new Date().getTime();
		if (now > ssNextTime) {
			vid = getVid(2);
			isvid = (hasVideo && !isHide(vid.parentNode));
			if (isvid || imgComplete(getImg(2))) {
				ssNextTime = now + SS_DELAY + (sTransition ? TIMER_SLIDESHOW_MS : 0);
				picNext();
				setPic(2, ipic + 1);
				if (isvid) {
					setTimeout(function(){ vid.play(); }, TIMER_SLIDESHOW_MS);
				}
			}
		}
	}
}

function stopSlide() {
	if (!slideShow) {
		return;
	}
	if (ssInterval != 0) {
		clearInterval(ssInterval);
		ssInterval = 0;
	}
	slideShow = false;
	showBtn(dProgress, false);
	setBtns();
	setControls();
}

function setBtns() {
	var n = !slideShow;
	showBtn(btnSlide, n);
	showBtn(btnStop, slideShow);
	showBtn(btnPlay, slideShow && ssPause);
	showBtn(btnPause, slideShow && !ssPause);
	showBtn(btnFirst, n);
	showBtn(btnPrev, n);
	showBtn(btnNext, n);
	showBtn(btnLast, n);
	showBtn(btnIndex, n);
}

function goSlideShow() {
	var vid = getVid(1),
		isvid = (hasVideo && !isHide(vid.parentNode));
	if (slideShow) {
		stopSlide();
		return;
	}
	slideShow = true;
	ssLastPic = (ipic - 1 + npics) % npics;
	ssInterval = setInterval(slideShowFn, 200);
	ssNextTime = new Date().getTime() + SS_DELAY;
	ssPause = false;
	setPic(2, ipic + 1);
	setBtns();
	dProgress.firstChild.style.width = '0';
	showBtn(dProgress, true);
	if (isvid) {
		vid.play();
	}
}

function slidePlayPause() {
	if (slideShow) {
		if (ssPause) {
			ssNextTime = new Date().getTime() + SS_DELAY;
		}
		ssPause = !ssPause;
		setBtns();
		setControls();
	}
}

this.stopGallery = function() {
	stopSlide();
	vidStop(getVid(1));
	if (isFullScr()) {
		goFull();
	}
};

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
		} else if (doc.webkitExitFullscreen) {
			doc.webkitExitFullscreen();
		} else if (doc.msExitFullscreen) {
			doc.msExitFullscreen();
		} else if (doc.mozCancelFullScreen) {
			doc.mozCancelFullScreen();
		}
	}
	dMain.focus();
}

function chooseIndex(e) {
	setPic(1, ipic = parseInt(this.id));
	scroll2view();
	hide(dIndex);
}

function goIndex() {
	if (dIndex == null) {
		var dv = ndiv();
		for (var i = 0; i < npics; i++) {
			var img= new Image();
			img.src = urlPath + pics[i].thumb;
			img.id = i;
			img.onclick = chooseIndex;
			dv.appendChild(img);
		}
		dIndex = ndiv('rgidx');
		dIndex.onclick = function(){ hide(dIndex); };
		dMain.appendChild(dIndex).appendChild(dv);
	}
	unHide(dIndex);
}

function doTouch(phase, dx) {
	var ww = dMain.clientWidth, xx;
	if (phase == 'move') {
		xx = setScrollX(dx + touchX);
		if (xx < -ww * 1.05) {
			setPic(2, ipic + 1);
		} else if (xx > -ww * 0.95) {
			setPic(0, ipic - 1);
		}
	} else if (phase == 'start') {
		touchX = scrollX || 0
		cssTrn(dScroll, '')
	} else if (phase == 'end') {
		if (scrollX < -ww * 1.2) {
			picNext();
		} else if (scrollX > -ww * 0.8) {
			picPrev();
		} else {
			gotoPic(0);
		}
	} else if (phase == 'abort') {
		doClick();
	}
}

function isFullScr() {
	var doc = document;
	return (doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
}

function winResize() {
	for (var i = 0; i < 3; i++) {
		imgResize(getImg(i));
	}
	cssTrn(dScroll, '');
	scroll2view();
}

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
		if (slideShow) {
			stopSlide();
		}
		break;
	case 32:
		doClick();
		break;
	}
}

function addTouch() {
	var	startX, distX,
		inMouse = false,
		inTouch = false;

	function doPrevent(e) {
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
	}

	function moveIt(e, x) {
		doPrevent(e);
		if (Math.abs(x - distX) > 2) {
			doTouch('move', distX = x);
		}
	}

	function moveStart(e) {
		doPrevent(e);
		doTouch('start', distX = 0);
	}

	function moveEnd(e) {
		doPrevent(e);
		doTouch(Math.abs(distX) <= 0 ? 'abort' : 'end', distX);
	}

	addListener(dScroll, 'touchstart', function(e) {
		if (!inTouch && !inMouse && e.changedTouches.length == 1) {
			inTouch = true;
			startX = e.changedTouches[0].pageX;
			moveStart(e);
		}
	});
	addListener(dScroll, 'touchmove', function(e) {
		if (inTouch) {
			moveIt(e, e.changedTouches[0].pageX - startX);
		}
	});
	addListener(dScroll, 'touchend', function(e) {
		if (inTouch) {
			inTouch = false;
			moveEnd(e);
		}
	});
	addListener(dScroll, 'mousedown', function(e) {
		if (!inTouch && !inMouse && ((e.which || e.button) == 1)) {
			inMouse = true;
			startX = e.pageX || e.clientX;
			moveStart(e);
		}
	});
	addListener(dScroll, 'mousemove', function(e) {
		if (inMouse) {
			moveIt(e, (e.pageX || e.clientX) - startX);
		}
	});
	addListener(dScroll, 'mouseup', function(e) {
		if (inMouse) {
			inMouse = false;
			moveEnd(e);
		}
	});
}

this.setGallery = function(p, path) {
	urlPath = path || '';
	pics = p;
	npics = p.length;
	ipic = 0;
	if (dIndex) {
		dMain.removeChild(dIndex);
		dIndex = null;
	}
	gotoPic(0);
	setBtns();
	winResize();
};

function menuBtns() {
	var doc = document;
	btnStop = addBtn('Stop', 'rglt', goSlideShow, 'R0lGODlhCgAKAIAAAP///wAA/yH5BAEKAAEALAAAAAAKAAoAAAIIhI+py+0PYysAOw==');
	btnPlay = addBtn('Play', 'rglt', slidePlayPause, 'R0lGODlhCQAJAIAAAP///wAA/yH5BAEKAAEALAAAAAAJAAkAAAIPBIIZZrrcEIRvWmoTVdEVADs=');
	btnPause = addBtn('Pause', 'rglt', slidePlayPause, 'R0lGODlhCgAKAIAAAP///wAA/yH5BAEKAAEALAAAAAAKAAoAAAIRhBFxi8qWHnQvSlspw1svXgAAOw==');
	btnFirst = addBtn('First', 'rglt', picFirst, 'R0lGODlhDwALAIABAP///wAAACH5BAEKAAEALAAAAAAPAAsAAAIeBIJ4qcb+zAoyVnqxPJv3D26aEzbQeGZoxIztlAAFADs=');
	btnPrev = addBtn('Previous', 'rglt', picPrev, 'R0lGODlhDgALAIABAP///wAAACH5BAEKAAEALAAAAAAOAAsAAAIdjA+HGpDqYESzuWfjvXn7r3ldtVFVJmHGaTGNCxQAOw==');
	btnNext = addBtn('Next', 'rglt', picNext, 'R0lGODlhDgALAIABAP///wAAACH5BAEKAAEALAAAAAAOAAsAAAIdRI6GB5rO2mqQOvuwlbt7vgVYJJFTGS0iJKqtWgAAOw==');
	btnLast = addBtn('Last', 'rglt', picLast, 'R0lGODlhDwALAIABAP///wAAACH5BAEKAAEALAAAAAAPAAsAAAIdRI6GAa35mIsOTqvm1VL7X3EednAWuTSpujBtUwAAOw==');
	if (doc.fullscreenEnabled || doc.webkitFullscreenEnabled || doc.msFullscreenEnabled || doc.mozFullScreenEnabled) {
		addBtn('Full Screen', 'rgrt', goFull, 'R0lGODlhDgAOAIABAP///wAAACH5BAEKAAEALAAAAAAOAA4AAAIghBGpx+rBzoNNLgMvovvFPjWTBnrRaFmZynGYeaJfeBQAOw==');
	}
	btnIndex = addBtn('Index', 'rgrt', goIndex, 'R0lGODlhDQANAIAAAP///wAA/yH5BAEKAAEALAAAAAANAA0AAAIchBMGqMqX2orToYuzzrbLV30UuJUmOVJe2KBKAQA7');
	btnSlide = addBtn('Slide Show', 'rgrt', goSlideShow, 'R0lGODlhDwAPAIAAAP///wAA/yH5BAEKAAEALAAAAAAPAA8AAAIrjAOpC4cOG2LsWWgapS/ho02ZBHaS4oTetHYiu6onmsEj6VrtXX8XvHEUAAA7');
	dProgress.appendChild(ndiv());
	showBtn(dProgress, false);
	dMenu.appendChild(dNumber);
	dMenu.appendChild(dProgress);
}

function main() {
	urlPath = urlPath || '';
	initCss();
	addBox(); addBox(); addBox();
	dMain.tabIndex = "1"
	dMain.onkeydown = keyDown;
	dMain.appendChild(dScroll);
	dMain.appendChild(dMenu);
	dControl.innerHTML = '<div><div class="rgpause0"></div><div class="rgpause1"></div></div><div class="rgplay"></div><div class="rgstop"></div>'
	hide(dControl);
	dMain.appendChild(dControl);
	menuBtns();
	setBtns();
	addListener(window, 'resize', winResize);
	addListener(window, 'orientationchange', winResize);
	addTouch();
	dOuter.appendChild(dMain);
	setPic(1, ipic);
	scroll2view();
	dMain.focus();
}
main();
}
