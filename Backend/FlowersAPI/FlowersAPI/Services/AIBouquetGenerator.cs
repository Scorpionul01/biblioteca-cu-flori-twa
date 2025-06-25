using System.Text.Json;
using FlowersAPI.Models;
using FlowersAPI.DTOs;

namespace FlowersAPI.Services
{
    public class AIBouquetGenerator
    {
        private Dictionary<string, List<string>> _sentimentKeywords;
        private Dictionary<string, List<string>> _occasionKeywords;
        private Dictionary<string, List<string>> _colorMoodMapping;
        private FlowerDataset _dataset;

        public AIBouquetGenerator()
        {
            LoadFlowerDataset();
            InitializeKeywordMappings();
        }

        private void LoadFlowerDataset()
        {
            var jsonPath = Path.Combine("Set de Date", "complete_bouquet_dataset.json");
            var jsonContent = File.ReadAllText(jsonPath);
            _dataset = JsonSerializer.Deserialize<FlowerDataset>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        private void InitializeKeywordMappings()
        {
            _sentimentKeywords = new Dictionary<string, List<string>>
            {
                ["love"] = new List<string> { "iubire", "dragoste", "amor", "romantic", "iubesc", "dragă" },
                ["happiness"] = new List<string> { "fericire", "bucurie", "veselie", "fericit", "veseli", "zâmbet" },
                ["gratitude"] = new List<string> { "mulțumesc", "recunoștință", "apreciere", "grateful", "thank" },
                ["sympathy"] = new List<string> { "condoleanțe", "regret", "tristețe", "compasiune", "îmi pare rău" },
                ["celebration"] = new List<string> { "sărbătoare", "aniversare", "petrecere", "celebrare", "la mulți ani" },
                ["friendship"] = new List<string> { "prietenie", "prieten", "amiciție", "coleg", "tovarăș" },
                ["apology"] = new List<string> { "scuze", "îmi pare rău", "regret", "scuză-mă", "pardon" },
                ["congratulations"] = new List<string> { "felicitări", "bravo", "succes", "realizare", "câștig" }
            };

            _occasionKeywords = new Dictionary<string, List<string>>
            {
                ["wedding"] = new List<string> { "nuntă", "căsătorie", "mireasă", "mire", "logodnă" },
                ["birthday"] = new List<string> { "ziua nașterii", "aniversare", "la mulți ani", "naștere" },
                ["graduation"] = new List<string> { "absolvire", "diplomă", "facultate", "școală", "studii" },
                ["mothersday"] = new List<string> { "ziua mamei", "mama", "mămică", "mother" },
                ["valentines"] = new List<string> { "sf. valentin", "valentine", "dragobete", "îndrăgostiți" },
                ["funeral"] = new List<string> { "înmormântare", "funeral", "deces", "moarte", "condoleanțe" },
                ["newbaby"] = new List<string> { "nou născut", "bebé", "copil", "naștere", "botez" }
            };

            _colorMoodMapping = new Dictionary<string, List<string>>
            {
                ["red"] = new List<string> { "pasiune", "dragoste", "energie", "putere", "roșu" },
                ["pink"] = new List<string> { "feminitate", "delicatețe", "tandrețe", "roz", "dulce" },
                ["white"] = new List<string> { "puritate", "inocență", "pace", "alb", "curat" },
                ["yellow"] = new List<string> { "bucurie", "fericire", "energie", "galben", "soare" },
                ["purple"] = new List<string> { "noblețe", "eleganță", "mister", "purpuriu", "violet" },
                ["blue"] = new List<string> { "liniște", "încredere", "albastru", "calm", "serenitate" },
                ["orange"] = new List<string> { "entuziasm", "creativitate", "portocaliu", "energie" }
            };
        }

        public async Task<BouquetSuggestionDto> GenerateBouquetFromText(string userInput)
        {
            var analysis = AnalyzeUserInput(userInput);
            var suggestions = GenerateFlowerSuggestions(analysis);
            var bouquet = ComposeBouquet(suggestions, analysis);
            
            return bouquet;
        }

        private InputAnalysis AnalyzeUserInput(string input)
        {
            var analysis = new InputAnalysis
            {
                OriginalText = input,
                DetectedSentiments = new List<string>(),
                DetectedOccasions = new List<string>(),
                PreferredColors = new List<string>(),
                SentimentScore = 0.5 // neutral default
            };

            input = input.ToLower();

            // Detectează sentimentele
            foreach (var sentiment in _sentimentKeywords)
            {
                if (sentiment.Value.Any(keyword => input.Contains(keyword)))
                {
                    analysis.DetectedSentiments.Add(sentiment.Key);
                }
            }

            // Detectează ocaziile
            foreach (var occasion in _occasionKeywords)
            {
                if (occasion.Value.Any(keyword => input.Contains(keyword)))
                {
                    analysis.DetectedOccasions.Add(occasion.Key);
                }
            }

            // Detectează preferințele de culoare
            foreach (var colorMood in _colorMoodMapping)
            {
                if (colorMood.Value.Any(keyword => input.Contains(keyword)))
                {
                    analysis.PreferredColors.Add(colorMood.Key);
                }
            }

            // Calculează scorul sentimentului
            var positiveWords = new[] { "fericit", "bucurie", "fericire", "iubire", "vesel", "minunat" };
            var negativeWords = new[] { "trist", "regret", "condoleanțe", "îmi pare rău", "durere" };

            var positiveCount = positiveWords.Count(word => input.Contains(word));
            var negativeCount = negativeWords.Count(word => input.Contains(word));

            if (positiveCount > negativeCount)
                analysis.SentimentScore = 0.8;
            else if (negativeCount > positiveCount)
                analysis.SentimentScore = 0.2;

            return analysis;
        }

        private List<FlowerSuggestion> GenerateFlowerSuggestions(InputAnalysis analysis)
        {
            var suggestions = new List<FlowerSuggestion>();
            var allFlowers = _dataset.BouquetElements.Flowers;

            foreach (var flower in allFlowers)
            {
                var score = CalculateFlowerRelevanceScore(flower, analysis);
                if (score > 0.3) // threshold pentru relevance
                {
                    suggestions.Add(new FlowerSuggestion
                    {
                        Flower = flower,
                        RelevanceScore = score,
                        RecommendedColors = GetRecommendedColors(flower, analysis),
                        Reasoning = GenerateReasoning(flower, analysis)
                    });
                }
            }

            return suggestions.OrderByDescending(s => s.RelevanceScore).Take(10).ToList();
        }

        private double CalculateFlowerRelevanceScore(dynamic flower, InputAnalysis analysis)
        {
            double score = 0;

            // Scor bazat pe sentimente detectate
            foreach (var sentiment in analysis.DetectedSentiments)
            {
                if (FlowerMatchesSentiment(flower, sentiment))
                {
                    score += 0.4;
                }
            }

            // Scor bazat pe ocazii
            foreach (var occasion in analysis.DetectedOccasions)
            {
                if (FlowerMatchesOccasion(flower, occasion))
                {
                    score += 0.3;
                }
            }

            // Scor bazat pe culori preferate
            var flowerColors = flower.possibleColors as string[] ?? Array.Empty<string>();
            foreach (var preferredColor in analysis.PreferredColors)
            {
                if (flowerColors.Contains(preferredColor))
                {
                    score += 0.2;
                }
            }

            // Bonus pentru popularitate
            score += (flower.popularity / 10.0) * 0.1;

            return Math.Min(score, 1.0);
        }

        private bool FlowerMatchesSentiment(dynamic flower, string sentiment)
        {
            var meanings = flower.meanings.general?.ToString().ToLower() ?? "";
            
            return sentiment switch
            {
                "love" => meanings.Contains("love") || meanings.Contains("passion") || meanings.Contains("romance"),
                "happiness" => meanings.Contains("joy") || meanings.Contains("happiness") || meanings.Contains("cheerful"),
                "gratitude" => meanings.Contains("gratitude") || meanings.Contains("appreciation") || meanings.Contains("thanks"),
                "sympathy" => meanings.Contains("sympathy") || meanings.Contains("remembrance") || meanings.Contains("comfort"),
                "celebration" => meanings.Contains("celebration") || meanings.Contains("festive") || meanings.Contains("joy"),
                "friendship" => meanings.Contains("friendship") || meanings.Contains("devotion") || meanings.Contains("loyalty"),
                _ => false
            };
        }

        private bool FlowerMatchesOccasion(dynamic flower, string occasion)
        {
            var meanings = flower.meanings.general?.ToString().ToLower() ?? "";
            
            return occasion switch
            {
                "wedding" => meanings.Contains("love") || meanings.Contains("purity") || meanings.Contains("devotion"),
                "birthday" => meanings.Contains("joy") || meanings.Contains("celebration") || meanings.Contains("happiness"),
                "graduation" => meanings.Contains("success") || meanings.Contains("achievement") || meanings.Contains("pride"),
                "mothersday" => meanings.Contains("love") || meanings.Contains("gratitude") || meanings.Contains("appreciation"),
                "valentines" => meanings.Contains("love") || meanings.Contains("passion") || meanings.Contains("romance"),
                "funeral" => meanings.Contains("remembrance") || meanings.Contains("sympathy") || meanings.Contains("peace"),
                _ => false
            };
        }

        private List<string> GetRecommendedColors(dynamic flower, InputAnalysis analysis)
        {
            var recommendedColors = new List<string>();
            var flowerColors = flower.possibleColors as string[] ?? Array.Empty<string>();

            // Adaugă culorile preferate detectate
            foreach (var preferredColor in analysis.PreferredColors)
            {
                if (flowerColors.Contains(preferredColor))
                {
                    recommendedColors.Add(preferredColor);
                }
            }

            // Adaugă culori bazate pe sentiment
            if (analysis.DetectedSentiments.Contains("love"))
            {
                if (flowerColors.Contains("red")) recommendedColors.Add("red");
                if (flowerColors.Contains("pink")) recommendedColors.Add("pink");
            }

            if (analysis.DetectedSentiments.Contains("happiness"))
            {
                if (flowerColors.Contains("yellow")) recommendedColors.Add("yellow");
                if (flowerColors.Contains("orange")) recommendedColors.Add("orange");
            }

            // Fallback la prima culoare disponibilă
            if (!recommendedColors.Any() && flowerColors.Any())
            {
                recommendedColors.Add(flowerColors.First());
            }

            return recommendedColors.Distinct().ToList();
        }

        private BouquetSuggestionDto ComposeBouquet(List<FlowerSuggestion> suggestions, InputAnalysis analysis)
        {
            var bouquet = new BouquetSuggestionDto
            {
                Message = GeneratePersonalizedMessage(analysis),
                Elements = new List<BouquetElementDto>(),
                TotalScore = 0,
                Reasoning = "Buchetul a fost compus pe baza analizei textului furnizat."
            };

            // Selectează flori focale (1-2 tipuri)
            var focalFlowers = suggestions
                .Where(s => s.Flower.bouquetRole == "focal")
                .Take(2);

            foreach (var focalFlower in focalFlowers)
            {
                bouquet.Elements.Add(new BouquetElementDto
                {
                    Type = "flower",
                    Name = focalFlower.Flower.name,
                    LatinName = focalFlower.Flower.latinName,
                    Colors = focalFlower.RecommendedColors,
                    Quantity = 5,
                    Role = "focal",
                    Meaning = focalFlower.Flower.meanings.general,
                    Images = GetImagesForColors(focalFlower.Flower, focalFlower.RecommendedColors)
                });
            }

            // Adaugă flori de umplutură
            var fillerFlowers = suggestions
                .Where(s => s.Flower.bouquetRole == "filler")
                .Take(2);

            foreach (var fillerFlower in fillerFlowers)
            {
                bouquet.Elements.Add(new BouquetElementDto
                {
                    Type = "flower",
                    Name = fillerFlower.Flower.name,
                    LatinName = fillerFlower.Flower.latinName,
                    Colors = fillerFlower.RecommendedColors,
                    Quantity = 3,
                    Role = "filler",
                    Meaning = fillerFlower.Flower.meanings.general,
                    Images = GetImagesForColors(fillerFlower.Flower, fillerFlower.RecommendedColors)
                });
            }

            // Adaugă frunziș
            var foliage = _dataset.BouquetElements.Foliage.First();
            bouquet.Elements.Add(new BouquetElementDto
            {
                Type = "foliage",
                Name = foliage.name,
                LatinName = foliage.latinName,
                Colors = new List<string> { foliage.possibleColors.First() },
                Quantity = 2,
                Role = "filler",
                Meaning = foliage.meanings.general,
                Images = new List<string> { foliage.image }
            });

            bouquet.TotalScore = suggestions.Average(s => s.RelevanceScore);

            return bouquet;
        }

        private List<string> GetImagesForColors(dynamic flower, List<string> colors)
        {
            var images = new List<string>();
            var flowerName = flower.name.ToString().ToLower().Replace(" ", "_").Replace("'", "");
            
            foreach (var color in colors)
            {
                images.Add($"images/flowers/{flowerName}/{color}_{flowerName}.jpg");
            }

            return images;
        }

        private string GeneratePersonalizedMessage(InputAnalysis analysis)
        {
            if (analysis.DetectedSentiments.Contains("love"))
                return "Un buchet plin de dragoste și pasiune, perfect pentru a exprima sentimentele tale profunde.";
            
            if (analysis.DetectedSentiments.Contains("happiness"))
                return "Un buchet vesel și luminos, care va aduce bucurie și zâmbete.";
            
            if (analysis.DetectedSentiments.Contains("gratitude"))
                return "Un buchet elegant pentru a exprima recunoștința și aprecierea ta.";
            
            return "Un buchet frumos, compus special pentru tine.";
        }

        private string GenerateReasoning(dynamic flower, InputAnalysis analysis)
        {
            return $"{flower.name} a fost ales(ă) pentru semnificația sa de {flower.meanings.general} și compatibilitatea cu sentimentele detectate.";
        }
    }

