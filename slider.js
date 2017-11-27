import { debounce } from 'lodash';

class Slider {
    constructor({
        el,
        onSlide,
        startIndex,
    }) {
        this.active = startIndex || 0;
        this.onSlide = onSlide

        this.carousel = el;
        this.sections = el.children;

        this.carouselClass = 'carousel';
        this.carouselItemClass = 'carousel-item';
        this.carouselActiveClass = 'carousel-item-active';
        this.carouselPreviewClass = 'carousel-item-prev';
        this.carouselNextClass = 'carousel-item-next';

        this._init();
    }

    _init() {
        this.carousel.classList.add(this.carouselClass);

        Array.map(
            this.sections,
            section => section.classList.add(this.carouselItemClass),
        );

        this._setActiveItem(this.active);
        this._listenClick();
        this._listenScroll();
        this._listenTouch();
    }

    _removeSectionsClasses() {
        Array.map(
            this.sections,
            (section) => {
                section.classList.remove(this.carouselActiveClass);
                section.classList.remove(this.carouselPreviewClass);
                section.classList.remove(this.carouselNextClass);
            },
        );
    }

    _setActiveItem(index) {
        this.active = index;
        const activeSection = this.sections[index];
        const prevSection = this.sections[index - 1];
        const nextSection = this.sections[index + 1];

        this._removeSectionsClasses();

        if (activeSection) {
            activeSection.classList.add(this.carouselActiveClass)
        }

        if (prevSection) {
            prevSection.classList.add(this.carouselPreviewClass)
        }

        if (nextSection) {
            nextSection.classList.add(this.carouselNextClass)
        }
    }

    _onSlide() {
        if (this.onSlide) {
            this.onSlide(this.active);
        }
    }

    _listenClick() {
        Array.map(
            this.sections,
            (section, index) => section.addEventListener('click', this.to.bind(this, index)),
        );
    }

    _unlistenClick() {
        Array.map(
            this.sections,
            (section, index) => section.removeEventListener('click', this.to.bind(this, index)),
        );
    }

    _listenScroll() {
        this.carousel.addEventListener('wheel', this._scrollHandler);
    }

    _unlistenScroll() {
        this.carousel.removeEventListener('wheel', this._scrollHandler);
    }

    _scrollHandler = (e) => {
        const isLast = this.active + 1 >= this.sections.length;
        const isFirst = this.active <= 0;

        if (
            (e.deltaY > 0 && !isLast) ||
            (e.deltaY < 0 && !isFirst)
        ) {
            e.preventDefault();
        }

        this._handleSlideOnScroll(e);
    }

    _handleSlideOnScroll = debounce(
        (e) => {
            if (e.deltaY > 0) {
                this.next();
            } else if (e.deltaY < 0) {
                this.prev();
            }
        },
        45,
        {
            leading: true,
            trailing: false,
        },
    )

    _listenTouch() {
        this.carousel.addEventListener('touchstart', this._touchStartHandler.bind(this));
        this.carousel.addEventListener('touchmove', this._touchMoveHandler.bind(this));
        this.carousel.addEventListener('touchend', this._touchEndHandler.bind(this));
    }

    _unlistenTouch() {
        this.carousel.removeEventListener('touchstart', this._touchStartHandler);
        this.carousel.removeEventListener('touchmove', this._touchMoveHandler);
        this.carousel.removeEventListener('touchend', this._touchEndHandler);
    }

    _touchStartHandler(e) {
        this.touchStart = e.changedTouches[0];
    }

    _touchMoveHandler(e) {
        e.preventDefault();

        const isLast = this.active + 1 >= this.sections.length;
        const isFirst = this.active <= 0;

        // TODO: MAKE TOUCHES PREVENT SCROLL AT SLIDER OFFSET
        if (
            (this.touchStart.pageY < e.changedTouches[0].pageY && !isLast) ||
            (this.touchStart.pageY > e.changedTouches[0].pageY && !isFirst)
        ) {
            e.preventDefault();
        }
    }

    _touchEndHandler(e) {
        this.touchEnd = e.changedTouches[0];

        if (this.touchStart.pageY > this.touchEnd.pageY) {
            this.next();
        } else if (this.touchStart.pageY < this.touchEnd.pageY) {
            this.prev();
        }
    }

    next() {
        if (this.active + 1 >= this.sections.length) {
            return;
        }

        this.active += 1;
        this._setActiveItem(this.active);
        this._onSlide();
    }

    prev() {
        if (this.active <= 0) {
            return;
        }

        this.active -= 1;
        this._setActiveItem(this.active);
        this._onSlide();
    }

    to(index) {
        if (index === this.active) {
            return;
        }

        this._setActiveItem(index);
        this._onSlide();
    }

    destroy() {
        this.carousel.classList.remove(this.carouselClass);
        this._removeSectionsClasses();

        this._unlistenClick();
        this._unlistenScroll();
        this._unlistenTouch();
    }

}

export default Slider;
