'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToastStore } from '@/store/toast';

const COLUMNS = [
  { id: 'PENDING', title: '⏳ Chờ xử lý' },
  { id: 'PROCESSING', title: '📦 Đang chuẩn bị' },
  { id: 'SHIPPING', title: '🚚 Đang giao hàng' },
];

const STATUS_FLOW = {
  'PENDING': ['PROCESSING', 'CANCELLED'],
  'PROCESSING': ['SHIPPING', 'CANCELLED'],
  'SHIPPING': ['DELIVERED', 'FAILED_DELIVERY', 'CANCELLED'],
};

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

export default function OrderKanbanBoard({ initialOrders }) {
  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState({});

  useEffect(() => {
    setMounted(true);
    // Initialize columns
    const initialCols = {
      'PENDING': [],
      'PROCESSING': [],
      'SHIPPING': []
    };
    
    initialOrders.forEach(order => {
      if (initialCols[order.status]) {
        initialCols[order.status].push(order);
      }
    });
    
    setColumns(initialCols);
  }, [initialOrders]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area or in the same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const currentStatus = source.droppableId;
    const newStatus = destination.droppableId;

    // Strict validation
    if (newStatus !== currentStatus) {
      const allowedNext = STATUS_FLOW[currentStatus] || [];
      if (!allowedNext.includes(newStatus)) {
        useToastStore.getState().error('Không thể nhảy cóc! Vui lòng thực hiện đúng trình tự.');
        return;
      }
    }

    // Optimistic UI update
    const sourceCol = [...columns[currentStatus]];
    const destCol = [...columns[newStatus]];
    const [movedOrder] = sourceCol.splice(source.index, 1);
    
    movedOrder.status = newStatus; // Update internal status
    destCol.splice(destination.index, 0, movedOrder);

    setColumns({
      ...columns,
      [currentStatus]: sourceCol,
      [newStatus]: destCol,
    });

    // API Call
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: movedOrder.id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Cập nhật thất bại');
      useToastStore.getState().success('Cập nhật trạng thái thành công');
    } catch (error) {
      // Revert UI on failure
      const revertedSource = [...columns[currentStatus]];
      const revertedDest = [...columns[newStatus]];
      
      const [revertOrder] = revertedDest.splice(destination.index, 1);
      revertOrder.status = currentStatus;
      revertedSource.splice(source.index, 0, revertOrder);
      
      setColumns({
        ...columns,
        [currentStatus]: revertedSource,
        [newStatus]: revertedDest,
      });
      useToastStore.getState().error('Có lỗi xảy ra, đã hoàn tác!');
    }
  };

  if (!mounted) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải Bảng Kéo Thả...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{ flex: '0 0 320px', background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{col.title}</span>
              <span style={{ background: 'var(--bg-body)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                {columns[col.id]?.length || 0}
              </span>
            </h3>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: '200px',
                    transition: 'background-color 0.2s',
                    backgroundColor: snapshot.isDraggingOver ? 'var(--bg-body)' : 'transparent',
                    borderRadius: '8px'
                  }}
                >
                  {columns[col.id]?.map((order, index) => (
                    <Draggable key={order.id} draggableId={order.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            padding: '12px',
                            margin: '0 0 12px 0',
                            backgroundColor: snapshot.isDragging ? 'var(--bg-body)' : 'var(--bg-card)',
                            boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-primary)' }}>{order.orderNumber}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                            👤 {order.recipientName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            📍 {order.shippingAddress}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px', marginTop: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatPrice(order.totalAmount)}</span>
                            <span style={{ fontSize: '11px', background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px' }}>{order.paymentMethod}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
