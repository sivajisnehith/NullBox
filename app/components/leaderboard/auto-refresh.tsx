'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
    const router = useRouter();
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        setConnected(true);

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/leaderboard-ws', {
                    cache: 'no-store'
                });
                if (res.ok) {
                    const data = await res.json();
                    const hash = JSON.stringify(data.map((t: any) => ({
                        id: t.id, score: t.score
                    })));

                    if (hash !== lastUpdate) {
                        setLastUpdate(hash);
                        router.refresh();
                    }
                }
            } catch (e) {
                setConnected(false);
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [router, intervalMs, lastUpdate]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 
      bg-black/80 border border-white/10 px-3 py-2 rounded-full 
      backdrop-blur-sm text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${connected
                    ? 'bg-green-400 shadow-[0_0_6px_rgba(0,255,0,0.8)] animate-pulse'
                    : 'bg-red-500'
                }`} />
            <span className="text-muted-foreground">
                {connected ? 'LIVE FEED ACTIVE' : 'RECONNECTING...'}
            </span>
        </div>
    );
}