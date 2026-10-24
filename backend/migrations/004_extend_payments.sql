-- 004_extend_payments.sql: Extend payments table with Chapa API v2 fields

ALTER TABLE payments 
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS merchant_reference VARCHAR(255),
    ADD COLUMN IF NOT EXISTS chapa_reference VARCHAR(255),
    ADD COLUMN IF NOT EXISTS amount_in_cents BIGINT,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS failure_reason TEXT,
    ADD COLUMN IF NOT EXISTS initialized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill merchant_reference from reference if null
UPDATE payments SET merchant_reference = reference WHERE merchant_reference IS NULL;
UPDATE payments SET amount_in_cents = ROUND(amount * 100) WHERE amount_in_cents IS NULL;

-- Populate customer_id from orders
UPDATE payments p SET customer_id = o.user_id FROM orders o WHERE p.order_id = o.id AND p.customer_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_merchant_reference ON payments(merchant_reference);
CREATE INDEX IF NOT EXISTS idx_payments_chapa_reference ON payments(chapa_reference);

-- Also add total_amount_cents to orders for precise monetary calculations
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS total_amount_cents BIGINT;

UPDATE orders SET total_amount_cents = ROUND(total_amount * 100) WHERE total_amount_cents IS NULL;

INSERT INTO schema_migrations (version) VALUES ('004_extend_payments') ON CONFLICT (version) DO NOTHING;
