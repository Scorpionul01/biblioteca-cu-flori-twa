using Microsoft.EntityFrameworkCore;
using FlowersAPI.Data;
using FlowersAPI.Models;
using FlowersAPI.DTOs.BouquetDTOs;
using FlowersAPI.DTOs.FlowerDTOs;

namespace FlowersAPI.Services
{
    public class EnhancedAIService : IEnhancedAIService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFlowerService _flowerService;
        private readonly IFlowerLockService _lockService;
        private readonly IBouquetDiversityService _diversityService;
        private readonly IAIService _baseAIService;
        private readonly ILogger<EnhancedAIService> _logger;

        // Enhanced keyword mappings with more alternatives
        private readonly Dictionary<string, List<string>> _sentimentKeywords;
        private readonly Dictionary<string, List<string>> _occasionKeywords;
        private readonly Dictionary<string, List<string>> _colorMoodMapping;

        public EnhancedAIService(
            ApplicationDbContext context,
            IFlowerService flowerService,
            IFlowerLockService lockService,
            IBouquetDiversityService diversityService,
            IAIService baseAIService,
            ILogger<EnhancedAIService> logger)
        {
            _context = context;
            _flowerService = flowerService;
            _lockService = lockService;
            _diversityService = diversityService;
            _baseAIService = baseAIService;
            _logger = logger;

            // Initialize enhanced keyword mappings
            _sentimentKeywords = new Dictionary<string, List<string>>
            {
                ["love"] = new List<string> { "iubire", "dragoste", "amor", "romantic", "iubesc", "dragă", "pasiune", "inimă", "suflet" },
                ["happiness"] = new List<string> { "fericire", "bucurie", "veselie", "fericit", "veseli", "zâmbet", "entuziasm", "optimism" },
                ["gratitude"] = new List<string> { "mulțumesc", "recunoștință", "apreciere", "grateful", "thank", "respectuos", "onorabil" },
                ["sympathy"] = new List<string> { "condoleanțe", "regret", "tristețe", "compasiune", "îmi pare rău", "empatie", "durere" },
                ["celebration"] = new List<string> { "sărbătoare", "aniversare", "petrecere", "celebrare", "la mulți ani", "festiv", "bucuros" },
                ["friendship"] = new List<string> { "prietenie", "prieten", "amiciție", "coleg", "tovarăș", "loialitate", "sinceritate" },
                ["apology"] = new List<string> { "scuze", "îmi pare rău", "regret", "scuză-mă", "pardon", "iertare", "greșeală" },
                ["congratulations"] = new List<string> { "felicitări", "bravo", "succes", "realizare", "câștig", "performanță", "excellent" }
            };

            _occasionKeywords = new Dictionary<string, List<string>>
            {
                ["wedding"] = new List<string> { "nuntă", "căsătorie", "mireasă", "mire", "logodnă", "cununie", "matrimonial" },
                ["birthday"] = new List<string> { "ziua nașterii", "aniversare", "la mulți ani", "naștere", "timp de sărbătoare" },
                ["graduation"] = new List<string> { "absolvire", "diplomă", "facultate", "școală", "studii", "finalizare", "academic" },
                ["mothersday"] = new List<string> { "ziua mamei", "mama", "mămică", "mother", "maternitate" },
                ["valentines"] = new List<string> { "sf. valentin", "valentine", "dragobete", "îndrăgostiți", "romanticism" },
                ["funeral"] = new List<string> { "înmormântare", "funeral", "deces", "moarte", "condoleanțe", "despărțire", "veșnicie" },
                ["newbaby"] = new List<string> { "nou născut", "bebé", "copil", "naștere", "botez", "familie nouă" }
            };

            _colorMoodMapping = new Dictionary<string, List<string>>
            {
                ["red"] = new List<string> { "pasiune", "dragoste", "energie", "putere", "roșu", "intens", "vibrant" },
                ["pink"] = new List<string> { "feminitate", "delicatețe", "tandrețe", "roz", "dulce", "romantic", "blând" },
                ["white"] = new List<string> { "puritate", "inocență", "pace", "alb", "curat", "simplu", "elegant" },
                ["yellow"] = new List<string> { "bucurie", "fericire", "energie", "galben", "soare", "optimism", "luminos" },
                ["purple"] = new List<string> { "noblețe", "eleganță", "mister", "purpuriu", "violet", "regal", "sofisticat" },
                ["blue"] = new List<string> { "liniște", "încredere", "albastru", "calm", "serenitate", "pace", "stabilitate" },
                ["orange"] = new List<string> { "entuziasm", "creativitate", "portocaliu", "energie", "căldură", "vibrant" }
            };
        }

