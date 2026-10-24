import CategoryProducts from "./components/CategoryProducts";

export default function Women({ onAddToCart }) {
  return <CategoryProducts category="women" onAddToCart={onAddToCart} />;
}
