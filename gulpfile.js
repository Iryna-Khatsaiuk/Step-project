import gulp from "gulp";
const { src, dest, watch, series, parallel } = gulp;

import imagemin from "gulp-imagemin";
import svgo from "imagemin-svgo";
import svgmin from "gulp-svgmin"; 
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import clean from "gulp-clean";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import fileInclude from "gulp-file-include";
const sass = gulpSass(dartSass);

import bsc from "browser-sync";
const browserSync = bsc.create();

const htmlTaskHandler = () => {
  return src("./src/*.html").pipe(dest("./dist"));
};

const processHtmlTaskHandler = () => {
  console.log("Processing HTML task started");

  return src("./src/index.html")
    .pipe(fileInclude({
      prefix: '@@',
      basepath: './src', 
    }))
    .pipe(dest("./dist"))
    .on("end", function () {
      console.log("HTML task completed successfully");
    })
    .pipe(browserSync.stream());
};

const layoutHtmlTaskHandler = () => {
  console.log("Processing layout HTML task started");

  return src("./src/html/layout/**/*.html")
    .pipe(fileInclude({
      prefix: '@@',
      basepath: './src', 
    }))
    .on("data", function (file) {
    })
    // .pipe(dest("./dist"))
    .on("end", function () {
      console.log("Layout HTML task completed successfully");
    })
    .pipe(browserSync.stream());
};

const cssTaskHandler = () => {
  console.log("CSS task started");

  return src("./src/scss/**/*.scss")
    .on("data", function (file) {
      console.log("Processing:", file.path);
    })
    .pipe(sass().on("error", function (error) {
      console.error("Sass Error:", error.message);
    }))
    .pipe(autoprefixer())
    .pipe(csso())
    .on("error", function (error) {
      console.error("CSS Error:", error.message);
    })
    .pipe(dest("./dist/css"))
    .on("end", function () {
      console.log("CSS task completed successfully");
    })
    .pipe(browserSync.stream());
};

const imagesTaskHandler = () => {
  return src(["./src/img/**/*.{jpg,jpeg,png,gif}", "!./src/img/**/*.svg"])
    .pipe(imagemin([
      svgo()
    ]))
    .pipe(dest("./dist/img"));
};

const svgTaskHandler = () => {
  return src("./src/img/**/*.svg")
    .pipe(svgmin())
    .pipe(dest("./dist/img/"));
};

const fontTaskHandler = () => {
  return src("./src/fonts/**/*.*").pipe(dest("./dist/fonts"));
};

const cleanDistTaskHandler = () => {
  return src("./dist", { read: false, allowEmpty: true }).pipe(
    clean({ force: true })
  );
};

const browserSyncTaskHandler = () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  watch("./src/img/**/*.{jpg,jpeg,png,gif}").on(
    "all",
    series(imagesTaskHandler, browserSync.reload)
  );
  watch("./src/img/**/*.svg").on(
    "all",
    series(svgTaskHandler, browserSync.reload)
  );
  watch("./src/scss/**/*.scss").on(
    "all",
    series(cssTaskHandler, browserSync.reload)
  );
  watch("./src/*.html").on(
    "change",
    series(htmlTaskHandler, layoutHtmlTaskHandler, processHtmlTaskHandler, browserSync.reload)
  );
  watch("./src/html/layout/**/*.html").on(
    "all",
    series(htmlTaskHandler, layoutHtmlTaskHandler, processHtmlTaskHandler, browserSync.reload)
  );
};

export const cleaning = cleanDistTaskHandler;
export const html = htmlTaskHandler;
export const processHtml = processHtmlTaskHandler;
export const layoutProcessHtml = layoutHtmlTaskHandler;
export const css = cssTaskHandler;
export const font = fontTaskHandler;
export const images = imagesTaskHandler;
export const svg = svgTaskHandler;

export const build = series(
  cleanDistTaskHandler,
  parallel(htmlTaskHandler, cssTaskHandler, fontTaskHandler, imagesTaskHandler, svgTaskHandler)
);

export const dev = series(build, parallel(layoutHtmlTaskHandler, processHtmlTaskHandler, browserSyncTaskHandler));

