// gulpのメソッド呼び出し
// src：参照元指定、dest：出力先指定、watch：ファイル監視、series：直列処理、parallel：並列処理
const { src, dest, watch, series, parallel } = require("gulp");
const fs = require('fs');
const path = require('path');
const rename = require('gulp-rename');

// 入出力先指定
const srcBase = '../src';
const distBase = '../dist';
const srcPath = {
  css: srcBase + '/sass/**/*.scss',
  img: srcBase + '/images/**/*',
}

// ページ固有のSCSSファイルを動的に検出
const getPageScssFiles = () => {
  const sassDir = path.join(__dirname, srcBase, 'sass');
  const files = fs.readdirSync(sassDir);
  return files
    .filter(file => file.endsWith('.scss') && file !== 'styles.scss')
    .map(file => ({
      name: path.basename(file, '.scss'),
      src: srcBase + '/sass/' + file
    }));
}

const distPath = {
  css: distBase + '/css/',
  img: distBase + '/images/',
  html: distBase + '/**/*.html',
  js: distBase + '/js/**/*.js'
}

// ローカルサーバー立ち上げ
const browserSync = require("browser-sync");
const browserSyncOption = {
    server: distBase // dist直下をルートとする
}
const browserSyncFunc = () => {
    browserSync.init(browserSyncOption);
}
const browserSyncReload = (done) => {
    browserSync.reload();
    done();
}

// Sassコンパイル
const sass = require('gulp-sass')(require('sass')); // sassコンパイル（DartSass対応）
const sassGlob = require('gulp-sass-glob-use-forward'); // globパターンを使用可にする
const plumber = require("gulp-plumber"); // エラーが発生しても強制終了させない
const notify = require("gulp-notify"); // エラー発生時のアラート出力
const postcss = require("gulp-postcss"); // PostCSS利用
const cssnext = require("postcss-cssnext"); // 最新CSS使用を先取り
const sourcemaps = require("gulp-sourcemaps"); // ソースマップ生成
const browsers = [ // 対応ブラウザの指定
  'last 2 versions',
  '> 5%',
  'ie = 11',
  'not ie <= 10',
  'ios >= 8',
  'and_chr >= 5',
  'Android >= 5',
]
// メインCSS（共通部分：トップページ用）
const cssSassMain = () => {
  return src(srcBase + '/sass/styles.scss')
    .pipe(sourcemaps.init()) // ソースマップの初期化
    .pipe(
      plumber({ // エラーが出ても処理を止めない
          errorHandler: notify.onError('Error:<%= error.message %>')
      }))
    .pipe(sassGlob()) // globパターンを使用可にする
    .pipe(sass.sync({ // sassコンパイル
      includePaths: [srcBase + '/sass'], // 相対パス省略
      outputStyle: 'expanded' // 出力形式をCSSの一般的な記法にする
    }))
    .pipe(postcss([cssnext({
      features: {
        rem: false // rem単位をpxに変換しない
      }
    },browsers)])) // 最新CSS使用を先取り
    .pipe(sourcemaps.write('./')) // ソースマップの出力先をcssファイルから見たパスに指定
    .pipe(dest(distPath.css)) // 
    .pipe(notify({ // エラー発生時のアラート出力
      message: '共通Sassをコンパイルしました！',
      onLast: true
    }))
}

// ページ固有のCSSを動的に生成する関数
const createPageCssTask = (pageName, pageSrc) => {
  return () => {
    // dist/{ページ名}/ フォルダが存在するか確認
    const pageDistBase = path.join(__dirname, distBase, pageName);
    if (!fs.existsSync(pageDistBase)) {
      console.log(`警告: ${pageDistBase} が存在しないため、${pageName}.scss のコンパイルをスキップします。`);
      return Promise.resolve();
    }
    
    const pageDistDir = distBase + '/' + pageName + '/css/';
    
    return src(pageSrc)
      .pipe(sourcemaps.init()) // ソースマップの初期化
      .pipe(
        plumber({ // エラーが出ても処理を止めない
            errorHandler: notify.onError('Error:<%= error.message %>')
        }))
      .pipe(sassGlob()) // globパターンを使用可にする
      .pipe(sass.sync({ // sassコンパイル
        includePaths: [srcBase + '/sass'], // 相対パス省略
        outputStyle: 'expanded' // 出力形式をCSSの一般的な記法にする
      }))
      .pipe(postcss([cssnext({
        features: {
          rem: false // rem単位をpxに変換しない
        }
      },browsers)])) // 最新CSS使用を先取り
      .pipe(rename(pageName + '.css')) // ファイル名を{ページ名}.cssに変更
      .pipe(sourcemaps.write('./')) // ソースマップの出力先をcssファイルから見たパスに指定
      .pipe(dest(pageDistDir)) // 
      .pipe(notify({ // エラー発生時のアラート出力
        message: `${pageName}用Sassをコンパイルしました！`,
        onLast: true
      }))
  }
}

// すべてのページCSSタスクを動的に生成
const getPageCssTasks = () => {
  const pageFiles = getPageScssFiles();
  const tasks = pageFiles.map(page => createPageCssTask(page.name, page.src));
  return tasks;
}

// すべてのCSSをコンパイル
const cssSass = (done) => {
  const pageTasks = getPageCssTasks();
  if (pageTasks.length > 0) {
    return parallel(cssSassMain, ...pageTasks)(done);
  } else {
    return cssSassMain(done);
  }
}

// 画像圧縮
const imagemin = require("gulp-imagemin"); // 画像圧縮
const imageminMozjpeg = require("imagemin-mozjpeg"); // jpgの高圧縮に必要
const imageminPngquant = require("imagemin-pngquant"); // pngの高圧縮に必要
const imageminSvgo = require("imagemin-svgo");  // svgの高圧縮に必要
const imgImagemin = () => {
  return src(srcPath.img)
  .pipe(imagemin([
    imageminMozjpeg({
      quality: 80
    }),
    imageminPngquant(),
    imageminSvgo({
      plugins: [{
        removeViewbox: false // viewBox属性を削除しない
      }]
    })],
    {
      verbose: true // コンソールに圧縮率などを出力する
    }
  ))
  .pipe(dest(distPath.img))
}

// ファイルの変更を検知
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload))
  watch(srcPath.img, series(imgImagemin, browserSyncReload))
  watch(distPath.html, series(browserSyncReload))
  watch(distPath.js, series(browserSyncReload))
}

// clean
const del = require('del');
const clean = (done) => {
  const delPaths = [
    distBase + '/css/styles.css',
    distBase + '/css/styles.css.map',
    distBase + '/images/',
  ];
  
  // ページ固有のCSSファイルを動的に削除
  const pageFiles = getPageScssFiles();
  pageFiles.forEach(page => {
    const pageCss = distBase + '/' + page.name + '/css/' + page.name + '.css';
    const pageCssMap = distBase + '/' + page.name + '/css/' + page.name + '.css.map';
    delPaths.push(pageCss, pageCssMap);
  });
  
  del(delPaths, { force: true });
  done();
};

// 実行
exports.default = series(series(clean, imgImagemin, cssSass), parallel(watchFiles, browserSyncFunc));