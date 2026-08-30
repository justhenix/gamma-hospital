"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { maskName } from "@/lib/utils";
import {
  getDisplayPresentation,
  type DisplayPayload,
} from "./display-model";

export default function DisplayPage() {
  const [data, setData] = useState<DisplayPayload | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDisplay = async () => {
      try {
        const res = await fetch("/api/display");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Display poll error:", err);
      }
    };

    fetchDisplay();
    const interval = setInterval(fetchDisplay, 3000);
    return () => clearInterval(interval);
  }, []);

  const { heroReady, otherReady, preparing } = getDisplayPresentation(data);

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col overflow-hidden bg-[#F4F6F1] text-[#1F261B] [--hospital-brand:#7DBA00]">
      <header className="flex h-28 shrink-0 items-center justify-between border-b border-[#DDE4D6] bg-white px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <Image
            src="/rs-indriati-logo.png"
            alt="Rumah Sakit Indriati"
            width={245}
            height={68}
            priority
            className="h-auto w-[210px] object-contain lg:w-[245px]"
          />
          <div className="hidden h-12 w-px bg-[#DDE4D6] md:block" />
          <div className="hidden md:block">
            <h1 className="font-heading text-xl font-bold tracking-tight lg:text-2xl">
              Pelayanan Farmasi
            </h1>
            <p className="mt-1 text-sm font-medium text-[#66705F] lg:text-base">
              Rumah Sakit Indriati Boyolali
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-sans text-4xl font-bold tabular-nums tracking-tight text-[#1F261B] lg:text-5xl">
            {currentTime || "--:--:--"}
          </div>
          <div className="mt-1 text-sm font-medium capitalize text-[#66705F] lg:text-base">
            {currentDate || "Memuat tanggal..."}
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
        <section className="flex min-h-0 flex-col border-b border-[#DDE4D6] bg-[#F8FAF5] lg:border-b-0 lg:border-r">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 py-8 text-center lg:px-14">
            <h2 className="font-heading text-2xl font-bold text-[#1F261B] lg:text-3xl">
              Siap Diambil
            </h2>

            {heroReady ? (
              <>
                <div className="mt-6 flex min-h-[14rem] w-full max-w-3xl items-center justify-center rounded-md bg-[var(--hospital-brand)] px-8 py-8 shadow-sm lg:min-h-[17rem]">
                  <div className="font-heading text-[clamp(6rem,12vw,11rem)] font-extrabold leading-none tabular-nums tracking-[-0.04em] text-white">
                    {heroReady.queueCode}
                  </div>
                </div>
                <div className="mt-6 text-2xl font-semibold text-[#1F261B] lg:text-3xl">
                  {maskName(heroReady.patientName)}
                </div>
                <div className="mt-3 text-lg font-semibold text-[#587E00] lg:text-2xl">
                  Silakan menuju loket farmasi
                </div>
              </>
            ) : (
              <div className="mt-8 max-w-xl text-2xl font-semibold text-[#66705F] lg:text-3xl">
                Belum ada obat yang siap diambil.
              </div>
            )}
          </div>

          <div className="shrink-0 border-t-4 border-t-[var(--hospital-brand)] bg-white text-[#1F261B]">
            <div className="flex min-h-28 items-stretch">
              <div className="flex w-44 shrink-0 items-center border-r border-[#DDE4D6] px-6 font-heading text-lg font-bold lg:w-52 lg:px-8 lg:text-xl">
                Siap Lainnya
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-2 divide-x divide-[#DDE4D6] md:grid-cols-4">
                {otherReady.length > 0 ? (
                  otherReady.map((item) => (
                    <div
                      key={item.queueCode}
                      className="flex min-w-0 flex-col items-center justify-center px-4 py-4 text-center"
                    >
                      <div className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-[#587E00] lg:text-4xl">
                        {item.queueCode}
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold text-[#66705F] lg:text-base">
                        {maskName(item.patientName)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex items-center px-6 text-base font-medium text-[#66705F]">
                    Tidak ada antrean siap lainnya.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="min-h-0 bg-white px-6 py-6 lg:px-8 lg:py-8">
          <div className="flex items-end justify-between border-b-4 border-b-[var(--hospital-brand)] pb-4">
            <h2 className="font-heading text-xl font-bold lg:text-2xl">
              Sedang Disiapkan
            </h2>
            <div className="font-sans text-base font-semibold tabular-nums text-[#66705F]">
              {data?.preparing.length || 0} antrean
            </div>
          </div>

          <div className="divide-y divide-[#DDE4D6]">
            {preparing.length > 0 ? (
              preparing.map((item) => (
                <div
                  key={item.queueCode}
                  className="grid grid-cols-[7rem_minmax(0,1fr)_auto] items-center gap-4 py-5"
                >
                  <div className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-[#587E00] lg:text-4xl">
                    {item.queueCode}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold lg:text-lg">
                      {maskName(item.patientName)}
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-[#66705F]">
                      {item.department || "Farmasi"}
                    </div>
                  </div>
                  {item.hasCompounded ? (
                    <div className="text-sm font-bold text-[#66705F]">
                      Racikan
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="py-10 text-base font-medium text-[#66705F]">
                Tidak ada resep dalam proses penyiapan.
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
