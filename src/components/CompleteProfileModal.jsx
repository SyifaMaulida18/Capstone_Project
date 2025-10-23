export default function CompleteProfileModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Lengkapi Data Diri Anda
        </h2>
        <p className="text-gray-600 mb-6">
          Untuk melanjutkan, silakan isi data diri anda terlebih dahulu.
        </p>

        <form>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Alamat</label>
            <input
              type="text"
              placeholder="Masukkan alamat lengkap"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Nomor KTP</label>
            <input
              type="text"
              placeholder="16 digit NIK / 1 jika bayi"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
