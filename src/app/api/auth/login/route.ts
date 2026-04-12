import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: result.error.issues },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true },
    });

    // Generic error to prevent account enumeration
    const genericInvalid = NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 },
    );

    if (!user) return genericInvalid;

    // Check if account is currently locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      return NextResponse.json(
        {
          error: `Account temporarily locked due to too many failed login attempts. Try again in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'} or reset your password.`,
        },
        { status: 423 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = shouldLock
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : newAttempts,
          lockedUntil,
        },
      });

      if (shouldLock) {
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Your account has been locked for ${LOCKOUT_MINUTES} minutes. You can reset your password to regain access immediately.`,
          },
          { status: 423 },
        );
      }

      return genericInvalid;
    }

    // Successful login — reset counters and stamp last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      customer: user.customer,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to log in' },
      { status: 500 },
    );
  }
}
