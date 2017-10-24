'use strict';

import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import autoprefixer from 'autoprefixer';
import pngquant from 'imagemin-pngquant';
import nodemon from 'gulp-nodemon';
import runSequence from 'run-sequence';

// Constants
const BROWSERSYNC_RELOAD_DELAY = 1000;
const bootstrapPath = './node_modules/bootstrap/scss/';
const fontAwesomePath = './node_modules/font-awesome/scss/'
const uikitPath = './node_modules/uikit/src/less/'
const postCssPlugins = [
  autoprefixer({
    browsers: ['last 2 versions']
  })
];

require('dotenv').config();     // Calling dotenv for using env vars

//----------------------------------------
//------------------- Tasks --------------
//----------------------------------------

// Build and minify images
gulp.task('build:img', () => {
  gulp.src('public/images/**/*')
    .pipe(plugins.imagemin({
      progressive: true,
      svgoPlugins: [
        { removeViewBox: false },
        { removeUselessDefs: false },
        { cleanupIDs: false }
      ],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./dist/img'));
});

// Building stylesheets for bootstrap with sass
gulp.task('build:scss', () => {
  // Change configuration with gulp-sass
  gulp.src('./public/stylesheets/scss/**/*.scss')
    .pipe(plugins.sass({
      outputStyle: 'compressed',
      includePaths: [
        bootstrapPath,
        fontAwesomePath
      ]
    }).on('error', plugins.sass.logError))
    .pipe(plugins.postcss(postCssPlugins))
    .pipe(gulp.dest('./dist/css'));
});

// Building stylesheets for uikit with less
gulp.task('build:less', () => {
  gulp.src('./public/stylesheets/less/**/*.less')
    .pipe(plugins.less({
      paths: [uikitPath]
    }))
    .pipe(plugins.postcss(postCssPlugins))
    .pipe(gulp.dest('./dist/css'));
})

// Build fonts
gulp.task('build:fonts', () => {
  gulp.src(fontAwesomePath + '/fonts/*')
    .pipe(gulp.dest('./dist/fonts'));
});


// Task for working at ES6 with babeljs and uglify files
gulp.task('build:js', () => {
  gulp.src('./public/javascripts/**/*.js')
    .pipe(plugins.babel())
    .pipe(plugins.uglify())
    .pipe(plugins.concat('main.min.js'))
    .pipe(gulp.dest('dist/js'));
});

// Init node server with nodemon and reload when changes js server files
gulp.task('serve:node', cb => {
  var called = false;

  nodemon({

    // nodemon our expressjs server
    script: './bin/www.js',

    // watch core server file(s) that require server restart on change
    watch: ['app.js', 'routes/**/*.js']
  })
    .on('start', () => {
      // ensure start only got called once
      if (!called) {
        cb();
      }
      called = true;
    })
    .on('restart', () => {
      // reload connected browser after a slight delay
      setTimeout(() => {
        browserSync.reload({
          stream: false
        }, browserSyncReloadDelay);
      });
    });
});

// Using browser-sync for watching changes in our files
gulp.task('serve', ['serve:node'], () => {
  var port = 3000;
  // for more browser-sync config options http://www.browsersync.io/docs/options/
  browserSync({
    // informs browser-sync to proxy expressjs app which would run at the following location
    proxy: `http://localhost:${ port }`,

    // informs browser-sync to use the following port for the proxied app
    // notice that default port is 3000, which would clash with our expressjs
    port: 8080,

    // Don't open browser automatically
    open: false,

    // Don't notify
    notify: false,

    // open the proxied app in
    browser: [process.env.BROWSER || 'chromium']
  });

  gulp.watch('views/**/*.html').on('change', browserSync.reload);
  gulp.watch('./dist/css/*.css').on('change', browserSync.reload);
  gulp.watch('./dist/img/**/*').on('change', browserSync.reload);
  gulp.watch('./dist/js/*.js').on('change', browserSync.reload);
});

// Watching changes in our codebase
gulp.task('watch', () => {
  gulp.watch('public/images/**/*', ['build:img']);
  gulp.watch('public/javascripts/**/*.js', ['build:js']);
  gulp.watch('public/stylesheets/**/*.scss', ['build:scss']);
  gulp.watch('public/stylesheets/**/*.less', ['build:less']);
});

// Default task
gulp.task('default', ['watch', 'serve']);
