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
    public class AjaxAlternatesFactory : IShapeDisplayEvents
    {
        private HttpRequest request;

        public AjaxAlternatesFactory(IHttpContextAccessor httpContextAccessor) {
            request = httpContextAccessor.HttpContext.Request;
        }

        public Task DisplayedAsync(ShapeDisplayContext context) => Task.CompletedTask;

        public Task DisplayingAsync(ShapeDisplayContext context)
        {
            if (request.Headers != null && request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                context.ShapeMetadata.OnDisplaying(displayContext =>
                {
                    // prevent applying alternate again, c.f. https://github.com/OrchardCMS/Orchard/issues/2125
                    if (displayContext.ShapeMetadata.Alternates.Any(x => x.Contains("__ajax__")))
                        return;

                    // appends [ShapeType]__ajax alternates
                    displayContext.ShapeMetadata.Alternates.Add(displayContext.ShapeMetadata.Type + "__ajax");
                });
            }
            return Task.CompletedTask;
        }

        public Task DisplayingFinalizedAsync(ShapeDisplayContext context) => Task.CompletedTask;
    }
}