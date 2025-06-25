using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlowersAPI.Data;
using FlowersAPI.DTOs.FlowerDTOs;
using FlowersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowersAPI.Services
{
    public class FlowerService : IFlowerService
    {
        private readonly ApplicationDbContext _context;
        
        public FlowerService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<FlowerDTO>> GetAllFlowersAsync()
        {
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<List<FlowerDTO>> GetAllFlowersWithMeaningsAndColorsAsync()
        {
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<List<FlowerWithCombinedMeaningsDTO>> GetFlowersWithCombinedMeaningsAsync()
        {
            // Folosim SQL raw pentru a obține florile cu semnificațiile combinate
            // Acest query va concatena toate semnificațiile pentru fiecare floare
            string query = @"
                SELECT 
                    f.Id AS FlowerId, 
                    f.Name AS FlowerName, 
                    f.LatinName, 
                    f.Description AS FlowerDescription, 
                    c.Name AS ColorName, 
                    STRING_AGG(m.Name, ', ') WITHIN GROUP (ORDER BY m.Name) AS AllMeanings 
                FROM 
                    Flowers f 
                LEFT JOIN 
                    Colors c ON f.ColorId = c.Id 
                LEFT JOIN 
                    FlowerMeanings fm ON f.Id = fm.FlowerId 
                LEFT JOIN 
                    Meanings m ON fm.MeaningId = m.Id 
                GROUP BY 
                    f.Id, f.Name, f.LatinName, f.Description, c.Id, c.Name 
                ORDER BY 
                    f.Id
            ";

            var flowers = new List<FlowerWithCombinedMeaningsDTO>();
            
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = query;
                
                if (command.Connection.State != System.Data.ConnectionState.Open)
                    await command.Connection.OpenAsync();
                
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        flowers.Add(new FlowerWithCombinedMeaningsDTO
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("FlowerId")),
                            Name = reader.GetString(reader.GetOrdinal("FlowerName")),
                            LatinName = reader.GetString(reader.GetOrdinal("LatinName")),
                            Description = reader.GetString(reader.GetOrdinal("FlowerDescription")),
                            // Obținem imaginea din tabelul Flowers utilizând Id
                            ImageUrl = GetFlowerImageUrl(reader.GetInt32(reader.GetOrdinal("FlowerId"))),
                            // Obținem ColorId din tabelul Colors utilizând FlowerId
                            ColorId = GetFlowerColorId(reader.GetInt32(reader.GetOrdinal("FlowerId"))),
                            ColorName = reader.GetString(reader.GetOrdinal("ColorName")),
                            AllMeanings = reader.IsDBNull(reader.GetOrdinal("AllMeanings")) ? null : reader.GetString(reader.GetOrdinal("AllMeanings"))
                        });
                    }
                }
            }
            
            return flowers;
        }
        
        // Metodă helper pentru a obține URL-ul imaginii pentru o floare
        private string GetFlowerImageUrl(int flowerId)
        {
            var flower = _context.Flowers.FirstOrDefault(f => f.Id == flowerId);
            return flower?.ImageUrl;
        }
        
        // Metodă helper pentru a obține ColorId pentru o floare
        private int GetFlowerColorId(int flowerId)
        {
            var flower = _context.Flowers.FirstOrDefault(f => f.Id == flowerId);
            return flower?.ColorId ?? 0;
        }
        
        public async Task<FlowerDTO> GetFlowerByIdAsync(int id)
        {
            var flower = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .FirstOrDefaultAsync(f => f.Id == id);
                
            if (flower == null)
            {
                throw new Exception("Floarea nu a fost găsită");
            }
            
            return MapFlowerToDTO(flower);
        }
        
        public async Task<List<FlowerDTO>> GetFlowersByColorAsync(int colorId)
        {
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .Where(f => f.ColorId == colorId)
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<List<FlowerDTO>> GetFlowersByMeaningAsync(int meaningId)
        {
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .Where(f => f.FlowerMeanings.Any(fm => fm.MeaningId == meaningId))
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<List<FlowerDTO>> SearchFlowersAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                return await GetAllFlowersAsync();
            }
            
            searchTerm = searchTerm.ToLower();
            
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .Where(f => f.Name.ToLower().Contains(searchTerm) || 
                           f.LatinName.ToLower().Contains(searchTerm) || 
                           f.Description.ToLower().Contains(searchTerm) ||
                           f.FlowerMeanings.Any(fm => fm.Meaning.Name.ToLower().Contains(searchTerm)))
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<FlowerDTO> CreateFlowerAsync(FlowerCreateDTO flowerDto)
        {
            // Verifică dacă culoarea există
            var colorExists = await _context.Colors.AnyAsync(c => c.Id == flowerDto.ColorId);
            if (!colorExists)
            {
                throw new Exception("Culoarea specificată nu există");
            }
            
            // Verifică dacă toate semnificațiile există
            if (flowerDto.MeaningIds.Count > 0)
            {
                var existingMeaningIds = await _context.Meanings
                    .Where(m => flowerDto.MeaningIds.Contains(m.Id))
                    .Select(m => m.Id)
                    .ToListAsync();
                    
                var invalidIds = flowerDto.MeaningIds.Except(existingMeaningIds).ToList();
                if (invalidIds.Any())
                {
                    throw new Exception($"Următoarele semnificații nu există: {string.Join(", ", invalidIds)}");
                }
            }
            
            // Creează floarea
            var flower = new Flower
            {
                Name = flowerDto.Name,
                LatinName = flowerDto.LatinName,
                Description = flowerDto.Description,
                ImageUrl = flowerDto.ImageUrl,
                ColorId = flowerDto.ColorId,
                FlowerMeanings = new List<FlowerMeaning>()
            };
            
            // Adaugă semnificațiile
            foreach (var meaningId in flowerDto.MeaningIds)
            {
                flower.FlowerMeanings.Add(new FlowerMeaning
                {
                    FlowerId = flower.Id,
                    MeaningId = meaningId
                });
            }
            
            _context.Flowers.Add(flower);
            await _context.SaveChangesAsync();
            
            return await GetFlowerByIdAsync(flower.Id);
        }
        
        public async Task<FlowerDTO> UpdateFlowerAsync(FlowerUpdateDTO flowerDto)
        {
            // Verifică dacă floarea există
            var flower = await _context.Flowers
                .Include(f => f.FlowerMeanings)
                .FirstOrDefaultAsync(f => f.Id == flowerDto.Id);
                
            if (flower == null)
            {
                throw new Exception("Floarea nu a fost găsită");
            }
            
            // Verifică dacă culoarea există
            var colorExists = await _context.Colors.AnyAsync(c => c.Id == flowerDto.ColorId);
            if (!colorExists)
            {
                throw new Exception("Culoarea specificată nu există");
            }
            
            // Verifică dacă toate semnificațiile există
            if (flowerDto.MeaningIds.Count > 0)
            {
                var existingMeaningIds = await _context.Meanings
                    .Where(m => flowerDto.MeaningIds.Contains(m.Id))
                    .Select(m => m.Id)
                    .ToListAsync();
                    
                var invalidIds = flowerDto.MeaningIds.Except(existingMeaningIds).ToList();
                if (invalidIds.Any())
                {
                    throw new Exception($"Următoarele semnificații nu există: {string.Join(", ", invalidIds)}");
                }
            }
            
            // Actualizează proprietățile florii
            flower.Name = flowerDto.Name;
            flower.LatinName = flowerDto.LatinName;
            flower.Description = flowerDto.Description;
            flower.ImageUrl = flowerDto.ImageUrl;
            flower.ColorId = flowerDto.ColorId;
            
            // Actualizează semnificațiile
            // Șterge semnificațiile care nu mai există în lista actualizată
            var meaningsToRemove = flower.FlowerMeanings
                .Where(fm => !flowerDto.MeaningIds.Contains(fm.MeaningId))
                .ToList();
                
            foreach (var meaning in meaningsToRemove)
            {
                flower.FlowerMeanings.Remove(meaning);
            }
            
            // Adaugă semnificațiile noi
            var flowerExistingMeaningIds = flower.FlowerMeanings.Select(fm => fm.MeaningId).ToList();
            var newMeaningIds = flowerDto.MeaningIds.Except(flowerExistingMeaningIds).ToList();
            
            foreach (var meaningId in newMeaningIds)
            {
                flower.FlowerMeanings.Add(new FlowerMeaning
                {
                    FlowerId = flower.Id,
                    MeaningId = meaningId
                });
            }
            
            await _context.SaveChangesAsync();
            
            return await GetFlowerByIdAsync(flower.Id);
        }
        
        public async Task<bool> DeleteFlowerAsync(int id)
        {
            var flower = await _context.Flowers
                .Include(f => f.FlowerMeanings)
                .FirstOrDefaultAsync(f => f.Id == id);
                
            if (flower == null)
            {
                return false;
            }
            
            // Șterge mai întâi relațiile many-to-many
            _context.FlowerMeanings.RemoveRange(flower.FlowerMeanings);
            
            // Șterge floarea
            _context.Flowers.Remove(flower);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        // Enhanced methods for lock and diversity functionality
        public async Task<List<FlowerDTO>> GetAllFlowersWithMeaningsAsync()
        {
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<List<FlowerDTO>> GetFlowersByColorsAsync(List<string> colorNames)
        {
            if (colorNames == null || !colorNames.Any())
            {
                return new List<FlowerDTO>();
            }
            
            var normalizedColorNames = colorNames.Select(c => c.ToLower()).ToList();
            
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .Where(f => normalizedColorNames.Contains(f.Color.Name.ToLower()))
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        public async Task<List<FlowerDTO>> GetFlowersByIdsAsync(List<int> flowerIds)
        {
            if (flowerIds == null || !flowerIds.Any())
            {
                return new List<FlowerDTO>();
            }
            
            var flowers = await _context.Flowers
                .Include(f => f.Color)
                .Include(f => f.FlowerMeanings)
                .ThenInclude(fm => fm.Meaning)
                .Where(f => flowerIds.Contains(f.Id))
                .ToListAsync();
                
            return flowers.Select(MapFlowerToDTO).ToList();
        }
        
        // Metodă helper pentru maparea de la entitate la DTO
        private FlowerDTO MapFlowerToDTO(Flower flower)
        {
            return new FlowerDTO
            {
                Id = flower.Id,
                Name = flower.Name,
                LatinName = flower.LatinName,
                Description = flower.Description,
                ImageUrl = flower.ImageUrl,
                ColorId = flower.ColorId,
                ColorName = flower.Color?.Name,
                Meanings = flower.FlowerMeanings?
                    .Select(fm => new MeaningDto
                    {
                        Id = fm.Meaning.Id,
                        Name = fm.Meaning.Name,
                        Description = fm.Meaning.Description
                    })
                    .ToList() ?? new List<MeaningDto>()
            };
        }
    }
}