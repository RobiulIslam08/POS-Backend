import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import {
  IRegister,
  ILogin,
  IChangePassword,
  IAuthResponse,
} from './auth.interface';
import { createToken } from './auth.utils';
import { User } from '../User/user.model';

// ==================== REGISTRATION ====================
const registerUser = async (payload: IRegister): Promise<IAuthResponse> => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: payload.email },
      { userId: payload.userId },
      { username: payload.username },
    ],
  });

  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this email, userId, or username already exists',
    );
  }

  // Create new user
  const newUser = await User.create(payload);

  // Create JWT payload
  const jwtPayload = {
    userId: newUser.userId,
    role: newUser.role,
  };

  // Generate tokens
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: newUser._id.toString(),
      userId: newUser.userId,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

// ==================== LOGIN ====================
const loginUser = async (payload: ILogin): Promise<IAuthResponse> => {
  // Check for default admin login bypass
  if (
    payload.username === config.admin_username &&
    payload.password === config.admin_password
  ) {
    const jwtPayload = {
      userId: config.admin_username as string,
      role: 'admin',
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        _id: '000000000000000000000000', // Pseudo ID for default admin
        userId: config.admin_username as string,
        fullName: 'Default Admin',
        email: 'admin@system.com',
        role: 'admin',
      },
    };
  }

  // Check if user exists in database (search by username)
  const user = await User.isUserExistsByUsername(payload.username);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user is deleted
  if (User.isUserDeleted(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user has been deleted');
  }

  // Check if user is blocked
  if (User.isUserBlocked(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(payload.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid username or password');
  }

  // Create JWT payload (uses custom userId, not MongoDB _id)
  const jwtPayload = {
    userId: user.userId,
    role: user.role,
  };

  // Generate tokens
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id.toString(),
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

// ==================== CHANGE PASSWORD ====================
const changePassword = async (
  userData: JwtPayload,
  payload: IChangePassword,
): Promise<void> => {
  const user = await User.findOne({ userId: userData.userId }).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (User.isUserDeleted(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user has been deleted');
  }

  if (User.isUserBlocked(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const isPasswordMatched = await user.comparePassword(payload.oldPassword);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
  }

  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
};

// ==================== REFRESH TOKEN ====================
const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token is required');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { userId } = decoded;

  const user = await User.findOne({ userId });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (User.isUserDeleted(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user has been deleted');
  }

  if (User.isUserBlocked(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const jwtPayload = {
    userId: user.userId,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { accessToken };
};

// ==================== FORGET PASSWORD ====================
const forgetPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (User.isUserDeleted(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user has been deleted');
  }

  if (User.isUserBlocked(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const jwtPayload = {
    userId: user.userId,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}?email=${user.email}&token=${resetToken}`;

  // TODO: Send email with reset link
  console.log('Password reset link:', resetUILink);
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
): Promise<void> => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  const user = await User.findOne({ email: payload.email }).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.userId !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid token');
  }

  if (User.isUserDeleted(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user has been deleted');
  }

  if (User.isUserBlocked(user)) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
};

export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
