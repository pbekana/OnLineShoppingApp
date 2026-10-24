import CategoryProducts from "./components/CategoryProducts";

export default function Men({ onAddToCart }) {
  return <CategoryProducts category="men" onAddToCart={onAddToCart} />;
}
