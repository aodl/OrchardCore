(function () {
    var partialLoadEventStr = "aodlPartialLoad";
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

        var ajaxBodyContent = (function () {
            //private variables
            var protocol_host = window.location.protocol + "//" + window.location.host;
            //closure returned
            return function (path, $bodyContent, addToCacheFunc) {
                $bodyContent.fadeOut(100, function () {
                    $bodyContent.load(protocol_host + "/" + path, function () {
                        $(this).trigger(partialLoadEventStr);
                        $(this).fadeIn(1150);
                        addToCacheFunc($(this).html());
                    });
                });
            };
        }());

        var updateHeaderLinks = (function () {
            //private variables
            var $headerLinkTargets = $(".headerLinkTarget");
            //closure returned
            return function (linkName) {
                $headerLinkTargets.removeClass("active");
                if (linkName != null) {
                    $headerLinkTargets.filter("#" + linkName + "-link").addClass("active");
                }
            };
        }($));

        var fadeInPartial = (function () {
            var alreadyLoadedCache = {};// object keys will be "[path]", value will be [pageContent]
            var container = $(".body-content");

            return function (path) {
                cachedContent = alreadyLoadedCache[path];
                if (cachedContent) {// then use cached content
                    container.fadeOut(100, function () {
                        $(this).html(cachedContent);
                        $(this).fadeIn(1150);
                    });
                } else {// then get content from server, and cache it
                    ajaxBodyContent(path, container, function (responseContent) {
                        alreadyLoadedCache[path] = responseContent;
                    });
                }

            };
        }());

        $(function () {
            var currentlyAutoScrolling = false;
            var scrollable = $('.bodyScroll');

            function clickScrollAnimation(scrollable, toPosition, after) {
                scrollable.animate({ scrollTop: toPosition }, {
                    duration: "slow",
                    step: function (now, prop) {
                        if (!currentlyAutoScrolling) {
                            //stop animation. start == end means nothing to be done anymore
                            prop.start = prop.end = prop.now;
                        }
                    },
                    complete: after
                });
            }


            function scrollToOrFadeIn(selector, path, after) {

                if (selector) {
                    var element = $("#" + selector);
                    if (element.length > 0) {
                        var scrollableOffset = scrollable.offset().top;

                        var scrollTop = element.offset().top - scrollableOffset;
                        if (hasPageBeenScaled()) {
                            scrollTop *= 1 / scale;
                        }
                        scrollTop += scrollable.scrollTop();
                        clickScrollAnimation(scrollable, scrollTop, after);
                        return;
                    }
                }

                fadeInPartial(path);
            }

            (function () {
                var scrollableOffset = scrollable.offset().top;
                var scrollTargets;
                function reloadScrollTargets() {
                    scrollTargets = $(".scrollToSection").map(function (i, el) {
                        var id = $(el).attr("id");
                        var correspondingNavLink = $("a[data-fragment=" + id + "]");
                        var headerLinkTargetId = correspondingNavLink.data("headerlinkdtargetid");
                        return {
                            linkName: headerLinkTargetId === undefined ? null : headerLinkTargetId.split('-')[0],
                            scrollTheshFromTop: $("#" + id).offset().top - scrollableOffset
                        };
                    });
                }
                reloadScrollTargets();

                $(".body-content").on(partialLoadEventStr, reloadScrollTargets);

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
                            updateHeaderLinks(el.linkName);
                        }
                    });
                });
            }());

            //expose closures by binding to onclick events of header links
            $(".headerLink").click(function () {
                var linkName = $(this).data("headerlinkdtargetid").split('-')[0];
                var path = $(this).data("headerlink");
                var fragOrUndef = $(this).data("fragment");
                currentlyAutoScrolling = true;
                scrollToOrFadeIn(fragOrUndef, path, function () {
                    currentlyAutoScrolling = false;
                });
                updateHeaderLinks(linkName);
            });
            $(".title-box .navbar-brand").click(function () {
                clickScrollAnimation(scrollable, 0);
            });

            scrollable.bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchstart', function (e) {
                if (e.which > 0 || e.type == "mousedown" || e.type == "mousewheel" || e.type == 'touchstart') {
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

