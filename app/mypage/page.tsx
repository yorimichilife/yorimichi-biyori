import { Container } from "@/components/ui";
import { LoginRequiredCard } from "@/components/auth/login-required-card";
import { MyPageDashboard } from "@/components/mypage/my-page-dashboard";
import { getSessionUser } from "@/lib/session";
import { getExpenseOverview, getMyPageSnapshot } from "@/lib/mypage-store";
import { getPublicNotes } from "@/lib/notes-store";
import { unstable_noStore as noStore } from "next/cache";

export default async function MyPage() {
  noStore();
  const user = await getSessionUser();

  if (!user) {
    return (
      <Container className="py-8 md:py-12">
        <LoginRequiredCard
          title="マイページは会員専用です"
          body="自分の日記、いいねした記事、家計簿、アカウント設定は、ログイン後にまとめて使えるようになります。"
        />
      </Container>
    );
  }

  const month = new Date().toISOString().slice(0, 7);
  const [snapshot, recentNotes, expenseOverview] = await Promise.all([
    getMyPageSnapshot(user.id),
    getPublicNotes().then((notes) => notes.slice(0, 3)),
    getExpenseOverview(user.id, month)
  ]);

  const profile = snapshot.profile ?? {
    ...user,
    handle: `@yorimichi_${user.id.slice(0, 5)}`,
    bio: "ふらっと出会った景色や気持ちを、よりみち日記に残しています。"
  };

  return (
    <Container className="py-6 md:py-10">
      <MyPageDashboard
        profile={profile}
        ownNotes={snapshot.ownNotes}
        likedNotes={snapshot.likedNotes}
        recentNotes={recentNotes}
        visitedSpotCount={snapshot.visitedSpotCount}
        allTimeExpenseTotal={snapshot.totalExpense}
        expenseOverview={{ month, ...expenseOverview }}
      />
    </Container>
  );
}
