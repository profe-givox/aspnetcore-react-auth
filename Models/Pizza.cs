using System.ComponentModel.DataAnnotations;

namespace   aspnetcore_react_auth.Models;

public class Pizza
{
    public int Id { get; set; }

    [MaxLength(100)]
    [Required]
    public string? Name { get; set; }

    public Sauce? Sauce { get; set; }
    
    public ICollection<Topping>? Toppings { get; set; }

    public string? UserId { get; set; }

}