import { BrowserRouter,NavLink,Routes,Route } from "react-router-dom";
import App from "./App.jsx";
import  Footer  from "./Footer.jsx";
import Women from './Women.jsx';
import Men from "./Men.jsx";
import Kids from "./Kids.jsx";
import Accesories from "./Accesories.jsx";
import Cart from "./Cart.jsx";
import { useState } from "react";
export default function Links() {
const[store,setStore]=useState([]);
const handleAddToCart=(item)=>  {
setStore(prevStore=>[...prevStore,item]);
}
    
return(
    <>
    <div>
     <BrowserRouter>
        <App />
     <Routes>
            <Route path="/women" element={<Women onAddToCart={handleAddToCart}/>}></Route>
            <Route path="/men" element={<Men onAddToCart={handleAddToCart}/>}></Route>
            <Route path="/kids" element={<Kids onAddToCart={handleAddToCart} />}></Route>
            <Route path="/accesories" element={<Accesories onAddToCart={handleAddToCart}/>}></Route>
            <Route path="/AboutUs" element={<h1>About Us</h1>}></Route>
            <Route path="/iring" element={<h1>iring</h1>}></Route>
            <Route path="/Support" element={<h1>Support</h1>}></Route>
            <Route path="/FindStore" element={<h1>Find Store</h1>}></Route>
            <Route path="/Shipment" element={<h1>Shipment</h1>}></Route>
            <Route path="/Payment" element={<h1>Payment</h1>}></Route>
            <Route path="/GiftCard" element={<h1>Gift Card</h1>}></Route>
            <Route path="/Return" element={<h1>Return</h1>}></Route>
            <Route path="/Help" element={<h1>Help</h1>}></Route>
            <Route path="/cart" element={<Cart store={store} />}></Route>
    
          </Routes>
        <div className="footer">
              <p>{<Footer/>}</p>
        </div>
     </BrowserRouter>
    </div>
    </>
)
}