export default function Men({onAddToCart}) {
  const Item = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=60",
    name: "Classic White T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear.",
    price: "$1400.00",
  },
  {
    id: 4,
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
 
];
  return (
    <>
      <div className="item-container" >
        {Item.map((item) => (
          <div key={item.id} className="items">
            <img src={item.image} alt="womens clothes" />
            <p>{item.name}</p>
            <p>{item.description}</p>
            <p>{item.price}</p>
            <button onClick={()=>onAddToCart(item)}>Add to cart</button>
            <div className="overlay">
              <button className="shop-btn">Shop Now</button>
            </div>
          </div>
        ))}
    
      </div>
     
    
    </>
  );
}
