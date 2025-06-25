using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowersAPI.Models
{
    public class BouquetHistory
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string OriginalMessage { get; set; }
        
        [Required]
        public string GeneratedBouquetJson { get; set; }
        
        public string FlowerIdsUsed { get; set; } // CSV de IDs
        
        public string ColorsUsed { get; set; } // CSV de culori
        
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        
        public double? UserRating { get; set; } // 1-5 rating from user
        
        public bool WasLiked { get; set; } = false;
        
        public double DiversityScore { get; set; } = 0.0;
    }
}
