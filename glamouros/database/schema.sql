-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CORE OPERATIONAL TABLES
-- ==========================================

-- Branches table (Multi-Branch Isolation)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 50, -- max occupancy percentage safety limit
    fill_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memberships Definition
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier VARCHAR(30) NOT NULL UNIQUE, -- Standard, Silver, Gold, Platinum
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    min_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table (CRM)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    membership_tier VARCHAR(30) NOT NULL DEFAULT 'Standard' REFERENCES memberships(tier),
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    preferred_service_id UUID,
    favorite_stylist_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff table (Stylists)
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    experience_level VARCHAR(30) NOT NULL CHECK (experience_level IN ('Junior', 'Senior', 'Master')),
    rating DECIMAL(3,2) NOT NULL DEFAULT 4.50 CHECK (rating BETWEEN 1.00 AND 5.00),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    workload INTEGER NOT NULL DEFAULT 0, -- active capacity factor
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- duration in minutes
    category VARCHAR(50) NOT NULL,
    sac_code VARCHAR(20) DEFAULT '999721', -- Indian GST SAC for Beauty Services
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Complete customer CRM preferred link references
ALTER TABLE customers ADD CONSTRAINT fk_preferred_service FOREIGN KEY (preferred_service_id) REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE customers ADD CONSTRAINT fk_favorite_stylist FOREIGN KEY (favorite_stylist_id) REFERENCES staff(id) ON DELETE SET NULL;

-- ==========================================
-- 2. APPOINTMENTS & SCHEDULING
-- ==========================================

-- Appointments Table (Unified calendar)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    stylist_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL, -- combined sum duration
    base_price DECIMAL(10,2) NOT NULL,
    applied_price DECIMAL(10,2) NOT NULL, -- dynamic pricing
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
    source VARCHAR(30) NOT NULL DEFAULT 'Website' CHECK (source IN ('Website', 'WhatsApp', 'Walk-in', 'Instagram', 'Phone')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointment Services join table (Supports multiple treatments per schedule)
CREATE TABLE appointment_services (
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (appointment_id, service_id)
);

-- ==========================================
-- 3. INVENTORY MANAGEMENT
-- ==========================================

-- Inventory Products List
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5, -- safety buffer
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    supplier VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, branch_id)
);

-- Service Product Consumption Definition
CREATE TABLE service_product_consumption (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    product_name VARCHAR(100) NOT NULL, -- Matches product stock
    quantity DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    PRIMARY KEY (service_id, product_name)
);

-- Inventory Transaction logs
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Consumption', 'Replenishment', 'Adjustment')),
    quantity INTEGER NOT NULL,
    reference_id UUID, -- links back to billing/invoice or audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. POS BILLING & PAYMENTS
-- ==========================================

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cgst DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- 9% CGST
    sgst DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- 9% SGST
    grand_total DECIMAL(10,2) NOT NULL,
    is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    qr_code_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items (Services / Retail Products added)
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('Service', 'Retail')),
    item_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL CHECK (method IN ('Cash', 'UPI', 'Card', 'Wallet')),
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'Success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. COMMISSION & FINANCIAL SYSTEMS
-- ==========================================

-- Commission Rates Mapping
CREATE TABLE commission_rates (
    level VARCHAR(30) PRIMARY KEY CHECK (level IN ('Junior', 'Senior', 'Master')),
    service_percent DECIMAL(5,2) NOT NULL,
    retail_percent DECIMAL(5,2) NOT NULL
);

-- Commission Ledger
CREATE TABLE commission_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    retail_commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    performance_bonus DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Points ledger logs
CREATE TABLE loyalty_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Earned', 'Redeemed', 'Bonus')),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pricing Rules Table (Dynamic Pricing)
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(100) NOT NULL,
    threshold_percent DECIMAL(5,2) NOT NULL,
    multiplier DECIMAL(3,2) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Happy Hour', 'Surge', 'Standard')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Promo Campaigns (AI CRM suggestions)
