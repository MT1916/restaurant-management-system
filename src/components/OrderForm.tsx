import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlusCircle, MinusCircle, ClipboardEdit, ShoppingCart, X, Search, ChevronLeft, Star, DoorOpen, Plus } from 'lucide-react';
import { Order, OrderItem } from '../types';
import { addItemsToOrder } from '../lib/database';

// Quick add items
const QUICK_ADD_ITEMS = [
  {
    id: 'roti',
    name: 'Roti',
    price: 15,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    category: 'Breads',
  },
  {
    id: 'butter-roti',
    name: 'Butter Roti',
    price: 25,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    category: 'Breads',
  },
  {
    id: 'papad',
    name: 'Papad',
    price: 20,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    category: 'Accompaniments',
  },
  {
    id: 'green-salad',
    name: 'Green Salad',
    price: 40,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
    category: 'Accompaniments',
  },
];

const MENU_CATEGORIES = [
  'All',
  'Starters',
  'Mains',
  'Desserts',
  'Beverages',
  'Vegan',
  'Gluten-Free'
] as const;

const MENU_ITEMS = [
  { 
    id: '1', 
    name: 'Truffle Risotto',
    description: 'Creamy Arborio rice with black truffle and parmesan',
    price: 899,
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c1?auto=format&fit=crop&w=800&q=80',
    category: 'Mains',
    dietary: ['Vegetarian'],
    rating: 4.8,
    restaurant: 'La Truffe'
  },
  { 
    id: '2', 
    name: 'Tuna Tartare',
    description: 'Fresh tuna with avocado, citrus, and wasabi aioli',
    price: 799,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    category: 'Starters',
    dietary: ['Gluten-Free'],
    rating: 4.5,
    restaurant: 'Ocean Fresh'
  },
  { 
    id: '3', 
    name: 'Garden Salad',
    description: 'Seasonal greens with honey mustard vinaigrette',
    price: 499,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
    category: 'Starters',
    dietary: ['Vegan', 'Gluten-Free'],
    rating: 4.2,
    restaurant: 'Green House'
  },
  { 
    id: '4', 
    name: 'Sea Bass',
    description: 'Pan-seared sea bass with herb butter sauce',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1567159644489-d92d56bd0901?auto=format&fit=crop&w=800&q=80',
    category: 'Mains',
    rating: 4.9,
    restaurant: 'Ocean Fresh'
  },
  {
    id: '5',
    name: 'Chocolate Fondant',
    description: 'Warm chocolate cake with vanilla ice cream',
    price: 599,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
    category: 'Desserts',
    dietary: ['Vegetarian'],
    rating: 4.7,
    restaurant: 'Sweet Delights'
  },
  {
    id: '6',
    name: 'Craft Beer',
    description: 'Local IPA with citrus notes',
    price: 399,
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    rating: 4.3,
    restaurant: 'Brew House'
  }
];

interface OrderFormProps {
  tableId: number;
  onSubmit: (order: Partial<Order>) => void;
  onCloseTable?: () => void;
  isParcel?: boolean;
  existingOrder?: Order;
}

