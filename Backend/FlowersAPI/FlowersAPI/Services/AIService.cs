using System;
using System.Linq;
using System.Globalization;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using FlowersAPI.DTOs.BouquetDTOs;
using FlowersAPI.DTOs.FlowerDTOs;

namespace FlowersAPI.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;
        private readonly string _apiEndpoint;
        
        public AIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _apiKey = _configuration["AI:ApiKey"];
            _apiEndpoint = _configuration["AI:Endpoint"];
        }
        
        public async Task<BouquetResponse> GenerateBouquetRecommendation(string message, List<FlowerDTO> availableFlowers)
        {
            // Asigură-te că ai flori disponibile
            if (availableFlowers == null || !availableFlowers.Any())
            {
                throw new Exception("Nu există flori în baza de date pentru a genera recomandări");
            }

            // Utilizează API-ul DeepSeek pentru a genera recomandarea
            try
            {
                return await CallDeepSeekApiAsync(message, availableFlowers);
            }
            catch (Exception ex)
            {
                // În caz de eroare cu API-ul, folosește metoda locală ca fallback
                Console.WriteLine($"Eroare la apelarea DeepSeek API: {ex.Message}. Folosim metoda locală ca fallback.");
                return GenerateLocalRecommendation(message, availableFlowers);
            }
        }
        
        public async Task<BouquetResponse> GenerateBouquetRecommendationWithCombinedMeanings(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers)
        {
            // Asigură-te că ai flori disponibile
            if (availableFlowers == null || !availableFlowers.Any())
            {
                throw new Exception("Nu există flori în baza de date pentru a genera recomandări");
            }

            // Utilizează API-ul DeepSeek pentru a genera recomandarea
            try
            {
                return await CallDeepSeekApiWithCombinedMeaningsAsync(message, availableFlowers);
            }
            catch (Exception ex)
            {
                // În caz de eroare cu API-ul, folosește metoda locală ca fallback
                Console.WriteLine($"Eroare la apelarea DeepSeek API: {ex.Message}. Folosim metoda locală ca fallback.");
                
                // Convertim FlowerWithCombinedMeaningsDTO la FlowerDTO pentru fallback
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
                
                return GenerateLocalRecommendation(message, simplifiedFlowers);
            }
        }
        
        public async Task<BouquetResponse> GenerateBouquetRecommendationWithDeepSeekApi(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers)
        {
            // Asigură-te că ai flori disponibile
            if (availableFlowers == null || !availableFlowers.Any())
            {
                throw new Exception("Nu există flori în baza de date pentru a genera recomandări");
            }

            // Utilizează API-ul DeepSeek pentru a genera recomandarea
            // Fără fallback la metoda locală
            return await CallDeepSeekApiWithCombinedMeaningsAsync(message, availableFlowers);
        }
        
        private async Task<BouquetResponse> CallDeepSeekApiWithCombinedMeaningsAsync(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers)
        {
            if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrEmpty(_apiEndpoint))
            {
                throw new Exception("API Key sau Endpoint pentru DeepSeek nu sunt configurate");
            }
            
            // Creăm o reprezentare simplificată a florilor pentru a fi trimisă către API
            var simplifiedFlowers = availableFlowers.Select(f => new
            {
                id = f.Id,
                name = f.Name,
                latinName = f.LatinName,
                color = f.ColorName,
                meanings = f.AllMeanings, // Aici folosim semnificațiile concatenate
                imageUrl = f.ImageUrl
            }).ToList();
            
            // Construiește prompt-ul pentru modelul DeepSeek
            var prompt = $@"Creează un buchet de flori personalizat pentru următorul mesaj: ""{message}""

Iată lista de flori disponibile, cu semnificațiile și culorile lor:

{JsonSerializer.Serialize(simplifiedFlowers, new JsonSerializerOptions { WriteIndented = true })}

Analizează mesajul și alege 3-5 flori care se potrivesc cel mai bine cu sentimentele și intenția din mesaj. 
Pentru fiecare floare aleasă, explică de ce se potrivește cu mesajul și ce semnificație aduce buchetului.

