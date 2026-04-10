import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'default-secret-key-change-me';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (e) {
        return null;
    }
}

export async function setSession(payload: any) {
    const session = await encrypt(payload);
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: false,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
        sameSite: 'lax'
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0) });
}
