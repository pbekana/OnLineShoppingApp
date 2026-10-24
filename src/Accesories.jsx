import CategoryProducts from "./components/CategoryProducts";

export default function Accesories({ onAddToCart }) {
  return <CategoryProducts category="accessories" onAddToCart={onAddToCart} />;
}
