using System.Collections.Generic;
using System.Threading.Tasks;
using FlowersAPI.DTOs.ColorDTOs;

namespace FlowersAPI.Services
{
    public interface IColorService
    {
        Task<List<ColorDTO>> GetAllColorsAsync();
        Task<ColorDTO> GetColorByIdAsync(int id);
        Task<Dictionary<string, int>> GetColorDistributionAsync();
    }
}