(function () {
    var largeScreenWidth = 768;
    var largestScreenWidth = 1600;
    var scale = window.innerWidth / largestScreenWidth;

    function hasPageBeenScaled() { return window.innerWidth > largestScreenWidth; }

    (function pageZoomer() {
        var body = $("body");
        function zoomIfBigScreen() {
            if (hasPageBeenScaled()) {
                scale = window.innerWidth / largestScreenWidth;
                body.css({
                    "height" : (1 / scale * 100) + "%",// need to make sure body height matches the viewport after scaling (otherwise .bodyScroll gets truncated at large scales)
                    "transform": "scale(" + scale + ", " + scale + ")",
                    "transform-origin": "top"
                });
            } else {
                body.css({
                    "transform": "scaleY(" + 1 + ")",
                    "height": "100%"
                });
            }
        }
        zoomIfBigScreen();
        $(window).resize(function () {
            zoomIfBigScreen();
        });
    }());

    (function page_navigator() {

        // collapse dropdown when clicking off it
        var navDropdown = $('#navBarDropdown');
        $('body').click(function () {
            if (navDropdown.hasClass('in'))
                navDropdown.collapse('hide');
        });

        var updateBodyContent = (function () {
            //private variables
            var protocol_host = window.location.protocol + "//" + window.location.host;
            var $bodyContent = $(".body-content");
            //closure returned
            return function (path) {
                $bodyContent.fadeOut(100, function () {
                    console.log(protocol_host + "/" + path);
                    $bodyContent.load(protocol_host + "/" + path).hide().fadeIn(1150);
                });
            };
        }());

        var updateHeaderLinks = (function () {
            //private variables
            var $headerLinkTargets = $(".headerLinkTarget");
            //closure returned
            return function (action) {
                $headerLinkTargets.removeClass("active");
                $headerLinkTargets.filter("#" + action + "-link").addClass("active");
            };
        }($));

        function scrollTo(selector) {
            var scrollable = $('.bodyScroll');
            var scrollableOffset = scrollable.offset().top;

            var scrollTop = $(selector).offset().top - scrollableOffset;
            if (hasPageBeenScaled()) {
                scrollTop *= 1 / scale;
            }
            scrollTop += scrollable.scrollTop();
            scrollable.animate({ scrollTop: scrollTop }, 'slow');
        }

        function fadeInPartial(path) {
            updateBodyContent(path);
        }

        $(".bodyScroll").scroll(function ()
        {
            var scrollable = $(this);

            var scrollableOffset = scrollable.offset().top;
            var scrollTop = $("#linkSection").offset().top - scrollableOffset;
            if (hasPageBeenScaled()) {
                scrollTop *= 1 / scale;
            }
            scrollTop += scrollable.scrollTop();
            if (scrollable.scrollTop() >= Math.floor(scrollTop)) {
                updateHeaderLinks("Features");
            }
        });

        //expose closures by binding to onclick events of header links
        $(".headerLink").click(function () {
            var action = $(this).data("headerlinkdtargetid").split('-')[0];
            scrollTo($(this).data("blah"));
            //fadeInPartial(action);
        });
    }());


    $(".bodyScroll").scroll(function () {
        if ($(this).scrollTop() > 99) {
            $(".title-box").addClass('title-box-small');
        } else {
            $(".title-box").removeClass('title-box-small');
        }
    });

    $(".aboutMediaChooser").change(function (e) {
        var displays = $(".aboutMedia").children();
        var selected = displays.filter($(e.target).attr("data-target"));
        var color = selected.attr("data-color");
        $(".aboutMedia").css("background-color", color);
        displays.fadeOut();
        selected.fadeIn();
        //displays.addClass("d-none");
        //selected.removeClass("d-none");
    });

}());