CREATE TABLE promo_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    coupon_code VARCHAR(30) NOT NULL UNIQUE,
    discount_percent DECIMAL(5,2) NOT NULL,
    segment VARCHAR(50) NOT NULL, -- Churn Risk High, Mid, Low, VVIP
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. RELATIONAL INDEXES FOR ISOLATION & SPEED
-- ==========================================
CREATE INDEX idx_staff_branch ON staff(branch_id);
CREATE INDEX idx_appointments_date_branch ON appointments(date, branch_id);
CREATE INDEX idx_appointments_stylist ON appointments(stylist_id);
CREATE INDEX idx_inventory_branch ON inventory(branch_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_commission_staff ON commission_ledger(staff_id);

-- ==========================================
-- 7. DATABASE PROCEDURES & TRIGGER ENGINES
-- ==========================================

-- Trigger A: Auto-deduct inventory on Appointment completion
CREATE OR REPLACE FUNCTION process_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
    service_item RECORD;
    inv_product RECORD;
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Loop over services connected to this appointment
        FOR service_item IN 
            SELECT s.id, s.name, sp.product_name, sp.quantity
            FROM appointment_services as_join
            JOIN services s ON as_join.service_id = s.id
            JOIN service_product_consumption sp ON sp.service_id = s.id
            WHERE as_join.appointment_id = NEW.id
        LOOP
            -- Check if product exists in this branch's inventory
            SELECT * INTO inv_product 
            FROM inventory 
            WHERE name = service_item.product_name AND branch_id = NEW.branch_id;
            
            IF FOUND THEN
                -- Deduct stock
                UPDATE inventory 
                SET stock = GREATEST(0, stock - CEIL(service_item.quantity)),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = inv_product.id;
                
                -- Log transaction
                INSERT INTO inventory_transactions (product_id, type, quantity, reference_id)
                VALUES (inv_product.id, 'Consumption', CEIL(service_item.quantity), NEW.id);
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointment_completion
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (NEW.status = 'Completed')
    EXECUTE FUNCTION process_appointment_completion();

-- Trigger B: Automate loyalty points accumulation & membership updates
CREATE OR REPLACE FUNCTION process_invoice_loyalty()
RETURNS TRIGGER AS $$
DECLARE
    points_earned INTEGER;
    current_points INTEGER;
    new_tier VARCHAR(30);
BEGIN
    IF NEW.is_settled = TRUE AND OLD.is_settled = FALSE THEN
        -- Earn 1 point per 100 Rs spent
        points_earned := FLOOR(NEW.grand_total / 100);
        
        IF points_earned > 0 THEN
            -- Record points ledger
            INSERT INTO loyalty_ledger (customer_id, points_change, type, invoice_id)
            VALUES (NEW.customer_id, points_earned, 'Earned', NEW.id);
            
            -- Update customer loyalty balance
            UPDATE customers 
            SET loyalty_points = loyalty_points + points_earned,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.customer_id
            RETURNING loyalty_points INTO current_points;
            
            -- Auto-promote CRM membership tiers
            SELECT tier INTO new_tier 
            FROM memberships 
            WHERE current_points >= min_points 
            ORDER BY min_points DESC LIMIT 1;
            
            IF new_tier IS NOT NULL THEN
                UPDATE customers SET membership_tier = new_tier WHERE id = NEW.customer_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_settlement_loyalty
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION process_invoice_loyalty();

-- Trigger C: Automatically calculate commission ledger upon invoice settlement
CREATE OR REPLACE FUNCTION process_staff_commissions()
RETURNS TRIGGER AS $$
DECLARE
    appt RECORD;
    stylist RECORD;
    rate RECORD;
    service_rev DECIMAL(10,2) := 0.00;
    retail_rev DECIMAL(10,2) := 0.00;
    calculated_service_comm DECIMAL(10,2) := 0.00;
    calculated_retail_comm DECIMAL(10,2) := 0.00;
    bonus DECIMAL(10,2) := 0.00;
    item_record RECORD;
BEGIN
    IF NEW.is_settled = TRUE AND OLD.is_settled = FALSE THEN
        -- Retrieve appointment & stylist details
        SELECT * INTO appt FROM appointments WHERE id = NEW.appointment_id;
        IF FOUND THEN
            SELECT * INTO stylist FROM staff WHERE id = appt.stylist_id;
            
            -- Get commission rates based on senior level
            SELECT * INTO rate FROM commission_rates WHERE level = stylist.experience_level;
            
            -- Calculate service & retail components from invoice items
            FOR item_record IN SELECT * FROM invoice_items WHERE invoice_id = NEW.id LOOP
                IF item_record.item_type = 'Service' THEN
                    service_rev := service_rev + item_record.total_price;
                ELSIF item_record.item_type = 'Retail' THEN
                    retail_rev := retail_rev + item_record.total_price;
                END IF;
            END LOOP;
            
            calculated_service_comm := service_rev * (rate.service_percent / 100);
            calculated_retail_comm := retail_rev * (rate.retail_percent / 100);
            
            -- If customer ratings for appointment was a 5-star (if recorded, mock bonus)
            IF appt.status = 'Completed' THEN
                bonus := service_rev * 0.05; -- 5% performance bonus
            END IF;
            
            -- Insert into ledger
            INSERT INTO commission_ledger (
                invoice_id, staff_id, service_commission, retail_commission, performance_bonus, total_commission
            ) VALUES (
                NEW.id, stylist.id, calculated_service_comm, calculated_retail_comm, bonus, (calculated_service_comm + calculated_retail_comm + bonus)
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_settlement_commissions
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION process_staff_commissions();
