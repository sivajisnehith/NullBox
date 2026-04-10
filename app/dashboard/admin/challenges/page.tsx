import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Challenge } from '@prisma/client';
import { redirect } from 'next/navigation';
import { CreateChallengeForm } from '@/app/components/admin/create-challenge-form';
import { Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DeleteChallengeButton } from '@/app/components/admin/delete-challenge-button';

export default async function AdminChallengesPage() {
    const session = await getSession();
    if (!session || session.role !== 'admin') redirect('/dashboard');

    const challenges = await prisma.challenge.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center border-l-4 border-primary pl-4">
                <div>
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Mission Architect</h1>
                    <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase">Manage combat scenarios and intelligence missions.</p>
                </div>
            </header>

            <CreateChallengeForm />

            <div className="grid grid-cols-1 gap-4">
                {challenges.map((chal: Challenge) => (
                    <div key={chal.id} className="p-6 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${chal.category === 'Pwn' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-blue-500/50 bg-blue-500/10 text-blue-500'}`}>
                                    {chal.category}
                                </span>
                                <h3 className="text-xl font-bold font-mono">{chal.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground w-3/4 truncate">{chal.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-xs font-mono text-muted-foreground">
                                <span>{chal.points} PTS</span>
                                {chal.imageName && (
                                    <span className="flex items-center text-primary">
                                        docker: {chal.imageName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <DeleteChallengeButton id={chal.id} />
                    </div>
                ))}

                {challenges.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-mono">No missions initialized.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
