import React, { useEffect, useState } from 'react';
import { BarChart, IndianRupee, TrendingUp, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { Order } from '../types';

interface AnalyticsProps {
  orders: Order[];
}

export function Analytics({ orders }: AnalyticsProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'cancelled'>('all');

  const filterOrders = (status: 'all' | 'cancelled') => {
    return status === 'all'
      ? orders.filter(order => order.status !== 'cancelled')
      : orders.filter(order => order.status === 'cancelled');
  };

  const calculateStats = (filteredOrders: Order[]) => {
    const statsMap = new Map<string, {
      date: string;
      total_orders: number;
      total_revenue: number;
      items_sold: number;
      orders: Order[];
    }>();

    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const itemsSold = order.items.reduce((sum, item) => sum + item.quantity, 0);
      
      if (!statsMap.has(date)) {
        statsMap.set(date, {
          date,
          total_orders: 0,
          total_revenue: 0,
          items_sold: 0,
          orders: []
        });
      }
      
      const stats = statsMap.get(date)!;
      stats.total_orders += 1;
      stats.total_revenue += order.total;
      stats.items_sold += itemsSold;
      stats.orders.push(order);
    });

    return Array.from(statsMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const filteredOrders = filterOrders(activeTab);
  const dailyStats = calculateStats(filteredOrders);
  const totalRevenue = dailyStats.reduce((sum, stat) => sum + stat.total_revenue, 0);
  const totalOrders = dailyStats.reduce((sum, stat) => sum + stat.total_orders, 0);
  const totalItems = dailyStats.reduce((sum, stat) => sum + stat.items_sold, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'cancelled'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cancelled Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            <BarChart className="w-6 h-6 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{totalOrders}</p>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <IndianRupee className="w-6 h-6 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Items Sold</h3>
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{totalItems}</p>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>
      </div>

      {/* Daily Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {activeTab === 'all' ? 'Daily Order Details' : 'Cancelled Orders'}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {dailyStats.map((stat) => (
            <div key={stat.date} className="bg-white">
              <button
                onClick={() => toggleDateExpansion(stat.date)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{stat.date}</span>
                  <span className="text-sm text-gray-500">
                    {stat.total_orders} orders
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatPrice(stat.total_revenue)}
                  </span>
                </div>
                {expandedDates.has(stat.date) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedDates.has(stat.date) && (
                <div className="px-6 pb-4">
                  <div className="space-y-4">
                    {stat.orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">
                              {order.isParcel ? 'Parcel Order' : `Table ${order.tableId}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(order.createdAt.toString())}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              order.status === 'served' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <span className="font-medium text-green-600">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-gray-600">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}