import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import useWebSocket from "../../hooks/useWebSocket";
const MenuSelector = ({
  onSave,
  onSaveCategory,
  onClose,
  initialItems,
  foodType,
  ratePlan
}) => {
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';
  const { axios } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(initialItems || []);
  const [currentCategory, setCurrentCategory] = useState("");
  const [planLimits, setPlanLimits] = useState({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // WebSocket connection for real-time updates
  const { lastMessage, sendMessage } = useWebSocket();

  // Handle real-time menu updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'MENU_ITEM_CREATED':
        case 'MENU_ITEM_UPDATED':
        case 'MENU_ITEM_DELETED':
          // Refresh menu items when any menu changes
          fetchMenuItems().then(setMenuItems);
          break;
        case 'CATEGORY_CREATED':
        case 'CATEGORY_UPDATED':
        case 'CATEGORY_DELETED':
          // Refresh categories when any category changes
          fetchCategories().then(setCategories);
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  // API functions
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu-items');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  };

  const createMenuItem = async (itemData) => {
    try {
      const response = await axios.post('/api/menu-items', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      const response = await axios.delete(`/api/menu-items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  const deleteMenuItems = async () => {
    try {
      const response = await axios.delete('/api/menu-items');
      return response.data;
    } catch (error) {
      console.error('Error deleting menu items:', error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await axios.post('/api/categories/create', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const fetchPlanLimits = async () => {
    try {
      const response = await axios.get('/api/plan-limits/get');
      return response.data;
    } catch (error) {
      console.error('Error fetching plan limits:', error);
      return [];
    }
  };

  const createPlanLimits = async (limitsData) => {
    try {
      const response = await axios.post('/api/plan-limits', limitsData);
      return response.data;
    } catch (error) {
      console.error('Error creating plan limits:', error);
      throw error;
    }
  };

  // Sync selectedItems when initialItems changes
  useEffect(() => {
    const newItems = initialItems || [];
    setSelectedItems(newItems);
  }, [initialItems]);

  // Fetch menu items, categories and plan limits
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuData, categoriesData, limitsData] = await Promise.all([
          fetchMenuItems(),
          fetchCategories(),
          fetchPlanLimits()
        ]);
        
        // Handle categories with predefined order
        if (categoriesData) {
          const cats = Array.isArray(categoriesData) ? categoriesData : 
                      categoriesData.data ? categoriesData.data : 
                      categoriesData.categories ? categoriesData.categories : [];
          
          // Define the desired order based on food type
          const vegCategoryOrder = [
            'WELCOME DRINK', 'STARTER VEG', 'SALAD', 'RAITA', 'MAIN COURSE[PANEER]', 
            'VEGETABLE', 'DAL', 'RICE', 'BREADS', 'DESSERTS'
          ];
          
          const nonVegCategoryOrder = [
            'WELCOME DRINK', 'STARTER VEG', 'SALAD', 'RAITA', 'MAIN COURSE[PANEER]', 
            'MAIN COURSE[NON-VEG]', 'VEGETABLE', 'DAL', 'RICE', 'BREADS', 'DESSERTS'
          ];
          
          const categoryOrder = foodType === 'Veg' ? vegCategoryOrder : nonVegCategoryOrder;
          
          // Filter categories based on food type
          const filteredCats = cats.filter(cat => {
            const catName = cat.cateName || cat.name;
            // For Veg only, exclude NON-VEG categories
            if (foodType === 'Veg' && (catName.includes('NON-VEG') || catName.includes('NON VEG'))) {
              return false;
            }
            return true;
          });
          

          
          const sortedCats = filteredCats.sort((a, b) => {
            const aName = a.cateName || a.name;
            const bName = b.cateName || b.name;
            const aIndex = categoryOrder.indexOf(aName);
            const bIndex = categoryOrder.indexOf(bName);
            
            // If both are in the order array, sort by their position
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            // If only one is in the order array, prioritize it
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            // If neither is in the order array, sort alphabetically
            return aName.localeCompare(bName);
          });
          
          setCategories(sortedCats);
          if (sortedCats.length > 0) {
            setCurrentCategory(sortedCats[0].cateName || sortedCats[0].name);
          }
        }
        
        // Handle menu items
        if (menuData) {
          const items = Array.isArray(menuData) ? menuData :
                       menuData.data ? menuData.data :
                       menuData.items ? menuData.items : [];
          setMenuItems(items);
        }
        
        // Handle plan limits
        if (limitsData) {
          const limits = limitsData.success ? limitsData.data : limitsData;
          setPlanLimits(limits);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axios]);

  // Get items for current category filtered by foodType and ratePlan
  const currentCategoryItems = useMemo(() => {
    if (!menuItems.length || !currentCategory) return [];
    
    // Find the current category object to get its ID
    const currentCategoryObj = categories.find(cat => 
      (cat.cateName || cat.name) === currentCategory
    );
    const currentCategoryId = currentCategoryObj?._id || currentCategoryObj?.id;
    
    const filteredItems = menuItems.filter(item => {
      // Match category by ID since menu items store category as ID string
      const categoryMatch = item.category === currentCategoryId;
      
      if (!categoryMatch) return false;
      
      // Filter by foodType — Both shows all items
      if (foodType && foodType !== 'Both' && item.foodType) {
        if (item.foodType === 'Both') return true;
        return item.foodType === foodType;
      }
      
      return true;
    });
    
    // Remove duplicates and format
    const uniqueItems = [];
    const seenNames = new Set();
    
    filteredItems.forEach(item => {
      const itemName = item.name || item.itemName;
      if (itemName && !seenNames.has(itemName)) {
        seenNames.add(itemName);
        uniqueItems.push({
          id: item._id || item.id || itemName,
          name: itemName
        });
      }
    });
    
    return uniqueItems;
  }, [menuItems, currentCategory, foodType, ratePlan, categories]);

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(item);
      const newItems = isSelected ? prev.filter(i => i !== item) : [...prev, item];

      if (!isSelected && !isAdmin) {
        const matchingPlan = Array.isArray(planLimits)
          ? planLimits.find(plan => plan.foodType === foodType && plan.ratePlan === ratePlan)
          : null;
        const categoryLimit = matchingPlan?.limits?.[currentCategory];
        if (categoryLimit) {
          const currentCategorySelectedCount = prev.filter(selectedItem => {
            const selectedItemData = menuItems.find(mi => mi.name === selectedItem);
            const categoryObj = categories.find(cat => cat._id === selectedItemData?.category);
            return (categoryObj?.cateName || categoryObj?.name) === currentCategory;
          }).length;
          if (currentCategorySelectedCount >= categoryLimit) return prev;
        }
      }

      setTimeout(() => {
        if (onSave) onSave(newItems, buildCategorizedMenu(newItems));
      }, 0);

      return newItems;
    });
  };

  const buildCategorizedMenu = (items) => {
    const categorizedMenu = {};
    items.forEach(selectedItem => {
      const itemData = menuItems.find(mi => mi.name === selectedItem);
      if (itemData) {
        const categoryObj = categories.find(cat =>
          cat._id === itemData.category || cat.id === itemData.category
        );
        const categoryName = categoryObj?.cateName || categoryObj?.name || 'Other';
        if (!categorizedMenu[categoryName]) categorizedMenu[categoryName] = [];
        categorizedMenu[categoryName].push(selectedItem);
      }
    });
    return categorizedMenu;
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await createCategory({ cateName: newCategoryName });
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      setNewCategoryName("");
      setShowAddCategory(false);
      
      // Send WebSocket notification
      sendMessage({
        type: 'CATEGORY_CREATED',
        data: { name: newCategoryName }
      });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteMenuItem = async (itemName) => {
    try {
      const item = menuItems.find(mi => mi.name === itemName);
      if (item && item.id) {
        await deleteMenuItem(item.id);
        const updatedItems = await fetchMenuItems();
        setMenuItems(updatedItems);
        setSelectedItems(prev => prev.filter(i => i !== itemName));
        
        // Send WebSocket notification
        sendMessage({
          type: 'MENU_ITEM_DELETED',
          data: { name: itemName, id: item.id }
        });
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  // Get selected count for a given category name
  const getCategorySelectedCount = (catName) => {
    return selectedItems.filter(sel => {
      const itemData = menuItems.find(mi => mi.name === sel);
      const catObj = categories.find(c => c._id === itemData?.category);
      return (catObj?.cateName || catObj?.name) === catName;
    }).length;
  };

  // Get limit for current category from planLimits
  const getCurrentCategoryLimit = (catName) => {
    if (foodType === 'Both') return null; // No limits enforced for Both
    const matchingPlan = Array.isArray(planLimits)
      ? planLimits.find(p => p.foodType === foodType && p.ratePlan === ratePlan)
      : null;
    const key = catName?.toUpperCase().replace(/\s+/g, '_');
    return matchingPlan?.limits?.[key] ?? matchingPlan?.limits?.[catName] ?? null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c3ad6b]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'hsl(45,100%,97%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e8dfc8] sticky top-0 z-10">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'hsl(45,100%,20%)' }}>
            Menu Selection
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {ratePlan && foodType ? `${ratePlan} · ${foodType === 'Both' ? 'Veg + Non-Veg' : foodType}` : 'Select items for the booking'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[#c3ad6b]/10 text-[#8a7340] rounded-full text-xs font-semibold">
            {selectedItems.length} selected
          </span>
          <button
            onClick={() => {
              if (onSave && selectedItems.length > 0) onSave(selectedItems, buildCategorizedMenu(selectedItems));
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Categories Sidebar */}
        <aside className="w-52 flex-shrink-0 bg-white border-r border-[#e8dfc8] overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</span>
              {isAdmin && (
                <button
                  onClick={() => setShowAddCategory(v => !v)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-[#c3ad6b]/10 text-[#8a7340] hover:bg-[#c3ad6b]/20 transition-colors text-base font-bold"
                >
                  +
                </button>
              )}
            </div>

            {showAddCategory && (
              <div className="mb-3 p-2 bg-[#c3ad6b]/5 border border-[#c3ad6b]/20 rounded-lg">
                <input
                  type="text"
                  placeholder="Category name"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#c3ad6b] bg-white mb-2"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <div className="flex gap-1">
                  <button onClick={handleAddCategory} className="flex-1 py-1 text-xs bg-[#c3ad6b] hover:bg-[#b39b5a] text-white rounded-md font-semibold transition-colors">Add</button>
                  <button onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }} className="flex-1 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md font-semibold transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {categories.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No categories</p>
            ) : (
              <div className="space-y-1">
                {categories.map(category => {
                  const catName = category.cateName || category.name;
                  const isActive = currentCategory === catName;
                  const limit = getCurrentCategoryLimit(catName);
                  const selectedCount = getCategorySelectedCount(catName);
                  return (
                    <button
                      key={catName}
                      onClick={() => setCurrentCategory(catName)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${
                        isActive
                          ? 'bg-[#c3ad6b] text-white shadow-sm'
                          : 'text-gray-700 hover:bg-[#c3ad6b]/10 hover:text-[#8a7340]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{catName}</span>
                        {limit !== null && (
                          <span className={`ml-1 flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[#c3ad6b]/15 text-[#8a7340]'
                          }`}>
                            {selectedCount}/{limit}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Items Grid */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Category title + limit bar */}
          {currentCategory && (() => {
            const limit = getCurrentCategoryLimit(currentCategory);
            const count = getCategorySelectedCount(currentCategory);
            return (
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold" style={{ color: 'hsl(45,100%,20%)' }}>{currentCategory}</h4>
                {limit !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((count / limit) * 100, 100)}%`,
                          backgroundColor: count >= limit ? '#ef4444' : '#c3ad6b'
                        }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${ count >= limit ? 'text-red-500' : 'text-[#8a7340]' }`}>
                      {count}/{limit}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {currentCategoryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">{foodType ? `No ${foodType} items in this category` : 'No items found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {currentCategoryItems.map(item => {
                const isSelected = selectedItems.includes(item.name);
                let isLimitReached = false;
                if (!isAdmin) {
                  const limit = getCurrentCategoryLimit(currentCategory);
                  const count = getCategorySelectedCount(currentCategory);
                  isLimitReached = limit !== null && count >= limit && !isSelected;
                }
                return (
                  <div
                    key={item.id}
                    onClick={() => !isLimitReached && handleSelectItem(item.name)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                      isLimitReached
                        ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#c3ad6b] border-[#c3ad6b] text-white shadow-sm cursor-pointer'
                        : 'bg-white border-gray-200 hover:border-[#c3ad6b] hover:bg-[#c3ad6b]/5 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-white border-white' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-[#c3ad6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-medium truncate ${ isSelected ? 'text-white' : isLimitReached ? 'text-gray-400' : 'text-gray-700' }`}>
                        {item.name}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteMenuItem(item.name); }}
                        className={`flex-shrink-0 ml-1 w-5 h-5 flex items-center justify-center rounded-md transition-colors ${
                          isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-400'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-white border-t border-[#e8dfc8] flex items-center justify-between">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-[#8a7340]">{selectedItems.length}</span> item{selectedItems.length !== 1 ? 's' : ''} selected
        </div>
        <button
          onClick={() => {
            if (onSave) onSave(selectedItems, buildCategorizedMenu(selectedItems));
            onClose();
          }}
          className="px-5 py-2 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default MenuSelector;