using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using FlowersAPI.DTOs.BouquetDTOs;
using FlowersAPI.DTOs.FlowerDTOs;

namespace FlowersAPI.Services
{
    /// <summary>
    /// Service care se conectează direct la AI Model Bridge (port 5001)
    /// pentru a folosi modelul antrenat cu 9 categorii și baza de date cu 113+ flori
    /// </summary>
    public class AIBridgeService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AIBridgeService> _logger;
        private readonly string _aiBridgeUrl = "http://localhost:5001";

        public AIBridgeService(HttpClient httpClient, ILogger<AIBridgeService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            
            // Configurare timeout pentru requests
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<BouquetResponse> GenerateBouquetRecommendation(string message, List<FlowerDTO> availableFlowers)
        {
            try
            {
                _logger.LogInformation("🌸 Generez buchet cu AI Model Bridge pentru: {Message}", message.Substring(0, Math.Min(50, message.Length)));

                // Verifică dacă AI Model Bridge este disponibil
                var isHealthy = await CheckHealthAsync();
                if (!isHealthy)
                {
                    _logger.LogWarning("⚠️ AI Model Bridge nu răspunde, folosesc fallback local");
                    return GenerateLocalFallback(message, availableFlowers);
                }

                // Pregătește request-ul pentru AI Model Bridge
                var requestData = new
                {
                    message = message,
                    language = "ro"
                };

                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Trimite request către AI Model Bridge
                var response = await _httpClient.PostAsync($"{_aiBridgeUrl}/api/recommend", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (apiResponse.GetProperty("success").GetBoolean())
                    {
                        var result = apiResponse.GetProperty("result");
                        
                        _logger.LogInformation("✅ Răspuns primit de la AI Model Bridge");
                        
                        return await ConvertAIBridgeResponseToBouquetResponse(result, availableFlowers, message);
                    }
                    else
                    {
                        var error = apiResponse.TryGetProperty("error", out var errorProp) ? errorProp.GetString() : "Unknown error";
                        _logger.LogError("❌ AI Model Bridge a returnat eroare: {Error}", error);
                        return GenerateLocalFallback(message, availableFlowers);
                    }
                }
                else
                {
                    _logger.LogError("❌ AI Model Bridge request failed: {StatusCode} - {Content}", response.StatusCode, responseContent);
                    return GenerateLocalFallback(message, availableFlowers);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Eroare la conectarea cu AI Model Bridge");
                return GenerateLocalFallback(message, availableFlowers);
            }
        }

        public async Task<BouquetResponse> GenerateBouquetRecommendationWithCombinedMeanings(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers)
        {
            // Convertește la FlowerDTO pentru compatibilitate
            var simplifiedFlowers = availableFlowers.Select(f => new FlowerDTO
            {
                Id = f.Id,
                Name = f.Name,
                LatinName = f.LatinName,
                Description = f.Description,
                ImageUrl = f.ImageUrl,
                ColorId = f.ColorId,
                ColorName = f.ColorName,
                Meanings = f.AllMeanings?.Split(", ").Select(m => new MeaningDto { Name = m }).ToList() ?? new List<MeaningDto>()
            }).ToList();

            return await GenerateBouquetRecommendation(message, simplifiedFlowers);
        }

        public async Task<BouquetResponse> GenerateBouquetRecommendationWithDeepSeekApi(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers)
        {
            // Redirectează către AI Model Bridge în loc de DeepSeek
            return await GenerateBouquetRecommendationWithCombinedMeanings(message, availableFlowers);
        }

        /// <summary>
        /// Generează buchet cu parametri avansați - pentru Enhanced service
        /// </summary>
        public async Task<BouquetResponse> GenerateEnhancedBouquetAsync(
            string message, 
            List<FlowerDTO> availableFlowers,
            List<string> preferredColors = null,
            int? numFlowers = null,
            List<string> lockedFlowers = null)
        {
            try
            {
                _logger.LogInformation("🎨 Generez buchet enhanced cu parametri: culori={Colors}, număr={NumFlowers}, locked={LockedCount}", 
                    preferredColors != null ? string.Join(",", preferredColors) : "none",
                    numFlowers ?? 4,
                    lockedFlowers?.Count ?? 0);

                // Verifică health
                var isHealthy = await CheckHealthAsync();
                if (!isHealthy)
                {
                    return GenerateLocalFallback(message, availableFlowers);
                }

                // Pregătește request enhanced
                var requestData = new
                {
                    message = message,
                    language = "ro",
                    numFlowers = numFlowers ?? 4,
                    colorFilter = MapColorsToColorIds(preferredColors, availableFlowers),
                    lockedFlowers = lockedFlowers ?? new List<string>(),
                    generateAlternatives = false
                };

                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_aiBridgeUrl}/api/recommend", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (apiResponse.GetProperty("success").GetBoolean())
                    {
                        var result = apiResponse.GetProperty("result");
                        return await ConvertAIBridgeResponseToBouquetResponse(result, availableFlowers, message);
                    }
                }

                // Fallback la generarea locală cu parametri
                return GenerateLocalFallbackWithParams(message, availableFlowers, preferredColors, numFlowers, lockedFlowers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Eroare la generarea enhanced");
                return GenerateLocalFallbackWithParams(message, availableFlowers, preferredColors, numFlowers, lockedFlowers);
            }
        }

        /// <summary>
        /// Generează alternative pentru un buchet
        /// </summary>
        public async Task<List<BouquetResponse>> GenerateAlternativesAsync(
            string message, 
            List<FlowerDTO> availableFlowers, 
            List<int> excludeFlowerIds = null)
        {
            try
            {
                _logger.LogInformation("🔄 Generez alternative pentru mesajul: {Message}", message.Substring(0, Math.Min(30, message.Length)));

                var alternatives = new List<BouquetResponse>();

                // Generează 3 alternative
                for (int i = 0; i < 3; i++)
                {
                    // Exclude florile folosite în alternativele anterioare
                    var currentExcludeIds = new List<int>();
                    if (excludeFlowerIds != null) currentExcludeIds.AddRange(excludeFlowerIds);
                    
                    // Adaugă florile din alternativele anterioare
                    foreach (var alt in alternatives)
                    {
                        currentExcludeIds.AddRange(alt.Flowers.Select(f => f.FlowerId));
                    }

                    // Filtrează florile disponibile
                    var filteredFlowers = availableFlowers.Where(f => !currentExcludeIds.Contains(f.Id)).ToList();
                    
                    if (filteredFlowers.Count >= 3)
                    {
                        var alternative = await GenerateBouquetRecommendation(message, filteredFlowers);
                        alternative.BouquetName = $"Alternativa {i + 1}: " + alternative.BouquetName;
                        alternatives.Add(alternative);
                    }
                }

                return alternatives;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Eroare la generarea alternativelor");
                return new List<BouquetResponse>();
            }
        }

        private async Task<bool> CheckHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_aiBridgeUrl}/health");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var healthData = JsonSerializer.Deserialize<JsonElement>(content);
                    return healthData.GetProperty("status").GetString() == "healthy";
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        private async Task<BouquetResponse> ConvertAIBridgeResponseToBouquetResponse(JsonElement result, List<FlowerDTO> availableFlowers, string message)
        {
            var bouquetFlowers = new List<BouquetFlower>();

            // Extrage florile recomandate
            if (result.TryGetProperty("suggested_flowers", out var suggestedFlowers))
            {
                foreach (var flowerName in suggestedFlowers.EnumerateArray())
                {
                    var name = flowerName.GetString();
                    
                    // Mapează numele AI către florile din baza de date
                    var matchedFlower = FindMatchingFlower(name, availableFlowers);
                    
                    if (matchedFlower != null)
                    {
                        bouquetFlowers.Add(new BouquetFlower
                        {
                            FlowerId = matchedFlower.Id,
                            FlowerName = matchedFlower.Name,
                            ImageUrl = matchedFlower.ImageUrl,
                            Reason = GenerateReasonForFlower(matchedFlower, message)
                        });
                    }
                }
            }

            // Asigură-te că ai cel puțin 3 flori
            if (bouquetFlowers.Count < 3)
            {
                var usedIds = bouquetFlowers.Select(f => f.FlowerId).ToHashSet();
                var additionalFlowers = availableFlowers
                    .Where(f => !usedIds.Contains(f.Id))
                    .Take(3 - bouquetFlowers.Count);

                foreach (var flower in additionalFlowers)
                {
                    bouquetFlowers.Add(new BouquetFlower
                    {
                        FlowerId = flower.Id,
                        FlowerName = flower.Name,
                        ImageUrl = flower.ImageUrl,
                        Reason = "Adăugată pentru completarea buchetului"
                    });
                }
            }

            // Extrage informații din răspuns
            var category = result.TryGetProperty("category", out var cat) ? cat.GetString() : "general";
            var explanation = result.TryGetProperty("explanation", out var expl) ? expl.GetString() : "Buchet generat cu AI";

            return new BouquetResponse
            {
                BouquetName = GetBouquetNameForCategory(category),
                MessageInterpretation = explanation,
                Flowers = bouquetFlowers
            };
        }

