using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FlowersAPI.DTOs.FlowerDTOs
{
    public class FlowerCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [StringLength(100)]
        public string LatinName { get; set; }
        
        public string Description { get; set; }
        
        [StringLength(255)]
        public string ImageUrl { get; set; }
        
        [Required]
        public int ColorId { get; set; }
        
        public List<int> MeaningIds { get; set; } = new List<int>();
    }
}