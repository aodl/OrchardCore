(function () {
    var largeScreenWidth = 768;
    var largestScreenWidth = 1600;

    (function pageZoomer() {
        var body = $("body");
        function zoomIfBigScreen() {
            if (window.innerWidth >= largestScreenWidth) {
                var scale = window.innerWidth / largestScreenWidth;
                body.css({
                    "transform": "scale(" + scale + ", " + scale + ")",
                    "transform-origin": "top"
                });
            } else {
                body.css("transform", "scaleY(" + 1 + ")");
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
            return function (controller, action) {
                $bodyContent.fadeOut(100, function () {
                    console.log(protocol_host + "/" + controller + "/" + action);
                    $bodyContent.load(protocol_host + "/" + controller + "/" + action).hide().fadeIn(1150);
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

        function fadeInPartial(options) {
            updateBodyContent(options.controller, options.action);
            updateHeaderLinks(options.action);
        };

        //expose closures by binding to onclick events of header links
        $(".headerLink").click(function () {
            var action = $(this).data("headerlinkid").split('-')[0];
            fadeInPartial({ controller: 'Home', action: action });
        });
    }());

    (function navbar_horizontalOffsetUpdater() {
        var titleBox = $('.title-box');
        var smallScreenHeader = $('.navbar-header');
        var navbarBrand = $(".navbar-brand");
        //check titleBox width whenever window is resized and pad navbar accordingly
        $(window).resize(function () {
            if (window.innerWidth >= largeScreenWidth) {
                smallScreenHeader.css("flex-basis", titleBox.outerWidth());
            } else {
                smallScreenHeader.css("flex-basis", "100%");
            }
        });
        //and first time page has loaded
        $(document).ready(function () {
            if (window.innerWidth >= largeScreenWidth) {
                smallScreenHeader.animate({ "flex-basis": titleBox.outerWidth() }, 1000);
            } else {
                smallScreenHeader.css("flex-basis", "100%");
            }
        });
    }());

}());