        private FlowerDTO FindMatchingFlower(string aiFlowerName, List<FlowerDTO> availableFlowers)
        {
            var searchName = aiFlowerName.ToLower();
            
            // Mapări pentru numele AI către numele din baza de date
            var mappings = new Dictionary<string, string[]>
            {
                { "trandafiri_rosii", new[] { "trandafir", "rosu", "red", "rose" } },
                { "trandafiri_albi", new[] { "trandafir", "alb", "white", "rose" } },
                { "trandafiri_roz", new[] { "trandafir", "roz", "pink", "rose" } },
                { "garoafe_albe", new[] { "garoafa", "garofita", "alb", "white", "carnation" } },
                { "crini_albi", new[] { "crin", "alb", "white", "lily" } },
                { "eucalipt", new[] { "eucalipt", "eucalyptus" } },
                { "lalele", new[] { "lalea", "tulip" } },
                { "margarete", new[] { "margareta", "daisy" } }
            };

            // Încearcă maparea exactă
            if (mappings.ContainsKey(searchName))
            {
                var keywords = mappings[searchName];
                foreach (var flower in availableFlowers)
                {
                    var flowerName = flower.Name.ToLower();
                    if (keywords.All(k => flowerName.Contains(k)))
                    {
                        return flower;
                    }
                }
            }

            // Încearcă potrivirea parțială
            foreach (var flower in availableFlowers)
            {
                var flowerName = flower.Name.ToLower();
                if (flowerName.Contains(searchName) || searchName.Contains(flowerName))
                {
                    return flower;
                }
            }

            // Întoarce prima floare disponibilă ca fallback
            return availableFlowers.FirstOrDefault();
        }

