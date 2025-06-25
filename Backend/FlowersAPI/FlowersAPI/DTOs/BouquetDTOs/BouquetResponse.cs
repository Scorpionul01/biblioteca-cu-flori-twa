using System.Collections.Generic;

namespace FlowersAPI.DTOs.BouquetDTOs
{
    public class BouquetResponse
    {
        public required string BouquetName { get; set; }
        public required string MessageInterpretation { get; set; }
        public required List<BouquetFlower> Flowers { get; set; }
    }

    public class BouquetFlower
    {
        public int FlowerId { get; set; }
        public required string FlowerName { get; set; }
        public required string Reason { get; set; }
        public required string ImageUrl { get; set; }
    }
}