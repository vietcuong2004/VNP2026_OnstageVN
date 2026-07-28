import LandingPage from "../LandingPage";

export default function LandingRoutePage() {
  return (
    <LandingPage
      showLandingHeader={true}
      showHeroCta={true}
      compactHeroTitle={false}
      showPortals={true}
      redirectAuthenticatedUsers={true}
      showFeaturesExplanation={false}
    />
  );
}
