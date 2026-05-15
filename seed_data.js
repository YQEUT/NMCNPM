const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Lỗi: Thiếu biến môi trường REACT_APP_SUPABASE_URL hoặc REACT_APP_SUPABASE_ANON_KEY trong file .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
    console.log('🚀 Bắt đầu đẩy dữ liệu từ database.json lên Supabase...');

    try {
        const rawData = fs.readFileSync('database.json');
        const data = JSON.parse(rawData);
        const categories = data.category;

        // 1. Thu thập tất cả sản phẩm độc nhất
        const productsMap = new Map();
        const categoryRelations = [];

        Object.keys(categories).forEach(slug => {
            categories[slug].forEach(book => {
                // Lưu sản phẩm vào map để tránh trùng (sử dụng id từ JSON làm ID chính)
                if (!productsMap.has(book.id)) {
                    const { id, ...bookData } = book;
                    productsMap.set(book.id, { id, ...bookData });
                }
                // Lưu quan hệ sản phẩm - danh mục
                categoryRelations.push({ product_id: book.id, category_slug: slug });
            });
        });

        const productsToInsert = Array.from(productsMap.values());

        // 2. Chèn sản phẩm vào bảng 'products'
        console.log(`📦 Đang chèn ${productsToInsert.length} sản phẩm...`);
        const { error: pError } = await supabase.from('products').upsert(productsToInsert);
        if (pError) throw pError;

        // 3. Chèn quan hệ vào bảng 'product_categories'
        console.log(`🔗 Đang thiết lập danh mục cho từng sản phẩm...`);
        // Xóa dữ liệu cũ trong bảng trung gian để tránh trùng lặp khi chạy lại
        await supabase.from('product_categories').delete().neq('id', 0); 
        
        const { error: cError } = await supabase.from('product_categories').insert(categoryRelations);
        if (cError) throw cError;

        console.log('✅ THÀNH CÔNG! Dữ liệu đã được đồng bộ hoàn tất.');
        console.log('👉 Bây giờ bạn có thể kiểm tra trang web trên Vercel.');

    } catch (error) {
        console.error('❌ Lỗi hệ thống:', error.message);
    }
}

seedData();
