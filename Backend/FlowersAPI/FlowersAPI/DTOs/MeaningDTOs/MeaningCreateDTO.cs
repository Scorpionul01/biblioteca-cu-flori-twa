using System.ComponentModel.DataAnnotations;

namespace FlowersAPI.DTOs.MeaningDTOs
{
    public class MeaningCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Description { get; set; }
    }
}