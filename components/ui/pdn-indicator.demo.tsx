"use client"

import PDNIndicator from "./pdn-indicator"

export default function PDNIndicatorDemo() {
  return (
    <div className="space-y-8 p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">PDN Indicator Examples</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Low Risk (25%)</h3>
          <PDNIndicator
            pdn={25}
            monthlyIncome={3000000}
            monthlyPayment={500000}
            otherPayments={250000}
            showDetails={true}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Medium Risk (45%)</h3>
          <PDNIndicator
            pdn={45}
            monthlyIncome={2000000}
            monthlyPayment={700000}
            otherPayments={200000}
            showDetails={true}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">High Risk (58%)</h3>
          <PDNIndicator
            pdn={58}
            monthlyIncome={1500000}
            monthlyPayment={700000}
            otherPayments={170000}
            showDetails={true}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Critical Risk (75%)</h3>
          <PDNIndicator
            pdn={75}
            monthlyIncome={1000000}
            monthlyPayment={600000}
            otherPayments={150000}
            showDetails={true}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Simple View</h3>
          <PDNIndicator pdn={42} />
        </div>
      </div>
    </div>
  )
}