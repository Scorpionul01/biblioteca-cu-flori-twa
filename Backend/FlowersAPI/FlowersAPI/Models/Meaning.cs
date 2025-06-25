using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FlowersAPI.Models
{
    public class Meaning
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        public ICollection<FlowerMeaning> FlowerMeanings { get; set; }
    }
}
