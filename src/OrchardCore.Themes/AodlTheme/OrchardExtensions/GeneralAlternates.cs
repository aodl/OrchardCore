using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OrchardCore.DisplayManagement.Implementation;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace AodlTheme.ShapeProviders
{
    //TODO, currently these are 'global alternates' triggered for every single type/part of content on the page. Ajax for example only needs to be for pages
    public class GeneralAlternatesFactory : IShapeDisplayEvents
    {
        private (string templateSuffix, Func<HttpContext, bool> predicate)[] alternateFactoryComponents = 
            new (string templateSuffix, Func<HttpContext, bool> predicate)[]{
                (
                    templateSuffix: "__ajax", 
                    predicate: httpContext => httpContext.Request.Headers != null && httpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest"
                ),
                (
                    templateSuffix: "__noncontent", 
                    predicate: httpContext => httpContext.GetRouteValue("area").ToString() != "OrchardCore.Contents"
                )
            };

        private HttpContext httpContext;

        public GeneralAlternatesFactory(IHttpContextAccessor httpContextAccessor) {
            httpContext = httpContextAccessor.HttpContext;
        }

        public Task DisplayedAsync(ShapeDisplayContext context) => Task.CompletedTask;

        public Task DisplayingAsync(ShapeDisplayContext context)
        {
            foreach(var afc in alternateFactoryComponents)
            {
                if (afc.predicate(httpContext))
                {
                    context.ShapeMetadata.OnDisplaying(displayContext =>
                    {
                        // prevent applying alternate again, c.f. https://github.com/OrchardCMS/Orchard/issues/2125
                        if (displayContext.ShapeMetadata.Alternates.Any(x => x.Contains(afc.templateSuffix)))
                            return;

                        // appends [ShapeType]__ajax alternates
                        displayContext.ShapeMetadata.Alternates.Add(displayContext.ShapeMetadata.Type + afc.templateSuffix);
                    });
                }
            }
            return Task.CompletedTask;
        }

        public Task DisplayingFinalizedAsync(ShapeDisplayContext context) => Task.CompletedTask;
    }
}