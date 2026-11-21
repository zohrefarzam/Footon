import { FavouriteClubs } from "@/components/footon/favourite-clubs";
import { ProfileLive } from "@/components/footon/profile-live";
import { ProfileView } from "@/components/footon/profile-view";
import { clubDirectory, division, profile, recentForm } from "@/lib/mock-data";

export default function MePage() {
  if (process.env.NEXT_PUBLIC_GAMIFICATION_API) return <ProfileLive />;
  const wins = recentForm.filter((r) => r === "W").length;
  const losses = recentForm.filter((r) => r === "L").length;
  return (
    <ProfileView
      card={{
        name: division.name,
        points: profile.points,
        pointsLabel: "کل امتیاز",
        rank: division.rows.find((r) => r.you)?.rank ?? division.size,
        size: division.size,
        week: division.week,
        promote: division.promote,
        relegate: division.relegate,
      }}
      form={{ results: recentForm, wins, losses, voids: recentForm.length - wins - losses }}
      clubs={<FavouriteClubs clubs={clubDirectory} initial={profile.favoriteTeams} />}
    />
  );
}
