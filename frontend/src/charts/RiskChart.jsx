import { motion } from 'framer-motion';
import ChartPanel, { CHART_COLORS } from '../components/ChartPanel';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RiskChart = ({ riskScore, riskData }) => {
  const score = riskScore ?? 0;

  // Determine risk level
  const getRiskInfo = (s) => {
    if (s >= 75) return { label: 'Low Risk', color: CHART_COLORS.success, icon: CheckCircle, message: 'You are well prepared!' };
    if (s >= 45) return { label: 'Medium Risk', color: CHART_COLORS.warning, icon: AlertTriangle, message: 'Some areas need improvement' };
    return { label: 'High Risk', color: CHART_COLORS.danger, icon: XCircle, message: 'Focus on weak topics urgently' };
  };

  const risk = getRiskInfo(score);
  const RiskIcon = risk.icon;

  const pieData = riskData || (score === 0 ? [
    { name: 'Strong Topics', value: 0, color: CHART_COLORS.success },
    { name: 'Moderate', value: 0, color: CHART_COLORS.warning },
    { name: 'Weak Topics', value: 0, color: CHART_COLORS.danger },
  ] : [
    { name: 'Strong Topics', value: score, color: CHART_COLORS.success },
    { name: 'Moderate', value: Math.max(0, 100 - score - 15), color: CHART_COLORS.warning },
    { name: 'Weak Topics', value: 15, color: CHART_COLORS.danger },
  ]);

  return (
    <ChartPanel title="Risk Assessment" subtitle="Exam readiness prediction">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Circular Score */}
        <div className="relative flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            {/* Progress circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="65"
              fill="none"
              stroke={risk.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 65}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 65 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 65 * (1 - score / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-3xl font-bold font-[var(--font-display)]"
              style={{ color: risk.color }}
            >
              {score}%
            </motion.span>
            <span className="text-xs text-dark-700">Readiness</span>
          </div>
        </div>

        {/* Risk Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${risk.color}18` }}>
              <RiskIcon size={20} style={{ color: risk.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-silk">{risk.label}</p>
              <p className="text-xs text-dark-700">{risk.message}</p>
            </div>
          </div>

          {/* Mini bars */}
          {pieData.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-silver-200">{item.name}</span>
                <span style={{ color: item.color }} className="font-medium">{item.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-dark-300 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartPanel>
  );
};

export default RiskChart;
