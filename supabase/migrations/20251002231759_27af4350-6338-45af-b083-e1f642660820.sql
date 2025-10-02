-- Create user roles system for secure permission management
-- Using existing user_role enum type

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create function to sync profile creation with user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, NEW.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile inserts
DROP TRIGGER IF EXISTS on_profile_role_created ON public.profiles;
CREATE TRIGGER on_profile_role_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Update get_user_role function to use user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = user_uuid
  LIMIT 1
$$;

-- Update is_admin function using new role system
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'admin')
$$;