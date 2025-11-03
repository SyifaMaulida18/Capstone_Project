export default function CompleteProfileModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        {/* UBAH: Menggunakan 'neutral-800' */}
        <h2 className="text-xl font-bold text-neutral-800 mb-4">
          Lengkapi Data Diri Anda
        </h2>
        {/* UBAH: Menggunakan 'neutral-600' */}
        <p className="text-neutral-600 mb-6">
          Untuk melanjutkan, silakan isi data diri anda terlebih dahulu.
        </p>

        <form>
          <div className="mb-4">
            {/* UBAH: Menggunakan 'neutral-700' */}
            <label className="block text-neutral-700 font-medium mb-2">
              Alamat
            </label>
            <input
              type="text"
              placeholder="Masukkan alamat lengkap"
              /* UBAH: Menggunakan 'neutral-800', 'neutral-600' (placeholder), dan 'primary-500' (focus) */
              className="w-full px-4 py-2 border rounded-lg text-neutral-800 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            {/* UBAH: Menggunakan 'neutral-700' */}
            <label className="block text-neutral-700 font-medium mb-2">
              Nomor KTP
            </label>
            <input
              type="text"
              placeholder="16 digit NIK / 1 jika bayi"
              /* UBAH: Menggunakan 'neutral-800', 'neutral-600' (placeholder), dan 'primary-500' (focus) */
              className="w-full px-4 py-2 border rounded-lg text-neutral-800 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              /* UBAH: Menggunakan 'neutral-200' (border), 'neutral-700' (text), 'neutral-100' (hover) */
              className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            >
              Batal
            </button>
            <button
              type="submit"
              /* UBAH: Menggunakan 'primary-500' dan 'primary-600' */
              className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}