"use client"

import ScoringGauge from "./scoring-gauge"

export default function ScoringGaugeDemo() {
  return (
    <div className="space-y-12 p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scoring Gauge Examples</h2>
      
      {/* Different score categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Excellent (850)</h3>
          <ScoringGauge score={850} previousScore={820} />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Good (750)</h3>
          <ScoringGauge score={750} previousScore={780} />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Fair (650)</h3>
          <ScoringGauge score={650} />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Poor (550)</h3>
          <ScoringGauge score={550} previousScore={530} />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Very Poor (450)</h3>
          <ScoringGauge score={450} />
        </div>
      </div>
      
      {/* Different sizes */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Different Sizes</h3>
        
        <div className="flex items-center justify-around flex-wrap gap-8">
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2">Small</h4>
            <ScoringGauge score={720} size="sm" />
          </div>
          
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2">Medium (default)</h4>
            <ScoringGauge score={720} size="md" />
          </div>
          
          <div className="text-center">
            <h4 className="text-sm font-medium mb-2">Large</h4>
            <ScoringGauge score={720} size="lg" />
          </div>
        </div>
      </div>
      
      {/* Without details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Without Details</h3>
        
        <div className="flex items-center justify-around flex-wrap gap-8">
          <ScoringGauge score={820} size="sm" showDetails={false} />
          <ScoringGauge score={680} size="md" showDetails={false} />
          <ScoringGauge score={520} size="lg" showDetails={false} />
        </div>
      </div>
    </div>
  )
}