jQuery(function ($) {


  // ------------------------------
  // js-fadeHead（読み込み後フェード）
  // ------------------------------
  $('.js-fadeHead').each(function(){
    var targetElement = $(this).offset().top;
    $(this).delay(300).queue(function(){
      $(this).css('opacity','1');
    });
  });

  // ------------------------------
  // js-fadein（スクロール時フェード）
  // ------------------------------
  $(window).on('load scroll', function () {
    $('.js-fadein').each(function(){
      var targetElement = $(this).offset().top;
      var scroll = $(window).scrollTop();
      var windowHeight = $(window).height();
      if (scroll > targetElement - windowHeight + 80){
        $(this).css('opacity','1');
        $(this).css('transform','translateY(0)');
        $(this).find('.js-fadein-delay').each(function(){
          var element = $(this);
          setTimeout(function(){
            element.css('opacity','1');
            element.css('transform','translateY(0)');
          }, 400);
        });
      }
    });
  });

  // ------------------------------
  // 初期化関数の呼び出し
  // ------------------------------
  $(document).ready(function () {
    pageTop();              // ページトップボタン
    floatBtn();             // フロートボタンの表示制御（SPのみ）
    toggleEntryButton();    // CTA表示時にエントリーボタン非表示
    anchorAdjustment();     // アンカーリンクのスムーススクロール調整
    scrollToHashOnLoad();   // ページ読み込み時のハッシュスクロール
    header();               // ハンバーガーメニュー挙動
    Accordion();            // アコーディオンメニュー
    sliders();              // 各Swiperスライダー初期化
    manageNavInteraction(); // ナビのホバー＆クリック制御
    serviceHoverEffect();   // Serviceセクションのhover効果
  });

  // ------------------------------
  // ページトップボタン
  // ------------------------------
  function pageTop() {
    var topBtn = $('.js-pagetop');
    topBtn.click(function () {
      $('body,html').animate({scrollTop: 0}, 300, 'swing');
      return false;
    });
  }

  // ------------------------------
  // フロートボタン（SPのみ表示）
  // ------------------------------
  function floatBtn() {
    var floatBtn = $('.js-floatBtn');
    floatBtn.hide();

    function toggleFloatBtn() {
      if (window.innerWidth <= 767) {
        if ($(window).scrollTop() > 70) {
          floatBtn.fadeIn();
        } else {
          floatBtn.fadeOut();
        }
      } else {
        floatBtn.hide();
      }
    }

    toggleFloatBtn();
    $(window).on('scroll resize', toggleFloatBtn);
  }

  // ------------------------------
  // CTA付近でのエントリーボタン表示制御
  // ------------------------------
  function toggleEntryButton() {
    const $entryBtn = $('.p-entry-btn');
    const $entrySection = $('#CTA');
    const showOffset = 100;
    const duration = 300;
    if (!$entrySection.length) return;

    $(window).on('load scroll', function () {
      const scrollTop = $(window).scrollTop();
      const windowHeight = $(window).height();
      const entryTop = $entrySection.offset().top;
      if (scrollTop + windowHeight > entryTop) {
        $entryBtn.fadeOut(duration);
      } else if (scrollTop > showOffset) {
        $entryBtn.fadeIn(duration);
      } else {
        $entryBtn.fadeOut(duration);
      }
    });
  }

  // ------------------------------
  // アンカーリンクのクリック時制御
  // ------------------------------
  function anchorAdjustment() {
    $(document).on('click', 'a[href*="#"]', function () {
      const href = $(this).attr('href');
      const hash = href.split('#')[1];
      const $target = $('#' + hash);

      if ($target.length) {
        const headerHeight = $('header').innerHeight() || 0;
        const offset = $target.offset().top - headerHeight;
        const duration = (window.innerWidth > 767) ? 0 : 400;
        setTimeout(function () {
          $('html,body').animate({ scrollTop: offset }, duration, 'swing');
        }, 100);
        return false;
      }
    });
  }

  // ------------------------------
  // ページ初期読み込み時のハッシュ処理
  // ------------------------------
  function scrollToHashOnLoad() {
    const hash = window.location.hash;
    if (!hash) return;
  
    const $target = $(hash);
    if (!$target.length) return;
  
    const headerHeight = $('header').innerHeight() || 0;
    const scrollTime = 400;
  
    // 最初にトップへスクロール（上から下に見せる演出）
    $('html, body').scrollTop(0);
  
    // タブならクリック → DOM切り替え完了後にスクロール
    if ($target.hasClass('js-tab')) {
      $target.trigger('click');
  
      setTimeout(function () {
        const offset = $target.offset().top - headerHeight;
        $('html, body').animate({ scrollTop: offset }, scrollTime, 'swing');
      }, 300); // タブ切り替え完了を待ってから
      return;
    }
  
    // 通常要素は少し待ってからスクロール
    setTimeout(function () {
      const offset = $target.offset().top - headerHeight;
      $('html, body').animate({ scrollTop: offset }, scrollTime, 'swing');
    }, 400);
  }
  
  

  // ------------------------------
  // ハンバーガーメニューの開閉制御
  // ------------------------------
  function header() {
    var hamburger = $('.js-hamburger');
    var nav = $('.js-hamburger__nav');
    var hamburgerActive = false;

    hamburger.attr('aria-expanded', 'false');
    nav.attr('aria-hidden', 'true');

    hamburger.on('click', function () {
      nav.toggleClass('active');
      $(this).toggleClass('active');
      $('.p-header__inner').toggleClass('is-gnav-active');
      hamburgerActive = !hamburgerActive;

      hamburger.attr('aria-expanded', hamburgerActive);
      nav.attr('aria-hidden', !hamburgerActive);
    });

    $('.p-header__dropdownLink, .p-header__btn--link').on('click', function() {
      hamburger.removeClass('active');
      nav.removeClass('active');
      hamburger.attr('aria-expanded', 'false');
      nav.attr('aria-hidden', 'true');
    });
  }

  // ------------------------------
  // アコーディオン動作
  // ------------------------------
  function Accordion() {
    var AccordBody = $('.js-Accord-body');
    AccordBody.hide();
    $('.js-Accord.active').next('.js-Accord-body').show();

    $('.js-Accord').on('click', function () {
      $(this).next('.js-Accord-body').slideToggle();
      $(this).toggleClass('active');
    });
  }

  // ------------------------------
  // Swiperスライダー群
  // ------------------------------
  function sliders() {

    // -------------------------------------
    // 共通：スライド大量複製（loop を使わず無限風に）
    // -------------------------------------
    function cloneSlides($wrapper) {
      const baseSlides = $wrapper.children('.swiper-slide');

      // 何もなければ処理しない
      if (baseSlides.length === 0) return;

      // 元スライドを 8〜10倍複製して無限スクロールを再現
      for (let i = 0; i < 3; i++) {
        baseSlides.clone().appendTo($wrapper);
      }
    }

    // -------------------------------------
    // ▼ MV 01：767px以下で右方向、768px以上で上方向
    // -------------------------------------
    const $wrap01 = $(".p-mv__swiper--01 .swiper-wrapper");
    if ($wrap01.length) cloneSlides($wrap01);

    const mvSwiper01 = new Swiper(".p-mv__swiper--01", {
      loop: true,
      slidesPerView: 2.2568,
      spaceBetween: 0,
      allowTouchMove: false,
      speed: 12000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        reverseDirection: false
      },
      direction: "horizontal", // SP: 左から右
      breakpoints: {
        768: {
          direction: "vertical", // PC: 下から上
          slidesPerView: 1,
          speed: 16000
        }
      }
    });

    // -------------------------------------
    // ▼ MV 02：767px以下で左方向、768px以上で下方向
    // -------------------------------------
    const $wrap02 = $(".p-mv__swiper--02 .swiper-wrapper");
    if ($wrap02.length) cloneSlides($wrap02);

    const mvSwiper02 = new Swiper(".p-mv__swiper--02", {
      loop: true,
      slidesPerView: 2.2568,
      spaceBetween: 0,
      allowTouchMove: false,
      speed: 12000,
      effect: 'slide',
      watchSlidesProgress: true,
      loopAdditionalSlides: 10,
      loopedSlides: 10,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        reverseDirection: true // 逆方向
      },
      direction: "horizontal", // SP: 右から左
      breakpoints: {
        768: {
          direction: "vertical", // PC: 上から下
          slidesPerView: 1,
          speed: 16000,
          spaceBetween: 8
        }
      }
    });

    // -------------------------------------
    // ▼既存コンセプトスライダー
    // -------------------------------------
    new Swiper(".p-top-concept__swiper", {
      loop: true,
      slidesPerView: 2.0097,
      spaceBetween: 22,
      speed: 5000,
      allowTouchMove: false,
      autoplay: {
        delay: 0,
      },
      breakpoints: {
        768: {
          speed: 6000,
          slidesPerView: 4.1196,
          spaceBetween: 39,
        }
      }
    });

  }



  // ------------------------------
  // Serviceセクションのhover効果
  // ------------------------------
  function serviceHoverEffect() {
    if (window.innerWidth <= 767) return; // SPでは動作しない

    const $contentItems = $('.p-top-service__content-item');
    const $imageItems = $('.p-top-service__images-item');

    // 初期状態：1つ目の画像のみ表示
    $imageItems.eq(0).css({
      'opacity': '1',
      'transform': 'scale(1)'
    });
    $imageItems.not(':eq(0)').css({
      'opacity': '0'
    });

    $contentItems.on('mouseenter', function () {
      const $this = $(this);
      const index = $this.index();
      
      // activeクラスを付与
      $this.addClass('active');
      
      // 対応する画像を表示
      $imageItems.eq(index).css({
        'opacity': '1',
        'transform': 'scale(1)'
      });
      // 他の画像を非表示
      $imageItems.not(':eq(' + index + ')').css({
        'opacity': '0'
      });
    });

    $contentItems.on('mouseleave', function () {
      const $this = $(this);
      
      // activeクラスを削除（画像は維持）
      $this.removeClass('active');
    });
  }

  // ------------------------------
  // ナビゲーションのホバー＆クリック制御
  // ------------------------------
  function manageNavInteraction() {
    $('.js-hover').hover(function () {
      if (window.innerWidth > 767) {
        $(this).siblings('.p-header__wrapper').stop(true, true).fadeIn();
        $(this).addClass('active');
        $("body").addClass('bg');
      }
    }, function () {
      if (window.innerWidth > 767) {
        const $this = $(this);
        setTimeout(function () {
          if (!$this.siblings('.p-header__wrapper').is(':hover')) {
            $this.siblings('.p-header__wrapper').stop(true, true).fadeOut();
            $this.removeClass('active');
            $("body").removeClass('bg');
          }
        }, 100);
      }
    });

    $('.p-header__wrapper').hover(function () {
      if (window.innerWidth > 767) {
        const $wrapper = $(this);
        const $trigger = $wrapper.siblings('.js-hover');
        $wrapper.stop(true, true).fadeIn();
        $trigger.addClass('active');
        $("body").addClass('bg');
      }
    }, function () {
      if (window.innerWidth > 767) {
        const $wrapper = $(this);
        const $trigger = $wrapper.siblings('.js-hover');
        $wrapper.stop(true, true).fadeOut();
        $trigger.removeClass('active');
        $("body").removeClass('bg');
      }
    });

    $('.js-hover').click(function (e) {
      if (window.innerWidth <= 767) {
        $(this).toggleClass('active');
        e.preventDefault();
        var $dropdown = $(this).siblings('.p-header__wrapper');
        if ($dropdown.is(':visible')) {
          $dropdown.stop(true, true).slideUp();
        } else {
          $('.p-header__wrapper').slideUp();
          $dropdown.stop(true, true).slideDown();
        }
      }
    });

    $(window).resize(function () {
      if (window.innerWidth > 767) {
        $('.p-header__wrapper').hide();
        $('.js-hover').removeClass('active');
        $('body').removeClass('bg');
      }
    });
  }


});

