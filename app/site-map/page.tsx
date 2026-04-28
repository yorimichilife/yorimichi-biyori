import Link from "next/link";
import { Badge, Card, Container, SectionTitle } from "@/components/ui";
import { featureInventory, siteMapSections } from "@/lib/site-map-data";
import { ArrowRight, CircleCheckBig, CircleDashed, CircleOff } from "lucide-react";

const statusMap = {
  available: {
    label: "現在使えます",
    tone: "green" as const,
    icon: CircleCheckBig
  },
  partial: {
    label: "一部使えます",
    tone: "yellow" as const,
    icon: CircleDashed
  },
  not_available: {
    label: "未対応",
    tone: "gray" as const,
    icon: CircleOff
  }
};

export default function SiteMapPage() {
  return (
    <Container className="space-y-12 py-12">
      <SectionTitle
        title="サイトマップと機能一覧"
        subtitle="よりみち日和で移動できるページと、現在実際に使える機能の状況をまとめています。"
      />

      <Card className="grid gap-4 p-6 md:grid-cols-3">
        {Object.values(statusMap).map((status) => (
          <div key={status.label} className="rounded-[24px] bg-brand-bg p-5">
            <Badge tone={status.tone}>{status.label}</Badge>
            <p className="mt-3 text-sm leading-7 text-brand-sub">
              {status.label === "現在使えます" && "保存や表示まで実際に動作します。"}
              {status.label === "一部使えます" && "UI はありますが、未接続の部分が含まれます。"}
              {status.label === "未対応" && "今後の実装対象です。"}
            </p>
          </div>
        ))}
      </Card>

      <section className="space-y-6">
        <SectionTitle title="サイトマップ" />
        <div className="grid gap-6 xl:grid-cols-3">
          {siteMapSections.map((section) => (
            <Card key={section.title} className="space-y-5 p-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-text">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-brand-sub">{section.description}</p>
              </div>
              <div className="space-y-3">
                {section.links.map((link) => {
                  const status = statusMap[link.status as keyof typeof statusMap];
                  const Icon = status.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-2xl border border-brand-border bg-white px-4 py-4 transition-colors hover:bg-brand-bg"
                    >
                      <div className="space-y-2">
                        <div className="font-bold text-brand-text">{link.label}</div>
                        <div className="flex items-center gap-2 text-sm text-brand-sub">
                          <Icon className="h-4 w-4" />
                          {status.label}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-brand-sub" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="機能一覧" subtitle="ページごとの見た目だけでなく、裏側の保存や判定まで含めた現在の対応状況です。" />
        <div className="space-y-6">
          {featureInventory.map((group) => (
            <Card key={group.category} className="overflow-hidden">
              <div className="border-b border-brand-border bg-white px-6 py-5">
                <h2 className="text-2xl font-bold text-brand-text">{group.category}</h2>
              </div>
              <div className="divide-y divide-brand-border">
                {group.items.map(([title, statusKey, description]) => {
                  const status = statusMap[statusKey as keyof typeof statusMap];
                  return (
                    <div key={title} className="grid gap-4 px-6 py-5 md:grid-cols-[220px_160px_minmax(0,1fr)] md:items-start">
                      <div className="font-bold text-brand-text">{title}</div>
                      <div>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <div className="text-sm leading-7 text-brand-sub">{description}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
}
