using OrchardCore.DisplayManagement.Implementation;
using AodlTheme.ShapeProviders;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using System;
using OrchardCore.Modules;
using Microsoft.AspNetCore.Routing;

namespace AodlTheme
{
    class Startup : StartupBase
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped<IShapeDisplayEvents,UrlAlternatesFactory>();
        }

        public override void Configure(IApplicationBuilder app, IRouteBuilder routes, IServiceProvider serviceProvider)
        {
        }
    }
}
