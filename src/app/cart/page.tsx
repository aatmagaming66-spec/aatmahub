"use client"

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, totalCount, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-in fade-in duration-700">
        <div className="h-24 w-24 bg-primary/10 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-headline font-black uppercase tracking-tighter mb-2">Your cart is empty</h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60 mb-8">
          Add some digital items to get started
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-secondary h-14 px-8 rounded-none font-black uppercase tracking-widest text-xs">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-8 animate-in fade-in duration-700">
      <header className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">Shopping Cart</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
              {totalCount} Item{totalCount !== 1 ? 's' : ''} in Cart
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={clearCart}
            className="text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 h-8 rounded-none"
          >
            Clear Cart
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="bg-card border-border rounded-none overflow-hidden shadow-xl">
            <CardContent className="p-4 flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-none overflow-hidden border border-border">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                        {item.region} {item.tabName && `• ${item.tabName}`}
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center bg-black/40 rounded-none border border-border p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center text-white hover:text-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center text-white hover:text-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">₹{item.price}</p>
                    <p className="text-sm font-black text-primary leading-none mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 pt-6">
        <div className="bg-card border border-border rounded-none p-6 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Subtotal</span>
            <span className="text-sm font-black">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Platform Fee</span>
            <span className="text-xs font-black text-green-400 uppercase tracking-widest">Free</span>
          </div>
          <div className="pt-4 border-t border-border flex justify-between items-end">
            <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Grand Total</span>
            <span className="text-3xl font-black text-primary tracking-tighter">₹{totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push('/checkout')}
            className="w-full h-16 bg-primary hover:bg-secondary text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 rounded-none transition-all group"
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full h-14 border-white/5 bg-transparent text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-white/5">
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}