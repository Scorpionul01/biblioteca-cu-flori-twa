namespace FlowersAPI.DTOs.AuthDTOs
{
    public class TokenDTO
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public int UserId { get; set; }
    }
}
