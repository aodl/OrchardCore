(function () {
    var largeScreenWidth = 768;
    var largestScreenWidth = 1600;
    var scale = window.innerWidth / largestScreenWidth;
    var scrollable = $('.bodyScroll');
    var currentlyAutoScrolling = false;

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
            return function (path, callback) {
                $.ajax({
                    url: protocol_host + "/" + path,
                    success: callback
                })
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

        partialCache = (function () {
            var _alreadyLoadedCache = {};// object keys will be "[path]", value will be [pageContent]

            var progressContainer = $(".pageLoaderProgress");
            var progressBar = progressContainer.find(".js-progress");

            function _getOrAdd(path, detachCurr, attachPartial) {
                detachCurr(function () {
                    if (_alreadyLoadedCache[path]) {
                        attachPartial(_alreadyLoadedCache[path]);
                    } else {
                        progressBar.css("width", "0");
                        progressContainer.show();
                        progressBar.animate({ "width": "45%" }, 20000);
                        ajaxBodyContent(path, function (responseContent) {
                            attachPartial(responseContent, function (attachedPartial) {
                                _alreadyLoadedCache[path] = attachedPartial;
                                progressBar.finish();
                                progressContainer.fadeOut();
                            });
                        });
                    }
                });
            }

            return {
                getOrAdd: _getOrAdd
            };
        }());

        $(function () {
            function clickScrollAnimation(scrollable, toPosition, after) {
                if (scrollable.css("scrollTop") != toPosition) {
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
            }

            function scrollTo(element, after) {
                currentlyAutoScrolling = true;

                var scrollableOffset = scrollable.offset().top;

                var scrollTop = element.offset().top - scrollableOffset;
                if (hasPageBeenScaled()) {
                    scrollTop *= 1 / scale;
                }
                scrollTop += scrollable.scrollTop();
                clickScrollAnimation(scrollable, scrollTop, function(){
                    currentlyAutoScrolling = false;
                    if (after)
                        after();
                });
            }

            var fadeInPartial = (function () {
                var alreadyLoadedCache = {};// object keys will be "[path]", value will be [pageContent]
                var container = $(".body-content");

                return function (path, after) {
                    var temp = path.split('#');
                    var serverPath = temp[0];
                    var fragment = temp[1];
                    var originalOpacity = container.css("opacity");

                    partialCache.getOrAdd(
                        serverPath,
                        function fadeOut(after) {
                            container.animate({ opacity: 0 }, {
                                duration: 100,
                                complete: after
                            });
                        },
                        function swapFadeIn(content, afterPartialAttached) {
                            container.children().detach();
                            container.append(content);
                            if (fragment) {
                                var element = $("#" + fragment);
                                if (element.length > 0) {
                                    scrollTo(element);
                                }
                            }
                            container.animate({ opacity: originalOpacity }, {
                                duration: 1150, complete: function () {
                                    if (after)
                                        after();
                                    if (afterPartialAttached)
                                        afterPartialAttached(container.contents());
                                }
                            });
                        }
                    );
                };
            }());


            function scrollToOrFadeIn(fragment, path, after) {

                if (fragment) {
                    var element = $("#" + fragment);
                    if (element.length > 0) {
                        scrollTo(element, after);
                        return;
                    }
                }

                fadeInPartial(path, after);
            }

            //expose closures by binding to onclick events of header links
            $(".headerLink").click(function (event, customAfter) {
                $("#collapsibleNavContent").collapse("hide");
                var linkName = $(this).data("headerlinkdtargetid").split('-')[0];
                var path = $(this).data("headerlink");
                var fragOrUndef = $(this).data("fragment");
                scrollToOrFadeIn(fragOrUndef, path, customAfter);
                updateHeaderLinks(linkName);
            });
            $(".title-box .navbar-brand").click(function () {
                clickScrollAnimation(scrollable, 0);
            });
            $(".navbar-brand").first().trigger("click", function () {
                indexPageSetup(updateHeaderLinks);
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


    function indexPageSetup(updateHeaderLinks) {
        (function () {
            var scrollableOffset = scrollable.offset().top;
            var scrollTargets = $(".scrollToSection").map(function (i, el) {
                var id = $(el).attr("id");
                var correspondingNavLink = $("a[data-fragment=" + id + "]");
                var headerLinkTargetId = correspondingNavLink.data("headerlinkdtargetid");
                return {
                    linkName: headerLinkTargetId === undefined ? null : headerLinkTargetId.split('-')[0],
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
                        updateHeaderLinks(el.linkName);
                    }
                });
            });
        }());

        $(".aboutMediaChooser").change(function (e) {
            var displays = $(".aboutMedia").children();
            var selected = displays.filter($(e.target).attr("data-target"));
            var color = selected.attr("data-color");
            var currentColor = $(".aboutMedia").closest(".zebraSection").css("background-color");
            if (color === "black") {// assumes that that section bg defaults to black on small screen (which couldn't be the case if the section was offset by one due to zebra styling)
                $(".aboutMedia").closest(".zebraSections").removeClass("zebraSectionsInverse");
            } else {
                $(".aboutMedia").closest(".zebraSections").addClass("zebraSectionsInverse");
            }
            $(".aboutMedia").css("background-color", color);
            displays.fadeOut(400, "linear");
            selected.fadeIn(400, "linear");
        });
    }
}());

