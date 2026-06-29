PRD Aplikasi Manajemen Stok dan Penjualan Bahan Baku Usaha Kebab
1. Ringkasan Produk
Aplikasi ini digunakan untuk mengelola stok bahan baku usaha kebab yang tersebar di 4 lokasi penyimpanan, yaitu:
1.	Gudang Utama
2.	Kios Wadas
3.	Kios Ciherang
4.	Kios Bubulak
Sistem mencatat aktivitas utama usaha, yaitu:
1.	Belanja bahan baku ke Gudang Utama berdasarkan harga beli.
2.	Distribusi bahan baku dari Gudang Utama ke masing-masing kios.
3.	Penjualan/pengeluaran bahan baku di setiap kios berdasarkan harga jual.
4.	Rekap hasil penjualan kios.
5.	Pencatatan biaya operasional.
6.	Perhitungan laba kotor dan estimasi laba bersih.
Aplikasi ini bertujuan untuk membantu pemilik usaha memantau stok, mengontrol distribusi bahan baku, mencatat penjualan, mengelola biaya, serta melihat laporan usaha secara lebih cepat dan akurat.
________________________________________
2. Tujuan Aplikasi
Tujuan utama aplikasi:
1.	Mencatat seluruh data bahan baku usaha kebab.
2.	Mengelola stok bahan baku di Gudang Utama dan 3 kios.
3.	Mencatat pembelian bahan baku ke Gudang Utama.
4.	Mencatat distribusi bahan baku dari Gudang Utama ke kios.
5.	Mencatat penjualan/pengeluaran bahan baku di setiap kios.
6.	Mengurangi stok otomatis berdasarkan transaksi.
7.	Menghitung penggunaan PACK KEBAB dan PACK BURGER secara otomatis.
8.	Menampilkan stok aktual per lokasi.
9.	Menampilkan status stok dengan warna angka stok.
10.	Mencatat biaya operasional usaha.
11.	Mencatat rekap hasil penjualan kios.
12.	Menghitung laba kotor dan estimasi laba bersih.
13.	Menyediakan laporan stok, belanja, distribusi, penjualan, biaya, dan laba.
________________________________________
3. Ruang Lingkup Sistem
Aplikasi mencakup modul berikut:
1.	Login dan Manajemen User
2.	Master Data Bahan Baku
3.	Master Data Lokasi
4.	Master Minimum Stok per Lokasi
5.	Belanja Bahan Baku ke Gudang Utama
6.	Distribusi Bahan Baku dari Gudang Utama ke Kios
7.	Penjualan/Pengeluaran Bahan Baku di Kios
8.	Pengeluaran PACK Otomatis
9.	Rekap Hasil Penjualan
10.	Biaya Lain-Lain / Biaya Operasional
11.	Monitoring Stok
12.	Laporan
13.	Dashboard
14.	Histori / Log Aktivitas
________________________________________
4. Lokasi Penyimpanan Stok
Sistem memiliki 4 lokasi stok utama.
No	Lokasi	Keterangan
1	Gudang Utama	Tempat utama pembelian dan penyimpanan awal bahan baku
2	Kios Wadas	Bunderan Wadas
3	Kios Ciherang	Jalan Ciherang
4	Kios Bubulak	Dusun Bubulak
Setiap bahan baku harus dapat dipantau jumlah stoknya di masing-masing lokasi.
________________________________________
5. Modul Master Data Bahan Baku
Modul ini digunakan untuk mencatat daftar bahan baku yang digunakan dalam usaha kebab.
Nama bahan baku sudah tersedia di dalam sistem dan menjadi patokan utama untuk seluruh transaksi belanja, distribusi, stok, dan penjualan/pengeluaran bahan baku.
User tidak perlu mengetik nama bahan baku secara manual saat transaksi. User cukup memilih bahan baku dari daftar yang sudah tersedia.
________________________________________
5.1 Field Data Bahan Baku
No	Nama Field	Keterangan
1	Kode Bahan Baku	Kode unik bahan baku yang dibuat otomatis oleh sistem
2	Nama Bahan Baku	Nama bahan baku dari master data
3	Harga Beli	Harga beli patokan bahan baku
4	Harga Jual	Harga jual patokan bahan baku
5	Status	Aktif atau Tidak Aktif
________________________________________
5.2 Master Data Awal Bahan Baku
No	Nama Bahan Baku	Harga Beli	Harga Jual
1	TORTILLA BESAR	1.450	15.000
2	TORTILLA SEDANG	1.350	12.000
3	ROTI BURGER	1.750	10.000
4	MOZZARELLA	4.250	5.000
5	CHICKEN BULAT	2.500	5.000
6	TELOR	2.500	4.000
7	KEJU	1.500	3.000
8	SOSIS	1.500	3.000
9	PATTIES BURGER	3.800	-
10	LETTUCE	13.000	-
11	MAYONESE	25.000	-
12	SAOS CABE	16.000	-
13	SAOS TOMAT	16.000	-
14	PLASTIK KEBAB	5.000	-
15	PLASTIK BURGER	10.000	-
16	CUTTER	10.000	-
17	TISSUE	7.500	-
18	MINYAK SAYUR	34.000	-
19	GAS	20.000	-
20	DAGING KEBAB	140.000	-
21	PACK KEBAB	660	-
22	PACK BURGER	540	-
23	PLASTIK BESAR	10.000	-
24	KERTAS KEBAB	57.000	-
25	MENTEGA	250.000	-
26	SARUNG TANGAN	7.000	-
________________________________________
5.3 Ketentuan Master Data Bahan Baku
1.	Semua nama bahan baku pada tabel master harus tersedia otomatis di aplikasi.
2.	Nama bahan baku menjadi patokan utama dan digunakan di semua transaksi.
3.	User tidak boleh mengetik nama bahan baku bebas saat transaksi.
4.	Sistem harus mencegah duplikasi nama bahan baku.
5.	Harga beli digunakan sebagai harga default saat transaksi belanja bahan baku.
6.	Harga beli dapat diubah saat transaksi belanja jika harga aktual berbeda.
7.	Harga jual digunakan sebagai harga default saat transaksi penjualan/pengeluaran bahan baku di kios.
8.	Bahan baku dengan Harga Jual tanda “-” berarti tidak dijual langsung atau belum memiliki harga jual.
9.	Bahan baku dengan Harga Jual “-” tetap dapat digunakan untuk belanja, distribusi, dan monitoring stok.
10.	Admin dapat mengubah Harga Beli dan Harga Jual.
11.	Operator tidak dapat mengubah Harga Jual.
12.	Setiap perubahan Harga Beli dan Harga Jual harus tercatat di histori/log sistem.
________________________________________
6. Master Minimum Stok per Lokasi
Sistem harus memiliki data minimum stok untuk masing-masing bahan baku di setiap lokasi penyimpanan.
Minimum stok digunakan sebagai patokan sistem untuk memberi peringatan jika stok bahan baku di suatu lokasi sudah rendah atau habis.
________________________________________
6.1 Daftar Minimum Stok per Lokasi
No	Nama Bahan Baku	Gudang Utama	Kios Wadas	Kios Ciherang	Kios Bubulak
1	TORTILLA BESAR	80	60	10	10
2	TORTILLA SEDANG	60	40	10	10
3	ROTI BURGER	25	15	5	5
4	MOZZARELLA	12	8	2	2
5	CHICKEN BULAT	25	15	5	5
6	TELOR	14	10	2	2
7	KEJU	15	5	5	5
8	SOSIS	30	20	5	5
9	PATTIES BURGER	20	10	5	5
10	LETTUCE	14	10	2	2
11	MAYONESE	5	3	1	1
12	SAOS CABE	4	2	1	1
13	SAOS TOMAT	4	2	1	1
14	PLASTIK KEBAB	3	1	1	1
15	PLASTIK BURGER	3	1	1	1
16	CUTTER	3	1	1	1
17	TISSUE	3	1	1	1
18	MINYAK SAYUR	3	1	1	1
19	GAS	5	3	1	1
20	DAGING KEBAB	5	3	1	1
21	PACK KEBAB	140	100	20	20
22	PACK BURGER	25	15	5	5
23	PLASTIK BESAR	3	1	1	1
24	KERTAS KEBAB	-	-	-	-
25	MENTEGA	-	-	-	-
26	SARUNG TANGAN	-	-	-	-
________________________________________
6.2 Ketentuan Minimum Stok
1.	Minimum stok ditentukan berdasarkan kombinasi bahan baku dan lokasi.
2.	Setiap bahan baku dapat memiliki minimum stok berbeda di setiap lokasi.
3.	Minimum stok digunakan sebagai batas peringatan stok rendah.
4.	Jika stok aktual lebih besar dari minimum stok, status stok adalah Aman.
5.	Jika stok aktual sama dengan atau lebih kecil dari minimum stok, status stok adalah Hampir Habis.
6.	Jika stok aktual bernilai 0, status stok adalah Habis.
7.	Jika minimum stok bernilai “-”, bahan baku tersebut tidak memiliki batas minimum stok di lokasi tersebut.
8.	Bahan baku dengan minimum stok “-” tetap dapat dicatat dalam belanja, distribusi, penjualan/pengeluaran, dan monitoring stok.
9.	Admin dapat mengubah minimum stok per lokasi.
10.	Operator tidak dapat mengubah minimum stok.
11.	Setiap perubahan minimum stok harus tercatat dalam histori/log sistem.
________________________________________
7. Modul Belanja Bahan Baku Gudang Utama
Modul ini digunakan untuk mencatat aktivitas pembelian bahan baku dari supplier ke Gudang Utama.
________________________________________
7.1 Field Belanja Bahan Baku
No	Nama Field	Keterangan
1	Nomor Transaksi Belanja	Nomor transaksi otomatis
2	Tanggal Belanja	Tanggal pembelian bahan baku
3	Nama Bahan Baku	Bahan baku yang dibeli
4	Jumlah Beli	Jumlah bahan baku yang dibeli
5	Harga Beli	Harga beli per satuan
6	Total Harga Beli	Jumlah beli dikali harga beli
7	Ongkos Kirim	Biaya pengiriman saat belanja
8	Total Belanja Bahan	Total harga bahan baku tanpa ongkos kirim
9	Total Belanja Akhir	Total belanja bahan baku ditambah ongkos kirim
10	Petugas	Admin atau Operator yang mencatat transaksi
11	Catatan	Keterangan tambahan jika ada
________________________________________
7.2 Rumus Belanja
Total Harga Beli = Jumlah Beli × Harga Beli
Total Belanja Bahan = Total seluruh harga beli bahan baku
Total Belanja Akhir = Total Belanja Bahan + Ongkos Kirim
________________________________________
7.3 Fungsi Modul Belanja
1.	Mencatat pembelian bahan baku.
2.	Menambah stok bahan baku di Gudang Utama secara otomatis.
3.	Menyimpan riwayat harga beli bahan baku.
4.	Menghitung total modal pembelian bahan baku.
5.	Mencatat Ongkos Kirim jika ada.
6.	Otomatis mencatat Ongkos Kirim sebagai Biaya Lain-Lain.
7.	Menampilkan laporan belanja berdasarkan tanggal dan bahan baku.
________________________________________
7.4 Aturan Ongkos Kirim
1.	Ongkos Kirim diinput saat transaksi belanja bahan baku.
2.	Ongkos Kirim tidak menambah stok bahan baku.
3.	Ongkos Kirim otomatis masuk ke Modul Biaya Lain-Lain dengan jenis Ongkos Kirim.
4.	Ongkos Kirim menjadi pengurang laba kotor pada laporan laba.
5.	Jika tidak ada ongkos kirim, nilai Ongkos Kirim dapat diisi 0.
________________________________________
8. Modul Distribusi Bahan Baku
Modul ini digunakan untuk mencatat pengiriman bahan baku dari Gudang Utama ke Kios Wadas, Kios Ciherang, atau Kios Bubulak.
________________________________________
8.1 Field Distribusi Bahan Baku
No	Nama Field	Keterangan
1	Nomor Distribusi	Nomor distribusi otomatis
2	Tanggal Distribusi	Tanggal pengiriman bahan baku
3	Lokasi Asal	Gudang Utama
4	Lokasi Tujuan	Kios Wadas, Kios Ciherang, atau Kios Bubulak
5	Nama Bahan Baku	Bahan baku yang didistribusikan
6	Jumlah Distribusi	Jumlah bahan baku yang dikirim
7	Petugas	Admin atau Operator yang mencatat transaksi
8	Catatan	Keterangan tambahan jika ada
________________________________________
8.2 Fungsi Modul Distribusi
1.	Mencatat distribusi bahan baku dari Gudang Utama ke kios.
2.	Mengurangi stok bahan baku di Gudang Utama.
3.	Menambah stok bahan baku di kios tujuan.
4.	Mencegah distribusi jika stok Gudang Utama tidak mencukupi.
5.	Menyimpan riwayat distribusi per kios.
________________________________________
8.3 Aturan Sistem Distribusi
1.	Distribusi hanya dapat dilakukan dari Gudang Utama ke kios.
2.	Jumlah distribusi tidak boleh melebihi stok tersedia di Gudang Utama.
3.	Setelah distribusi disimpan, stok Gudang Utama berkurang.
4.	Setelah distribusi disimpan, stok kios tujuan bertambah.
5.	Transaksi distribusi yang sudah tersimpan hanya dapat diedit oleh Admin.
6.	Operator tidak dapat menghapus transaksi distribusi.
________________________________________
9. Modul Penjualan/Pengeluaran Bahan Baku di Kios
Modul ini digunakan untuk mencatat aktivitas penjualan atau pengeluaran bahan baku di masing-masing kios dengan menggunakan harga jual.
________________________________________
9.1 Field Penjualan/Pengeluaran Bahan Baku
No	Nama Field	Keterangan
1	Nomor Transaksi Penjualan	Nomor transaksi otomatis
2	Tanggal Transaksi	Tanggal penjualan/pengeluaran bahan baku
3	Lokasi Kios	Kios Wadas, Kios Ciherang, atau Kios Bubulak
4	Nama Bahan Baku	Bahan baku yang dijual/digunakan
5	Jumlah Keluar	Jumlah bahan baku yang keluar
6	Harga Jual	Harga jual dari master data
7	Total Harga Jual	Jumlah keluar dikali harga jual
8	Jenis Input	Manual atau Otomatis Sistem
9	Petugas	Admin atau Operator yang mencatat transaksi
10	Catatan	Keterangan tambahan jika ada
________________________________________
9.2 Rumus Penjualan
Total Harga Jual = Jumlah Keluar × Harga Jual
________________________________________
9.3 Fungsi Modul Penjualan
1.	Mencatat penjualan/pengeluaran bahan baku di tiap kios.
2.	Mengurangi stok bahan baku di kios terkait.
3.	Menghitung total nilai penjualan bahan baku.
4.	Menampilkan laporan penjualan per kios.
5.	Menampilkan riwayat penjualan bahan baku berdasarkan tanggal dan lokasi.
6.	Menghitung PACK KEBAB dan PACK BURGER secara otomatis.
________________________________________
9.4 Aturan Sistem Penjualan
1.	Penjualan hanya bisa dilakukan dari lokasi kios.
2.	Setiap transaksi penjualan akan mengurangi stok kios.
3.	Jumlah bahan baku yang dijual tidak boleh melebihi stok tersedia di kios.
4.	Harga jual otomatis mengambil dari master bahan baku.
5.	Operator tidak dapat mengubah Harga Jual.
6.	Transaksi yang sudah tersimpan tidak boleh dihapus langsung oleh Operator.
7.	Koreksi transaksi hanya dapat dilakukan oleh Admin.
8.	Bahan baku dengan Harga Jual “-” tidak dihitung sebagai omzet penjualan.
________________________________________
10. Ketentuan Otomatis Pengeluaran PACK pada Penjualan Kios
Pada transaksi penjualan/pengeluaran bahan baku di setiap kios, sistem harus menghitung pengeluaran PACK KEBAB dan PACK BURGER secara otomatis berdasarkan jumlah penjualan bahan utama.
Tujuan fitur ini adalah agar Admin atau Operator tidak perlu menginput jumlah penjualan/pengeluaran PACK KEBAB dan PACK BURGER secara manual.
________________________________________
10.1 Rumus Otomatis PACK
Bahan Baku Otomatis	Mengikuti Penjualan	Rumus Jumlah Keluar
PACK KEBAB	TORTILLA BESAR + TORTILLA SEDANG	Jumlah PACK KEBAB = Jumlah TORTILLA BESAR + Jumlah TORTILLA SEDANG
PACK BURGER	ROTI BURGER	Jumlah PACK BURGER = Jumlah ROTI BURGER
________________________________________
10.2 Contoh Perhitungan
Jika pada Kios Wadas terjadi penjualan:
Bahan Baku	Jumlah Keluar
TORTILLA BESAR	10
TORTILLA SEDANG	5
ROTI BURGER	8
Maka sistem otomatis menghitung:
Bahan Baku Otomatis	Jumlah Keluar Otomatis
PACK KEBAB	15
PACK BURGER	8
Perhitungan:
PACK KEBAB = 10 TORTILLA BESAR + 5 TORTILLA SEDANG = 15
PACK BURGER = 8 ROTI BURGER = 8
________________________________________
10.3 Aturan Sistem PACK Otomatis
1.	User hanya perlu menginput jumlah penjualan bahan utama.
2.	User tidak perlu menginput PACK KEBAB secara manual.
3.	User tidak perlu menginput PACK BURGER secara manual.
4.	Saat transaksi disimpan, sistem otomatis mengurangi stok PACK KEBAB sesuai total penjualan TORTILLA BESAR dan TORTILLA SEDANG.
5.	Saat transaksi disimpan, sistem otomatis mengurangi stok PACK BURGER sesuai total penjualan ROTI BURGER.
6.	PACK KEBAB dan PACK BURGER tetap tercatat di detail transaksi sebagai bahan keluar otomatis.
7.	Baris PACK KEBAB dan PACK BURGER pada detail transaksi bersifat otomatis.
8.	Operator tidak dapat mengedit baris PACK KEBAB dan PACK BURGER.
9.	PACK KEBAB dan PACK BURGER tidak dihitung sebagai omzet penjualan karena Harga Jual bernilai “-”.
10.	PACK KEBAB dan PACK BURGER tetap dihitung sebagai pengurangan stok.
11.	Sistem harus mengecek ketersediaan stok PACK KEBAB dan PACK BURGER sebelum transaksi disimpan.
12.	Jika stok PACK KEBAB atau PACK BURGER tidak mencukupi, sistem menampilkan peringatan dan transaksi tidak dapat disimpan.
13.	Jika Admin mengedit transaksi penjualan TORTILLA BESAR, TORTILLA SEDANG, atau ROTI BURGER, jumlah PACK KEBAB dan PACK BURGER harus dihitung ulang otomatis oleh sistem.
________________________________________
11. Modul Rekap Hasil Penjualan dan Pengurang Laba Kotor
Modul ini digunakan untuk merekap hasil penjualan harian di masing-masing kios serta mencatat komponen pengurang laba kotor.
Data ini diinput secara manual oleh Operator pada saat merekap nilai hasil penjualan.
Komponen pengurang laba kotor:
1.	Gaji Karyawan
2.	Transaksi QRIS
3.	Transaksi Grab/GoFood
4.	Biaya Lain-Lain
________________________________________
11.1 Field Rekap Hasil Penjualan
No	Nama Field	Keterangan
1	Nomor Rekap	Nomor rekap otomatis dari sistem
2	Tanggal Rekap	Tanggal rekap hasil penjualan
3	Lokasi Kios	Kios Wadas, Kios Ciherang, atau Kios Bubulak
4	Total Penjualan Sistem	Total penjualan berdasarkan transaksi penjualan/pengeluaran bahan baku
5	Gaji Karyawan	Nominal gaji karyawan sebagai pengurang laba kotor
6	Transaksi QRIS	Nominal transaksi QRIS yang diinput manual sebagai pengurang laba kotor
7	Transaksi Grab/GoFood	Nominal transaksi Grab/GoFood yang diinput manual sebagai pengurang laba kotor
8	Biaya Lain-Lain	Total biaya operasional lain-lain
9	Total Pengurang Laba Kotor	Total seluruh biaya pengurang laba kotor
10	Laba Kotor	Laba kotor sebelum dikurangi biaya tambahan
11	Estimasi Laba Bersih	Laba kotor setelah dikurangi seluruh pengurang
12	Operator	User yang melakukan input rekap
13	Catatan	Keterangan tambahan jika ada
________________________________________
11.2 Rumus Rekap Penjualan
Total Pengurang Laba Kotor = Gaji Karyawan + Transaksi QRIS + Transaksi Grab/GoFood + Biaya Lain-Lain
Estimasi Laba Bersih = Laba Kotor - Total Pengurang Laba Kotor
________________________________________
11.3 Fungsi Modul Rekap Hasil Penjualan
1.	Mencatat rekap hasil penjualan harian per kios.
2.	Mencatat Gaji Karyawan sebagai pengurang laba kotor.
3.	Mencatat Transaksi QRIS sebagai pengurang laba kotor.
4.	Mencatat Transaksi Grab/GoFood sebagai pengurang laba kotor.
5.	Menarik total Biaya Lain-Lain sebagai biaya operasional.
6.	Menghitung Total Pengurang Laba Kotor.
7.	Menghitung Estimasi Laba Bersih.
8.	Menyimpan histori rekap penjualan per tanggal dan per kios.
9.	Menampilkan laporan rekap penjualan dan laba bersih.
________________________________________
11.4 Aturan Sistem Rekap Penjualan
1.	Rekap hasil penjualan dapat diinput oleh Operator.
2.	Admin dapat melihat, mengedit, dan mengoreksi data rekap.
3.	Operator menginput nominal Gaji Karyawan, Transaksi QRIS, dan Transaksi Grab/GoFood secara manual.
4.	Biaya Lain-Lain dapat berasal dari input manual biaya operasional atau dari biaya Ongkos Kirim pada transaksi belanja.
5.	Semua nilai pengurang laba kotor harus tersimpan dalam histori transaksi.
6.	Estimasi Laba Bersih dihitung otomatis oleh sistem.
7.	Rekap hasil penjualan dapat difilter berdasarkan tanggal, lokasi kios, dan Operator.
________________________________________
12. Modul Biaya Lain-Lain / Biaya Operasional
Modul ini digunakan untuk mencatat biaya operasional yang dikeluarkan oleh usaha di luar pembelian bahan baku utama.
Biaya Lain-Lain akan menjadi pengurang laba kotor pada laporan rekap hasil penjualan.
________________________________________
12.1 Jenis Biaya Lain-Lain
No	Jenis Biaya	Keterangan
1	Ongkos Kirim	Biaya ongkos kirim saat transaksi belanja bahan baku
2	Bensin	Biaya bahan bakar kendaraan operasional
3	Ganti Oli	Biaya perawatan kendaraan operasional
4	Galon	Biaya pembelian air galon
5	Lain-Lain	Biaya operasional lain yang tidak termasuk kategori di atas
________________________________________
12.2 Field Biaya Lain-Lain
No	Nama Field	Keterangan
1	Nomor Biaya	Nomor transaksi biaya otomatis
2	Tanggal Biaya	Tanggal biaya dikeluarkan
3	Jenis Biaya	Ongkos Kirim, Bensin, Ganti Oli, Galon, atau Lain-Lain
4	Lokasi	Gudang Utama, Kios Wadas, Kios Ciherang, Kios Bubulak, atau Umum
5	Nominal Biaya	Jumlah biaya yang dikeluarkan
6	Sumber Biaya	Manual atau Otomatis dari Belanja
7	Nomor Transaksi Terkait	Nomor transaksi belanja jika biaya berasal dari Ongkos Kirim belanja
8	Operator	User yang mencatat biaya
9	Catatan	Keterangan tambahan jika ada
________________________________________
12.3 Fungsi Modul Biaya Lain-Lain
1.	Mencatat biaya operasional lain-lain.
2.	Mengelompokkan biaya berdasarkan jenis biaya.
3.	Mencatat Ongkos Kirim dari transaksi belanja.
4.	Mencatat biaya Bensin, Ganti Oli, Galon, dan Lain-Lain secara manual.
5.	Menampilkan total biaya operasional berdasarkan periode.
6.	Menjadi komponen pengurang laba kotor.
7.	Menampilkan laporan biaya lain-lain.
________________________________________
12.4 Aturan Sistem Biaya Lain-Lain
1.	Operator dapat menginput biaya Bensin, Ganti Oli, Galon, dan Lain-Lain secara manual.
2.	Ongkos Kirim dapat diinput saat transaksi belanja bahan baku.
3.	Jika Ongkos Kirim diinput pada transaksi belanja, sistem otomatis mencatatnya sebagai Biaya Lain-Lain dengan jenis Ongkos Kirim.
4.	Biaya Lain-Lain tidak menambah atau mengurangi stok bahan baku.
5.	Biaya Lain-Lain hanya mempengaruhi perhitungan laba.
6.	Semua biaya harus memiliki tanggal, jenis biaya, nominal biaya, dan user pencatat.
7.	Admin dapat mengedit atau mengoreksi data biaya jika terjadi kesalahan input.
________________________________________
13. Modul Monitoring Stok
Modul ini digunakan untuk memantau stok bahan baku di seluruh lokasi.
________________________________________
13.1 Tampilan Monitoring Stok
Monitoring stok harus menampilkan stok bahan baku per lokasi.
No	Nama Bahan Baku	Gudang Utama	Kios Wadas	Kios Ciherang	Kios Bubulak	Total Stok	Status
1	TORTILLA BESAR	100	70	15	10	195	Aman
2	ROTI BURGER	20	15	5	0	40	Campuran
3	PACK KEBAB	120	80	20	20	240	Campuran
Catatan: Status dapat berbeda per lokasi, sehingga pewarnaan utama diterapkan pada angka stok masing-masing lokasi.
________________________________________
13.2 Status Stok dan Warna Angka
Status	Kondisi	Warna Angka Stok
Aman	Stok aktual lebih besar dari minimum stok	Hijau
Hampir Habis	Stok aktual sama dengan atau lebih kecil dari minimum stok	Kuning
Habis	Stok aktual sama dengan 0	Merah
Tanpa Minimum	Minimum stok tidak diisi atau bernilai “-”	Default/Normal
Minus/Error	Stok bernilai minus karena kesalahan input atau koreksi data	Merah atau penanda error
________________________________________
13.3 Ketentuan Warna Angka Stok
1.	Warna diterapkan langsung pada angka stok di setiap lokasi.
2.	Warna stok ditentukan berdasarkan perbandingan antara stok aktual dan minimum stok di lokasi tersebut.
3.	Sistem harus membandingkan stok per bahan baku dan per lokasi.
4.	Jika stok aktual lebih besar dari minimum stok, angka stok berwarna Hijau.
5.	Jika stok aktual sama dengan atau lebih kecil dari minimum stok, angka stok berwarna Kuning.
6.	Jika stok aktual sama dengan 0, angka stok berwarna Merah.
7.	Jika minimum stok bernilai “-”, angka stok menggunakan warna default.
8.	Warna harus tampil di halaman Monitoring Stok, Dashboard stok minimum, dan Laporan Stok jika tersedia.
________________________________________
13.4 Rumus Status Warna
Jika jumlah_stok = 0, warna angka stok = Merah.
Jika jumlah_stok <= minimum_stok, warna angka stok = Kuning.
Jika jumlah_stok > minimum_stok, warna angka stok = Hijau.
Jika minimum_stok kosong/null/“-”, warna angka stok = Default.
________________________________________
13.5 Fungsi Modul Monitoring Stok
1.	Menampilkan stok bahan baku per lokasi.
2.	Menampilkan total stok gabungan seluruh lokasi.
3.	Memberikan peringatan stok minimum.
4.	Menampilkan angka stok dengan warna sesuai status.
5.	Memudahkan pengecekan stok Gudang Utama dan kios.
6.	Menampilkan histori perubahan stok.
________________________________________
14. Modul Penyesuaian Stok
Modul ini digunakan untuk melakukan koreksi stok jika terjadi selisih antara stok sistem dan stok fisik.
________________________________________
14.1 Field Penyesuaian Stok
No	Nama Field	Keterangan
1	Nomor Penyesuaian	Nomor otomatis
2	Tanggal Penyesuaian	Tanggal koreksi stok
3	Lokasi	Gudang Utama, Kios Wadas, Kios Ciherang, atau Kios Bubulak
4	Nama Bahan Baku	Bahan yang disesuaikan
5	Stok Sistem	Jumlah stok menurut aplikasi
6	Stok Fisik	Jumlah stok sebenarnya
7	Selisih	Stok fisik dikurangi stok sistem
8	Alasan Penyesuaian	Rusak, hilang, salah input, kadaluarsa, atau lainnya
9	Petugas	User yang melakukan penyesuaian
10	Catatan	Keterangan tambahan jika ada
________________________________________
14.2 Fungsi Modul Penyesuaian Stok
1.	Mengoreksi stok bahan baku.
2.	Mencatat alasan perubahan stok.
3.	Menyimpan riwayat koreksi stok.
4.	Menjaga agar data stok sistem sesuai dengan stok fisik.
________________________________________
14.3 Aturan Penyesuaian Stok
1.	Penyesuaian stok hanya dapat dilakukan oleh Admin.
2.	Operator tidak dapat mengedit jumlah stok secara langsung.
3.	Setiap penyesuaian stok harus disertai alasan.
4.	Semua penyesuaian stok harus tercatat di histori/log sistem.
________________________________________
15. Hak Akses User
Sistem hanya memiliki 2 jenis user, yaitu Admin dan Operator.
________________________________________
15.1 Admin
Admin adalah user dengan hak akses penuh terhadap seluruh fitur aplikasi.
Hak akses Admin:
1.	Login ke aplikasi.
2.	Mengelola data bahan baku.
3.	Menambah, mengedit, dan menghapus data bahan baku.
4.	Mengubah jumlah stok bahan baku.
5.	Mengubah harga beli bahan baku.
6.	Mengubah harga jual bahan baku.
7.	Mengelola data lokasi stok.
8.	Mengubah minimum stok per lokasi.
9.	Mencatat belanja bahan baku ke Gudang Utama.
10.	Mencatat distribusi bahan baku dari Gudang Utama ke kios.
11.	Mencatat penjualan/pengeluaran bahan baku di kios.
12.	Melakukan penyesuaian stok.
13.	Mengedit transaksi jika terjadi kesalahan input.
14.	Melihat seluruh stok di Gudang Utama, Kios Wadas, Kios Ciherang, dan Kios Bubulak.
15.	Melihat seluruh laporan.
16.	Mengelola data user.
17.	Melakukan export laporan jika fitur tersedia.
________________________________________
15.2 Operator
Operator adalah user yang menjalankan aktivitas operasional harian, tetapi memiliki batasan pada perubahan data penting seperti jumlah stok, harga jual, dan minimum stok.
Hak akses Operator:
1.	Login ke aplikasi.
2.	Melihat data bahan baku.
3.	Mencatat belanja bahan baku ke Gudang Utama.
4.	Mencatat distribusi bahan baku dari Gudang Utama ke kios.
5.	Mencatat penjualan/pengeluaran bahan baku di kios.
6.	Mencatat rekap hasil penjualan.
7.	Mencatat biaya lain-lain.
8.	Melihat stok bahan baku di seluruh lokasi.
9.	Melihat laporan stok.
10.	Melihat laporan belanja.
11.	Melihat laporan distribusi.
12.	Melihat laporan penjualan kios.
13.	Melihat laporan biaya.
14.	Melihat laporan laba.
Batasan akses Operator:
1.	Operator tidak dapat mengedit jumlah stok secara langsung.
2.	Operator tidak dapat mengubah Harga Jual bahan baku.
3.	Operator tidak dapat mengubah minimum stok.
4.	Operator tidak dapat menghapus transaksi.
5.	Operator tidak dapat mengelola data user.
6.	Operator tidak dapat melakukan penyesuaian stok manual.
7.	Operator tidak dapat mengedit transaksi yang sudah tersimpan, kecuali melalui koreksi oleh Admin.
________________________________________
15.3 Matriks Hak Akses
No	Fitur	Admin	Operator
1	Login aplikasi	Ya	Ya
2	Melihat data bahan baku	Ya	Ya
3	Menambah data bahan baku	Ya	Tidak
4	Mengedit data bahan baku	Ya	Tidak
5	Mengubah jumlah stok	Ya	Tidak
6	Mengubah harga beli	Ya	Terbatas saat belanja
7	Mengubah harga jual	Ya	Tidak
8	Mengubah minimum stok	Ya	Tidak
9	Input belanja bahan baku	Ya	Ya
10	Input distribusi bahan baku	Ya	Ya
11	Input penjualan/pengeluaran kios	Ya	Ya
12	Input rekap hasil penjualan	Ya	Ya
13	Input biaya lain-lain	Ya	Ya
14	Melihat monitoring stok	Ya	Ya
15	Penyesuaian stok manual	Ya	Tidak
16	Mengedit transaksi	Ya	Tidak
17	Menghapus transaksi	Ya	Tidak
18	Melihat laporan	Ya	Ya
19	Export laporan	Ya	Ya
20	Mengelola user	Ya	Tidak
________________________________________
16. Alur Proses Utama
16.1 Alur Belanja Bahan Baku
1.	Admin atau Operator membuka menu Belanja Bahan Baku.
2.	User memilih bahan baku dari master data.
3.	User mengisi jumlah beli.
4.	Sistem mengambil Harga Beli dari master data.
5.	User dapat menyesuaikan Harga Beli jika harga aktual berbeda.
6.	Sistem menghitung total harga beli.
7.	User mengisi Ongkos Kirim jika ada.
8.	Sistem menghitung Total Belanja Akhir.
9.	User menyimpan transaksi.
10.	Sistem menambah stok bahan baku di Gudang Utama.
11.	Jika terdapat Ongkos Kirim, sistem otomatis mencatatnya sebagai Biaya Lain-Lain.
12.	Sistem menyimpan riwayat transaksi belanja.
________________________________________
16.2 Alur Distribusi Bahan Baku
1.	Admin atau Operator membuka menu Distribusi.
2.	User memilih kios tujuan.
3.	User memilih bahan baku.
4.	User mengisi jumlah distribusi.
5.	Sistem mengecek stok Gudang Utama.
6.	Jika stok cukup, transaksi dapat disimpan.
7.	Sistem mengurangi stok Gudang Utama.
8.	Sistem menambah stok kios tujuan.
9.	Sistem menyimpan riwayat distribusi.
________________________________________
16.3 Alur Penjualan/Pengeluaran Bahan Baku di Kios
1.	Admin atau Operator membuka menu Penjualan/Pengeluaran Kios.
2.	User memilih lokasi kios.
3.	User memilih bahan baku yang dijual/digunakan.
4.	User mengisi jumlah keluar bahan baku.
5.	Sistem mengambil Harga Jual dari master data bahan baku.
6.	Sistem menghitung Total Harga Jual untuk bahan baku yang memiliki Harga Jual.
7.	Sistem mengecek stok bahan baku yang diinput user.
8.	Jika terdapat penjualan TORTILLA BESAR atau TORTILLA SEDANG, sistem otomatis menghitung jumlah PACK KEBAB.
9.	Jika terdapat penjualan ROTI BURGER, sistem otomatis menghitung jumlah PACK BURGER.
10.	Sistem mengecek stok PACK KEBAB dan PACK BURGER.
11.	Jika seluruh stok mencukupi, transaksi dapat disimpan.
12.	Sistem mengurangi stok bahan baku yang diinput user.
13.	Sistem mengurangi stok PACK KEBAB dan PACK BURGER secara otomatis.
14.	Sistem menyimpan riwayat transaksi penjualan/pengeluaran bahan baku.
15.	Sistem menampilkan detail transaksi manual dan otomatis pada laporan penjualan/pengeluaran kios.
________________________________________
16.4 Alur Rekap Hasil Penjualan
1.	Operator membuka menu Rekap Hasil Penjualan.
2.	Operator memilih tanggal rekap.
3.	Operator memilih lokasi kios.
4.	Sistem menampilkan Total Penjualan Sistem.
5.	Operator menginput Gaji Karyawan.
6.	Operator menginput Transaksi QRIS.
7.	Operator menginput Transaksi Grab/GoFood.
8.	Sistem mengambil total Biaya Lain-Lain pada periode dan lokasi terkait.
9.	Sistem menghitung Total Pengurang Laba Kotor.
10.	Sistem menghitung Estimasi Laba Bersih.
11.	Operator menyimpan rekap.
12.	Sistem menyimpan histori rekap penjualan.
________________________________________
16.5 Alur Input Biaya Lain-Lain
1.	Admin atau Operator membuka menu Biaya Lain-Lain.
2.	User memilih tanggal biaya.
3.	User memilih jenis biaya.
4.	User memilih lokasi biaya jika diperlukan.
5.	User mengisi nominal biaya.
6.	User mengisi catatan jika ada.
7.	User menyimpan transaksi biaya.
8.	Sistem menyimpan biaya sebagai pengurang laba kotor.
________________________________________
17. Aturan Bisnis
1.	Semua bahan baku wajib memiliki kode unik.
2.	Semua transaksi harus menggunakan bahan baku dari master data.
3.	Nama bahan baku tidak boleh diketik manual saat transaksi.
4.	Stok bahan baku tidak boleh minus.
5.	Pembelian bahan baku hanya masuk ke Gudang Utama.
6.	Distribusi hanya dilakukan dari Gudang Utama ke kios.
7.	Penjualan/pengeluaran bahan baku hanya dilakukan dari kios.
8.	Harga beli digunakan untuk menghitung modal bahan baku.
9.	Harga jual digunakan untuk menghitung nilai penjualan bahan baku.
10.	Operator tidak dapat mengubah Harga Jual.
11.	Operator tidak dapat mengubah jumlah stok secara langsung.
12.	Operator tidak dapat mengubah minimum stok.
13.	Perubahan stok hanya dapat terjadi melalui transaksi belanja, distribusi, penjualan/pengeluaran, atau penyesuaian stok oleh Admin.
14.	Transaksi yang sudah disimpan tidak boleh dihapus sembarangan.
15.	Perubahan atau pembatalan transaksi harus tercatat dalam histori.
16.	Penyesuaian stok harus disertai alasan.
17.	PACK KEBAB mengikuti jumlah penjualan TORTILLA BESAR dan TORTILLA SEDANG.
18.	PACK BURGER mengikuti jumlah penjualan ROTI BURGER.
19.	PACK KEBAB dan PACK BURGER otomatis mengurangi stok kios terkait.
20.	PACK KEBAB dan PACK BURGER tidak menambah omzet penjualan.
21.	Gaji Karyawan, Transaksi QRIS, Transaksi Grab/GoFood, dan Biaya Lain-Lain menjadi pengurang laba kotor.
22.	Ongkos Kirim pada transaksi belanja otomatis masuk ke Biaya Lain-Lain.
23.	Semua aktivitas Admin dan Operator harus tercatat dalam log sistem.
________________________________________
18. Modul Laporan
Aplikasi harus menyediakan laporan berikut.
________________________________________
18.1 Laporan Stok Bahan Baku
Menampilkan jumlah stok per bahan baku di setiap lokasi.
Filter:
1.	Lokasi
2.	Nama bahan baku
3.	Status stok
Output:
1.	Stok Gudang Utama
2.	Stok Kios Wadas
3.	Stok Kios Ciherang
4.	Stok Kios Bubulak
5.	Total stok
6.	Minimum stok per lokasi
7.	Status stok
8.	Warna angka stok
________________________________________
18.2 Laporan Belanja Bahan Baku
Menampilkan riwayat pembelian bahan baku ke Gudang Utama.
Filter:
1.	Periode tanggal
2.	Nama bahan baku
3.	Petugas
Output:
1.	Tanggal belanja
2.	Nama bahan baku
3.	Jumlah beli
4.	Harga beli
5.	Total harga beli
6.	Ongkos kirim
7.	Total belanja akhir
________________________________________
18.3 Laporan Distribusi Bahan Baku
Menampilkan riwayat pengiriman bahan baku dari Gudang Utama ke kios.
Filter:
1.	Periode tanggal
2.	Kios tujuan
3.	Nama bahan baku
Output:
1.	Tanggal distribusi
2.	Bahan baku
3.	Jumlah distribusi
4.	Lokasi asal
5.	Lokasi tujuan
6.	Petugas
________________________________________
18.4 Laporan Penjualan/Pengeluaran Bahan Baku Kios
Menampilkan transaksi penjualan/pengeluaran bahan baku di masing-masing kios.
Filter:
1.	Periode tanggal
2.	Lokasi kios
3.	Nama bahan baku
Output:
1.	Tanggal transaksi
2.	Lokasi kios
3.	Nama bahan baku
4.	Jumlah keluar
5.	Harga jual
6.	Total harga jual
7.	Jenis input: Manual atau Otomatis Sistem
________________________________________
18.5 Laporan Biaya Lain-Lain
Menampilkan seluruh biaya operasional.
Filter:
1.	Periode tanggal
2.	Jenis biaya
3.	Lokasi
4.	User pencatat
Output:
1.	Tanggal biaya
2.	Jenis biaya
3.	Lokasi
4.	Nominal biaya
5.	Sumber biaya
6.	Nomor transaksi terkait
7.	Catatan
________________________________________
18.6 Laporan Laba
Laporan laba menampilkan laba kotor, pengurang laba kotor, dan estimasi laba bersih.
Rumus Laporan Laba
Laba Kotor = Total Harga Jual - Total Modal Bahan Baku
Total Pengurang Laba Kotor = Gaji Karyawan + Transaksi QRIS + Transaksi Grab/GoFood + Biaya Lain-Lain
Estimasi Laba Bersih = Laba Kotor - Total Pengurang Laba Kotor
Output Laporan Laba
No	Output	Keterangan
1	Periode	Tanggal laporan
2	Lokasi Kios	Lokasi kios
3	Total Penjualan	Total penjualan berdasarkan transaksi
4	Total Modal Bahan Baku	Total harga beli bahan baku yang keluar
5	Laba Kotor	Total penjualan dikurangi modal bahan baku
6	Gaji Karyawan	Pengurang laba kotor
7	Transaksi QRIS	Pengurang laba kotor
8	Transaksi Grab/GoFood	Pengurang laba kotor
9	Biaya Lain-Lain	Total biaya operasional lain
10	Total Pengurang Laba Kotor	Total seluruh pengurang
11	Estimasi Laba Bersih	Laba kotor dikurangi total pengurang
________________________________________
19. Dashboard
Dashboard aplikasi menampilkan ringkasan utama:
1.	Total nilai stok Gudang Utama.
2.	Total nilai stok Kios Wadas.
3.	Total nilai stok Kios Ciherang.
4.	Total nilai stok Kios Bubulak.
5.	Total belanja bahan baku bulan ini.
6.	Total ongkos kirim bulan ini.
7.	Total distribusi bahan baku bulan ini.
8.	Total penjualan bahan baku bulan ini.
9.	Total biaya lain-lain bulan ini.
10.	Estimasi laba kotor bulan ini.
11.	Estimasi laba bersih bulan ini.
12.	Daftar bahan baku yang hampir habis.
13.	Daftar bahan baku yang habis.
14.	Grafik penjualan bahan baku per kios.
15.	Grafik biaya operasional.
________________________________________
20. Struktur Database Awal
20.1 Tabel Users
Field	Tipe Data	Keterangan
id_user	Integer	Primary key
nama_user	Varchar	Nama user
username	Varchar	Username login
password	Varchar	Password terenkripsi
role	Varchar	Admin atau Operator
status	Varchar	Aktif atau Tidak Aktif
created_at	Datetime	Waktu dibuat
updated_at	Datetime	Waktu diperbarui
________________________________________
20.2 Tabel Bahan Baku
Field	Tipe Data	Keterangan
id_bahan	Integer	Primary key
kode_bahan	Varchar	Kode bahan baku
nama_bahan	Varchar	Nama bahan baku
harga_beli	Decimal	Harga beli patokan
harga_jual	Decimal / Nullable	Harga jual patokan
status	Varchar	Aktif atau Tidak Aktif
created_at	Datetime	Waktu dibuat
updated_at	Datetime	Waktu diperbarui
________________________________________
20.3 Tabel Lokasi
Field	Tipe Data	Keterangan
id_lokasi	Integer	Primary key
nama_lokasi	Varchar	Gudang Utama, Kios Wadas, Kios Ciherang, atau Kios Bubulak
jenis_lokasi	Varchar	Gudang atau Kios
alamat	Text	Alamat lokasi
status	Varchar	Aktif atau Tidak Aktif
________________________________________
20.4 Tabel Stok
Tabel ini digunakan untuk menyimpan jumlah stok aktual dan minimum stok setiap bahan baku di masing-masing lokasi.
Field	Tipe Data	Keterangan
id_stok	Integer	Primary key
id_bahan	Integer	Relasi ke tabel bahan baku
id_lokasi	Integer	Relasi ke tabel lokasi
jumlah_stok	Decimal	Jumlah stok aktual yang tersedia
minimum_stok	Decimal / Nullable	Batas minimum stok untuk bahan baku di lokasi tersebut
status_stok	Varchar	Aman, Hampir Habis, Habis, atau Minus/Error
updated_at	Datetime	Waktu update terakhir
Catatan:
1.	Minimum stok disimpan di tabel stok karena nilainya berbeda untuk setiap lokasi.
2.	Jika minimum_stok kosong/null, bahan baku tersebut tidak memiliki batas minimum stok.
3.	Status stok dapat dihitung otomatis berdasarkan jumlah_stok dan minimum_stok.
________________________________________
20.5 Tabel Belanja
Field	Tipe Data	Keterangan
id_belanja	Integer	Primary key
nomor_belanja	Varchar	Nomor transaksi belanja
tanggal_belanja	Date	Tanggal pembelian
total_belanja_bahan	Decimal	Total belanja bahan baku tanpa ongkos kirim
ongkos_kirim	Decimal	Biaya ongkos kirim
total_belanja_akhir	Decimal	Total belanja bahan baku ditambah ongkos kirim
id_user	Integer	User pencatat
catatan	Text	Keterangan tambahan
created_at	Datetime	Waktu input data
________________________________________
20.6 Tabel Detail Belanja
Field	Tipe Data	Keterangan
id_detail_belanja	Integer	Primary key
id_belanja	Integer	Relasi ke tabel belanja
id_bahan	Integer	Relasi ke bahan baku
jumlah	Decimal	Jumlah beli
harga_beli	Decimal	Harga beli satuan saat transaksi
subtotal	Decimal	Jumlah x harga beli
________________________________________
20.7 Tabel Distribusi
Field	Tipe Data	Keterangan
id_distribusi	Integer	Primary key
nomor_distribusi	Varchar	Nomor distribusi
tanggal_distribusi	Date	Tanggal distribusi
lokasi_asal	Integer	Gudang Utama
lokasi_tujuan	Integer	Kios tujuan
id_user	Integer	User pencatat
catatan	Text	Keterangan tambahan
created_at	Datetime	Waktu input data
________________________________________
20.8 Tabel Detail Distribusi
Field	Tipe Data	Keterangan
id_detail_distribusi	Integer	Primary key
id_distribusi	Integer	Relasi ke distribusi
id_bahan	Integer	Relasi ke bahan baku
jumlah	Decimal	Jumlah distribusi
________________________________________
20.9 Tabel Penjualan Kios
Field	Tipe Data	Keterangan
id_penjualan	Integer	Primary key
nomor_penjualan	Varchar	Nomor transaksi
tanggal_penjualan	Date	Tanggal transaksi
id_lokasi	Integer	Lokasi kios
total_penjualan	Decimal	Total nilai penjualan
id_user	Integer	User pencatat
catatan	Text	Keterangan tambahan
created_at	Datetime	Waktu input data
________________________________________
20.10 Tabel Detail Penjualan Kios
Field	Tipe Data	Keterangan
id_detail_penjualan	Integer	Primary key
id_penjualan	Integer	Relasi ke penjualan
id_bahan	Integer	Relasi ke bahan baku
jumlah	Decimal	Jumlah keluar
harga_jual	Decimal / Nullable	Harga jual satuan saat transaksi
subtotal	Decimal	Jumlah x harga jual
jenis_input	Varchar	Manual atau Otomatis Sistem
________________________________________
20.11 Tabel Rekap Penjualan
Field	Tipe Data	Keterangan
id_rekap	Integer	Primary key
nomor_rekap	Varchar	Nomor rekap otomatis
tanggal_rekap	Date	Tanggal rekap
id_lokasi	Integer	Relasi ke lokasi kios
total_penjualan_sistem	Decimal	Total penjualan dari sistem
gaji_karyawan	Decimal	Nominal gaji karyawan
transaksi_qris	Decimal	Nominal transaksi QRIS
transaksi_grab_gofood	Decimal	Nominal transaksi Grab/GoFood
total_biaya_lain	Decimal	Total biaya lain-lain
total_pengurang_laba	Decimal	Total pengurang laba kotor
laba_kotor	Decimal	Laba kotor
estimasi_laba_bersih	Decimal	Estimasi laba bersih
id_user	Integer	User pencatat
catatan	Text	Keterangan tambahan
created_at	Datetime	Waktu input data
________________________________________
20.12 Tabel Biaya Lain-Lain
Field	Tipe Data	Keterangan
id_biaya	Integer	Primary key
nomor_biaya	Varchar	Nomor transaksi biaya
tanggal_biaya	Date	Tanggal biaya
jenis_biaya	Varchar	Ongkos Kirim, Bensin, Ganti Oli, Galon, atau Lain-Lain
id_lokasi	Integer / Nullable	Relasi ke lokasi jika biaya terkait lokasi tertentu
nominal_biaya	Decimal	Jumlah biaya
sumber_biaya	Varchar	Manual atau Otomatis dari Belanja
nomor_transaksi_terkait	Varchar / Nullable	Nomor transaksi belanja jika terkait ongkos kirim
id_user	Integer	User pencatat
catatan	Text	Keterangan tambahan
created_at	Datetime	Waktu input data
________________________________________
20.13 Tabel Log Aktivitas
Field	Tipe Data	Keterangan
id_log	Integer	Primary key
id_user	Integer	User yang melakukan aktivitas
aktivitas	Varchar	Jenis aktivitas
modul	Varchar	Modul yang diakses
data_lama	Text / JSON	Data sebelum perubahan
data_baru	Text / JSON	Data setelah perubahan
created_at	Datetime	Waktu aktivitas
________________________________________
21. Kebutuhan Fitur Utama
No	Fitur	Prioritas
1	Login user	Tinggi
2	Hak akses Admin dan Operator	Tinggi
3	Master data bahan baku	Tinggi
4	Master data lokasi	Tinggi
5	Minimum stok per lokasi	Tinggi
6	Belanja bahan baku Gudang Utama	Tinggi
7	Ongkos kirim pada transaksi belanja	Tinggi
8	Distribusi Gudang ke Kios	Tinggi
9	Penjualan/Pengeluaran bahan baku Kios	Tinggi
10	PACK KEBAB dan PACK BURGER otomatis	Tinggi
11	Monitoring stok per lokasi	Tinggi
12	Warna angka stok	Tinggi
13	Rekap hasil penjualan	Tinggi
14	Biaya lain-lain	Tinggi
15	Laporan stok	Tinggi
16	Laporan belanja	Tinggi
17	Laporan distribusi	Sedang
18	Laporan penjualan kios	Tinggi
19	Laporan biaya	Tinggi
20	Laporan laba	Tinggi
21	Dashboard grafik	Sedang
22	Export laporan Excel/PDF	Rendah
23	Histori/log aktivitas	Tinggi
________________________________________
22. Kebutuhan Non-Fungsional
1.	Aplikasi mudah digunakan oleh Admin dan Operator.
2.	Aplikasi dapat digunakan melalui komputer/laptop dan handphone.
3.	Tampilan aplikasi harus menarik, modern, dan mudah dipahami.
4.	Data transaksi harus tersimpan aman.
5.	Password user harus disimpan dalam bentuk terenkripsi.
6.	Setiap aktivitas user harus tercatat dalam log.
7.	Sistem harus memiliki backup data.
8.	Aplikasi harus mampu menampilkan laporan secara cepat.
9.	Sistem harus mencegah stok minus.
10.	Sistem harus memiliki hak akses berdasarkan role user.
11.	Sistem harus mendukung export laporan ke Excel atau PDF.
12.	Sistem harus dapat menampilkan warna stok secara jelas.
13.	Sistem harus menyimpan harga transaksi sesuai harga saat transaksi dibuat.
________________________________________
23. Contoh Menu Aplikasi
1.	Dashboard
2.	Master Data
o	Data Bahan Baku
o	Data Lokasi
o	Minimum Stok
o	Data User
3.	Transaksi
o	Belanja Bahan Baku
o	Distribusi Bahan Baku
o	Penjualan/Pengeluaran Kios
o	Rekap Hasil Penjualan
o	Biaya Lain-Lain
o	Penyesuaian Stok
4.	Monitoring Stok
5.	Laporan
o	Laporan Stok
o	Laporan Belanja
o	Laporan Distribusi
o	Laporan Penjualan Kios
o	Laporan Rekap Penjualan
o	Laporan Biaya Lain-Lain
o	Laporan Laba
6.	Pengaturan
o	Manajemen User
o	Log Aktivitas
________________________________________
24. Kriteria Keberhasilan
Aplikasi dianggap berhasil jika:
1.	Admin dapat mengetahui stok bahan baku di Gudang Utama dan seluruh kios secara real-time.
2.	Operator dapat mencatat belanja bahan baku dengan mudah.
3.	Operator dapat mencatat distribusi bahan baku ke kios dengan mudah.
4.	Operator dapat mencatat penjualan/pengeluaran bahan baku di kios dengan cepat.
5.	Sistem dapat otomatis menghitung PACK KEBAB dan PACK BURGER.
6.	Sistem dapat mencegah transaksi ketika stok tidak mencukupi.
7.	Sistem dapat menampilkan warna angka stok sesuai kondisi stok.
8.	Admin dapat melihat laporan belanja, distribusi, stok, penjualan, biaya, dan laba.
9.	Operator dapat melakukan rekap hasil penjualan harian.
10.	Biaya operasional dapat tercatat dan masuk ke perhitungan laba.
11.	Selisih stok dapat dilacak melalui histori transaksi.
12.	Data stok lebih akurat dibanding pencatatan manual.
________________________________________
25. MVP Versi Pertama
Untuk versi pertama, fitur yang wajib dibuat adalah:
1.	Login user.
2.	Hak akses Admin dan Operator.
3.	Master data bahan baku.
4.	Master data lokasi.
5.	Minimum stok per lokasi.
6.	Input belanja bahan baku ke Gudang Utama.
7.	Input ongkos kirim saat belanja.
8.	Distribusi bahan baku dari Gudang Utama ke kios.
9.	Input penjualan/pengeluaran bahan baku di kios.
10.	Perhitungan otomatis PACK KEBAB dan PACK BURGER.
11.	Monitoring stok per lokasi.
12.	Warna angka stok: hijau, kuning, merah.
13.	Rekap hasil penjualan.
14.	Input biaya lain-lain.
15.	Laporan stok.
16.	Laporan belanja.
17.	Laporan distribusi.
18.	Laporan penjualan kios.
19.	Laporan biaya lain-lain.
20.	Laporan laba.
Fitur tambahan seperti grafik dashboard, export PDF/Excel, dan notifikasi lanjutan dapat dikembangkan pada versi berikutnya.
