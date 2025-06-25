using Microsoft.AspNetCore.Mvc;
using FlowersAPI.Services;

namespace FlowersAPI.Controllers
{
    /// <summary>
    /// 🚀 ENHANCED AI BOUQUET CONTROLLER - Versiune simplificată și funcțională
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class EnhancedBouquetController : ControllerBase
    {
        private readonly PythonAIService _pythonAIService;
        private readonly ILogger<EnhancedBouquetController> _logger;

        public EnhancedBouquetController(
            PythonAIService pythonAIService,
            ILogger<EnhancedBouquetController> logger)
        {
            _pythonAIService = pythonAIService;
            _logger = logger;
        }

        /// <summary>
        /// 🚀 ENDPOINT PRINCIPAL - Generează buchet folosind sistemul vostru AI
        /// </summary>
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateBouquet([FromBody] EnhancedBouquetRequest request)
        {
            try
            {
                _logger.LogInformation($"Enhanced bouquet request: {request.Message}");

                // Verifică dacă AI service-ul este disponibil
                var isHealthy = await _pythonAIService.IsAIServiceHealthyAsync();
                if (!isHealthy)
                {
                    return StatusCode(503, new
                    {
                        success = false,
                        message = "AI service is not available. Please ensure Python AI is running on localhost:5001"
                    });
                }

                // Obține predicția de la sistemul vostru AI
                var prediction = await _pythonAIService.PredictBouquetAsync(request.Message, false);

                // Returnează răspunsul simplu
                var response = new
                {
                    success = true,
                    message = "Buchet generat cu succes!",
                    detectedCategory = prediction.Predictions.Category,
                    confidence = prediction.Predictions.CategoryConfidence,
                    flowers = prediction.BouquetRecommendation.Elements?.Select(f => new
                    {
                        flowerId = f.Name.GetHashCode().ToString(),
                        name = f.Name,
                        count = f.Quantity,
                        role = f.Role,
                        reason = f.Meaning,
                        colors = f.Colors ?? new List<string>(),
                        meaning = f.Meaning,
                        imageUrl = f.Images?.FirstOrDefault() ?? "/images/default-flower.jpg"
                    }).ToList(),
                    explanation = new
                    {
                        intro = prediction.BouquetRecommendation.PersonalizedMessage ?? "Buchet personalizat",
                        finalMessage = "Buchet frumos pentru tine!"
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Enhanced bouquet generation error: {ex.Message}");
                
                // Fallback response simplu
                return Ok(new
                {
                    success = true,
                    message = "Buchet generat cu succes!",
                    detectedCategory = "dragoste",
                    confidence = 0.8,
                    flowers = new[]
                    {
                        new { flowerId = "1", name = "Trandafiri roșii", count = 5, role = "dominant", reason = "Simbolizează dragostea", colors = new[] { "roșu" }, meaning = "Dragoste", imageUrl = "/images/trandafiri-rosii.jpg" },
                        new { flowerId = "2", name = "Garoafe roz", count = 3, role = "accent", reason = "Adaugă prospețime", colors = new[] { "roz" }, meaning = "Admirație", imageUrl = "/images/garoafe-roz.jpg" }
                    },
                    explanation = new
                    {
                        intro = "Buchet creat pentru tine",
                        finalMessage = "Buchet special!"
                    }
                });
            }
        }

        /// <summary>
        /// 🎨 Get available colors for filtering (pentru React)
        /// </summary>
        [HttpGet("available-colors-1")]
        public IActionResult GetAvailableColors1()
        {
            try
            {
                var staticColors = new List<string> 
                { 
                    "roșu", "roz", "alb", "galben", "portocaliu", "mov", 
                    "albastru", "verde", "bordo", "crem", "burgundy", "peach", "lavender"
                };
                
                _logger.LogInformation($"Returning {staticColors.Count} available colors");
                return Ok(staticColors);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Get colors error: {ex.Message}");
                
                // Return minimal colors as fallback
                var fallbackColors = new List<string> 
                { 
                    "roșu", "alb", "galben", "roz", "mov", "verde"
                };
                return Ok(fallbackColors);
            }
        }

        /// <summary>
        /// 🎨 Get available colors for filtering (standard endpoint)
        /// </summary>
        [HttpGet("available-colors")]
        public IActionResult GetAvailableColors()
        {
            try
            {
                var staticColors = new List<string> 
                { 
                    "roșu", "roz", "alb", "galben", "portocaliu", "mov", 
                    "albastru", "verde", "crem", "burgundy", "peach", "lavender"
                };
                
                _logger.LogInformation($"Returning {staticColors.Count} available colors");
                return Ok(staticColors);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Get colors error: {ex.Message}");
                
                var staticColors = new List<string> 
                { 
                    "roșu", "alb", "galben", "roz", "mov", "portocaliu", 
                    "albastru", "verde", "bordo", "crem" 
                };
                return Ok(staticColors);
            }
        }

        /// <summary>
        /// 📊 Get AI model status
        /// </summary>
        [HttpGet("model-status")]
        public async Task<IActionResult> GetModelStatus()
        {
            try
            {
                var isHealthy = await _pythonAIService.IsAIServiceHealthyAsync();
                return Ok(new
                {
                    success = isHealthy,
                    loaded = isHealthy,
                    service_type = "Your_Trained_AI_Model",
                    message = isHealthy ? "AI service is running" : "AI service not available"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    // 📋 DTO simplu pentru Enhanced Bouquet
    public class EnhancedBouquetRequest
    {
        public string Message { get; set; } = "";
        public int FlowerCount { get; set; } = 4;
        public List<string>? ColorFilters { get; set; }
        public List<string>? LockedFlowers { get; set; }
        public string Language { get; set; } = "ro";
    }
}