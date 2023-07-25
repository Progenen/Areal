const { src, dest, watch, series, parallel } = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass')(require('sass'));                                
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sprite = require('gulp-svg-sprite');
const rename = require("gulp-rename");
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const isDevelopment = process.env.NODE_ENV == 'development' ? true : false; // Check work mode | Смотрим какой режим разработки выбран
const dir = 'dist'; // Output | Папка с конечными файлами

// Launch app on localhost | Запускаем приложение на локальном хостинге
function browsersync() {
    browserSync.init({
        server: {
            baseDir: dir,
            index: "index.html"
        }
    });
}

// Оптимизация стилей | Optimizing styles
function style() {
    return src('src/sass/**/*.+(scss|sass)')
        .pipe(gulpIf(isDevelopment, sourcemaps.init())) // Инициализация source-maps (Работает только в режиме разработки) | Source-maps initialization (Only works in development mode)
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError)) // From sass to css
        .pipe(rename({ suffix: '.min', prefix: '' })) // Добавление суффикса min к style.css | Adding min suffix to style.css
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Автоматическая расстановка кроссбраузерных префиксов | Automatic placement of cross-browser prefixes
        .pipe(cleanCSS({ compatibility: 'ie8' })) //
        .pipe(gulpIf(isDevelopment, sourcemaps.write())) // Запись source-maps (Работает только в режиме разработки) | Source-maps entry (Only works in development mode)
        .pipe(dest(dir + "/css")) // Избавляемся от мусора c cleanCSS | Getting rid of garbage with cleanCSS
        .pipe(browserSync.stream()) // Наблюдаем за измениями в стилях | Watching Style Changes
}

// Просто перенос html файлов | Just transferring html files
function html() {
    return src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest(dir + '/'))
}

// Сборка JS модулей с помощью webpack | Building JS modules using webpack
function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'src/JS/libs/**/*.js',
        'node_modules/slick-carousel/slick/slick.min.js',
        'src/JS/index.js'
    ])
        .pipe(gulpIf(isDevelopment, sourcemaps.init())) // Инициализация source-maps (Работает только в режиме разработки) | Source-maps initialization (Only works in development mode)
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(gulpIf(isDevelopment, sourcemaps.write())) // Запись source-maps (Работает только в режиме разработки) | Source-maps entry (Only works in development mode)
        .pipe(dest(dir + '/JS/'))
}

// Наблюдаем за всеми изменениями (gulp-watch) | Watch all changes (gulp-watch)
function startWatch() {
    watch(['src/sass/**/*.+(scss|sass)'], style);
    watch(['src/JS/**/*.js', '!src/**/*.min.js'], scripts);
    watch(['src/**/*.html'], html);
    watch(['src/**/*.html']).on('change', browserSync.reload);
    watch(['src/images/**/*'], images);
    watch(['src/svg/src/**/*'], svgsprite);
    watch(['src/fonts/**/*'], fonts);
    watch(['src/svg/src/**/*'], svgsprite)
}


// Оптимизация и конвертация картинок в webp | Optimization and conversion of images to webp
function images() {
    return src('src/images/**/*')
        .pipe(newer(dir + '/images'))
        .pipe(gulpIf(!isDevelopment, imagemin())) // Оптимизируем картинки если режим разработки prod | We optimize pictures if the prod mode
        .pipe(dest(dir + '/images/'))
}

//video to dev/prod
function video() {
    return src('src/video/**/*')
        .pipe(dest(dir + '/video/'))
}

// Спрайт для векторной графики
function svgsprite() {
    return src('src/svg/src/**/*')
        .pipe(sprite({
            shape: {
                dimension: {
                    maxWidth: 500,
                    maxHeight: 500
                },
                spacing: {
                    padding: 0
                },
                transform: [{
                    "svgo": {
                        "plugins": [
                            { removeViewBox: false },
                            { removeUnusedNS: false },
                            { removeUselessStrokeAndFill: true },
                            { cleanupIDs: false },
                            { removeComments: true },
                            { removeEmptyAttrs: true },
                            { removeEmptyText: true },
                            { collapseGroups: true },
                            { removeAttrs: { attrs: '(fill|stroke|style)' } }
                        ]
                    }
                }]
            },
            mode: {
                stack: {
                    sprite: 'sprite.svg'  // sprite file name
                }
            },
        }))
        .pipe(dest(dir + '/svg/dest/'))
}

// Удаление картинок в выходной папке, если те удалены в входящей | Deleting pictures in the output folder, if they were deleted in the input
function cleanImg() {
    return del(dir + '/images/**/*', { force: true })
}

// Удаление шрифтов в выходной папке, если те удалены в входящей | Deleting fonts in the output folder, if they were deleted in the input
function cleanFonts() {
    return del(dir + '/fonts/**/*', { force: true })
}


// Просто перенос шрифтов | Just transferring fonts
function fonts() {
    return src('src/fonts/**/*')
        .pipe(dest(dir + '/fonts/'))
}


exports.browsersync = browsersync;
exports.scripts = scripts;
exports.style = style;
exports.html = html;
exports.cleanImg = cleanImg;
exports.cleanFonts = cleanFonts;
exports.fonts = fonts;
exports.svgsprite = svgsprite;
exports.video = video;

exports.default = parallel(style, html, scripts, fonts, cleanFonts, svgsprite, images, video, cleanImg, browsersync, startWatch);
