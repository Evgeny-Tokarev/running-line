import anime from 'animejs/lib/anime';

export default  class RunningLine {
  constructor(duration, rightDirection, hoverStop, allocate) {
    this.initialWidth = 0
    this.animations = []
    this.wrapper = null
    this.list = null
    this.observer = null
    this.duration = duration || 5000
    this.overlay = null
    this.wrapperWidth = 0
    this.wrapperHeight = 0
    this.listWidth = 0
    this.runningElements = []
    this.current = 0
    this.rightDirection = rightDirection || false
    this.hoverStop = hoverStop || false
    this.allocate = allocate || false
  }

  runLine(selector) {
    try {
      this.overlay = document.querySelector(selector)
      this.wrapper = this.overlay.firstElementChild
      this.list = this.wrapper.firstElementChild
      this.runningElements = Array.from(this.list.children)
    } catch (er) {
      console.error(er)
      return
    }
    this.makeRunningElementsFoolWidth()
    this.wrapperWidth = this.overlay.getBoundingClientRect().width
    this.wrapperHeight = this.overlay.getBoundingClientRect().height
    this.initialWidth = this.wrapperWidth
    this.maxItemWidth = this.getMaxTargetWidth()
    this.setItemsStyleProperties()
    this.moveItemsToStartPosition()
    if (
      this.wrapperWidth > this.listWidth - this.maxItemWidth &&
      this.allocate
    ) {
      this.fixGap()
    }
    this.current = !this.rightDirection
      ? this.runningElements.length - 1
      : 0
    this.observer = new IntersectionObserver(
      this.intersectionHandler.bind(this),
      {
        root: this.wrapper,
        rootMargin: "0px",
        threshold: [1]
      }
    )
    this.runningElements.forEach((runningElement) => {
      this.observer.observe(runningElement)
    })
    if (this.hoverStop) this.setHoverListeners()

    let resizeTimer
    window.addEventListener("resize", () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      resizeTimer = setTimeout(() => {
        this.reset()
        this.runLine(selector)
      }, 500)
    })
    this.animate(this.runningElements[this.current])
  }

  setHoverListeners() {
    this.runningElements.forEach((runningElement) => {
      runningElement.addEventListener(
        "mouseover",
        this.stopAllAnimations.bind(this)
      )
      runningElement.addEventListener(
        "mouseout",
        this.startAllAnimations.bind(this)
      )
    })
  }

  makeRunningElementsFoolWidth() {
    this.list.style.setProperty("display", "flex")
    this.runningElements.forEach((runningElement) => {
      runningElement.style.setProperty("flex", "1 0 auto")
    })
  }

  reset() {
    this.runningElements.forEach((runningElement) => {
      runningElement.removeEventListener(
        "mouseover",
        this.stopAllAnimations.bind(this)
      )
      runningElement.removeEventListener(
        "mouseout",
        this.startAllAnimations.bind(this)
      )
      if (this.observer) {
        this.observer.unobserve(runningElement)
      }
    })
    this.animations.forEach((animation) => {
      if (animation) {
        anime.set(animation.animatables[0].target, {
          translateX: 0
        })
        animation.remove(animation.animatables[0].target)
      }
    })
    this.overlay.style.removeProperty("width")
    this.wrapper.style.removeProperty("width")
    this.animations = []
    this.wrapper = null
    this.list = null
    this.observer = null
    this.wrapperWidth = 0
    this.wrapperHeight = 0
    this.listWidth = 0
    this.runningElements = []
    this.current = 0
  }

  createOverlay() {
    this.overlay.style.setProperty("width", `${this.wrapperWidth}px`)
    this.wrapper.style.setProperty("width", `${this.maxItemWidth + 5}px`)
    this.overlay.style.setProperty("overflow", "hidden")
    this.wrapperWidth = this.wrapper.getBoundingClientRect().width
  }

  setItemsStyleProperties() {
    if (this.maxItemWidth > this.wrapperWidth) {
      this.createOverlay()
    } else {
      this.wrapper.style.setProperty("overflow", "hidden")
    }
    this.list.style.setProperty("position", "relative")
    this.list.style.setProperty("height", `${this.wrapperHeight}px`)
    this.list.style.setProperty("margin", "0")
    this.list.style.setProperty("padding", "0")
    this.listWidth = this.runningElements.reduce(
      (sum, el) => sum + el.getBoundingClientRect().width,
      0
    )
    this.runningElements.forEach((el) => {
      el.style.setProperty("position", "absolute")
    })
    this.list.style.setProperty("width", `${this.listWidth}px`)
  }

  fixGap() {
    const fixWidth =
      (this.wrapperWidth - this.listWidth + this.maxItemWidth) /
      (2 * (this.runningElements.length - 1))
    this.runningElements.forEach((runningElement) => {
      const oldLeftpadding = +window
        .getComputedStyle(runningElement)
        .getPropertyValue("padding-left")
        .replace(/\w+/, "")
      const oldRightpadding = +window
        .getComputedStyle(runningElement)
        .getPropertyValue("padding-right")
        .replace(/\w+/, "")
      runningElement.style.setProperty(
        "padding-right",
        `${oldRightpadding + fixWidth}px`
      )
      runningElement.style.setProperty(
        "padding-left",
        `${oldLeftpadding + fixWidth}px`
      )
    })
  }

  moveItemsToStartPosition() {
    if (this.rightDirection) {
      this.list.style.setProperty("right", `${-this.wrapperWidth}px`)
    } else {
      this.list.style.setProperty("left", `${-this.listWidth}px`)
      this.runningElements.forEach((runningElement) => {
        runningElement.style.setProperty("right", "0")
      })
    }
  }

  intersectionHandler(entries) {
    entries.forEach((entry) => {
      if (entry && entry.isIntersecting) {
        if (!this.rightDirection) {
          this.current =
            this.current > 0
              ? this.current - 1
              : this.runningElements.length - 1
        } else {
          this.current =
            this.current < this.runningElements.length - 1
              ? this.current + 1
              : 0
        }
        if (!this.animations[this.current]) {
          this.animate(this.runningElements[this.current])
        } else if (this.animations[this.current].completed) {
          this.animations[this.current].restart()
        } else {
          this.animations[this.current].finished.then(
            () => {
              this.animations[this.current].restart()
            },
            (reason) => {
              console.error(reason)
            }
          )
        }
      }
    })
  }

  animate(runningElement) {
    let { width } = this.getWidthAndDuration()
    const { duration } = this.getWidthAndDuration()
    width = !this.rightDirection ? width : -width
    this.animations[this.current] = anime({
      targets: runningElement,
      easing: "linear",
      loop: 0,
      keyframes: [
        { translateX: width, duration },
        { translateX: 0, duration: 0 }
      ]
    })
  }

  getMaxTargetWidth() {
    return this.runningElements.reduce(
      (max, el) =>
        max < el.getBoundingClientRect().width
          ? el.getBoundingClientRect().width
          : max,
      0
    )
  }

  getCurrentWidth() {
    return this.runningElements[this.current].getBoundingClientRect()
      .width
  }

  getWidthAndDuration() {
    const wid = this.wrapperWidth + this.getCurrentWidth()
    return {
      width: wid,
      duration: (wid * this.duration) / this.listWidth
    }
  }

  stopAllAnimations() {
    this.animations.forEach((animation) => {
      if (animation && !animation.completed) {
        animation.pause()
      }
    })
  }

  startAllAnimations() {
    this.animations.forEach((animation) => {
      if (animation && !animation.completed) {
        animation.play()
      }
    })
  }
}