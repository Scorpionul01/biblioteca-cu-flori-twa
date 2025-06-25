using FlowersAPI.DTOs.BouquetDTOs;
using FlowersAPI.DTOs.FlowerDTOs;

namespace FlowersAPI.Services
{
    public interface IEnhancedAIService
    {
        Task<BouquetResponse> GenerateEnhancedBouquetAsync(
            int userId, 
            string message, 
            List<string> preferredColors = null,
            bool respectLocked = true,
            int diversityLevel = 5);
        
        Task<BouquetResponse> GenerateAlternativeBouquetAsync(int userId, string message, List<int> excludeFlowerIds = null);
        Task<List<BouquetResponse>> GenerateMultipleVariationsAsync(int userId, string message, int count = 3);
    }
}
