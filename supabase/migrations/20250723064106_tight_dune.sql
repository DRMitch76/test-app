/*
  # Add pet allergies, medication, and photo fields

  1. New Columns
    - `pet_allergies` (text) - Pet allergies information
    - `pet_medication` (text) - Pet medication information  
    - `pet_photo` (text) - Pet photo URL

  2. Updates
    - Add new columns to orders table with default empty values
    - Ensure backward compatibility with existing data
*/

-- Add new columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'pet_allergies'
  ) THEN
    ALTER TABLE orders ADD COLUMN pet_allergies text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'pet_medication'
  ) THEN
    ALTER TABLE orders ADD COLUMN pet_medication text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'pet_photo'
  ) THEN
    ALTER TABLE orders ADD COLUMN pet_photo text;
  END IF;
END $$;