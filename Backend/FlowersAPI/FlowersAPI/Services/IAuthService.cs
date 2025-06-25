using System.Threading.Tasks;
using FlowersAPI.DTOs.AuthDTOs;
using FlowersAPI.Models;

namespace FlowersAPI.Services
{
    public interface IAuthService
    {
        Task<TokenDTO> Register(RegisterDTO registerDto);
        Task<TokenDTO> Login(LoginDTO loginDto);
        Task<TokenDTO> RefreshToken(TokenDTO tokenDto);
        Task<User> GetUserFromAccessToken(string accessToken);
    }
}