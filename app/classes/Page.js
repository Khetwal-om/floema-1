import GSAP from 'gsap'
import NormalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import each from 'lodash/each'

export default class Page {
  constructor ({
    element,
    elements,
    id
  }) {
    this.selector = element
    this.selectorChildren = {
      ...elements
    }
    this.id = id

    this.transformPrefix = Prefix('transform')

    this.onMouseWheel = this.onMouseWheel.bind(this)
  }

  create () {
    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0
    }

    if (this.selector instanceof window.HTMLElement) {
      this.element = this.selector;
    } else {
      this.element = document.querySelector(this.selector);
    }
    this.elements = {}

    each(this.selectorChildren, (entry, key) => {
      if (entry instanceof window.HTMLElement || entry instanceof window.NodeList || Array.isArray(entry)) {
        this.elements[key] = entry
      } else {
        this.elements[key] = document.querySelectorAll(entry)

        if (this.elements[key].length === 0) {
          this.elements[key] = null
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry)
        }
      }
    })
  }

  show () {
    return new Promise(resolve => {
      this.animationIn = GSAP.timeline()
      GSAP.fromTo(this.element, {
        autoAlpha: 0
      }, {
        autoAlpha: 1
      })
      this.animationIn.call(_ => {
        this.addEventListeners()
        resolve()
      })
    })
  }

  hide () {
    this.removeEventListeners()
    this.animationOut = GSAP.timeline()
    return new Promise(resolve => {
      GSAP.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve
      })
    })
  }


  update () {
    this.scroll.target = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.target);
    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.1)
    if (this.scroll.current < 0.01) {
      this.scroll.current = 0
    }
    if(this.elements.wrapper){
      this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`
    }
  }

  onResize() {
    this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight;
    //each(this.animations, (animation) => animation.onResize());
  }

  onMouseWheel (event) {
    const { deltaY } = event
    this.scroll.target += deltaY
  }

  addEventListeners () {
    window.addEventListener('mousewheel', this.onMouseWheel)
  }

  removeEventListeners () {
    window.removeEventListener('mousewheel', this.onMouseWheel)
  }
}
