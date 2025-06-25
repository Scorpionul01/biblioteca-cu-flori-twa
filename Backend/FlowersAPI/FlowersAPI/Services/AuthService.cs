using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FlowersAPI.Data;
using FlowersAPI.DTOs.AuthDTOs;
using FlowersAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;
using System.Text;

namespace FlowersAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        
        public AuthService(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }
        
        public async Task<TokenDTO> Register(RegisterDTO registerDto)
        {
            // Verifică dacă utilizatorul există deja
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception("Utilizator cu acest email există deja");
            }
            
            // Creează utilizatorul
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = HashPassword(registerDto.Password),
                Role = "User" // Rolul implicit este User
            };
            
            // Generează refresh token
            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
            
            // Salvează utilizatorul în baza de date
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Generează access token
            var accessToken = _tokenService.GenerateAccessToken(user);
            
            return new TokenDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Username = user.Username,
                Role = user.Role,
                UserId = user.Id
            };
        }
        
        public async Task<TokenDTO> Login(LoginDTO loginDto)
        {
            // Caută utilizatorul după email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            
            // Verifică dacă utilizatorul există și parola este corectă
            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                throw new Exception("Email sau parolă incorecte");
            }
            
            // Generează token-uri
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            
            // Actualizează refresh token în baza de date
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
            await _context.SaveChangesAsync();
            
            return new TokenDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Username = user.Username,
                Role = user.Role,
                UserId = user.Id
            };
        }
        
        public async Task<TokenDTO> RefreshToken(TokenDTO tokenDto)
        {
            string accessToken = tokenDto.AccessToken;
            string refreshToken = tokenDto.RefreshToken;
            
            // Validează token-ul expirat
            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
            var userId = int.Parse(principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            
            // Caută utilizatorul în baza de date
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            
            // Verifică dacă utilizatorul există și refresh token-ul este valid
            if (user == null || 
                user.RefreshToken != refreshToken || 
                user.RefreshTokenExpiryTime <= DateTime.Now)
            {
                throw new Exception("Invalid refresh token");
            }
            
            // Generează noi token-uri
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            
            // Actualizează refresh token în baza de date
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
            await _context.SaveChangesAsync();
            
            return new TokenDTO
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Username = user.Username,
                Role = user.Role,
                UserId = user.Id
            };
        }
        
        public async Task<User> GetUserFromAccessToken(string accessToken)
        {
            try
            {
                var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
                var userId = int.Parse(principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
                
                return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            }
            catch
            {
                return null;
            }
        }
        
        // Metode private pentru hashing și verificare parolă
        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                
                return builder.ToString();
            }
        }
        
        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }
}