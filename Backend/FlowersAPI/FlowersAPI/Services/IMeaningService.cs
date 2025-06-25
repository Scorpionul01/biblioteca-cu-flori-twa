using System.Collections.Generic;
using System.Threading.Tasks;
using FlowersAPI.DTOs.MeaningDTOs;

namespace FlowersAPI.Services
{
    public interface IMeaningService
    {
        Task<List<MeaningDTO>> GetAllMeaningsAsync();
        Task<MeaningDTO> GetMeaningByIdAsync(int id);
        Task<MeaningDTO> CreateMeaningAsync(MeaningCreateDTO meaningDto);
        Task<Dictionary<string, int>> GetMeaningDistributionAsync();
    }
}