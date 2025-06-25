using Microsoft.EntityFrameworkCore;
using FlowersAPI.Data;
using FlowersAPI.Models;
using FlowersAPI.DTOs.BouquetDTOs;
using FlowersAPI.DTOs.FlowerDTOs;
using System.Text.Json;

namespace FlowersAPI.Services
{
    public class BouquetDiversityService : IBouquetDiversityService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BouquetDiversityService> _logger;

        public BouquetDiversityService(ApplicationDbContext context, ILogger<BouquetDiversityService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<FlowerDTO>> GetDiverseFlowerSelectionAsync(int userId, List<FlowerDTO> candidateFlowers, int count)
        {
            try
            {
                var recentlyUsedFlowerIds = await GetRecentlyUsedFlowerIdsAsync(userId, 5);
                var usageFrequency = await GetFlowerUsageFrequencyAsync(userId, 30);
                var result = new List<FlowerDTO>();
                var random = new Random();

                // Group candidates by primary meaning to ensure variety
                var flowerGroups = candidateFlowers
                    .GroupBy(f => GetPrimaryMeaningFromFlower(f))
                    .OrderBy(g => random.Next())
                    .ToList();

                _logger.LogInformation("Selecting diverse flowers from {GroupCount} groups for user {UserId}", 
                    flowerGroups.Count, userId);

                foreach (var group in flowerGroups)
                {
                    if (result.Count >= count) break;

                    var groupFlowers = group.ToList();
                    
                    // Score flowers based on diversity factors
                    var scoredFlowers = groupFlowers.Select(f => new
                    {
                        Flower = f,
                        DiversityScore = CalculateFlowerDiversityScore(f, recentlyUsedFlowerIds, usageFrequency, random)
                    }).OrderByDescending(sf => sf.DiversityScore).ToList();

                    var selectedFlower = scoredFlowers.FirstOrDefault()?.Flower;
                    
                    if (selectedFlower != null && !result.Any(r => r.Id == selectedFlower.Id))
                    {
                        result.Add(selectedFlower);
                        _logger.LogDebug("Selected flower {FlowerName} for diversity", selectedFlower.Name);
                    }
                }

                // Fill remaining slots if needed
                while (result.Count < count && result.Count < candidateFlowers.Count)
                {
                    var remaining = candidateFlowers
                        .Where(f => !result.Any(r => r.Id == f.Id))
                        .OrderBy(f => usageFrequency.GetValueOrDefault(f.Id, 0))
                        .ThenBy(f => random.Next())
                        .FirstOrDefault();

                    if (remaining != null)
                    {
                        result.Add(remaining);
                    }
                    else
                    {
                        break;
                    }
                }

                _logger.LogInformation("Selected {Count} diverse flowers for user {UserId}", result.Count, userId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting diverse flowers for user {UserId}", userId);
                return candidateFlowers.Take(count).ToList(); // Fallback
            }
        }

        public async Task RecordBouquetGenerationAsync(int userId, string message, BouquetResponse bouquet)
        {
            try
            {
                var flowerIds = bouquet.Flowers?.Select(f => f.FlowerId).ToList() ?? new List<int>();
                var diversityScore = await CalculateDiversityScoreAsync(userId, flowerIds);

                var history = new BouquetHistory
                {
                    UserId = userId,
                    OriginalMessage = message,
                    GeneratedBouquetJson = JsonSerializer.Serialize(bouquet),
                    FlowerIdsUsed = string.Join(",", flowerIds),
                    ColorsUsed = string.Empty, // Can be implemented later
                    DiversityScore = diversityScore
                };

                _context.BouquetHistory.Add(history);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Recorded bouquet generation for user {UserId} with diversity score {Score}", 
                    userId, diversityScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording bouquet generation for user {UserId}", userId);
            }
        }

        public async Task<double> CalculateDiversityScoreAsync(int userId, List<int> flowerIds)
        {
            try
            {
                if (!flowerIds.Any()) return 1.0;

                var recentHistory = await _context.BouquetHistory
                    .Where(bh => bh.UserId == userId)
                    .OrderByDescending(bh => bh.GeneratedAt)
                    .Take(10)
                    .ToListAsync();

                if (!recentHistory.Any()) return 1.0; // Maximum diversity for first bouquet

                var recentFlowerIds = new HashSet<int>();
                foreach (var history in recentHistory)
                {
                    if (!string.IsNullOrEmpty(history.FlowerIdsUsed))
                    {
                        var ids = history.FlowerIdsUsed
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Where(id => int.TryParse(id, out _))
                            .Select(int.Parse);
                        
                        foreach (var id in ids)
                        {
                            recentFlowerIds.Add(id);
                        }
                    }
                }

                var overlappingFlowers = flowerIds.Count(id => recentFlowerIds.Contains(id));
                var diversityScore = 1.0 - ((double)overlappingFlowers / flowerIds.Count);

                return Math.Max(0.1, diversityScore); // Minimum 10% diversity
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating diversity score for user {UserId}", userId);
                return 0.5; // Default moderate diversity
            }
        }

        public async Task<List<int>> GetRecentlyUsedFlowerIdsAsync(int userId, int bouquetCount = 5)
        {
            try
            {
                var recentHistory = await _context.BouquetHistory
                    .Where(bh => bh.UserId == userId)
                    .OrderByDescending(bh => bh.GeneratedAt)
                    .Take(bouquetCount)
                    .ToListAsync();

                var flowerIds = new List<int>();
                foreach (var history in recentHistory)
                {
                    if (!string.IsNullOrEmpty(history.FlowerIdsUsed))
                    {
                        var ids = history.FlowerIdsUsed
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Where(id => int.TryParse(id, out _))
                            .Select(int.Parse);
                        
                        flowerIds.AddRange(ids);
                    }
                }

                return flowerIds.Distinct().ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recently used flowers for user {UserId}", userId);
                return new List<int>();
            }
        }

        public async Task<Dictionary<int, int>> GetFlowerUsageFrequencyAsync(int userId, int daysPast = 30)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-daysPast);
                var recentHistory = await _context.BouquetHistory
                    .Where(bh => bh.UserId == userId && bh.GeneratedAt >= cutoffDate)
                    .ToListAsync();

                var frequency = new Dictionary<int, int>();
                
                foreach (var history in recentHistory)
                {
                    if (!string.IsNullOrEmpty(history.FlowerIdsUsed))
                    {
                        var ids = history.FlowerIdsUsed
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Where(id => int.TryParse(id, out _))
                            .Select(int.Parse);
                        
                        foreach (var id in ids)
                        {
                            frequency[id] = frequency.GetValueOrDefault(id, 0) + 1;
                        }
                    }
                }

                return frequency;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flower usage frequency for user {UserId}", userId);
                return new Dictionary<int, int>();
            }
        }

        private double CalculateFlowerDiversityScore(FlowerDTO flower, List<int> recentlyUsed, 
            Dictionary<int, int> usageFrequency, Random random)
        {
            double score = 1.0;

            // Penalize recently used flowers
            if (recentlyUsed.Contains(flower.Id))
            {
                score *= 0.3; // Heavy penalty for recent use
            }

            // Penalize frequently used flowers
            var frequency = usageFrequency.GetValueOrDefault(flower.Id, 0);
            if (frequency > 0)
            {
                score *= Math.Max(0.2, 1.0 - (frequency * 0.2)); // Reduce score based on frequency
            }

            // Add randomness for same-score flowers
            score += (random.NextDouble() - 0.5) * 0.1;

            return score;
        }

        private string GetPrimaryMeaningFromFlower(FlowerDTO flower)
        {
            // Extract primary meaning from flower
            // This is a simplified version - could be enhanced with actual meaning analysis
            var name = flower.Name?.ToLower() ?? "";
            
            if (name.Contains("trandafir") || name.Contains("rose"))
                return "love";
            if (name.Contains("margareta") || name.Contains("daisy"))
                return "friendship";
            if (name.Contains("crin") || name.Contains("lily"))
                return "purity";
            if (name.Contains("garoafa") || name.Contains("carnation"))
                return "admiration";
            if (name.Contains("lalea") || name.Contains("tulip"))
                return "elegance";
            
            return "general";
        }
    }
}
