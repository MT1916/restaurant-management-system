import React, { useState, useEffect } from 'react';
import { TableGrid } from './components/TableGrid';
import { OrderForm } from './components/OrderForm';
import { KitchenDisplay } from './components/KitchenDisplay';
import { Analytics } from './components/Analytics';
import { Table, Order } from './types';
import { LayoutGrid, ClipboardList, ChefHat, BarChart, Package, RefreshCw } from 'lucide-react';
import { createOrder, updateOrderStatus, getOrders } from './lib/database';
import { initializeAuth, supabase } from './lib/supabase';

const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: 'free',
}));

type View = 'tables' | 'orders' | 'kitchen' | 'analytics';

function App() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<View>('tables');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isParcelOrder, setIsParcelOrder] = useState(false);

  const initialize = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      await initializeAuth();
      await loadOrders();
      setupRealtimeSubscription();
    } catch (error: any) {
      console.error('Failed to initialize:', error);
      if (error.message === 'Failed to fetch' || error.name === 'AuthRetryableFetchError') {
        setAuthError('Connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'invalid_credentials') {
        setAuthError('Authentication failed. Please contact support.');
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    initialize();
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const setupRealtimeSubscription = () => {
    const ordersChannel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  };

  const handleRetry = () => {
    setIsRetrying(true);
    initialize();
  };

  const loadOrders = async () => {
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);

      // Update table statuses based on orders
      const tableStatuses = new Map<number, Table['status']>();
      fetchedOrders.forEach(order => {
        if (order.status !== 'paid' && order.status !== 'cancelled') {
          tableStatuses.set(order.tableId, 
            order.status === 'pending' || order.status === 'preparing' 
              ? 'order-in-progress' 
              : 'occupied'
          );
        }
      });

      setTables(tables.map(table => ({
        ...table,
        status: tableStatuses.get(table.id) || 'free'
      })));
    } catch (error) {
      console.error('Error loading orders:', error);
      throw error;
    }
  };

  const handleTableSelect = (tableId: number) => {
    setSelectedTable(tableId);
    setIsParcelOrder(false);
    setCurrentView('tables');
  };

  const handleParcelSelect = () => {
    setSelectedTable(99); // Using 99 as a special ID for parcel orders
    setIsParcelOrder(true);
    setCurrentView('tables');
  };

  const handleOrderSubmit = async (order: Partial<Order>) => {
    try {
      await createOrder({
        ...order,
        tableId: isParcelOrder ? 99 : order.tableId!,
        isParcel: isParcelOrder,
      } as Omit<Order, 'id'>);
      await loadOrders();
      setSelectedTable(null);
      setIsParcelOrder(false);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCloseTable = async () => {
    if (selectedTable) {
      const tableOrders = orders.filter(
        order => order.tableId === selectedTable && order.status !== 'paid' && order.status !== 'cancelled'
      );

      try {
        await Promise.all(
          tableOrders.map(order => updateOrderStatus(order.id, 'paid'))
        );
        await loadOrders();
        setSelectedTable(null);
        setIsParcelOrder(false);
      } catch (error) {
        console.error('Error closing table:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-800 mb-4">{authError}</p>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedTable) {
      const existingOrder = orders.find(
        order => order.tableId === selectedTable && 
        order.status !== 'paid' && 
        order.status !== 'cancelled'
      );

      return (
        <OrderForm
          tableId={selectedTable}
          onSubmit={handleOrderSubmit}
          onCloseTable={handleCloseTable}
          isParcel={isParcelOrder}
          existingOrder={existingOrder}
        />
      );
    }

    switch (currentView) {
      case 'tables':
        return (
          <TableGrid
            tables={tables}
            onTableSelect={handleTableSelect}
            onParcelSelect={handleParcelSelect}
          />
        );
      case 'orders':
        return (
          <div className="space-y-6 p-6">
            <h2 className="text-2xl font-bold">All Orders</h2>
            <div className="grid gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {order.isParcel ? 'Takeaway Order' : `Table ${order.tableId}`}
                      </h3>
                      <p className="text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xl font-bold">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(order.total)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-gray-600">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'kitchen':
        return <KitchenDisplay orders={orders} onStatusUpdate={handleOrderStatusUpdate} />;
      case 'analytics':
        return <Analytics orders={orders} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            <button
              onClick={() => setCurrentView('tables')}
              className={`flex flex-col items-center py-3 px-6 ${
                currentView === 'tables' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <LayoutGrid className="w-6 h-6" />
              <span className="text-xs mt-1">Tables</span>
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className={`flex flex-col items-center py-3 px-6 ${
                currentView === 'orders' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <ClipboardList className="w-6 h-6" />
              <span className="text-xs mt-1">Orders</span>
            </button>
            <button
              onClick={() => setCurrentView('kitchen')}
              className={`flex flex-col items-center py-3 px-6 ${
                currentView === 'kitchen' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <ChefHat className="w-6 h-6" />
              <span className="text-xs mt-1">Kitchen</span>
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex flex-col items-center py-3 px-6 ${
                currentView === 'analytics' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <BarChart className="w-6 h-6" />
              <span className="text-xs mt-1">Analytics</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Takeaway Button */}
      <button
        onClick={handleParcelSelect}
        className="fixed right-6 bottom-24 z-50 flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-200"
        title="Place Takeaway Order"
      >
        <Package className="w-8 h-8" />
      </button>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-20">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;