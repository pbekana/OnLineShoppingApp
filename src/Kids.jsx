export default function Kids({onAddToCart}) {
 const Item = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&auto=format&fit=crop&q=60",
    name: "Kids Cartoon T-Shirt",
    description: "Soft cotton t-shirt with fun cartoon print.",
    price: "$900.00",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60",
    name: "Cute Summer Dress",
    description: "Light and colorful dress perfect for summer.",
    price: "$1200.00",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=60",
    name: "Kids Casual Hoodie",
    description: "Warm and comfy hoodie for cool days.",
    price: "$1500.00",
  },
];
   
  return (
    <>
      <div className="item-container">
        {Item.map((item) => (
          <div key={item.id} className="items">
            <img src={item.image} alt="womens clothes" />
            <p>{item.name}</p>
            <p>{item.description}</p>
            <p>{item.price}</p>
            <button onClick={()=>onAddToCart(item)}>Add to  cart</button>
            <div className="overlay">
              <button className="shop-btn">Shop Now</button>
            </div>
          </div>
        ))}
      </div>
      
    </>
  );
}