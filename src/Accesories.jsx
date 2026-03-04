export default function Accesories({onAddToCart}) {
 const Item = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60",
    name: "Leather Handbag",
    description: "Premium quality leather handbag with spacious design.",
    price: "$4000.00",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
    name: "Classic Wrist Watch",
    description: "Elegant analog watch perfect for all occasions.",
    price: "$2500.00",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60",
    name: "Stylish Sunglasses",
    description: "Trendy UV-protected sunglasses for everyday style.",
    price: "$1200.00",
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