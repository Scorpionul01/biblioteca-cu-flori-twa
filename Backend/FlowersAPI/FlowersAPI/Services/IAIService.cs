using System.Threading.Tasks;
using System.Collections.Generic;
using FlowersAPI.DTOs.FlowerDTOs;
using FlowersAPI.DTOs.BouquetDTOs;

namespace FlowersAPI.Services
{
    public interface IAIService
    {
        Task<BouquetResponse> GenerateBouquetRecommendation(string message, List<FlowerDTO> availableFlowers);
        Task<BouquetResponse> GenerateBouquetRecommendationWithCombinedMeanings(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers);
        Task<BouquetResponse> GenerateBouquetRecommendationWithDeepSeekApi(string message, List<FlowerWithCombinedMeaningsDTO> availableFlowers);
    }
}