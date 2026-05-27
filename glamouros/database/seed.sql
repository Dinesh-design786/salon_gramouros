-- ==========================================
-- SEED DATA FOR GLAMOUROS SALON PLATFORM
-- ==========================================

-- 1. Insert Memberships Definition
INSERT INTO memberships (tier, discount_percent, min_points) VALUES
('Standard', 0.00, 0),
('Silver', 5.00, 150),
('Gold', 10.00, 400),
('Platinum', 15.00, 800);

-- 2. Insert Commission Rates mapping
INSERT INTO commission_rates (level, service_percent, retail_percent) VALUES
('Junior', 20.00, 8.00),
('Senior', 30.00, 12.00),
('Master', 35.00, 15.00);

-- 3. Insert Branches (Hyderabad)
INSERT INTO branches (id, name, location, capacity, fill_rate) VALUES
('b1000000-0000-0000-0000-000000000001', 'GlamourOS Banjara Hills', 'Road No. 12, Banjara Hills, Hyderabad', 80, 25.00),
('b1000000-0000-0000-0000-000000000002', 'GlamourOS Jubilee Hills', 'Road No. 36, Jubilee Hills, Hyderabad', 70, 42.00),
('b1000000-0000-0000-0000-000000000003', 'GlamourOS Madhapur', 'Hitech City Road, Madhapur, Hyderabad', 60, 90.00); -- High fill rate to test surge pricing!

-- 4. Insert Services
INSERT INTO services (id, name, price, duration, category) VALUES
('s1000000-0000-0000-0000-000000000001', 'Signature Haircut', 500.00, 30, 'Hair'),
('s1000000-0000-0000-0000-000000000002', 'Classic Beard Trim', 300.00, 20, 'Hair'),
('s1000000-0000-0000-0000-000000000003', 'Balayage Hair Color', 1500.00, 90, 'Hair'),
('s1000000-0000-0000-0000-000000000004', 'Premium Keratin Treatment', 3500.00, 120, 'Hair'),
('s1000000-0000-0000-0000-000000000005', 'Royal Bridal Package', 8000.00, 180, 'Skin'),
('s1000000-0000-0000-0000-000000000006', 'Detox Facial & Massage', 800.00, 45, 'Skin');

-- 5. Insert Staff (Stylists)
INSERT INTO staff (id, name, specialty, experience_level, rating, branch_id, workload) VALUES
('st100000-0000-0000-0000-000000000001', 'Rohan Sharma', 'Hair Styling & Color', 'Master', 4.90, 'b1000000-0000-0000-0000-000000000001', 30),
('st100000-0000-0000-0000-000000000002', 'Kavya Reddy', 'Bridal & Makeovers', 'Master', 4.80, 'b1000000-0000-0000-0000-000000000001', 20),
('st100000-0000-0000-0000-000000000003', 'Sandeep Naidu', 'Haircuts & Grooming', 'Senior', 4.70, 'b1000000-0000-0000-0000-000000000002', 45),
('st100000-0000-0000-0000-000000000004', 'Priya Patel', 'Facials & Skincare', 'Junior', 4.50, 'b1000000-0000-0000-0000-000000000002', 15),
('st100000-0000-0000-0000-000000000005', 'Vikram Rao', 'Keratin & Treatments', 'Senior', 4.60, 'b1000000-0000-0000-0000-000000000003', 85),
('st100000-0000-0000-0000-000000000006', 'Anjali Sen', 'Nail Art & Spa', 'Junior', 4.40, 'b1000000-0000-0000-0000-000000000003', 60);

-- 6. Insert Customers (CRM)
INSERT INTO customers (id, name, phone, membership_tier, loyalty_points, preferred_service_id, favorite_stylist_id, notes) VALUES
('c1000000-0000-0000-0000-000000000001', 'Ananya Reddy', '+91 98480 22338', 'Platinum', 950, 's1000000-0000-0000-0000-000000000005', 'st100000-0000-0000-0000-000000000002', 'VVIP guest. Likes herbal organic tea. Requires silent services.'),
('c1000000-0000-0000-0000-000000000002', 'Sanjay Rao', '+91 99890 44556', 'Gold', 480, 's1000000-0000-0000-0000-000000000001', 'st100000-0000-0000-0000-000000000001', 'Prefers Sandeep or Rohan. Bookings usually weekly on Saturdays.'),
('c1000000-0000-0000-0000-000000000003', 'Rahul Naidu', '+91 91234 56789', 'Silver', 220, 's1000000-0000-0000-0000-000000000004', 'st100000-0000-0000-0000-000000000005', 'IT professional. Visits post 6 PM on weekdays.'),
('c1000000-0000-0000-0000-000000000004', 'Priyanka Verma', '+91 88888 77777', 'Standard', 40, 's1000000-0000-0000-0000-000000000006', 'st100000-0000-0000-0000-000000000004', 'First time walk-in lead. Churn prediction score high.');

