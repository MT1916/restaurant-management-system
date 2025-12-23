import React from 'react';
import { Order } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface KitchenDisplayProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
}

export function KitchenDisplay({ orders, onStatusUpdate }: KitchenDisplayProps) {
  const pendingOrders = orders.filter(
    (order) => order.status === 'pending' || order.status === 'preparing'
  );

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleCancelOrder = (orderId: string) => {
    onStatusUpdate(orderId, 'cancelled');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Kitchen Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">
                    {order.isParcel ? 'Parcel Order' : `Table ${order.tableId}`}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {formatTime(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      {item.customizations?.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Customizations: {item.customizations.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {order.specialNotes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Notes:</strong> {order.specialNotes}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onStatusUpdate(order.id, 'ready')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark Ready</span>
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pendingOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pending orders</p>
        </div>
      )}
    </div>
  );
}