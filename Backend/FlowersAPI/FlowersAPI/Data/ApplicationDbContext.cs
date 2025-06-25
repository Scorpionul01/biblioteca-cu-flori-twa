using FlowersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowersAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Flower> Flowers { get; set; }
        public DbSet<Color> Colors { get; set; }
        public DbSet<Meaning> Meanings { get; set; }
        public DbSet<FlowerMeaning> FlowerMeanings { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<FlowerPopularity> FlowerPopularities { get; set; }
        public DbSet<LockedFlower> LockedFlowers { get; set; }
        public DbSet<BouquetHistory> BouquetHistory { get; set; }
        public DbSet<UserPreferences> UserPreferences { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configurarea relației many-to-many între Flowers și Meanings
            modelBuilder.Entity<FlowerMeaning>()
                .HasOne(fm => fm.Flower)
                .WithMany(f => f.FlowerMeanings)
                .HasForeignKey(fm => fm.FlowerId);
                
            modelBuilder.Entity<FlowerMeaning>()
                .HasOne(fm => fm.Meaning)
                .WithMany(m => m.FlowerMeanings)
                .HasForeignKey(fm => fm.MeaningId);
                
            // Configurarea relației one-to-many între Colors și Flowers
            modelBuilder.Entity<Flower>()
                .HasOne(f => f.Color)
                .WithMany(c => c.Flowers)
                .HasForeignKey(f => f.ColorId);
                
            // Configurarea relației one-to-one între Flower și FlowerPopularity
            modelBuilder.Entity<Flower>()
                .HasOne(f => f.Popularity)
                .WithOne(fp => fp.Flower)
                .HasForeignKey<FlowerPopularity>(fp => fp.FlowerId);
                
            // Configurarea relațiilor pentru LockedFlower
            modelBuilder.Entity<LockedFlower>()
                .HasOne(lf => lf.User)
                .WithMany()
                .HasForeignKey(lf => lf.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<LockedFlower>()
                .HasOne(lf => lf.Flower)
                .WithMany()
                .HasForeignKey(lf => lf.FlowerId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<LockedFlower>()
                .HasOne(lf => lf.PreferredColor)
                .WithMany()
                .HasForeignKey(lf => lf.PreferredColorId)
                .OnDelete(DeleteBehavior.SetNull);
                
            // Configurarea relațiilor pentru BouquetHistory
            modelBuilder.Entity<BouquetHistory>()
                .HasOne(bh => bh.User)
                .WithMany()
                .HasForeignKey(bh => bh.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Configurarea relațiilor pentru UserPreferences
            modelBuilder.Entity<UserPreferences>()
                .HasOne(up => up.User)
                .WithMany()
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Index pentru performanță
            modelBuilder.Entity<LockedFlower>()
                .HasIndex(lf => new { lf.UserId, lf.FlowerId })
                .IsUnique(false);
                
            modelBuilder.Entity<BouquetHistory>()
                .HasIndex(bh => new { bh.UserId, bh.GeneratedAt });
                
            modelBuilder.Entity<UserPreferences>()
                .HasIndex(up => up.UserId)
                .IsUnique();
                
            // Date inițiale pentru culori
            modelBuilder.Entity<Color>().HasData(
                new Color { Id = 1, Name = "Roșu" },
                new Color { Id = 2, Name = "Alb" },
                new Color { Id = 3, Name = "Roz" },
                new Color { Id = 4, Name = "Galben" },
                new Color { Id = 5, Name = "Portocaliu" },
                new Color { Id = 6, Name = "Mov" },
                new Color { Id = 7, Name = "Albastru" }
            );
            
            // Date inițiale pentru semnificații
            modelBuilder.Entity<Meaning>().HasData(
                new Meaning { Id = 1, Name = "Dragoste", Description = "Simbolizează pasiunea și iubirea profundă" },
                new Meaning { Id = 2, Name = "Prietenie", Description = "Simbolizează o legătură puternică și loialitate" },
                new Meaning { Id = 3, Name = "Fericire", Description = "Simbolizează bucuria și optimismul" },
                new Meaning { Id = 4, Name = "Noroc", Description = "Simbolizează șansa și prosperitatea" },
                new Meaning { Id = 5, Name = "Puritate", Description = "Simbolizează inocența și curățenia" }
            );
        }
    }
}
