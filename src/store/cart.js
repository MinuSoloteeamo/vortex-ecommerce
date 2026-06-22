import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (product, quantity = 1, variant = null) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => 
            item.id === product.id && item.variantId === (variant?.id || null)
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: variant ? (product.salePrice || product.price) + variant.priceOffset : (product.salePrice || product.price),
                originalPrice: product.price,
                image: variant?.images?.[0]?.url || product.images?.[0]?.url || '/images/placeholder.png',
                quantity,
                variantId: variant?.id || null,
                variantName: variant?.name || null,
              },
            ],
          };
        });

        // Đồng bộ lên DB sau khi thêm
        get().syncToServer();
      },

      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.id === productId && item.variantId === variantId)),
        }));
        get().syncToServer();
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            (item.id === productId && item.variantId === variantId) ? { ...item, quantity } : item
          ),
        }));
        get().syncToServer();
      },

      clearCart: () => {
        set({ items: [] });
        // Xóa trên server
        fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      // === SYNC FUNCTIONS ===

      // Đồng bộ giỏ hàng local lên server (gọi sau mỗi thao tác thêm/xóa/sửa)
      syncToServer: async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: get().items }),
          });
        } catch (e) {
          // Lỗi mạng — bỏ qua, dữ liệu local vẫn còn
        }
      },

      // Tải giỏ hàng từ server về local
      loadFromServer: async (mergeLocal = true) => {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const serverItems = await res.json();
            const localItems = get().items;

            if (Array.isArray(serverItems)) {
              if (mergeLocal) {
                const mergedMap = new Map();

                // 1. Đưa các item trên server vào map (key: id_variantId)
                serverItems.forEach((item) => {
                  const key = `${item.id}_${item.variantId || 'none'}`;
                  mergedMap.set(key, item);
                });

                // 2. Gộp các item local chưa đăng nhập vào (cộng dồn nếu trùng)
                localItems.forEach((item) => {
                  const key = `${item.id}_${item.variantId || 'none'}`;
                  if (mergedMap.has(key)) {
                    const existing = mergedMap.get(key);
                    mergedMap.set(key, {
                      ...existing,
                      quantity: existing.quantity + item.quantity,
                    });
                  } else {
                    mergedMap.set(key, item);
                  }
                });

                const finalItems = Array.from(mergedMap.values());
                set({ items: finalItems });

                // 3. Đẩy kết quả gộp lên server ngay lập tức để lưu trữ
                get().syncToServer();
              } else {
                // Chỉ đè dữ liệu từ server xuống (trường hợp reload trang)
                set({ items: serverItems });
              }
            }
          }
        } catch (e) {
          // Lỗi mạng — giữ nguyên local
        }
      },

      // Xóa giỏ local (gọi khi đăng xuất) — KHÔNG xóa trên server
      clearLocal: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'vortex-cart',
    }
  )
);
