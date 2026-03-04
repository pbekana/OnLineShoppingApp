export default function Women({ onAddToCart }) {
  const Item = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1604702770018-55669959b124?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
      name: "Pink Summer Dress",
      description: "Cute and comfy dress for sunny days.",
      price: "$1200.00",
    },
    {
      id: 2,
      image:
        "https://plus.unsplash.com/premium_photo-1668485966810-cbd0f685f58f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
      name: "Trendy Kids Outfit",
      description: "Stylish set for everyday fun.",
      price: "$1500.00",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
      name: "Casual Play Outfit",
      description: "Perfect active wear for kids.",
      price: "$1100.00",
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
            <button onClick={() => onAddToCart(item)}>Add to cart</button>
            <div className="overlay">
              <button className="shop-btn">Shop Now</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
