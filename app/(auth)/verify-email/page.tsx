import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(81, 231, 76, 0.1)' }}>
        <svg className="w-8 h-8" style={{ color: '#51e74c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      <h1 className="text-2xl text-navy mb-2" style={{ fontWeight: 300 }}>
        Check your inbox
      </h1>
      <p className="text-gray-400 text-sm leading-relaxed mb-3">
        We&apos;ve sent you a confirmation link. Click it to activate your account and start exploring.
      </p>
      <p className="text-xs text-gray-300 mb-8">
        Didn&apos;t receive it? Check your spam folder.
      </p>

      <Link href="/login" className="text-sm text-blue hover:underline">
        Back to login
      </Link>
    </div>
  )
}
