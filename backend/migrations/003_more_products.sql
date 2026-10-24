-- 003_more_products.sql: Add more items for Men, Women, Kids, and Accessories

INSERT INTO products (id, name, description, price, category, image_url, stock, is_active)
VALUES
    -- Additional Men items
    (13, 'Vintage Denim Jacket', 'Classic rugged denim jacket with button closure and chest pockets.', 3200.00, 'men', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60', 18, true),
    (14, 'Classic Oxford Button-Down', 'Breathable cotton dress shirt tailored for sharp smart-casual wear.', 2200.00, 'men', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60', 25, true),
    (15, 'Athletic Fleece Joggers', 'Ultra-comfortable tapered joggers with drawstring waistband.', 1800.00, 'men', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&auto=format&fit=crop&q=60', 22, true),
    (16, 'Casual Striped Polo Shirt', 'Lightweight pique polo shirt with ribbed collar and cuffs.', 1600.00, 'men', 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&auto=format&fit=crop&q=60', 20, true),
    
    -- Additional Women items
    (17, 'Boho Floral Maxi Dress', 'Flowy printed bohemian maxi dress with waist tie and soft fabric.', 2400.00, 'women', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60', 16, true),
    (18, 'Elegant Cable-Knit Sweater', 'Cozy cream knit sweater crafted from warm, breathable yarn.', 2100.00, 'women', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60', 19, true),
    (19, 'Tailored High-Waist Trousers', 'Sleek pleated trousers ideal for office chic and evening outings.', 2600.00, 'women', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60', 15, true),
    (20, 'Casual Linen Button Blouse', 'Breezy linen-blend blouse perfect for warm sunny afternoons.', 1750.00, 'women', 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500&auto=format&fit=crop&q=60', 24, true),

    -- Additional Kids items
    (21, 'Dinosaur Graphic Tee', 'Fun 100% cotton tee with playful dinosaur artwork for everyday play.', 850.00, 'kids', 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&auto=format&fit=crop&q=60', 35, true),
    (22, 'Denim Overalls with Pockets', 'Durable and adorable adjustable denim dungarees for active kids.', 1650.00, 'kids', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60', 18, true),
    (23, 'Winter Quilted Puffer Jacket', 'Water-resistant insulated jacket to keep little ones warm and cozy.', 2400.00, 'kids', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop&q=60', 14, true),
    (24, 'Cozy Fleece Jogger Pants', 'Soft brushed fleece bottoms with elastic cuffs for comfortable wear.', 950.00, 'kids', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=60', 30, true),

    -- Additional Accessories items
    (25, 'Handcrafted Vintage Leather Belt', 'Full-grain genuine leather belt with antique brass buckle.', 1350.00, 'accessories', 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&auto=format&fit=crop&q=60', 28, true),
    (26, 'Travel Canvas & Leather Backpack', 'Multi-pocket sturdy canvas backpack with laptop sleeve.', 3500.00, 'accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60', 12, true),
    (27, 'Minimalist Pendant Necklace', 'Hand-finished silver-plated geometric pendant with delicate chain.', 950.00, 'accessories', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60', 40, true),
    (28, 'Retro Aviator Sunglasses', 'Polarized UV400 gold-frame aviator sunglasses with tinted lenses.', 1450.00, 'accessories', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60', 25, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    stock = EXCLUDED.stock,
    is_active = EXCLUDED.is_active;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

INSERT INTO schema_migrations (version) VALUES ('003_more_products') ON CONFLICT (version) DO NOTHING;
