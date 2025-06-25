using System.Text;
using FlowersAPI.Data;
using FlowersAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.IO;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins(
                "http://localhost:3000",  // React development
                "http://localhost",       // IIS production
                "http://localhost:80",    // IIS explicit port
                "https://localhost",      // HTTPS IIS
                "https://*.ngrok.io",     // ngrok tunnels
                "https://*.ngrok-free.app" // new ngrok format
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Configure Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IFlowerService, FlowerService>();
builder.Services.AddScoped<IColorService, ColorService>();
builder.Services.AddScoped<IMeaningService, MeaningService>();
builder.Services.AddScoped<IFlowerPopularityService, FlowerPopularityService>();
builder.Services.AddScoped<IAIService, AIService>();

// Register enhanced services for diversity and lock functionality
builder.Services.AddScoped<IFlowerLockService, FlowerLockService>();
builder.Services.AddScoped<IBouquetDiversityService, BouquetDiversityService>();
builder.Services.AddScoped<IEnhancedAIService, EnhancedAIService>();

// Configure HttpClient with timeout for AI service
builder.Services.AddHttpClient<PythonAIService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "FlowersAPI/1.0");
});

// Register AI services
builder.Services.AddScoped<PythonAIService>();

// Add HttpClientFactory for Enhanced Bouquet Controller
builder.Services.AddHttpClient();

// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Flowers API with AI", 
        Version = "v1",
        Description = "API pentru biblioteca de flori cu inteligență artificială",
        Contact = new OpenApiContact
        {
            Name = "Flower Library AI",
            Email = "contact@flowerlibrary.ai"
        }
    });
    
    // Configure JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
    
    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Flowers API with AI v1");
        c.RoutePrefix = "swagger";
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
    });
}

// app.UseHttpsRedirection(); // Disabled for development
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => 
{
    return Results.Ok(new 
    { 
        status = "healthy", 
        timestamp = DateTime.UtcNow,
        version = "1.0.0",
        environment = app.Environment.EnvironmentName
    });
});

// AI service health check endpoint
app.MapGet("/health/ai", async (PythonAIService aiService) =>
{
    try
    {
        var isHealthy = await aiService.IsAIServiceHealthyAsync();
        if (isHealthy)
        {
            var modelInfo = await aiService.GetModelInfoAsync();
            return Results.Ok(new
            {
                status = "healthy",
                ai_service = "operational",
                model_loaded = true,
                timestamp = DateTime.UtcNow,
                model_info = modelInfo
            });
        }
        else
        {
            return Results.Ok(new
            {
                status = "unhealthy",
                ai_service = "not available",
                model_loaded = false,
                timestamp = DateTime.UtcNow,
                message = "AI service is not responding"
            });
        }
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 503,
            title: "AI Service Error"
        );
    }
});

// Middleware for logging requests to AI endpoints
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/aibouquet"))
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var startTime = DateTime.UtcNow;
        
        logger.LogInformation("AI Request started: {Method} {Path} at {Time}", 
            context.Request.Method, context.Request.Path, startTime);
        
        await next();
        
        var duration = DateTime.UtcNow - startTime;
        logger.LogInformation("AI Request completed: {StatusCode} in {Duration}ms", 
            context.Response.StatusCode, duration.TotalMilliseconds);
    }
    else
    {
        await next();
    }
});

// Seed the database when the application starts
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
        
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Database migration completed successfully");
        
        // Test AI service connection at startup
        try
        {
            var aiService = services.GetRequiredService<PythonAIService>();
            var aiHealthy = await aiService.IsAIServiceHealthyAsync();
            if (aiHealthy)
            {
                logger.LogInformation("✅ AI service is healthy and ready");
            }
            else
            {
                logger.LogWarning("⚠️ AI service is not available - some features may not work");
            }
        }
        catch (Exception aiEx)
        {
            logger.LogWarning(aiEx, "⚠️ Could not connect to AI service at startup");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

app.Run();
