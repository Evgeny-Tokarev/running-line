var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var anime = require('animejs/lib/anime.min.js');

module.exports = function () {
  function RunningLine(duration, rightDirection, hoverStop, allocate) {
    _classCallCheck(this, RunningLine);

    this.animations = [];
    this.wrapper = null;
    this.list = null;
    this.observer = null;
    this.duration = duration || 5000;
    this.overlay = null;
    this.wrapperWidth = 0;
    this.wrapperHeight = 0;
    this.listWidth = 0;
    this.runningElements = [];
    this.current = 0;
    this.rightDirection = rightDirection || false;
    this.hoverStop = hoverStop || false;
    this.allocate = allocate || false;
    this.maxItemWidth = 0;
    this.rootMargin = '0px';
  }

  _createClass(RunningLine, [{
    key: 'runLine',
    value: function runLine(selector) {
      var _this = this;

      try {
        this.overlay = document.querySelector(selector);
        this.wrapper = this.overlay.firstElementChild;
        this.list = this.wrapper.firstElementChild;
        this.runningElements = Array.from(this.list.children);
      } catch (er) {
        console.error(er);
        return;
      }
      this.makeRunningElementsFoolWidth();
      this.wrapperWidth = this.overlay.getBoundingClientRect().width;
      this.wrapperHeight = this.overlay.getBoundingClientRect().height;
      this.maxItemWidth = this.getMaxRunningElementWidth();
      this.setItemsStyleProperties();
      this.moveItemsToStartPosition();
      if (this.wrapperWidth > this.listWidth - this.maxItemWidth && this.allocate) {
        this.fixGap();
      }
      this.current = !this.rightDirection ? this.runningElements.length - 1 : 0;
      this.observer = new IntersectionObserver(this.intersectionHandler.bind(this), {
        root: this.wrapper,
        rootMargin: this.rootMargin,
        threshold: [1]
      });
      this.runningElements.forEach(function (runningElement) {
        _this.observer.observe(runningElement);
      });
      if (this.hoverStop) this.setHoverListeners();

      var resizeTimer = void 0;
      window.addEventListener('resize', function () {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
          _this.reset();
          _this.runLine(selector);
        }, 500);
      });
      this.animate(this.runningElements[this.current]);
    }
  }, {
    key: 'setHoverListeners',
    value: function setHoverListeners() {
      var _this2 = this;

      this.runningElements.forEach(function (runningElement) {
        runningElement.addEventListener('mouseover', _this2.stopAllAnimations.bind(_this2));
        runningElement.addEventListener('mouseout', _this2.startAllAnimations.bind(_this2));
      });
    }
  }, {
    key: 'makeRunningElementsFoolWidth',
    value: function makeRunningElementsFoolWidth() {
      this.list.style.setProperty('display', 'flex');
      this.runningElements.forEach(function (runningElement) {
        runningElement.style.setProperty('flex', '0 0 auto');
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _this3 = this;

      this.runningElements.forEach(function (runningElement) {
        runningElement.removeEventListener('mouseover', _this3.stopAllAnimations.bind(_this3));
        runningElement.removeEventListener('mouseout', _this3.startAllAnimations.bind(_this3));
        if (_this3.observer) {
          _this3.observer.unobserve(runningElement);
        }
      });
      this.animations.forEach(function (animation) {
        if (animation) {
          anime.set(animation.animatables[0].target, {
            translateX: 0
          });
          animation.remove(animation.animatables[0].target);
        }
      });
      this.overlay.style.removeProperty('width');
      this.wrapper.style.removeProperty('width');
      this.animations = [];
      this.wrapper = null;
      this.list = null;
      this.observer = null;
      this.wrapperWidth = 0;
      this.wrapperHeight = 0;
      this.listWidth = 0;
      this.runningElements = [];
      this.current = 0;
      this.maxItemWidth = 0;
      this.rootMargin = '0px';
    }
  }, {
    key: 'createOverlay',
    value: function createOverlay() {
      this.overlay.style.setProperty('width', this.wrapperWidth + 'px');
      this.wrapper.style.setProperty('width', this.maxItemWidth + 5 + 'px');
      this.overlay.style.setProperty('overflow', 'hidden');
      this.wrapperWidth = this.wrapper.getBoundingClientRect().width;
    }
  }, {
    key: 'setItemsStyleProperties',
    value: function setItemsStyleProperties() {
      if (this.maxItemWidth > this.wrapperWidth) {
        this.createOverlay();
      } else {
        this.wrapper.style.setProperty('overflow', 'hidden');
      }
      this.list.style.setProperty('position', 'relative');
      this.list.style.setProperty('height', this.wrapperHeight + 'px');
      this.list.style.setProperty('margin', '0');
      this.list.style.setProperty('padding', '0');
      this.listWidth = this.runningElements.reduce(function (sum, el) {
        return sum + el.getBoundingClientRect().width;
      }, 0);
      this.runningElements.forEach(function (el) {
        el.style.setProperty('position', 'absolute');
      });
      this.list.style.setProperty('width', this.listWidth + 'px');
    }
  }, {
    key: 'fixGap',
    value: function fixGap() {
      var gap = this.wrapperWidth - this.listWidth + this.maxItemWidth;
      var fixWidth = gap / this.runningElements.length;
      this.listWidth = this.maxItemWidth + fixWidth;
      this.list.style.setProperty('width', this.listWidth + 'px');
      var margin = this.rightDirection ? 'margin-right' : 'margin-left';
      this.rootMargin = this.rightDirection ? '0px ' + -fixWidth + 'px 0px 0px' : '0px 0px 0px ' + -fixWidth + 'px';
      this.runningElements.forEach(function (runningElement) {
        var oldLeftMargin = +window.getComputedStyle(runningElement).getPropertyValue('margin-left').replace(/\w+/, '');
        runningElement.style.setProperty(margin, oldLeftMargin + fixWidth + 'px');
      });
    }
  }, {
    key: 'moveItemsToStartPosition',
    value: function moveItemsToStartPosition() {
      if (this.rightDirection) {
        this.list.style.setProperty('right', -this.wrapperWidth + 'px');
      } else {
        this.list.style.setProperty('left', -this.listWidth + 'px');
        this.runningElements.forEach(function (runningElement) {
          runningElement.style.setProperty('right', '0');
        });
      }
    }
  }, {
    key: 'intersectionHandler',
    value: function intersectionHandler(entries) {
      var _this4 = this;

      entries.forEach(function (entry) {
        if (entry && entry.isIntersecting) {
          if (!_this4.rightDirection) {
            _this4.current = _this4.current > 0 ? _this4.current - 1 : _this4.runningElements.length - 1;
          } else {
            _this4.current = _this4.current < _this4.runningElements.length - 1 ? _this4.current + 1 : 0;
          }
          if (!_this4.animations[_this4.current]) {
            _this4.animate(_this4.runningElements[_this4.current]);
          } else if (_this4.animations[_this4.current].completed) {
            _this4.animations[_this4.current].restart();
          } else {
            _this4.animations[_this4.current].finished.then(function () {
              _this4.animations[_this4.current].restart();
            }, function (reason) {
              console.error(reason);
            });
          }
        }
      });
    }
  }, {
    key: 'animate',
    value: function animate(runningElement) {
      var _getWidthAndDuration = this.getWidthAndDuration(),
          width = _getWidthAndDuration.width;

      var _getWidthAndDuration2 = this.getWidthAndDuration(),
          duration = _getWidthAndDuration2.duration;

      width = !this.rightDirection ? width : -width;
      this.animations[this.current] = anime({
        targets: runningElement,
        easing: 'linear',
        loop: 0,
        keyframes: [{ translateX: width, duration: duration }, { translateX: 0, duration: 0 }]
      });
    }
  }, {
    key: 'getMaxRunningElementWidth',
    value: function getMaxRunningElementWidth() {
      return this.runningElements.reduce(function (max, el) {
        return max < el.getBoundingClientRect().width ? el.getBoundingClientRect().width : max;
      }, 0);
    }
  }, {
    key: 'getCurrentWidth',
    value: function getCurrentWidth() {
      return this.runningElements[this.current].getBoundingClientRect().width;
    }
  }, {
    key: 'getWidthAndDuration',
    value: function getWidthAndDuration() {
      var wid = this.wrapperWidth + this.getCurrentWidth();
      return {
        width: wid,
        duration: wid * this.duration / this.listWidth
      };
    }
  }, {
    key: 'stopAllAnimations',
    value: function stopAllAnimations() {
      this.animations.forEach(function (animation) {
        if (animation && !animation.completed) {
          animation.pause();
        }
      });
    }
  }, {
    key: 'startAllAnimations',
    value: function startAllAnimations() {
      this.animations.forEach(function (animation) {
        if (animation && !animation.completed) {
          animation.play();
        }
      });
    }
  }]);

  return RunningLine;
}();