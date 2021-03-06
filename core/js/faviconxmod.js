/**
 * A tiny javascript library that makes progress bars out of the favicon placeholders
 * Check nicolasbize.github.io/faviconx/ for latest updates.
 *
 * Author:         Nicolas Bize
 * Created:        Oct 10th 2013
 * Last Updated: Oct 16th 2014
 * Version:        1.0.1
 * Licence:        FavIconX is licenced under MIT licence (http://opensource.org/licenses/MIT)
 */
var FavIconX = (function() {
    // my private parts, do not mess with them.
    var originalIcon;
    var value = 0;
    var animValue = 0;
    var canvas = document.createElement("canvas");
    var context;
    var icon; // image storage
    var animInterval = null;
    var animCallback = null;
    var oldTitle = "";
    var head = null;
    var isReset = null;

    // default values for properties accessed through .config() method:
    var shape;
    var doughnutRadius;
    var overlay;
    var overlayColor;
    var backgroundColor;
    var animated;
    var animationSpeed; // ms to go from one value to the one from setValue
    var borderColor;
    var borderColor2;
    var shadowColor;
    var borderWidth;
    var fillColor;
    var fillColor2;
    var updateTitle;
    var titleRenderer;

    function setDefaults(){
        shape = "doughnut";
        doughnutRadius = 6;
        overlay = false;
        overlayColor = "#000";
        backgroundColor = "transparent";
        animated = false;
        animationSpeed = 2000;
        animCallback = null;
        borderColor = "#3A70B1";
        borderColor2 = null;
        shadowColor = "rgba(255, 0, 0, 0)";
        borderWidth = 1;
        fillColor = "#3A70B1";
        fillColor2 = null;
        updateTitle = true;
        value = 0;
        isReset = true;
        titleRenderer = function(val, title){
            return "[" + val + "%] - " + title;
        };
    }

    // Generates the background square
    function generateBackground(ctx, w, h){
        if(backgroundColor === "transparent") {
            return;
        }
        context.fillStyle = backgroundColor;
        context.fillRect(0,0,100,100);
    }

    // (255, 0, 0) => "#FF0000"
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // "#FF0000" => [255, 0, 0]
    function hexToRgb(hex) {
        hex = hex.indexOf("#") === 0 ? hex.substring(1) : hex;
        var nb = parseInt(hex, 16);
        var r = (nb >> 16) & 255;
        var g = (nb >> 8) & 255;
        var b = nb & 255;
        return [r,g,b];
    }

    // gets a mid color according to current value
    // col1 = 0%, col2 = 100%
    function getMidColor(col1, col2){
        var rgb1 = hexToRgb(col1);
        var rgb2 = hexToRgb(col2);
        var avg = [0, 0, 0];
        var invV = (100 - (animValue || value)) / 100;
        for(var i=0; i<3; i++){
            avg[i] = rgb1[i] * invV + rgb2[i] * (1-invV);
        }
        return rgbToHex(Math.round(avg[0]), Math.round(avg[1]), Math.round(avg[2]));
    }

    // because i don"t speak in radians
    function toRad(deg){
        return deg * Math.PI / 180;
    }

    // Generates the overlay shape
    function generateOverlay(ctx, w, h){
        ctx.strokeStyle = overlayColor;
        ctx.fillStyle = overlayColor;
        if(overlay === "play"){
            ctx.beginPath();
            ctx.moveTo(w*0.38, h*0.3);
            ctx.lineTo(w*0.38, h*0.7);
            ctx.lineTo(w*0.75, h*0.5);
            ctx.lineTo(w*0.38, h*0.3);
            ctx.closePath();
            ctx.fill();
        } else if(overlay === "pause"){
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w*0.38,h*0.3);
            ctx.lineTo(w*0.38,h*0.7);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(w*0.62,h*0.3);
            ctx.lineTo(w*0.62,h*0.7);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // spelling doughnut just feels wrong
    function generateDoughnut(v){
        var graphValue = v || value;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var deg = graphValue * 3.6 - 90;

        canvas.width = canvas.width;

        generateBackground(context, canvas.width, canvas.height);

        if(graphValue < 1){
            generateOverlay(context, canvas.width, canvas.height);
            return;
        }
        context.lineWidth = borderWidth;
        context.strokeStyle = shadowColor;
        context.beginPath();
        context.arc(centerX, centerY, doughnutRadius, 0, toRad(360), false);
        context.arc(centerX, centerY, doughnutRadius - borderWidth, 0, toRad(360), true);
        context.closePath();
        context.stroke();

        context.strokeStyle = fillColor2 ? getMidColor(fillColor, fillColor2) : fillColor;
        context.beginPath();
        context.arc(centerX, centerY, doughnutRadius, toRad(-90), toRad(deg), false);
        context.arc(centerX, centerY, doughnutRadius - borderWidth, toRad(deg), toRad(-90), true);
        context.closePath();
        context.stroke();
        generateOverlay(context, canvas.width, canvas.height);
    }


    // Generates the wanted shape
    function generateBitmap(v){
        if(shape === "doughnut"){
            generateDoughnut(v);
        }
    }

    // draw me a check mark
    function generateSuccess(bgColor, fgColor){
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;

        canvas.width = canvas.width;
        context.beginPath();
        context.arc(centerX, centerY, 8, 0, 2 * Math.PI, false);
        context.fillStyle = bgColor || "#53C516";
        context.fill();

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = fgColor || "#FFFFFF";
        context.moveTo(4, 9);
        context.lineTo(8, 12);
        context.lineTo(12, 4);
        context.stroke();

    }

    // how about the red cross of death?
    function generateFailure(bgColor, fgColor){
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;

        context.beginPath();
        context.arc(centerX, centerY, 8, 0, 2 * Math.PI, false);
        context.fillStyle = bgColor || "#F6491F";
        context.fill();

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = fgColor || "#FFFFFF";
        context.moveTo(5, 4);
        context.lineTo(11, 12);
        context.moveTo(11, 4);
        context.lineTo(5, 12);
        context.stroke();

    }

    // refresh the tab favicon
    function refreshFavIcon(){
        head.removeChild(icon);
        icon.setAttribute("href", canvas.toDataURL("image/x-icon"));
        head.appendChild(icon);
        if(updateTitle){
            document.title = titleRenderer.call(this, animValue || value, oldTitle);
        }
    }

    // either we already have a favicon and we want to keep it for resets...
    // or we create one that we call bob and that we care for
    function getIconRef(){
        head = document.getElementsByTagName("head")[0];
        var els = document.getElementsByTagName("link");
        if(els.length > 0){
            for(var i=0; i<els.length; i++){
                if(els[i].getAttribute("rel").split(" ").indexOf("icon") > -1){
                    originalIcon = els[i].cloneNode(true); // keep the original for reset()
                    return els[i];
                }
            }
        }
        // no favicon found. create one.
        var newIcon = document.createElement("link");
        newIcon.setAttribute("rel", "shortcut icon");
        newIcon.setAttribute("type", "image/png");
        head.appendChild(newIcon);
        return newIcon;
    }

    // starting point to the app... couldn"t hide it in the code better
    function init(){
        if(!canvas || !canvas.getContext){
            throw "No support for Canvas, no chocolate for you! =(";
        }
        icon = getIconRef();
        oldTitle = document.title;
        canvas.height = canvas.width = 16;
        context = canvas.getContext("2d");
    }

    // this, as the method name suggests, is called once the anim has stopped.
    function stopAnim(){
        if(!animCallback){
            return;
        }
        animCallback.call(this, value);
        animCallback = null;
    }

    // animation: called again and again until we get to the right value
    function incValue(inc){
        animValue += inc;
        if(isReset === true){
            return;
        }
        generateBitmap(animValue);
        refreshFavIcon();
        if(animValue === null || !animated){
            return;
        }
        if(animValue === value){
            stopAnim();
            return;
        }
        setTimeout(function(){
            incValue(animValue > value ? -1 : 1);
        }, animInterval);
    }

    // let"s get things started.
    setDefaults();
    init();

    // we get to the public methods now.
    return {
        // a helper to configure mucho settings at once
        config : function(cfg){
            shape = cfg.shape || shape;
            doughnutRadius = cfg.doughnutRadius || doughnutRadius;
            overlay = cfg.overlay || overlay;
            overlayColor = cfg.overlayColor || overlayColor;
            backgroundColor = cfg.backgroundColor || backgroundColor;
            isReset = false;
            animated = cfg.animated || animated;
            animationSpeed = cfg.animationSpeed || animationSpeed;
            borderColor = cfg.borderColor || borderColor;
            borderColor2 = cfg.borderColor2 || borderColor2;
            borderWidth = cfg.borderWidth || borderWidth;
            shadowColor = cfg.shadowColor || shadowColor;
            fillColor = cfg.fillColor || fillColor;
            fillColor2 = cfg.fillColor2 || fillColor2;
            updateTitle = cfg.updateTitle || updateTitle;
            titleRenderer = cfg.titleRenderer || titleRenderer;
            animCallback = (typeof cfg.callback !== "undefined") ? cfg.callback : animCallback;
            generateBitmap();
            refreshFavIcon();
            return FavIconX;
        },

        // setValue(value, [animated], [speed], [callback])
        // value must be between 0 and 100
        // when specified the animated overrides the component setting.
        // when specified the speed orrides the component setting
        // callback called once the animation is finished
        setValue : function(v, isAnimated, animSpeed, callback){
            if(v<0 || v>100) {
                throw "value must be between 0 and 100";
            }
            animCallback = (typeof callback !== "undefined") ? callback : animCallback;
            animValue = value;
            value = v;
            isReset = false;
            if(typeof isAnimated !== "undefined" ? isAnimated : animated){
                var steps = animValue - value;
                if(animValue !== value){
                    animInterval = Math.abs(Math.ceil((typeof animSpeed !== "undefined" ? animSpeed : animationSpeed) / steps));
                    incValue(animValue > value ? -1 : 1);
                }
                return FavIconX;
            }
            animValue = null;
            generateBitmap();
            refreshFavIcon();
            if(animCallback){
                animCallback.call(this, v);
            }
            return FavIconX;
        },

        // returns the current value of the widget
        getValue : function(){
            return animValue || value;
        },

        // restoring the past... or is it...
        reset : function(){
            setDefaults();
            if(originalIcon){
                head.removeChild(icon);
                icon = originalIcon.cloneNode(true);
                head.appendChild(icon);
            }
            if(updateTitle){
                document.title = oldTitle;
            }
            return FavIconX;
        },

        // displays the awesome checkbox. colors can be tweaked here
        complete : function(fgColor, bgColor){
            isReset = false;
            generateSuccess(fgColor, bgColor);
            refreshFavIcon();
            document.title = oldTitle;
        },

        // displays the even more awesome cross. colors can be tweaked here
        fail : function(fgColor, bgColor){
            isReset = false;
            generateFailure(fgColor, bgColor);
            refreshFavIcon();
            document.title = oldTitle;
        }
    };
}());
