import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users, Shield, Flag, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { resetScores } from '@/app/actions/admin';
import { DeleteChallengeButton } from '@/app/components/admin/delete-challenge-button';

export default async function AdminDashboard() {
    const session = await getSession();
    if (!session || session.role !== 'admin') redirect('/dashboard');

    const [userCount, teamCount, challengeCount, containerCount, challenges] = await Promise.all([
        prisma.user.count(),
        prisma.team.count(),
        prisma.challenge.count(),
        prisma.container.count(),
        prisma.challenge.findMany({ orderBy: { createdAt: 'desc' } })
    ]);

    return (
        <div className="space-y-8">
            <header className="border-l-4 border-primary pl-4">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Admin Console</h1>
                <p className="text-muted-foreground mt-2 font-bold tracking-widest text-sm uppercase">[Root Access Granted]</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Operatives" value={userCount} icon={<Users size={20} />} />
                <StatCard title="Active Units" value={teamCount} icon={<Shield size={20} />} />
                <StatCard title="Missions" value={challengeCount} icon={<Flag size={20} />} />
                <StatCard title="Live Environments" value={containerCount} icon={<LayoutGrid size={20} />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/admin/challenges" className="block p-8 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
                    <h2 className="text-2xl font-bold font-mono mb-2 group-hover:text-primary transition-colors">Mission Control</h2>
                    <p className="text-muted-foreground">Add, edit, or decommission challenges. Configure docker images and flags.</p>
                </Link>
                <Link href="/dashboard/admin/containers" className="block p-8 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
                    <h2 className="text-2xl font-bold font-mono mb-2 group-hover:text-primary transition-colors">Environment Monitor</h2>
                    <p className="text-muted-foreground">View real-time active containers, check expiration times, and force termination.</p>
                </Link>
                <Link href="/dashboard/admin/teams" className="block p-8 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group">
                    <h2 className="text-2xl font-bold font-mono mb-2 group-hover:text-primary transition-colors">Unit Database</h2>
                    <p className="text-muted-foreground">Access the full registry of active teams and operatives. View scores and credentials.</p>
                </Link>

                <div className="p-8 rounded-xl border border-red-500/30 bg-red-500/5">
                    <h2 className="text-2xl font-bold font-mono mb-2 text-red-500">System Override</h2>
                    <p className="text-muted-foreground mb-6">Dangerous operation. Reset all unit scores and purge submission logs.</p>
                    <form action={async () => {
                        'use server';
                        await resetScores();
                    }}>
                        <button type="submit" className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 font-mono text-sm uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all rounded">
                            Reset Competition
                        </button>
                    </form>
                </div>
            </div>

            <section className="mt-12">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                    <h2 className="text-2xl font-black italic uppercase tracking-widest text-white/50">Mission Registry</h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {challenges.map((chal) => (
                        <div key={chal.id} className="p-4 rounded-lg border border-white/5 bg-black/20 flex items-center justify-between hover:border-primary/30 transition-all">
                            <div className="flex items-center space-x-4">
                                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 border border-primary/20">#{chal.id.slice(-4)}</span>
                                <span className="font-bold font-mono text-white">{chal.title}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-0.5">{chal.category}</span>
                            </div>
                            <div className="flex items-center space-x-6">
                                <span className="text-xs font-mono text-muted-foreground">{chal.points} PTS</span>
                                <DeleteChallengeButton id={chal.id} />
                            </div>
                        </div>
                    ))}
                    {challenges.length === 0 && <p className="text-center text-muted-foreground italic font-mono py-8">No missions registered.</p>}
                </div>
            </section>
        </div>
    )
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-xs uppercase tracking-widest">{title}</span>
                <span className="text-primary">{icon}</span>
            </div>
            <p className="text-4xl font-bold font-mono">{value}</p>
        </div>
    )
}
