import mongoose, { Schema, Document } from 'mongoose'

export interface IBooking extends Document {
  invoiceId: string
  customerName: string
  phone: string
  email: string
  serviceName: string
  branchName: string
  bookingDate: string
  bookingTime: string
  offlinePayment: boolean
  paymentStatus: 'pending' | 'paid' | 'failed'
  bookingStatus: 'confirmed' | 'cancelled' | 'completed'
  whatsappStatus: 'sent' | 'failed' | 'pending'
  createdAt: Date
}

const BookingSchema: Schema = new Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    serviceName: { type: String, required: true },
    branchName: { type: String, required: true },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    offlinePayment: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    },
    whatsappStatus: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

// Compound index to prevent double-booking: same branch + date + time
BookingSchema.index(
  { branchName: 1, bookingDate: 1, bookingTime: 1, bookingStatus: 1 },
  { unique: false }
)

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