Fii atent la sentimente de tristețe (cuvinte ca 'trist', 'deprimat', 'singur', etc.) și condoleanțe (cuvinte ca 'condoleanțe', 'moarte', 'pierdere', 'suferință', etc.). Dacă mesajul conține astfel de sentimente, asigură-te că alegi flori potrivite pentru aceste situații, care pot transmite confort, speranță, respect, puritate, pace și renaștere spirituală.

Răspunde cu un JSON care respectă exact următoarea structură:
{{
  ""bouquetName"": ""Numele sugestiv pentru buchet"",
  ""messageInterpretation"": ""Interpretarea mesajului și explicația generală pentru buchet"",
  ""flowers"": [
    {{
      ""flowerId"": 123,
      ""flowerName"": ""Numele florii"",
      ""imageUrl"": ""URL-ul imaginii"",
      ""reason"": ""Explicația detaliată a motivului pentru care această floare a fost aleasă și ce semnificație aduce buchetului""
    }}
  ]
}}

Asigură-te că alegi flori care reflectă sentimentul din mesaj. Dacă mesajul conține emoții negative extreme sau este nepotrivit, răspunde cu un buchet gol și o explicație adecvată.";

            // Pregătește request-ul către DeepSeek
            var requestBody = new 
            {
                model = "deepseek-chat", // sau modelul specific care este disponibil
                messages = new [] 
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.5,
                max_tokens = 2000
            };
            
            // Adaugă header-ele necesare
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            
            // Trimite request-ul
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
                
            var response = await _httpClient.PostAsync(_apiEndpoint, content);
            
            // Verifică dacă a fost succes
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                
                // Verifică specific pentru eroarea de "Insufficient Balance"
                if (errorContent.Contains("Insufficient Balance") || response.StatusCode == System.Net.HttpStatusCode.PaymentRequired)
                {
                    Console.WriteLine($"Eroare de la DeepSeek API: Insufficient Balance - Contul nu are credit suficient");
                    throw new Exception("Serviciul DeepSeek nu este disponibil momentan din cauza limitărilor de cont. Se folosește generarea locală.");
                }
                
                throw new Exception($"Eroare de la DeepSeek API: {response.StatusCode} - {errorContent}");
            }
            
            // Procesează răspunsul
            var responseContent = await response.Content.ReadAsStringAsync();
            var deepSeekResponse = JsonSerializer.Deserialize<DeepSeekResponse>(responseContent);
            
            // Extrage JSON-ul din răspunsul modelului
            var modelResponse = deepSeekResponse?.choices[0]?.message?.content;
            if (string.IsNullOrEmpty(modelResponse))
            {
                throw new Exception("Răspunsul de la DeepSeek nu conține conținut valid");
            }
            
            // Extrage partea JSON din răspunsul modelului
            string jsonContent = ExtractJsonFromAIResponse(modelResponse);
            
            // Deserializează în obiectul nostru BouquetResponse
            try
            {
                var bouquetResponse = JsonSerializer.Deserialize<BouquetResponse>(jsonContent);
                
                // Validează datele primite
                if (bouquetResponse == null || bouquetResponse.Flowers == null)
                {
                    throw new Exception("Răspunsul nu conține date valide pentru buchet");
                }
                
                // Verifică dacă florile alese există în baza de date
                foreach (var flower in bouquetResponse.Flowers)
                {
                    var matchingFlower = availableFlowers.FirstOrDefault(f => f.Id == flower.FlowerId);
                    if (matchingFlower == null)
                    {
                        // Înlocuiește cu o floare validă din listă
                        var randomFlower = availableFlowers[new Random().Next(availableFlowers.Count)];
                        flower.FlowerId = randomFlower.Id;
                        flower.FlowerName = randomFlower.Name;
                        flower.ImageUrl = randomFlower.ImageUrl;
                    }
                }
                
                return bouquetResponse;
            }
            catch (Exception ex)
            {
                throw new Exception($"Eroare la procesarea răspunsului JSON: {ex.Message}");
            }
        }
        
        private async Task<BouquetResponse> CallDeepSeekApiAsync(string message, List<FlowerDTO> availableFlowers)
        {
            if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrEmpty(_apiEndpoint))
            {
                throw new Exception("API Key sau Endpoint pentru DeepSeek nu sunt configurate");
            }
            
            // Creăm o reprezentare simplificată a florilor pentru a fi trimisă către API
            var simplifiedFlowers = availableFlowers.Select(f => new
            {
                id = f.Id,
                name = f.Name,
                latinName = f.LatinName,
                color = f.ColorName,
                meanings = f.Meanings?.Select(m => m.Name).ToList() ?? new List<string>(),
                imageUrl = f.ImageUrl
            }).ToList();
            
            // Construiește prompt-ul pentru modelul DeepSeek
            var prompt = $@"Creează un buchet de flori personalizat pentru următorul mesaj: ""{message}""

