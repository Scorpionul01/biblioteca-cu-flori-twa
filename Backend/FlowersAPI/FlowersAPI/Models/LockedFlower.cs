using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowersAPI.Models
{
    public class LockedFlower
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        [Required]
        public int FlowerId { get; set; }
        
        [ForeignKey("FlowerId")]
        public Flower Flower { get; set; }
        
        public int? PreferredColorId { get; set; }
        
        [ForeignKey("PreferredColorId")]
        public Color PreferredColor { get; set; }
        
        public int? PreferredQuantity { get; set; }
        
        public DateTime LockedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
    }
}
