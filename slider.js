(function() {
    var extend = function(obja, objb) {
        for (var b in objb) {
            if (objb[b] && objb[b].constructor == Object) {
                if (!obja[b]) {
                    obja[b] = {};
                }
                arguments.callee(obja[b], objb[b])
            } else {
                obja[b] = objb[b];
            }
        }
        return obja;
    };
    var addClass = function() {
        if (!hasClass(arguments[0], arguments[1])) {
            arguments[0].className = [arguments[0].className.trim(), arguments[1].trim()]
                .join(" ");
        }
    }
    var removeClass = function() {
        if (arguments[0].length) {
            for (var i = 0; i < arguments[0].length; i++) {
                removeClass(arguments[0][i], arguments[1])
            }
            return;
        } else {
            if (hasClass(arguments[0], arguments[1])) {
                var reg = new RegExp('(\\s|^)' + arguments[1] + '(\\s|$)');
                arguments[0].className = arguments[0].className.replace(reg, ' ').split(
                    " ").join(" ").trim();
            }
        }

    }
    var hasClass = function() {
        return (arguments[0].className || "").match(new RegExp('(\\s|^)' +
            arguments[1] + '(\\s|$)'));
    }
    var addEvent = function(o, eType, fn) {
        if (o.addEventListener) {
            o.addEventListener(eType, fn, false);
        } else if (o.attachEvent) {
            o.attachEvent("on" + eType, fn);
        } else {
            o["on" + eType] = fn;
        }
    }
    var removeEvent = function(obj, type, fn) {
        if (obj.removeEventListener) obj.removeEventListener(type, fn, false);
        else if (obj.detachEvent) {
            obj.detachEvent("on" + type, obj[type + fn]);
            obj[type + fn] = null;
            obj["e" + type + fn] = null;
        }
    }
    /**
    * 同程图片轮播组件
    *
    *     @example
    *      new Slider({
    *        el:document.getElementById("ad"),
    *        content:'.slideCont',
    *        item:'.slideItem',
    *        loop: true,
    *        fn:function(){
    *        }
    *     });
    *
    * @class Slider
    * @author colacao <cy14477@ly.com>
    */
    window.Slider = function(options) {
        var defaults = {
            content: "ul",
            item: "li",
            loop: true,
            speed: 300,
            duration: 3000,
            autoScroll: true
        }
        var opt = extend(defaults, options);
        this.initialize(opt);
    };
    window.Slider.prototype = {
        initialize: function(options) {
            this.setOptions(options);
            this.bind();
        },
        setOptions: function(options) {
            extend(this, options);
        },
        $: function(el) {
            if (arguments.length > 1) {
                return arguments[1].querySelectorAll(arguments[0]);
            } else {
                return document.querySelector(el);
            }
        },
        css: function(el, css) {
            var arr = []
            for (var b in css) {
                arr.push(b + ":" + css[b]);
            }
            el.style.cssText = arr.join(";")
        },
        bind: function() {
           
            var content = this.$(this.content, this.el),
                items = this.$(this.item, this.el);
            this.content = content[0];
            this.index = 0;
            this.length = items.length;
            if (items.length <= 1) {
                return this;
            }
            this.css(this.el, {
                "overflow": "hidden",
                position: "relative"
            });
            this.css(this.content, {
                position: "relative",
                width: "100%"
            })
            for (var i = 1, len = items.length; i < len; i++) {
                this.css(items[i], {
                    position: "absolute",
                    width: "100%",
                    top: 0,
                    left: i * 100 + "%"
                })
            }
            if (this.loop) { // 循环时需要复制第一张幻灯片插入在最后
                var el = items[0].cloneNode(true);
                this.css(el, {
                    position: "absolute",
                    width: "100%",
                    top: 0,
                    left: items.length * 100 + "%"
                });
                this.content.appendChild(el);
            }
            this.addIndicator(items.length);
            this.to(this.active ? this.active : 0);
            if (this.autoScroll) {
                this.start();
            }
            // this.content.addEventListener("webkitTransitionEnd", function(e){
            //     //应该在这里写
            //     console.log(arguments);
            // },false);
        },
        transform: function(el, str) {
            el.style.WebkitTransform = str;
            el.style.transform = str;
        },
        to: function(i) {
            var that = this;
            this.stop();
            this.transform(this.content, "translate3d(-" + i * 100 + "%, 0, 0)");
            setTimeout(function() {
                if (i === that.length) {
                    removeClass(that.content, "slideCont");
                    setTimeout(function() {
                        that.transform(that.content, "translate3d(-" + i * 100 + "%, 0, 0)");
                        setTimeout(function() {
                            addClass(that.content, "slideCont");
                        }, that.speed+50)
                    }, that.speed);

                    i = 0;
                } else {
                    addClass(that.content, "slideCont");
                }
                that.index = i;
                if (that.indicators) {
                    removeClass(that.indicators, "active");
                    addClass(that.indicators[i], "active");
                }
                that.fn && that.fn();
            }, this.speed)
        },
        previous: function(notResetPos) {
            if (!this.loop && this.index === 0) {
                this.to(this.index);
                return;
            }
            var i = this.index - 1;
            if (this.index === 0) {
                i = this.length - 1;
                if (!notResetPos) {
                    this.transform(this.content, "translate3d(-" + 100 * (this.length) + "%, 0, 0)")
                }
            }
            this.to(i);
            if (this.autoScroll) {
                this.start();
            }
        },
        next: function() {
            if (!this.loop && this.index === this.length - 1) {
                this.to(this.index);
                return;
            }
            this.to(this.index + 1);
            if (this.autoScroll) {
                this.start();
            }
        },
        start: function() {
            var that = this;
            this.timer = setTimeout(function() {
                that.next();
            }, this.duration);
        },
        stop: function() {
            clearTimeout(this.timer);
        },
        addIndicator: function(len) {
            var htmlStr = '<span class="indicator">';
            for (var i = 0; i < len; i++) {
                htmlStr += '<i></i>';
            }
            htmlStr += '</span>';
            var temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            this.el.appendChild(temp.removeChild(temp.firstChild));
            var indicator = this.$(".indicator", this.el);
            this.css(indicator[0], {
                "margin-left": this.el.offsetWidth / 2 - (len * 16) / 2 + "px"
            });
            this.indicators = this.$("i", indicator[0]);
            addClass(this.indicators[0], "active");
        }
    }
})();
