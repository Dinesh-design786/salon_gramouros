import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  phone: string
  password?: string
  role: 'customer' | 'admin'
  createdAt: Date
  comparePassword: (password: string) => Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true,
      index: true 
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true 
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['customer', 'admin'], 
      default: 'customer' 
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        ret.created_at = ret.createdAt
        delete ret._id
        delete ret.__v
        delete ret.password
        return ret
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        ret.created_at = ret.createdAt
        delete ret._id
        delete ret.__v
        delete ret.password
        return ret
      }
    }
  }
)

// Pre-save hook: Hash password using bcryptjs before saving
UserSchema.pre<IUser>('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password || '', salt)
    user.password = hash
    next()
  } catch (err: any) {
    next(err)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || '')
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export { UserSchema }
