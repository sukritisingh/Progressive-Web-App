var $ = jQuery = require('jquery');
var Handlebars = require('handlebars');

$(function () {
    var isOnline = navigator.onLine;
    var tab = 'latest';
    var topoffset = 50;
    var source = 'the-next-web';
    var url_first = 'https://newsapi.org/v1/articles?source=';
    var url_mid = '&sortBy=';
    var url_last = '&apiKey=fc5245f333eb453fb8f694e5c12dcbb5';

    /*
    Event listeners to identify whether there is network or not
     */
    window.addEventListener('online', function (e) {
        $('body').toggleClass('grey');
        $('.footer').fadeOut(200);
        $('[data-sort="' + tab + '"]').trigger('click');
        isOnline = true;
    }, false);

    window.addEventListener('offline', function (e) {
        $('body').toggleClass('grey');
        $('.footer').fadeIn(200);
        isOnline = false;
    }, false);


    /*
    Registering a service worker if the browser supports it
     */
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () {
                console.log('Service Worker Active');
            })
    }

    /*
    Event listener for the hamburger button to open the news channels menu
     */
    $('.menu-btn').on('click', function () {
        $('.sources').slideToggle(1000);
    })


    /*
    Event listener for the news channels in the hamburger menu
     */
    $('.source-img').click(function () {
        source = $(this).data('id');
        $('.menu-btn').trigger('click');
        $('#default').trigger('click');

    })

    /*
    Event listener to get the news articles according to the selected category
     */
    $('.sort-option').on('click', function () {
        var target = $(this);
        var borderDiv = $('.border-bottom');
        var sort;
        tab = $(this).data('sort');
        borderDiv.css('left', function () {
            if (target.data('sort') === 'latest') {
                sort = 'latest';
                return '0';
            } else if (target.data('sort') === 'top') {
                sort = 'top';
                return '33.33%';
            } else if (target.data('sort') === 'popular') {
                sort = 'popular';
                return '66.66%';
            }
        })
        $('.loader-pane').fadeIn(200);
        callServer(source, sort);
    })

    /*
    Function to create the DOM once data is available from network or cache
     */
    function createHTML(data) {

        var parentDiv = $('.headlines');
        parentDiv.empty();
        for (var d of data.articles) {
            var newsArticle = $('<div></div>')
            newsArticle.addClass('news-articles');
            var heading = $('<div></div>');
            heading.addClass('heading');
            heading.html(d.title);
            newsArticle.append(heading);
            var content = $('<div></div>');
            content.addClass('content');
            content.html(d.description);
            newsArticle.append(content);
            parentDiv.append(newsArticle);
        }
    }

    /*
    Function to create DOM elements when network request fails
     */
    function requestFail() {
        $('.loader-pane').fadeOut(1000);
        var parentDiv = $('.headlines');
        parentDiv.empty();
        var newsArticle = $('<div></div>')
        newsArticle.addClass('news-articles');
        var heading = $('<div></div>');
        heading.addClass('heading');
        heading.html("Data not available");
        newsArticle.append(heading);
        parentDiv.append(newsArticle);
    }

    /*
    Function to make ajax call to get data from news API depending 
    on the news source and category tab selected
     */
    function callServer(id, sort) {
        /*
    url to get data from
    */
        var url = url_first + id + url_mid + sort + url_last;

        /*
        if network is there, make ajax call and get the latest data
        if ajax call fails then call requestFail function
        */

        if (isOnline) {
            $('.overlay').hide();
            $.getJSON(url, function (data) {

                    createHTML(data);

                    $('.loader-pane').fadeOut(1000);
                })
                .fail(function () {
                    requestFail();
                })
        }

        /*
        if network is not present, grey out the entire app and load data from cache if its present 
        */
        else {
            $('.loader-pane').hide();
            $.getJSON(url, function (data) {
                    createHTML(data);
                    $('.loader-pane').fadeOut(1000);
                })
                .fail(function () {
                    requestFail();
                })
        }

    }

    /*first call when app loads*/
    callServer('the-next-web', 'latest');

})