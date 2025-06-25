using System.Collections.Generic;

namespace FlowersAPI.DTOs.FlowerPopularityDTOs
{
    public class FlowerWordCloudDTO
    {
        public List<WordCloudItemDTO> Items { get; set; }
    }
    
    public class WordCloudItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
    }
}
