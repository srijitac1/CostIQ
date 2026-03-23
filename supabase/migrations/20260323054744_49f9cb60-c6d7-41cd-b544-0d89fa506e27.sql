
-- Anomalies table
CREATE TABLE public.anomalies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  fuzzy_score DECIMAL(3,2) NOT NULL,
  factors JSONB NOT NULL,
  status TEXT DEFAULT 'detected',
  resource_id TEXT,
  amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent actions table
CREATE TABLE public.agent_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anomaly_id UUID REFERENCES public.anomalies(id),
  action_type TEXT NOT NULL,
  auto_executed BOOLEAN DEFAULT FALSE,
  result JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fuzzy configuration table
CREATE TABLE public.fuzzy_config (
  id INT PRIMARY KEY,
  metric_type TEXT NOT NULL,
  membership_params JSONB NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuzzy_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read anomalies
CREATE POLICY "Authenticated users can read anomalies" ON public.anomalies
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update anomaly status
CREATE POLICY "Authenticated users can update anomalies" ON public.anomalies
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to read agent actions
CREATE POLICY "Authenticated users can read agent_actions" ON public.agent_actions
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert agent actions
CREATE POLICY "Authenticated users can insert agent_actions" ON public.agent_actions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to read fuzzy config
CREATE POLICY "Authenticated users can read fuzzy_config" ON public.fuzzy_config
  FOR SELECT TO authenticated USING (true);