Iată lista de flori disponibile, cu semnificațiile și culorile lor:

{JsonSerializer.Serialize(simplifiedFlowers, new JsonSerializerOptions { WriteIndented = true })}

Analizează mesajul și alege 3-5 flori care se potrivesc cel mai bine cu sentimentele și intenția din mesaj. 
Pentru fiecare floare aleasă, explică de ce se potrivește cu mesajul și ce semnificație aduce buchetului.

Fii atent la sentimente de tristețe (cuvinte ca 'trist', 'deprimat', 'singur', etc.) și condoleanțe (cuvinte ca 'condoleanțe', 'moarte', 'pierdere', 'suferință', etc.). Dacă mesajul conține astfel de sentimente, asigură-te că alegi flori potrivite pentru aceste situații, care pot transmite confort, speranță, respect, puritate, pace și renaștere spirituală.

Răspunde cu un JSON care respectă exact următoarea structură:
{{
  ""bouquetName"": ""Numele sugestiv pentru buchet"",
  ""messageInterpretation"": ""Interpretarea mesajului și explicația generală pentru buchet"",
  ""flowers"": [
    {{
      ""flowerId"": 123,
      ""flowerName"": ""Numele florii"",
      ""imageUrl"": ""URL-ul imaginii"",
      ""reason"": ""Explicația detaliată a motivului pentru care această floare a fost aleasă și ce semnificație aduce buchetului""
    }}
  ]
}}

