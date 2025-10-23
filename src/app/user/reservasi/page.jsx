"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Heart, Calendar, Clock, User, Zap, Loader2, MessageSquare, CheckCircle, AlertTriangle, ArrowLeft, Send, CreditCard, X } from 'lucide-react';

// --- DATA MOCK SISTEM ---
const ALL_POLI_OPTIONS = ['Poli Jantung', 'Poli Penyakit Dalam', 'Poli Anak', 'Poli Mata', 'Poli Gigi', 'Poli Umum'];
const MOCK_SCHEDULE = [
    { id: 's1', doctor: "Dr. Iqbal Sp.JP", poli: "Poli Jantung", date: "2025-10-03", time: "08:00 - 10:00", quota: 5, price: 150000, available: true, dateKey: '2025-10-03' },
    { id: 's2', doctor: "Dr. Iqbal Sp.JP", poli: "Poli Jantung", date: "2025-10-04", time: "08:00 - 10:00", quota: 3, price: 150000, available: true, dateKey: '2025-10-04' },
    { id: 's3', doctor: "Dr. Rina Sp.PD", poli: "Poli Penyakit Dalam", date: "2025-10-03", time: "10:00 - 12:00", quota: 8, price: 120000, available: true, dateKey: '2025-10-03' },
    { id: 's4', doctor: "Dr. Rina Sp.PD", poli: "Poli Penyakit Dalam", date: "2025-10-04", time: "10:00 - 12:00", quota: 0, price: 120000, available: false, dateKey: '2025-10-04' },
    { id: 's5', doctor: "Dr. Bima Sp.A", poli: "Poli Anak", date: "2025-10-05", time: "14:00 - 16:00", quota: 10, price: 140000, available: true, dateKey: '2025-10-05' },
    { id: 's6', doctor: "Dr. Bima Sp.A", poli: "Poli Anak", date: "2025-10-04", time: "16:00 - 18:00", quota: 2, price: 140000, available: true, dateKey: '2025-10-04' },
];

const PAYMENT_OPTIONS = ['Cash (Bayar di RS)', 'Asuransi Perusahaan A', 'BPJS Kesehatan'];
// --------------------------------------------------------------------------

// Gaya CSS untuk menyembunyikan scrollbar
const scrollbarHideStyle = `
    .scrollbar-hide {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }
`;

// --- Komponen Antarmuka Bantuan ---
const BackButton = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="text-gray-600 hover:text-indigo-800 flex items-center mb-6 transition duration-150 font-medium"
    >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Kembali ke Langkah Sebelumnya
    </button>
);

