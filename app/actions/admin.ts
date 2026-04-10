'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { stopContainer } from '@/lib/docker';

export async function createChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const points = parseInt(formData.get('points') as string);
    const flag = formData.get('flag') as string;
    const imageName = formData.get('imageName') as string;
    const internalPort = formData.get('internalPort') ? parseInt(formData.get('internalPort') as string) : null;

    if (!title || !description || !category || !points || !flag) {
        return { error: "Missing required fields" };
    }

    try {
        await prisma.challenge.create({
            data: {
                title,
                description,
                category,
                points,
                flag,
                imageName: imageName || null,
                internalPort,
                hints: {
                    create: (formData.get('hints') as string)?.split('\n').filter(h => h.trim()).map(h => ({ content: h.trim() })) || []
                },
                resources: {
                    create: (formData.get('resources') as string)?.split('\n').filter(r => r.trim()).map(r => {
                        const [title, rawUrl] = r.split('|');
                        const url = rawUrl?.trim();
                        const sanitizedUrl = (url?.startsWith('http://') || url?.startsWith('https://')) ? url : `http://${url}`;
                        return { title: title?.trim() || 'Resource', url: sanitizedUrl || '#' };
                    }) || []
                }
            }
        });

        revalidatePath('/dashboard/admin/challenges');
        revalidatePath('/dashboard/challenges'); // Update user view too
        return { success: true, message: "Challenge deployed successfully" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create challenge" };
    }
}

export async function deleteChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const id = formData.get('id') as string;
    if (!id) return { error: "No ID provided" };

    try {
        // 1. Get all containers for this challenge
        const containers = await prisma.container.findMany({ where: { challengeId: id } });
        
        // 2. Stop all Docker containers to avoid orphans
        for (const container of containers) {
            try {
                await stopContainer(container.containerId);
            } catch (err) {
                console.error(`Failed to stop container ${container.containerId}`, err);
            }
        }

        // 3. Delete related data manually (since cascade is only on Hints/Resources)
        await prisma.submission.deleteMany({ where: { challengeId: id } });
        await prisma.container.deleteMany({ where: { challengeId: id } });

        // 4. Delete the challenge itself
        await prisma.challenge.delete({ where: { id } });

        revalidatePath('/dashboard/admin/challenges');
        revalidatePath('/dashboard/challenges'); // Update user view
        revalidatePath('/dashboard/admin'); // Update stats
        return { success: true, message: "Challenge decommissioned and all resources cleared." };
    } catch (e) {
        console.error('Delete Challenge Error:', e);
        return { error: e instanceof Error ? e.message : "Failed to delete challenge" };
    }
}

export async function adminStopContainer(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const containerId = formData.get('containerId') as string; // This is the DB ID
    if (!containerId) return { error: "No Container ID provided" };

    try {
        const container = await prisma.container.findUnique({ where: { id: containerId } });
        if (container) {
            await stopContainer(container.containerId); // Docker ID
            await prisma.container.delete({ where: { id: containerId } });
        }

        revalidatePath('/dashboard/admin/containers');
        revalidatePath('/dashboard/challenges');
        return { success: true, message: "Container terminated" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to stop container" };
    }
}

export async function resetScores() {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    try {
        await prisma.submission.deleteMany({});
        await prisma.team.updateMany({
            data: { score: 0 }
        });

        revalidatePath('/dashboard/leaderboard');
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/teams');
        return { success: true, message: "Scores reset successfully" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to reset scores" };
    }
}
