import { Card } from "@/components/ui";
import { sideMenu } from "@/lib/data";
import { Bookmark, CircleHelp, House, MessageCircleMore, Settings, Share2, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = [House, Bookmark, Bookmark, Share2, MessageCircleMore, UserCog, Settings];

export function MyPageSidebar() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-5 text-sm font-medium text-brand-sub">マイページメニュー</div>
        <div className="space-y-1">
          {sideMenu.map((item, index) => {
            const Icon = icons[index];
            const active = item === "よりみち日記";
            return (
              <button
                key={item}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-base text-brand-text transition-colors",
                  active ? "bg-[#FFF6D6] font-bold" : "hover:bg-brand-bg"
                )}
              >
                <Icon className="h-5 w-5" />
                {item}
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="space-y-5 p-6">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-text">
          保存容量
          <CircleHelp className="h-4 w-4 text-brand-sub" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-brand-sub">
            <span className="font-bold text-[#BB8C00]">3.2GB</span> / 10GB 使用中
          </p>
          <div className="h-3 rounded-full bg-[#F0F0EC]">
            <div className="h-3 w-[30%] rounded-full bg-brand-yellow" />
          </div>
        </div>
        <button className="h-12 w-full rounded-full border border-brand-border text-sm font-bold text-brand-text">
          プランをアップグレード
        </button>
      </Card>
      <Card className="overflow-hidden bg-gradient-to-br from-[#FFF8DF] to-[#FFF2C0] p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-brand-text">旅をもっと素敵に残そう</h3>
          <p className="text-sm leading-7 text-brand-sub">
            プレミアムプランにアップグレードすると、写真の容量無制限・PDF書き出しなどの特典が使えます。
          </p>
          <button className="h-12 rounded-full bg-brand-yellow px-6 text-sm font-bold text-brand-text">
            詳しく見る
          </button>
        </div>
      </Card>
    </div>
  );
}
