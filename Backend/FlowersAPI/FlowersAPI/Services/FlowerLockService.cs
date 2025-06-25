using Microsoft.EntityFrameworkCore;
using FlowersAPI.Data;
using FlowersAPI.Models;

namespace FlowersAPI.Services
{
    public class FlowerLockService : IFlowerLockService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FlowerLockService> _logger;

        public FlowerLockService(ApplicationDbContext context, ILogger<FlowerLockService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> LockFlowerAsync(int userId, int flowerId, int? colorId = null, int? quantity = null)
        {
            try
            {
                // Check if flower is already locked
                var existingLock = await _context.LockedFlowers
                    .FirstOrDefaultAsync(lf => lf.UserId == userId && lf.FlowerId == flowerId && lf.IsActive);

                if (existingLock != null)
                {
                    // Update existing lock
                    existingLock.PreferredColorId = colorId;
                    existingLock.PreferredQuantity = quantity;
                    existingLock.LockedAt = DateTime.UtcNow;
                    
                    _logger.LogInformation("Updated existing lock for flower {FlowerId} for user {UserId}", flowerId, userId);
                }
                else
                {
                    // Create new lock
                    var lockedFlower = new LockedFlower
                    {
                        UserId = userId,
                        FlowerId = flowerId,
                        PreferredColorId = colorId,
                        PreferredQuantity = quantity,
                        IsActive = true
                    };

                    _context.LockedFlowers.Add(lockedFlower);
                    _logger.LogInformation("Created new lock for flower {FlowerId} for user {UserId}", flowerId, userId);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error locking flower {FlowerId} for user {UserId}", flowerId, userId);
                return false;
            }
        }

        public async Task<bool> UnlockFlowerAsync(int userId, int flowerId)
        {
            try
            {
                var lockedFlower = await _context.LockedFlowers
                    .FirstOrDefaultAsync(lf => lf.UserId == userId && lf.FlowerId == flowerId && lf.IsActive);

                if (lockedFlower != null)
                {
                    lockedFlower.IsActive = false;
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Unlocked flower {FlowerId} for user {UserId}", flowerId, userId);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlocking flower {FlowerId} for user {UserId}", flowerId, userId);
                return false;
            }
        }

        public async Task<List<LockedFlower>> GetLockedFlowersAsync(int userId)
        {
            try
            {
                return await _context.LockedFlowers
                    .Include(lf => lf.Flower)
                    .Include(lf => lf.PreferredColor)
                    .Where(lf => lf.UserId == userId && lf.IsActive)
                    .OrderByDescending(lf => lf.LockedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting locked flowers for user {UserId}", userId);
                return new List<LockedFlower>();
            }
        }

        public async Task<bool> ClearAllLockedFlowersAsync(int userId)
        {
            try
            {
                var lockedFlowers = await _context.LockedFlowers
                    .Where(lf => lf.UserId == userId && lf.IsActive)
                    .ToListAsync();

                foreach (var flower in lockedFlowers)
                {
                    flower.IsActive = false;
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Cleared {Count} locked flowers for user {UserId}", lockedFlowers.Count, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing locked flowers for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> IsFlowerLockedAsync(int userId, int flowerId)
        {
            try
            {
                return await _context.LockedFlowers
                    .AnyAsync(lf => lf.UserId == userId && lf.FlowerId == flowerId && lf.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if flower {FlowerId} is locked for user {UserId}", flowerId, userId);
                return false;
            }
        }
    }
}
