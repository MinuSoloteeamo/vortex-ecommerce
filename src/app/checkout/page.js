'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import styles from './page.module.css';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    note: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryMethod, setDeliveryMethod] = useState('STANDARD'); // STANDARD or EXPRESS
  
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // Location API State
  const [locationData, setLocationData] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Address manual form state
  const [manualAddress, setManualAddress] = useState({
    province: '',
    district: '',
    ward: '',
    street: ''
  });

  useEffect(() => {
    setMounted(true);

    setIsLoadingLocation(true);
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(res => res.json())
      .then(data => {
        setLocationData(data);
        setIsLoadingLocation(false);
      })
      .catch(err => {
        console.error('Failed to load location data', err);
        setIsLoadingLocation(false);
      });
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (mounted && items.length === 0 && !isOrderSuccess) {
      router.push('/cart');
    }
  }, [mounted, items, router, isOrderSuccess]);

  // Fetch full profile to get VIP status and detailed address
  useEffect(() => {
    if (session?.user) {
      // Fetch Profile for VIP
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data);
        })
        .catch(err => console.error("Failed to load profile", err));

      // Fetch Addresses
      fetch('/api/user/addresses')
        .then(res => res.json())
        .then(data => {
          setAddresses(data);
          if (data.length > 0) {
            const def = data.find(a => a.isDefault) || data[0];
            setSelectedAddress(def);
            setFormData(prev => ({
              ...prev,
              recipientName: def.recipientName,
              recipientPhone: def.phoneNumber,
              shippingAddress: `${def.street}, ${def.ward}, ${def.district}, ${def.province}`
            }));
          } else {
            // Fallback to session name if no address
            setFormData(prev => ({ ...prev, recipientName: session.user.name || '' }));
          }
        })
        .catch(err => console.error("Failed to load addresses", err));
    }
  }, [session]);

  if (!mounted || status === 'loading' || (items.length === 0 && !isOrderSuccess)) {
    return <div className={styles.page} style={{ minHeight: '50vh' }}></div>;
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  // VIP Logic
  let vipDiscountPercent = 0;
  if (profile?.vipTier === 'SILVER') vipDiscountPercent = 2;
  if (profile?.vipTier === 'GOLD') vipDiscountPercent = 5;
  if (profile?.vipTier === 'DIAMOND') vipDiscountPercent = 10;
  
  const vipDiscountAmount = (subtotal * vipDiscountPercent) / 100;
  const subtotalAfterVip = subtotal - vipDiscountAmount;

  // Coupon Logic
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      couponDiscountAmount = Math.floor(subtotalAfterVip * (appliedCoupon.discountPercent / 100));
    } else if (appliedCoupon.discountAmount) {
      couponDiscountAmount = appliedCoupon.discountAmount;
    }
    if (couponDiscountAmount > subtotalAfterVip) {
      couponDiscountAmount = subtotalAfterVip;
    }
  }

  const totalAfterDiscounts = subtotalAfterVip - couponDiscountAmount;

  // Delivery Logic
  let baseShippingFee = totalAfterDiscounts >= 1000000 ? 0 : 30000;
  if (profile?.vipTier === 'GOLD' || profile?.vipTier === 'DIAMOND') {
    baseShippingFee = 0; // Free shipping for Gold/Diamond
  }

  const shippingFee = deliveryMethod === 'EXPRESS' ? 50000 : baseShippingFee;
  const totalAmount = totalAfterDiscounts + shippingFee;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, totalValue: subtotalAfterVip })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message);
      }
    } catch (err) {
      setCouponError('Lỗi kết nối');
    } finally {
      setIsCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let finalShippingAddress = formData.shippingAddress;
      
      // If manually inputting address, combine them
      if (!selectedAddress) {
        if (!manualAddress.street || !manualAddress.ward || !manualAddress.district || !manualAddress.province) {
          setError('Vui lòng chọn đầy đủ địa chỉ giao hàng');
          setIsLoading(false);
          return;
        }
        finalShippingAddress = `${manualAddress.street}, ${manualAddress.ward}, ${manualAddress.district}, ${manualAddress.province}`;
      }

      const orderData = {
        ...formData,
        shippingAddress: finalShippingAddress,
        paymentMethod,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.salePrice || item.price,
        })),
        couponCode: appliedCoupon?.code,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đã xảy ra lỗi khi đặt hàng');
      }

      // Success
      setIsOrderSuccess(true);
      clearCart();
      router.push(`/checkout/success/${data.orderId}`);
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={`${styles.title} heading-display text-gradient`}>Thanh toán an toàn</h1>
        
        <form className={styles.content} onSubmit={handleSubmit}>
          {/* Main Form Area */}
          <div className={styles.leftCol}>
            {error && <div className={styles.error}>{error}</div>}

            {/* Shipping Info */}
            <div className={`glass-card ${styles.section}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  <span className={styles.iconBox}>📍</span> Địa chỉ nhận hàng
                </h2>
                {addresses.length > 0 && (
                  <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 1rem', fontSize: '0.9rem' }} onClick={() => setShowAddressModal(true)}>
                    Thay đổi
                  </button>
                )}
              </div>
              
              {selectedAddress ? (
                <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {selectedAddress.recipientName} | {selectedAddress.phoneNumber}
                    {selectedAddress.isDefault && <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>Mặc định</span>}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                  </div>
                </div>
              ) : (
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="recipientName" className={styles.label}>Họ và tên *</label>
                    <input type="text" id="recipientName" name="recipientName" className="input-field" value={formData.recipientName} onChange={handleInputChange} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="recipientPhone" className={styles.label}>Số điện thoại *</label>
                    <input type="tel" id="recipientPhone" name="recipientPhone" className="input-field" value={formData.recipientPhone} onChange={handleInputChange} required />
                  </div>
                  
                  {isLoadingLocation ? (
                    <div style={{ gridColumn: '1 / -1', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu địa giới hành chính...</div>
                  ) : (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tỉnh / Thành phố *</label>
                        <select 
                          required 
                          className="input-field" 
                          value={manualAddress.province} 
                          onChange={e => setManualAddress({...manualAddress, province: e.target.value, district: '', ward: ''})}
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {locationData.map(p => (
                            <option key={p.code} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Quận / Huyện *</label>
                        <select 
                          required 
                          className="input-field" 
                          value={manualAddress.district} 
                          onChange={e => setManualAddress({...manualAddress, district: e.target.value, ward: ''})}
                          disabled={!manualAddress.province}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {(locationData.find(p => p.name === manualAddress.province)?.districts || []).map(d => (
                            <option key={d.code} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Phường / Xã *</label>
                        <select 
                          required 
                          className="input-field" 
                          value={manualAddress.ward} 
                          onChange={e => setManualAddress({...manualAddress, ward: e.target.value})}
                          disabled={!manualAddress.district}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {((locationData.find(p => p.name === manualAddress.province)?.districts || [])
                            .find(d => d.name === manualAddress.district)?.wards || []).map(w => (
                            <option key={w.code} value={w.name}>{w.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Số nhà, Tên đường *</label>
                        <input type="text" className="input-field" placeholder="Ví dụ: 123 Đường ABC" value={manualAddress.street} onChange={e => setManualAddress({...manualAddress, street: e.target.value})} required />
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="note" className={styles.label}>Ghi chú (Tùy chọn)</label>
                  <input
                    type="text"
                    id="note"
                    name="note"
                    className="input-field"
                    placeholder="Ví dụ: Giao hàng ngoài giờ hành chính..."
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className={`glass-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.iconBox}>🚚</span> Gói vận chuyển
              </h2>
              
              <div className={styles.gridCards}>
                <label className={`${styles.optionCard} ${deliveryMethod === 'STANDARD' ? styles.optionCardActive : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="STANDARD"
                    checked={deliveryMethod === 'STANDARD'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>Giao Tiêu Chuẩn</span>
                      <span className={styles.optionPrice}>{baseShippingFee === 0 ? 'Miễn phí' : '30.000₫'}</span>
                    </div>
                    <span className={styles.optionDesc}>Dự kiến nhận hàng trong 2-4 ngày</span>
                  </div>
                </label>

                <label className={`${styles.optionCard} ${deliveryMethod === 'EXPRESS' ? styles.optionCardActive : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="EXPRESS"
                    checked={deliveryMethod === 'EXPRESS'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>Giao Hỏa Tốc 2H</span>
                      <span className={styles.optionPrice}>50.000₫</span>
                    </div>
                    <span className={styles.optionDesc}>Nhận hàng ngay trong 2 giờ (Chỉ áp dụng nội thành)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className={`glass-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.iconBox}>💳</span> Phương thức thanh toán
              </h2>
              
              <div className={styles.gridCards}>
                <label className={`${styles.optionCard} ${paymentMethod === 'COD' ? styles.optionCardActive : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>💵 Tiền mặt (COD)</span>
                    </div>
                    <span className={styles.optionDesc}>Thanh toán khi nhận hàng</span>
                  </div>
                </label>

                <label className={`${styles.optionCard} ${paymentMethod === 'BANK_TRANSFER' ? styles.optionCardActive : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionHeader}>
                      <span className={styles.optionName}>🏦 Chuyển khoản</span>
                    </div>
                    <span className={styles.optionDesc}>Quét mã QR qua ứng dụng ngân hàng</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className={styles.summaryCol}>
            <div className={`glass-card ${styles.summaryCard}`}>
              <h2 className={styles.summaryTitle}>Đơn hàng ({items.length} sản phẩm)</h2>
              
              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.itemImage}>
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : '📦'}
                    </div>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>
                        <span style={{ color: 'var(--text-muted)' }}>SL: {item.quantity}</span>
                        <span style={{ fontWeight: '600' }}>{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className={styles.promoSection}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Nhập mã giảm giá..." 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {appliedCoupon ? (
                    <button type="button" className="btn btn-secondary" onClick={removeCoupon}>Xóa</button>
                  ) : (
                    <button type="button" className="btn btn-secondary" onClick={handleApplyCoupon} disabled={isCouponLoading || !couponCode}>
                      {isCouponLoading ? '...' : 'Áp dụng'}
                    </button>
                  )}
                </div>
                {couponError && <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>{couponError}</div>}
                {appliedCoupon && <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: '4px' }}>Đã áp dụng mã {appliedCoupon.code}</div>}
              </div>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Tạm tính</span>
                  <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
                </div>
                
                {profile?.vipTier && profile.vipTier !== 'MEMBER' && (
                  <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                    <span className={styles.summaryLabel}>💎 Ưu đãi VIP ({profile.vipTier} - {vipDiscountPercent}%)</span>
                    <span className={styles.summaryValue}>- {formatPrice(vipDiscountAmount)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className={`${styles.summaryRow} ${styles.discountRow}`} style={{ color: 'var(--color-success)' }}>
                    <span className={styles.summaryLabel}>🎟️ Mã giảm giá ({appliedCoupon.code})</span>
                    <span className={styles.summaryValue}>- {formatPrice(couponDiscountAmount)}</span>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Phí vận chuyển</span>
                  <span className={styles.summaryValue}>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                </div>
              </div>
              
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Tổng thanh toán</span>
                <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(totalAmount)}</span>
              </div>
              
              <button 
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={isLoading}
              >
                {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
              </button>

              <div className={styles.trustBadges}>
                <div className={styles.badge}><span style={{ fontSize: '1.2rem' }}>🔒</span> Bảo mật 100%</div>
                <div className={styles.badge}><span style={{ fontSize: '1.2rem' }}>🛡️</span> Cam kết chính hãng</div>
                <div className={styles.badge}><span style={{ fontSize: '1.2rem' }}>🔄</span> Trả hàng 7 ngày</div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--border-subtle)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Chọn Địa Chỉ Giao Hàng</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {addresses.map(addr => (
                <div 
                  key={addr.id} 
                  style={{ 
                    padding: '1rem', border: `1px solid ${selectedAddress?.id === addr.id ? 'var(--color-primary)' : 'var(--border-default)'}`, 
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedAddress?.id === addr.id ? 'var(--color-primary-dim)' : 'var(--bg-body)' 
                  }}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setFormData(prev => ({
                      ...prev,
                      recipientName: addr.recipientName,
                      recipientPhone: addr.phoneNumber,
                      shippingAddress: `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`
                    }));
                    setShowAddressModal(false);
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {addr.recipientName} | {addr.phoneNumber} 
                    {addr.isDefault && <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--color-primary)' }}>[Mặc định]</span>}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
