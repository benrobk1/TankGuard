import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from './prisma';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string) {
  const sessionToken = crypto.randomUUID();
  const expires = new Date(
    Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: '/',
    expires,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return sessionToken;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expires < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session
      .delete({ where: { sessionToken: token } })
      .catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