        private string GenerateReasonForFlower(FlowerDTO flower, string message)
        {
            var messageLower = message.ToLower();
            
            if (messageLower.Contains("iubesc") || messageLower.Contains("dragoste"))
                return $"Am ales {flower.Name.ToLower()} pentru a exprima dragostea și pasiunea din mesajul tău.";
            else if (messageLower.Contains("condoleante") || messageLower.Contains("odihna"))
                return $"Am inclus {flower.Name.ToLower()} pentru a transmite compasiune și alinare în această perioadă dificilă.";
            else if (messageLower.Contains("la multi ani") || messageLower.Contains("aniversare"))
                return $"Am selectat {flower.Name.ToLower()} pentru a celebra această zi specială cu bucurie.";
            else
                return $"Am ales {flower.Name.ToLower()} pentru frumusețea și simbolismul său special în acest buchet.";
        }

        private string GetBouquetNameForCategory(string category)
        {
            return category switch
            {
                "romantic" => "Buchet Romantic cu Dragoste",
                "sympathy" => "Buchet de Condoleanțe și Alinare",
                "birthday" => "Buchet Festiv de Aniversare",
                "friendship" => "Buchet de Prietenie Sinceră",
                "gratitude" => "Buchet de Recunoștință",
                "celebration" => "Buchet de Sărbătoare",
                "mothersday" => "Buchet Special pentru Mama",
                "wellness" => "Buchet de Însănătoșire",
                _ => "Buchet Personalizat"
            };
        }

