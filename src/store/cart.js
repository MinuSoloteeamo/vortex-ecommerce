import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === product.id);

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
                price: product.salePrice || product.price,
                originalPrice: product.price,
                image: product.images?.[0]?.url || '/images/placeholder.png',
                quantity,
              },
            ],
          };
        });

        // Đồng bộ lên DB sau khi thêm
        get().syncToServer();
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        get().syncToServer();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
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

                // 1. Đưa các item trên server vào map
                serverItems.forEach((item) => {
                  mergedMap.set(item.id, item);
                });

                // 2. Gộp các item local chưa đăng nhập vào (cộng dồn nếu trùng)
                localItems.forEach((item) => {
                  if (mergedMap.has(item.id)) {
                    const existing = mergedMap.get(item.id);
                    mergedMap.set(item.id, {
                      ...existing,
                      quantity: existing.quantity + item.quantity,
                    });
                  } else {
                    mergedMap.set(item.id, item);
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
