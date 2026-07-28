-- AlterTable
ALTER TABLE "credit_scores"
ADD COLUMN IF NOT EXISTS "autopay_enrolled" BOOLEAN,
ADD COLUMN IF NOT EXISTS "avg_days_late" DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS "avg_recharge_value" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "bill_on_time_ratio" DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS "emi_usage_rate" DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS "monthly_spend_volatility" DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS "order_freq_trend" DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS "phone_tenure_months" INTEGER,
ADD COLUMN IF NOT EXISTS "recharge_freq_per_month" DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS "recharge_gap_std" DECIMAL(8,2);

-- Drop columns only if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'age') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "age";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'creditHistory') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "creditHistory";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'debtToIncome') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "debtToIncome";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'employmentLength') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "employmentLength";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'homeOwnership') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "homeOwnership";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'income') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "income";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'loanAmount') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "loanAmount";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'loanPurpose') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "loanPurpose";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'loanTerm') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "loanTerm";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'numCreditLines') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "numCreditLines";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'numOpenAccounts') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "numOpenAccounts";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'credit_scores' AND column_name = 'totalDebt') THEN
    ALTER TABLE "credit_scores" DROP COLUMN "totalDebt";
  END IF;
END $$;

