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

        function fadeInPartial(path) {
            updateBodyContent(path);
            updateHeaderLinks(path);
        };

        //expose closures by binding to onclick events of header links
        $(".headerLink").click(function () {
            var path = $(this).data("headerlinkdtargetid").split('-')[0];
            fadeInPartial(path);
        });
    }());

    $(".bodyScroll").scroll(function () {
        if ($(this).scrollTop() > 99) {
            $(".title-box").addClass('title-box-small');
        } else {
            $(".title-box").removeClass('title-box-small');
        }
    });

    $(".aboutMedia form").change(function (e, blah) {
        var mediaUrl = $(e.target).attr("data-media-url");
        $(this).closest(".aboutMedia").css({
            "background": "url(" + mediaUrl + ") center no-repeat",
            "background-size": "cover"
        });
    });

}());

