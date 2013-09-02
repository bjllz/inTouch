/*

Holder - 2.0 - client side image placeholders
(c) 2012-2013 Ivan Malopinsky / http://imsky.co

Provided under the Apache 2.0 License: http://www.apache.org/licenses/LICENSE-2.0
Commercial use requires attribution.

*/

    var Holder = Holder || {};
(function (app, win) {

    var preempted = false,
	fallback = false,
	canvas = document.createElement('canvas');

    //getElementsByClassName polyfill
    document.getElementsByClassName||(document.getElementsByClassName=function(e){var t=document,n,r,i,s=[];if(t.querySelectorAll)return t.querySelectorAll("."+e);if(t.evaluate){r=".//*[contains(concat(' ', @class, ' '), ' "+e+" ')]",n=t.evaluate(r,t,null,0,null);while(i=n.iterateNext())s.push(i)}else{n=t.getElementsByTagName("*"),r=new RegExp("(^|\\s)"+e+"(\\s|$)");for(i=0;i<n.length;i++)r.test(n[i].className)&&s.push(n[i])}return s})

	//getComputedStyle polyfill
	window.getComputedStyle||(window.getComputedStyle=function(e,t){return this.el=e,this.getPropertyValue=function(t){var n=/(\-([a-z]){1})/g;return t=="float"&&(t="styleFloat"),n.test(t)&&(t=t.replace(n,function(){return arguments[2].toUpperCase()})),e.currentStyle[t]?e.currentStyle[t]:null},this})

	//http://javascript.nwbox.com/ContentLoaded by Diego Perini with modifications
	function contentLoaded(n,t){var l="complete",s="readystatechange",u=!1,h=u,c=!0,i=n.document,a=i.documentElement,e=i.addEventListener?"addEventListener":"attachEvent",v=i.addEventListener?"removeEventListener":"detachEvent",f=i.addEventListener?"":"on",r=function(e){(e.type!=s||i.readyState==l)&&((e.type=="load"?n:i)[v](f+e.type,r,u),!h&&(h=!0)&&t.call(n,null))},o=function(){try{a.doScroll("left")}catch(n){setTimeout(o,50);return}r("poll")};if(i.readyState==l)t.call(n,"lazy");else{if(i.createEventObject&&a.doScroll){try{c=!n.frameElement}catch(y){}c&&o()}i[e](f+"DOMContentLoaded",r,u),i[e](f+s,r,u),n[e](f+"load",r,u)}};

    //https://gist.github.com/991057 by Jed Schmidt with modifications
    function selector(a){
	a=a.match(/^(\W)?(.*)/);var b=document["getElement"+(a[1]?a[1]=="#"?"ById":"sByClassName":"sByTagName")](a[2]);
	var ret=[];b!=null&&(b.length?ret=b:b.length==0?ret=b:ret=[b]);return ret;
    }

    //shallow object property extend
    function extend(a,b){var c={};for(var d in a)c[d]=a[d];for(var e in b)c[e]=b[e];return c}

    //hasOwnProperty polyfill
    if (!Object.prototype.hasOwnProperty)
	Object.prototype.hasOwnProperty = function(prop) {
	    var proto = this.__proto__ || this.constructor.prototype;
	    return (prop in this) && (!(prop in proto) || proto[prop] !== this[prop]);
	}

    function text_size(width, height, template) {
	height = parseInt(height,10);
	width = parseInt(width,10);
	var bigSide = Math.max(height, width)
	    var smallSide = Math.min(height, width)
	    var scale = 1 / 12;
	var newHeight = Math.min(smallSide * 0.75, 0.75 * bigSide * scale);
	return {
	    height: Math.round(Math.max(template.size, newHeight))
		}
    }

    function draw(ctx, dimensions, template, ratio) {
	var ts = text_size(dimensions.width, dimensions.height, template);
	var text_height = ts.height;
	var width = dimensions.width * ratio,
	    height = dimensions.height * ratio;
	var font = template.font ? template.font : "sans-serif";
	canvas.width = width;
	canvas.height = height;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = template.background;
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = template.foreground;
	ctx.font = "bold " + text_height + "px " + font;
	var text = template.text ? template.text : (Math.floor(dimensions.width) + "x" + Math.floor(dimensions.height));
	var text_width = ctx.measureText(text).width;
	if (text_width / width >= 0.75) {
	    text_height = Math.floor(text_height * 0.75 * (width/text_width));
	}
	//Resetting font size if necessary
	ctx.font = "bold " + (text_height * ratio) + "px " + font;
	ctx.fillText(text, (width / 2), (height / 2), width);
	return canvas.toDataURL("image/png");
    }

    function render(mode, el, holder, src) {
	var dimensions = holder.dimensions,
	    theme = holder.theme,
	    text = holder.text ? decodeURIComponent(holder.text) : holder.text;
	var dimensions_caption = dimensions.width + "x" + dimensions.height;
	theme = (text ? extend(theme, {
		    text: text
		}) : theme);
	theme = (holder.font ? extend(theme, {
		    font: holder.font
		}) : theme);
	if (mode == "image") {
	    el.setAttribute("data-src", src);
	    el.setAttribute("alt", text ? text : theme.text ? theme.text + " [" + dimensions_caption + "]" : dimensions_caption);
	    if (fallback || !holder.auto) {
		el.style.width = dimensions.width + "px";
		el.style.height = dimensions.height + "px";
	    }
	    if (fallback) {
		el.style.backgroundColor = theme.background;
	    } else {
		el.setAttribute("src", draw(ctx, dimensions, theme, ratio));
	    }
	} else if (mode == "background") {
	    if (!fallback) {
		el.style.backgroundImage = "url(" + draw(ctx, dimensions, theme, ratio) + ")";
		el.style.backgroundSize = dimensions.width + "px " + dimensions.height + "px";
	    }
	} else if (mode == "fluid") {
	    el.setAttribute("data-src", src);
	    el.setAttribute("alt", text ? text : theme.text ? theme.text + " [" + dimensions_caption + "]" : dimensions_caption);
	    if (dimensions.height.substr(-1) == "%") {
		el.style.height = dimensions.height
		    } else {
		el.style.height = dimensions.height + "px"
		    }
	    if (dimensions.width.substr(-1) == "%") {
		el.style.width = dimensions.width
		    } else {
		el.style.width = dimensions.width + "px"
		    }
	    if (el.style.display == "inline" || el.style.display == "") {
		el.style.display = "block";
	    }
	    if (fallback) {
		el.style.backgroundColor = theme.background;
	    } else {
		el.holderData = holder;
		fluid_images.push(el);
		fluid_update(elfalse;

			     for (sl = flags.length, j = 0; j < sl; j++) {
				 var flag = flags[j];
				 if (app.flags.divar ctx = canvas.getContext("2d");
				     }
			     }

			     var dpr = 1, bsr = 1;
			     
			     if(!fallback){
				 dpr = window.devicePixelRatio || 1,
				     bsr = ct)$/,
			     output: function (val) {
				 var exec = this.regex.exec(val) {
				     var img = document.createElement("img")
				     img.setAttribute("data-src", src);
				     node[i].appendChild(img);
				 }
			     }
			     return app;
			     };

		app.run = function (o) {
		    var options = extend(settings, o),
		    images = [], imageNodes = [], bgnodes holdercss = document.createElement("style");
		    holdercss.setAttribute("id", "holderjs-style");
		    holdercss.type = "text/css";
		    document.getElementsByTagName("head")[0].appendChild(holdercss);
		}
		
		if (!options.nocss) {
		    if (holdercss.styleSheet) {
			holdercss.styleSheet.cssText += options.stylesheet;
		    } else {
			holdercss.appendChild(document.createTextNode(options.stylesheet));
		    }
		}

		var cssrtions);
	    if(holder){
		render("background", bgnodes[i], holder, src);
	    }
	}
    }

    for (l = images.length, i = 0; i < l; i++) {
	    
	var attr_src = attr_data_src = src = null;
	
	try{
	    attr_src = images[i].getAttribute("src");
	    attr_datasrc = images[i].getAttribute("data-src");
	}catch(e){}
	
	if (attr_datasrc == null && !! attr_src && attr_src.indexOf(options.domain) >= 0) {
	    src = attr_src;
	} else if ( !! attr_datasrc && attr_data, fluid_update, false);
    } else {
	window.attachEvent("onresize", fluid_update)
	    }
    preempted || app.run();
});

if (typeof define === "function" && define.amd) {
    define("Holder", [], function () {
	    return app;
	});
}

})(Holder, window);