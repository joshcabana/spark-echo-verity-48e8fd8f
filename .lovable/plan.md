

# Replace Placeholder Stripe Price IDs

Swap all 5 placeholder price IDs with the real Stripe IDs in 3 files:

| Placeholder | Real ID | Location |
|---|---|---|
| `price_starter_10` | `price_1T6rXLC1O032lUHcL3kvvio4` | create-checkout, stripe-webhook, TokenShop.tsx |
| `price_popular_15` | `price_1T6rYJC1O032lUHc3fO3j6R6` | create-checkout, stripe-webhook, TokenShop.tsx |
| `price_value_30` | `price_1T6rZ0C1O032lUHciuLq0TXN` | create-checkout, stripe-webhook, TokenShop.tsx |
| `price_pass_monthly` | `price_1T6rZjC1O032lUHcZiPWdPg7` | create-checkout, stripe-webhook, TokenShop.tsx |
| `price_pass_annual` | `price_1T6rawC1O032lUHcywgSq3ft` | create-checkout, stripe-webhook, TokenShop.tsx |

**Files to edit:**
1. `supabase/functions/create-checkout/index.ts` — PRICE_MAP keys
2. `supabase/functions/stripe-webhook/index.ts` — PRICE_ENTITLEMENTS keys
3. `src/pages/TokenShop.tsx` — `tokenPacks[].price_id` and the pass checkout `handleCheckout` calls

After updating, deploy the two edge functions to make the changes live.