const ProgressBar = ({ step }) => {
    const steps = ['Diagnosa Gejala', 'Pilih Jadwal', 'Konfirmasi & Bayar'];
    const activeIndex = steps.indexOf(step);
    
    return (
        <div className="flex justify-between items-start mb-8 w-full max-w-lg mx-auto">
            {steps.map((label, index) => (
                <div key={label} className="flex-1 text-center relative">
                    <div className={`
                        w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                        ${index <= activeIndex ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-300 text-gray-500'}
                    `}>
                        {index + 1}
                    </div>
                    <p className={`mt-2 text-xs font-semibold ${index <= activeIndex ? 'text-indigo-700' : 'text-gray-500'} hidden sm:block`}>
                        {label}
                    </p>
                    {index < steps.length - 1 && (
                        <div className={`absolute left-[calc(50%+1rem)] top-4 h-0.5 w-[calc(100%-2rem)] transition-all duration-300 transform -translate-y-1/2 ${index < activeIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                    )}
                </div>
            ))}
        </div>
    );
};
// --------------------------------------------------------------------------


// --- LANGKAH 1: DIAGNOSA GEJALA (AI Based) ---
const DiagnosisStep = ({ setStep, setReservationData }) => {
    const [gejala, setGejala] = useState('');
    const [rekomendasi, setRekomendasi] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fungsi panggilan AI untuk Rekomendasi Poli
    const handleAiDiagnosis = async () => {
        if (gejala.length < 15) {
            setError("Mohon masukkan deskripsi gejala yang lebih detail (min. 15 karakter).");
            return;
        }
        setIsLoading(true);
        setError(null);
        setRekomendasi(null);

        // --- PANGGILAN API GEMINI ---
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=`;
        const apiKey = ""; 
        
        const systemPrompt = "Anda adalah sistem triage medis. Analisis gejala pasien, berikan rekomendasi poli tunggal yang paling mungkin, dan berikan alasan singkat. Output harus JSON dengan format: {\"poli\": \"[Nama Poli]\", \"confidence\": \"[Persentase keyakinan]\", \"reason\": \"[Alasan singkat]\"}. Pastikan nama poli ada dalam daftar: Poli Jantung, Poli Penyakit Dalam, Poli Anak, Poli Mata, Poli Gigi, Poli Umum.";
        const userQuery = `Gejala pasien: ${gejala}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "poli": { "type": "STRING" },
                        "confidence": { "type": "STRING" },
                        "reason": { "type": "STRING" }
                    }
                }
            }
        };

        try {
            const response = await fetch(apiUrl + apiKey, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            let aiResult = JSON.parse(jsonText);

            if (!ALL_POLI_OPTIONS.includes(aiResult.poli)) {
                 aiResult.poli = 'Poli Umum'; // Fallback jika AI menyarankan poli yang tidak ada
            }

            setRekomendasi(aiResult);

        } catch (err) {
            console.error("AI API Error (Menggunakan Mock):", err);
            // Mock response jika API gagal atau untuk pengujian
            const mockPoli = gejala.toLowerCase().includes('sesak') || gejala.toLowerCase().includes('dada') ? 
                             { poli: 'Poli Jantung', confidence: '92%', reason: 'Gejala mengarah ke masalah kardiovaskular (simulasi).' } : 
                             { poli: 'Poli Penyakit Dalam', confidence: '85%', reason: 'Gejala umum yang memerlukan pemeriksaan internis (simulasi).' };
            setRekomendasi(mockPoli);
            setError("Diagnosis AI menggunakan mock data karena API error.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Melanjutkan ke langkah 2 dengan rekomendasi yang dipilih/manual
    const handleContinue = (poliName) => {
        setReservationData(prev => ({ ...prev, selectedPoli: poliName, gejala: gejala }));
        setStep('schedule');
    };

    return (
        <div className="p-6 md:p-8 bg-white rounded-xl shadow-2xl border border-indigo-200">
            <h1 className="text-2xl font-extrabold text-indigo-700 mb-6 flex items-center"><Search className="w-6 h-6 mr-2"/> 1. Diagnosa Gejala (AI Based)</h1>
            
            <p className="text-gray-600 mb-4">Masukkan gejala yang Anda rasakan secara detail, minimal 15 karakter. Sistem akan menggunakan AI untuk merekomendasikan poli yang paling sesuai.</p>
            
            <textarea
                value={gejala}
                onChange={(e) => setGejala(e.target.value)}
                rows="5"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none shadow-inner"
                placeholder="Contoh: Sudah 3 hari saya merasa sakit di dada kiri dan sesak napas saat berjalan cepat. Saya juga demam ringan."
                disabled={isLoading}
            ></textarea>

            {error && (
                 <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-xl mt-4 text-sm flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" /> {error}
                </div>
            )}
            
            <button 
                onClick={handleAiDiagnosis}
                disabled={isLoading || gejala.length < 15}
                className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-150 shadow-lg flex items-center justify-center disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <Zap className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Menganalisis Gejala...' : 'Dapatkan Rekomendasi Poli Cepat'}
            </button>

            {rekomendasi && (
                <div className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-xl shadow-inner">
                    <h3 className="font-bold text-xl flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Rekomendasi AI:</h3>
                    <p className="text-sm mt-2">Poli yang Disarankan: **{rekomendasi.poli}**</p>
                    <p className="text-sm">Tingkat Keyakinan: **{rekomendasi.confidence}**</p>
                    <p className="text-sm italic mt-1">Alasan: {rekomendasi.reason}</p>
                    
                    <button 
                        onClick={() => handleContinue(rekomendasi.poli)}
                        className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition duration-150 shadow-md"
                    >
                        Lanjut dengan Poli {rekomendasi.poli}
                    </button>

                    <div className="mt-4 pt-3 border-t border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-2">Atau Pilih Poli Lain Secara Manual:</p>
                        <select 
                            onChange={(e) => handleContinue(e.target.value)}
                            className="w-full p-3 border border-blue-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                            defaultValue=""
                        >
                            <option value="" disabled>-- Pilih Poli Lain --</option>
                            {ALL_POLI_OPTIONS.filter(p => p !== rekomendasi.poli).map(poli => (
                                <option key={poli} value={poli}>{poli}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
// --------------------------------------------------------------------------


// --- LANGKAH 2: PILIH JADWAL POLI & DOKTER ---
const ScheduleStep = ({ setStep, reservationData, setReservationData }) => {
    const [selectedDate, setSelectedDate] = useState(MOCK_SCHEDULE[0]?.dateKey || '');
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedPoli, setSelectedPoli] = useState(reservationData.selectedPoli);

    // Filter jadwal berdasarkan poli dan tanggal yang dipilih
    const availableDates = useMemo(() => {
        const dates = new Set();
        MOCK_SCHEDULE
            .filter(s => s.poli === selectedPoli && s.available)
            .forEach(s => dates.add(s.dateKey));
        return Array.from(dates).sort();
    }, [selectedPoli]);

    const filteredSchedules = useMemo(() => {
        return MOCK_SCHEDULE.filter(s => 
            s.poli === selectedPoli && 
            s.dateKey === selectedDate
        ).sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedPoli, selectedDate]);

    // Update selected date jika poli berubah dan tanggal sebelumnya tidak ada
    useEffect(() => {
        if (!availableDates.includes(selectedDate)) {
            setSelectedDate(availableDates[0] || '');
        }
        setSelectedSchedule(null); // Reset jadwal jika poli/tanggal berubah
    }, [selectedPoli, availableDates]);

    const handleNextStep = () => {
        if (!selectedSchedule) {
            alert('Mohon pilih jadwal dokter terlebih dahulu.');
            return;
        }
        setReservationData(prev => ({ 
            ...prev, 
            selectedPoli: selectedPoli,
            selectedSchedule: selectedSchedule
        }));
        setStep('payment');
    };

    const ScheduleItem = ({ schedule }) => {
        const isSelected = selectedSchedule?.id === schedule.id;
        return (
            <div 
                onClick={() => schedule.available && setSelectedSchedule(schedule)}
                className={`p-4 rounded-xl shadow-md border-2 transition duration-200 cursor-pointer
                    ${schedule.available 
                        ? (isSelected ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-200 hover:border-indigo-400')
                        : 'border-red-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    }
                `}
            >
                <div className="flex justify-between items-center">
                    <h3 className={`font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>{schedule.doctor}</h3>
                    <p className={`text-xs font-semibold px-2 py-1 rounded-full ${schedule.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {schedule.available ? `Sisa: ${schedule.quota}` : 'Penuh'}
                    </p>
                </div>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> Jam: {schedule.time}</p>
                    <p className="flex items-center"><CreditCard className="w-4 h-4 mr-2 text-gray-500" /> Biaya (Est.): Rp {schedule.price.toLocaleString('id-ID')}</p>
                </div>
                {isSelected && (
                    <p className="mt-2 text-xs font-semibold text-indigo-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Terpilih</p>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 bg-white rounded-xl shadow-2xl border border-indigo-200">
            <BackButton onClick={() => setStep('diagnosis')} />
            <h1 className="text-2xl font-extrabold text-indigo-700 mb-6 flex items-center"><Calendar className="w-6 h-6 mr-2"/> 2. Pilih Jadwal & Dokter</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* PILIH POLI */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poli yang Dituju:</label>
                    <select 
                        value={selectedPoli}
                        onChange={(e) => setSelectedPoli(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {ALL_POLI_OPTIONS.map(poli => (
                            <option key={poli} value={poli}>{poli}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Poli yang disarankan AI: <span className="font-semibold text-blue-600">{reservationData.selectedPoli}</span></p>
                </div>

                {/* PILIH TANGGAL */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tanggal Kunjungan:</label>
                    <div className="flex flex-wrap gap-2">
                        {availableDates.length > 0 ? (
                            availableDates.map(date => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition duration-150
                                        ${date === selectedDate 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {date}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-red-500 py-2">Tidak ada jadwal tersedia untuk poli ini.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* DAFTAR JADWAL DOKTER */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-t pt-4">Jadwal Dokter ({selectedDate || 'Belum Pilih Tanggal'})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 overflow-y-auto pr-2 scrollbar-hide">
                {filteredSchedules.length > 0 ? (
                    filteredSchedules.map(schedule => (
                        <ScheduleItem key={schedule.id} schedule={schedule} />
                    ))
                ) : (
                    <div className="md:col-span-2 p-6 bg-gray-50 rounded-xl text-center text-gray-500">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                        <p>Tidak ada jadwal dokter tersedia pada tanggal yang dipilih untuk Poli {selectedPoli}.</p>
                    </div>
                )}
            </div>

            {/* Tombol Lanjut */}
            <button 
                onClick={handleNextStep}
                disabled={!selectedSchedule}
                className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-xl font-extrabold hover:bg-indigo-700 transition duration-150 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                <Send className="w-5 h-5" />
                <span>Lanjut ke Konfirmasi Pembayaran</span>
            </button>
        </div>
    );
};
// --------------------------------------------------------------------------


// --- LANGKAH 3: KONFIRMASI & PEMBAYARAN ---
const PaymentStep = ({ setStep, reservationData }) => {
    const [selectedPayment, setSelectedPayment] = useState(PAYMENT_OPTIONS[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Data dummy pasien (biasanya diambil dari data profil yang sudah login)
    const mockPatient = {
        nama: "Syifa Maulida",
        email: "syifamaulida@example.com",
        noKtp: "3507xxxxxxxxxxxx",
    };

    const handleConfirmReservation = async () => {
        setIsProcessing(true);
        // --- SIMULASI LOGIKA UTAMA (KUNCI ANTRIAN) ---
        // 1. Validasi Data Pasien (sudah dilakukan di halaman profil)
        // 2. Kirim Data ke Backend (Firestore/API)
        // 3. Backend mengunci Nomor Antrian Poli (NAP) -> Misal NAP: 5
        // 4. Backend mengalokasikan Kode Booking Pendaftaran (KBP) -> Misal KBP: 2023

        await new Promise(resolve => setTimeout(resolve, 2500)); // Simulasi proses di server

        const finalReservation = {
            ...reservationData,
            patient: mockPatient,
            paymentMethod: selectedPayment,
            kodeBookingPendaftaran: '2023', // Hasil dari Backend
            nomorAntrianPoli: 5,           // Hasil dari Backend (terkunci)
            reservationDate: new Date().toISOString()
        };

        setIsProcessing(false);
        setReservationData(finalReservation); // Simpan hasil akhir
        setStep('complete');
    };

    // Fungsi untuk memformat data tampilan
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="p-6 md:p-8 bg-white rounded-xl shadow-2xl border border-indigo-200">
            <BackButton onClick={() => setStep('schedule')} />
            <h1 className="text-2xl font-extrabold text-indigo-700 mb-6 flex items-center"><CreditCard className="w-6 h-6 mr-2"/> 3. Konfirmasi & Kunci Antrian</h1>
            
            {/* Ringkasan Reservasi */}
            <div className="mb-8 p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-xl shadow-inner">
                <h3 className="font-bold text-lg text-indigo-800 flex items-center mb-3">Ringkasan Kunjungan Anda</h3>
                <div className="space-y-2 text-sm">
                    <p className="flex justify-between font-medium"><span>Poli Tujuan</span><span className="font-bold text-indigo-700 flex items-center"><Heart className="w-4 h-4 mr-1"/> {reservationData.selectedPoli}</span></p>
                    <p className="flex justify-between"><span>Dokter</span><span className="font-semibold text-gray-800">{reservationData.selectedSchedule.doctor}</span></p>
                    <p className="flex justify-between"><span>Tanggal Kunjungan</span><span className="font-semibold text-gray-800 flex items-center"><Calendar className="w-4 h-4 mr-1"/> {formatDate(reservationData.selectedSchedule.dateKey)}</span></p>
                    <p className="flex justify-between"><span>Jam Praktek</span><span className="font-semibold text-gray-800 flex items-center"><Clock className="w-4 h-4 mr-1"/> {reservationData.selectedSchedule.time}</span></p>
                    <p className="flex justify-between"><span>Gejala Utama</span><span className="italic text-gray-600 max-w-[60%] text-right truncate">{reservationData.gejala}</span></p>
                </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Metode Pembayaran / Jaminan</h3>
                <div className="space-y-3">
                    {PAYMENT_OPTIONS.map(option => (
                        <div 
                            key={option}
                            onClick={() => setSelectedPayment(option)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition duration-150 flex items-center justify-between shadow-sm
                                ${selectedPayment === option ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <span className="font-medium text-gray-800">{option}</span>
                            <div className={`w-4 h-4 rounded-full border-2 ${selectedPayment === option ? 'bg-indigo-600 border-white' : 'border-gray-400'}`}></div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-red-500 mt-2 flex items-start"><AlertTriangle className="w-4 h-4 mr-1 mt-0.5" /> Pembayaran 'Cash' dan 'Asuransi' diverifikasi saat Anda melapor di Loket Pendaftaran RS.</p>
            </div>

            {/* Tombol Konfirmasi */}
            <button 
                onClick={handleConfirmReservation}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-extrabold hover:bg-green-700 transition duration-150 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                {isProcessing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <CheckCircle className="w-5 h-5" />
                )}
                {isProcessing ? 'Memproses & Mengunci Antrian...' : 'Konfirmasi Reservasi & Kunci Antrian'}
            </button>
        </div>
    );
};
// --------------------------------------------------------------------------


// --- LANGKAH 4: RESERVASI SELESAI ---
const CompletionStep = ({ reservationData }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="p-6 md:p-10 bg-white rounded-xl shadow-2xl border border-green-300 max-w-xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-extrabold text-green-700 mb-4">RESERVASI BERHASIL!</h1>
            <p className="text-lg text-gray-700 mb-6">Nomor Antrian Poli Anda Telah **Terkunci**.</p>

            <div className="bg-green-50 p-6 rounded-xl border border-green-200 space-y-4 text-left">
                <div className="border-b pb-2">
                    <p className="text-sm font-medium text-gray-500">Kode Booking Pendaftaran (KBP)</p>
                    <p className="text-3xl font-black text-indigo-700">{reservationData.kodeBookingPendaftaran}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Nomor Antrian Poli (NAP) Terkunci</p>
                    <p className="text-5xl font-black text-green-700">{reservationData.nomorAntrianPoli}</p>
                    <p className="text-xs mt-1 text-red-500 font-semibold">Nomor ini telah dikunci untuk Anda di Poli {reservationData.selectedPoli} dan tidak dapat diambil pasien lain.</p>
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-600 space-y-2 text-left p-4 border border-gray-200 rounded-xl">
                <p className="font-semibold">Detail Kunjungan:</p>
                <p>Tanggal: <span className="font-medium">{formatDate(reservationData.selectedSchedule.dateKey)}</span></p>
                <p>Dokter: <span className="font-medium">{reservationData.selectedSchedule.doctor}</span></p>
                <p>Jaminan: <span className="font-medium">{reservationData.paymentMethod}</span></p>
            </div>
            
            <p className="mt-8 text-gray-600">Mohon tunjukkan **Kode Booking Pendaftaran (KBP)** di loket pendaftaran saat tiba di RS untuk proses verifikasi dan penentuan eselon. Anda akan otomatis mendapatkan Nomor Antrian Poli yang sudah terkunci.</p>

            <button 
                onClick={() => window.location.href = '/dashboard/history'} // Simulasi navigasi ke riwayat
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-150"
            >
                Lihat Riwayat Reservasi
            </button>
        </div>
    );
};
// --------------------------------------------------------------------------


export default function ReservationPage() {
    // State untuk mengontrol langkah-langkah formulir
    const [step, setStep] = useState('diagnosis'); // diagnosis, schedule, payment, complete
    // State untuk menyimpan data reservasi sepanjang alur
    const [reservationData, setReservationData] = useState({
        selectedPoli: ALL_POLI_OPTIONS[0],
        gejala: '',
        selectedSchedule: null,
    });
    
    // Tentukan komponen yang akan dirender berdasarkan langkah saat ini
    const renderStep = () => {
        switch (step) {
            case 'diagnosis':
                return <DiagnosisStep setStep={setStep} setReservationData={setReservationData} />;
            case 'schedule':
                return <ScheduleStep setStep={setStep} reservationData={reservationData} setReservationData={setReservationData} />;
            case 'payment':
                if (!reservationData.selectedSchedule) {
                    setStep('schedule'); // Kembali jika tidak ada jadwal terpilih
                    return null;
                }
                return <PaymentStep setStep={setStep} reservationData={reservationData} setReservationData={setReservationData} />;
            case 'complete':
                return <CompletionStep reservationData={reservationData} />;
            default:
                return <DiagnosisStep setStep={setStep} setReservationData={setReservationData} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <style jsx>{scrollbarHideStyle}</style>
            
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center">
                        <Calendar className="w-7 h-7 mr-2 text-indigo-600" /> Reservasi Online 24/7
                    </h1>
                </header>

                {/* Progress Bar hanya tampil di langkah 1-3 */}
                {step !== 'complete' && <ProgressBar step={step} />}
                
                <main className="transition-all duration-500 ease-in-out">
                    {renderStep()}
                </main>
            </div>
        </div>
    );
}
