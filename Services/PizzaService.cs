using aspnetcore_react_auth.Models;
using aspnetcore_react_auth.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace aspnetcore_react_auth.Services;

public class PizzaService
{
    private readonly ApplicationDbContext _context;
    

    public PizzaService(ApplicationDbContext context
                        )
    {
        _context = context;
    
    }

    public IEnumerable<Topping> ToppingGetAll()
    {
       return _context.Toppings
        .AsNoTracking()
        .ToList();

    }

    public IEnumerable<Sauce> SauceGetAll()
    {
       return _context.Sauces
        .AsNoTracking()
        .ToList();

    }

    public IEnumerable<Pizza> GetAll()
    {
       return _context.Pizzas
        .AsNoTracking()
        .ToList();

    }

    public IEnumerable<Pizza>  GetAllByUser(String currentUser )
    {
            return  _context.Pizzas
                .Where( x => x.UserId == currentUser )
                .ToArray() ;

    }

    public Pizza? GetById(int id)
    {

         return _context.Pizzas
            .Include(p => p.Toppings)
            .Include(p => p.Sauce)
            .AsNoTracking()
            .SingleOrDefault(p => p.Id == id);

    }

    public Pizza? Create(Pizza newPizza)
    {
        
        var pizza = new Pizza  {
            Id=newPizza.Id,
            Name=newPizza.Name
        };

        _context.Pizzas.Add(pizza);
        _context.SaveChanges();


        UpdateSauce(pizza.Id, newPizza.Sauce.Id);

        foreach (var item in newPizza.Toppings)
        {
            AddTopping(pizza.Id, item.Id);
        }


        return newPizza;
    }

    public Pizza? Create(Pizza newPizza, ApplicationUser currentUser)
    {
        
        var pizza = new Pizza  {
            Id=newPizza.Id,
            Name=newPizza.Name
        };

        _context.Pizzas.Add(pizza);
        _context.SaveChanges();


        UpdateSauce(pizza.Id, newPizza.Sauce.Id);

        foreach (var item in newPizza.Toppings)
        {
            AddTopping(pizza.Id, item.Id);
        }


        return newPizza;
    }

    public void update(Pizza pizzaUpdate){
                
        var piiza =
                _context.Pizzas
        .Include(p => p.Toppings)
        .Include(p => p.Sauce)
        .SingleOrDefault(p => p.Id ==  pizzaUpdate.Id);

        foreach( Topping t in piiza.Toppings.ToList()){
            piiza.Toppings.Remove(t);    
        }

        if(pizzaUpdate.Sauce.Id != piiza.Sauce.Id)
            piiza.Sauce = pizzaUpdate.Sauce;
        
        _context.Pizzas.Update(piiza);
        _context.SaveChanges();

        pizzaUpdate.Toppings.ToList().ForEach(
            item => AddTopping(pizzaUpdate.Id, item.Id)
        );
        
    }

    public void AddTopping(int PizzaId, int ToppingId)
    {
        var pizzaToUpdate = _context.Pizzas.Find(PizzaId);
        var toppingToAdd = _context.Toppings.Find(ToppingId);

        if (pizzaToUpdate is null || toppingToAdd is null)
        {
            throw new NullReferenceException("Pizza or topping does not exist");
        }

        if(pizzaToUpdate.Toppings is null)
        {
            pizzaToUpdate.Toppings = new List<Topping>();
        }

        pizzaToUpdate.Toppings.Add(toppingToAdd);

        _context.Pizzas.Update(pizzaToUpdate);
        _context.SaveChanges();

    }

    public void UpdateSauce(int PizzaId, int SauceId)
    {
            var pizzaToUpdate = _context.Pizzas.Find(PizzaId);
            var sauceToUpdate = _context.Sauces.Find(SauceId);

            if (pizzaToUpdate is null || sauceToUpdate is null)
            {
                throw new NullReferenceException("Pizza or sauce         does not exist");
            }

            pizzaToUpdate.Sauce = sauceToUpdate;

            _context.SaveChanges();

    }

    public void DeleteById(int id)
    {
         var pizzaDel = _context.Pizzas.Find(id);
        if(pizzaDel is null){
            throw new NullReferenceException("Pizza does not exist");       
        }
        _context.Pizzas.Remove(pizzaDel);
        _context.SaveChanges();
    }
}