var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import anime from 'animejs/lib/anime';

var RunningLine = function () {
  function RunningLine(duration, rightDirection) {
    _classCallCheck(this, RunningLine);

    this.animations = [];
    this.wrapper = null;
    this.wideWrapper = null;
    this.list = null;
    this.observer = null;
    this.duration = duration;
    this.wrapperWidth = 0;
    this.listWidth = 0;
    this.targets = [];
    this.current = 0;
    this.rightDirection = rightDirection || false;
  }

  _createClass(RunningLine, [{
    key: 'init',
    value: function init(selector) {
      var _this = this;

      try {
        this.wrapper = document.querySelector(selector);
        this.wrapperWidth = this.wrapper.getBoundingClientRect().width;
        this.list = this.wrapper.firstElementChild;
        this.targets = Array.from(this.list.children);
      } catch (er) {
        console.error(er);
        return;
      }
      this.maxItemWidth = this.getMaxTargetWidth();
      this.setItemsStyleProperties();
      this.moveItemsToStartPosition();
      this.fixGap();

      this.current = !this.rightDirection ? this.targets.length - 1 : 0;
      this.observer = new IntersectionObserver(this.intersectionHandler.bind(this), {
        root: this.wrapper,
        rootMargin: '0px',
        threshold: [1]
      });
      this.targets.forEach(function (target) {
        target.addEventListener('mouseover', _this.stopAllAnimations.bind(_this));
        target.addEventListener('mouseout', _this.startAllAnimations.bind(_this));
        _this.observer.observe(target);
      });
      var resizeTimer = void 0;
      window.addEventListener('resize', function () {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
          _this.reset();
          _this.init(selector);
        }, 250);
      });
      this.animate(this.targets[this.current]);
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _this2 = this;

      this.targets.forEach(function (target) {
        target.removeEventListener('mouseover', _this2.stopAllAnimations.bind(_this2));
        target.removeEventListener('mouseout', _this2.startAllAnimations.bind(_this2));
      });
      this.animations = [];
      this.wrapper = null;
      this.wideWrapper = null;
      this.list = null;
      this.observer = null;
      this.duration = duration;
      this.wrapperWidth = 0;
      this.listWidth = 0;
      this.targets = [];
      this.current = 0;
      this.list.style.setProperty('width', '0');
    }
  }, {
    key: 'createWideWrapper',
    value: function createWideWrapper() {
      this.wideWrapper = document.createElement('div');
      this.wideWrapper.style.setProperty('width', this.maxItemWidth + 'px');
      tthis.wrapper.style.setProperty('overflow', 'hidden');
      this.list.style.setProperty('position', 'relative');
    }
  }, {
    key: 'setItemsStyleProperties',
    value: function setItemsStyleProperties() {
      if (this.maxItemWidth > this.wrapper.getBoundingClientRect().width) {
        this.createWideWrapper();
      } else {
        this.wrapper.style.setProperty('overflow', 'hidden');
        this.list.style.setProperty('position', 'relative');
      }

      this.targets.forEach(function (target) {
        target.style.setProperty('position', 'absolute');
        target.style.setProperty('display', 'inline-block');
      });
      this.listWidth = this.targets.reduce(function (sum, el) {
        return sum + el.getBoundingClientRect().width;
      }, 0);
      this.list.style.setProperty('width', this.listWidth + 'px');
    }
  }, {
    key: 'fixGap',
    value: function fixGap() {
      var fixWidth = (this.wrapperWidth - this.listWidth + this.maxItemWidth) / (2 * (this.targets.length - 1));
      if (this.wrapperWidth > this.listWidth - this.maxItemWidth) {
        this.targets.forEach(function (target) {
          var oldLeftpadding = +window.getComputedStyle(target).getPropertyValue('padding-left').replace(/\w+/, '');
          var oldRightpadding = +window.getComputedStyle(target).getPropertyValue('padding-right').replace(/\w+/, '');
          target.style.setProperty('padding-right', oldRightpadding + fixWidth + 'px');
          target.style.setProperty('padding-left', oldLeftpadding + fixWidth + 'px');
        });
      }
    }
  }, {
    key: 'moveItemsToStartPosition',
    value: function moveItemsToStartPosition() {
      if (this.rightDirection) {
        this.list.style.setProperty('right', -this.wrapperWidth + 'px');
      } else {
        this.list.style.setProperty('left', -this.listWidth + 'px');
        this.targets.forEach(function (target) {
          target.style.setProperty('right', '0');
        });
      }
    }
  }, {
    key: 'intersectionHandler',
    value: function intersectionHandler(entries) {
      var _this3 = this;

      entries.forEach(function (entry) {
        if (entry && entry.isIntersecting) {
          if (!_this3.rightDirection) {
            _this3.current = _this3.current > 0 ? _this3.current - 1 : _this3.targets.length - 1;
          } else {
            _this3.current = _this3.current < _this3.targets.length - 1 ? _this3.current + 1 : 0;
          }

          if (!_this3.animations[_this3.current]) {
            _this3.animate(_this3.targets[_this3.current]);
          } else if (_this3.animations[_this3.current].completed) {
            _this3.animations[_this3.current].restart();
          } else {
            _this3.animations[_this3.current].finished.then(function () {
              _this3.animations[_this3.current].restart();
            }, function (reason) {
              console.log(reason);
            });
          }
        }
      });
    }
  }, {
    key: 'animate',
    value: function animate(target) {
      var _getWidthAndDuration = this.getWidthAndDuration(),
          width = _getWidthAndDuration.width;

      var _getWidthAndDuration2 = this.getWidthAndDuration(),
          duration = _getWidthAndDuration2.duration;

      width = !this.rightDirection ? width : -width;
      this.animations[this.current] = anime({
        targets: target,
        easing: 'linear',
        loop: 0,
        keyframes: [{ translateX: width, duration: duration }, { translateX: 0, duration: 0 }]
      });
    }
  }, {
    key: 'getMaxTargetWidth',
    value: function getMaxTargetWidth() {
      return this.targets.reduce(function (max, el) {
        console.log(max, el.getBoundingClientRect().width);
        return max < el.getBoundingClientRect().width ? el.getBoundingClientRect().width : max;
      }, 0);
    }
  }, {
    key: 'getCurrentWidth',
    value: function getCurrentWidth() {
      return this.targets[this.current].getBoundingClientRect().width;
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

export default RunningLine;