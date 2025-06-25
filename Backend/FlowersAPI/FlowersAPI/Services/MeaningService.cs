using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlowersAPI.Data;
using FlowersAPI.DTOs.MeaningDTOs;
using FlowersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowersAPI.Services
{
    public class MeaningService : IMeaningService
    {
        private readonly ApplicationDbContext _context;
        
        public MeaningService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<MeaningDTO>> GetAllMeaningsAsync()
        {
            var meanings = await _context.Meanings
                .Include(m => m.FlowerMeanings)
                .Select(m => new MeaningDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    FlowerCount = m.FlowerMeanings.Count
                })
                .ToListAsync();
                
            return meanings;
        }
        
        public async Task<MeaningDTO> GetMeaningByIdAsync(int id)
        {
            var meaning = await _context.Meanings
                .Include(m => m.FlowerMeanings)
                .Where(m => m.Id == id)
                .Select(m => new MeaningDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    FlowerCount = m.FlowerMeanings.Count
                })
                .FirstOrDefaultAsync();
                
            if (meaning == null)
            {
                throw new Exception("Semnificația nu a fost găsită");
            }
            
            return meaning;
        }
        
        public async Task<MeaningDTO> CreateMeaningAsync(MeaningCreateDTO meaningDto)
        {
            // Verifică dacă există deja
            var existingMeaning = await _context.Meanings
                .FirstOrDefaultAsync(m => m.Name.ToLower() == meaningDto.Name.ToLower());
                
            if (existingMeaning != null)
            {
                throw new Exception("Există deja o semnificație cu acest nume");
            }
            
            // Creează semnificația
            var meaning = new Meaning
            {
                Name = meaningDto.Name,
                Description = meaningDto.Description
            };
            
            _context.Meanings.Add(meaning);
            await _context.SaveChangesAsync();
            
            return new MeaningDTO
            {
                Id = meaning.Id,
                Name = meaning.Name,
                Description = meaning.Description,
                FlowerCount = 0
            };
        }
        
        public async Task<Dictionary<string, int>> GetMeaningDistributionAsync()
        {
            var distribution = await _context.Meanings
                .Select(m => new 
                {
                    m.Name,
                    Count = m.FlowerMeanings.Count
                })
                .ToDictionaryAsync(m => m.Name, m => m.Count);
                
            return distribution;
        }
    }
}