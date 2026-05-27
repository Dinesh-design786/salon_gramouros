import { DbBranch, DbStaff, DbCustomer, DbService, DbAppointment, DbInventory, DbInvoice, DbInvoiceItem, DbCommissionLedger } from '../models/types'

// Setup in-memory databases initialized with Hyderabad seed data
export const branches: DbBranch[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'GlamourOS Banjara Hills', location: 'Road No. 12, Banjara Hills, Hyderabad', capacity: 80, fill_rate: 25.00 },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'GlamourOS Jubilee Hills', location: 'Road No. 36, Jubilee Hills, Hyderabad', capacity: 70, fill_rate: 42.00 },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'GlamourOS Madhapur', location: 'Hitech City Road, Madhapur, Hyderabad', capacity: 60, fill_rate: 90.00 }
]

export const staff: DbStaff[] = [
  { id: 'st100000-0000-0000-0000-000000000001', name: 'Rohan Sharma', specialty: 'Hair Styling & Color', experience_level: 'Master', rating: 4.90, branch_id: 'b1000000-0000-0000-0000-000000000001', workload: 30, is_active: true },
  { id: 'st100000-0000-0000-0000-000000000002', name: 'Kavya Reddy', specialty: 'Bridal & Makeovers', experience_level: 'Master', rating: 4.80, branch_id: 'b1000000-0000-0000-0000-000000000001', workload: 20, is_active: true },
  { id: 'st100000-0000-0000-0000-000000000003', name: 'Sandeep Naidu', specialty: 'Haircuts & Grooming', experience_level: 'Senior', rating: 4.70, branch_id: 'b1000000-0000-0000-0000-000000000002', workload: 45, is_active: true },
  { id: 'st100000-0000-0000-0000-000000000004', name: 'Priya Patel', specialty: 'Facials & Skincare', experience_level: 'Junior', rating: 4.50, branch_id: 'b1000000-0000-0000-0000-000000000002', workload: 15, is_active: true },
  { id: 'st100000-0000-0000-0000-000000000005', name: 'Vikram Rao', specialty: 'Keratin & Treatments', experience_level: 'Senior', rating: 4.60, branch_id: 'b1000000-0000-0000-0000-000000000003', workload: 85, is_active: true },
  { id: 'st100000-0000-0000-0000-000000000006', name: 'Anjali Sen', specialty: 'Nail Art & Spa', experience_level: 'Junior', rating: 4.40, branch_id: 'b1000000-0000-0000-0000-000000000003', workload: 60, is_active: true }
]

export const services: DbService[] = [
  { id: 's1000000-0000-0000-0000-000000000001', name: 'Signature Haircut', price: 500.00, duration: 30, category: 'Hair', sac_code: '999721' },
  { id: 's1000000-0000-0000-0000-000000000002', name: 'Classic Beard Trim', price: 300.00, duration: 20, category: 'Hair', sac_code: '999721' },
  { id: 's1000000-0000-0000-0000-000000000003', name: 'Balayage Hair Color', price: 1500.00, duration: 90, category: 'Hair', sac_code: '999721' },
  { id: 's1000000-0000-0000-0000-000000000004', name: 'Premium Keratin Treatment', price: 3500.00, duration: 120, category: 'Hair', sac_code: '999721' },
  { id: 's1000000-0000-0000-0000-000000000005', name: 'Royal Bridal Package', price: 8000.00, duration: 180, category: 'Skin', sac_code: '999721' },
  { id: 's1000000-0000-0000-0000-000000000006', name: 'Detox Facial & Massage', price: 800.00, duration: 45, category: 'Skin', sac_code: '999721' }
]

export const customers: DbCustomer[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Ananya Reddy', phone: '+91 98480 22338', membership_tier: 'Platinum', loyalty_points: 950, preferred_service_id: 's1000000-0000-0000-0000-000000000005', favorite_stylist_id: 'st100000-0000-0000-0000-000000000002', notes: 'VVIP guest. Likes herbal organic tea. Requires silent services.' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Sanjay Rao', phone: '+91 99890 44556', membership_tier: 'Gold', loyalty_points: 480, preferred_service_id: 's1000000-0000-0000-0000-000000000001', favorite_stylist_id: 'st100000-0000-0000-0000-000000000001', notes: 'Prefers Sandeep or Rohan. Bookings usually weekly on Saturdays.' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Rahul Naidu', phone: '+91 91234 56789', membership_tier: 'Silver', loyalty_points: 220, preferred_service_id: 's1000000-0000-0000-0000-000000000004', favorite_stylist_id: 'st100000-0000-0000-0000-000000000005', notes: 'IT professional. Visits post 6 PM on weekdays.' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Priyanka Verma', phone: '+91 88888 77777', membership_tier: 'Standard', loyalty_points: 40, preferred_service_id: 's1000000-0000-0000-0000-000000000006', favorite_stylist_id: 'st100000-0000-0000-0000-000000000004', notes: 'First time walk-in lead. Churn prediction score high.' }
]

