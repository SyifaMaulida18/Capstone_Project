"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import FormReservasi from "../../../components/form/reservasi"; // pastikan path ini benar

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function EditReservasiPage() {
  const params = useParams();
  const { id } = params || {};

  const [reservationData, setReservationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchReservationById = async (reservId) => {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        if (!token) {
          setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/reservations/${reservId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Gagal mengambil data reservasi (status ${res.status}): ${text}`
          );
        }

        const json = await res.json();
        const r = json.data;

        if (!r) {
          setReservationData(null);
          setIsLoading(false);
          return;
        }

        // mapping ke format yang dipakai FormReservasi
        const penjaminLabel = (() => {
          if (r.penjaminan === "cash") return "Swasta";
          if (r.penjaminan === "asuransi") {
            // kalau kamu mau lebih detail, bisa pakai nama_asuransi
            if (r.nama_asuransi && r.nama_asuransi.toLowerCase().includes("bpjs")) {
              return "BPJS";
            }
            return "Asuransi Lain";
          }
          return "Swasta";
        })();

        const mapped = {
          id: r.reservid,
          nama: r.nama || "",
          email: r.email || "",
          telp: r.nomor_whatsapp || "",
          tglLahir: r.tanggal_lahir || "",
          jk: r.jenis_kelamin || "Perempuan",
          nik: r.nomor_ktp || "",
          wa: r.nomor_whatsapp || "",
          penjamin: penjaminLabel,
          keluhan: r.keluhan || "",
          rekomPoli: r.poli?.poli_name ?? "",
          poliId: r.poli_id || "",
          tanggalReservasi: r.tanggal_reservasi || "",
        };

        setReservationData(mapped);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Terjadi kesalahan saat mengambil data.");
        setReservationData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReservationById(id);
    }
  }, [id]);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="text-center p-10">Memuat data reservasi...</div>
      ) : errorMsg ? (
        <div className="text-center p-10 text-red-600">
          {errorMsg}
        </div>
      ) : !reservationData ? (
        <div className="text-center p-10 text-red-600">
          Data reservasi tidak ditemukan.
        </div>
      ) : (
        <FormReservasi initialData={reservationData} />
      )}
    </AdminLayout>
  );
}
