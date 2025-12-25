-- Add type column to categories table for v1.2
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type text DEFAULT 'expense';

-- Update existing categories to have correct type based on budget
UPDATE public.categories SET type = CASE WHEN budget IS NULL THEN 'income' ELSE 'expense' END;

-- Update the handle_new_user function to include the new comprehensive categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default expense categories for new user (v1.2)
  INSERT INTO public.categories (user_id, name, icon, color, budget, type) VALUES
    (NEW.id, 'خانه', 'Home', 'hsl(25, 95%, 53%)', 5000000, 'expense'),
    (NEW.id, 'حمل و نقل', 'Car', 'hsl(199, 89%, 48%)', 3000000, 'expense'),
    (NEW.id, 'خوراک و نوشیدنی', 'UtensilsCrossed', 'hsl(38, 92%, 50%)', 4000000, 'expense'),
    (NEW.id, 'سرگرمی و تفریح', 'Gamepad2', 'hsl(262, 83%, 58%)', 2000000, 'expense'),
    (NEW.id, 'پوشاک و مد', 'ShoppingBag', 'hsl(330, 80%, 60%)', 2500000, 'expense'),
    (NEW.id, 'سلامت و بهداشت', 'Heart', 'hsl(0, 72%, 51%)', 2000000, 'expense'),
    (NEW.id, 'آموزش و توسعه فردی', 'Book', 'hsl(168, 76%, 42%)', 1500000, 'expense'),
    (NEW.id, 'بدهی و قسط', 'Receipt', 'hsl(0, 60%, 45%)', 3000000, 'expense'),
    (NEW.id, 'سایر هزینه‌ها', 'MoreHorizontal', 'hsl(220, 14%, 50%)', 1000000, 'expense'),
    -- Income categories
    (NEW.id, 'حقوق و دستمزد', 'Wallet', 'hsl(142, 71%, 45%)', NULL, 'income'),
    (NEW.id, 'سرمایه‌گذاری و پس‌انداز', 'TrendingUp', 'hsl(168, 76%, 42%)', NULL, 'income'),
    (NEW.id, 'سایر درآمدها', 'Gift', 'hsl(38, 92%, 50%)', NULL, 'income');
  
  RETURN NEW;
END;
$function$;