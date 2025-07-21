import dynamic from 'next/dynamic'

// Lazy load heavy components
export const BankCard = dynamic(() => import('@/components/ui/bank-card'), {
  loading: () => <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />,
})

export const LoanForm = dynamic(() => import('@/components/ui/loan-form'), {
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />,
})

export const ScoringGauge = dynamic(() => import('@/components/ui/scoring-gauge'), {
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />,
})

export const PDNIndicator = dynamic(() => import('@/components/ui/pdn-indicator'), {
  loading: () => <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />,
})

// Lazy load modals
// export const AuthModal = dynamic(() => import('@/components/modals/auth-modal'), {
//   loading: () => null,
// })

// Lazy load pages components
// export const PersonalDataForm = dynamic(() => import('@/components/forms/personal-data-form'), {
//   loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />,
// })

// export const OffersGrid = dynamic(() => import('@/components/offers/offers-grid'), {
//   loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//     {[1, 2, 3].map((i) => (
//       <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
//     ))}
//   </div>,
// })