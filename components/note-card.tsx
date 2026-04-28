import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Bookmark, MessageCircle, UserRound, Lock, Globe, Link2 } from "lucide-react";
import { Note, Privacy } from "@/lib/types";
import { Badge, Card } from "@/components/ui";

const statusMap: Record<Privacy, { label: string; icon: ReactNode; tone: "yellow" | "green" | "gray" | "blue" }> = {
  public: { label: "公開中", icon: <Globe className="h-3 w-3" />, tone: "green" },
  unlisted: { label: "URL限定公開", icon: <Link2 className="h-3 w-3" />, tone: "yellow" },
  private: { label: "非公開", icon: <Lock className="h-3 w-3" />, tone: "gray" },
  draft: { label: "下書き", icon: <Bookmark className="h-3 w-3" />, tone: "blue" }
};

export function NoteCard({ note, href = `/notes/${note.id}` }: { note: Note; href?: string }) {
  const status = statusMap[note.status];

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={note.coverImage} alt={note.title} fill className="object-cover" />
        <div className="absolute left-4 top-4">
          <Badge tone={status.tone}>
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </Badge>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <Link href={href} className="block">
          <h3 className="line-clamp-1 text-[28px] font-bold tracking-[-0.02em] text-brand-text md:text-2xl">
            {note.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-sub">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {note.dateRange}
          </span>
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-4 w-4" />
            {note.companions}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-7 text-brand-sub">{note.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image src={note.author.avatar} alt={note.author.name} fill className="object-cover" />
            </div>
            <span className="text-sm text-brand-sub">{note.author.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-brand-sub">
            <span className="inline-flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              {note.saves}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {note.comments}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
