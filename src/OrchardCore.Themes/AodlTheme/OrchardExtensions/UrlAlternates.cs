using Microsoft.AspNetCore.Http;
using OrchardCore;
using OrchardCore.ContentManagement;
using OrchardCore.DisplayManagement.Descriptors;
using OrchardCore.DisplayManagement.Implementation;
using OrchardCore.DisplayManagement.Shapes;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Web;
using System.Threading.Tasks;

namespace AodlTheme.ShapeProviders
{
    public class UrlAlternatesFactory : IShapeDisplayEvents
    {
        private readonly Lazy<List<string>> _urlAlternates;

        public UrlAlternatesFactory(IHttpContextAccessor httpContextAccessor) {

            _urlAlternates = new Lazy<List<string>>(() => {
                var httpContext = httpContextAccessor.HttpContext;

                if (httpContext == null) {
                    return null;
                }

                var request = httpContext.Request;

                if (request == null) {
                    return null;
                }

                // extract each segment of the url
                var urlSegments = request.Path.Value
                    .TrimStart('/')
                    .Split('/')
                    .Select(url => url.Replace("-", "__").Replace(".", "_")) // format the alternate
                    .ToArray();

                if (String.IsNullOrWhiteSpace(urlSegments[0])) {
                    urlSegments[0] = "homepage";
                }

                return Enumerable.Range(1, urlSegments.Count()).Select(range => String.Join("__", urlSegments.Take(range))).ToList();;
            });
        }

        public Task DisplayedAsync(ShapeDisplayContext context) => Task.CompletedTask;

        public Task DisplayingAsync(ShapeDisplayContext context)
        {
            context.ShapeMetadata.OnDisplaying(displayContext =>
            {
                if (_urlAlternates.Value == null || !_urlAlternates.Value.Any())
                {
                    return;
                }

                // prevent applying alternate again, c.f. https://github.com/OrchardCMS/Orchard/issues/2125
                if (displayContext.ShapeMetadata.Alternates.Any(x => x.Contains("__url__")))
                {
                    return;
                }

                // appends Url alternates to current ones
                displayContext.ShapeMetadata.Alternates = new AlternatesCollection(displayContext.ShapeMetadata.Alternates.SelectMany(
                    alternate => new[] { alternate }.Union(_urlAlternates.Value.Select(a => alternate + "__url__" + a))
                ).ToArray());

                // appends [ShapeType]__url__[Url] alternates
                displayContext.ShapeMetadata.Alternates = new AlternatesCollection(_urlAlternates.Value.Select(url =>
                    displayContext.ShapeMetadata.Type + "__url__" + url).Union(displayContext.ShapeMetadata.Alternates
                ).ToArray());
            });

            return Task.CompletedTask;
        }

        public Task DisplayingFinalizedAsync(ShapeDisplayContext context) => Task.CompletedTask;
    }
}