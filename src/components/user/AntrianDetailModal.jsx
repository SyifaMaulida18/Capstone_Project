"use client";

import { X, UserCheck, Users, ClipboardList, CheckCircle } from "lucide-react";

export default function AntrianDetailModal({
  isOpen,
  onClose,
  queueData,
  myNomorAntrian,
  poliName,
}) {
  if (!isOpen || !queueData) return null;

  const { sedang_dipanggil, sisa_antrian, daftar_tunggu } = queueData;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Detail Antrian
              </h2>
              <p className="text-neutral-600">{poliName || "Poli Anda"}</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            {/* Info Utama */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <UserCheck className="w-5 h-5 text-green-700" />
                  <span className="text-sm font-semibold text-green-800">
                    Sedang Dipanggil
                  </span>
                </div>
                <p className="text-4xl font-extrabold text-green-700">
                  {sedang_dipanggil?.nomor_antrian || "-"}
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-5 h-5 text-yellow-700" />
                  <span className="text-sm font-semibold text-yellow-800">
                    Sisa Antrian
                  </span>
                </div>
                <p className="text-4xl font-extrabold text-yellow-700">
                  {sisa_antrian}
                </p>
              </div>
            </div>

            {/* Daftar Tunggu */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3 flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-primary-600" />
                Daftar Tunggu
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-lg p-3 bg-neutral-50">
                {daftar_tunggu && daftar_tunggu.length > 0 ? (
                  daftar_tunggu.map((antrian) => {
                    const isMe = antrian.nomor_antrian === myNomorAntrian;
                    const isCalled = antrian.status === "dipanggil";

                    return (
                      <div
                        key={antrian.antrian_id}
                        className={`flex justify-between items-center p-3 rounded-lg border
                          ${
                            isMe
                              ? "bg-primary-100 border-primary-300"
                              : isCalled
                              ? "bg-green-100 border-green-300"
                              : "bg-white border-neutral-200"
                          }
                        `}
                      >
                        <span
                          className={`font-bold text-lg ${
                            isMe ? "text-primary-800" : "text-neutral-800"
                          }`}
                        >
                          {antrian.nomor_antrian}
                        </span>
                        
                        {isMe && (
                          <span className="text-xs font-bold text-primary-700 px-2 py-0.5 bg-primary-200 rounded-full">
                            Ini Anda
                          </span>
                        )}

                        {isCalled && (
                          <span className="flex items-center text-sm font-medium text-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Dipanggil
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-neutral-500 italic text-center py-4">
                    Tidak ada antrian dalam daftar tunggu.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-neutral-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}