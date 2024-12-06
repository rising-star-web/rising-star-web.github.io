'use strict';
var theme = {
  /**
   * Theme's components/functions list
   * Comment out or delete the unnecessary component.
   * Some components have dependencies (plugins).
   * Do not forget to remove dependency from src/js/vendor/ and recompile.
   */
  init: function () {
    theme.stickyHeader();
    theme.subMenu();
    theme.offCanvas();
    theme.isotope();
    theme.onepageHeaderOffset();
    theme.spyScroll();
    theme.anchorSmoothScroll();
    theme.svgInject();
    theme.backgroundImage();
    theme.backgroundImageMobile();
    theme.imageHoverOverlay();
    theme.rellax();
    theme.scrollCue();
    theme.swiperSlider();
    theme.lightbox();
    theme.plyr();
    theme.progressBar();
    theme.loader();
    theme.pageProgress();
    theme.counterUp();
    theme.bsTooltips();
    theme.bsPopovers();
    theme.bsModal();
    theme.iTooltip();
    theme.forms();
    theme.passVisibility();
    theme.pricingSwitcher();
    theme.textRotator();
    theme.codeSnippet();
  },
  /**
   * Sticky Header
   * Enables sticky behavior on navbar on page scroll
   * Requires assets/js/vendor/headhesive.min.js
  */
  stickyHeader: () => {
    var navbar = document.querySelector(".navbar");
    if (navbar == null) return;
    var options = {
      offset: 100,
      offsetSide: 'top',
      classes: {
        clone: 'navbar-clone fixed',
        stick: 'navbar-stick',
        unstick: 'navbar-unstick',
      },
      onStick: function() {
        var navbarClonedClass = this.clonedElem.classList;
        if (navbarClonedClass.contains('transparent') && navbarClonedClass.contains('navbar-dark')) {
          this.clonedElem.className = this.clonedElem.className.replace("navbar-dark","navbar-light");
        }
      },
    };
    var banner = new Headhesive('.navbar', options);
  },
  /**
   * Sub Menus
   * Enables multilevel dropdown
   */
  subMenu: () => {
    (function($bs) {
      const CLASS_NAME = 'has-child-dropdown-show';
      $bs.Dropdown.prototype.toggle = function(_original) {
          return function() {
              document.querySelectorAll('.' + CLASS_NAME).forEach(function(e) {
                  e.classList.remove(CLASS_NAME);
              });
              let dd = this._element.closest('.dropdown').parentNode.closest('.dropdown');
              for (; dd && dd !== document; dd = dd.parentNode.closest('.dropdown')) {
                  dd.classList.add(CLASS_NAME);
              }
              return _original.call(this);
          }
      }($bs.Dropdown.prototype.toggle);
      document.querySelectorAll('.dropdown').forEach(function(dd) {
          dd.addEventListener('hide.bs.dropdown', function(e) {
              if (this.classList.contains(CLASS_NAME)) {
                  this.classList.remove(CLASS_NAME);
                  e.preventDefault();
              }
              e.stopPropagation();
          });
      });
    })(bootstrap);
  },
  /**
   * Offcanvas
   * Enables offcanvas-nav, closes offcanvas on anchor clicks, focuses on input in search offcanvas
   */
  offCanvas: () => {
    var navbar = document.querySelector(".navbar");
    if (navbar == null) return;
    const navOffCanvasBtn = document.querySelectorAll(".offcanvas-nav-btn");
    const navOffCanvas = document.querySelector('.navbar:not(.navbar-clone) .offcanvas-nav');
    const bsOffCanvas = new bootstrap.Offcanvas(navOffCanvas, {scroll: true});
    const scrollLink = document.querySelectorAll('.onepage .navbar li a.scroll');
    const searchOffcanvas = document.getElementById('offcanvas-search');
    navOffCanvasBtn.forEach(e => {
      e.addEventListener('click', event => {
        bsOffCanvas.show();
      })
    });
    scrollLink.forEach(e => {
      e.addEventListener('click', event => {
        bsOffCanvas.hide();
      })
    });
    if(searchOffcanvas != null) {
      searchOffcanvas.addEventListener('shown.bs.offcanvas', function () {
        document.getElementById("search-form").focus();
      });
    }
  },
  /**
   * Isotope
   * Enables isotope grid layout and filtering
   * Requires assets/js/vendor/isotope.pkgd.min.js
   * Requires assets/js/vendor/imagesloaded.pkgd.min.js
   */
  isotope: () => {
    var grids = document.querySelectorAll('.grid');
    if(grids != null) {
      grids.forEach(g => {
        var grid = g.querySelector('.isotope');
        if (grid) {
          var filtersElem = g.querySelector('.isotope-filter');
          var buttonGroups = g.querySelectorAll('.isotope-filter');
          var iso = new Isotope(grid, {
            itemSelector: '.item',
            layoutMode: 'masonry',
            masonry: {
              columnWidth: grid.offsetWidth / 12
            },
            percentPosition: true,
            transitionDuration: '0.7s'
          });
          imagesLoaded(grid).on("progress", function() {
            iso.layout({
              masonry: {
                columnWidth: grid.offsetWidth / 12
              }
            })
          }),
          // Adjust layout on resize
          window.addEventListener("resize", function() {
            iso.arrange({
              masonry: {
                columnWidth: grid.offsetWidth / 12
              }
            });
          }, true);


        }

        if(filtersElem != null) {
          filtersElem.addEventListener('click', function(event) {
            if(!matchesSelector(event.target, '.filter-item')) {
              return;
            }
            var filterValue = event.target.getAttribute('data-filter');
            iso.arrange({
              filter: filterValue
            });
          });
          for(var i = 0, len = buttonGroups.length; i < len; i++) {
            var buttonGroup = buttonGroups[i];
            buttonGroup.addEventListener('click', function(event) {
              if(!matchesSelector(event.target, '.filter-item')) {
                return;
              }
              buttonGroup.querySelector('.active').classList.remove('active');
              event.target.classList.add('active');
            });
          }
        }
      });
    }
  },
  /**
   * Onepage Header Offset
   * Adds an offset value to anchor point equal to sticky header height on a onepage
   */
  onepageHeaderOffset: () => {
    var navbar = document.querySelector(".navbar");
    if (navbar == null) return;
    const header_height = document.querySelector(".navbar").offsetHeight;
    const shrinked_header_height = 75;
    const sections = document.querySelectorAll(".onepage section");
    sections.forEach(section => {
      section.style.paddingTop = shrinked_header_height + 'px';
      section.style.marginTop = '-' + shrinked_header_height + 'px';
    });
    const first_section = document.querySelector(".onepage section:first-of-type");
    if(first_section != null) {
      first_section.style.paddingTop = header_height + 'px';
      first_section.style.marginTop = '-' + header_height + 'px';
    }
  },
  /**
   * Spy Scroll
   * Highlights the active nav link while scrolling through sections
   */
  spyScroll: () => {
    let section = document.querySelectorAll('section[id]');
    let navLinks = document.querySelectorAll('.scroll');
    window.onscroll = () => {
      section.forEach(sec => {
        let top = window.scrollY; //returns the number of pixels that the document is currently scrolled vertically.
        let offset = sec.offsetTop - 0; //returns the distance of the outer border of the current element relative to the inner border of the top of the offsetParent, the closest positioned ancestor element
        let height = sec.offsetHeight; //returns the height of an element, including vertical padding and borders, as an integer
        let id = sec.getAttribute('id'); //gets the value of an attribute of an element
        if (top >= offset && top < offset + height) {
          navLinks.forEach(links => {
            links.classList.remove('active');
            document.querySelector(`a.scroll[href*=${id}]`).classList.add('active');
            //[att*=val] Represents an element with the att attribute whose value contains at least one instance of the substring "val". If "val" is the empty string then the selector does not represent anything.
          });
        }
      });
    }
  },
  /**
   * Anchor Smooth Scroll
   * Adds smooth scroll animation to links with .scroll class
   * Requires assets/js/vendor/smoothscroll.js
   */
  anchorSmoothScroll: () => {
    const links = document.querySelectorAll(".scroll");
    for(const link of links) {
      link.addEventListener("click", clickHandler);
    }
    function clickHandler(e) {
      e.preventDefault();
      this.blur();
      const href = this.getAttribute("href");
      const offsetTop = document.querySelector(href).offsetTop;
      scroll({
        top: offsetTop,
        behavior: "smooth"
      });
    }
  },
  /**
   * SVGInject
   * Replaces an img element with an inline SVG so you can apply colors to your SVGs
   * Requires assets/js/vendor/svg-inject.min.js
   */
  svgInject: () => {
    SVGInject.setOptions({
      onFail: function(img, svg) {
        img.classList.remove('svg-inject');
      }
    });
    document.addEventListener('DOMContentLoaded', function() {
      SVGInject(document.querySelectorAll('img.svg-inject'), {
        useCache: true
      });
    });
  },
  /**
   * Background Image
   * Adds a background image link via data attribute "data-image-src"
   */
  backgroundImage: () => {
    var bg = document.querySelectorAll(".bg-image");
    for(var i = 0; i < bg.length; i++) {
      var url = bg[i].getAttribute('data-image-src');
      bg[i].style.backgroundImage = "url('" + url + "')";
    }
  },
  /**
   * Background Image Mobile
   * Adds .mobile class to background images on mobile devices for styling purposes
   */
  backgroundImageMobile: () => {
    var isMobile = (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i)) ? true : false;
    if(isMobile) {
      document.querySelectorAll(".image-wrapper").forEach(e => {
        e.classList.add("mobile")
      })
    }
  },
  /**
   * Image Hover Overlay
   * Adds span.bg inside .overlay for simpler markup and styling purposes
   */
  imageHoverOverlay: () => {
    var overlay = document.querySelectorAll('.overlay > a, .overlay > span');
    for(var i = 0; i < overlay.length; i++) {
      var overlay_bg = document.createElement('span');
      overlay_bg.className = "bg";
      overlay[i].appendChild(overlay_bg);
    }
  },
  /**
   * Rellax.js
   * Adds parallax animation to shapes and elements
   * Requires assets/js/vendor/rellax.min.js
   */
  rellax: () => {
    if(document.querySelector(".rellax") != null) {
      window.onload = function() {
        var rellax = new Rellax('.rellax', {
          speed: 2,
          center: true,
          breakpoints: [576, 992, 1201]
        });
        var projects_overflow = document.querySelectorAll('.projects-overflow');
        imagesLoaded(projects_overflow, function() {
          rellax.refresh();
        });
      }
    }
  },
  /**
   * scrollCue.js
   * Enables showing elements by scrolling
   * Requires assets/js/vendor/scrollCue.min.js
   */
  scrollCue: () => {
    scrollCue.init({
      interval: -400,
      duration: 700,
      percentage: 0.8
    });
    scrollCue.update();
  },
  /**
   * Swiper Slider
   * Enables carousels and sliders
   * Requires assets/js/vendor/swiper-bundle.min.js
   */
  swiperSlider: function() {
    var carousel = document.querySelectorAll('.swiper-container');
    for(var i = 0; i < carousel.length; i++) {
      var slider1 = carousel[i];
      slider1.classList.add('swiper-container-' + i);
      var controls = document.createElement('div');
      controls.className = "swiper-controls";
      var pagi = document.createElement('div');
      pagi.className = "swiper-pagination";
      var navi = document.createElement('div');
      navi.className = "swiper-navigation";
      var prev = document.createElement('div');
      prev.className = "swiper-button swiper-button-prev";
      var next = document.createElement('div');
      next.className = "swiper-button swiper-button-next";
      slider1.appendChild(controls);
      controls.appendChild(navi);
      navi.appendChild(prev);
      navi.appendChild(next);
      controls.appendChild(pagi);
      var sliderEffect = slider1.getAttribute('data-effect') ? slider1.getAttribute('data-effect') : 'slide';
      if (slider1.getAttribute('data-items-auto') === 'true') {
        var slidesPerViewInit = "auto";
        var breakpointsInit = null;
      } else {
        var sliderItems = slider1.getAttribute('data-items') ? slider1.getAttribute('data-items') : 3; // items in all devices
        var sliderItemsXs = slider1.getAttribute('data-items-xs') ? slider1.getAttribute('data-items-xs') : 1; // start - 575
        var sliderItemsSm = slider1.getAttribute('data-items-sm') ? slider1.getAttribute('data-items-sm') : Number(sliderItemsXs); // 576 - 767
        var sliderItemsMd = slider1.getAttribute('data-items-md') ? slider1.getAttribute('data-items-md') : Number(sliderItemsSm); // 768 - 991
        var sliderItemsLg = slider1.getAttribute('data-items-lg') ? slider1.getAttribute('data-items-lg') : Number(sliderItemsMd); // 992 - 1199
        var sliderItemsXl = slider1.getAttribute('data-items-xl') ? slider1.getAttribute('data-items-xl') : Number(sliderItemsLg); // 1200 - end
        var sliderItemsXxl = slider1.getAttribute('data-items-xxl') ? slider1.getAttribute('data-items-xxl') : Number(sliderItemsXl); // 1500 - end
        var slidesPerViewInit = sliderItems;
        var breakpointsInit = {
          0: {
            slidesPerView: Number(sliderItemsXs)
          },
          576: {
            slidesPerView: Number(sliderItemsSm)
          },
          768: {
            slidesPerView: Number(sliderItemsMd)
          },
          992: {
            slidesPerView: Number(sliderItemsLg)
          },
          1200: {
            slidesPerView: Number(sliderItemsXl)
          },
          1400: {
            slidesPerView: Number(sliderItemsXxl)
          }
        }
      }
      var sliderSpeed = slider1.getAttribute('data-speed') ? slider1.getAttribute('data-speed') : 500;
      var sliderAutoPlay = slider1.getAttribute('data-autoplay') !== 'false';
      var sliderAutoPlayTime = slider1.getAttribute('data-autoplaytime') ? slider1.getAttribute('data-autoplaytime') : 5000;
      var sliderAutoHeight = slider1.getAttribute('data-autoheight') === 'true';
      var sliderMargin = slider1.getAttribute('data-margin') ? slider1.getAttribute('data-margin') : 30;
      var sliderLoop = slider1.getAttribute('data-loop') === 'true';
      var sliderCentered = slider1.getAttribute('data-centered') === 'true';
      var swiper = slider1.querySelector('.swiper:not(.swiper-thumbs)');
      var swiperTh = slider1.querySelector('.swiper-thumbs');
      var sliderTh = new Swiper(swiperTh, {
        slidesPerView: 5,
        spaceBetween: 10,
        loop: false,
        threshold: 2,
        slideToClickedSlide: true
      });
      if (slider1.getAttribute('data-thumbs') === 'true') {
        var thumbsInit = sliderTh;
        var swiperMain = document.createElement('div');
        swiperMain.className = "swiper-main";
        swiper.parentNode.insertBefore(swiperMain, swiper);
        swiperMain.appendChild(swiper);
        slider1.removeChild(controls);
        swiperMain.appendChild(controls);
      } else {
        var thumbsInit = null;
      }
      var slider = new Swiper(swiper, {
        on: {
          beforeInit: function() {
            if(slider1.getAttribute('data-nav') !== 'true' && slider1.getAttribute('data-dots') !== 'true') {
              controls.remove();
            }
            if(slider1.getAttribute('data-dots') !== 'true') {
              pagi.remove();
            }
            if(slider1.getAttribute('data-nav') !== 'true') {
              navi.remove();
            }
          },
          init: function() {
            if(slider1.getAttribute('data-autoplay') !== 'true') {
              this.autoplay.stop();
            }
            this.update();
          }
        },
        autoplay: {
          delay: sliderAutoPlayTime,
          disableOnInteraction: false
        },
        speed: parseInt(sliderSpeed),
        slidesPerView: slidesPerViewInit,
        loop: sliderLoop,
        centeredSlides: sliderCentered,
        spaceBetween: Number(sliderMargin),
        effect: sliderEffect,
        autoHeight: sliderAutoHeight,
        grabCursor: true,
        resizeObserver: false,
        breakpoints: breakpointsInit,
        pagination: {
          el: carousel[i].querySelector('.swiper-pagination'),
          clickable: true
        },
        navigation: {
          prevEl: slider1.querySelector('.swiper-button-prev'),
          nextEl: slider1.querySelector('.swiper-button-next'),
        },
        thumbs: {
          swiper: thumbsInit,
        },
      });
    }
  },
  /**
   * GLightbox
   * Enables lightbox functionality
   * Requires assets/js/vendor/glightbox.js
   */
  lightbox: () => {
    const lightbox = GLightbox({
      selector: '*[data-glightbox]',
      touchNavigation: true,
      loop: false,
      zoomable: false,
      autoplayVideos: true,
      moreLength: 0,
      slideExtraAttributes: {
        poster: ''
      },
      plyr: {
        css: '',
        js: '',
        config: {
          ratio: '',
          fullscreen: {
            enabled: false,
            iosNative: false
          },
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3
          },
          vimeo: {
            byline: false,
            portrait: false,
            title: false,
            transparent: false
          }
        }
      },
    });
  },
  /**
   * Plyr
   * Enables media player
   * Requires assets/js/vendor/plyr.js
   */
  plyr: () => {
    var players = Plyr.setup('.player', {
      loadSprite: true,
    });
  },
  /**
   * Progressbar
   * Enables animated progressbars
   * Requires assets/js/vendor/progressbar.min.js
   * Requires assets/js/vendor/noframework.waypoints.min.js
   */
  progressBar: () => {
    const pline = document.querySelectorAll(".progressbar.line");
    const pcircle = document.querySelectorAll(".progressbar.semi-circle");
    pline.forEach(e => {
      var line = new ProgressBar.Line(e, {
        strokeWidth: 6,
        trailWidth: 6,
        duration: 3000,
        easing: 'easeInOut',
        text: {
          style: {
            color: 'inherit',
            position: 'absolute',
            right: '0',
            top: '-30px',
            padding: 0,
            margin: 0,
            transform: null
          },
          autoStyleContainer: false
        },
        step: (state, line) => {
          line.setText(Math.round(line.value() * 100) + ' %');
        }
      });
      var value = e.getAttribute('data-value') / 100;
      new Waypoint({
        element: e,
        handler: function() {
          line.animate(value);
        },
        offset: 'bottom-in-view',
      })
    });
    pcircle.forEach(e => {
      var circle = new ProgressBar.SemiCircle(e, {
        strokeWidth: 6,
        trailWidth: 6,
        duration: 2000,
        easing: 'easeInOut',
        step: (state, circle) => {
          circle.setText(Math.round(circle.value() * 100));
        }
      });
      var value = e.getAttribute('data-value') / 100;
      new Waypoint({
        element: e,
        handler: function() {
          circle.animate(value);
        },
        offset: 'bottom-in-view',
      })
    });
  },
  /**
   * Loader
   * 
   */
  loader: () => {
    var preloader = document.querySelector('.page-loader');
    if(preloader != null) {
      document.body.onload = function(){
        setTimeout(function() {
          if( !preloader.classList.contains('done') )
          {
            preloader.classList.add('done');
          }
        }, 1000)
      }
    }
  },
  /**
   * Page Progress
   * Shows page progress on the bottom right corner of pages
   */
  pageProgress: () => {
    var progressWrap = document.querySelector('.progress-wrap');
    var freeTrial = document.querySelector('.free-trial-wrap');
    var freeTrialCN = document.querySelector('.free-trial-wrap-cn');

    if(freeTrial !=null){
      var offset = 50;
      window.addEventListener("scroll", function(event) {
        var scrollElementPos = document.body.scrollTop || document.documentElement.scrollTop;
        if(scrollElementPos >= offset) {
          freeTrial.classList.add("show-trial")
        } else {
          freeTrial.classList.remove("show-trial")
        }
      });
    }

    if(freeTrialCN !=null){
      var offset = 50;
      window.addEventListener("scroll", function(event) {
        var scrollElementPos = document.body.scrollTop || document.documentElement.scrollTop;
        if(scrollElementPos >= offset) {
          freeTrialCN.classList.add("show-trial")
        } else {
          freeTrialCN.classList.remove("show-trial")
        }
      });
    }

    if(progressWrap != null) {
      var progressPath = document.querySelector('.progress-wrap path');
      var pathLength = progressPath.getTotalLength();
      var offset = 50;
      progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
      progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
      window.addEventListener("scroll", function(event) {
        var scroll = document.body.scrollTop || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var progress = pathLength - (scroll * pathLength / height);
        progressPath.style.strokeDashoffset = progress;
        var scrollElementPos = document.body.scrollTop || document.documentElement.scrollTop;
        if(scrollElementPos >= offset) {
          progressWrap.classList.add("active-progress")
        } else {
          progressWrap.classList.remove("active-progress")
        }
      });
      progressWrap.addEventListener('click', function(e) {
        e.preventDefault();
        window.scroll({
          top: 0, 
          left: 0,
          behavior: 'smooth'
        });
      });
    }
  },
  /**
   * Counter Up
   * Counts up to a targeted number when the number becomes visible
   * Requires assets/js/vendor/counterup.min.js
   * Requires assets/js/vendor/noframework.waypoints.min.js
   */
  counterUp: () => {
    var counterUp = window.counterUp["default"];
    const counters = document.querySelectorAll(".counter");
    counters.forEach(el => {
      new Waypoint({
        element: el,
        handler: function() {
          counterUp(el, {
            duration: 1000,
            delay: 50
          })
          this.destroy()
        },
        offset: 'bottom-in-view',
      })
    });
  },
  /**
   * Bootstrap Tooltips
   * Enables Bootstrap tooltips
   * Requires Poppers library
   */
  bsTooltips: () => {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover'
      })
    });
    var tooltipTriggerWhite = [].slice.call(document.querySelectorAll('[data-bs-toggle="white-tooltip"]'))
    var tooltipWhite = tooltipTriggerWhite.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        customClass: 'white-tooltip',
        trigger: 'hover',
        placement: 'left'
      })
    })
  },
  /**
   * Bootstrap Popovers
   * Enables Bootstrap popovers
   * Requires Poppers library
   */
  bsPopovers: () => {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl)
    })
  },
  /**
   * Bootstrap Modal
   * Enables Bootstrap modal popup
   */
  bsModal: () => {
    if(document.querySelector(".modal-popup") != null) {
      var myModalPopup = new bootstrap.Modal(document.querySelector('.modal-popup'));
      setTimeout(function() {
        myModalPopup.show();
      }, 200);
    }
    // Fixes jumping of page progress caused by modal
    var innerWidth = window.innerWidth;
    var clientWidth = document.body.clientWidth;
    var scrollSize = innerWidth - clientWidth;
    var myModalEl = document.querySelectorAll('.modal');
    var navbarFixed = document.querySelector('.navbar.fixed');
    var pageProgress = document.querySelector('.progress-wrap');
    function setPadding() {
      if(navbarFixed != null) {
        navbarFixed.style.paddingRight = scrollSize + 'px';
      }
      if(pageProgress != null) {
        pageProgress.style.marginRight = scrollSize + 'px';
      }
    }
    function removePadding() {
      if(navbarFixed != null) {
        navbarFixed.style.paddingRight = '';
      }
      if(pageProgress != null) {
        pageProgress.style.marginRight = '';
      }
    }
    myModalEl.forEach(myModalEl => {
      myModalEl.addEventListener('show.bs.modal', function(e) {
        setPadding();
      })
      myModalEl.addEventListener('hidden.bs.modal', function(e) {
        removePadding();
      })
    });
  },
  /**
   * iTooltip
   * Enables custom tooltip style for image hover docs/elements/hover.html
   * Requires assets/js/vendor/itooltip.min.js
   */
  iTooltip: () => {
    var tooltip = new iTooltip('.itooltip')
    tooltip.init({
      className: 'itooltip-inner',
      indentX: 15,
      indentY: 15,
      positionX: 'right',
      positionY: 'bottom'
    })
  },
  /**
   * Form Validation and Contact Form submit
   * Bootstrap validation - Only sends messages if form has class ".contact-form" and is validated and shows success/fail messages
   */
  forms: () => {
    (function() {
      function calculateProcessingFee(monthlyPrice) {
        const processingFeePercent = 3.5;
        const processingFee = (monthlyPrice * (processingFeePercent / 100)).toFixed(2);
        const totalAmount = (parseFloat(monthlyPrice) + parseFloat(processingFee)).toFixed(2);
        
        return {
          proratedAmount: parseFloat(totalAmount), 
          processingFee: parseFloat(processingFee),
          monthlyPrice: parseFloat(monthlyPrice),
          processingFeePercent,
          daysRemaining: null, 
          nextBillingDate: new Date(),
          type: 'processing_fee'
        };
      }

      "use strict";
      window.addEventListener("load", function() {
        var forms = document.querySelectorAll(".needs-validation");
        var inputRecaptcha = document.querySelector("input[data-recaptcha]"); 
        window.verifyRecaptchaCallback = function (response) {
          inputRecaptcha.value = response; 
          inputRecaptcha.dispatchEvent(new Event("change"));
        }
        window.expiredRecaptchaCallback = function () {
          var inputRecaptcha = document.querySelector("input[data-recaptcha]"); 
          inputRecaptcha.value = ""; 
          inputRecaptcha.dispatchEvent(new Event("change"));
        }
        var validation = Array.prototype.filter.call(forms, function(form) {
          form.addEventListener("submit", function(event) {
            if(form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add("was-validated");
            if(form.checkValidity() === true) {
              event.preventDefault();
              form.classList.remove("was-validated");
              // Send message only if the form has class .contact-form
              var isContactForm = form.classList.contains('contact-form');
              if(isContactForm) {
                var alertClass = 'alert-danger';
                $('#form *').css("pointer-events","none");
                $('#form *').fadeOut(500);
                $('#formSpinner').css("display", "block");

                const name = document.getElementById('studentName').value;
                const email = document.getElementById('emailAddress').value;
                const phone = document.getElementById('phoneNumber').value;
                const grade = document.getElementById('studentGrade').value;
                const experienceField = document.getElementById('experience');
                const experience = experienceField.options[experienceField.selectedIndex].id;
                const campusField = document.getElementById('campus');
                const campusLocation = campusField.options[campusField.selectedIndex].id;
                const referralField = document.getElementById('referral');
                const referral = referralField.options[referralField.selectedIndex].id;
                function formatDateTimeSelections() {
                  const dateTimeSelections = document.getElementById('dateTimeSelections');
                  const selections = dateTimeSelections.querySelectorAll('.date-time-selection');
                  return Array.from(selections)
                    .map(selection => {
                      const dateInput = selection.querySelector('input[type="date"]');
                      const hourSelect = selection.querySelector('.hour-select');
                      const minuteSelect = selection.querySelector('.minute-select');
                      if (dateInput.value && hourSelect.value && minuteSelect.value) {
                        const time = `${hourSelect.value}:${minuteSelect.value}`;
                        return `${dateInput.value} at ${time}`;
                      }
                      return null;
                    })
                    .filter(Boolean)
                    .join('; ');
                }

                  // Set availability based on location
                  const availability = (campusLocation === 'San-diego' || campusLocation === 'Seattle') 
                    ? formatDateTimeSelections()
                    : document.getElementById('availability').value;

                  let publicComment = '';

                  if (campusLocation === 'San-diego' || campusLocation === 'Online-sd') {
                    const classType = document.getElementById('classType').value;
                    if (classType === 'group') {
                      const className = document.getElementById('className').value;
                      const classSchedule = document.getElementById('classSchedule').value;
                      publicComment = `Group Class - ${className} (${classSchedule})`;
                    } else {
                      publicComment = 'Private';
                    }
    
                    // Store the form data for SD campus and redirect
                    const formData = {
                      accountData: {
                        email2: email,
                        phone2: phone,
                        username: (name.replace(' ','')).toLowerCase() + Math.floor(Math.random()*(999-100+1)+100),
                        firstName: name.split(' ')[0],
                        lastName: name.split(' ')[1] ? name.split(' ')[1] : ' ',
                        password: '123',
                        dateOfBirth: new Date(),
                        grade: grade,
                        referralName: referral,
                        preferedLanguage: 'English'
                      },
                      trialData: {
                        codingExperience: experience,
                        availability: availability,
                        comment: "",
                        location: campusLocation,
                        signupTime: new Date(),
                        organizationId: '66bf6a0dcdae5300148e3a2c',
                        publicComment: publicComment
                      }
                    };
    
                    localStorage.setItem('pendingRegistration', JSON.stringify(formData));
                    const pricingDetails = {
                      priceId: 'prod_QvBBSMzCIqf4YS', //SD Trial class product ID
                      planName: 'SD Trial Class',
                      amount: 2900, 
                      proration: calculateProcessingFee(29.00),
                      locationType: 'sandiego',
                      calculationType: 'processing_fee'
                    };
                    localStorage.setItem('pricingDetails', JSON.stringify(pricingDetails));
                    // Store recaptcha response
                    if (inputRecaptcha && inputRecaptcha.value) {
                      localStorage.setItem('recaptchaResponse', inputRecaptcha.value);
                    }
                    document.getElementById('formSpinner').style.display = "none";

                    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
                    confirmModal.show();

                    // Handle the confirmation button click
                    document.getElementById('confirmRedirect').addEventListener('click', function() {
                      Toastify({
                        text: "Redirecting to payment page...",
                        duration: 500,
                        gravity: "top",
                        position: 'right',
                        style: {
                          background: "green",
                        },
                        className: "info",
                      }).showToast();

                      confirmModal.hide();
                      window.location.href = "/sandiego/payment_details";
                    });
                    return;
                  }
                  
                // let baseUrl = 'http://localhost:3000/api/';
                let baseUrl = 'https://prod-sharemyworks-backend.herokuapp.com/api/';
                let username = (name.replace(' ','')).toLowerCase() + Math.floor(Math.random()*(999-100+1)+100);
                let firstName = name.split(' ')[0];
                let lastName = name.split(' ')[1]? name.split(' ')[1]: ' ';

                let accountData = {
                  email2: email,
                  phone2: phone,
                  username: username,
                  firstName: firstName,
                  lastName: lastName,
                  password: '123',
                  dateOfBirth: new Date(),
                  grade: grade,
                  referralName: referral,
                  preferedLanguage: 'English'
                };
                // console.log('accountData: ', accountData);
                var formBody = [];
                for (var property in accountData) {
                  var encodedKey = encodeURIComponent(property);
                  var encodedValue = encodeURIComponent(accountData[property]);
                  formBody.push(encodedKey + "=" + encodedValue);
                }
                formBody = formBody.join("&");
                fetch(baseUrl+ `Account`, {
                  mode: "cors",
                  method: "post",
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                  },
                  body: formBody
                }).then(async function (response) {
                  let resp = await response.json();
                  let studentId = resp.id;

                  let trialData= {
                    codingExperience: experience,
                    availability: availability,
                    comment: "",
                    location: campusLocation,
                    signupTime: new Date(),
                    accountId: studentId,
                    publicComment: publicComment

                  }

                  if (!publicComment) {
                    delete trialData.publicComment;
                  }
                  // Assign organizationId based on campus location, in Prod env
                  if (campusLocation === 'Seattle') {
                    trialData.organizationId = '6684406b10707d0014fb7369';
                  } else if (campusLocation === 'San-diego' || campusLocation === 'Online-sd') {
                    trialData.organizationId = '66bf6a0dcdae5300148e3a2c';
                  }

                  // DEV env
                  // if (campusLocation === 'Seattle') {
                  //   trialData.organizationId = '66e83ed17eeda92766d31241';
                  // } else if (campusLocation === 'San-diego') {
                  //   trialData.organizationId = '6713eacd00dcfc85b65c206a';
                  // }

                  var formBody2 = [];
                  for (var property in trialData) {
                    var encodedKey = encodeURIComponent(property);
                    var encodedValue = encodeURIComponent(trialData[property]);
                    formBody2.push(encodedKey + "=" + encodedValue);
                  }
                  formBody2 = formBody2.join("&");
                  
                  fetch(baseUrl+ `TrialClasses`, {
                    mode: "cors",
                    method: "post",
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body: formBody2
                  }).then(async function (response) {
                    let resp2 = await response.json();
                    // console.log('trial created', resp2);
                    // console.log('trial created');
                    if (campusLocation === 'San-diego' || campusLocation === 'Online-sd') {
                      // if location is sandiego, set the sessionstorage of form Completed to true
                      localStorage.setItem('formCompleted', 'true');
                      $('#form').prepend(
                        window.location.href.indexOf("cn") != -1 ? 
                        '感谢您提交试课评估申请，我们的助理会尽快在第一时间联系您，确认试课细节。同时如果您有任何问题，请随时通过电话或者微信联系我们 (858) 588-7897 ':
                        'Your trial class request has been processed. We will contact you shortly. Meanwhile, feel free to reach out us by +1 (858) 588-7897 or CodingMindSD@gmail.com if you have any questions.'
                      );
                      $('#formSpinner').css("display", "none");
                      $('#QRCode').css("display", "none");
                      $('#QRCodeCN').css("display", "none");

                      window.location.href = '/sandiego/pricing';
                    } else {
                      $('#formSpinner').css("display", "none");
                      $('#formDescription').css("display", "none");
                      if (campusLocation === 'Seattle') {
                        $('#form').prepend(
                          window.location.href.indexOf("cn") != -1 ? 
                          '感谢您提交试课评估申请，我们的助理会尽快在第一时间联系您，确认试课细节。同时如果您有任何问题，请随时通过电话联系我们 (949) 236-7896':
                          'Your free trial request has been processed. We will contact you shortly. Meanwhile, feel free to reach out to us at (949) 236-7896 if you have any questions.'
                        );
                        $('#formSpinner').css("display", "none");

                      } else {
                        $('#form').prepend(
                          window.location.href.indexOf("cn") != -1 ? 
                          '感谢您提交试课评估申请，我们的助理会尽快在第一时间联系您，确认试课细节。同时如果您有任何问题，请随时通过电话或者微信联系我们 +1 (949) 236-7896':
                          'Your free trial request has been processed. We will contact you shortly. Meanwhile, feel free to reach out us by +1 (949) 236-7896 if you have any questions.'
                        );
                        $('#formSpinner').css("display", "none");
                        $('#QRCode').css("display", "flex");
                        $('#QRCodeCN').css("display", "none");

                      }
                      $('#formSpinner').css("display", "none");

 
                    }
                  }).catch(function err(err) {
                    $('#formSpinner').css("display", "none");
                    $('#form').prepend('An error has occurred. Please contact us at +1 (949) 236-7896 for help.');  
                    console.log(err)
                  })

                }).catch((err) => {
                  console.log(err);
                  $('#formSpinner').css("display", "none");
                  $('#form').prepend('An error has occurred. Please contact us at +1 (949) 236-7896 for help.');
                });
              }
            }
          }, false);
        });
      }, false);
    })();
  },
  /**
   * Password Visibility Toggle
   * Toggles password visibility in password input
   */
  passVisibility: () => {
    let pass = document.querySelectorAll('.password-field');
    for (let i = 0; i < pass.length; i++) {
      let passInput = pass[i].querySelector('.form-control');
      let passToggle = pass[i].querySelector('.password-toggle > i');
      passToggle.addEventListener('click', (e) => {
        if (passInput.type === "password") {
          passInput.type = "text";
          passToggle.classList.remove('uil-eye');
          passToggle.classList.add('uil-eye-slash');
        } else {
          passInput.type = "password";
          passToggle.classList.remove('uil-eye-slash'); 
          passToggle.classList.add('uil-eye');
        } 
      }, false);
    }
  },
  /**
   * Pricing Switcher
   * Enables monthly/yearly switcher seen on pricing tables
   */
  pricingSwitcher: () => {
    if(document.querySelector(".pricing-switchers") != null) {
      const wrapper = document.querySelectorAll(".pricing-wrapper");
      wrapper.forEach(wrap => {
        const switchers = wrap.querySelector(".pricing-switchers");
        const switcher = wrap.querySelectorAll(".pricing-switcher");
        const price = wrap.querySelectorAll(".price");
        switchers.addEventListener("click", (e) => {
          switcher.forEach(s => {
            s.classList.toggle("pricing-switcher-active");
          });
          price.forEach(p => {
            p.classList.remove("price-hidden");
            p.classList.toggle("price-show");
            p.classList.toggle("price-hide");
          });
        });
      });
    }
  },
  /**
   * ReplaceMe.js
   * Enables text rotator
   * Requires assets/js/vendor/replaceme.min.js
   */
  textRotator: () => {
    if(document.querySelector(".rotator-zoom") != null) {
      var replace = new ReplaceMe(document.querySelector('.rotator-zoom'), {
        animation: 'animate__animated animate__zoomIn',
        speed: 2500,
        separator: ',',
        clickChange: false,
        loopCount: 'infinite'
      });
    }
    if(document.querySelector(".rotator-fade") != null) {
      var replace = new ReplaceMe(document.querySelector('.rotator-fade'), {
        animation: 'animate__animated animate__fadeInDown',
        speed: 2500,
        separator: ',',
        clickChange: false,
        loopCount: 'infinite'
      });
    }
  },
  /**
   * Clipboard.js
   * Enables clipboard on docs
   * Requires assets/js/vendor/clipboard.min.js
   */
  codeSnippet: () => {
    var btnHtml = '<button type="button" class="btn btn-sm btn-white rounded-pill btn-clipboard">Copy</button>'
    document.querySelectorAll('.code-wrapper-inner').forEach(function(element) {
      element.insertAdjacentHTML('beforebegin', btnHtml)
    })
    var clipboard = new ClipboardJS('.btn-clipboard', {
      target: function(trigger) {
        return trigger.nextElementSibling
      }
    })
    clipboard.on('success', event => {
      event.trigger.textContent = 'Copied!';
      event.clearSelection();
      setTimeout(function () {
        event.trigger.textContent = 'Copy';
      }, 2000);
    });
    var copyIconCode = new ClipboardJS('.btn-copy-icon');
    copyIconCode.on('success', function(event) {
      event.clearSelection();
      event.trigger.textContent = 'Copied!';
      window.setTimeout(function() {
        event.trigger.textContent = 'Copy';
      }, 2300);
    });
  },
}
theme.init();