// ------------------------------
// モーダル動作
// ------------------------------
$(function () {
  var open = $('.js-modal'),
      close = $('.p-modal__btn'),
      container = $('.js-modal-container'),
      lastFocusedElement;

  // モーダルを開く
  open.on('click', function () {
    var targetModalId = $(this).data('target');
    var modal = $('#' + targetModalId);
    modal.addClass('active');
    modal.attr({ 'aria-modal': 'true', 'role': 'dialog' });

    // モーダルを開いた時点でのフォーカスを記録
    lastFocusedElement = document.activeElement;

    // フォーカスを閉じるボタンに移動
    var closeBtn = modal.find('.p-modal__btn');
    if (closeBtn.length) {
      closeBtn.focus();
    }

    return false;
  });

  // モーダルを閉じる（ボタンクリック時）
  close.on('click', function () {
    var modal = $(this).closest('.js-modal-container');
    modal.removeClass('active');

    // js-modal からのフォーカスであれば戻さない（スムーススクロール防止）
    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === 'function' &&
      !$(lastFocusedElement).hasClass('js-modal')
    ) {
      lastFocusedElement.focus();
    }
  });

  // モーダルの外側クリックで閉じる
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.p-modal__wrapper').length) {
      container.removeClass('active');

      if (
        lastFocusedElement &&
        typeof lastFocusedElement.focus === 'function' &&
        !$(lastFocusedElement).hasClass('js-modal')
      ) {
        lastFocusedElement.focus();
      }
    }
  });

  // Escキーで閉じる
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('.js-modal-container.active').removeClass('active');

      if (
        lastFocusedElement &&
        typeof lastFocusedElement.focus === 'function' &&
        !$(lastFocusedElement).hasClass('js-modal')
      ) {
        lastFocusedElement.focus();
      }
    }
  });
});


// ------------------------------
// チェックボックスのフォーカス制御
// ------------------------------
document.addEventListener('click', function(e) {
  const label = e.target.closest('label');
  if (!label) return;

  const targetId = label.getAttribute('for');
  if (targetId) {
    const targetInput = document.getElementById(targetId);
    if (targetInput) {
      targetInput.focus();
    }
  }
});


// ------------------------------
// プライバシーポリシーのチェックボックスのフォーカス制御
// ------------------------------
jQuery(function($){
  const $policyCheckbox = $('input[name="your_policy[]"]');

  $policyCheckbox.on('change', function(){
    const $control = $(this).closest('.wpcf7-form-control');

    if ($(this).is(':checked')) {
      $control.addClass('is-checked');
    } else {
      $control.removeClass('is-checked');
    }
  });

  // 初期化時にも一応チェック（フォーム再送信後など）
  $policyCheckbox.trigger('change');
});
