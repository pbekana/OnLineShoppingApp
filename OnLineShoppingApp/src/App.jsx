import "./App.css";
import { useState } from "react";
import {  NavLink } from "react-router-dom";
import Footer from "./Footer";
import Register from "./Register";
export default function App() {
const[menu,setMenu]=useState(false);
const[showSearch,setShowSearch]=useState(false);
const[search,setSearch]=useState("");
const[back,setBack]=useState(false);
const Items = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=60",
    name: "Classic White T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear.",
    price: "$1400.00",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60",
    name: "Men Casual Hoodie",
    description: "Warm and cozy hoodie for cool weather.",
    price: "$2500.00",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=60",
    name: "Slim Fit Jeans",
    description: "Modern slim fit jeans with stretch comfort.",
    price: "$2800.00",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1604702770018-55669959b124?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
    name: "Pink Summer Dress",
    description: "Cute and comfy dress for sunny days.",
    price: "$1200.00",
  },
  {
    id: 5,
    image: "https://plus.unsplash.com/premium_photo-1668485966810-cbd0f685f58f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
    name: "Trendy Kids Outfit",
    description: "Stylish set for everyday fun.",
    price: "$1500.00",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
    name: "Casual Play Outfit",
    description: "Perfect active wear for kids.",
    price: "$1100.00",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&auto=format&fit=crop&q=60",
    name: "Kids Cartoon T-Shirt",
    description: "Soft cotton t-shirt with fun cartoon print.",
    price: "$900.00",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60",
    name: "Cute Summer Dress",
    description: "Light and colorful dress perfect for summer.",
    price: "$1200.00",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=60",
    name: "Kids Casual Hoodie",
    description: "Warm and comfy hoodie for cool days.",
    price: "$1500.00",
  },
{
    id: 10,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60",
    name: "Leather Handbag",
    description: "Premium quality leather handbag with spacious design.",
    price: "$4000.00",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
    name: "Classic Wrist Watch",
    description: "Elegant analog watch perfect for all occasions.",
    price: "$2500.00",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60",
    name: "Stylish Sunglasses",
    description: "Trendy UV-protected sunglasses for everyday style.",
    price: "$1200.00",
  },
];
const FilterItems = Items.filter((item) =>
  item.name.toLowerCase().includes(search.toLowerCase())
);

const showForm=(e)=>{
e.preventDefault();
if (menu === false) {
  setMenu(true);
}
else if(menu === true){
 setMenu(false);
}
}
const handleBack=(e)=>{
e.preventDefault();
if (back === false) {
  setBack(true);
}
else if(back ===true){
setBack(false);
}
}
const hadleShowSearch=(e)=>{
e.preventDefault();
if(showSearch == false){
setShowSearch(true);
}
}

const displaySearch=()=>{
  if (search && FilterItems.length > 0) {
    return FilterItems.map((item) => (
      <div key={item.id} className="item">
        <img src={item.image} alt={item.name} />
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <p>{item.price}</p>
      </div>
    ));
  }
  else if(search && FilterItems .length ===0){
    return <p>no item founds</p>
  }
}
  return (
    <>
     
        <div className="container">
        <header>
          <h1>Big Sales</h1>
           <div className="register">
            <p>{<Register/>}</p>
           </div>
           <div className="menu">
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828859.png" alt="menu icon" onClick={showForm}/>
             {menu &&
              <div className="menu-items">
              <NavLink to="/setting">setting</NavLink>
              <NavLink to="/cart">cart</NavLink>
              <NavLink to="/men">Mens</NavLink>
              <NavLink to="/women">Womens</NavLink>
              <NavLink to="/kids">kids</NavLink>
              <NavLink to="/accesories">accesories</NavLink>
            </div>
             }
           </div>
        </header>
          <nav>
            <div className="link">
              <NavLink to="/women">women</NavLink> 
              <NavLink to="/men">men</NavLink>
              <NavLink to="/kids">kids</NavLink>
              <NavLink to="/accesories">accesories</NavLink>
             
            </div>
          </nav>

           <div className="cart-container">
          <button onClick={handleBack}><NavLink  to="/cart"> <img src="https://cdn-icons-png.flaticon.com/512/263/263142.png" alt="cart icon" /></NavLink> {" "}</button>
          <button onClick={hadleShowSearch}><img src="https://cdn-icons-png.flaticon.com/512/622/622669.png" alt="search icon" /></button>
         {showSearch &&
         <form action="#">
            <input type="text" placeholder="enter something to search"
            value={search} onChange={(e)=>setSearch(e.target.value)}/>
          </form>
          
         } 
        
        {back &&
         <div className="home">
                <button onClick={<App/>}><NavLink to="/">Back</NavLink></button> 
         </div>}
         <p className="filter">{displaySearch()}</p>
         
        </div>
       
      
        
        </div>
    </>
  );
}
