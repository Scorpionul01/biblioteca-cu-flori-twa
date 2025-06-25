using System.Collections.Generic;

namespace FlowersAPI.DTOs.FlowerDTOs
{
    /// <summary>
    /// DTO pentru flori cu semnificații combinate într-un singur șir de caractere
    /// </summary>
    public class FlowerWithCombinedMeaningsDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string LatinName { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public int ColorId { get; set; }
        public string ColorName { get; set; }
        public string AllMeanings { get; set; }
    }
}