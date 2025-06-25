using System;
using System.ComponentModel.DataAnnotations;

namespace FlowersAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; }
        
        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Role { get; set; } // "Admin" sau "User"
        
        public string RefreshToken { get; set; }
        
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}