        private int? MapColorsToColorIds(List<string> colorNames, List<FlowerDTO> availableFlowers)
        {
            if (colorNames == null || !colorNames.Any()) return null;

            // Mapare culori nume → ID-uri
            var colorMapping = new Dictionary<string, int>
            {
                { "red", 1 }, { "rosu", 1 }, { "roșu", 1 },
                { "white", 2 }, { "alb", 2 },
                { "pink", 3 }, { "roz", 3 },
                { "yellow", 4 }, { "galben", 4 },
                { "purple", 5 }, { "mov", 5 },
                { "blue", 6 }, { "albastru", 6 },
                { "green", 7 }, { "verde", 7 },
                { "orange", 8 }, { "portocaliu", 8 }
            };

            foreach (var colorName in colorNames)
            {
                if (colorMapping.TryGetValue(colorName.ToLower(), out var colorId))
                {
                    return colorId;
                }
            }

            return null;
        }

        private BouquetResponse GenerateLocalFallback(string message, List<FlowerDTO> availableFlowers)
        {
            _logger.LogInformation("🔄 Folosesc fallback local pentru: {Message}", message.Substring(0, Math.Min(30, message.Length)));

            // Selectează 3-4 flori random
            var selectedFlowers = availableFlowers
                .OrderBy(x => Guid.NewGuid())
                .Take(4)
                .Select(f => new BouquetFlower
                {
                    FlowerId = f.Id,
                    FlowerName = f.Name,
                    ImageUrl = f.ImageUrl,
                    Reason = $"Am ales {f.Name.ToLower()} pentru frumusețea și simbolismul său."
                })
                .ToList();

            return new BouquetResponse
            {
                BouquetName = "Buchet Personalizat",
                MessageInterpretation = "Am creat un buchet special bazat pe mesajul tău.",
                Flowers = selectedFlowers
            };
        }

        private BouquetResponse GenerateLocalFallbackWithParams(
            string message, 
            List<FlowerDTO> availableFlowers, 
            List<string> preferredColors = null,
            int? numFlowers = null,
            List<string> lockedFlowers = null)
        {
            var targetCount = numFlowers ?? 4;
            
            // Filtrează după culori dacă sunt specificate
            var filteredFlowers = availableFlowers;
            if (preferredColors != null && preferredColors.Any())
            {
                var colorId = MapColorsToColorIds(preferredColors, availableFlowers);
                if (colorId.HasValue)
                {
                    filteredFlowers = availableFlowers.Where(f => f.ColorId == colorId.Value).ToList();
                    if (!filteredFlowers.Any())
                    {
                        filteredFlowers = availableFlowers; // Fallback dacă nicio floare nu se potrivește
                    }
                }
            }

            // Selectează flori
            var selectedFlowers = filteredFlowers
                .OrderBy(x => Guid.NewGuid())
                .Take(targetCount)
                .Select(f => new BouquetFlower
                {
                    FlowerId = f.Id,
                    FlowerName = f.Name,
                    ImageUrl = f.ImageUrl,
                    Reason = $"Am ales {f.Name.ToLower()} pentru frumusețea și simbolismul său."
                })
                .ToList();

            return new BouquetResponse
            {
                BouquetName = "Buchet Personalizat Enhanced",
                MessageInterpretation = "Am creat un buchet special bazat pe mesajul și preferințele tale.",
                Flowers = selectedFlowers
            };
        }
    }
}