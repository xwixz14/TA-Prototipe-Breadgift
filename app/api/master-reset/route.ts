import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🚀 Starting Master Reset...");

    // 1. Restore Categories if missing
    await db.query("INSERT IGNORE INTO categories (id, name) VALUES (1, 'Roti Isi'), (2, 'Roti Tawar'), (3, 'Roti Bakar')");

    // 2. Restore Basic Products if missing
    const products = [
      { name: 'Roti Coklat', cat_id: 1, price: 4000, stock: 120, img: '/assets/products/roti_coklat.png' },
      { name: 'Roti Keju', cat_id: 1, price: 4000, stock: 33, img: '/assets/products/roti_keju.png' },
      { name: 'Roti Nanas', cat_id: 1, price: 4000, stock: 32, img: '/assets/products/roti_nanas.png' },
      { name: 'Roti Tawar', cat_id: 2, price: 7000, stock: 120, img: '/assets/products/roti_tawar.png' },
    ];

    for (const p of products) {
      await db.query(
        "INSERT IGNORE INTO products (name, category_id, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
        [p.name, p.cat_id, p.price, p.stock, p.img]
      );
    }

    // 3. Clean and Restore Articles (CMS)
    await db.query("DELETE FROM bread_info");
    const articles = [
      {
        title: 'Koleksi Roti Artisan BreadGift',
        content: 'Eksplorasi seluruh koleksi roti terbaik kami, dari Roti Manis hingga Roti Tawar premium yang dibuat dengan bahan-bahan pilihan berkualitas tinggi.',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200',
        category: 'Katalog'
      },
      {
        title: 'Tips Menyimpan Roti Agar Tetap Lembut Lebih Lama',
        content: 'Roti segar paling enak dinikmati saat hari pertama. Namun, jika Anda ingin menyimpannya untuk besok, pastikan roti sudah benar-benar dingin sebelum dimasukkan ke dalam plastik kedap udara. Jangan menyimpan roti di dalam kulkas karena udara dingin justru akan mempercepat proses kristalisasi pati yang membuat roti jadi cepat keras.',
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1200',
        category: 'Tips & Trik'
      },
      {
        title: 'Mengenal Perbedaan Tepung Terigu untuk Roti',
        content: 'Kunci utama roti yang empuk dan berserat bagus adalah penggunaan tepung terigu protein tinggi. Tepung jenis ini memiliki kandungan gluten yang kuat untuk memerangkap gas yang dihasilkan oleh ragi. Pastikan selalu memilih tepung dengan label "Protein Tinggi" untuk hasil produksi roti yang maksimal di dapur Anda.',
        image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=1200',
        category: 'Wawasan Roti'
      },
      {
        title: 'Rahasia Roti Mengembang: Peran Penting Ragi',
        content: 'Ragi adalah mikroorganisme hidup yang bertanggung jawab atas proses fermentasi pada adonan roti. Saat bertemu dengan air dan gula dalam adonan, ragi akan menghasilkan gas karbon dioksida. Gas inilah yang membuat adonan mengembang dan menciptakan rongga-rongga udara yang lembut di dalam roti.',
        image_url: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?q=80&w=1200',
        category: 'Sains Roti'
      }
    ];

    for (const article of articles) {
      await db.query(
        "INSERT INTO bread_info (title, content, image_url, category) VALUES (?, ?, ?, ?)",
        [article.title, article.content, article.image_url, article.category]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "🎉 MASTER RESET BERHASIL! Menu Roti, Katalog, dan Artikel Berita sudah dikembalikan ke kondisi terbaik. Silakan cek website Anda!" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
