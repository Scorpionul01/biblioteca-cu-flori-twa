using FlowersAPI.Models;
using FlowersAPI.DTOs.BouquetDTOs;
using FlowersAPI.DTOs.FlowerDTOs;

namespace FlowersAPI.Services
{
    public interface IBouquetDiversityService
    {
        Task<List<FlowerDTO>> GetDiverseFlowerSelectionAsync(int userId, List<FlowerDTO> candidateFlowers, int count);
        Task RecordBouquetGenerationAsync(int userId, string message, BouquetResponse bouquet);
        Task<double> CalculateDiversityScoreAsync(int userId, List<int> flowerIds);
        Task<List<int>> GetRecentlyUsedFlowerIdsAsync(int userId, int bouquetCount = 5);
        Task<Dictionary<int, int>> GetFlowerUsageFrequencyAsync(int userId, int daysPast = 30);
    }
}
