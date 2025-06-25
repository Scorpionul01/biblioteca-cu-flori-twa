using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlowersAPI.Data;
using FlowersAPI.DTOs.ColorDTOs;
using Microsoft.EntityFrameworkCore;

namespace FlowersAPI.Services
{
    public class ColorService : IColorService
    {
        private readonly ApplicationDbContext _context;
        
        public ColorService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<ColorDTO>> GetAllColorsAsync()
        {
            var colors = await _context.Colors
                .Include(c => c.Flowers)
                .Select(c => new ColorDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    FlowerCount = c.Flowers.Count
                })
                .ToListAsync();
                
            return colors;
        }
        
        public async Task<ColorDTO> GetColorByIdAsync(int id)
        {
            var color = await _context.Colors
                .Include(c => c.Flowers)
                .Where(c => c.Id == id)
                .Select(c => new ColorDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    FlowerCount = c.Flowers.Count
                })
                .FirstOrDefaultAsync();
                
            if (color == null)
            {
                throw new Exception("Culoarea nu a fost găsită");
            }
            
            return color;
        }
        
        public async Task<Dictionary<string, int>> GetColorDistributionAsync()
        {
            var distribution = await _context.Colors
                .Include(c => c.Flowers)
                .Select(c => new 
                {
                    c.Name,
                    Count = c.Flowers.Count
                })
                .ToDictionaryAsync(c => c.Name, c => c.Count);
                
            return distribution;
        }
    }
}