"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { applyCoupon } from "@/actions/coupon/apply-coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";

export default function FinishOrderButton({ onCouponApplied }: { onCouponApplied: (c: any) => void }) {
  const finishOrderMutation = useFinishOrder();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Digite um código de cupom");

    try {
      setIsApplying(true);

      const coupon = await applyCoupon(couponCode);
      setAppliedCoupon(coupon);
      onCouponApplied(coupon);

      toast.success(`Cupom ${coupon.code} aplicado com sucesso!`);
    } catch (err: any) {
      toast.error(err.message || "Cupom inválido");
      setAppliedCoupon(null);
      onCouponApplied(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponApplied(null);
    toast("Cupom removido.");
  };

  const handleFinishOrder = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Stripe publishable key is not set");
    }

    const couponToSend = appliedCoupon?.code || undefined;
    const { orderId } = await finishOrderMutation.mutateAsync(couponToSend);

    const checkoutSession = await createCheckoutSession({
      orderId,
      couponCode: couponToSend,
    });

    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    if (!stripe) throw new Error("Failed to load Stripe");

    await stripe.redirectToCheckout({ sessionId: checkoutSession.id });
  };

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            placeholder="Digite seu cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="bg-white/5 text-white"
          />
          <Button onClick={handleApplyCoupon} disabled={isApplying}>
            {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-green-600/50 bg-green-600/10 px-3 py-2 text-green-400">
          <p className="text-sm">
            Cupom <strong>{appliedCoupon.code}</strong> aplicado (
            {appliedCoupon.type === "PERCENT"
              ? `${appliedCoupon.value}%`
              : `R$ ${(appliedCoupon.value / 100).toFixed(2)}`}
            )
          </p>
          <button
            onClick={handleRemoveCoupon}
            className="text-green-400 hover:text-red-400 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        className="w-full rounded-full cursor-pointer"
        size="lg"
        onClick={handleFinishOrder}
        disabled={finishOrderMutation.isPending}
      >
        {finishOrderMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Finalizar compra
      </Button>
    </div>
  );
}
