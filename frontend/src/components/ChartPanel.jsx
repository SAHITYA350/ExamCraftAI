import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
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
  return (
    <div className="glass-card p-3 border border-white/10 shadow-xl">
      <p className="text-xs font-semibold text-gold mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-xs text-silk">
          <span style={{ color: item.color }} className="font-medium">{item.name}: </span>
          {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
        </p>
      ))}
    </div>
  );
};

const ChartPanel = ({ title, subtitle, type = 'area', data, dataKeys, colors, height = 300, children }) => {
  const renderChart = () => {
    const chartColors = colors || [CHART_COLORS.gold, CHART_COLORS.info, CHART_COLORS.success];

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <defs>
                {(dataKeys || ['value']).map((key, i) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {(dataKeys || ['value']).map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartColors[i % chartColors.length]}
                  strokeWidth={2}
                  fill={`url(#gradient-${key})`}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </AreaChart>
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
                  dataKey={key}
                  fill={chartColors[i % chartColors.length]}
                  radius={[6, 6, 0, 0]}
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
                  dot={{ r: 4, fill: chartColors[i % chartColors.length], strokeWidth: 2, stroke: '#121212' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </LineChart>
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
