var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    concatCss = require('gulp-concat-css'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpif = require('gulp-if'),
    webserver = require('gulp-webserver'),
    path = require('path'),
    swPrecache = require('sw-precache'),
    sass = require('gulp-sass'),
    livereload = require('gulp-livereload'),
    browserSync = require('browser-sync').create()


var src = './app',
    dest = './dist',
    environment = 'dev';




gulp.task('generate-service-worker', function (callback) {
    swPrecache.write(path.join(dest, 'service-worker.js'), {
        staticFileGlobs: [dest + '/**/*.{js,html,json,css,png,jpg,gif,svg,eot,ttf,woff}'],
        stripPrefix: dest,
        runtimeCaching:[{
          urlPattern:/^https:\/\/newsapi\.org\/v1/,
          handler: 'networkFirst',
          options: {
            cache: {
              name: 'newsData'
            }
          }
        }]
    }, callback);
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: dest
        },
    })
})


gulp.task('js', function () {
    return gulp.src(src + '/js/*.js')
        .pipe(browserify())
        .pipe(gulpif(environment === 'production', uglify()))
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(gulp.dest(dest + '/js')).pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('html', function () {
    return gulp.src(dest + '/index.html').pipe(browserSync.reload({
        stream: true
    }))
});

gulp.task('sass', function () {
    return gulp.src(src + '/scss/*.scss')
        .pipe(sass()) // Using gulp-sass
        .pipe(gulp.dest(dest + '/css')).pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('watch', function () {
    gulp.watch([src + '/js/**/*', dest + '/data/**/*'], ['generate-service-worker', 'js']);
    gulp.watch(src + '/scss/*.scss', ['generate-service-worker', 'sass']);
    gulp.watch(dest + '/*.html', ['generate-service-worker', 'html']);
});

gulp.task('webserver', ['generate-service-worker', 'html', 'sass', 'js'], function () {
    gulp.src(dest)
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});


gulp.task('default', ['browserSync', 'watch', 'webserver']);
