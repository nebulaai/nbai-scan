'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var replaceText = require('gulp-replace');
var fs = require("fs");


gulp.task('sass', function(){
    return gulp.src('./app/styles/scss/**/*.scss')
      .pipe(sass()) // Using gulp-sass
      .pipe(gulp.dest('./app/styles/'))
      .pipe(browserSync.reload({
        stream: true
      }));
});

gulp.task('browserSync', function() {
    browserSync.init({
      server: {
        baseDir: './app/'
      },
    })
})

gulp.task('replace', function () {
  let json = JSON.parse(fs.readFileSync("./app/scripts/controllers/translation.json"));
  // console.log(json);
  let stream = gulp.src('./app/views/template/*.html');
  for (let key in json.en) {
    stream = stream.pipe(replaceText(key, json.en[key]));
  }
  stream.pipe(gulp.dest('./app/views/'));

  stream = gulp.src('./app/template/index.html');
  for (let key in json.en) {
    stream = stream.pipe(replaceText(key, json.en[key]));
  }
  stream.pipe(gulp.dest('./app/'));
});


gulp.task('watch', ['browserSync','sass', 'replace'], function(){
    gulp.watch('./app/styles/scss/**/*.scss', ['sass']);
    gulp.watch('./app/views/template/*.html', ['replace']);  
    gulp.watch('./app/template/*.html', ['replace']);  
    gulp.watch('./**/*.html', browserSync.reload); 
    gulp.watch('./app/scripts/controllers/**/*.js', browserSync.reload); 
    gulp.watch('./app/scripts/controllers/**/*.json', ['replace']); 
    gulp.watch('./app/scripts/controllers/**/*.json', browserSync.reload); 
    // gulp.watch('./images/**/*.svg', browserSync.reload); 
})