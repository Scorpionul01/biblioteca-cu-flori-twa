using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowersAPI.Models
{
    public class UserPreferences
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        public string PreferredColors { get; set; } // JSON array of color names
        
        public string DislikedColors { get; set; } // JSON array of color names
        
        public string PreferredFlowerTypes { get; set; } // JSON array of flower IDs
        
        public string DislikedFlowerTypes { get; set; } // JSON array of flower IDs
        
        public int DiversityLevel { get; set; } = 5; // 1-10, how much variety user wants
        
        public bool PreferClassicCombinations { get; set; } = false;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
