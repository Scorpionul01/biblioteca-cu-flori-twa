using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowersAPI.Models
{
    public class Flower
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(100)]
        public string LatinName { get; set; }

        public string Description { get; set; }

        [StringLength(255)]
        public string ImageUrl { get; set; }

        public int ColorId { get; set; }

        [ForeignKey("ColorId")]
        public Color Color { get; set; }

        public ICollection<FlowerMeaning> FlowerMeanings { get; set; }

        public FlowerPopularity Popularity { get; set; }
    }
}
