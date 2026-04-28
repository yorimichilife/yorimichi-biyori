import { Button, Card, Container, SectionTitle } from "@/components/ui";

export default function HowItWorksPage() {
  return (
    <Container className="space-y-10 py-12">
      <SectionTitle title="使い方" subtitle="よりみち日和は、旅先で出会ったよりみちを日記のように思い出へ残していくための場所です。" />
      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["1. よりみち日記を書く", "写真、日程、メモ、訪れた場所をまとめて残せます。"],
          ["2. しおりを整える", "旅前に日程や行きたい場所を整理して、これから始まるよりみちをやさしく準備できます。"],
          ["3. みんなのよりみちに公開する", "家族や友人との共有から公開ページまで、思い出のひらき方を自由に選べます。"]
        ].map(([title, body]) => (
          <Card key={title} className="p-7">
            <h2 className="mb-3 text-2xl font-bold text-brand-text">{title}</h2>
            <p className="text-sm leading-7 text-brand-sub">{body}</p>
          </Card>
        ))}
      </div>
      <Card className="flex flex-col items-start justify-between gap-5 p-7 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">現在使える機能をまとめて確認する</h2>
          <p className="mt-2 text-sm leading-7 text-brand-sub">
            サイトマップと実装済み機能の一覧ページから、デモでどこまで使えるかを確認できます。
          </p>
        </div>
        <Button href="/site-map" variant="secondary">
          サイトマップを見る
        </Button>
      </Card>
    </Container>
  );
}
