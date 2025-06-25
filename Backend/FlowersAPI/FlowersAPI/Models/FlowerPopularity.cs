using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowersAPI.Models
{
    public class FlowerPopularity
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int FlowerId { get; set; }
        
        [ForeignKey("FlowerId")]
        public Flower Flower { get; set; }
        
        [Required]
        public int ClickCount { get; set; }
        
        public DateTime LastClicked { get; set; }
    }
}
