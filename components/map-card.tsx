"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import type { Note } from "@/lib/types";
import { Crosshair, MapPinned, MessageCircleMore, Navigation } from "lucide-react";

type MapCardProps = {
  spots: string[];
  areaLabel: string;
  publicNotes: Note[];
  memoryPhotos: Array<{ id: string; title: string; image: string }>;
};

type MarkerPoint = {
  id: string;
  label: string;
  image?: string;
  top: number;
  left: number;
};

export function MapCard({ spots, areaLabel, publicNotes, memoryPhotos }: MapCardProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [loading, setLoading] = useState(false);

  async function detectCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("このブラウザでは位置情報が使えません。");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
          const data = (await response.json()) as { display_name?: string };
          if (data.display_name) {
            label = data.display_name;
          }
        } catch {}
        setLocation({ lat, lon, label });
        setGeoError("");
        setLoading(false);
      },
      () => {
        setGeoError("位置情報の取得が許可されていません。");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    void detectCurrentLocation();
  }, []);

  const mapUrl = useMemo(() => {
    const lat = location?.lat ?? 35.6812;
    const lon = location?.lon ?? 139.7671;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.06}%2C${lat - 0.04}%2C${lon + 0.06}%2C${lat + 0.04}&layer=mapnik&marker=${lat}%2C${lon}`;
  }, [location]);

  const memoryMarkers = useMemo<MarkerPoint[]>(() => {
    const source = (spots.length ? spots : memoryPhotos.map((photo) => photo.title)).slice(0, 6);
    return source.map((label, index) => ({
      id: `${label}-${index}`,
      label,
      image: memoryPhotos[index]?.image,
      top: 20 + ((index * 14) % 54),
      left: 12 + ((index * 13) % 70)
    }));
  }, [memoryPhotos, spots]);

  const nearbyVoices = useMemo(() => {
    const currentLabel = location?.label ?? areaLabel;
    const matched = publicNotes.filter((note) => {
      const keyword = note.prefecture.split("・")[0];
      return currentLabel.includes(keyword) || keyword.includes(areaLabel) || note.area.includes(areaLabel);
    });
    return (matched.length ? matched : publicNotes).slice(0, 3);
  }, [areaLabel, location?.label, publicNotes]);

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[28px] font-bold text-brand-text md:text-2xl">思い出マップ</h3>
        <button onClick={() => void detectCurrentLocation()} className="inline-flex items-center gap-2 text-sm font-medium text-brand-sky">
          <Crosshair className="h-4 w-4" />
          {loading ? "取得中..." : "現在地を更新"}
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-brand-border">
        <div className="relative h-56">
          <iframe title="current-location-map" src={mapUrl} className="h-full w-full" loading="lazy" />
          <div className="pointer-events-none absolute inset-0">
            {memoryMarkers.map((marker, index) => (
              <div key={marker.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: `${marker.top}%`, left: `${marker.left}%` }}>
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-brand-yellow shadow-soft">
                  {marker.image ? (
                    <Image src={marker.image} alt={marker.label} fill className="object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-brand-text">{index + 1}</span>
                  )}
                </div>
              </div>
            ))}
            <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-2 text-xs font-bold text-brand-text shadow-soft">
              <Navigation className="mr-1 inline h-3 w-3 text-brand-sky" />
              現在地
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-brand-bg p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-text">
          <MapPinned className="h-4 w-4" />
          現在地
        </div>
        <p className="text-sm leading-7 text-brand-sub">{location?.label ?? "位置情報を取得すると現在地がここに表示されます。"}</p>
        {geoError ? <p className="mt-2 text-xs text-red-600">{geoError}</p> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-brand-text">
          <MessageCircleMore className="h-4 w-4" />
          近くのみんなのよりみち
        </div>
        <div className="space-y-3">
          {nearbyVoices.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} className="block rounded-3xl border border-brand-border p-4 transition hover:border-brand-yellow hover:bg-[#FFFDF4]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-brand-text">{note.title}</div>
                  <p className="mt-1 text-sm leading-7 text-brand-sub">{note.prefecture}</p>
                </div>
                <Badge tone="gray">{note.comments}件</Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-base font-bold text-brand-text">思い出フォトピン</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {memoryMarkers.map((marker) => (
            <div key={`${marker.id}-list`} className="flex items-center gap-3 rounded-2xl bg-brand-bg px-3 py-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white">
                {marker.image ? <Image src={marker.image} alt={marker.label} fill className="object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-brand-text">{marker.label}</div>
                <div className="text-xs text-brand-sub">日記の写真と連動</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