export function OrderForm({ tableId, onSubmit, onCloseTable, isParcel = false, existingOrder }: OrderFormProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof MENU_CATEGORIES[number]>('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const orderSummaryRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.dietary?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const { totalItems, totalAmount } = useMemo(() => {
    return items.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalAmount: acc.totalAmount + (item.price * item.quantity)
    }), { totalItems: 0, totalAmount: 0 });
  }, [items]);

  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(() => setLastAddedItem(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  const addItem = (menuItem: typeof MENU_ITEMS[0] | typeof QUICK_ADD_ITEMS[0]) => {
    setLastAddedItem(menuItem.id);
    setItems(prevItems => {
      const existingItem = prevItems.find((item) => item.id === menuItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...menuItem, quantity: 1, customizations: [] }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => 
      prevItems.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (existingOrder) {
      try {
        const newTotal = existingOrder.total + totalAmount;
        await addItemsToOrder(existingOrder.id, items, newTotal);
        onSubmit({
          ...existingOrder,
          items: [...existingOrder.items, ...items],
          total: newTotal,
        });
      } catch (error) {
        console.error('Error adding items to order:', error);
      }
    } else {
      onSubmit({
        tableId,
        items,
        status: 'pending',
        specialNotes: notes,
        total: totalAmount,
        createdAt: new Date(),
        isParcel
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const displayedCategories = showAllCategories 
    ? MENU_CATEGORIES 
    : MENU_CATEGORIES.slice(0, 5);

  return (
    <form onSubmit={handleSubmit} className="relative pb-32">
      <div className="sticky top-0 z-20 bg-white shadow-md">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            type="button"
            onClick={onCloseTable}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">
            {isParcel ? 'Parcel Order' : `Table ${tableId}`}
            {existingOrder && ' (Adding Items)'}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onCloseTable}
              className="p-2 hover:bg-red-100 text-red-600 rounded-full"
              title="Close Order"
            >
              <DoorOpen className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="p-4 border-b bg-orange-50">
          <h2 className="text-lg font-semibold mb-3">Quick Add Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ADD_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addItem(item)}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-orange-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        <div className="border-b">
          <div className="flex items-center space-x-2 p-4 overflow-x-auto scrollbar-hide">
            {displayedCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
            {!showAllCategories && MENU_CATEGORIES.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllCategories(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
              >
                <span>More →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menu Items</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((menuItem) => {
            const itemInOrder = items.find(item => item.id === menuItem.id);
            const isRecentlyAdded = lastAddedItem === menuItem.id;
            
            return (
              <div
                key={menuItem.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl ${
                  isRecentlyAdded ? 'scale-105' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => addItem(menuItem)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={menuItem.image}
                      alt={menuItem.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {menuItem.rating}
                      </span>
                    </div>

                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        {menuItem.restaurant}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <span className="bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {formatPrice(menuItem.price)}
                      </span>
                    </div>

                    {itemInOrder && (
                      <div className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                        {itemInOrder.quantity}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">
                      {menuItem.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {menuItem.description}
                    </p>
                    {menuItem.dietary && menuItem.dietary.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {menuItem.dietary.map(tag => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 0 && !showOrderSummary && (
        <button
          type="button"
          onClick={() => setShowOrderSummary(true)}
          className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-3 hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{totalItems} items</span>
          <span className="font-bold border-l border-white/20 pl-3">
            {formatPrice(totalAmount)}
          </span>
        </button>
      )}

      <div
        ref={orderSummaryRef}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          showOrderSummary ? 'opacity-100 z-50' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`fixed inset-x-0 bottom-0 bg-white transform transition-transform duration-300 rounded-t-2xl ${
            showOrderSummary ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '80vh', paddingBottom: '80px' }}
        >
          <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-bold">Order Summary</h4>
                <p className="text-gray-600">
                  {isParcel ? 'Parcel Order' : `Table ${tableId}`}
                  {existingOrder && ' (Additional Items)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderSummary(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Your order is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-lg">{item.name}</h5>
                            <p className="text-gray-600">{formatPrice(item.price)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <MinusCircle className="w-6 h-6" />
                          </button>
                          <span className="font-medium text-lg">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addItem(MENU_ITEMS.find(menuItem => menuItem.id === item.id) || item)}
                            className="p-1 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                          >
                            <PlusCircle className="w-6 h-6" />
                          </button>
                          <div className="flex-1 text-right">
                            <span className="font-medium text-lg">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add special instructions..."
                  className="w-full min-h-[80px] p-4 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <ClipboardEdit className="absolute top-4 left-4 w-5 h-5 text-gray-400" />
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <button
              type="submit"
              disabled={items.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-95 shadow-lg disabled:shadow-none"
            >
              {existingOrder ? 'Add Items to Order' : 'Place Order'} ({totalItems} items)
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}