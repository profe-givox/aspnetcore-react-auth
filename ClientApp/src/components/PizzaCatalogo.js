import React, {Component} from "react";
import {Redirect} from 'react-router-dom';
import { Container, Table, Button, Modal, ModalBody, 
    ModalHeader, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import  axios from "axios";
import authService from './api-authorization/AuthorizeService'


export class PizzaCatalogo extends Component{
    constructor(props){
        super(props);
        this.state = {data: [],salsas:[], ingredientes: [], accion: 0,  
             name: "", salsa: 1, toppings: [], pizzaE: {}, isUserValid: false  };

        this.handleClick = this.handleClick.bind(this);
    }

     componentDidMount(){
        const datos = {
            pizzas: [],
            salsas: [],
            ingredientes: []
        };
        
        authService.getUser().then(
            (u) => { console.log(u);
                const valo = authService.isAdmin (u);
                console.log(valo);
                this.setState({isUserValid: valo})
            }

        );

        authService.getAccessToken().then(
            (token) => {
                console.log(token);
                const opcines = {
                    headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
                }
                fetch('pizza/withauth', opcines).then((response )=>{
                    return response.json();   
               }).then(
                   (dataApi) => {
                      datos.pizzas = dataApi;
                      return fetch('pizza/sauce', opcines);
                      /*
                      console.log(dataApi); 
                      
                      this.setState({data: dataApi}
                          );
                      */
                      }
                      
                     
               ).then(
                   (response) => {
                       return response.json();
                   }
               ).then(
                   (dataSalsa) => {
                       datos.salsas = dataSalsa;
                       return fetch('pizza/topping', opcines);
                   }
               ).then(
                   (response) => {return  response.json()}
               ).then(
                   (dataTopping) => {
                       datos.ingredientes = dataTopping;
                       this.setState({data: datos.pizzas,
                          salsas: datos.salsas, ingredientes: datos.ingredientes});
                          console.log(this.state);
                   }
               );
            }
        );
        
    }

    mitoogle = () => {
        this.setState({accion: 0, name: ''});
    }

    handleClick  () {
        /*
        console.log('this is:', this);
        console.log('e:', e.target);
        console.log('e:', e);*/
  
        //this.setState({ modalUpdate: true });
        const os = this.state.salsas.filter(salsa => salsa.id==this.state.salsa).pop();
        const ot = [];
        const ingre = this.state.ingredientes;
        console.log(ingre); 
        this.state.toppings.forEach(
            it => {
                const ing = ingre.filter(ele =>  ele.id==it ).pop();
                ot.push(ing);
                console.log(ing);
            }
        );

        console.log(ot);

        const pizza = {
            id: 0,
            name: this.state.name,
            sauce: os,
            toppings: ot

        };

        console.log(pizza);
        
        switch(this.state.accion){
            case 1:
                this.create(pizza);
                break;

            case 2:
                this.edit(pizza);
                break ;
        }

    }

    edit = (pizza) => {
    
        pizza.id = this.state.pizzaE.id;

        const options = {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(pizza)
        };

        fetch('pizza', options)
            .then(
                (response) =>  {return response.status;      }
            ).then(
                (code) => {
                    if(code==204){
                        console.log(code);
                        
                        this.componentDidMount();                                        
                        this.setState({ accion: 0 });
                        
                    }
                }
            );
        
    }

    create = (pizza) => {
        const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(pizza)
        };

        fetch('pizza', options)
            .then(
                (response) =>  {return response.status;      }
            ).then(
                (code) => {
                    if(code==201){
                        console.log(code);
                        
                        const  pizzas = Array.from( this.state.data);
                        pizzas.push({name: pizza.name});
                        this.componentDidMount();                                        
                        this.setState({ accion: 0 });
                        
                    }
                }
            );
        
    }

    editar  = (item) => {
        console.log(item);
        authService.getAccessToken().then(
            (token) =>{
                const opcines = {
                    headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
               };
               fetch('pizza/'+item.id, opcines)
                .then(response => { return response.json()} )
                    .then(o => {
                        console.log(o);
                        this.setState({accion: 2, pizzaE: o, name: o.name})
                    })
                    ;
            }
        );
    }

    delete = async (id) => {
        const response = await axios.delete("pizza/"+id);
        if (response.status==200 || response.status==204){
            this.componentDidMount();                                        
            this.setState({ accion: 0 });
        } 
    }

    mostrarModalInsertar = () => {
        this.setState({
          accion: 1,
        });
      };
    
    handleChange = (e) => {
        if(e.target.name=='toppings'){
            const toppi = Array.from(e.target.selectedOptions, option => option.value);
            console.log(toppi);
            this.setState({toppings: toppi});
            console.log(this.state);
        }else{
            this.setState({[e.target.name]: e.target.value});
        }
    };

    marcarIngre = (ingre) => {
        const ingres =  this.state.pizzaE.toppings;
        const hayIngre = ingres.filter( (ing) => ing.id==ingre.id)
        return hayIngre.length>0;
    }



    render(){
        return (
            <div>
                <Container>
                    <h1 id="tabelLabel" >Catalogo de pizza</h1>
                    <p>Este componente demuestra el uso de Fetch para ir a la API server</p>
                    {  this.state.isUserValid &&  <Button color="success" onClick={this.mostrarModalInsertar}>Crear</Button>  }
                    <Table hover>
                        <thead>
                            <tr>
                            <th>
                                #
                            </th>
                            <th>
                                Pizza
                            </th>
                            <th>
                                Salsa
                            </th>
                            <th>
                                Action
                            </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.data.map( pizza => 
                                    <tr key={pizza.id}>
                                        <th scope="row">{pizza.id}</th>
                                        <td>{pizza.name}</td>
                                        <td>{pizza.sauce}</td>
                                        <td><Button color="primary" onClick={() => this.editar(pizza) } >
                                                Edit
                                            </Button> {' '}
                                            <Button color="primary" onClick={() => this.delete(pizza.id)} >
                                                X
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            }
                            
                        </tbody>
                        </Table>
                    </Container>
                    <Modal
                        isOpen={this.state.accion>0 && true}
                        centered
                        toggle={ this.mitoogle }
                        
                    >
                        <ModalHeader toggle={this.mitoogle}>
                        Modal title
                        </ModalHeader>
                        <ModalBody>
                            <Form>
                                <FormGroup>
                                    <Label for="name">
                                        Pizza
                                    </Label>
                                    <Input
                                    id="name"
                                    name="name"
                                    placeholder="Nombre Pizza"
                                    onChange={this.handleChange}
                                    value={this.state.name}
                                    />
                                </FormGroup>
                                
                                <FormGroup>
                                    <Label for="salsa">
                                    Salsa
                                    </Label>
                                    <Input
                                    id="salsa"
                                    name="salsa"
                                    type="select"
                                    onChange={this.handleChange}
                                    >
                                        {
                                            this.state.salsas.map(
                                            salsa => 
                                                <option value={salsa.id} selected={this.state.accion===2 && this.state.pizzaE.sauce.id===salsa.id}>{salsa.name}</option>
                                        )
                                        }
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="toppings">
                                    Ingredientes
                                    </Label>
                                    <Input
                                    id="toppings"
                                    multiple
                                    name="toppings"
                                    type="select"
                                    onChange={this.handleChange}
                                    >
                                        {
                                            this.state.ingredientes.map(
                                            topping => 
                                                <option value={topping.id }  selected={ this.state.accion===2 && this.marcarIngre(topping) } >{topping.name}</option>
                                        )
                                        }
                                    </Input>
                                </FormGroup>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                        <Button
                            color="primary"
                            onClick={this.handleClick}
                        >
                            Guardar
                        </Button>
                        {' '}
                        <Button onClick={function noRefCheck(){}}>
                            Cancelar
                        </Button>
                        </ModalFooter>
                    </Modal>
 
            </div>
        );
    }
}