import { ArrowUpRight, DollarSign, Users, CreditCard, Activity, Package, AlertCircle } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string, value: string, icon: React.ElementType, change?: string, changeType?: 'increase' | 'decrease' }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
    <div className="mt-2">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change && (
        <p className={`mt-1 text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
          <ArrowUpRight className={`w-4 h-4 mr-1 ${changeType === 'decrease' ? 'transform rotate-180' : ''}`} />
          <span>{change} so với tháng trước</span>
        </p>
      )}
    </div>
  </div>
);