import anime from 'animejs/lib/anime';

export default class RunningLine {
  constructor(duration, rightDirection) {
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

  init(selector) {
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
      threshold: [1],
    });
    this.targets.forEach((target) => {
      target.addEventListener('mouseover', this.stopAllAnimations.bind(this));
      target.addEventListener('mouseout', this.startAllAnimations.bind(this));
      this.observer.observe(target);
    });
    this.animations.forEach((animation) => {
      animation.remove()
    })
    let resizeTimer;
    window.addEventListener('resize', () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(() => {
        this.reset();
        this.init(selector);
      }, 250);
    });
    this.animate(this.targets[this.current]);
  }

  reset() {
    this.targets.forEach((target) => {
      target.removeEventListener('mouseover', this.stopAllAnimations.bind(this));
      target.removeEventListener('mouseout', this.startAllAnimations.bind(this));
      this.observer.unobserve(target);
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
    this.list.style.setProperty('width', `0`);
  }

  createWideWrapper() {
    this.wideWrapper = document.createElement('div');
    this.wideWrapper.style.setProperty('width', `${this.maxItemWidth}px`);
    tthis.wrapper.style.setProperty('overflow', 'hidden');
    this.list.style.setProperty('position', 'relative');
  }
  setItemsStyleProperties() {
    if (this.maxItemWidth > this.wrapper.getBoundingClientRect().width) {
      this.createWideWrapper();
    } else {
      this.wrapper.style.setProperty('overflow', 'hidden');
      this.list.style.setProperty('position', 'relative');
    }

    this.targets.forEach((target) => {
      target.style.setProperty('position', 'absolute');
      target.style.setProperty('display', 'inline-block');
    });
    this.listWidth = this.targets.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
    this.list.style.setProperty('width', `${this.listWidth}px`);
  }

  fixGap() {
    const fixWidth =
      (this.wrapperWidth - this.listWidth + this.maxItemWidth) / (2 * (this.targets.length - 1));
    if (this.wrapperWidth > this.listWidth - this.maxItemWidth) {
      this.targets.forEach((target) => {
        const oldLeftpadding = +window
          .getComputedStyle(target)
          .getPropertyValue('padding-left')
          .replace(/\w+/, '');
        const oldRightpadding = +window
          .getComputedStyle(target)
          .getPropertyValue('padding-right')
          .replace(/\w+/, '');
        target.style.setProperty('padding-right', `${oldRightpadding + fixWidth}px`);
        target.style.setProperty('padding-left', `${oldLeftpadding + fixWidth}px`);
      });
    }
  }

  moveItemsToStartPosition() {
    if (this.rightDirection) {
      this.list.style.setProperty('right', `${-this.wrapperWidth}px`);
    } else {
      this.list.style.setProperty('left', `${-this.listWidth}px`);
      this.targets.forEach((target) => {
        target.style.setProperty('right', '0');
      });
    }
  }

  intersectionHandler(entries) {
    entries.forEach((entry) => {
      if (entry && entry.isIntersecting) {
        if (!this.rightDirection) {
          this.current = this.current > 0 ? this.current - 1 : this.targets.length - 1;
        } else {
          this.current = this.current < this.targets.length - 1 ? this.current + 1 : 0;
        }

        if (!this.animations[this.current]) {
          this.animate(this.targets[this.current]);
        } else if (this.animations[this.current].completed) {
          this.animations[this.current].restart();
        } else {
          this.animations[this.current].finished.then(
            () => {
              this.animations[this.current].restart();
            },
            (reason) => {
              console.log(reason);
            }
          );
        }
      }
    });
  }

  animate(target) {
    let {width} = this.getWidthAndDuration();
    const {duration} = this.getWidthAndDuration();
    width = !this.rightDirection ? width : -width;
    this.animations[this.current] = anime({
      targets: target,
      easing: 'linear',
      loop: 0,
      keyframes: [
        {translateX: width, duration},
        {translateX: 0, duration: 0},
      ],
    });
  }

  getMaxTargetWidth() {
    return this.targets.reduce((max, el) => {
      console.log(max, el.getBoundingClientRect().width);
      return max < el.getBoundingClientRect().width ? el.getBoundingClientRect().width : max;
    }, 0);
  }

  getCurrentWidth() {
    return this.targets[this.current].getBoundingClientRect().width;
  }

  getWidthAndDuration() {
    const wid = this.wrapperWidth + this.getCurrentWidth();
    return {
      width: wid,
      duration: (wid * this.duration) / this.listWidth,
    };
  }

  stopAllAnimations() {
    this.animations.forEach((animation) => {
      if (animation && !animation.completed) {
        animation.pause();
      }
    });
  }

  startAllAnimations() {
    this.animations.forEach((animation) => {
      if (animation && !animation.completed) {
        animation.play();
      }
    });
  }
}
