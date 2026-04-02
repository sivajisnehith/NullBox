'use server'

import { prisma } from '@/lib/prisma';
import { setSession, clearSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const registrationNumber = formData.get('registrationNumber') as string;
    const password = formData.get('password') as string;

    if (!registrationNumber || !password) {
        return { error: 'Please provide both registration number and password' };
    }

    try {
        const user = await prisma.user.findUnique({ where: { registrationNumber } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: 'Invalid credentials' };
        }

        await setSession({ userId: user.id, username: user.username, role: user.role });
    } catch (e) {
        console.error('[LOGIN ERROR]', e);
        return { error: 'An error occurred while logging in. Check your database connection.' };
    }

    redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const registrationNumber = formData.get('registrationNumber') as string;
    const password = formData.get('password') as string;

    if (!email || !username || !password || !registrationNumber) {
        return { error: 'All fields are required' };
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }, { registrationNumber }] }
        });

        if (existingUser) {
            return { error: 'A user with this email, username, or registration number already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                registrationNumber,
                password: hashedPassword,
                role: 'user',
            },
        });

        await setSession({ userId: user.id, username: user.username, role: user.role });
    } catch (e) {
        console.error('[REGISTER ERROR]', e);
        return { error: 'An error occurred during registration. Check your database connection.' };
    }

    redirect('/dashboard');
}

export async function logout() {
    await clearSession();
    redirect('/');
}
