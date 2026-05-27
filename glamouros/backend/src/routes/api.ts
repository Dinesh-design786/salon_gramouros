import { Router } from 'express'
import * as authCtrl from '../controllers/authController'
import * as branchCtrl from '../controllers/branchController'
import * as staffCtrl from '../controllers/staffController'
import * as bookingCtrl from '../controllers/bookingController'
import * as newBookingCtrl from '../controllers/newBookingController'
import * as posCtrl from '../controllers/posController'
import * as invCtrl from '../controllers/inventoryController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// ==========================================
// 1. AUTHENTICATION PATHWAYS
// ==========================================
router.post('/auth/login', authCtrl.login)
router.post('/auth/register', authCtrl.register)
router.post('/auth/admin-login', authCtrl.adminLogin)
router.get('/auth/me', verifyToken, authCtrl.me)
router.post('/auth/logout', authCtrl.logout)

// ==========================================
// 2. MULTI-BRANCH & DYNAMIC PRICING
// ==========================================
router.get('/branches', branchCtrl.getBranches)
router.get('/branches/pricing', branchCtrl.getDynamicPricingAdvisory)

// ==========================================
// 3. STAFF & COMMISSION ENGINE
// ==========================================
router.get('/staff/branch', staffCtrl.getStaffByBranch)
router.get('/staff/commissions/:staffId', staffCtrl.getStylistCommissions)

// ==========================================
// 4. SCHEDULING CALENDAR & AI ENGINE
// ==========================================
router.get('/appointments', bookingCtrl.getAppointments)
router.get('/appointments/ai-recommend', bookingCtrl.getAISchedulingRecommendation)
router.post('/appointments/create', bookingCtrl.createAppointment)
router.patch('/appointments/status/:appointmentId', bookingCtrl.updateAppointmentStatus)

// ==========================================
// 5. SMART POS BILLING & INVOICES
// ==========================================
router.post('/pos/calculate', posCtrl.calculatePOSBilling)
router.post('/pos/settle', posCtrl.settlePOSInvoice)
router.get('/pos/pdf/:invoiceNo', posCtrl.downloadPDFInvoice)

// ==========================================
// 6. INVENTORY & replenishment FORECASTS
// ==========================================
router.get('/inventory', invCtrl.getBranchInventory)
router.get('/inventory/forecast', invCtrl.getAIInventoryForecasting)
router.post('/inventory/restock', invCtrl.restockInventory)

// ==========================================
// 7. CUSTOMER REGISTRATION & BOOKING (MongoDB)
// ==========================================
router.post('/bookings/create', newBookingCtrl.createBooking)
router.get('/bookings', newBookingCtrl.getBookings)
router.patch('/bookings/:id/status', newBookingCtrl.updateBookingStatus)

export default router
