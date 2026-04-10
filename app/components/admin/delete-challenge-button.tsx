'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { deleteChallenge } from '@/app/actions/admin';
import { useActionState } from 'react';
import { useEffect } from 'react';

export function DeleteChallengeButton({ id }: { id: string }) {
    const [state, action, isPending] = useActionState(deleteChallenge, null);

    useEffect(() => {
        if (state?.success) {
            alert(state.message || 'Challenge deleted');
        } else if (state?.error) {
            alert(state.error);
        }
    }, [state]);

    return (
        <form action={action}>
            <input type="hidden" name="id" value={id} />
            <Button 
                size="icon" 
                variant="ghost" 
                disabled={isPending}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            >
                <Trash2 size={18} className={isPending ? 'animate-pulse' : ''} />
            </Button>
        </form>
    );
}
