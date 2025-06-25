using System.Collections.Generic;

namespace FlowersAPI.DTOs.FlowerDTOs
{
    public class FlowerDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string LatinName { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public int ColorId { get; set; }
        public string ColorName { get; set; }
        public List<MeaningDto> Meanings { get; set; }
    }
    
    public class MeaningDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}