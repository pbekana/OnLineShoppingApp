export default function Cart({ store }) {
  return (
    <div>
      <h1>Cart</h1>
      
      {store.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        store.map((item, index) => (
          <div key={index}>
            <img src={item.image} alt={item.name} width="80" />
            <p>{item.name}</p>
            <p>{item.description}</p>
            <p>{item.price}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}