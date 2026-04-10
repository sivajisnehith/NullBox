'use client'

import { useActionState, useState, useEffect } from 'react';
import { startChallenge, submitFlag, stopChallenge } from '@/app/actions/challenge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Terminal, Copy, Clock, Play, Flag, CheckCircle, AlertCircle, Loader2, StopCircle, FileText, Lightbulb, ExternalLink } from 'lucide-react';

interface ChallengeInterfaceProps {
    challenge: any;
    activeContainer: any;
    isSolved: boolean;
}

export function ChallengeInterface({ challenge, activeContainer, isSolved }: ChallengeInterfaceProps) {
    const [container, setContainer] = useState(activeContainer);

    // Actions
    const [startState, startAction, startPending] = useActionState(startChallenge, null);
    const [submitState, submitAction, submitPending] = useActionState(submitFlag, null);
    const [stopState, stopAction, stopPending] = useActionState(stopChallenge, null);

    // Watch for start action result
    useEffect(() => {
        if (startState?.success) {
            setContainer({
                host: startState.host,
                port: startState.port,
                expiresAt: startState.expiresAt
            });
        }
    }, [startState]);

    // Watch for stop action result
    useEffect(() => {
        if (stopState?.success) {
            setContainer(null);
        }
    }, [stopState]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Description Panel */}
                <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm val-card relative overflow-hidden">
                    <div className="val-corner-tl" />
                    <h2 className="text-xl font-black italic uppercase tracking-wider text-white mb-4 border-b border-white/10 pb-2">Mission Briefing</h2>
                    <p className="text-muted-foreground leading-relaxed font-sans text-sm whitespace-pre-wrap">
                        {challenge.description}
                    </p>
                </div>

                {/* Resources & Hints */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenge.resources && challenge.resources.length > 0 && (
                        <div className="p-6 border border-white/10 bg-white/5 val-card relative overflow-hidden">
                            <div className="val-corner-tl" />
                            <h3 className="text-lg font-black italic uppercase tracking-wider text-white mb-4 flex items-center">
                                <FileText className="mr-2 text-primary" size={18} />
                                Intel & Resources
                            </h3>
                            <div className="space-y-2">
                                {challenge.resources.map((res: any) => {
                                    const absoluteUrl = res.url?.startsWith('http') ? res.url : `http://${res.url}`;
                                    return (
                                        <a
                                            key={res.id}
                                            href={absoluteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-black/40 border border-white/5 hover:border-primary/50 hover:bg-black/60 transition-all group"
                                        >
                                            <span className="text-sm font-mono text-muted-foreground group-hover:text-white transition-colors">{res.title}</span>
                                            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {challenge.hints && challenge.hints.length > 0 && (
                        <div className="p-6 border border-white/10 bg-white/5 val-card relative overflow-hidden">
                            <div className="val-corner-tl" />
                            <h3 className="text-lg font-black italic uppercase tracking-wider text-white mb-4 flex items-center">
                                <Lightbulb className="mr-2 text-yellow-500" size={18} />
                                Tactical Hints
                            </h3>
                            <div className="space-y-4">
                                {challenge.hints.map((hint: any, idx: number) => (
                                    <div key={hint.id} className="relative">
                                        <details className="group">
                                            <summary className="list-none flex items-center justify-between p-3 bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition-all">
                                                <span className="text-sm font-mono text-muted-foreground font-bold uppercase">Decrypt Hint #{idx + 1}</span>
                                                <span className="text-xs text-muted-foreground/50 uppercase tracking-widest group-open:hidden">Show</span>
                                            </summary>
                                            <div className="p-4 bg-black/20 border-x border-b border-white/5 text-sm text-muted-foreground font-mono">
                                                {hint.content}
                                            </div>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Connection Panel */}
                {challenge.imageName && (
                    <div className="p-6 border border-white/10 bg-black/40 backdrop-blur-sm relative overflow-hidden val-card">
                        <div className="val-corner-tl" />

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black italic uppercase tracking-wider text-white flex items-center">
                                <Terminal className="mr-3 text-primary" />
                                Live Environment
                            </h2>
                        </div>

                        {!container ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground mb-4">Initialize the environment to access the target system.</p>
                                <form action={startAction}>
                                    <input type="hidden" name="challengeId" value={challenge.id} />
                                    <Button type="submit" variant="default" disabled={startPending} className="w-full">
                                        {startPending ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" />}
                                        INITIALIZE ENVIRONMENT
                                    </Button>
                                    {startState?.error && <p className="text-red-500 mt-2 text-xs font-mono">{startState.error}</p>}
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-black/50 border border-primary/30 rounded-none relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                                        Live Signal
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Host Target</p>
                                            <p className="font-mono text-xl text-white">{container.host}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Port Access</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-mono text-xl text-primary">{container.port}</p>
                                                <button onClick={() => copyToClipboard(`${container.host} ${container.port}`)} className="text-muted-foreground hover:text-white transition-colors">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                                        <div className="flex items-center space-x-2 text-muted-foreground">
                                            <Clock size={12} />
                                            <span>EXPIRES: {new Date(container.expiresAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center text-primary animate-pulse">
                                            <Terminal size={12} className="mr-1" />
                                            <span>CONNECTION ESTABLISHED</span>
                                        </div>
                                    </div>
                                </div>

                                <form action={stopAction}>
                                    <input type="hidden" name="challengeId" value={challenge.id} />
                                    <Button type="submit" variant="destructive" disabled={stopPending} size="sm" className="w-full">
                                        {stopPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <StopCircle className="mr-2" size={14} />}
                                        TERMINATE INSTANCE
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Submission Panel */}
            <div className="space-y-6">
                <div className={`p-6 border backdrop-blur-sm val-card ${isSolved ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5'}`}>
                    <h3 className="text-lg font-black italic uppercase tracking-wider mb-4 flex items-center">
                        <Flag className="mr-2" size={20} />
                        Submission
                    </h3>

                    {isSolved ? (
                        <div className="text-center py-8 text-primary">
                            <CheckCircle size={48} className="mx-auto mb-4" />
                            <p className="font-black italic text-xl uppercase">Mission Accomplished</p>
                            <p className="text-sm opacity-70 mt-2 font-mono">Flag captured successfully.</p>
                        </div>
                    ) : (
                        <form action={submitAction} className="space-y-4">
                            <input type="hidden" name="challengeId" value={challenge.id} />
                            <div className="space-y-2">
                                <Input
                                    name="flag"
                                    placeholder="CTF{...}"
                                    className="font-mono bg-black/50 border-white/10 focus:border-primary/50 uppercase"
                                />
                            </div>

                            {submitState?.error && (
                                <div className="flex items-center space-x-2 text-red-500 text-xs font-mono p-2 bg-red-500/10 border border-red-500/20">
                                    <AlertCircle size={14} />
                                    <span>{submitState.error}</span>
                                </div>
                            )}

                            {submitState?.success && (
                                <div className="flex items-center space-x-2 text-green-500 text-xs font-mono p-2 bg-green-500/10 border border-green-500/20">
                                    <CheckCircle size={14} />
                                    <span>{submitState.message}</span>
                                </div>
                            )}

                            <Button type="submit" variant="default" disabled={submitPending} className="w-full">
                                {submitPending ? 'VERIFYING...' : 'SUBMIT FLAG'}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="p-4 border border-white/10 bg-white/5 text-center val-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Reward</p>
                    <p className="text-3xl font-black italic text-primary">{challenge.points} PTS</p>
                </div>
            </div>
        </div>
    )
}
