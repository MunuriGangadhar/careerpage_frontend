export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full ${className}`}
      style={{ width: size, height: size, border: '2px solid transparent', borderTopColor: 'var(--gold)', borderRightColor: 'rgba(201,168,76,0.25)' }} />
  );
}

export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink)' }}>
      <div className="text-center">
        <Spinner size={36} className="mx-auto mb-4" />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)' }}>{message}</p>
      </div>
    </div>
  );
}