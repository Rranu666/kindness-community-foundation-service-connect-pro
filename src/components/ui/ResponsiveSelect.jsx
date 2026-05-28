import React, { useState, useEffect } from 'react';
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { THEME as L } from '@/lib/theme';

export default function ResponsiveSelect({ value, onValueChange, placeholder, children, ...props }) {
  const [open, setOpen] = useState(false);
  const [isDrawer, setIsDrawer] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsDrawer(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isDrawer) {
    // Mobile: Bottom sheet
    const selectedLabel = children.find(c => c.props.value === value)?.props.children;
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            background: '#fff',
            borderColor: L.border,
            color: L.text,
            border: `1px solid ${L.border}`,
            fontSize: 14,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <span style={{ color: !value ? L.text3 : L.text }}>
            {selectedLabel || placeholder}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent style={{ background: L.bg2, borderColor: L.border }}>
            <DrawerHeader>
              <DrawerTitle style={{ color: L.text }}>{placeholder}</DrawerTitle>
            </DrawerHeader>
            <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '60vh' }}>
              {React.Children.map(children, (item) => (
                <button
                  key={item?.props?.value}
                  onClick={() => {
                    onValueChange(item?.props?.value);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    textAlign: 'left',
                    border: 'none',
                    background: value === item?.props?.value ? L.bg3 : 'transparent',
                    color: L.text,
                    fontSize: 14,
                    fontWeight: value === item?.props?.value ? 600 : 400,
                    cursor: 'pointer',
                    borderRadius: 8,
                    marginBottom: 6,
                  }}>
                  {item?.props?.children}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: Standard select dropdown
  return (
    <div style={{
      width: '100%',
      padding: '10px 12px',
      borderRadius: 10,
      background: '#fff',
      borderColor: L.border,
      color: L.text,
      border: `1px solid ${L.border}`,
      fontSize: 14,
      cursor: 'pointer',
    }}>
      {React.Children.map(children, (child) => {
        if (child?.props?.value === value) return child?.props?.children;
      }) || placeholder}
    </div>
  );
}