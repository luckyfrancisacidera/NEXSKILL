using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.Features;
using SkillSense.Infrastructure;
using SkillSense.Application;
using SkillSense.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddApplicationServices();
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartHeadersLengthLimit = 1024 * 1024;
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024;
    options.ValueLengthLimit = 1024 * 1024;
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    var error = ctx.Features.Get<IExceptionHandlerFeature>();
    if (error is not null)
        await ctx.Response.WriteAsJsonAsync(new { message = error.Error.Message });
}));

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
