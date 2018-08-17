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
    public class GeneralAlternatesFactory : IShapeDisplayEvents
    {
        private (string templateSuffix, Func<HttpRequest, bool> predicate)[] alternateFactoryComponents = 
            new (string templateSuffix, Func<HttpRequest, bool> predicate)[]{
                (
                    templateSuffix: "__ajax", 
                    predicate: request => request.Headers != null && request.Headers["X-Requested-With"] == "XMLHttpRequest"
                ),
                (
                    templateSuffix: "__iframe", 
                    predicate: request => request.Query["iframe"].Any(s => bool.TryParse(s, out var result))
                )
            };

        private HttpRequest request;

        public GeneralAlternatesFactory(IHttpContextAccessor httpContextAccessor) {
            request = httpContextAccessor.HttpContext.Request;
        }

        public Task DisplayedAsync(ShapeDisplayContext context) => Task.CompletedTask;

        public Task DisplayingAsync(ShapeDisplayContext context)
        {
            foreach(var afc in alternateFactoryComponents)
            {
                if (afc.predicate(request))
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