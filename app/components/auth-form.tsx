'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function AuthForm() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerMessage, setRegisterMessage] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const [loginState, loginAction, loginPending] = useActionState(login, null)

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterMessage(null)
    setRegisterError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const payload = {
        username: String(formData.get('username') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        registrationNumber: String(formData.get('registrationNumber') ?? '').trim(),
        password: String(formData.get('password') ?? '')
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        setRegisterError(data?.message ?? 'Registration failed')
        return
      }

      setRegisterMessage(data?.message ?? 'Registered successfully')
      setIsLogin(true)
      router.replace('/')
    } catch (error) {
      console.error('[REGISTER SUBMIT ERROR]', error)
      setRegisterError('Unable to register right now. Please try again.')
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 rounded-xl glass-panel relative overflow-hidden shadow-2xl border border-white/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter neon-text font-mono">
          NULL BOX
        </h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest">
          {isLogin ? ' // Authenticaton Required' : ' // Initialize Protocol'}
        </p>
      </div>

      {isLogin ? (
        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Registration Number</label>
            <Input name="registrationNumber" type="text" placeholder="24BCS..." required className="bg-black/50 border-white/10 focus:border-primary/50" />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
            <Input name="password" type="password" placeholder="********" required className="bg-black/50 border-white/10 focus:border-primary/50" />
          </div>

          {loginState?.error && (
            <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{loginState.error}</p>
          )}
          {registerMessage && (
            <p className="text-green-500 text-xs font-mono border border-green-500/20 bg-green-500/10 p-2 rounded">{registerMessage}</p>
          )}

          <Button
            type="submit"
            className="w-full font-mono uppercase tracking-widest mt-4"
            variant="default"
            disabled={loginPending}
          >
            {loginPending ? 'Authenticating...' : 'Access System'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Username</label>
            <Input name="username" placeholder="Codename" required className="bg-black/50 border-white/10 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <Input name="email" type="email" placeholder="access@corp.local" required className="bg-black/50 border-white/10 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Registration Number</label>
            <Input name="registrationNumber" type="text" placeholder="24BCS..." required className="bg-black/50 border-white/10 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
            <Input name="password" type="password" placeholder="********" required className="bg-black/50 border-white/10 focus:border-primary/50" />
          </div>

          {registerError && (
            <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{registerError}</p>
          )}

          <Button
            type="submit"
            className="w-full font-mono uppercase tracking-widest mt-4"
            variant="default"
            disabled={registerLoading}
          >
            {registerLoading ? 'Initializing...' : 'Register Identity'}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
        >
          [{isLogin ? ' Create New Identity ' : ' Return to Login '}]
        </button>
      </div>
    </div>
  )
}