    // DTOs pentru AI
    public class InputAnalysis
    {
        public string OriginalText { get; set; }
        public List<string> DetectedSentiments { get; set; }
        public List<string> DetectedOccasions { get; set; }
        public List<string> PreferredColors { get; set; }
        public double SentimentScore { get; set; }
    }

    public class FlowerSuggestion
    {
        public dynamic Flower { get; set; }
        public double RelevanceScore { get; set; }
        public List<string> RecommendedColors { get; set; }
        public string Reasoning { get; set; }
    }

    public class BouquetSuggestionDto
    {
        public string Message { get; set; }
        public List<BouquetElementDto> Elements { get; set; }
        public double TotalScore { get; set; }
        public string Reasoning { get; set; }
    }

    public class BouquetElementDto
    {
        public string Type { get; set; } // flower, foliage, texture
        public string Name { get; set; }
        public string LatinName { get; set; }
        public List<string> Colors { get; set; }
        public int Quantity { get; set; }
        public string Role { get; set; } // focal, filler, line, accent
        public string Meaning { get; set; }
        public List<string> Images { get; set; }
    }

    // Model pentru dataset-ul JSON
    public class FlowerDataset
    {
        public BouquetElements BouquetElements { get; set; }
    }

    public class BouquetElements
    {
        public List<dynamic> Flowers { get; set; }
        public List<dynamic> Foliage { get; set; }
        public List<dynamic> TextureElements { get; set; }
    }
}
