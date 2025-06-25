using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowersAPI.Models
{
    public class FlowerMeaning
    {
        [Key]
        public int Id { get; set; }
        
        public int FlowerId { get; set; }
        
        public int MeaningId { get; set; }
        
        [ForeignKey("FlowerId")]
        public Flower Flower { get; set; }
        
        [ForeignKey("MeaningId")]
        public Meaning Meaning { get; set; }
    }
}
