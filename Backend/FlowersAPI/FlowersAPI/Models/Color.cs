using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FlowersAPI.Models
{
    public class Color
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        public ICollection<Flower> Flowers { get; set; }
    }
}
