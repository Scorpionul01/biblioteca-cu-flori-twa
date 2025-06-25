using System.Collections.Generic;
using System.Threading.Tasks;
using FlowersAPI.DTOs.FlowerPopularityDTOs;

namespace FlowersAPI.Services
{
    public interface IFlowerPopularityService
    {
        Task<FlowerPopularityDTO> IncrementClickCountAsync(int flowerId);
        Task<List<FlowerPopularityDTO>> GetMostPopularFlowersAsync(int count = 10);
        Task<FlowerWordCloudDTO> GetFlowerWordCloudAsync(int count = 20);
    }
}
