using aspnetcore_react_auth.Services;
using aspnetcore_react_auth.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace aspnetcore_react_auth.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class PizzaController : ControllerBase
{
    PizzaService _service;
    private readonly UserManager<ApplicationUser> _userManager;

    
    public PizzaController(PizzaService service, 
        UserManager<ApplicationUser> userManager)
    {
        _service = service;
        _userManager = userManager;
    }

    //localhost/pizza/sauce
    [HttpGet("sauce")]
    public IEnumerable<Sauce> SauceGetAll()
    {
        return _service.SauceGetAll();
    }

    //localhost/pizza/topping
    [HttpGet]
    [Route("topping")]
    public IEnumerable<Topping> ToppingGetAll()
    {
        return _service.ToppingGetAll();
    }

    [HttpGet]
    public IEnumerable<Pizza> GetAll()
    {
        return _service.GetAll();
    }


    [HttpGet ]
    [Route("withauth")]
    public  IEnumerable<Pizza> GetAllByUser()
    {
    

        var items =  Enumerable.Empty<Pizza>();

        string userId = HttpContext.User.Claims.FirstOrDefault
                    (x => x.Type == ClaimTypes.NameIdentifier).Value;
        
            if (userId == null) throw new Exception("No autorizado");
    
            items =  _service
                .GetAllByUser(userId);
            
            return items;   
    }

    [HttpGet("{id}")]
    public ActionResult<Pizza> GetById(int id)
    {
        var pizza = _service.GetById(id);

        if(pizza is not null)
        {
            return pizza;
        }
        else
        {
            return NotFound();
        }
    }


    [HttpPost]
    public IActionResult Create(Pizza newPizza)
    {
        /*
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null) return  Challenge();
        */

        var pizza = _service.Create(newPizza);
        return CreatedAtAction(nameof(GetById), new { id = pizza!.Id }, pizza);
    }

    [HttpPut]
    public IActionResult Update(Pizza pizzaEditar){
        _service.update(pizzaEditar);

        return NoContent();
    }

    [HttpPut("{id}/addtopping")]
    public IActionResult AddTopping(int id, int toppingId)
    {
        var pizzaToUpdate = _service.GetById(id);

        if(pizzaToUpdate is not null)
        {
            _service.AddTopping(id, toppingId);
            return NoContent();    
        }
        else
        {
            return NotFound();
        }
    }

    [HttpPut("{id}/updatesauce")]
    public IActionResult UpdateSauce(int id, int sauceId)
    {
        var pizzaToUpdate = _service.GetById(id);

        if(pizzaToUpdate is not null)
        {
            _service.UpdateSauce(id, sauceId);
            return NoContent();    
        }
        else
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var pizza = _service.GetById(id);

        if(pizza is not null)
        {
            _service.DeleteById(id);
            return Ok();
        }
        else
        {
            return NotFound();
        }
    }
}