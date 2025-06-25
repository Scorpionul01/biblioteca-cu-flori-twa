using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FlowersAPI.DTOs.FlowerDTOs;
using FlowersAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowersAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlowersController : ControllerBase
    {
        private readonly IFlowerService _flowerService;
        private readonly IFlowerPopularityService _popularityService;
        
        public FlowersController(IFlowerService flowerService, IFlowerPopularityService popularityService)
        {
            _flowerService = flowerService;
            _popularityService = popularityService;
        }
        
        /// <summary>
        /// Obține toate florile (endpoint pentru React)
        /// </summary>
        /// <returns>Lista tuturor florilor</returns>
        [HttpGet("/api/flowers-1")]
        public async Task<ActionResult<List<FlowerDTO>>> GetAllFlowers1()
        {
            var flowers = await _flowerService.GetAllFlowersAsync();
            return Ok(flowers);
        }

        /// <summary>
        /// Obține toate florile
        /// </summary>
        /// <returns>Lista tuturor florilor</returns>
        [HttpGet]
        public async Task<ActionResult<List<FlowerDTO>>> GetAllFlowers()
        {
            var flowers = await _flowerService.GetAllFlowersAsync();
            return Ok(flowers);
        }
        
        /// <summary>
        /// Obține o floare după ID
        /// </summary>
        /// <param name="id">ID-ul florii</param>
        /// <returns>Floarea cu ID-ul specificat</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<FlowerDTO>> GetFlowerById(int id)
        {
            try
            {
                var flower = await _flowerService.GetFlowerByIdAsync(id);
                
                // Înregistrăm click-ul pentru a urmări popularitatea
                await _popularityService.IncrementClickCountAsync(id);
                
                return Ok(flower);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        
        /// <summary>
        /// Caută flori după un termen
        /// </summary>
        /// <param name="searchTerm">Termen de căutare</param>
        /// <returns>Lista florilor care corespund căutării</returns>
        [HttpGet("search")]
        public async Task<ActionResult<List<FlowerDTO>>> SearchFlowers([FromQuery] string searchTerm)
        {
            var flowers = await _flowerService.SearchFlowersAsync(searchTerm);
            return Ok(flowers);
        }
        
        /// <summary>
        /// Obține flori după culoare
        /// </summary>
        /// <param name="colorId">ID-ul culorii</param>
        /// <returns>Lista florilor cu culoarea specificată</returns>
        [HttpGet("bycolor/{colorId}")]
        public async Task<ActionResult<List<FlowerDTO>>> GetFlowersByColor(int colorId)
        {
            var flowers = await _flowerService.GetFlowersByColorAsync(colorId);
            return Ok(flowers);
        }
        
        /// <summary>
        /// Obține flori după semnificație
        /// </summary>
        /// <param name="meaningId">ID-ul semnificației</param>
        /// <returns>Lista florilor cu semnificația specificată</returns>
        [HttpGet("bymeaning/{meaningId}")]
        public async Task<ActionResult<List<FlowerDTO>>> GetFlowersByMeaning(int meaningId)
        {
            var flowers = await _flowerService.GetFlowersByMeaningAsync(meaningId);
            return Ok(flowers);
        }
        
        /// <summary>
        /// Adaugă o nouă floare (doar admin)
        /// </summary>
        /// <param name="flowerDto">Datele florii</param>
        /// <returns>Floarea creată</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FlowerDTO>> CreateFlower(FlowerCreateDTO flowerDto)
        {
            try
            {
                var flower = await _flowerService.CreateFlowerAsync(flowerDto);
                return CreatedAtAction(nameof(GetFlowerById), new { id = flower.Id }, flower);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        /// <summary>
        /// Actualizează o floare existentă (doar admin)
        /// </summary>
        /// <param name="flowerDto">Datele florii</param>
        /// <returns>Floarea actualizată</returns>
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FlowerDTO>> UpdateFlower(FlowerUpdateDTO flowerDto)
        {
            try
            {
                var flower = await _flowerService.UpdateFlowerAsync(flowerDto);
                return Ok(flower);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        /// <summary>
        /// Șterge o floare (doar admin)
        /// </summary>
        /// <param name="id">ID-ul florii</param>
        /// <returns>Rezultatul operației</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteFlower(int id)
        {
            try
            {
                var result = await _flowerService.DeleteFlowerAsync(id);
                if (result)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound("Floarea nu a fost găsită");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
