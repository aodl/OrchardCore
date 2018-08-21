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
                if (action != null) {
                    $headerLinkTargets.filter("#" + action + "-link").addClass("active");
                }
            };
        }($));


        function fadeInPartial(path) {
            updateBodyContent(path);
        }

        $(function () {
            var currentlyAutoScrolling = false;
            var scrollable = $('.bodyScroll');

            function scrollTo(selector, after) {
                var scrollableOffset = scrollable.offset().top;

                var scrollTop = $(selector).offset().top - scrollableOffset;
                if (hasPageBeenScaled()) {
                    scrollTop *= 1 / scale;
                }
                scrollTop += scrollable.scrollTop();
                scrollable.animate({ scrollTop: scrollTop }, 'slow', 'swing', after);
            }

            (function () {
                var scrollableOffset = scrollable.offset().top;
                var scrollTargets = $(".scrollToSection").map(function (i, el) {
                    var id = $(el).attr("id");
                    var correspondingNavLink = $("a[data-fragment=" + id + "]");
                    var headerLinkTargetId = correspondingNavLink.data("headerlinkdtargetid");
                    return {
                        action: headerLinkTargetId === undefined ? null : headerLinkTargetId.split('-')[0],
                        scrollTheshFromTop: $("#" + id).offset().top - scrollableOffset
                    };
                });

                $(".bodyScroll").scroll(function () {
                    if (currentlyAutoScrolling) {
                        return;
                    }
                    var viewportHeight = $(window).innerHeight();
                    scrollTargets.each(function (i, el) {
                        var scrollTop = el.scrollTheshFromTop;
                        if (hasPageBeenScaled()) {
                            scrollTop *= 1 / scale;
                        }
                        if (scrollable.scrollTop() + (viewportHeight / 4) >= Math.floor(scrollTop)) {// if id element in top quarter of viewport
                            updateHeaderLinks(el.action);
                        }
                    });
                });
            }());

            //expose closures by binding to onclick events of header links
            $(".headerLink").click(function () {
                var action = $(this).data("headerlinkdtargetid").split('-')[0];
                var fragOrUndef = $(this).data("fragment");
                if (fragOrUndef) {// then should scroll to place on this page
                    currentlyAutoScrolling = true;
                    scrollTo("#" + fragOrUndef, function () {
                        currentlyAutoScrolling = false;
                    });
                    updateHeaderLinks(action);
                } else {// then should fade in new partial from server
                    fadeInPartial(action);
                }
            });
            $(".title-box .navbar-brand").click(function () {
                scrollable.animate({ scrollTop: 0 }, 'slow', 'swing');
            });

            scrollable.bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchstart', function (e) {
                if (e.which > 0 || e.type == "mousedown" || e.type == "mousewheel" || e.type == 'touchstart') {
                    scrollable.stop();
                    currentlyAutoScrolling = false;
                }
            })
        }());

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
    });

}());