        public async Task<BouquetResponse> GenerateEnhancedBouquetAsync(
            int userId, 
            string message, 
            List<string>? preferredColors = null,
            bool respectLocked = true,
            int diversityLevel = 5)
        {
            try
            {
                _logger.LogInformation("Generating enhanced bouquet for user {UserId} with diversity level {DiversityLevel}", 
                    userId, diversityLevel);

                // Step 1: Get all available flowers
                var allFlowers = await _flowerService.GetAllFlowersWithMeaningsAsync();
                
                // Step 2: Apply color filtering if specified
                if (preferredColors != null && preferredColors.Any())
                {
                    allFlowers = allFlowers.Where(f => preferredColors.Contains(f.ColorName?.ToLower())).ToList();
                    _logger.LogInformation("Filtered to {Count} flowers matching preferred colors: {Colors}", 
                        allFlowers.Count, string.Join(", ", preferredColors));
                }

                // Step 3: Get base AI recommendation
                var baseRecommendation = await _baseAIService.GenerateBouquetRecommendation(message, allFlowers);
                
                // Step 4: Get locked flowers if requested
                var lockedFlowers = respectLocked ? await _lockService.GetLockedFlowersAsync(userId) : new List<LockedFlower>();
                
                // Step 5: Apply diversity enhancement
                var enhancedBouquet = await ApplyDiversityEnhancement(userId, baseRecommendation, allFlowers, lockedFlowers, diversityLevel);
                
                // Step 6: Record this generation for future diversity
                await _diversityService.RecordBouquetGenerationAsync(userId, message, enhancedBouquet);
                
                _logger.LogInformation("Successfully generated enhanced bouquet with {FlowerCount} flowers for user {UserId}", 
                    enhancedBouquet.Flowers?.Count ?? 0, userId);

                return enhancedBouquet;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating enhanced bouquet for user {UserId}", userId);
                throw;
            }
        }

