using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlowersAPI.Data;
using FlowersAPI.DTOs.FlowerPopularityDTOs;
using FlowersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowersAPI.Services
{
    public class FlowerPopularityService : IFlowerPopularityService
    {
        private readonly ApplicationDbContext _context;
        
        public FlowerPopularityService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<FlowerPopularityDTO> IncrementClickCountAsync(int flowerId)
        {
            // Verificăm dacă floarea există
            var flower = await _context.Flowers
                .FirstOrDefaultAsync(f => f.Id == flowerId);
                
            if (flower == null)
            {
                throw new Exception("Floarea nu a fost găsită");
            }
            
            // Verificăm dacă există deja un record de popularitate pentru această floare
            var popularity = await _context.FlowerPopularities
                .FirstOrDefaultAsync(fp => fp.FlowerId == flowerId);
                
            if (popularity == null)
            {
                // Dacă nu există, creăm un nou record
                popularity = new FlowerPopularity
                {
                    FlowerId = flowerId,
                    ClickCount = 1,
                    LastClicked = DateTime.Now
                };
                
                _context.FlowerPopularities.Add(popularity);
            }
            else
            {
                // Dacă există, incrementăm contorul și actualizăm data
                popularity.ClickCount++;
                popularity.LastClicked = DateTime.Now;
            }
            
            await _context.SaveChangesAsync();
            
            return new FlowerPopularityDTO
            {
                Id = popularity.Id,
                FlowerId = popularity.FlowerId,
                FlowerName = flower.Name,
                ClickCount = popularity.ClickCount,
                LastClicked = popularity.LastClicked
            };
        }
        
        public async Task<List<FlowerPopularityDTO>> GetMostPopularFlowersAsync(int count = 10)
        {
            var popularFlowers = await _context.FlowerPopularities
                .Include(fp => fp.Flower)
                .OrderByDescending(fp => fp.ClickCount)
                .Take(count)
                .ToListAsync();
                
            return popularFlowers.Select(fp => new FlowerPopularityDTO
            {
                Id = fp.Id,
                FlowerId = fp.FlowerId,
                FlowerName = fp.Flower.Name,
                ClickCount = fp.ClickCount,
                LastClicked = fp.LastClicked
            }).ToList();
        }
        
        public async Task<FlowerWordCloudDTO> GetFlowerWordCloudAsync(int count = 20)
        {
            var popularFlowers = await _context.FlowerPopularities
                .Include(fp => fp.Flower)
                .OrderByDescending(fp => fp.ClickCount)
                .Take(count)
                .ToListAsync();
                
            // Calculează ponderea pentru word cloud
            var maxClicks = popularFlowers.Any() ? popularFlowers.Max(fp => fp.ClickCount) : 0;
            var minClicks = popularFlowers.Any() ? popularFlowers.Min(fp => fp.ClickCount) : 0;
            
            // Pentru a evita împărțirea la zero
            var clickRange = maxClicks - minClicks;
            var weightFactor = clickRange > 0 ? 10.0 / clickRange : 1.0;
            
            var wordCloudItems = popularFlowers.Select(fp => new WordCloudItemDTO
            {
                Id = fp.FlowerId,
                Name = fp.Flower.Name,
                // Calculăm ponderea între 1 și 10 bazată pe numărul de click-uri
                Weight = clickRange > 0 
                    ? (int)Math.Max(1, Math.Min(10, Math.Ceiling((fp.ClickCount - minClicks) * weightFactor))) 
                    : 5 // Dacă toate florile au același număr de click-uri, setăm ponderea la 5
            }).ToList();
            
            return new FlowerWordCloudDTO
            {
                Items = wordCloudItems
            };
        }
    }
}
