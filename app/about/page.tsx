import LandingPage from "../LandingPage";

export default function AboutPage() {
  return (
    <LandingPage
      showLandingHeader={false}
      showHeroCta={false}
      compactHeroTitle
      showPortals={false}
      redirectAuthenticatedUsers={false}
    />
  );
}
