import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar
} from 'recharts';

const CHART_COLORS = {
  gold: '#C9A84C',
  goldLight: '#DFC06C',
  silver: '#B0B0B0',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  silk: '#F5F0E8',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const sessionTime = payload[0]?.payload?.time;
  
  return (
    <div className="glass-card p-3 border border-white/10 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 mb-2 border-b border-white/5 pb-2">
        <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{label}</p>
        {sessionTime && <p className="text-[9px] text-silver-400 font-medium">{sessionTime}</p>}
      </div>
      <div className="space-y-1.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-silk/70 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="text-[11px] font-bold text-silk">
              {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, stroke } = props;
  return (
    <motion.circle
      cx={cx} cy={cy} r={5}
      fill="#0A0A0A"
      stroke={stroke}
      strokeWidth={2}
      initial={{ scale: 0.8 }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [1, 0.6, 1],
        strokeWidth: [2, 4, 2]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      filter="url(#nodeGlow)"
    />
  );
};

const ChartPanel = ({ title, subtitle, type = 'area', data, dataKeys, colors, height = 300, children }) => {
  const renderChart = () => {
    const chartColors = colors || [CHART_COLORS.gold, CHART_COLORS.info, CHART_COLORS.success];

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <defs>
                {(dataKeys || ['value']).map((key, i) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#606060', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#606060', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
              
              {(dataKeys || ['value']).map((key, i) => (
                <Area
                  key={`area-${key}`}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={chartColors[i % chartColors.length]}
                  strokeWidth={2}
                  fill={`url(#gradient-${key})`}
                  fillOpacity={0.6}
                  connectNulls={true}
                  animationDuration={1500}
                />
              ))}
              
              {(dataKeys || ['value']).map((key, i) => (
                <Line
                  key={`line-${key}`}
                  type="monotone"
                  dataKey={key}
                  stroke={chartColors[i % chartColors.length]}
                  strokeWidth={3}
                  connectNulls={true}
                  dot={{ 
                    r: 5, 
                    fill: chartColors[i % chartColors.length], 
                    stroke: '#0A0A0A', 
                    strokeWidth: 2,
                    filter: 'url(#glow)'
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: '#fff', 
                    stroke: chartColors[i % chartColors.length], 
                    strokeWidth: 2,
                    filter: 'url(#glow)'
                  }}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  animationDuration={1200}
                  filter="url(#glow)"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {(dataKeys || ['value']).map((key, i) => (
                <Bar
                  key={key}
                  stackId="a"
                  dataKey={key}
                  fill={chartColors[i % chartColors.length]}
                  radius={0}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data?.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color || chartColors[i % chartColors.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#B0B0B0' }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(dataKeys || ['value']).map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartColors[i % chartColors.length]}
                  strokeWidth={3}
                  connectNulls={true}
                  dot={{ 
                    r: 5, 
                    fill: chartColors[i % chartColors.length], 
                    strokeWidth: 2, 
                    stroke: '#0A0A0A',
                    filter: 'url(#glow)'
                  }}
                  activeDot={{ 
                    r: 7, 
                    strokeWidth: 2,
                    stroke: '#fff',
                    fill: chartColors[i % chartColors.length],
                    filter: 'url(#glow)'
                  }}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  filter="url(#glow)"
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'track':
        const trackColors = colors || [CHART_COLORS.gold, CHART_COLORS.success, CHART_COLORS.info];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="1 8" stroke="rgba(255,255,255,0.08)" vertical={false} />
              
              {/* Decorative Mathematical Waves (Sin/Cos/Tan theme) */}
              <Line 
                type="monotone" dataKey="_sin" stroke="rgba(201,168,76,0.12)" strokeWidth={1} 
                dot={false} isAnimationActive={true} animationDuration={3000} strokeDasharray="5 5"
              />
              <Line 
                type="monotone" dataKey="_cos" stroke="rgba(52,152,219,0.08)" strokeWidth={1} 
                dot={false} isAnimationActive={true} animationDuration={4000}
              />
              <Line 
                type="basis" dataKey="_tan" stroke="rgba(231,76,60,0.06)" strokeWidth={1} 
                dot={false} isAnimationActive={true} animationDuration={5000} strokeDasharray="3 3"
              />

              <XAxis 
                dataKey="name" 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }} 
                axisLine={false} 
                tickLine={false}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              
              {(dataKeys || ['value']).map((key, i) => (
                <Line
                  key={key}
                  type="stepAfter"
                  dataKey={key}
                  stroke={trackColors[i % trackColors.length]}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  connectNulls={true}
                  dot={<CustomDot />}
                  activeDot={{ 
                    r: 10, 
                    fill: trackColors[i % trackColors.length], 
                    stroke: '#fff', 
                    strokeWidth: 3,
                    filter: 'url(#nodeGlow)'
                  }}
                  animationDuration={1500}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              {(dataKeys || ['value']).map((key, i) => (
                <Radar
                  key={key}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  dataKey={key}
                  stroke={chartColors[i % chartColors.length]}
                  strokeWidth={2}
                  fill={chartColors[i % chartColors.length]}
                  fillOpacity={0.3}
                  activeDot={{ r: 6, fill: '#fff' }}
                  animationDuration={1800}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'radialBar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadialBarChart 
              cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" 
              barSize={10} data={data} startAngle={180} endAngle={-180}
            >
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 800 }}
                background={{ fill: 'rgba(255,255,255,0.03)' }}
                clockWise
                dataKey="value"
                cornerRadius={12}
                animationDuration={1800}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical" 
                content={({ payload }) => (
                  <div className="flex flex-col gap-2 ml-4">
                    {payload.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-silver-400 font-bold uppercase">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5"
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-dark-700 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children || renderChart()}
    </motion.div>
  );
};

export { CHART_COLORS };
export default ChartPanel;
