jQuery(function ($) {

  // ------------------------------
  // 初期化関数の呼び出し
  // ------------------------------
  $(document).ready(function () {
    sliders();              // 各Swiperスライダー初期化
  });

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
          speed: 20000,
        }
      }
    });

    // -------------------------------------
    // ▼ MV 02：CSSで反転させて逆方向に見せる（reverseDirectionの問題を回避）
    // -------------------------------------
    const $wrap02 = $(".p-mv__swiper--02 .swiper-wrapper");
    if ($wrap02.length) cloneSlides($wrap02);

    const mvSwiper02 = new Swiper(".p-mv__swiper--02", {
      loop: true,
      slidesPerView: 2.2568,
      spaceBetween: 0,
      allowTouchMove: false,
      speed: 12000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        reverseDirection: false // CSSで反転するのでfalse
      },
      direction: "horizontal", // SP
      breakpoints: {
        768: {
          direction: "vertical", // PC
          slidesPerView: 1,
          speed: 20000,
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
          speed: 10000,
          slidesPerView: 4.1196,
          spaceBetween: 39,
        }
      }
    });

  }





});
