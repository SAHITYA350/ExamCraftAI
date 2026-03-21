import ChartPanel, { CHART_COLORS } from '../components/ChartPanel';

const AccuracyChart = ({ data }) => {
  // Transform the latest session into a multi-metric Radar DNA
  const latest = data && data.length > 0 ? data[data.length - 1] : { accuracy: 0, attempts: 0, correct: 0 };
  
  const radarData = [
    { subject: 'Accuracy', value: latest.accuracy || 0 },
    { subject: 'Velocity', value: Math.min(100, (latest.attempts / 8) * 100) || 0 }, 
    { subject: 'Precision', value: latest.attempts > 0 ? (latest.correct / latest.attempts) * 100 : 0 },
    { subject: 'Consistency', value: 82 }, // Simulated metric
    { subject: 'Comprehension', value: 88 } // Simulated metric
  ];

  return (
    <ChartPanel
      title="Neural Performance DNA"
      subtitle="Multi-dimensional session analysis"
      type="radar"
      data={radarData}
      dataKeys={['value']}
      colors={[CHART_COLORS.gold]}
      height={320}
    />
  );
};

export default AccuracyChart;
