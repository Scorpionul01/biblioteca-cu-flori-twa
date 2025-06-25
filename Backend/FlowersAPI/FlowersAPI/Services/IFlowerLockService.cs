using FlowersAPI.Models;

namespace FlowersAPI.Services
{
    public interface IFlowerLockService
    {
        Task<bool> LockFlowerAsync(int userId, int flowerId, int? colorId = null, int? quantity = null);
        Task<bool> UnlockFlowerAsync(int userId, int flowerId);
        Task<List<LockedFlower>> GetLockedFlowersAsync(int userId);
        Task<bool> ClearAllLockedFlowersAsync(int userId);
        Task<bool> IsFlowerLockedAsync(int userId, int flowerId);
    }
}