-- 7. Insert Inventory Products
INSERT INTO inventory (id, name, category, price, stock, min_stock, branch_id, supplier) VALUES
('p1000000-0000-0000-0000-000000000001', 'L\'Oreal Professional Hair Dye', 'Color', 850.00, 4, 6, 'b1000000-0000-0000-0000-000000000001', 'L\'Oreal India Dist.'), -- Low Stock!
('p1000000-0000-0000-0000-000000000002', 'Organic Keratin Argan Serum', 'Serum', 1200.00, 18, 5, 'b1000000-0000-0000-0000-000000000001', 'ArganCo Hyderabad'),
('p1000000-0000-0000-0000-000000000003', 'Moroccan Spa Therapy Massage Oil', 'Spa', 950.00, 3, 5, 'b1000000-0000-0000-0000-000000000001', 'TheraDistributors AP'), -- Low Stock!
('p1000000-0000-0000-0000-000000000004', 'Charcoal Detan Peeling Scrub', 'Skincare', 450.00, 25, 8, 'b1000000-0000-0000-0000-000000000002', 'Himalaya Retail Hyd'),
('p1000000-0000-0000-0000-000000000005', 'L\'Oreal Professional Hair Dye', 'Color', 850.00, 15, 6, 'b1000000-0000-0000-0000-000000000002', 'L\'Oreal India Dist.');

-- 8. Insert Product Consumption link definitions
INSERT INTO service_product_consumption (service_id, product_name, quantity) VALUES
('s1000000-0000-0000-0000-000000000003', 'L\'Oreal Professional Hair Dye', 1.00), -- Hair coloring consumes 1 unit of dye
('s1000000-0000-0000-0000-000000000004', 'Organic Keratin Argan Serum', 0.50); -- Keratin treatment consumes 0.5 units of serum

-- 9. Insert Pricing Rules (Dynamic Pricing Engine)
INSERT INTO pricing_rules (rule_name, threshold_percent, multiplier, type) VALUES
('Banjara Hills Off-Peak Happy Hour', 30.00, 0.85, 'Happy Hour'), -- 15% discount for branch load < 30%
('Madhapur High Demand Roster Surge', 85.00, 1.20, 'Surge'), -- 20% surge rate for branch load > 85%
('Standard Baseline pricing', 50.00, 1.00, 'Standard');

-- 10. Insert Promo Campaigns (AI CRM recommendations)
INSERT INTO promo_campaigns (name, coupon_code, discount_percent, segment) VALUES
('Monsoon Bridal Sparkle Coupon', 'BRIDAL10', 10.00, 'VVIP'),
('Gold Anniversary Retention Bonus', 'GOLDENVALU', 12.00, 'Mid-risk'),
('New Lead Retention Lock', 'COMFORT15', 15.00, 'High-risk');

-- 11. Insert Historical / Starting Appointments
-- Complete schedule 1
INSERT INTO appointments (id, customer_id, branch_id, stylist_id, date, time, duration, base_price, applied_price, status, source) VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'st100000-0000-0000-0000-000000000002', '2026-05-25', '10:00:00', 180, 8000.00, 6800.00, 'Completed', 'Website'); -- Platinum gets 15% discount -> 8000 * 0.85 = 6800

INSERT INTO appointment_services (appointment_id, service_id) VALUES
('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000005');

-- Confirm schedule 2
INSERT INTO appointments (id, customer_id, branch_id, stylist_id, date, time, duration, base_price, applied_price, status, source) VALUES
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'st100000-0000-0000-0000-000000000001', '2026-05-25', '14:30:00', 30, 500.00, 450.00, 'Confirmed', 'WhatsApp'); -- Gold gets 10% discount -> 500 * 0.90 = 450

INSERT INTO appointment_services (appointment_id, service_id) VALUES
('a1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001');

-- In progress schedule 3
INSERT INTO appointments (id, customer_id, branch_id, stylist_id, date, time, duration, base_price, applied_price, status, source) VALUES
('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'st100000-0000-0000-0000-000000000004', '2026-05-25', '16:00:00', 45, 800.00, 800.00, 'In Progress', 'Walk-in');

INSERT INTO appointment_services (appointment_id, service_id) VALUES
('a1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000006');

-- 12. Insert Completed Invoice matching Appointment 1
INSERT INTO invoices (id, invoice_no, appointment_id, customer_id, subtotal, discount, cgst, sgst, grand_total, is_settled) VALUES
('i1000000-0000-0000-0000-000000000001', 'INV-550912', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 8000.00, 1200.00, 612.00, 612.00, 8024.00, TRUE); -- Subtotal 8000. 15% discount is 1200. Taxable = 6800. CGST 9% (612), SGST 9% (612). Grand = 6800 + 1224 = 8024.

INSERT INTO invoice_items (invoice_id, item_type, item_name, quantity, unit_price, total_price) VALUES
('i1000000-0000-0000-0000-000000000001', 'Service', 'Royal Bridal Package', 1, 8000.00, 8000.00);

INSERT INTO payments (invoice_id, method, amount, transaction_id, status) VALUES
('i1000000-0000-0000-0000-000000000001', 'UPI', 8024.00, 'TXN9928182910398', 'Success');

-- Update loyalty points and commission via standard ledger credits manually since triggers run on live updates
INSERT INTO loyalty_ledger (customer_id, points_change, type, invoice_id) VALUES
('c1000000-0000-0000-0000-000000000001', 80, 'Earned', 'i1000000-0000-0000-0000-000000000001');

INSERT INTO commission_ledger (invoice_id, staff_id, service_commission, retail_commission, performance_bonus, total_commission) VALUES
('i1000000-0000-0000-0000-000000000001', 'st100000-0000-0000-0000-000000000002', 2380.00, 0.00, 340.00, 2720.00); -- Master stylist Kavya Nair gets 35% service commission on ₹6800 (₹2380) + 5% performance bonus (₹340). Total = ₹2720 payout.
