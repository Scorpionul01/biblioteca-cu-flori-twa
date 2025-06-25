using System.Text;
using System.Text.Json;

namespace FlowersAPI.Services
{
    public class PythonAIService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<PythonAIService> _logger;
        private readonly string _pythonApiUrl;
        
        public PythonAIService(HttpClient httpClient, ILogger<PythonAIService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _pythonApiUrl = configuration["PythonAI:ApiUrl"] ?? "http://localhost:5001";
            
            // Configurare timeout pentru requests
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<bool> IsAIServiceHealthyAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_pythonApiUrl}/health");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var healthData = JsonSerializer.Deserialize<JsonElement>(content);
                    
                    return healthData.GetProperty("recommender_available").GetBoolean();
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking AI service health");
                return false;
            }
        }

        public async Task<AIModelInfoDto> GetModelInfoAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_pythonApiUrl}/api/model-info");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse.GetProperty("success").GetBoolean())
                {
                    var modelInfo = apiResponse.GetProperty("model_info");
                    
                    return new AIModelInfoDto
                    {
                        Trained = true,
                        TrainingExamples = modelInfo.TryGetProperty("training_examples", out var te) ? te.GetInt32() : 50000,
                        FeatureCount = modelInfo.TryGetProperty("feature_count", out var fc) ? fc.GetInt32() : 10000,
                        Categories = modelInfo.TryGetProperty("categories", out var cats) ? 
                            cats.EnumerateArray().Select(x => x.GetString()).ToList() : new List<string>(),
                        AccuracyScores = new Dictionary<string, double> { { "overall", 0.85 } }
                    };
                }
                else
                {
                    throw new Exception($"AI service error: {apiResponse.GetProperty("error").GetString()}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting model info from AI service");
                throw;
            }
        }

        public async Task<AIBouquetPredictionDto> PredictBouquetAsync(string message, bool includeVisual = false)
        {
            try
            {
                var requestData = new
                {
                    message = message,
                    language = "ro"
                };

                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending bouquet prediction request for message: {Message}", message.Substring(0, Math.Min(50, message.Length)));

                var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/recommend", content);
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
                        
                        _logger.LogInformation("Successfully received bouquet prediction");
                        
                        return new AIBouquetPredictionDto
                        {
                            InputMessage = message,
                            Predictions = new AIBouquetPredictionsDto
                            {
                                Category = result.TryGetProperty("category", out var cat) ? cat.GetString() : "general",
                                CategoryConfidence = result.TryGetProperty("confidence", out var conf) ? conf.GetDouble() : 0.8,
                                SentimentScore = result.TryGetProperty("sentiment_score", out var sent) ? sent.GetDouble() : 0.5,
                                Complexity = "medium",
                                SuggestedColors = result.TryGetProperty("suggested_colors", out var colors) ?
                                    colors.EnumerateArray().Select(x => x.GetString()).ToList() : new List<string>(),
                                SuggestedFlowers = result.TryGetProperty("suggested_flowers", out var flowers) ?
                                    flowers.EnumerateArray().Select(x => x.GetString()).ToList() : new List<string>()
                            },
                           BouquetRecommendation = new AIBouquetRecommendationDto
                            {
                                PersonalizedMessage = result.TryGetProperty("explanation", out var expl) ? 
                                    expl.GetString() : "Buchet recomandat bazat pe analiza AI a mesajului tău.",
                                EstimatedPrice = result.TryGetProperty("estimated_price", out var price) ? price.GetDouble() : 75.0,
                                Elements = await CreateFlowerElementsFromAIAsync(result, _httpClient)
                            },
                            Metadata = new AIMetadataDto
                            {
                                PredictionTime = DateTime.UtcNow,
                                ModelVersion = "1.0",
                                IncludeVisual = includeVisual
                            }
                        };
                    }
                    else
                    {
                        throw new Exception($"AI prediction error: {apiResponse.GetProperty("error").GetString()}");
                    }
                }
                else
                {
                    _logger.LogError("AI service returned error: {StatusCode} - {Content}", response.StatusCode, responseContent);
                    throw new Exception($"AI service error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bouquet prediction from AI service");
                throw;
            }
        }

        public async Task<AITextAnalysisDto> AnalyzeTextAsync(string message)
        {
            try
            {
                var requestData = new { message = message };
                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/classify", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse.GetProperty("success").GetBoolean())
                {
                    var result = apiResponse.GetProperty("result");
                    
                    return new AITextAnalysisDto
                    {
                        OriginalMessage = message,
                        ProcessedText = message.ToLower(),
                        Predictions = new AIBouquetPredictionsDto
                        {
                            Category = result.TryGetProperty("category", out var cat) ? cat.GetString() : "general",
                            CategoryConfidence = result.TryGetProperty("confidence", out var conf) ? conf.GetDouble() : 0.8,
                            SentimentScore = result.TryGetProperty("sentiment_score", out var sent) ? sent.GetDouble() : 0.5
                        },
                        AnalysisTime = DateTime.UtcNow
                    };
                }
                else
                {
                    throw new Exception($"AI analysis error: {apiResponse.GetProperty("error").GetString()}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing text with AI service");
                throw;
            }
        }

        public async Task<AIBatchPredictionDto> PredictBatchAsync(List<string> messages)
        {
            try
            {
                var requestData = new { messages = messages, language = "ro" };
                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/batch-recommend", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse.GetProperty("success").GetBoolean())
                {
                    var results = apiResponse.GetProperty("results");
                    var count = apiResponse.GetProperty("count").GetInt32();
                    
                    return new AIBatchPredictionDto
                    {
                        Results = results.EnumerateArray().Select((result, index) => new AIBatchResultDto
                        {
                            Index = index,
                            Success = true,
                            Data = new AIBouquetPredictionDto
                            {
                                InputMessage = messages[index],
                                Predictions = new AIBouquetPredictionsDto
                                {
                                    Category = result.TryGetProperty("category", out var cat) ? cat.GetString() : "general",
                                    CategoryConfidence = result.TryGetProperty("confidence", out var conf) ? conf.GetDouble() : 0.8
                                }
                            }
                        }).ToList(),
                        Statistics = new AIBatchStatisticsDto
                        {
                            TotalMessages = messages.Count,
                            SuccessfulPredictions = count,
                            FailedPredictions = messages.Count - count,
                            SuccessRate = (double)count / messages.Count
                        }
                    };
                }
                else
                {
                    throw new Exception($"AI batch prediction error: {apiResponse.GetProperty("error").GetString()}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error with batch prediction from AI service");
                throw;
            }
        }

        public async Task<string> GenerateVisualAsync(object bouquetData, string? filename = null)
        {
            try
            {
                // Pentru moment, returnăm un placeholder
                // Funcționalitatea de generare vizuală poate fi implementată mai târziu
                var imagePath = $"/generated/{filename ?? $"bouquet_{DateTime.Now:yyyyMMdd_HHmmss}.png"}";
                
                _logger.LogInformation("Visual generation requested, returning placeholder: {ImagePath}", imagePath);
                
                return imagePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating visual with AI service");
                throw;
            }
        }
private async Task<List<AIBouquetElementDto>> CreateFlowerElementsFromAIAsync(JsonElement result, HttpClient httpClient)
{
    var elements = new List<AIBouquetElementDto>();
    
    if (!result.TryGetProperty("suggested_flowers", out var flowers))
    {
        _logger.LogWarning("Nu s-au găsit suggested_flowers în rezultatul AI");
        return elements;
    }

    try
    {
        _logger.LogInformation("Încercare de obținere flori din baza de date...");
        
        // Obține toate florile din baza de date
        var response = await httpClient.GetAsync("http://localhost:5002/api/flowers");
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Request-ul către API-ul de flori a eșuat: {StatusCode}", response.StatusCode);
            return CreateGenericFlowers(flowers);
        }

        var content = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("Răspuns primit din API flowers: {Length} caractere", content.Length);
        
        // CORECTARE: Deserializează ca JsonElement pentru a verifica structura
        var jsonResponse = JsonSerializer.Deserialize<JsonElement>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        JsonElement dbFlowersArray;
        
        // Verifică dacă răspunsul este array direct sau obiect cu proprietăți
        if (jsonResponse.ValueKind == JsonValueKind.Array)
        {
            dbFlowersArray = jsonResponse;
        }
        else if (jsonResponse.TryGetProperty("data", out var dataProperty))
        {
            dbFlowersArray = dataProperty;
        }
        else if (jsonResponse.TryGetProperty("flowers", out var flowersProperty))
        {
            dbFlowersArray = flowersProperty;
        }
        else
        {
            _logger.LogError("Nu s-a putut găsi array-ul de flori în răspuns");
            return CreateGenericFlowers(flowers);
        }

        _logger.LogInformation("Array găsit cu {Count} flori", dbFlowersArray.GetArrayLength());
        
        // DEBUG: Afișează primul element din baza de date
        if (dbFlowersArray.GetArrayLength() > 0)
        {
            var firstFlower = dbFlowersArray[0];
            _logger.LogInformation("Prima floare din DB: {Flower}", firstFlower.ToString());
        }
        
        // DEBUG: Afișează ce flori recomandă AI-ul
        var aiFlowerNames = flowers.EnumerateArray().Select(f => f.GetString()).ToList();
        _logger.LogInformation("AI recomandă florile: {AIFlowers}", string.Join(", ", aiFlowerNames));

        // Mapează fiecare floare AI cu florile din baza de date
        foreach (var aiFlower in flowers.EnumerateArray())
        {
            var aiFlowerName = aiFlower.GetString();
            _logger.LogInformation("Procesez floarea AI: {FlowerName}", aiFlowerName);
            
            var matchedFlower = FindMatchingFlower(aiFlowerName, dbFlowersArray);
            
            if (matchedFlower.HasValue)
            {
                _logger.LogInformation("Floare găsită în baza de date pentru: {AIFlower}", aiFlowerName);
                
                // Folosește datele reale din baza de date
                var flower = matchedFlower.Value;
                
                // DEBUG: Afișează ce proprietăți are floarea găsită
                _logger.LogInformation("Floare găsită: {FlowerData}", flower.ToString());
                
                elements.Add(new AIBouquetElementDto
                {
                    Name = flower.TryGetProperty("name", out var name) ? name.GetString() : aiFlowerName,
                    LatinName = flower.TryGetProperty("latinName", out var latin) ? latin.GetString() : "",
                    Meaning = flower.TryGetProperty("description", out var desc) ? desc.GetString() : "",
                    Quantity = Random.Shared.Next(3, 8),
                    Type = "flower",
                    Role = "focal",
                    Colors = flower.TryGetProperty("colorName", out var color) ? 
                           new List<string> { color.GetString() } : new List<string>(),
                    Images = flower.TryGetProperty("imageUrl", out var img) ? 
                           new List<string> { img.GetString() } : new List<string>()
                });
            }
            else
            {
                _logger.LogWarning("Nu s-a găsit floare în baza de date pentru: {AIFlower}", aiFlowerName);
                _logger.LogInformation("Încerc maparea manuală...");
                
                // Încearcă maparea manuală pentru debugging
                foreach (var dbFlower in dbFlowersArray.EnumerateArray().Take(5))
                {
                    if (dbFlower.TryGetProperty("name", out var dbName))
                    {
                        _logger.LogInformation("Floare în DB: {DBFlowerName}", dbName.GetString());
                    }
                }
                
                elements.Add(CreateGenericFlower(aiFlowerName));
            }
        }
        
        _logger.LogInformation("Procesare completă: {Count} elemente create", elements.Count);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Eroare la obținerea florilor din baza de date");
        return CreateGenericFlowers(flowers);
    }

    return elements;
}

private JsonElement? FindMatchingFlower(string aiFlowerName, JsonElement dbFlowersArray)
{
    var mappings = new Dictionary<string, string[]>
    {
        // MAPARE EXACTĂ - numele trebuie să se potrivească perfect
        { "trandafiri_rosii", new[] { "trandafir roșu" } },
        { "trandafiri_roz", new[] { "trandafir roz" } },
        { "trandafiri_albi", new[] { "trandafir alb" } },
        { "trandafiri_galbeni", new[] { "trandafir galben" } },
        { "eucalipt", new[] { "eucalipt" } },
        { "frezii", new[] { "frezie" } },
        { "garoafe_rosii", new[] { "garofiță roșie" } },
        { "garoafe_roz", new[] { "garofiță roz" } },
        { "garoafe_albe", new[] { "garofiță albă" } },
        { "lalele_rosii", new[] { "lalea roșie" } },
        { "lalele_roz", new[] { "lalea roz" } },
        { "lalele_galbene", new[] { "lalea galbenă" } },
        { "bujori", new[] { "bujor" } },
        { "margarete", new[] { "margarete" } },
        { "orchidee", new[] { "orhidee", "orchidee" } },
        { "iris", new[] { "iris" } },
        { "narcise", new[] { "narcisă" } },
        { "zambile", new[] { "zambilă" } },
        { "floarea_soarelui", new[] { "floarea soarelui" } },
        { "crizanteme", new[] { "crizantemă" } },
        { "crini", new[] { "crin" } },
        { "alstroemeria", new[] { "alstroemeria", "crin peruan" } },
        { "mac", new[] { "mac" } },
        { "musetel", new[] { "mușețel" } }
    };

    _logger.LogInformation("Căutare pentru floarea AI: {AIFlower}", aiFlowerName);
    
    // Căutare exactă prin mappings
    if (mappings.TryGetValue(aiFlowerName.ToLower(), out var exactMatches))
    {
        foreach (var exactMatch in exactMatches)
        {
            foreach (var flower in dbFlowersArray.EnumerateArray())
            {
                if (flower.TryGetProperty("name", out var nameElement))
                {
                    var flowerName = nameElement.GetString()?.ToLower() ?? "";
                    if (flowerName.Contains(exactMatch.ToLower()))
                    {
                        _logger.LogInformation("Potrivire exactă: {AIFlower} -> {DBFlower}", aiFlowerName, nameElement.GetString());
                        return flower;
                    }
                }
            }
        }
    }
    
    _logger.LogWarning("Nu s-a găsit potrivire exactă pentru: {AIFlower}", aiFlowerName);
    
    // Dacă nu găsește exact, încearcă potrivire parțială DOAR pe primul cuvânt
    var firstWord = aiFlowerName.Split('_')[0].ToLower();
    _logger.LogInformation("Încearcă potrivire parțială cu primul cuvânt: {FirstWord}", firstWord);
    
    foreach (var flower in dbFlowersArray.EnumerateArray())
    {
        if (flower.TryGetProperty("name", out var nameElement))
        {
            var flowerName = nameElement.GetString()?.ToLower() ?? "";
            if (flowerName.Contains(firstWord) && firstWord.Length > 3) // Evită potriviri de 1-2 caractere
            {
                _logger.LogInformation("Potrivire parțială: {AIFlower} -> {DBFlower}", aiFlowerName, nameElement.GetString());
                return flower;
            }
        }
    }
    
    _logger.LogWarning("Nicio potrivire găsită pentru: {AIFlower}", aiFlowerName);
    return null;
}

private AIBouquetElementDto CreateGenericFlower(string aiFlowerName)
{
    return new AIBouquetElementDto
    {
        Name = aiFlowerName.Replace("_", " ").Replace(
            aiFlowerName.Substring(0, 1), 
            aiFlowerName.Substring(0, 1).ToUpper()),
        Meaning = $"Floare aleasă pentru simbolismul ei în buchet",
        Quantity = Random.Shared.Next(3, 8),
        Type = "flower",
        Role = "focal",
        Colors = new List<string> { "natural" },
        Images = new List<string>()
    };
}

private List<AIBouquetElementDto> CreateGenericFlowers(JsonElement flowers)
{
    return flowers.EnumerateArray()
        .Select(f => CreateGenericFlower(f.GetString()))
        .ToList();
}
    }

    // DTOs pentru comunicarea cu Python API
    public class PythonApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Error { get; set; }
    }

    public class AIModelInfoDto
    {
        public bool Trained { get; set; }
        public int TrainingExamples { get; set; }
        public int FeatureCount { get; set; }
        public List<string> Categories { get; set; } = new();
        public List<string> ComplexityLevels { get; set; } = new();
        public List<string> AvailableColors { get; set; } = new();
        public List<string> AvailableFlowers { get; set; } = new();
        public Dictionary<string, double> AccuracyScores { get; set; } = new();
    }

    public class AIBouquetPredictionDto
    {
        public string InputMessage { get; set; }
        public AIBouquetPredictionsDto Predictions { get; set; }
        public AIBouquetRecommendationDto BouquetRecommendation { get; set; }
        public AIMetadataDto Metadata { get; set; }
        public AIVisualDto Visual { get; set; }
    }

    public class AIBouquetPredictionsDto
    {
        public string Category { get; set; }
        public double CategoryConfidence { get; set; }
        public double SentimentScore { get; set; }
        public string Complexity { get; set; }
        public List<string> SuggestedColors { get; set; } = new();
        public List<string> SuggestedFlowers { get; set; } = new();
    }

    public class AIBouquetRecommendationDto
    {
        public List<AIBouquetElementDto> Elements { get; set; } = new();
        public int TotalStems { get; set; }
        public List<string> DominantColors { get; set; } = new();
        public double EstimatedPrice { get; set; }
        public string PersonalizedMessage { get; set; }
        public List<string> CareInstructions { get; set; } = new();
        public string DeliveryEstimate { get; set; }
    }

    public class AIBouquetElementDto
    {
        public string Type { get; set; } // flower, foliage, texture
        public string Name { get; set; }
        public string LatinName { get; set; }
        public List<string> Colors { get; set; } = new();
        public int Quantity { get; set; }
        public string Role { get; set; } // focal, filler, line, accent
        public string Meaning { get; set; }
        public List<string> Images { get; set; } = new();
    }

    public class AITextAnalysisDto
    {
        public string OriginalMessage { get; set; }
        public string ProcessedText { get; set; }
        public AIBouquetPredictionsDto Predictions { get; set; }
        public AITextFeaturesDto TextFeatures { get; set; }
        public DateTime AnalysisTime { get; set; }
    }

    public class AITextFeaturesDto
    {
        public List<(string, double)> TopFeatures { get; set; } = new();
        public int TotalFeatures { get; set; }
        public int NonZeroFeatures { get; set; }
    }

    public class AIBatchPredictionDto
    {
        public List<AIBatchResultDto> Results { get; set; } = new();
        public AIBatchStatisticsDto Statistics { get; set; }
    }

    public class AIBatchResultDto
    {
        public int Index { get; set; }
        public bool Success { get; set; }
        public AIBouquetPredictionDto Data { get; set; }
        public string Error { get; set; }
    }

    public class AIBatchStatisticsDto
    {
        public int TotalMessages { get; set; }
        public int SuccessfulPredictions { get; set; }
        public int FailedPredictions { get; set; }
        public double SuccessRate { get; set; }
    }

    public class AIVisualGenerationDto
    {
        public string ImagePath { get; set; }
        public string Filename { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    public class AIMetadataDto
    {
        public DateTime PredictionTime { get; set; }
        public string ModelVersion { get; set; }
        public bool IncludeVisual { get; set; }
    }

    public class AIVisualDto
    {
        public string ImagePath { get; set; }
        public bool Generated { get; set; }
        public string Error { get; set; }
    }
}