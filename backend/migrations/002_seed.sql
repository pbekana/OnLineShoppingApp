-- 002_seed.sql: Seed initial products and users

-- Seed Users
INSERT INTO users (id, name, email, password_hash, role)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Store Administrator', 'admin@thriftflip.com', '$2b$10$Rho0t2GpR08ybSIAJJ8Od.dC/H.VSC9CYtQlX6b08B/7.GEoC0The', 'admin'),
    ('c0000000-0000-0000-0000-000000000001', 'Demo Customer', 'customer@thriftflip.com', '$2b$10$p9OF6lvW4yfe9PRzgE/RUe/F9/j3TcUl8NwT/ibWuhfylbm.9vSem', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Seed Products (Preserving the 12 existing items from App.jsx, Men.jsx, Women.jsx, Kids.jsx, Accesories.jsx)
INSERT INTO products (id, name, description, price, category, image_url, stock, is_active)
VALUES 
    (1, 'Classic White T-Shirt', 'Comfortable cotton t-shirt for everyday wear.', 1400.00, 'men', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=60', 30, true),
    (2, 'Men Casual Hoodie', 'Warm and cozy hoodie for cool weather.', 2500.00, 'men', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60', 20, true),
    (3, 'Slim Fit Jeans', 'Modern slim fit jeans with stretch comfort.', 2800.00, 'men', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&auto=format&fit=crop&q=60', 25, true),
    (4, 'Pink Summer Dress', 'Cute and comfy dress for sunny days.', 1200.00, 'women', 'https://images.unsplash.com/photo-1604702770018-55669959b124?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D', 25, true),
    (5, 'Trendy Outfit', 'Stylish set for everyday fun.', 1500.00, 'women', 'https://plus.unsplash.com/premium_photo-1668485966810-cbd0f685f58f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D', 20, true),
    (6, 'Casual Play Outfit', 'Perfect active wear for women.', 1100.00, 'women', 'https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbiUyMGdpcmx8ZW58MHx8MHx8fDA%3D', 22, true),
    (7, 'Kids Cartoon T-Shirt', 'Soft cotton t-shirt with fun cartoon print.', 900.00, 'kids', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&auto=format&fit=crop&q=60', 40, true),
    (8, 'Cute Summer Dress', 'Light and colorful dress perfect for summer.', 1200.00, 'kids', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop&q=60', 25, true),
    (9, 'Kids Casual Hoodie', 'Warm and comfy hoodie for cool days.', 1500.00, 'kids', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=60', 18, true),
    (10, 'Leather Handbag', 'Premium quality leather handbag with spacious design.', 4000.00, 'accessories', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60', 15, true),
    (11, 'Classic Wrist Watch', 'Elegant analog watch perfect for all occasions.', 2500.00, 'accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', 12, true),
    (12, 'Stylish Sunglasses', 'Trendy UV-protected sunglasses for everyday style.', 1200.00, 'accessories', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60', 35, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    stock = EXCLUDED.stock,
    is_active = EXCLUDED.is_active;

-- Update sequence for products id
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

INSERT INTO schema_migrations (version) VALUES ('002_seed') ON CONFLICT (version) DO NOTHING;