Asigură-te că alegi flori care reflectă sentimentul din mesaj. Dacă mesajul conține emoții negative extreme sau este nepotrivit, răspunde cu un buchet gol și o explicație adecvată.";

            // Pregătește request-ul către DeepSeek
            var requestBody = new 
            {
                model = "deepseek-chat", // sau modelul specific care este disponibil
                messages = new [] 
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.5,
                max_tokens = 2000
            };
            
            // Adaugă header-ele necesare
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            
            // Trimite request-ul
            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");
                
            var response = await _httpClient.PostAsync(_apiEndpoint, content);
            
            // Verifică dacă a fost succes
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                
                // Verifică specific pentru eroarea de "Insufficient Balance"
                if (errorContent.Contains("Insufficient Balance") || response.StatusCode == System.Net.HttpStatusCode.PaymentRequired)
                {
                    Console.WriteLine($"Eroare de la DeepSeek API: Insufficient Balance - Contul nu are credit suficient");
                    throw new Exception("Serviciul DeepSeek nu este disponibil momentan din cauza limitărilor de cont. Se folosește generarea locală.");
                }
                
                throw new Exception($"Eroare de la DeepSeek API: {response.StatusCode} - {errorContent}");
            }
            
            // Procesează răspunsul
            var responseContent = await response.Content.ReadAsStringAsync();
            var deepSeekResponse = JsonSerializer.Deserialize<DeepSeekResponse>(responseContent);
            
            // Extrage JSON-ul din răspunsul modelului
            var modelResponse = deepSeekResponse?.choices[0]?.message?.content;
            if (string.IsNullOrEmpty(modelResponse))
            {
                throw new Exception("Răspunsul de la DeepSeek nu conține conținut valid");
            }
            
            // Extrage partea JSON din răspunsul modelului
            string jsonContent = ExtractJsonFromAIResponse(modelResponse);
            
            // Deserializează în obiectul nostru BouquetResponse
            try
            {
                var bouquetResponse = JsonSerializer.Deserialize<BouquetResponse>(jsonContent);
                
                // Validează datele primite
                if (bouquetResponse == null || bouquetResponse.Flowers == null)
                {
                    throw new Exception("Răspunsul nu conține date valide pentru buchet");
                }
                
                // Verifică dacă florile alese există în baza de date
                foreach (var flower in bouquetResponse.Flowers)
                {
                    var matchingFlower = availableFlowers.FirstOrDefault(f => f.Id == flower.FlowerId);
                    if (matchingFlower == null)
                    {
                        // Înlocuiește cu o floare validă din listă
                        var randomFlower = availableFlowers[new Random().Next(availableFlowers.Count)];
                        flower.FlowerId = randomFlower.Id;
                        flower.FlowerName = randomFlower.Name;
                        flower.ImageUrl = randomFlower.ImageUrl;
                    }
                }
                
                return bouquetResponse;
            }
            catch (Exception ex)
            {
                throw new Exception($"Eroare la procesarea răspunsului JSON: {ex.Message}");
            }
        }
        
        private string ExtractJsonFromAIResponse(string response)
        {
            // Extrage partea JSON din răspunsul AI (în caz că AI include text suplimentar)
            int startIndex = response.IndexOf('{');
            int endIndex = response.LastIndexOf('}');
            
            if (startIndex >= 0 && endIndex > startIndex)
            {
                return response.Substring(startIndex, endIndex - startIndex + 1);
            }
            
            // Dacă nu găsește format JSON valid, creează un răspuns de eroare
            return JsonSerializer.Serialize(new BouquetResponse
            {
                BouquetName = "Buchet personalizat",
                MessageInterpretation = "Nu am putut interpreta mesajul în detaliu",
                Flowers = new List<BouquetFlower>()
            });
        }
        
        // Metoda locală de fallback rămasă neschimbată pentru siguranță
        private BouquetResponse GenerateLocalRecommendation(string message, List<FlowerDTO> availableFlowers)
        {
            // Restul metodei rămâne neschimbat...
            string messageLower = message.ToLower();
            
            var messageCategories = new Dictionary<string, List<string>>
            {
                { "dragoste", new List<string> { "dragoste", "iubire", "pasiune", "inimă", "iubesc", "ador", "te iubesc", "te ador", "love", "inima mea", "romantism", "afecțiune", "suflet pereche" } },
                { "prietenie", new List<string> { "prieten", "prietenie", "amiciție", "camarad", "prietenă", "friend", "prietenia", "loialitate", "sincer", "legătură" } },
                { "apreciere", new List<string> { "apreciere", "mulțumesc", "recunoștință", "respect", "apreciez", "mulțumiri", "thank", "multumesc", "recunostinta", "gratitudine", "meritele tale" } },
                { "fericire", new List<string> { "fericire", "bucurie", "veselie", "zâmbet", "fericit", "vesel", "bucuros", "happy", "bucur", "bucura", "optimism", "pozitiv", "râd", "râs" } },
                { "aniversare", new List<string> { "la mulți ani", "aniversare", "zi de naștere", "sărbătoare", "happy birthday", "ziua ta", "multi ani", "felicitari", "sarbatori", "celebrare", "anișori", "festiv" } },
                { "scuze", new List<string> { "scuze", "iartă-mă", "iertare", "regret", "greșit", "sorry", "imi pare rau", "iarta", "iertare", "am gresit", "iarta-ma", "căință", "puritate" } },
                { "tristete", new List<string> { "trist", "tristete", "intristat", "deprimat", "mahnit", "suparare", "dezamagit", "dezamagire", "melancolic", "melancolie", "dor", "jale", "plange", "lacrimi", "singuratate", "singur", "uitat", "parasit", "mi-e dor", "mi-ai lipsit", "m-ai uitat", "sunt foarte trist", "trece greu" } },
                { "condoleante", new List<string> { "condoleante", "condoleanțe", "durere", "pierdere", "regrete", "indurerat", "suferinta", "necaz", "greu", "empatie", "alinare", "pace", "alint", "consolare", "moarte", "deces", "inmormantare", "funeralii", "odihnă", "pierdut", "pierdută", "a murit", "a decedat", "înmormântare", "înmormântați", "veșnică", "veșnica", "amintire", "sufletul", "suflet", "mângâiere", "compasiune", "a trecut în neființă" } },
                { "admirație", new List<string> { "admirație", "admir", "admirabil", "minunat", "grozav", "impresionant", "remarcabil", "wow", "extraordinar", "fascinație", "uimire" } },
                { "noroc", new List<string> { "noroc", "succes", "reușită", "șansă", "bafta", "good luck", "success", "examene", "reusita", "prosperitate", "împlinire" } },
                { "gelozie", new List<string> { "gelozie", "geloasă", "invidios", "jealous", "invidie", "invidioasa", "gelos", "ardoare", "intensitate", "dorință" } },
                { "nunta", new List<string> { "nunta", "casatorie", "casatorim", "marit", "insuratoare", "insurat", "mireasa", "mire", "ne casatorim", "logodna", "wedding", "casatoresc", "cununia", "maritat" } },
                { "ură", new List<string> { "urăsc", "ură", "hate", "detest", "nu te suport" } }
            };
            
            var detectedCategories = new List<string>();
            foreach (var category in messageCategories)
            {
                if (category.Value.Any(keyword => messageLower.Contains(keyword)))
                {
                    detectedCategories.Add(category.Key);
                }
            }
            
            if (detectedCategories.Count == 0)
            {
                if (messageLower.Length < 15)
                {
                    if (messageLower.Contains("salut") || messageLower.Contains("buna") || messageLower.Contains("hello") || messageLower.Contains("hi"))
                    {
                        detectedCategories.Add("prietenie");
                    }
                    else if (messageLower.Contains("felicitari") || messageLower.Contains("bravo"))
                    {
                        detectedCategories.Add("apreciere");
                    }
                    else
                    {
                        detectedCategories.Add("apreciere");
                    }
                }
                else
                {
                    if (messageLower.Contains("bine") || messageLower.Contains("plăcere") || messageLower.Contains("frumos"))
                    {
                        detectedCategories.Add("fericire");
                    }
                    else
                    {
                        detectedCategories.Add("apreciere");
                    }
                }
            }
            
            if (detectedCategories.Contains("ură") || messageLower.Contains("te urasc") || messageLower.Contains("urăsc"))
            {
                return new BouquetResponse
                {
                    BouquetName = "Mesaj nepotrivit pentru flori",
                    MessageInterpretation = "Ne pare rău, dar mesajul tău pare să conțină sentimente negative care nu sunt potrivite pentru un buchet de flori. Florile transmit de obicei emoții pozitive și afecțiune.",
                    Flowers = new List<BouquetFlower>()
                };
            }
            
            var categoryToMeaningMap = new Dictionary<string, List<string>>
            {
                { "dragoste", new List<string> { "dragoste", "pasiune", "iubire", "romantism", "afecțiune" } },
                { "prietenie", new List<string> { "prietenie", "loialitate", "sinceritate", "credincioșie" } },
                { "apreciere", new List<string> { "apreciere", "recunoștință", "admirație", "respect", "prețuire" } },
                { "fericire", new List<string> { "fericire", "bucurie", "veselie", "optimism", "energie pozitivă" } },
                { "aniversare", new List<string> { "celebrare", "sărbătoare", "fericire", "bucurie", "împlinire" } },
                { "scuze", new List<string> { "iertare", "căință", "regret", "sinceritate", "puritate" } },
                { "condoleante", new List<string> { "compasiune", "empatie", "alinare", "pace", "renastere", "puritate", "respect", "amintire", "veșnicie", "liniște sufletească" } },
                { "tristete", new List<string> { "empatie", "alinare", "suport", "înțelegere", "speranță", "confort", "sprijin", "putere", "renaștere", "gânduri bune", "prietenie" } },
                { "admirație", new List<string> { "admirație", "respect", "fascinație", "uimire", "apreciere" } },
                { "noroc", new List<string> { "noroc", "succes", "prosperitate", "împlinire", "reușită" } },
                { "nunta", new List<string> { "puritate", "devotament", "angajament", "eternitate", "fidelitate", "uniune", "căsătorie", "dragoste eternă" } },
                { "gelozie", new List<string> { "gelozie", "pasiune", "ardoare", "intensitate", "dorință" } }
            };
            
            var selectedFlowers = new List<BouquetFlower>();
            var meaningToFlowersMap = new Dictionary<string, List<FlowerDTO>>();
            
            foreach (var flower in availableFlowers)
            {
                if (flower.Meanings != null)
                {
                    foreach (var meaning in flower.Meanings)
                    {
                        var meaningLower = meaning.Name.ToLower();
                        if (!meaningToFlowersMap.ContainsKey(meaningLower))
                        {
                            meaningToFlowersMap[meaningLower] = new List<FlowerDTO>();
                        }
                        meaningToFlowersMap[meaningLower].Add(flower);
                    }
                }
            }
            
            foreach (var category in detectedCategories)
            {
                if (categoryToMeaningMap.ContainsKey(category))
                {
                    var meaningsList = categoryToMeaningMap[category];
                    var flowerScores = new Dictionary<FlowerDTO, double>();
                    
                    foreach (var flower in availableFlowers)
                    {
                        if (flower.Meanings == null || !flower.Meanings.Any())
                            continue;
                            
                        double score = 0;
                        
                        foreach (var flowerMeaning in flower.Meanings)
                        {
                            foreach (var targetMeaning in meaningsList)
                            {
                                string meaningLower = flowerMeaning.Name.ToLower();
                                string targetLower = targetMeaning.ToLower();
                                
                                if (meaningLower == targetLower)
                                    score += 3;
                                else if (meaningLower.Contains(targetLower) || targetLower.Contains(meaningLower))
                                    score += 1;
                                else {
                                    string[] meaningWords = meaningLower.Split(' ', ',', '.', '!', '?', ';', ':', '-');
                                    string[] targetWords = targetLower.Split(' ', ',', '.', '!', '?', ';', ':', '-');
                                    
                                    foreach (var meaningWord in meaningWords)
                                    {
                                        if (string.IsNullOrWhiteSpace(meaningWord)) continue;
                                        
                                        foreach (var targetWord in targetWords) 
                                        {
                                            if (string.IsNullOrWhiteSpace(targetWord)) continue;
                                            
                                            if (meaningWord == targetWord)
                                                score += 0.5;
                                            else if (meaningWord.Contains(targetWord) || targetWord.Contains(meaningWord))
                                                score += 0.2;
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (category == "dragoste" && 
                            (flower.Name.ToLower().Contains("trandafir") || 
                             flower.Name.ToLower().Contains("rose")))
                        {
                            score *= 1.5;
                        }
                        else if (category == "prietenie" && 
                                (flower.Name.ToLower().Contains("crizantem") || 
                                 flower.Name.ToLower().Contains("chrysanthemum")))
                        {
                            score *= 1.3;
                        }
                        else if (category == "nunta" && 
                                (flower.Name.ToLower().Contains("crin") || 
                                 flower.Name.ToLower().Contains("lily") ||
                                 flower.Name.ToLower().Contains("trandafir alb") ||
                                 flower.Name.ToLower().Contains("white rose")))
                        {
                            score *= 2.0;
                        }
                        
                        if (score > 0)
                        {
                            flowerScores[flower] = score;
                        }
                    }
                    
                    var topFlowers = flowerScores.OrderByDescending(pair => pair.Value)
                                                 .Take(3)
                                                 .Select(pair => pair.Key);
                    
                    foreach (var flower in topFlowers)
                    {
                        if (!selectedFlowers.Any(f => f.FlowerId == flower.Id))
                        {
                            var relevantMeanings = new List<string>();
                            
                            foreach (var meaning in flower.Meanings)
                            {
                                foreach (var targetMeaning in meaningsList)
                                {
                                    if (meaning.Name.ToLower().Contains(targetMeaning.ToLower()) || 
                                        targetMeaning.ToLower().Contains(meaning.Name.ToLower()))
                                    {
                                        if (!relevantMeanings.Contains(meaning.Name))
                                            relevantMeanings.Add(meaning.Name);
                                        break;
                                    }
                                }
                            }
                            
                            if (!relevantMeanings.Any() && flower.Meanings.Any())
                            {
                                relevantMeanings = flower.Meanings.Select(m => m.Name).Take(3).ToList();
                            }
                            
                            var explanation = GetExplanationForCategory(category, flower.Name, relevantMeanings);
                            
                            selectedFlowers.Add(new BouquetFlower
                            {
                                FlowerId = flower.Id,
                                FlowerName = flower.Name,
                                ImageUrl = flower.ImageUrl,
                                Reason = explanation
                            });
                        }
                    }
                }
            }
            
            if (selectedFlowers.Count < 3)
            {
                var popularFlowers = availableFlowers
                    .Where(f => !selectedFlowers.Any(sf => sf.FlowerId == f.Id))
                    .Take(3 - selectedFlowers.Count)
                    .ToList();
                
                foreach (var flower in popularFlowers)
                {
                    selectedFlowers.Add(new BouquetFlower
                    {
                        FlowerId = flower.Id,
                        FlowerName = flower.Name,
                        ImageUrl = flower.ImageUrl,
                        Reason = $"Am adăugat {flower.Name.ToLower()} pentru a completa buchetul cu frumusețea și semnificația sa specială."
                    });
                }
            }
            
            if (selectedFlowers.Count > 5)
            {
                selectedFlowers = selectedFlowers.Take(5).ToList();
            }
            
            detectedCategories.Remove("ură");
            detectedCategories.Remove("gelozie");
            
            if (detectedCategories.Count == 0)
            {
                detectedCategories.Add("apreciere");
            }
            
            string bucketName = GetBucketNameForCategories(detectedCategories);
            string messageInterpretation = GetMessageInterpretationForCategories(detectedCategories, message);
            
            return new BouquetResponse
            {
                BouquetName = bucketName,
                MessageInterpretation = messageInterpretation,
                Flowers = selectedFlowers
            };
        }
        
        // Metodă pentru generarea unor explicații personalizate pentru fiecare floare
        private string GetExplanationForCategory(string category, string flowerName, List<string> meanings)
        {
            string flowerNameLower = flowerName.ToLower();
            string meaningsList = meanings.Any() ? string.Join(", ", meanings) : "frumusețea și simbolismul său"; 
            
            var random = new Random();
            
            var introVerbs = new List<string> { "Am ales", "Am inclus", "Am adăugat", "Am selectat" };
            var meaningVerbs = new List<string> { "simbolizează", "reprezintă", "transmite", "exprimă", "este asociată cu", "evocă", "reflectă" };
            
            var introVerb = introVerbs[random.Next(introVerbs.Count)];
            var meaningVerb = meaningVerbs[random.Next(meaningVerbs.Count)];
            
            switch (category)
            {
                case "dragoste":
                    var dragosteSufixe = new List<string> { "perfect pentru a exprima sentimentele tale profunde de dragoste și pasiune.", "ideal pentru a transmite intensitatea sentimentelor tale romantice." };
                    return $"{introVerb} {flowerNameLower} pentru că {meaningVerb} {meaningsList}, {dragosteSufixe[random.Next(dragosteSufixe.Count)]}";
                // Alte cazuri similare pentru fiecare categorie...
                default:
                    var generalSufixe = new List<string> { "adaugând frumusețe și profunzime acestui buchet special.", "completând perfect mesajul pe care dorești să-l transmiți." };
                    return $"{introVerb} {flowerNameLower} pentru {meaningsList}, {generalSufixe[random.Next(generalSufixe.Count)]}";
            }
        }
        
        // Metodă pentru generarea numelor personalizate de buchete
        private string GetBucketNameForCategories(List<string> categories)
        {
            if (categories.Count == 1)
            {
                switch (categories[0])
                {
                    case "dragoste": return "Buchet de Dragoste Pasională";
                    case "prietenie": return "Buchet de Prietenie Sinceră";
                    case "apreciere": return "Buchet de Recunoștință și Apreciere";
                    case "fericire": return "Buchet de Fericire și Bucurie";
                    case "nunta": return "Buchet de Nuntă Tradițional";
                    case "aniversare": return "Buchet Festiv de Aniversare";
                    case "scuze": return "Buchet de Iertare și Reconciliere";
                    case "condoleante": return "Buchet de Condoleanțe și Alinare";
                    case "tristete": return "Buchet de Mângâiere și Speranță";
                    case "admirație": return "Buchet de Admirație Profundă";
                    case "noroc": return "Buchet de Noroc și Succes";
                    default: return "Buchet Personalizat Special";
                }
            }
            else if (categories.Count == 2)
            {
                return $"Buchet de {CultureInfo.CurrentCulture.TextInfo.ToTitleCase(categories[0])} și {categories[1]}";
            }
            else
            {
                return "Buchet de Sentimente Mixte";
            }
        }
        
        // Metodă pentru generarea interpretărilor personalizate ale mesajelor
        private string GetMessageInterpretationForCategories(List<string> categories, string originalMessage)
        {
            if (categories.Count == 1)
            {
                switch (categories[0])
                {
                    case "dragoste":
                        return "Mesajul tău exprimă dragoste profundă și pasiune. Am creat un buchet care să transmită intensitatea sentimentelor tale.";
                    case "prietenie":
                        return "Mesajul tău exprimă o prietenie sinceră și loială. Am creat un buchet care să celebreze această legătură specială.";
                    case "apreciere":
                        return "Mesajul tău exprimă recunoștință și apreciere profundă. Am creat un buchet care să transmită aceste sentimente deosebite.";
                    case "fericire":
                        return "Mesajul tău transmite bucurie și optimism. Am creat un buchet vesel care să amplifice energia pozitivă.";
                    case "aniversare":
                        return "Mesajul tău transmite urări festive de aniversare. Am creat un buchet special pentru a celebra acest moment important.";
                    case "scuze":
                        return "Mesajul tău exprimă regret sincer și dorința de reconciliere. Am creat un buchet care să ajute la transmiterea acestor sentimente.";
                    case "tristete":
                        return "Am sesizat tristețea din mesajul tău. Acest buchet este creat special pentru a aduce alinare, speranță și un strop de confort în momente dificile.";
                    case "condoleante":
                        return "Mesajul tău exprimă compasiune și dorința de a oferi alinare în momente de pierdere. Am creat un buchet care transmite respect și sprijin emoțional, combinând simboluri de puritate și renaștere spirituală.";
                    case "admirație":
                        return "Mesajul tău transmite admirație profundă. Am creat un buchet care să exprime respectul și aprecierea pe care o simți.";
                    case "noroc":
                        return "Mesajul tău transmite urări de succes și noroc. Am creat un buchet care să aducă energie pozitivă și să inspire reușită.";
                    case "nunta":
                        return "Mesajul tău transmite urări pentru o căsătorie fericită. Am creat un buchet tradițional care să simbolizeze devotamentul și iubirea eternă.";
                    default:
                        return "Am analizat mesajul tău și am creat un buchet personalizat care să exprime perfect sentimentele tale.";
                }
            }
            else if (categories.Count > 1)
            {
                return $"Mesajul tău transmite sentimente mixte de {string.Join(", ", categories)}. Am creat un buchet care să reflecte această complexitate de emoții.";
            }
            else
            {
                return "Am analizat mesajul tău și am creat un buchet personalizat care exprimă perfect sentimentele tale.";
            }
        }
    }

    // Clasă pentru deserializarea răspunsului de la DeepSeek
    public class DeepSeekResponse
    {
        public Choice[] choices { get; set; }
    }

    public class Choice
    {
        public Message message { get; set; }
    }

    public class Message
    {
        public string content { get; set; }
    }
}