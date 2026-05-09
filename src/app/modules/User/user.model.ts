import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import {
  IUserDocument,
  IUserModel,
  USER_ROLE,
  USER_STATUS,
} from './user.interface';

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.cashier,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.active,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// Pre-save: Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Post-save: Remove password from response
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// Query middleware: Exclude deleted users
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Instance Method: Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static: Find by email (with password)
userSchema.statics.isUserExistsByEmail = async function (
  email: string,
): Promise<IUserDocument | null> {
  return await this.findOne({ email }).select('+password');
};

// Static: Find by custom userId (with password)
userSchema.statics.isUserExitsByCustomId = async function (
  userId: string,
): Promise<IUserDocument | null> {
  return await this.findOne({ userId }).select('+password');
};

// Static: Compare passwords
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// Static: Check deleted
userSchema.statics.isUserDeleted = function (user: IUserDocument): boolean {
  return user.isDeleted === true;
};

// Static: Check blocked
userSchema.statics.isUserBlocked = function (user: IUserDocument): boolean {
  return user.status === 'blocked';
};

// Static: Check if JWT was issued before password change
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
): boolean {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<IUserDocument, IUserModel>('User', userSchema);