export const appointments: DbAppointment[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', customer_id: 'c1000000-0000-0000-0000-000000000001', branch_id: 'b1000000-0000-0000-0000-000000000001', stylist_id: 'st100000-0000-0000-0000-000000000002', date: '2026-05-25', time: '10:00', duration: 180, base_price: 8000.00, applied_price: 6800.00, status: 'Completed', source: 'Website', notes: 'Bridal Package schedule' },
  { id: 'a1000000-0000-0000-0000-000000000002', customer_id: 'c1000000-0000-0000-0000-000000000002', branch_id: 'b1000000-0000-0000-0000-000000000001', stylist_id: 'st100000-0000-0000-0000-000000000001', date: '2026-05-25', time: '14:30', duration: 30, base_price: 500.00, applied_price: 450.00, status: 'Confirmed', source: 'WhatsApp', notes: 'Standard haircut' },
  { id: 'a1000000-0000-0000-0000-000000000003', customer_id: 'c1000000-0000-0000-0000-000000000004', branch_id: 'b1000000-0000-0000-0000-000000000002', stylist_id: 'st100000-0000-0000-0000-000000000004', date: '2026-05-25', time: '16:00', duration: 45, base_price: 800.00, applied_price: 800.00, status: 'In Progress', source: 'Walk-in' }
]

export const inventory: DbInventory[] = [
  { id: 'p1000000-0000-0000-0000-000000000001', name: 'L\'Oreal Professional Hair Dye', category: 'Color', price: 850.00, stock: 4, min_stock: 6, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: 'L\'Oreal India Dist.' },
  { id: 'p1000000-0000-0000-0000-000000000002', name: 'Organic Keratin Argan Serum', category: 'Serum', price: 1200.00, stock: 18, min_stock: 5, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: 'ArganCo Hyderabad' },
  { id: 'p1000000-0000-0000-0000-000000000003', name: 'Moroccan Spa Therapy Massage Oil', category: 'Spa', price: 950.00, stock: 3, min_stock: 5, branch_id: 'b1000000-0000-0000-0000-000000000001', supplier: 'TheraDistributors AP' },
  { id: 'p1000000-0000-0000-0000-000000000004', name: 'Charcoal Detan Peeling Scrub', category: 'Skincare', price: 450.00, stock: 25, min_stock: 8, branch_id: 'b1000000-0000-0000-0000-000000000002', supplier: 'Himalaya Retail Hyd' },
  { id: 'p1000000-0000-0000-0000-000000000005', name: 'L\'Oreal Professional Hair Dye', category: 'Color', price: 850.00, stock: 15, min_stock: 6, branch_id: 'b1000000-0000-0000-0000-000000000002', supplier: 'L\'Oreal India Dist.' }
]

export const invoices: DbInvoice[] = [
  { id: 'i1000000-0000-0000-0000-000000000001', invoice_no: 'INV-550912', appointment_id: 'a1000000-0000-0000-0000-000000000001', customer_id: 'c1000000-0000-0000-0000-000000000001', subtotal: 8000.00, discount: 1200.00, cgst: 612.00, sgst: 612.00, grand_total: 8024.00, is_settled: true }
]

export const invoiceItems: DbInvoiceItem[] = [
  { id: 'ii1000000-0000-0000-0000-000000000001', invoice_id: 'i1000000-0000-0000-0000-000000000001', item_type: 'Service', item_name: 'Royal Bridal Package', quantity: 1, unit_price: 8000.00, total_price: 8000.00 }
]

export const commissionLedger: DbCommissionLedger[] = [
  { id: 'com10000-0000-0000-0000-000000000001', invoice_id: 'i1000000-0000-0000-0000-000000000001', staff_id: 'st100000-0000-0000-0000-000000000002', service_commission: 2380.00, retail_commission: 0.00, performance_bonus: 340.00, total_commission: 2720.00 }
]
