USE catering_db;

ALTER TABLE inquiries
  MODIFY food_package ENUM('silver','gold','aluminum','customize') NOT NULL;
