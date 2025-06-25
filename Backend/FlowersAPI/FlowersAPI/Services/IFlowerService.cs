using System.Collections.Generic;
using System.Threading.Tasks;
using FlowersAPI.DTOs.FlowerDTOs;

namespace FlowersAPI.Services
{
    public interface IFlowerService
    {
        Task<List<FlowerDTO>> GetAllFlowersAsync();
        Task<List<FlowerDTO>> GetAllFlowersWithMeaningsAndColorsAsync();
        Task<List<FlowerWithCombinedMeaningsDTO>> GetFlowersWithCombinedMeaningsAsync();
        Task<FlowerDTO> GetFlowerByIdAsync(int id);
        Task<List<FlowerDTO>> GetFlowersByColorAsync(int colorId);
        Task<List<FlowerDTO>> GetFlowersByMeaningAsync(int meaningId);
        Task<List<FlowerDTO>> SearchFlowersAsync(string searchTerm);
        Task<FlowerDTO> CreateFlowerAsync(FlowerCreateDTO flowerDto);
        Task<FlowerDTO> UpdateFlowerAsync(FlowerUpdateDTO flowerDto);
        Task<bool> DeleteFlowerAsync(int id);
        
        // Enhanced methods for lock and diversity functionality
        Task<List<FlowerDTO>> GetAllFlowersWithMeaningsAsync();
        Task<List<FlowerDTO>> GetFlowersByColorsAsync(List<string> colorNames);
        Task<List<FlowerDTO>> GetFlowersByIdsAsync(List<int> flowerIds);
    }
}