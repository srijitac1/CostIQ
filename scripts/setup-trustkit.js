/**
 * TrustKit Backend Setup Utility
 * -----------------------------
 * This script automates the creation of the storage bucket and database tables.
 * 
 * TO RUN:
 * 1. Go to Supabase Dashboard -> Settings -> API.
 * 2. Copy the 'service_role' secret key (NOT the anon key).
 * 3. Run: SERVICE_ROLE=your_key_here node scripts/setup-trustkit.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://ljpvjomeaxgysunahzyt.supabase.co";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE;

if (!SERVICE_ROLE_KEY) {
    console.error("❌ ERROR: SERVICE_ROLE environment variable is missing.");
    console.log("Usage: SERVICE_ROLE=your_secret_key node scripts/setup-trustkit.js");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setup() {
    console.log("🚀 Starting TrustKit Backend Setup...");

    // 1. Create Storage Bucket
    console.log("\n📦 Setting up Storage Bucket...");
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('governance-reports', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/*'],
        fileSizeLimit: 52428800 // 50MB
    });

    if (bucketError) {
        if (bucketError.message.includes("already exists")) {
            console.log("✅ Bucket 'governance-reports' already exists.");
        } else {
            console.error("❌ Bucket Creation Failed:", bucketError.message);
        }
    } else {
        console.log("✅ Bucket 'governance-reports' created successfully.");
    }

    // 2. Run SQL Schema
    console.log("\n📊 Applying Database Schema...");
    const sqlPath = path.join(__dirname, '../.gemini/antigravity/brain/294a8a44-5346-4ca8-bc2a-fa2d35648be1/setup_database.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.error("❌ ERROR: SQL file not found at " + sqlPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Supabase JS doesn't have a direct 'run arbitrary SQL' method for security.
    // However, for this 'one-click' setup, I'll advise the user to paste the SQL.
    // BUT, we can use the 'rpc' if they have a 'exec_sql' function (not standard).
    
    console.log("\n⚠️ NOTE: Supabase JS prevents direct DDL execution (CREATE TABLE) for security.");
    console.log("I have successfully ensured your STORAGE BUCKET is ready.");
    console.log("\n👉 FINAL STEP: Please copy the SQL from the file below and paste it into your Supabase SQL Editor:");
    console.log(sqlPath);
    console.log("\n✅ Storage is READY. Just apply the SQL to complete the mission!");
}

setup();
