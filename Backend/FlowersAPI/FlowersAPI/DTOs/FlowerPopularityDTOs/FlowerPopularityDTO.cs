using System;

namespace FlowersAPI.DTOs.FlowerPopularityDTOs
{
    public class FlowerPopularityDTO
    {
        public int Id { get; set; }
        public int FlowerId { get; set; }
        public string FlowerName { get; set; }
        public int ClickCount { get; set; }
        public DateTime LastClicked { get; set; }
    }
}