        public async Task<BouquetResponse> GenerateAlternativeBouquetAsync(int userId, string message, List<int>? excludeFlowerIds = null)
        {
            try
            {
                _logger.LogInformation("Generating alternative bouquet for user {UserId}, excluding {ExcludeCount} flowers", 
                    userId, excludeFlowerIds?.Count ?? 0);

                var allFlowers = await _flowerService.GetAllFlowersWithMeaningsAsync();
                
                // Exclude specified flowers
                if (excludeFlowerIds != null && excludeFlowerIds.Any())
                {
                    allFlowers = allFlowers.Where(f => !excludeFlowerIds.Contains(f.Id)).ToList();
                }
                
                // Get alternative flowers using diversity service
                var diverseFlowers = await _diversityService.GetDiverseFlowerSelectionAsync(userId, allFlowers, 8);
                
                // Generate bouquet with diverse flowers
                var alternativeBouquet = await _baseAIService.GenerateBouquetRecommendation(message, diverseFlowers);
                
                // Update bouquet name to indicate it's an alternative
                alternativeBouquet.BouquetName = "Alternativă: " + alternativeBouquet.BouquetName;
                
                await _diversityService.RecordBouquetGenerationAsync(userId, message, alternativeBouquet);
                
                return alternativeBouquet;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating alternative bouquet for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<BouquetResponse>> GenerateMultipleVariationsAsync(int userId, string message, int count = 3)
        {
            try
            {
                _logger.LogInformation("Generating {Count} bouquet variations for user {UserId}", count, userId);

                var variations = new List<BouquetResponse>();
                var usedFlowerCombinations = new HashSet<string>();
                var allFlowers = await _flowerService.GetAllFlowersWithMeaningsAsync();

                for (int i = 0; i < count; i++)
                {
                    var excludeIds = new List<int>();
                    
                    // For subsequent variations, exclude some flowers from previous ones
                    if (variations.Any())
                    {
                        var previousFlowerIds = variations
                            .SelectMany(v => v.Flowers.Select(f => f.FlowerId))
                            .Take(2) // Exclude only first 2 flowers to maintain some similarity
                            .ToList();
                        
                        excludeIds.AddRange(previousFlowerIds);
                    }

                    // Get diverse selection for this variation
                    var availableFlowers = allFlowers.Where(f => !excludeIds.Contains(f.Id)).ToList();
                    var diverseSelection = await _diversityService.GetDiverseFlowerSelectionAsync(userId, availableFlowers, 8);
                    
                    var variation = await _baseAIService.GenerateBouquetRecommendation(message, diverseSelection);
                    
                    // Create a signature for this combination to avoid exact duplicates
                    var signature = string.Join(",", variation.Flowers.Select(f => f.FlowerId).OrderBy(id => id));
                    
                    if (!usedFlowerCombinations.Contains(signature))
                    {
                        variation.BouquetName = $"Variația {i + 1}: " + variation.BouquetName;
                        variations.Add(variation);
                        usedFlowerCombinations.Add(signature);
                    }
                    else if (i == 0) // At least add the first one even if it's similar
                    {
                        variation.BouquetName = $"Variația {i + 1}: " + variation.BouquetName;
                        variations.Add(variation);
                    }
                }

                // Record all variations for diversity tracking
                foreach (var variation in variations)
                {
                    await _diversityService.RecordBouquetGenerationAsync(userId, message, variation);
                }

                _logger.LogInformation("Generated {ActualCount} variations for user {UserId}", variations.Count, userId);
                return variations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating bouquet variations for user {UserId}", userId);
                throw;
            }
        }

        private async Task<BouquetResponse> ApplyDiversityEnhancement(
            int userId, 
            BouquetResponse baseRecommendation, 
            List<FlowerDTO> allFlowers, 
            List<LockedFlower> lockedFlowers,
            int diversityLevel)
        {
            var enhancedFlowers = new List<BouquetFlower>();

            // Step 1: Add locked flowers first (if any)
            foreach (var lockedFlower in lockedFlowers)
            {
                var flower = allFlowers.FirstOrDefault(f => f.Id == lockedFlower.FlowerId);
                if (flower != null)
                {
                    enhancedFlowers.Add(new BouquetFlower
                    {
                        FlowerId = flower.Id,
                        FlowerName = flower.Name,
                        ImageUrl = flower.ImageUrl,
                        Reason = $"🔒 {flower.Name} a fost păstrată din selecția ta anterioară pentru continuitate în buchet."
                    });
                    
                    _logger.LogDebug("Added locked flower: {FlowerName}", flower.Name);
                }
            }

            // Step 2: Apply diversity based on level
            var targetFlowerCount = CalculateTargetFlowerCount(diversityLevel);
            var remainingSlots = targetFlowerCount - enhancedFlowers.Count;

            if (remainingSlots > 0)
            {
                // Get candidate flowers from base recommendation
                var candidateFlowerIds = baseRecommendation.Flowers.Select(f => f.FlowerId).ToList();
                var candidateFlowers = allFlowers.Where(f => candidateFlowerIds.Contains(f.Id)).ToList();

                // Remove already added locked flowers
                var usedFlowerIds = enhancedFlowers.Select(f => f.FlowerId).ToHashSet();
                candidateFlowers = candidateFlowers.Where(f => !usedFlowerIds.Contains(f.Id)).ToList();

                // Apply diversity selection
                var diverseFlowers = await _diversityService.GetDiverseFlowerSelectionAsync(userId, candidateFlowers, remainingSlots);

                // Add diverse flowers to the bouquet
                foreach (var flower in diverseFlowers)
                {
                    var originalRecommendation = baseRecommendation.Flowers.FirstOrDefault(f => f.FlowerId == flower.Id);
                    var reason = originalRecommendation?.Reason ?? GenerateEnhancedReason(flower);

                    enhancedFlowers.Add(new BouquetFlower
                    {
                        FlowerId = flower.Id,
                        FlowerName = flower.Name,
                        ImageUrl = flower.ImageUrl,
                        Reason = reason
                    });
                }
            }

            // Step 3: Create enhanced bouquet response
            var finalDiversityScore = await _diversityService.CalculateDiversityScoreAsync(userId, enhancedFlowers.Select(f => f.FlowerId).ToList());
            
            return new BouquetResponse
            {
                BouquetName = GenerateEnhancedBouquetName(baseRecommendation.BouquetName, finalDiversityScore),
                MessageInterpretation = GenerateEnhancedInterpretation(baseRecommendation.MessageInterpretation, finalDiversityScore, lockedFlowers.Count),
                Flowers = enhancedFlowers
            };
        }

        private int CalculateTargetFlowerCount(int diversityLevel)
        {
            // Map diversity level (1-10) to flower count (3-6)
            return Math.Max(3, Math.Min(6, 3 + (diversityLevel / 3)));
        }

        private string GenerateEnhancedReason(FlowerDTO flower)
        {
            var reasons = new List<string>
            {
                $"Am selectat {flower.Name.ToLower()} pentru a adăuga diversitate și frumusețe în buchet.",
                $"Am inclus {flower.Name.ToLower()} pentru symbolismul său special și pentru a varia composiția.",
                $"Am ales {flower.Name.ToLower()} pentru a crea un contrast interesant în buchet."
            };

            var random = new Random();
            return reasons[random.Next(reasons.Count)];
        }

        private string GenerateEnhancedBouquetName(string baseName, double diversityScore)
        {
            if (diversityScore > 0.8)
                return baseName + " - Ediție Unică";
            else if (diversityScore > 0.6)
                return baseName + " - Versiune Variată";
            else
                return baseName;
        }

        private string GenerateEnhancedInterpretation(string baseInterpretation, double diversityScore, int lockedFlowerCount)
        {
            var enhancement = "";

            if (lockedFlowerCount > 0)
            {
                enhancement += $" Am păstrat {lockedFlowerCount} flori din selecțiile tale anterioare pentru continuitate.";
            }

            if (diversityScore > 0.7)
            {
                enhancement += " Acest buchet oferă o varietate excepțională de flori pentru a te surprinde plăcut.";
            }
            else if (diversityScore > 0.4)
            {
                enhancement += " Am creat o combinație echilibrată de flori familiar și noi pentru tine.";
            }

            return baseInterpretation + enhancement;
        }
    }
}