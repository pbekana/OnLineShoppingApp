import CategoryProducts from "./components/CategoryProducts";

export default function Kids({ onAddToCart }) {
  return <CategoryProducts category="kids" onAddToCart={onAddToCart} />;
}
