/*
** ringAlbum: Photo album using ringGallery
** http://github.com/spcau/ringGallery
*/
function ringAlbum(dOuter, albumJson) {
var	dMain = ndiv('ramain'),
	dGallery = ndiv('ragallery'),
	aMenus = [],
	TRANSITION_MS = 500,
	oGallery = null,
	hashGallery,
	reUrl = new RegExp('^(([a-z]+:)?//|/)', 'i');

function initCss() {
	var	el = nEl('style'),
		css;

	el.type = 'text/css';
	document.getElementsByTagName('head')[0].appendChild(el);
	css = el.sheet || el.styleSheet;

	function add(a,b) {
		try {
			if (css.insertRule) {
				css.insertRule(a+'{'+b+'}',0);
			} else {
				css.addRule(a,b);
			}
		} catch (err) { }
	}

	add('.ramain',
		'position:absolute;' +
		'left:0;top:0;' +
		'background:#000000;' +
		'width:100%;height:100%;' +
		cssfx('user-select:none;'));

	add('.ramenu',
		'position:absolute;' +
		cssfx('box-sizing:border-box;') +
		'overflow-y:auto;' +
		'padding:0.5em;' +
		cssfx('transition:all ' + TRANSITION_MS + 'ms ease-in-out;') +
		'left:0;top:0;width:100%;height:100%');

	add('.ragallery',
		'position:absolute;' +
		cssfx('transition:all 500ms ease-in-out;') +
		'left:0;top:100%;' +
		'width:100%;height:100%;');

	add('.rachoice',
		cssfx('box-sizing:border-box;') +
		'color:#ffffff;' +
		'background:#404040;' +
		cssfx2('background:','linear-gradient(top,#404040,#202020);') +
		"filter: progid:DXImageTransform.Microsoft.gradient(startColorStr='#404040',endColorstr='#202020',GradientType=0 );" +
		'margin:0.3em 0;' +
		'padding:0.3em;' +
		'left:0;top:0;' +
		'width:100%;' +
		'min-height:3.5em;' +
		'cursor:pointer;'+
		'overflow:auto;' +
		'border:1px outset #606060');

	add('.rachoice:hover',
		'border-color:#ffffff;' +
		'opacity:0.7');

	add('.ratitle',
		'vertical-align:top;'+
		'text-shadow:2px 2px #000;'+
		'font-weight:bold;font-size:1.4em;');

	add('.ranumber',
		'vertical-align:top;'+
		'padding-left:0.5em;' +
		'font-weight:100;font-size:0.8em;');

	add('.rathumb',
		'height:40px;max-width:80px;' +
		'float:left;' +
		'margin:3px;padding:2px;' +
		'background:#e0e0e0');
}

function nEl(n, cl) {
	var e = document.createElement(n);
	if (cl !== undefined) {
		e.className = cl;
	}
	return e;
}

function ndiv(cl) {
	return nEl('div', cl);
}

function nText(cl, s) {
	var e = nEl('span', cl);
	e.innerHTML = s;
	return e;
}

function cssfx2(p, s) {
	return p+s + p+'-webkit-' + s + p+'-moz-' + s + p+'-ms-'+s;
}

function cssfx(s) {
	return cssfx2('', s);
}

function albumUrl(s) {
	var p = '', e, i;
	if (s === undefined) {
		s = "album.json";
	} else if (s.toLowerCase().lastIndexOf('.json') != s.length - 5) {
		s = s + "/album.json";
	}
	e = nEl('a');
	e.href = s;
	s = e.href;
	i = s.lastIndexOf('/');
	if (i > 0) {
		p = s.substring(0, i + 1);
		s = s.substring(i + 1);
	}
	return { path:p, name:s };
}

function endGallery() {
	aMenus[0].style.top = '0';
	dGallery.style.top = '110%';
	hashGallery = undefined;
}

function goMenuback() {
	if (aMenus.length <= 0) {
		return;
	}
	var m1 = aMenus[0],
		m2 = aMenus[1];
	aMenus.splice(0, 1);
	setTimeout(function() {
			m1.style.left = '110%';
			m2.style.left = '0';
		}, 50);
	setTimeout(function() {
			dMain.removeChild(m1);
		}, TRANSITION_MS + 100);
}

function hashID() {
	return '#' + Math.floor((Math.random() * 10000) + 1000);
}

function addChoice(pn, c, dv) {
	if (dv === undefined) {
		dv = ndiv('rachoice');
		dv.id = hashID();
		aMenus[0].appendChild(dv);
	}
	var ca = c.albums,
		cg = c.gallery,
		len
	dv.appendChild(nText('ratitle', c.title));
	if (ca && ca.length > 0) {
		len = ca.length;
		dv.appendChild(nEl('br'));
		dv.appendChild(nText('ranumber', len + ' Album' + (len>1?'s':'')));
	}
	if (c.goback) {
		dv.id = aMenus[0].id;
		dv.onclick = function() {
				goMenuback();
				window.history.back();
			}
	} else if (cg && cg.length > 0) {
		dv.appendChild(nEl('br'));
		len = cg.length;
		var nphoto = 0, nvideo = 0,
			n = Math.max(1, Math.floor(len / 5)),
			i, j;
		for (i = n, j = 0; j < 4 && i < len; i += n, j++) {
			img = new Image();
			img.src = pn.path + cg[i].thumb;
			img.className = 'rathumb';
			dv.appendChild(img);
		}
		for (i = 0; i < len; i++) {
			if (cg[i].photo) {
				nphoto++;
			} else if (cg[i].video) {
				nvideo++;
			}
		}
		if (nphoto > 0) {
			dv.appendChild(nText('ranumber', nphoto + '&nbsp;Photo' + (nphoto>1 ?'s.':'.')));
		}
		if (nvideo > 0) {
			dv.appendChild(nText('ranumber', nvideo + '&nbsp;Video' + (nvideo>1 ?'s.':'.')));
		}
		dv.onclick = function() {
				aMenus[0].style.top = '-110%';
				dGallery.style.top = '0';
				if (oGallery) {
					oGallery.setGallery(cg, pn.path);
				} else {
					oGallery = new ringGallery(dGallery, cg, pn.path);
				}
				hashGallery = dv.id;
				window.location.hash = hashGallery;
			}
	} else {
		dv.onclick = function() {
				setupMenu(pn, c, dv.id);
				window.location.hash = dv.id;
			}
	}
}

function readChoice(pn) {
	var url = pn.path + pn.name,
		h = new XMLHttpRequest(),
		dv = ndiv('rachoice'),
		data;
	dv.id = hashID();
	aMenus[0].appendChild(dv);
	h.onreadystatechange = function() {
		if (h.readyState == 4 && h.status == 200) {
			try {
				data = JSON.parse(h.responseText)
			} catch (err) {
				console.log(url + " -> " + err.message);
			}
			addChoice(pn, data, dv);
		}
	};
	h.open('GET', url);
	h.send();
}

function setupMenu(pn, data, id) {
	var s, m0 = ndiv('ramenu');
	aMenus.splice(0, 0, m0);
	m0.id = id || hashID();
	if (aMenus.length > 1) {
		addChoice(undefined, { title:'&#8592; Go Back', goback:true });
	}
	for (var i = 0, len = data.albums.length; i < len; i++) {
		s = data.albums[i];
		readChoice(albumUrl(reUrl.test(s) ? s : pn.path + s));
	}
	if (data.gallery && data.gallery.length > 0) {
		addChoice(pn, data);
	}
	dMain.appendChild(m0);
	if (aMenus.length > 1) {
		m0.style.left = '110%';
		setTimeout(function() {
			m0.style.left = '0';
			aMenus[1].style.left = '-110%';
		}, 50);
	} else {
		m0.style.left = '0';
	}
}

function loadAlbum(pn, s) {
	try {
		data = JSON.parse(s);
	} catch (err) {
		console.log(pn.path+pn.name + " -> " + err.message);
		return;
	}
	if (data.albums && data.albums.length > 0) {
		setupMenu(pn, data);
		window.location.hash = aMenus[0].id;
	}
	else if (data.gallery && data.gallery.length > 0) {
		ringGallery(dOuter, data.gallery);
	}
}

function readAlbum(pn) {
	var h = new XMLHttpRequest()
	h.onreadystatechange = function() {
		if (h.readyState == 4 && h.status == 200) {
			loadAlbum(pn, h.responseText);
		}
	}
	h.open('GET', pn.path + pn.name, true);
	h.send();
}

function hashChange() {
	if (aMenus.length == 0) {
		return;
	}
	var h = window.location.hash;
	if (hashGallery) {
		if (h == aMenus[0].id) {
			oGallery.stopGallery();
			endGallery();
		} else if (h != hashGallery) {
			window.history.back()
		}
	} else if (h != aMenus[0].id) {
		if (aMenus.length > 1 && h == aMenus[1].id) {
			goMenuback();
			return;
		}
		var i, cn = aMenus[0].childNodes;
		for (i = cn.length - 1; i >= 0; i--) {
			if (h == cn[i].id) {
				cn[i].onclick();
				return;
			}
		}
		window.history.back();
	}
}

function main() {
	initCss();
	dOuter.appendChild(dMain).appendChild(dGallery);
	readAlbum(albumUrl(albumJson));
	window.onhashchange = hashChange;
}

main();
}
