-- Add subcategories column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS subcategories text[] DEFAULT '{}';

-- Update the handle_new_user function with new comprehensive categories
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
  
  -- Create comprehensive categories with subcategories for new user
  INSERT INTO public.categories (user_id, name, icon, color, budget, type, subcategories) VALUES
    -- Expense Categories
    (NEW.id, 'خوراک و خرید روزمره', 'ShoppingCart', 'hsl(38, 92%, 50%)', 5000000, 'expense', 
     ARRAY['خرید سوپرمارکت', 'رستوران و کافی‌شاپ', 'خوراک بیرون‌بر', 'خوراک مهمانی']),
    
    (NEW.id, 'خانه و زندگی', 'Home', 'hsl(25, 95%, 53%)', 8000000, 'expense', 
     ARRAY['اجاره / شارژ ساختمان', 'قبوض', 'لوازم خانگی', 'تعمیرات منزل']),
    
    (NEW.id, 'حمل و نقل', 'Car', 'hsl(199, 89%, 48%)', 3000000, 'expense', 
     ARRAY['بنزین', 'تاکسی / اسنپ', 'سرویس خودرو', 'اقساط خودرو']),
    
    (NEW.id, 'سلامت و درمان', 'Heart', 'hsl(0, 72%, 51%)', 2000000, 'expense', 
     ARRAY['دکتر و ویزیت', 'دارو', 'آزمایش', 'بیمه درمانی']),
    
    (NEW.id, 'خرید شخصی و پوشاک', 'ShoppingBag', 'hsl(330, 80%, 60%)', 2500000, 'expense', 
     ARRAY['لباس', 'کفش', 'لوازم آرایشی', 'اکسسوری']),
    
    (NEW.id, 'سرگرمی و تفریح', 'Gamepad2', 'hsl(262, 83%, 58%)', 2000000, 'expense', 
     ARRAY['سینما / تئاتر', 'سفر', 'کافی‌شاپ و دورهمی', 'سرگرمی خانگی']),
    
    (NEW.id, 'اشتراک‌ها و پرداخت ماهانه', 'CreditCard', 'hsl(210, 80%, 55%)', 1500000, 'expense', 
     ARRAY['اشتراک آنلاین', 'اینترنت و تلفن', 'عضویت باشگاه']),
    
    (NEW.id, 'مالی و بانک', 'Landmark', 'hsl(220, 70%, 45%)', 5000000, 'expense', 
     ARRAY['اقساط و بدهی', 'وام', 'کارمزد انتقال', 'سرمایه‌گذاری']),
    
    (NEW.id, 'خانواده و روابط', 'Users', 'hsl(340, 75%, 55%)', 2000000, 'expense', 
     ARRAY['هدیه', 'کمک به خانواده', 'هزینه فرزند']),
    
    (NEW.id, 'آموزش و رشد فردی', 'GraduationCap', 'hsl(168, 76%, 42%)', 1500000, 'expense', 
     ARRAY['دوره آموزشی', 'کتاب', 'سمینار و وبینار']),
    
    (NEW.id, 'سایر هزینه‌ها', 'MoreHorizontal', 'hsl(220, 14%, 50%)', 1000000, 'expense', 
     ARRAY['متفرقه']),
    
    -- Income Categories
    (NEW.id, 'حقوق و درآمد شغلی', 'Wallet', 'hsl(142, 71%, 45%)', NULL, 'income', 
     ARRAY['حقوق ماهانه', 'درآمد پروژه', 'پاداش']),
    
    (NEW.id, 'کار و پول‌سازی', 'Briefcase', 'hsl(160, 70%, 40%)', NULL, 'income', 
     ARRAY['درآمد پروژه', 'تجهیزات کاری', 'نرم‌افزار کاری', 'تبلیغات']),
    
    (NEW.id, 'سرمایه‌گذاری', 'TrendingUp', 'hsl(168, 76%, 42%)', NULL, 'income', 
     ARRAY['سود سهام', 'سود بانکی', 'کریپتو', 'طلا و ارز']),
    
    (NEW.id, 'سایر درآمدها', 'Gift', 'hsl(38, 92%, 50%)', NULL, 'income', 
     ARRAY['هدیه', 'فروش اجناس', 'متفرقه']);
  
  RETURN NEW;
END;
$function$;